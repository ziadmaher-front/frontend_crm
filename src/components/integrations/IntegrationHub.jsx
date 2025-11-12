import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CloudIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  LinkIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  EnvelopeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShareIcon,
  DocumentTextIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TagIcon,
  ArchiveBoxIcon,
  ServerIcon,
  DatabaseIcon,
  KeyIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  WifiIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Integration Engine for managing third-party connections
class IntegrationEngine {
  constructor() {
    this.integrations = new Map();
    this.webhooks = new Map();
    this.syncJobs = new Map();
    this.apiClients = new Map();
  }

  // Register a new integration
  registerIntegration(config) {
    const integration = {
      id: config.id,
      name: config.name,
      type: config.type,
      provider: config.provider,
      status: 'disconnected',
      config: config.config || {},
      credentials: config.credentials || {},
      webhooks: [],
      syncSettings: {
        enabled: false,
        frequency: 'hourly',
        lastSync: null,
        nextSync: null
      },
      metrics: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        lastActivity: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.integrations.set(config.id, integration);
    return integration;
  }

  // Connect to an integration
  async connectIntegration(integrationId, credentials) {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    try {
      // Simulate API connection
      const client = await this.createApiClient(integration.provider, credentials);
      await client.authenticate();

      integration.status = 'connected';
      integration.credentials = credentials;
      integration.updatedAt = new Date();
      
      this.apiClients.set(integrationId, client);
      
      return { success: true, integration };
    } catch (error) {
      integration.status = 'error';
      integration.lastError = error.message;
      throw error;
    }
  }

  // Create API client for different providers
  async createApiClient(provider, credentials) {
    const clients = {
      gmail: () => new GmailClient(credentials),
      outlook: () => new OutlookClient(credentials),
      google_calendar: () => new GoogleCalendarClient(credentials),
      outlook_calendar: () => new OutlookCalendarClient(credentials),
      stripe: () => new StripeClient(credentials),
      paypal: () => new PayPalClient(credentials),
      salesforce: () => new SalesforceClient(credentials),
      hubspot: () => new HubSpotClient(credentials),
      slack: () => new SlackClient(credentials),
      teams: () => new TeamsClient(credentials),
      zoom: () => new ZoomClient(credentials),
      linkedin: () => new LinkedInClient(credentials),
      facebook: () => new FacebookClient(credentials),
      twitter: () => new TwitterClient(credentials),
      mailchimp: () => new MailchimpClient(credentials),
      twilio: () => new TwilioClient(credentials),
      zapier: () => new ZapierClient(credentials),
      webhooks: () => new WebhookClient(credentials)
    };

    const clientFactory = clients[provider];
    if (!clientFactory) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return clientFactory();
  }

  // Sync data from integration
  async syncIntegration(integrationId) {
    const integration = this.integrations.get(integrationId);
    const client = this.apiClients.get(integrationId);

    if (!integration || !client) {
      throw new Error('Integration or client not found');
    }

    try {
      const startTime = Date.now();
      const data = await client.fetchData();
      const endTime = Date.now();

      // Update metrics
      integration.metrics.totalRequests++;
      integration.metrics.successfulRequests++;
      integration.metrics.avgResponseTime = 
        (integration.metrics.avgResponseTime + (endTime - startTime)) / 2;
      integration.metrics.lastActivity = new Date();

      // Update sync settings
      integration.syncSettings.lastSync = new Date();
      integration.syncSettings.nextSync = this.calculateNextSync(
        integration.syncSettings.frequency
      );

      return { success: true, data };
    } catch (error) {
      integration.metrics.totalRequests++;
      integration.metrics.failedRequests++;
      throw error;
    }
  }

  // Calculate next sync time
  calculateNextSync(frequency) {
    const now = new Date();
    const intervals = {
      '15min': 15 * 60 * 1000,
      '30min': 30 * 60 * 1000,
      'hourly': 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000
    };

    return new Date(now.getTime() + intervals[frequency]);
  }

  // Setup webhook
  async setupWebhook(integrationId, webhookConfig) {
    const integration = this.integrations.get(integrationId);
    const client = this.apiClients.get(integrationId);

    if (!integration || !client) {
      throw new Error('Integration or client not found');
    }

    const webhook = await client.createWebhook(webhookConfig);
    integration.webhooks.push(webhook);
    
    return webhook;
  }

  // Get integration statistics
  getIntegrationStats() {
    const integrations = Array.from(this.integrations.values());
    
    return {
      total: integrations.length,
      connected: integrations.filter(i => i.status === 'connected').length,
      disconnected: integrations.filter(i => i.status === 'disconnected').length,
      errors: integrations.filter(i => i.status === 'error').length,
      totalRequests: integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0),
      successRate: this.calculateSuccessRate(integrations),
      avgResponseTime: this.calculateAvgResponseTime(integrations)
    };
  }

