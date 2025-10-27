import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  BarChart2
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
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [connectingIntegration, setConnectingIntegration] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data) => base44.entities.Integration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success("Integration connected successfully");
      setShowConnectDialog(false);
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Integration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success("Integration settings updated");
      setShowSettingsDialog(false);
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id) => base44.entities.Integration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success("Integration disconnected");
    },
  });

  const handleConnect = (integrationType) => {
    const catalog = INTEGRATION_CATALOG.find(i => i.type === integrationType);
    setConnectingIntegration(catalog);
    setSelectedProvider(catalog.providers[0]);
    setShowConnectDialog(true);
  };

  const handleOAuthConnect = () => {
    const mockIntegration = {
      integration_type: connectingIntegration.type,
      provider: selectedProvider,
      user_email: currentUser?.email,
      organization_id: currentUser?.primary_organization_id,
      status: "Active",
      connected_email: currentUser?.email,
      sync_enabled: true,
      sync_direction: "TwoWay",
      last_sync_date: new Date().toISOString(),
      settings: {
        auto_create_activities: true,
        sync_past_days: 30,
        sync_future_days: 90,
        track_email_opens: true,
      },
      access_token: "mock_token_" + Math.random().toString(36),
      token_expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    createIntegrationMutation.mutate(mockIntegration);
  };

  const handleSync = (integrationId) => {
    toast.loading("Syncing...");
    setTimeout(() => {
      updateIntegrationMutation.mutate({
        id: integrationId,
        data: { last_sync_date: new Date().toISOString() }
      });
      toast.success("Sync completed");
    }, 2000);
  };

  const handleToggleSync = (integration) => {
    updateIntegrationMutation.mutate({
      id: integration.id,
      data: { sync_enabled: !integration.sync_enabled }
    });
  };

  const handleDisconnect = (integrationId) => {
    if (confirm("Are you sure you want to disconnect this integration?")) {
      deleteIntegrationMutation.mutate(integrationId);
    }
  };

  const getUserIntegration = (type) => {
    return integrations.find(i => 
      i.integration_type === type && 
      i.user_email === currentUser?.email &&
      i.status === "Active"
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-indigo-500" />
          Integrations Marketplace
        </h1>
        <p className="text-gray-600 mt-1">Connect 20+ tools and automate your workflow</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Available</p>
                <p className="text-2xl font-bold text-white">{INTEGRATION_CATALOG.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Connected</p>
                <p className="text-2xl font-bold text-white">
                  {integrations.filter(i => i.user_email === currentUser?.email && i.status === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Auto-Syncing</p>
                <p className="text-2xl font-bold text-white">
                  {integrations.filter(i => i.sync_enabled && i.status === 'Active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80">Categories</p>
                <p className="text-2xl font-bold text-white">10</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync
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
                  {connectingIntegration?.providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">What we'll access:</p>
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
            <Button onClick={handleOAuthConnect} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              Authorize & Connect
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