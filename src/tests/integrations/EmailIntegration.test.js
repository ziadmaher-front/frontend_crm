import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmailIntegration } from '../../hooks/integrations/useEmailIntegration';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';

// Mock dependencies
jest.mock('../../hooks/useNotifications');
jest.mock('../../hooks/useAuth');

// Mock fetch
global.fetch = jest.fn();

describe('useEmailIntegration', () => {
  let queryClient;
  let wrapper;

  const mockNotifications = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  };

  const mockAuth = {
    user: { id: 'user123', email: 'test@example.com' }
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    useNotifications.mockReturnValue(mockNotifications);
    useAuth.mockReturnValue(mockAuth);
    
    fetch.mockClear();
    mockNotifications.success.mockClear();
    mockNotifications.error.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Provider Connection', () => {
    test('should connect to Gmail successfully', async () => {
      const mockAuthResult = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        email: 'test@gmail.com'
      };

      const mockSavedProvider = {
        id: 'provider123',
        type: 'GMAIL',
        email: 'test@gmail.com',
        ...mockAuthResult
      };

      // Mock successful authentication
      const mockPopup = {
        close: jest.fn(),
        closed: false
      };
      
      window.open = jest.fn().mockReturnValue(mockPopup);
      
      // Mock API response for saving provider
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSavedProvider)
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Simulate authentication success message
      act(() => {
        window.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'GMAIL_AUTH_SUCCESS',
            ...mockAuthResult
          },
          origin: window.location.origin
        }));
      });

      await act(async () => {
        await result.current.connectProvider('GMAIL');
      });

      expect(mockNotifications.success).toHaveBeenCalledWith('Successfully connected to Gmail');
      expect(result.current.connectedProviders).toContain(mockSavedProvider);
    });

    test('should handle authentication failure', async () => {
      const mockPopup = {
        close: jest.fn(),
        closed: false
      };
      
      window.open = jest.fn().mockReturnValue(mockPopup);

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Simulate authentication error message
      act(() => {
        window.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'GMAIL_AUTH_ERROR',
            error: 'Authentication failed'
          },
          origin: window.location.origin
        }));
      });

      await act(async () => {
        try {
          await result.current.connectProvider('GMAIL');
        } catch (error) {
          expect(error.message).toBe('Authentication failed');
        }
      });

      expect(mockNotifications.error).toHaveBeenCalledWith('Failed to connect to Gmail');
    });

    test('should handle popup cancellation', async () => {
      const mockPopup = {
        close: jest.fn(),
        closed: true
      };
      
      window.open = jest.fn().mockReturnValue(mockPopup);

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectProvider('GMAIL');
        } catch (error) {
          expect(error.message).toBe('Authentication cancelled');
        }
      });
    });
  });

  describe('Email Sending', () => {
    test('should send email successfully', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      const mockEmailData = {
        to: ['recipient@example.com'],
        subject: 'Test Email',
        body: 'This is a test email',
        type: 'text'
      };

      const mockSentEmail = {
        id: 'email123',
        messageId: '<message123@gmail.com>',
        status: 'sent'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock send email API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSentEmail)
      });

      await act(async () => {
        result.current.sendEmail(mockEmailData);
      });

      expect(mockNotifications.success).toHaveBeenCalledWith('Email sent successfully');
    });

    test('should handle email sending failure', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      const mockEmailData = {
        to: ['recipient@example.com'],
        subject: 'Test Email',
        body: 'This is a test email'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock failed send email API call
      fetch.mockRejectedValueOnce(new Error('Send failed'));

      await act(async () => {
        result.current.sendEmail(mockEmailData);
      });

      expect(mockNotifications.error).toHaveBeenCalledWith('Failed to send email');
    });

    test('should validate email data before sending', async () => {
      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      const invalidEmailData = {
        subject: 'Test Email',
        body: 'This is a test email'
        // Missing 'to' field
      };

      await act(async () => {
        try {
          result.current.sendEmail(invalidEmailData);
        } catch (error) {
          expect(error.message).toContain('Missing required fields');
        }
      });
    });
  });

  describe('Email Templates', () => {
    test('should fetch email templates', async () => {
      const mockTemplates = [
        {
          id: 'template1',
          name: 'Welcome Email',
          subject: 'Welcome to our service',
          body: 'Welcome {{name}}!'
        },
        {
          id: 'template2',
          name: 'Follow Up',
          subject: 'Following up on our conversation',
          body: 'Hi {{name}}, following up...'
        }
      ];

      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      // Mock templates query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTemplates)
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for data to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.templates).toEqual(mockTemplates);
    });

    test('should render template with variables', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const template = {
        subject: 'Hello {{name}}',
        body: 'Welcome {{name}}, your email is {{email}}'
      };

      const variables = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const rendered = await act(async () => {
        return result.current.renderTemplate(template, variables);
      });

      expect(rendered.subject).toBe('Hello John Doe');
      expect(rendered.body).toBe('Welcome John Doe, your email is john@example.com');
    });
  });

  describe('Email Tracking', () => {
    test('should fetch email analytics', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      const mockAnalytics = {
        totalSent: 150,
        totalOpened: 120,
        totalClicked: 45,
        openRate: 0.8,
        clickRate: 0.3,
        bounceRate: 0.02
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock analytics API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalytics)
      });

      const analytics = await act(async () => {
        return result.current.getAnalytics({
          startDate: '2023-01-01',
          endDate: '2023-12-31'
        });
      });

      expect(analytics).toEqual(mockAnalytics);
    });

    test('should track email events', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const trackingData = {
        emailId: 'email123',
        event: 'opened',
        timestamp: new Date().toISOString(),
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1'
      };

      // Mock tracking API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await act(async () => {
        await result.current.trackEvent(trackingData);
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/email/tracking',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(trackingData)
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectProvider('GMAIL');
        } catch (error) {
          expect(error.message).toBe('Network error');
        }
      });

      expect(mockNotifications.error).toHaveBeenCalled();
    });

    test('should handle API errors with proper error messages', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: { message: 'Unauthorized access' }
        })
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      await act(async () => {
        try {
          await result.current.connectProvider('GMAIL');
        } catch (error) {
          expect(error.message).toContain('Unauthorized access');
        }
      });
    });

    test('should handle token refresh failures', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'expired-token',
        refreshToken: 'refresh-token'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock failed token refresh
      fetch.mockRejectedValueOnce(new Error('Token refresh failed'));

      await act(async () => {
        try {
          await result.current.emailEngine.refreshAccessToken();
        } catch (error) {
          expect(error.message).toBe('Token refresh failed');
        }
      });
    });
  });

  describe('Provider Management', () => {
    test('should switch between providers', async () => {
      const mockProviders = [
        { id: 'provider1', type: 'GMAIL', email: 'test@gmail.com' },
        { id: 'provider2', type: 'OUTLOOK', email: 'test@outlook.com' }
      ];

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProviders)
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.activeProvider).toEqual(mockProviders[0]);

      act(() => {
        result.current.setActiveProvider(mockProviders[1]);
      });

      expect(result.current.activeProvider).toEqual(mockProviders[1]);
    });

    test('should disconnect provider', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        email: 'test@gmail.com'
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock disconnect API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await act(async () => {
        await result.current.disconnectProvider('provider123');
      });

      expect(mockNotifications.success).toHaveBeenCalledWith('Provider disconnected successfully');
    });
  });

  describe('Bulk Operations', () => {
    test('should send bulk emails', async () => {
      const mockProvider = {
        id: 'provider123',
        type: 'GMAIL',
        accessToken: 'mock-token'
      };

      const bulkEmailData = {
        template: {
          subject: 'Hello {{name}}',
          body: 'Welcome {{name}}!'
        },
        recipients: [
          { email: 'user1@example.com', name: 'User 1' },
          { email: 'user2@example.com', name: 'User 2' }
        ]
      };

      // Mock providers query
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider])
      });

      const { result } = renderHook(() => useEmailIntegration(), { wrapper });

      // Wait for providers to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Mock bulk send API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sent: 2,
          failed: 0,
          results: [
            { email: 'user1@example.com', status: 'sent' },
            { email: 'user2@example.com', status: 'sent' }
          ]
        })
      });

      await act(async () => {
        result.current.sendBulkEmail(bulkEmailData);
      });

      expect(mockNotifications.success).toHaveBeenCalledWith('Bulk email sent successfully');
    });
  });
});