  calculateSuccessRate(integrations) {
    const total = integrations.reduce((sum, i) => sum + i.metrics.totalRequests, 0);
    const successful = integrations.reduce((sum, i) => sum + i.metrics.successfulRequests, 0);
    return total > 0 ? (successful / total) * 100 : 0;
  }

  calculateAvgResponseTime(integrations) {
    const times = integrations
      .filter(i => i.metrics.avgResponseTime > 0)
      .map(i => i.metrics.avgResponseTime);
    
    return times.length > 0 
      ? times.reduce((sum, time) => sum + time, 0) / times.length 
      : 0;
  }
}

// Mock API clients for different providers
class BaseApiClient {
  constructor(credentials) {
    this.credentials = credentials;
    this.authenticated = false;
  }

  async authenticate() {
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.authenticated = true;
  }

  async fetchData() {
    if (!this.authenticated) {
      throw new Error('Not authenticated');
    }
    // Simulate data fetching
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: 'mock data' };
  }

  async createWebhook(config) {
    return {
      id: Math.random().toString(36).substr(2, 9),
      url: config.url,
      events: config.events,
      active: true,
      createdAt: new Date()
    };
  }
}

class GmailClient extends BaseApiClient {}
class OutlookClient extends BaseApiClient {}
class GoogleCalendarClient extends BaseApiClient {}
class OutlookCalendarClient extends BaseApiClient {}
class StripeClient extends BaseApiClient {}
class PayPalClient extends BaseApiClient {}
class SalesforceClient extends BaseApiClient {}
class HubSpotClient extends BaseApiClient {}
class SlackClient extends BaseApiClient {}
class TeamsClient extends BaseApiClient {}
class ZoomClient extends BaseApiClient {}
class LinkedInClient extends BaseApiClient {}
class FacebookClient extends BaseApiClient {}
class TwitterClient extends BaseApiClient {}
class MailchimpClient extends BaseApiClient {}
class TwilioClient extends BaseApiClient {}
class ZapierClient extends BaseApiClient {}
class WebhookClient extends BaseApiClient {}

