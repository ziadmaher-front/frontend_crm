import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../useAuth';

// Calendar providers configuration
const CALENDAR_PROVIDERS = {
  GOOGLE: {
    name: 'Google Calendar',
    icon: '📅',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
  },
  OUTLOOK: {
    name: 'Outlook Calendar',
    icon: '📆',
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scopes: [
      'https://graph.microsoft.com/calendars.readwrite',
      'https://graph.microsoft.com/calendars.read'
    ],
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID
  },
  CALDAV: {
    name: 'CalDAV',
    icon: '🗓️',
    requiresConfig: true
  }
};

// Event types
const EVENT_TYPES = {
  MEETING: 'meeting',
  CALL: 'call',
  DEMO: 'demo',
  FOLLOW_UP: 'follow_up',
  PRESENTATION: 'presentation',
  TRAINING: 'training',
  CONFERENCE: 'conference',
  PERSONAL: 'personal'
};

// Reminder types
const REMINDER_TYPES = {
  POPUP: 'popup',
  EMAIL: 'email',
  SMS: 'sms'
};

class CalendarIntegrationEngine {
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
        case 'GOOGLE':
          return await this.authenticateGoogle();
        case 'OUTLOOK':
          return await this.authenticateOutlook();
        case 'CALDAV':
          return await this.authenticateCalDAV();
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Calendar authentication failed:', error);
      this.notifications.error(`Failed to authenticate with ${this.provider}`);
      throw error;
    }
  }

  async authenticateGoogle() {
    const params = new URLSearchParams({
      client_id: CALENDAR_PROVIDERS.GOOGLE.clientId,
      redirect_uri: `${window.location.origin}/auth/google-calendar/callback`,
      scope: CALENDAR_PROVIDERS.GOOGLE.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    const authUrl = `${CALENDAR_PROVIDERS.GOOGLE.authUrl}?${params}`;
    
    const popup = window.open(authUrl, 'google-calendar-auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          this.accessToken = event.data.accessToken;
          this.refreshToken = event.data.refreshToken;
          resolve(event.data);
        } else if (event.data.type === 'GOOGLE_CALENDAR_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  async authenticateOutlook() {
    const params = new URLSearchParams({
      client_id: CALENDAR_PROVIDERS.OUTLOOK.clientId,
      redirect_uri: `${window.location.origin}/auth/outlook-calendar/callback`,
      scope: CALENDAR_PROVIDERS.OUTLOOK.scopes.join(' '),
      response_type: 'code',
      response_mode: 'query'
    });

    const authUrl = `${CALENDAR_PROVIDERS.OUTLOOK.authUrl}?${params}`;
    
    const popup = window.open(authUrl, 'outlook-calendar-auth', 'width=500,height=600');
    
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'OUTLOOK_CALENDAR_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          this.accessToken = event.data.accessToken;
          this.refreshToken = event.data.refreshToken;
          resolve(event.data);
        } else if (event.data.type === 'OUTLOOK_CALENDAR_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          reject(new Error(event.data.error));
        }
      });
    });
  }

  async authenticateCalDAV() {
    const requiredFields = ['serverUrl', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing CalDAV configuration: ${missingFields.join(', ')}`);
    }

    try {
      const response = await fetch('/api/calendar/caldav/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.config)
      });

      if (!response.ok) {
        throw new Error('CalDAV connection test failed');
      }

      return { success: true, provider: 'CALDAV' };
    } catch (error) {
      throw new Error(`CalDAV authentication failed: ${error.message}`);
    }
  }

  // Calendar operations
  async getCalendars() {
    try {
      switch (this.provider) {
        case 'GOOGLE':
          return await this.getGoogleCalendars();
        case 'OUTLOOK':
          return await this.getOutlookCalendars();
        case 'CALDAV':
          return await this.getCalDAVCalendars();
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to get calendars:', error);
      throw error;
    }
  }

  async getGoogleCalendars() {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    return data.items.map(calendar => ({
      id: calendar.id,
      name: calendar.summary,
      description: calendar.description,
      primary: calendar.primary,
      accessRole: calendar.accessRole,
      backgroundColor: calendar.backgroundColor,
      provider: 'GOOGLE'
    }));
  }

  async getOutlookCalendars() {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Outlook Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    return data.value.map(calendar => ({
      id: calendar.id,
      name: calendar.name,
      description: calendar.description,
      primary: calendar.isDefaultCalendar,
      canEdit: calendar.canEdit,
      color: calendar.color,
      provider: 'OUTLOOK'
    }));
  }

  async getCalDAVCalendars() {
    const response = await fetch('/api/calendar/caldav/calendars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.config)
    });

    if (!response.ok) {
      throw new Error(`CalDAV error: ${response.status}`);
    }

    return await response.json();
  }

  // Event operations
  async createEvent(eventData) {
    try {
      const event = {
        ...eventData,
        id: eventData.id || this.generateEventId(),
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };

      switch (this.provider) {
        case 'GOOGLE':
          return await this.createGoogleEvent(event);
        case 'OUTLOOK':
          return await this.createOutlookEvent(event);
        case 'CALDAV':
          return await this.createCalDAVEvent(event);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      this.notifications.error('Failed to create calendar event');
      throw error;
    }
  }

  async createGoogleEvent(event) {
    const googleEvent = this.formatGoogleEvent(event);
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${event.calendarId || 'primary'}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const result = await response.json();
    return this.normalizeGoogleEvent(result);
  }

  async createOutlookEvent(event) {
    const outlookEvent = this.formatOutlookEvent(event);
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendars/${event.calendarId || 'calendar'}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outlookEvent)
    });

    if (!response.ok) {
      throw new Error(`Outlook Calendar API error: ${response.status}`);
    }

    const result = await response.json();
    return this.normalizeOutlookEvent(result);
  }

  async createCalDAVEvent(event) {
    const response = await fetch('/api/calendar/caldav/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: this.config,
        event: event
      })
    });

    if (!response.ok) {
      throw new Error(`CalDAV error: ${response.status}`);
    }

    return await response.json();
  }

  async updateEvent(eventId, eventData) {
    try {
      switch (this.provider) {
        case 'GOOGLE':
          return await this.updateGoogleEvent(eventId, eventData);
        case 'OUTLOOK':
          return await this.updateOutlookEvent(eventId, eventData);
        case 'CALDAV':
          return await this.updateCalDAVEvent(eventId, eventData);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      this.notifications.error('Failed to update calendar event');
      throw error;
    }
  }

  async deleteEvent(eventId, calendarId) {
    try {
      switch (this.provider) {
        case 'GOOGLE':
          return await this.deleteGoogleEvent(eventId, calendarId);
        case 'OUTLOOK':
          return await this.deleteOutlookEvent(eventId);
        case 'CALDAV':
          return await this.deleteCalDAVEvent(eventId);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      this.notifications.error('Failed to delete calendar event');
      throw error;
    }
  }

  async getEvents(calendarId, timeRange) {
    try {
      switch (this.provider) {
        case 'GOOGLE':
          return await this.getGoogleEvents(calendarId, timeRange);
        case 'OUTLOOK':
          return await this.getOutlookEvents(calendarId, timeRange);
        case 'CALDAV':
          return await this.getCalDAVEvents(calendarId, timeRange);
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('Failed to get events:', error);
      throw error;
    }
  }

  // Event formatting methods
  formatGoogleEvent(event) {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime,
        timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.endTime,
        timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: event.attendees?.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name,
        responseStatus: attendee.status || 'needsAction'
      })),
      reminders: {
        useDefault: false,
        overrides: event.reminders?.map(reminder => ({
          method: reminder.type === 'popup' ? 'popup' : 'email',
          minutes: reminder.minutes
        })) || []
      }
    };

    if (event.recurrence) {
      googleEvent.recurrence = [event.recurrence];
    }

    return googleEvent;
  }

  formatOutlookEvent(event) {
    return {
      subject: event.title,
      body: {
        contentType: 'HTML',
        content: event.description || ''
      },
      location: {
        displayName: event.location || ''
      },
      start: {
        dateTime: event.startTime,
        timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.endTime,
        timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: event.attendees?.map(attendee => ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name
        },
        type: 'required'
      })) || [],
      reminderMinutesBeforeStart: event.reminders?.[0]?.minutes || 15
    };
  }

  normalizeGoogleEvent(googleEvent) {
    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description,
      location: googleEvent.location,
      startTime: googleEvent.start.dateTime || googleEvent.start.date,
      endTime: googleEvent.end.dateTime || googleEvent.end.date,
      allDay: !googleEvent.start.dateTime,
      attendees: googleEvent.attendees?.map(attendee => ({
        email: attendee.email,
        name: attendee.displayName,
        status: attendee.responseStatus
      })) || [],
      created: googleEvent.created,
      updated: googleEvent.updated,
      provider: 'GOOGLE',
      htmlLink: googleEvent.htmlLink
    };
  }

  normalizeOutlookEvent(outlookEvent) {
    return {
      id: outlookEvent.id,
      title: outlookEvent.subject,
      description: outlookEvent.body?.content,
      location: outlookEvent.location?.displayName,
      startTime: outlookEvent.start.dateTime,
      endTime: outlookEvent.end.dateTime,
      allDay: outlookEvent.isAllDay,
      attendees: outlookEvent.attendees?.map(attendee => ({
        email: attendee.emailAddress.address,
        name: attendee.emailAddress.name,
        status: attendee.status?.response
      })) || [],
      created: outlookEvent.createdDateTime,
      updated: outlookEvent.lastModifiedDateTime,
      provider: 'OUTLOOK',
      webLink: outlookEvent.webLink
    };
  }

  // Availability checking
  async checkAvailability(attendees, timeRange) {
    try {
      switch (this.provider) {
        case 'GOOGLE':
          return await this.checkGoogleAvailability(attendees, timeRange);
        case 'OUTLOOK':
          return await this.checkOutlookAvailability(attendees, timeRange);
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
      return null;
    }
  }

  async checkGoogleAvailability(attendees, timeRange) {
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timeMin: timeRange.start,
        timeMax: timeRange.end,
        items: attendees.map(email => ({ id: email }))
      })
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    return await response.json();
  }

  async checkOutlookAvailability(attendees, timeRange) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schedules: attendees,
        startTime: {
          dateTime: timeRange.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        endTime: {
          dateTime: timeRange.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        availabilityViewInterval: 15
      })
    });

    if (!response.ok) {
      throw new Error(`Outlook Calendar API error: ${response.status}`);
    }

    return await response.json();
  }

  // Utility methods
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async refreshAccessToken() {
    // Similar to email integration token refresh
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      let tokenUrl, params;

      if (this.provider === 'GOOGLE') {
        tokenUrl = 'https://oauth2.googleapis.com/token';
        params = {
          client_id: CALENDAR_PROVIDERS.GOOGLE.clientId,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        };
      } else if (this.provider === 'OUTLOOK') {
        tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        params = {
          client_id: CALENDAR_PROVIDERS.OUTLOOK.clientId,
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
export const useCalendarIntegration = (options = {}) => {
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [activeProvider, setActiveProvider] = useState(null);
  const [calendarEngine, setCalendarEngine] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const { user } = useAuth();

  // Load connected providers
  const { data: providers, isLoading: providersLoading } = useQuery(
    ['calendar-providers', user?.id],
    async () => {
      const response = await fetch('/api/calendar/providers');
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

  // Initialize calendar engine
  useEffect(() => {
    if (activeProvider) {
      const engine = new CalendarIntegrationEngine(
        activeProvider.type,
        activeProvider.config,
        notifications
      );
      engine.accessToken = activeProvider.accessToken;
      engine.refreshToken = activeProvider.refreshToken;
      setCalendarEngine(engine);
    }
  }, [activeProvider, notifications]);

  // Connect to calendar provider
  const connectProvider = useCallback(async (providerType, config = {}) => {
    setIsConnecting(true);
    
    try {
      const engine = new CalendarIntegrationEngine(providerType, config, notifications);
      const authResult = await engine.authenticate();
      
      const response = await fetch('/api/calendar/providers', {
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
      
      notifications.success(`Successfully connected to ${CALENDAR_PROVIDERS[providerType].name}`);
      queryClient.invalidateQueries(['calendar-providers']);
      
      return savedProvider;
    } catch (error) {
      console.error('Failed to connect calendar provider:', error);
      notifications.error(`Failed to connect to ${CALENDAR_PROVIDERS[providerType].name}`);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [notifications, queryClient]);

  // Get calendars
  const { data: calendars, isLoading: calendarsLoading } = useQuery(
    ['calendars', activeProvider?.id],
    async () => {
      if (!calendarEngine) return [];
      return await calendarEngine.getCalendars();
    },
    { enabled: !!calendarEngine }
  );

  // Create event mutation
  const createEventMutation = useMutation(
    async (eventData) => {
      if (!calendarEngine) {
        throw new Error('No calendar provider connected');
      }
      return await calendarEngine.createEvent(eventData);
    },
    {
      onSuccess: () => {
        notifications.success('Event created successfully');
        queryClient.invalidateQueries(['calendar-events']);
      },
      onError: (error) => {
        console.error('Failed to create event:', error);
        notifications.error('Failed to create event');
      }
    }
  );

  // Update event mutation
  const updateEventMutation = useMutation(
    async ({ eventId, eventData }) => {
      if (!calendarEngine) {
        throw new Error('No calendar provider connected');
      }
      return await calendarEngine.updateEvent(eventId, eventData);
    },
    {
      onSuccess: () => {
        notifications.success('Event updated successfully');
        queryClient.invalidateQueries(['calendar-events']);
      },
      onError: (error) => {
        console.error('Failed to update event:', error);
        notifications.error('Failed to update event');
      }
    }
  );

  // Delete event mutation
  const deleteEventMutation = useMutation(
    async ({ eventId, calendarId }) => {
      if (!calendarEngine) {
        throw new Error('No calendar provider connected');
      }
      return await calendarEngine.deleteEvent(eventId, calendarId);
    },
    {
      onSuccess: () => {
        notifications.success('Event deleted successfully');
        queryClient.invalidateQueries(['calendar-events']);
      },
      onError: (error) => {
        console.error('Failed to delete event:', error);
        notifications.error('Failed to delete event');
      }
    }
  );

  // Get events
  const getEvents = useCallback(async (calendarId, timeRange) => {
    if (!calendarEngine) return [];
    return await calendarEngine.getEvents(calendarId, timeRange);
  }, [calendarEngine]);

  // Check availability
  const checkAvailability = useCallback(async (attendees, timeRange) => {
    if (!calendarEngine) return null;
    return await calendarEngine.checkAvailability(attendees, timeRange);
  }, [calendarEngine]);

  return {
    // State
    connectedProviders,
    activeProvider,
    isConnecting,
    providersLoading,
    calendarsLoading,
    
    // Data
    calendars,
    availableProviders: CALENDAR_PROVIDERS,
    eventTypes: EVENT_TYPES,
    reminderTypes: REMINDER_TYPES,
    
    // Actions
    connectProvider,
    setActiveProvider,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    getEvents,
    checkAvailability,
    
    // Loading states
    isCreatingEvent: createEventMutation.isLoading,
    isUpdatingEvent: updateEventMutation.isLoading,
    isDeletingEvent: deleteEventMutation.isLoading,
    
    // Utilities
    calendarEngine
  };
};

export default useCalendarIntegration;