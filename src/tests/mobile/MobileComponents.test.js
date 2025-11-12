import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import MobileLayout from '../../components/mobile/MobileLayout';
import {
  PullToRefresh,
  SwipeableListItem,
  TouchCard,
  ExpandableSection,
  TouchButton,
  StarRating,
  ContactCard,
  FloatingActionMenu
} from '../../components/mobile/TouchComponents';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn()
  })
}));

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      avatar: '/avatar.jpg'
    }
  })
}));

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 2
  })
}));

// Mock touch events
const createTouchEvent = (type, touches = []) => {
  const event = new Event(type, { bubbles: true });
  event.touches = touches;
  event.changedTouches = touches;
  return event;
};

const createTouch = (clientX, clientY, identifier = 0) => ({
  identifier,
  clientX,
  clientY,
  pageX: clientX,
  pageY: clientY,
  screenX: clientX,
  screenY: clientY,
  target: document.body
});

describe('Mobile Components', () => {
  let queryClient;
  let wrapper;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );

    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('MobileLayout', () => {
    test('should render mobile layout with sidebar and main content', () => {
      render(
        <MobileLayout>
          <div>Main Content</div>
        </MobileLayout>,
        { wrapper }
      );

      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });

    test('should toggle sidebar on menu button click', async () => {
      render(
        <MobileLayout>
          <div>Main Content</div>
        </MobileLayout>,
        { wrapper }
      );

      const menuButton = screen.getByRole('button', { name: /menu/i });
      
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Leads')).toBeInTheDocument();
      });
    });

    test('should handle swipe gestures to open/close sidebar', async () => {
      render(
        <MobileLayout>
          <div>Main Content</div>
        </MobileLayout>,
        { wrapper }
      );

      const mainContent = screen.getByText('Main Content').closest('div');

      // Simulate swipe right to open sidebar
      const touchStart = createTouchEvent('touchstart', [createTouch(10, 100)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(150, 100)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(mainContent, touchStart);
      fireEvent(mainContent, touchMove);
      fireEvent(mainContent, touchEnd);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });
    });

    test('should show search modal when search button is clicked', async () => {
      render(
        <MobileLayout>
          <div>Main Content</div>
        </MobileLayout>,
        { wrapper }
      );

      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
      });
    });
  });

  describe('PullToRefresh', () => {
    test('should trigger refresh on pull down gesture', async () => {
      const mockOnRefresh = jest.fn().mockResolvedValue();
      
      render(
        <PullToRefresh onRefresh={mockOnRefresh}>
          <div>Content to refresh</div>
        </PullToRefresh>
      );

      const container = screen.getByText('Content to refresh').closest('div');

      // Simulate pull down gesture
      const touchStart = createTouchEvent('touchstart', [createTouch(100, 50)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(100, 150)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(container, touchStart);
      fireEvent(container, touchMove);
      fireEvent(container, touchEnd);

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });

    test('should show loading indicator during refresh', async () => {
      const mockOnRefresh = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(
        <PullToRefresh onRefresh={mockOnRefresh}>
          <div>Content to refresh</div>
        </PullToRefresh>
      );

      const container = screen.getByText('Content to refresh').closest('div');

      // Simulate pull down gesture
      const touchStart = createTouchEvent('touchstart', [createTouch(100, 50)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(100, 150)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(container, touchStart);
      fireEvent(container, touchMove);
      fireEvent(container, touchEnd);

      // Should show loading state
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
      });
    });
  });

  describe('SwipeableListItem', () => {
    test('should reveal actions on swipe left', async () => {
      const mockOnEdit = jest.fn();
      const mockOnDelete = jest.fn();

      const actions = [
        { label: 'Edit', color: 'blue', onPress: mockOnEdit },
        { label: 'Delete', color: 'red', onPress: mockOnDelete }
      ];

      render(
        <SwipeableListItem actions={actions}>
          <div>List Item Content</div>
        </SwipeableListItem>
      );

      const listItem = screen.getByText('List Item Content').closest('div');

      // Simulate swipe left gesture
      const touchStart = createTouchEvent('touchstart', [createTouch(200, 100)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(50, 100)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(listItem, touchStart);
      fireEvent(listItem, touchMove);
      fireEvent(listItem, touchEnd);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    test('should execute action when action button is pressed', async () => {
      const mockOnEdit = jest.fn();

      const actions = [
        { label: 'Edit', color: 'blue', onPress: mockOnEdit }
      ];

      render(
        <SwipeableListItem actions={actions}>
          <div>List Item Content</div>
        </SwipeableListItem>
      );

      const listItem = screen.getByText('List Item Content').closest('div');

      // Simulate swipe left to reveal actions
      const touchStart = createTouchEvent('touchstart', [createTouch(200, 100)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(50, 100)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(listItem, touchStart);
      fireEvent(listItem, touchMove);
      fireEvent(listItem, touchEnd);

      await waitFor(() => {
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalled();
      });
    });
  });

  describe('TouchCard', () => {
    test('should handle tap gesture', async () => {
      const mockOnTap = jest.fn();

      render(
        <TouchCard onTap={mockOnTap}>
          <div>Card Content</div>
        </TouchCard>
      );

      const card = screen.getByText('Card Content').closest('div');
      
      fireEvent.click(card);
      
      expect(mockOnTap).toHaveBeenCalled();
    });

    test('should handle long press gesture', async () => {
      const mockOnLongPress = jest.fn();

      render(
        <TouchCard onLongPress={mockOnLongPress}>
          <div>Card Content</div>
        </TouchCard>
      );

      const card = screen.getByText('Card Content').closest('div');
      
      // Simulate long press
      fireEvent.mouseDown(card);
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });
      
      fireEvent.mouseUp(card);
      
      expect(mockOnLongPress).toHaveBeenCalled();
    });

    test('should show pressed state during interaction', () => {
      render(
        <TouchCard>
          <div>Card Content</div>
        </TouchCard>
      );

      const card = screen.getByText('Card Content').closest('div');
      
      fireEvent.mouseDown(card);
      
      // Should have pressed styling (this would be tested with actual CSS classes)
      expect(card).toHaveStyle('transform: scale(0.98)');
    });
  });

  describe('ExpandableSection', () => {
    test('should expand and collapse on header click', async () => {
      render(
        <ExpandableSection title="Expandable Section">
          <div>Hidden Content</div>
        </ExpandableSection>
      );

      const header = screen.getByText('Expandable Section');
      
      // Initially collapsed
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(header);
      
      await waitFor(() => {
        expect(screen.getByText('Hidden Content')).toBeInTheDocument();
      });
      
      // Click to collapse
      fireEvent.click(header);
      
      await waitFor(() => {
        expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
      });
    });

    test('should start expanded when defaultExpanded is true', () => {
      render(
        <ExpandableSection title="Expandable Section" defaultExpanded>
          <div>Visible Content</div>
        </ExpandableSection>
      );

      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });
  });

  describe('TouchButton', () => {
    test('should handle different button variants', () => {
      render(
        <div>
          <TouchButton variant="primary">Primary Button</TouchButton>
          <TouchButton variant="secondary">Secondary Button</TouchButton>
          <TouchButton variant="outline">Outline Button</TouchButton>
        </div>
      );

      expect(screen.getByText('Primary Button')).toBeInTheDocument();
      expect(screen.getByText('Secondary Button')).toBeInTheDocument();
      expect(screen.getByText('Outline Button')).toBeInTheDocument();
    });

    test('should be disabled when disabled prop is true', () => {
      const mockOnPress = jest.fn();

      render(
        <TouchButton disabled onPress={mockOnPress}>
          Disabled Button
        </TouchButton>
      );

      const button = screen.getByText('Disabled Button');
      
      fireEvent.click(button);
      
      expect(mockOnPress).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    test('should show loading state', () => {
      render(
        <TouchButton loading>
          Loading Button
        </TouchButton>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('StarRating', () => {
    test('should handle rating selection', async () => {
      const mockOnRatingChange = jest.fn();

      render(
        <StarRating
          rating={0}
          onRatingChange={mockOnRatingChange}
          interactive
        />
      );

      const stars = screen.getAllByRole('button');
      
      // Click on third star
      fireEvent.click(stars[2]);
      
      expect(mockOnRatingChange).toHaveBeenCalledWith(3);
    });

    test('should display current rating', () => {
      render(
        <StarRating rating={4} />
      );

      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(4);
    });

    test('should be non-interactive when interactive is false', () => {
      const mockOnRatingChange = jest.fn();

      render(
        <StarRating
          rating={3}
          onRatingChange={mockOnRatingChange}
          interactive={false}
        />
      );

      const container = screen.getByRole('group');
      
      fireEvent.click(container);
      
      expect(mockOnRatingChange).not.toHaveBeenCalled();
    });
  });

  describe('ContactCard', () => {
    const mockContact = {
      id: 'contact1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      avatar: '/avatar.jpg'
    };

    test('should display contact information', () => {
      render(
        <ContactCard contact={mockContact} />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    test('should handle contact actions', async () => {
      const mockOnCall = jest.fn();
      const mockOnEmail = jest.fn();
      const mockOnEdit = jest.fn();

      render(
        <ContactCard
          contact={mockContact}
          onCall={mockOnCall}
          onEmail={mockOnEmail}
          onEdit={mockOnEdit}
        />
      );

      // Test swipe actions
      const card = screen.getByText('John Doe').closest('div');

      // Simulate swipe left to reveal actions
      const touchStart = createTouchEvent('touchstart', [createTouch(200, 100)]);
      const touchMove = createTouchEvent('touchmove', [createTouch(50, 100)]);
      const touchEnd = createTouchEvent('touchend', []);

      fireEvent(card, touchStart);
      fireEvent(card, touchMove);
      fireEvent(card, touchEnd);

      await waitFor(() => {
        const callButton = screen.getByText('Call');
        const emailButton = screen.getByText('Email');
        const editButton = screen.getByText('Edit');

        fireEvent.click(callButton);
        expect(mockOnCall).toHaveBeenCalledWith(mockContact);

        fireEvent.click(emailButton);
        expect(mockOnEmail).toHaveBeenCalledWith(mockContact);

        fireEvent.click(editButton);
        expect(mockOnEdit).toHaveBeenCalledWith(mockContact);
      });
    });
  });

  describe('FloatingActionMenu', () => {
    const mockActions = [
      { icon: '📞', label: 'Call', onPress: jest.fn() },
      { icon: '✉️', label: 'Email', onPress: jest.fn() },
      { icon: '📝', label: 'Note', onPress: jest.fn() }
    ];

    test('should expand menu on main button press', async () => {
      render(
        <FloatingActionMenu actions={mockActions} />
      );

      const mainButton = screen.getByRole('button');
      
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        expect(screen.getByText('Call')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Note')).toBeInTheDocument();
      });
    });

    test('should execute action when action button is pressed', async () => {
      render(
        <FloatingActionMenu actions={mockActions} />
      );

      const mainButton = screen.getByRole('button');
      
      // Expand menu
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        const callButton = screen.getByText('Call');
        fireEvent.click(callButton);
        expect(mockActions[0].onPress).toHaveBeenCalled();
      });
    });

    test('should collapse menu when clicking outside', async () => {
      render(
        <div>
          <FloatingActionMenu actions={mockActions} />
          <div>Outside Content</div>
        </div>
      );

      const mainButton = screen.getByRole('button');
      
      // Expand menu
      fireEvent.click(mainButton);
      
      await waitFor(() => {
        expect(screen.getByText('Call')).toBeInTheDocument();
      });
      
      // Click outside
      fireEvent.click(screen.getByText('Outside Content'));
      
      await waitFor(() => {
        expect(screen.queryByText('Call')).not.toBeInTheDocument();
      });
    });
  });

  describe('Touch Gesture Recognition', () => {
    test('should distinguish between tap and long press', async () => {
      const mockOnTap = jest.fn();
      const mockOnLongPress = jest.fn();

      render(
        <TouchCard onTap={mockOnTap} onLongPress={mockOnLongPress}>
          <div>Gesture Test</div>
        </TouchCard>
      );

      const card = screen.getByText('Gesture Test').closest('div');

      // Test tap (short press)
      fireEvent.mouseDown(card);
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      fireEvent.mouseUp(card);

      expect(mockOnTap).toHaveBeenCalled();
      expect(mockOnLongPress).not.toHaveBeenCalled();

      // Reset mocks
      mockOnTap.mockClear();
      mockOnLongPress.mockClear();

      // Test long press
      fireEvent.mouseDown(card);
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
      });
      fireEvent.mouseUp(card);

      expect(mockOnLongPress).toHaveBeenCalled();
      expect(mockOnTap).not.toHaveBeenCalled();
    });

    test('should handle swipe direction detection', async () => {
      const mockOnSwipeLeft = jest.fn();
      const mockOnSwipeRight = jest.fn();

      render(
        <SwipeableListItem
          actions={[{ label: 'Action', onPress: jest.fn() }]}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
        >
          <div>Swipe Test</div>
        </SwipeableListItem>
      );

      const item = screen.getByText('Swipe Test').closest('div');

      // Test swipe left
      const touchStartLeft = createTouchEvent('touchstart', [createTouch(200, 100)]);
      const touchMoveLeft = createTouchEvent('touchmove', [createTouch(50, 100)]);
      const touchEndLeft = createTouchEvent('touchend', []);

      fireEvent(item, touchStartLeft);
      fireEvent(item, touchMoveLeft);
      fireEvent(item, touchEndLeft);

      await waitFor(() => {
        expect(mockOnSwipeLeft).toHaveBeenCalled();
      });

      // Reset mock
      mockOnSwipeLeft.mockClear();

      // Test swipe right
      const touchStartRight = createTouchEvent('touchstart', [createTouch(50, 100)]);
      const touchMoveRight = createTouchEvent('touchmove', [createTouch(200, 100)]);
      const touchEndRight = createTouchEvent('touchend', []);

      fireEvent(item, touchStartRight);
      fireEvent(item, touchMoveRight);
      fireEvent(item, touchEndRight);

      await waitFor(() => {
        expect(mockOnSwipeRight).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      render(
        <div>
          <TouchButton aria-label="Submit form">Submit</TouchButton>
          <StarRating rating={4} aria-label="4 out of 5 stars" />
          <ExpandableSection title="Details" aria-expanded={false}>
            <div>Content</div>
          </ExpandableSection>
        </div>
      );

      expect(screen.getByLabelText('Submit form')).toBeInTheDocument();
      expect(screen.getByLabelText('4 out of 5 stars')).toBeInTheDocument();
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });

    test('should support keyboard navigation', () => {
      render(
        <TouchButton onPress={jest.fn()}>
          Keyboard Test
        </TouchButton>
      );

      const button = screen.getByText('Keyboard Test');
      
      // Should be focusable
      button.focus();
      expect(button).toHaveFocus();
      
      // Should respond to Enter key
      fireEvent.keyDown(button, { key: 'Enter' });
      // Test would verify onPress was called
    });
  });
});