// Available integrations configuration
const AVAILABLE_INTEGRATIONS = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Sync emails and manage communication',
    provider: 'gmail',
    type: 'email',
    category: 'Communication',
    icon: EnvelopeIcon,
    color: 'bg-red-500',
    features: ['Email sync', 'Auto-reply', 'Email tracking', 'Templates'],
    pricing: 'Free',
    setupComplexity: 'Easy',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['15min', '30min', 'hourly'],
    requiredScopes: ['https://www.googleapis.com/auth/gmail.readonly']
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Microsoft Outlook email integration',
    provider: 'outlook',
    type: 'email',
    category: 'Communication',
    icon: EnvelopeIcon,
    color: 'bg-blue-500',
    features: ['Email sync', 'Calendar integration', 'Contacts sync'],
    pricing: 'Free',
    setupComplexity: 'Easy',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['15min', '30min', 'hourly']
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sync meetings and appointments',
    provider: 'google_calendar',
    type: 'calendar',
    category: 'Productivity',
    icon: CalendarIcon,
    color: 'bg-green-500',
    features: ['Event sync', 'Meeting scheduling', 'Reminders'],
    pricing: 'Free',
    setupComplexity: 'Easy',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['15min', '30min', 'hourly']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and invoicing',
    provider: 'stripe',
    type: 'payment',
    category: 'Finance',
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
    features: ['Payment processing', 'Subscription management', 'Invoicing'],
    pricing: '2.9% + 30¢',
    setupComplexity: 'Medium',
    authType: 'API Key',
    webhookSupport: true,
    syncFrequency: ['15min', '30min', 'hourly']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM data synchronization',
    provider: 'salesforce',
    type: 'crm',
    category: 'Sales',
    icon: BuildingOfficeIcon,
    color: 'bg-blue-600',
    features: ['Contact sync', 'Lead management', 'Opportunity tracking'],
    pricing: 'Varies',
    setupComplexity: 'Hard',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['30min', 'hourly', 'daily']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    provider: 'slack',
    type: 'communication',
    category: 'Communication',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-purple-600',
    features: ['Notifications', 'Bot integration', 'File sharing'],
    pricing: 'Free/Paid',
    setupComplexity: 'Easy',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['real-time']
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing integration',
    provider: 'zoom',
    type: 'video',
    category: 'Communication',
    icon: VideoCameraIcon,
    color: 'bg-blue-400',
    features: ['Meeting scheduling', 'Recording access', 'Participant tracking'],
    pricing: 'Free/Paid',
    setupComplexity: 'Medium',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['hourly', 'daily']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing automation',
    provider: 'mailchimp',
    type: 'marketing',
    category: 'Marketing',
    icon: EnvelopeIcon,
    color: 'bg-yellow-500',
    features: ['Email campaigns', 'Audience sync', 'Analytics'],
    pricing: 'Free/Paid',
    setupComplexity: 'Medium',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['hourly', 'daily']
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication',
    provider: 'twilio',
    type: 'communication',
    category: 'Communication',
    icon: PhoneIcon,
    color: 'bg-red-600',
    features: ['SMS messaging', 'Voice calls', 'WhatsApp integration'],
    pricing: 'Pay-per-use',
    setupComplexity: 'Medium',
    authType: 'API Key',
    webhookSupport: true,
    syncFrequency: ['real-time']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation platform',
    provider: 'zapier',
    type: 'automation',
    category: 'Automation',
    icon: ArrowPathIcon,
    color: 'bg-orange-500',
    features: ['Workflow automation', 'Multi-app integration', 'Triggers'],
    pricing: 'Free/Paid',
    setupComplexity: 'Easy',
    authType: 'OAuth2',
    webhookSupport: true,
    syncFrequency: ['real-time']
  }
];

