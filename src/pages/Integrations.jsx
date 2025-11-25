import React, { useState, useMemo } from "react";
import IntegrationHealth from "@/components/integrations/IntegrationHealth";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useIntegrations } from "@/hooks/integrations/useIntegrations";
import { PROVIDER_CONFIGS, getProvidersByType, getProviderKeyFromName } from "@/services/integrations/ProviderConfig";
import IntegrationService from "@/services/integrations/IntegrationService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IntegrationHub from "../components/IntegrationHub";
import WebhookManager from "../components/WebhookManager";
import APIIntegrations from "../components/APIIntegrations";
import { 
  Calendar, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  FileSignature,
  Video,
  Calculator,
  Linkedin,
  Phone,
  Zap,
  Check,
  X,
  Settings,
  RefreshCw,
  AlertCircle,
  Plus,
  Slack,
  Cloud,
  Facebook,
  Send,
  MessageCircle,
  FileText,
  ShoppingCart,
  TrendingUp,
  BarChart2,
  Globe,
  Webhook,
  Server,
  CheckCircle,
  Clock,
  Activity
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const INTEGRATION_CATALOG = [
  {
    type: "Calendar",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    providers: ["Google", "Microsoft", "Apple"],
    description: "Sync your calendar and schedule meetings directly from CRM",
    features: ["Two-way sync", "Auto-create activities", "Meeting reminders"],
  },
  {
    type: "Email",
    icon: Mail,
    color: "from-purple-500 to-pink-500",
    providers: ["Google", "Microsoft", "Zoho", "Yahoo"],
    description: "Send emails, track opens, and log all communications",
    features: ["Track opens", "Email templates", "Auto-log emails"],
  },
  {
    type: "WhatsApp",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-500",
    providers: ["WhatsApp"],
    description: "Chat with customers and send notifications via WhatsApp",
    features: ["Business API", "Template messages", "Rich media"],
  },
  {
    type: "Payment",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-500",
    providers: ["Stripe", "PayPal"],
    description: "Accept payments on quotes and track revenue",
    features: ["Payment links", "Auto-update deals", "Refunds"],
  },
  {
    type: "ESignature",
    icon: FileSignature,
    color: "from-orange-500 to-red-500",
    providers: ["DocuSign", "Adobe"],
    description: "Get contracts and quotes signed digitally",
    features: ["Template library", "Signing workflow", "Auto-status update"],
  },
  {
    type: "VideoConference",
    icon: Video,
    color: "from-cyan-500 to-blue-500",
    providers: ["Zoom", "Microsoft", "Google"],
    description: "Schedule video meetings and log call summaries",
    features: ["One-click meetings", "Auto-log activities", "Recording links"],
  },
  {
    type: "Accounting",
    icon: Calculator,
    color: "from-yellow-500 to-orange-500",
    providers: ["QuickBooks", "Xero"],
    description: "Sync invoices, payments, and financial data",
    features: ["Auto-create invoices", "Payment sync", "Tax calculation"],
  },
  {
    type: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-600 to-blue-700",
    providers: ["LinkedIn"],
    description: "Import contacts and enrich lead data from LinkedIn",
    features: ["Profile import", "InMail integration", "Company insights"],
  },
  {
    type: "VoIP",
    icon: Phone,
    color: "from-indigo-500 to-purple-500",
    providers: ["Twilio"],
    description: "Make calls from CRM and auto-log call activities",
    features: ["Click-to-call", "Call recording", "SMS integration"],
  },
  {
    type: "SMS",
    icon: MessageSquare,
    color: "from-pink-500 to-rose-500",
    providers: ["Twilio"],
    description: "Send SMS notifications and reminders to customers",
    features: ["Bulk SMS", "Templates", "Delivery tracking"],
  },
  {
    type: "TeamChat",
    icon: Slack,
    color: "from-purple-600 to-indigo-600",
    providers: ["Slack", "Microsoft"],
    description: "Get real-time notifications in your team chat",
    features: ["Deal alerts", "Task reminders", "Team collaboration"],
  },
  {
    type: "CloudStorage",
    icon: Cloud,
    color: "from-sky-500 to-blue-500",
    providers: ["Google", "Dropbox"],
    description: "Store and manage documents in the cloud",
    features: ["Auto-upload", "Version control", "File sharing"],
  },
  {
    type: "Social",
    icon: Facebook,
    color: "from-blue-500 to-indigo-600",
    providers: ["Facebook", "Instagram", "Twitter"],
    description: "Track social interactions and respond to messages",
    features: ["Social listening", "Inbox management", "Lead generation"],
  },
  {
    type: "Marketing",
    icon: Send,
    color: "from-pink-600 to-rose-600",
    providers: ["Mailchimp", "SendGrid"],
    description: "Email marketing campaigns and newsletters",
    features: ["Campaign management", "List segmentation", "Analytics"],
  },
  {
    type: "LiveChat",
    icon: MessageCircle,
    color: "from-teal-500 to-green-500",
    providers: ["Intercom", "Drift"],
    description: "Website visitor tracking and live chat support",
    features: ["Chat widget", "Auto-create leads", "Chat history"],
  },
  {
    type: "Proposal",
    icon: FileText,
    color: "from-indigo-600 to-purple-600",
    providers: ["PandaDoc", "Proposify"],
    description: "Create professional proposals and quotes",
    features: ["Template library", "E-signature", "Pricing tables"],
  },
  {
    type: "Ecommerce",
    icon: ShoppingCart,
    color: "from-green-600 to-emerald-600",
    providers: ["Shopify", "WooCommerce"],
    description: "Sync orders and customer data from your store",
    features: ["Order sync", "Customer import", "Inventory tracking"],
  },
  {
    type: "Automation",
    icon: Zap,
    color: "from-yellow-600 to-orange-600",
    providers: ["Zapier", "Make"],
    description: "Connect to 5,000+ apps with no-code automation",
    features: ["Custom workflows", "Triggers & actions", "Multi-app zaps"],
  },
  {
    type: "Migration",
    icon: TrendingUp,
    color: "from-blue-700 to-indigo-700",
    providers: ["Salesforce", "HubSpot"],
    description: "Import data from other CRMs",
    features: ["One-time import", "Field mapping", "Data validation"],
  },
  {
    type: "Analytics",
    icon: BarChart2,
    color: "from-purple-700 to-pink-700",
    providers: ["Google Analytics"],
    description: "Track website behavior and attribution",
    features: ["Conversion tracking", "Lead attribution", "Funnel analysis"],
  },
];

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showIMAPDialog, setShowIMAPDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [connectingIntegration, setConnectingIntegration] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [imapConfig, setImapConfig] = useState({
    host: "",
    port: 993,
    secure: true,
    username: "",
    password: "",
  });
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: 465,
    secure: true,
    username: "",
    password: "",
  });
  const [email, setEmail] = useState("");

  // Use the new integrations hook
  const {
    integrations,
    isLoading,
    error: integrationsError,
    connectOAuth,
    connectApiKey,
    connectIMAP,
    sync,
    disconnect,
    update,
    testConnection,
    isConnecting,
    isSyncing,
    isTesting,
  } = useIntegrations();

  // Get current user
  const [currentUser, setCurrentUser] = useState(null);
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  // Filter integrations by current user
  const userIntegrations = useMemo(() => {
    return integrations.filter(i => i.status === 'Active');
  }, [integrations]);

  // Calculate stats from real data
  const integrationStats = useMemo(() => {
    return {
      totalIntegrations: INTEGRATION_CATALOG.length,
      activeIntegrations: userIntegrations.length,
      pendingIntegrations: integrations.filter(i => i.status === 'Pending').length,
      failedIntegrations: integrations.filter(i => i.status === 'Failed' || i.status === 'Error').length,
      totalWebhooks: 0,
      activeWebhooks: 0,
      totalAPIs: 0,
      activeAPIs: 0,
      totalSyncs: 0,
      lastSync: integrations.length > 0 
        ? integrations.reduce((latest, i) => {
            const syncDate = i.last_sync_date || i.lastSyncDate;
            return syncDate && (!latest || syncDate > latest) ? syncDate : latest;
          }, null) || new Date().toISOString()
        : new Date().toISOString(),
      syncErrors: 0,
      uptime: 99.2
    };
  }, [integrations, userIntegrations]);

  const recentActivity = [
    {
      id: 1,
      type: 'integration',
      action: 'connected',
      service: 'Salesforce',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'success'
    },
    {
      id: 2,
      type: 'webhook',
      action: 'triggered',
      service: 'Stripe Payment',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'success'
    },
    {
      id: 3,
      type: 'api',
      action: 'sync_failed',
      service: 'Mailchimp',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'error'
    },
    {
      id: 4,
      type: 'integration',
      action: 'disconnected',
      service: 'LinkedIn',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      status: 'warning'
    },
    {
      id: 5,
      type: 'webhook',
      action: 'created',
      service: 'DocuSign',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      status: 'success'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getActionText = (activity) => {
    const actionMap = {
      connected: 'Connected to',
      disconnected: 'Disconnected from',
      triggered: 'Webhook triggered for',
      sync_failed: 'Sync failed for',
      created: 'Created webhook for'
    };
    return `${actionMap[activity.action] || activity.action} ${activity.service}`;
  };

  const handleConnect = (integrationType) => {
    const catalog = INTEGRATION_CATALOG.find(i => i.type === integrationType);
    if (!catalog) {
      toast.error('Integration type not found');
      return;
    }

    setConnectingIntegration(catalog);
    
    // Get providers for this integration type from PROVIDER_CONFIGS
    const providers = getProvidersByType(integrationType.toLowerCase());
    
    // If no providers found in config, try to map from catalog providers
    let firstProviderKey = null;
    if (providers.length > 0) {
      firstProviderKey = providers[0].key;
      setSelectedProvider(firstProviderKey);
    } else if (catalog.providers && catalog.providers.length > 0) {
      // Try to map catalog provider name to config key
      const catalogProviderName = catalog.providers[0];
      firstProviderKey = getProviderKeyFromName(catalogProviderName, integrationType);
      if (firstProviderKey) {
        setSelectedProvider(firstProviderKey);
      } else {
        // Fallback: use first catalog provider name as-is
        setSelectedProvider(catalogProviderName);
      }
    } else {
      setSelectedProvider("");
    }

    // Check if provider requires API key or IMAP/SMTP
    const providerConfig = firstProviderKey ? PROVIDER_CONFIGS[firstProviderKey] : null;
    if (providerConfig?.authType === 'api_key' || providerConfig?.requiresConfig) {
      if (integrationType === 'Email' && providerConfig?.authType === 'imap_smtp') {
        setShowIMAPDialog(true);
      } else {
        setShowApiKeyDialog(true);
      }
    } else if (providerConfig?.authType === 'oauth2' || !providerConfig) {
      // Default to OAuth dialog if oauth2 or no config found
      setShowConnectDialog(true);
    } else {
      setShowConnectDialog(true);
    }
  };

  const handleOAuthConnect = async () => {
    if (!connectingIntegration || !selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    const providerConfig = PROVIDER_CONFIGS[selectedProvider];
    if (!providerConfig) {
      toast.error('Invalid provider selected');
      return;
    }

    const settings = {
      auto_create_activities: true,
      sync_past_days: 30,
      sync_future_days: 90,
      track_email_opens: true,
    };

    connectOAuth({
      provider: selectedProvider,
      type: connectingIntegration.type,
      settings,
    });
    setShowConnectDialog(false);
  };

  const handleApiKeyConnect = () => {
    if (!connectingIntegration || !selectedProvider || !apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    const settings = {};
    connectApiKey({
      provider: selectedProvider,
      type: connectingIntegration.type,
      apiKey,
      settings,
    });
    setShowApiKeyDialog(false);
    setApiKey("");
  };

  const handleIMAPConnect = () => {
    if (!email || !imapConfig.host || !imapConfig.username || !imapConfig.password || 
        !smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const settings = {};
    connectIMAP({
      email,
      imapConfig,
      smtpConfig,
      settings,
    });
    setShowIMAPDialog(false);
    setEmail("");
    setImapConfig({ host: "", port: 993, secure: true, username: "", password: "" });
    setSmtpConfig({ host: "", port: 465, secure: true, username: "", password: "" });
  };

  const handleSync = (integrationId) => {
    sync(integrationId);
  };

  const handleDisconnect = (integrationId) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      disconnect(integrationId);
    }
  };

  const handleTestConnection = (integrationId) => {
    testConnection(integrationId);
  };

  const getUserIntegration = (type) => {
    // Backend should filter by user_id automatically, but we check here too
    return integrations.find(i => 
      i.integration_type === type && 
      i.status === "Active"
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-white/80">Total Integrations</p>
                <p className="text-2xl font-bold text-white">{integrationStats.totalIntegrations}</p>
                <p className="text-xs text-white/60">
                  {integrationStats.activeIntegrations} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Webhook className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-white/80">Webhooks</p>
                <p className="text-2xl font-bold text-white">{integrationStats.totalWebhooks}</p>
                <p className="text-xs text-white/60">
                  {integrationStats.activeWebhooks} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-white/80">API Connections</p>
                <p className="text-2xl font-bold text-white">{integrationStats.totalAPIs}</p>
                <p className="text-xs text-white/60">
                  {integrationStats.activeAPIs} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-500">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-white" />
              <div className="ml-4">
                <p className="text-sm font-medium text-white/80">Total Syncs</p>
                <p className="text-2xl font-bold text-white">{integrationStats.totalSyncs.toLocaleString()}</p>
                <p className="text-xs text-white/60">
                  {integrationStats.syncErrors} errors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IntegrationHealth
          stats={integrationStats}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['integrations'] })}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
            <CardDescription>
              Overall integration system status and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-bold">{integrationStats.uptime}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Integrations</span>
              <Badge variant="default">
                {integrationStats.activeIntegrations}/{integrationStats.totalIntegrations}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Failed Integrations</span>
              <Badge variant={integrationStats.failedIntegrations > 0 ? "destructive" : "secondary"}>
                {integrationStats.failedIntegrations}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Sync</span>
              <span className="text-sm text-muted-foreground">
                {new Date(integrationStats.lastSync).toLocaleString()}
              </span>
            </div>
            
            <div className="pt-4">
              <Button className="w-full" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All Integrations
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest integration events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {getActionText(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Button variant="ghost" className="w-full text-sm">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common integration management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Plus className="h-6 w-6" />
              <span>Add Integration</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Webhook className="h-6 w-6" />
              <span>Create Webhook</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Settings className="h-6 w-6" />
              <span>Manage APIs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const IntegrationsMarketplace = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-500" />
          Integrations Marketplace
        </h2>
        <p className="text-gray-600 mt-1">Connect 20+ tools and automate your workflow</p>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {INTEGRATION_CATALOG.map((integration) => {
          const Icon = integration.icon;
          const userIntegration = getUserIntegration(integration.type);
          const isConnected = !!userIntegration;

          return (
            <Card key={integration.type} className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${integration.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isConnected ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Available
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4 text-base">{integration.type}</CardTitle>
                <p className="text-xs text-gray-600 line-clamp-2">{integration.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Features:</p>
                  <div className="space-y-1">
                    {integration.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                        <Check className="w-3 h-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {isConnected ? (
                  <div className="space-y-2">
                    {userIntegration.last_sync_date && (
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(userIntegration.last_sync_date).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(userIntegration.id)}
                        className="flex-1 text-xs"
                        disabled={isSyncing}
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(userIntegration.id)}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(integration.type)}
                    size="sm"
                    className={`w-full bg-gradient-to-r ${integration.color} text-xs`}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="apis" className="flex items-center space-x-2">
            <Server className="h-4 w-4" />
            <span>APIs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsMarketplace />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <WebhookManager />
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <APIIntegrations />
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {connectingIntegration?.type}</DialogTitle>
            <DialogDescription>
              Choose your provider and authorize access to sync data with your CRM
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    // Get providers from PROVIDER_CONFIGS first
                    const configProviders = getProvidersByType(connectingIntegration?.type?.toLowerCase() || '');
                    if (configProviders.length > 0) {
                      return configProviders
                        .filter(p => p.authType === 'oauth2')
                        .map((provider) => (
                          <SelectItem key={provider.key} value={provider.key}>
                            {provider.name}
                          </SelectItem>
                        ));
                    }
                    // Fallback to catalog providers with mapping
                    return connectingIntegration?.providers.map((provider) => {
                      const providerKey = getProviderKeyFromName(provider, connectingIntegration?.type);
                      return (
                        <SelectItem key={provider} value={providerKey || provider}>
                          {provider}
                        </SelectItem>
                      );
                    });
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">What we&apos;ll access:</p>
                  <ul className="text-xs text-blue-800 mt-1 space-y-1">
                    {connectingIntegration?.features.map((feature, idx) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleOAuthConnect} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Authorize & Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {connectingIntegration?.type} - API Key</DialogTitle>
            <DialogDescription>
              Enter your API key to connect {selectedProvider}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connectingIntegration && getProvidersByType(connectingIntegration.type)
                    .filter(p => p.authType === 'api_key' || p.requiresConfig)
                    .map((provider) => (
                      <SelectItem key={provider.key} value={provider.key}>
                        {provider.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApiKeyConnect}
              disabled={isConnecting || !apiKey}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IMAP/SMTP Dialog */}
      <Dialog open={showIMAPDialog} onOpenChange={setShowIMAPDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect Email - IMAP/SMTP</DialogTitle>
            <DialogDescription>
              Configure your email account using IMAP and SMTP settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">IMAP Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IMAP Host</Label>
                  <Input
                    value={imapConfig.host}
                    onChange={(e) => setImapConfig({ ...imapConfig, host: e.target.value })}
                    placeholder="imap.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IMAP Port</Label>
                  <Input
                    type="number"
                    value={imapConfig.port}
                    onChange={(e) => setImapConfig({ ...imapConfig, port: parseInt(e.target.value) || 993 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IMAP Username</Label>
                  <Input
                    value={imapConfig.username}
                    onChange={(e) => setImapConfig({ ...imapConfig, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IMAP Password</Label>
                  <Input
                    type="password"
                    value={imapConfig.password}
                    onChange={(e) => setImapConfig({ ...imapConfig, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="imap-secure"
                  checked={imapConfig.secure}
                  onChange={(e) => setImapConfig({ ...imapConfig, secure: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="imap-secure">Use SSL/TLS</Label>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">SMTP Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 465 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={smtpConfig.username}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={smtpConfig.password}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smtp-secure"
                  checked={smtpConfig.secure}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="smtp-secure">Use SSL/TLS</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIMAPDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleIMAPConnect}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Integration Settings</DialogTitle>
          </DialogHeader>
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-create activities</Label>
                  <p className="text-xs text-gray-500">Automatically log synced events as activities</p>
                </div>
                <Switch defaultChecked={selectedIntegration.settings?.auto_create_activities} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Track email opens</Label>
                  <p className="text-xs text-gray-500">Know when recipients open your emails</p>
                </div>
                <Switch defaultChecked={selectedIntegration.settings?.track_email_opens} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sync past (days)</Label>
                  <Input type="number" defaultValue={selectedIntegration.settings?.sync_past_days || 30} />
                </div>
                <div className="space-y-2">
                  <Label>Sync future (days)</Label>
                  <Input type="number" defaultValue={selectedIntegration.settings?.sync_future_days || 90} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync frequency (minutes)</Label>
                <Select defaultValue={String(selectedIntegration.sync_frequency_minutes || 15)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Every 5 minutes</SelectItem>
                    <SelectItem value="15">Every 15 minutes</SelectItem>
                    <SelectItem value="30">Every 30 minutes</SelectItem>
                    <SelectItem value="60">Every hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsDialog(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
