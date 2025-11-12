import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../useAuth';

// Email providers configuration
const EMAIL_PROVIDERS = {
  GMAIL: {
    name: 'Gmail',
    icon: '📧',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
  },
  OUTLOOK: {
    name: 'Outlook',
    icon: '📮',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: ['https://graph.microsoft.com/mail.read', 'https://graph.microsoft.com/mail.send'],
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID
  },
  SMTP: {
    name: 'SMTP',
    icon: '✉️',
    requiresConfig: true
  }
};

// Email template types
const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  FOLLOW_UP: 'follow_up',
  PROPOSAL: 'proposal',
  MEETING_REQUEST: 'meeting_request',
  THANK_YOU: 'thank_you',
  REMINDER: 'reminder',
  NEWSLETTER: 'newsletter'
};

// Email tracking events
const EMAIL_EVENTS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  REPLIED: 'replied',
  BOUNCED: 'bounced',
  UNSUBSCRIBED: 'unsubscribed'
};

class EmailIntegrationEngine {
  constructor(provider, config, notifications) {
    this.provider = provider;
    this.config = config;
    this.notifications = notifications;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Authentication methods
  async authenticate() {
    try {
      switch (this.provider) {
        case 'GMAIL':
          return await this.authenticateGmail();
        case 'OUTLOOK':
          return await this.authenticateOutlook();
        case 'SMTP':
          return await this.authenticateSMTP();
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Email authentication failed:', error);
      this.notifications.error(`Failed to authenticate with ${this.provider}`);
      throw error;
    }
  }

  async authenticateGmail() {
    const params = new URLSearchParams({
      client_id: EMAIL_PROVIDERS.GMAIL.clientId,
      redirect_uri: `${window.location.origin}/auth/gmail/callback`,
      scope: EMAIL_PROVIDERS.GMAIL.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `${EMAIL_PROVIDERS.GMAIL.authUrl}?${params}`;
    
    // Open popup for OAuth
    const popup = window.open(authUrl, 'gmail-auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          this.accessToken = event.data.accessToken;
          this.refreshToken = event.data.refreshToken;
          resolve(event.data);
        } else if (event.data.type === 'GMAIL_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  async authenticateOutlook() {
    const params = new URLSearchParams({
      client_id: EMAIL_PROVIDERS.OUTLOOK.clientId,
      redirect_uri: `${window.location.origin}/auth/outlook/callback`,
      scope: EMAIL_PROVIDERS.OUTLOOK.scopes.join(' '),
      response_type: 'code',
      response_mode: 'query'
    });

    const authUrl = `${EMAIL_PROVIDERS.OUTLOOK.authUrl}?${params}`;
    
    const popup = window.open(authUrl, 'outlook-auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OUTLOOK_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          this.accessToken = event.data.accessToken;
          this.refreshToken = event.data.refreshToken;
          resolve(event.data);
        } else if (event.data.type === 'OUTLOOK_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  async authenticateSMTP() {
    // SMTP doesn't require OAuth, just validate configuration
    const requiredFields = ['host', 'port', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing SMTP configuration: ${missingFields.join(', ')}`);
    }

    // Test SMTP connection
    try {
      const response = await fetch('/api/email/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.config)
      });

      if (!response.ok) {
        throw new Error('SMTP connection test failed');
      }

      return { success: true, provider: 'SMTP' };
    } catch (error) {
      throw new Error(`SMTP authentication failed: ${error.message}`);
    }
  }

  // Email operations
  async sendEmail(emailData) {
    try {
      const email = {
        ...emailData,
        timestamp: new Date().toISOString(),
        trackingId: this.generateTrackingId()
      };

      switch (this.provider) {
        case 'GMAIL':
          return await this.sendGmailEmail(email);
        case 'OUTLOOK':
          return await this.sendOutlookEmail(email);
        case 'SMTP':
          return await this.sendSMTPEmail(email);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      this.notifications.error('Failed to send email');
      throw error;
    }
  }

  async sendGmailEmail(email) {
    const message = this.createGmailMessage(email);
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: message })
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { ...result, provider: 'GMAIL', trackingId: email.trackingId };
  }

  async sendOutlookEmail(email) {
    const message = this.createOutlookMessage(email);
    
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Outlook API error: ${response.status} ${response.statusText}`);
    }

    return { success: true, provider: 'OUTLOOK', trackingId: email.trackingId };
  }

  async sendSMTPEmail(email) {
    const response = await fetch('/api/email/smtp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: this.config,
        email: email
      })
    });

    if (!response.ok) {
      throw new Error(`SMTP error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return { ...result, provider: 'SMTP', trackingId: email.trackingId };
  }

  // Message formatting
  createGmailMessage(email) {
    const headers = [
      `To: ${email.to.join(', ')}`,
      `Subject: ${email.subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0'
    ];

    if (email.cc && email.cc.length > 0) {
      headers.push(`Cc: ${email.cc.join(', ')}`);
    }

    if (email.bcc && email.bcc.length > 0) {
      headers.push(`Bcc: ${email.bcc.join(', ')}`);
    }

    // Add tracking pixel
    const trackingPixel = `<img src="${window.location.origin}/api/email/track/open/${email.trackingId}" width="1" height="1" style="display:none;" />`;
    const htmlContent = email.html + trackingPixel;

    const message = headers.join('\r\n') + '\r\n\r\n' + htmlContent;
    return btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  createOutlookMessage(email) {
    const trackingPixel = `<img src="${window.location.origin}/api/email/track/open/${email.trackingId}" width="1" height="1" style="display:none;" />`;
    
    return {
      subject: email.subject,
      body: {
        contentType: 'HTML',
        content: email.html + trackingPixel
      },
      toRecipients: email.to.map(addr => ({ emailAddress: { address: addr } })),
      ccRecipients: email.cc?.map(addr => ({ emailAddress: { address: addr } })) || [],
      bccRecipients: email.bcc?.map(addr => ({ emailAddress: { address: addr } })) || []
    };
  }

  // Email templates
  async getTemplates() {
    try {
      const response = await fetch('/api/email/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return await response.json();
    } catch (error) {
      console.error('Failed to get email templates:', error);
      return [];
    }
  }

  async createTemplate(template) {
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (!response.ok) throw new Error('Failed to create template');
      return await response.json();
    } catch (error) {
      console.error('Failed to create email template:', error);
      throw error;
    }
  }

  async renderTemplate(templateId, variables) {
    try {
      const response = await fetch(`/api/email/templates/${templateId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables })
      });

      if (!response.ok) throw new Error('Failed to render template');
      return await response.json();
    } catch (error) {
      console.error('Failed to render email template:', error);
      throw error;
    }
  }

  // Email tracking
  async getEmailTracking(trackingId) {
    try {
      const response = await fetch(`/api/email/track/${trackingId}`);
      if (!response.ok) throw new Error('Failed to get tracking data');
      return await response.json();
    } catch (error) {
      console.error('Failed to get email tracking:', error);
      return null;
    }
  }

  async getEmailAnalytics(dateRange) {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/email/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to get analytics');
      return await response.json();
    } catch (error) {
      console.error('Failed to get email analytics:', error);
      return null;
    }
  }

  // Utility methods
  generateTrackingId() {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      let tokenUrl, params;

      if (this.provider === 'GMAIL') {
        tokenUrl = 'https://oauth2.googleapis.com/token';
        params = {
          client_id: EMAIL_PROVIDERS.GMAIL.clientId,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        };
      } else if (this.provider === 'OUTLOOK') {
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        params = {
          client_id: EMAIL_PROVIDERS.OUTLOOK.clientId,
          client_secret: process.env.REACT_APP_MICROSOFT_CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        };
      }

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokens = await response.json();
      this.accessToken = tokens.access_token;
      
      if (tokens.refresh_token) {
        this.refreshToken = tokens.refresh_token;
      }

      return tokens;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }
}

// Main hook
export const useEmailIntegration = (options = {}) => {
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [emailEngine, setEmailEngine] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { user } = useAuth();

  // Load connected providers
  const { data: providers, isLoading: providersLoading } = useQuery(
    ['email-providers', user?.id],
    async () => {
      const response = await fetch('/api/email/providers');
      if (!response.ok) throw new Error('Failed to fetch providers');
      return response.json();
    },
    { enabled: !!user }
  );

  useEffect(() => {
    if (providers) {
      setConnectedProviders(providers);
      if (providers.length > 0 && !activeProvider) {
        setActiveProvider(providers[0]);
      }
    }
  }, [providers, activeProvider]);

  // Initialize email engine when active provider changes
  useEffect(() => {
    if (activeProvider) {
      const engine = new EmailIntegrationEngine(
        activeProvider.type,
        activeProvider.config,
        notifications
      );
      engine.accessToken = activeProvider.accessToken;
      engine.refreshToken = activeProvider.refreshToken;
      setEmailEngine(engine);
    }
  }, [activeProvider, notifications]);

  // Connect to email provider
  const connectProvider = useCallback(async (providerType, config = {}) => {
    setIsConnecting(true);
    
    try {
      const engine = new EmailIntegrationEngine(providerType, config, notifications);
      const authResult = await engine.authenticate();
      
      // Save provider configuration
      const response = await fetch('/api/email/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: providerType,
          config: config,
          accessToken: engine.accessToken,
          refreshToken: engine.refreshToken,
          ...authResult
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save provider configuration');
      }

      const savedProvider = await response.json();
      
      setConnectedProviders(prev => [...prev, savedProvider]);
      setActiveProvider(savedProvider);
      
      notifications.success(`Successfully connected to ${EMAIL_PROVIDERS[providerType].name}`);
      queryClient.invalidateQueries(['email-providers']);
      
      return savedProvider;
    } catch (error) {
      console.error('Failed to connect email provider:', error);
      notifications.error(`Failed to connect to ${EMAIL_PROVIDERS[providerType].name}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [notifications, queryClient]);

  // Disconnect provider
  const disconnectProvider = useCallback(async (providerId) => {
    try {
      const response = await fetch(`/api/email/providers/${providerId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect provider');
      }

      setConnectedProviders(prev => prev.filter(p => p.id !== providerId));
      
      if (activeProvider?.id === providerId) {
        const remaining = connectedProviders.filter(p => p.id !== providerId);
        setActiveProvider(remaining.length > 0 ? remaining[0] : null);
      }

      notifications.success('Provider disconnected successfully');
      queryClient.invalidateQueries(['email-providers']);
    } catch (error) {
      console.error('Failed to disconnect provider:', error);
      notifications.error('Failed to disconnect provider');
      throw error;
    }
  }, [activeProvider, connectedProviders, notifications, queryClient]);

  // Send email mutation
  const sendEmailMutation = useMutation(
    async (emailData) => {
      if (!emailEngine) {
        throw new Error('No email provider connected');
      }
      return await emailEngine.sendEmail(emailData);
    },
    {
      onSuccess: (result) => {
        notifications.success('Email sent successfully');
        queryClient.invalidateQueries(['email-history']);
      },
      onError: (error) => {
        console.error('Failed to send email:', error);
        notifications.error('Failed to send email');
      }
    }
  );

  // Get email templates
  const { data: templates, isLoading: templatesLoading } = useQuery(
    ['email-templates'],
    async () => {
      if (!emailEngine) return [];
      return await emailEngine.getTemplates();
    },
    { enabled: !!emailEngine }
  );

  // Get email analytics
  const getAnalytics = useCallback(async (dateRange) => {
    if (!emailEngine) return null;
    return await emailEngine.getEmailAnalytics(dateRange);
  }, [emailEngine]);

  // Get email tracking
  const getTracking = useCallback(async (trackingId) => {
    if (!emailEngine) return null;
    return await emailEngine.getEmailTracking(trackingId);
  }, [emailEngine]);

  return {
    // State
    connectedProviders,
    activeProvider,
    isConnecting,
    providersLoading,
    templatesLoading,
    
    // Data
    templates,
    availableProviders: EMAIL_PROVIDERS,
    emailTemplates: EMAIL_TEMPLATES,
    emailEvents: EMAIL_EVENTS,
    
    // Actions
    connectProvider,
    disconnectProvider,
    setActiveProvider,
    sendEmail: sendEmailMutation.mutate,
    getAnalytics,
    getTracking,
    
    // Utilities
    emailEngine,
    isEmailSending: sendEmailMutation.isLoading
  };
};

export default useEmailIntegration;