// Integration categories
const INTEGRATION_CATEGORIES = [
  { id: 'all', name: 'All Integrations', icon: GlobeAltIcon },
  { id: 'Communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
  { id: 'Productivity', name: 'Productivity', icon: ClockIcon },
  { id: 'Finance', name: 'Finance', icon: CurrencyDollarIcon },
  { id: 'Sales', name: 'Sales', icon: ChartBarIcon },
  { id: 'Marketing', name: 'Marketing', icon: ShareIcon },
  { id: 'Automation', name: 'Automation', icon: CogIcon }
];

// Integration card component
const IntegrationCard = ({ integration, onConnect, onConfigure, onDisconnect, isConnected }) => {
  const IconComponent = integration.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${integration.color} text-white`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <CardDescription className="text-sm">
                  {integration.description}
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={isConnected ? "bg-green-100 text-green-800" : ""}
            >
              {isConnected ? "Connected" : "Available"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Pricing: {integration.pricing}</span>
            <span>Setup: {integration.setupComplexity}</span>
          </div>
          
          <div className="flex space-x-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onConfigure(integration)}
                  className="flex-1"
                >
                  <CogIcon className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect(integration)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onConnect(integration)}
                className="w-full"
                size="sm"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Integration configuration modal
const IntegrationConfigModal = ({ integration, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({
    syncEnabled: false,
    syncFrequency: 'hourly',
    webhookUrl: '',
    notifications: true,
    autoSync: true
  });

  const handleSave = () => {
    onSave(integration.id, config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {integration?.name}</DialogTitle>
          <DialogDescription>
            Customize how this integration works with your CRM
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Sync</Label>
              <p className="text-sm text-gray-600">
                Automatically sync data from this integration
              </p>
            </div>
            <Switch
              checked={config.syncEnabled}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, syncEnabled: checked }))
              }
            />
          </div>
          
          {config.syncEnabled && (
            <div className="space-y-4">
              <div>
                <Label>Sync Frequency</Label>
                <Select
                  value={config.syncFrequency}
                  onValueChange={(value) => 
                    setConfig(prev => ({ ...prev, syncFrequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="30min">Every 30 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Webhook URL</Label>
                <Input
                  placeholder="https://your-app.com/webhooks/integration"
                  value={config.webhookUrl}
                  onChange={(e) => 
                    setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))
                  }
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications about sync status
              </p>
            </div>
            <Switch
              checked={config.notifications}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, notifications: checked }))
              }
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Integration stats component
const IntegrationStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CloudIcon className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold">{stats.avgResponseTime.toFixed(0)}ms</p>
            </div>
            <ClockIcon className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Integration Hub component
const IntegrationHub = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [integrationEngine] = useState(() => new IntegrationEngine());

  // Query for connected integrations
  const { data: connectedIntegrations = [], isLoading } = useQuery(
    'connected-integrations',
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return ['gmail', 'stripe', 'slack']; // Mock connected integrations
    }
  );

  // Connect integration mutation
  const connectMutation = useMutation(
    async ({ integration, credentials }) => {
      integrationEngine.registerIntegration(integration);
      return await integrationEngine.connectIntegration(integration.id, credentials);
    },
    {
      onSuccess: (data, variables) => {
        addNotification({
          type: 'success',
          title: 'Integration Connected',
          message: `${variables.integration.name} has been successfully connected.`
        });
        queryClient.invalidateQueries('connected-integrations');
      },
      onError: (error, variables) => {
        addNotification({
          type: 'error',
          title: 'Connection Failed',
          message: `Failed to connect ${variables.integration.name}: ${error.message}`
        });
      }
    }
  );

  // Disconnect integration mutation
  const disconnectMutation = useMutation(
    async (integrationId) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    {
      onSuccess: (data, integrationId) => {
        const integration = AVAILABLE_INTEGRATIONS.find(i => i.id === integrationId);
        addNotification({
          type: 'success',
          title: 'Integration Disconnected',
          message: `${integration?.name} has been disconnected.`
        });
        queryClient.invalidateQueries('connected-integrations');
      }
    }
  );

  // Filter integrations
  const filteredIntegrations = AVAILABLE_INTEGRATIONS.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle integration connection
  const handleConnect = (integration) => {
    // Simulate OAuth flow or API key setup
    const mockCredentials = {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      apiKey: 'mock_api_key'
    };
    
    connectMutation.mutate({ integration, credentials: mockCredentials });
  };

  // Handle integration configuration
  const handleConfigure = (integration) => {
    setSelectedIntegration(integration);
    setConfigModalOpen(true);
  };

  // Handle integration disconnection
  const handleDisconnect = (integration) => {
    disconnectMutation.mutate(integration.id);
  };

  // Save integration configuration
  const handleSaveConfig = (integrationId, config) => {
    addNotification({
      type: 'success',
      title: 'Configuration Saved',
      message: 'Integration settings have been updated.'
    });
  };

  // Get integration stats
  const stats = integrationEngine.getIntegrationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-gray-600">
            Connect and manage third-party integrations
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Custom Integration
        </Button>
      </div>

      {/* Stats */}
      <IntegrationStats stats={stats} />

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {INTEGRATION_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                <IconComponent className="h-4 w-4 mr-1" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              isConnected={connectedIntegrations.includes(integration.id)}
              onConnect={handleConnect}
              onConfigure={handleConfigure}
              onDisconnect={handleDisconnect}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Configuration Modal */}
      <IntegrationConfigModal
        integration={selectedIntegration}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={handleSaveConfig}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
};

export default IntegrationHub;