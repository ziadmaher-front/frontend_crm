/**
 * Provider Configurations for Integrations
 * Defines OAuth scopes, auth types, and metadata for each integration provider
 */

export const PROVIDER_CONFIGS = {
  // Email Providers
  GMAIL: {
    name: 'Gmail',
    type: 'email',
    authType: 'oauth2',
    oauthScopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    icon: 'Mail',
    color: 'from-red-500 to-pink-500',
    description: 'Connect your Gmail account to send and receive emails',
  },
  OUTLOOK: {
    name: 'Outlook',
    type: 'email',
    authType: 'oauth2',
    oauthScopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Mail.ReadWrite',
    ],
    icon: 'Mail',
    color: 'from-blue-500 to-indigo-500',
    description: 'Connect your Outlook account via Microsoft Graph',
  },
  IMAP_SMTP: {
    name: 'IMAP/SMTP',
    type: 'email',
    authType: 'imap_smtp',
    requiresConfig: true,
    icon: 'Mail',
    color: 'from-gray-500 to-gray-600',
    description: 'Connect any email provider using IMAP/SMTP settings',
  },

  // Calendar Providers
  GOOGLE_CALENDAR: {
    name: 'Google Calendar',
    type: 'calendar',
    authType: 'oauth2',
    oauthScopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    icon: 'Calendar',
    color: 'from-green-500 to-emerald-500',
    description: 'Sync your Google Calendar events and meetings',
  },
  OUTLOOK_CALENDAR: {
    name: 'Outlook Calendar',
    type: 'calendar',
    authType: 'oauth2',
    oauthScopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Calendars.Read',
    ],
    icon: 'Calendar',
    color: 'from-blue-500 to-indigo-500',
    description: 'Sync your Outlook Calendar events and meetings',
  },

  // WhatsApp
  WHATSAPP_META: {
    name: 'WhatsApp Business (Meta)',
    type: 'whatsapp',
    authType: 'api_key',
    requiresConfig: true,
    icon: 'MessageSquare',
    color: 'from-green-500 to-emerald-500',
    description: 'Connect WhatsApp Business API via Meta',
  },
  WHATSAPP_TWILIO: {
    name: 'WhatsApp (Twilio)',
    type: 'whatsapp',
    authType: 'api_key',
    requiresConfig: true,
    icon: 'MessageSquare',
    color: 'from-green-500 to-emerald-500',
    description: 'Connect WhatsApp via Twilio API',
  },

  // Google Maps
  GOOGLE_MAPS: {
    name: 'Google Maps',
    type: 'maps',
    authType: 'api_key',
    requiresConfig: true,
    icon: 'MapPin',
    color: 'from-blue-500 to-cyan-500',
    description: 'Add Google Maps API key for location services',
  },

  // Microsoft Teams & Office 365
  MICROSOFT_TEAMS: {
    name: 'Microsoft Teams',
    type: 'teams',
    authType: 'oauth2',
    oauthScopes: [
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Chat.ReadWrite',
      'https://graph.microsoft.com/ChatMessage.Send',
    ],
    icon: 'Video',
    color: 'from-purple-500 to-indigo-500',
    description: 'Connect Microsoft Teams for chat and collaboration',
  },
  OFFICE_365: {
    name: 'Office 365',
    type: 'office365',
    authType: 'oauth2',
    oauthScopes: [
      'https://graph.microsoft.com/Files.ReadWrite.All',
      'https://graph.microsoft.com/Sites.ReadWrite.All',
    ],
    icon: 'FileText',
    color: 'from-orange-500 to-red-500',
    description: 'Connect Office 365 for file and document management',
  },
};

/**
 * Get provider config by key
 */
export function getProviderConfig(providerKey) {
  return PROVIDER_CONFIGS[providerKey] || null;
}

/**
 * Map catalog provider names to provider config keys
 */
const PROVIDER_NAME_TO_KEY = {
  // Calendar
  'Google': 'GOOGLE_CALENDAR',
  'Microsoft': 'OUTLOOK_CALENDAR',
  'Apple': null, // Not implemented yet
  
  // Email
  'Gmail': 'GMAIL',
  'Google': 'GMAIL', // Also map Google to Gmail for email
  'Outlook': 'OUTLOOK',
  'Microsoft': 'OUTLOOK', // Also map Microsoft to Outlook for email
  'Zoho': null, // Not implemented yet
  'Yahoo': null, // Not implemented yet
  
  // WhatsApp
  'WhatsApp': 'WHATSAPP_META',
  'Twilio': 'WHATSAPP_TWILIO',
  
  // Maps
  'Google Maps': 'GOOGLE_MAPS',
  
  // Teams
  'Teams': 'MICROSOFT_TEAMS',
  'Office 365': 'OFFICE_365',
};

/**
 * Map provider config key to backend provider slug
 * Backend might expect simpler names like "google" instead of "GOOGLE_CALENDAR"
 */
const PROVIDER_KEY_TO_BACKEND_SLUG = {
  'GOOGLE_CALENDAR': 'google',
  'OUTLOOK_CALENDAR': 'microsoft',
  'GMAIL': 'google',
  'OUTLOOK': 'microsoft',
  'WHATSAPP_META': 'whatsapp',
  'WHATSAPP_TWILIO': 'twilio',
  'GOOGLE_MAPS': 'google-maps',
  'MICROSOFT_TEAMS': 'microsoft-teams',
  'OFFICE_365': 'office365',
  'IMAP_SMTP': 'imap-smtp',
};

/**
 * Get provider key from catalog name
 */
export function getProviderKeyFromName(name, integrationType) {
  // Try direct mapping first
  if (PROVIDER_NAME_TO_KEY[name]) {
    return PROVIDER_NAME_TO_KEY[name];
  }
  
  // Try type-specific mapping
  if (integrationType === 'Calendar') {
    if (name === 'Google') return 'GOOGLE_CALENDAR';
    if (name === 'Microsoft') return 'OUTLOOK_CALENDAR';
  }
  
  if (integrationType === 'Email') {
    if (name === 'Google' || name === 'Gmail') return 'GMAIL';
    if (name === 'Microsoft' || name === 'Outlook') return 'OUTLOOK';
  }
  
  // Try to find by name match in PROVIDER_CONFIGS
  const found = Object.entries(PROVIDER_CONFIGS).find(([_, config]) => 
    config.name.toLowerCase() === name.toLowerCase() ||
    config.name.toLowerCase().includes(name.toLowerCase())
  );
  
  return found ? found[0] : null;
}

/**
 * Get backend provider slug from provider config key
 * Backend might expect simpler names
 */
export function getBackendProviderSlug(providerKey) {
  return PROVIDER_KEY_TO_BACKEND_SLUG[providerKey] || providerKey.toLowerCase().replace(/_/g, '-');
}

/**
 * Get all providers for a specific integration type
 */
export function getProvidersByType(type) {
  return Object.entries(PROVIDER_CONFIGS)
    .filter(([_, config]) => config.type === type)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Get all available integration types
 */
export function getIntegrationTypes() {
  const types = new Set();
  Object.values(PROVIDER_CONFIGS).forEach(config => {
    types.add(config.type);
  });
  return Array.from(types);
}

