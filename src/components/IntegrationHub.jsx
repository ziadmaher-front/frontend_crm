import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { 
  Plug, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Phone, 
  FileText, 
  DollarSign, 
  Users, 
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Zap,
  Shield,
  Webhook
} from 'lucide-react';

const IntegrationHub = () => {
  const [integrations, setIntegrations] = useState([]);
  const [activeIntegrations, setActiveIntegrations] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Mock integrations data
  const mockIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      category: 'email',
      description: 'Sync emails and create leads from Gmail',
      icon: Mail,
      status: 'active',
      features: ['Email sync', 'Lead creation', 'Contact import'],
      pricing: 'Free',
      setupComplexity: 'Easy',
      config: {
        clientId: '',
        clientSecret: '',
        redirectUri: ''
      }
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      category: 'email',
      description: 'Integrate with Outlook for email and calendar sync',
      icon: Mail,
      status: 'available',
      features: ['Email sync', 'Calendar sync', 'Contact sync'],
      pricing: 'Free',
      setupComplexity: 'Easy'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      category: 'calendar',
      description: 'Sync meetings and appointments with Google Calendar',
      icon: Calendar,
      status: 'active',
      features: ['Meeting sync', 'Appointment scheduling', 'Reminder notifications'],
      pricing: 'Free',
      setupComplexity: 'Easy'
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Get CRM notifications and updates in Slack',
      icon: MessageSquare,
      status: 'available',
      features: ['Deal notifications', 'Lead alerts', 'Team collaboration'],
      pricing: 'Free',
      setupComplexity: 'Medium'
    },
    {
      id: 'whatsapp-business',
      name: 'WhatsApp Business',
      category: 'communication',
      description: 'Send messages and manage conversations',
      icon: MessageSquare,
      status: 'active',
      features: ['Message sending', 'Template messages', 'Contact sync'],
      pricing: '$0.05/message',
      setupComplexity: 'Medium'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'communication',
      description: 'Voice calls and SMS integration',
      icon: Phone,
      status: 'available',
      features: ['Voice calls', 'SMS sending', 'Call recording'],
      pricing: '$0.01/minute',
      setupComplexity: 'Hard'
    },
    {
      id: 'docusign',
      name: 'DocuSign',
      category: 'documents',
      description: 'Electronic signature and document management',
      icon: FileText,
      status: 'available',
      features: ['E-signatures', 'Document templates', 'Status tracking'],
      pricing: '$10/month',
      setupComplexity: 'Medium'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      description: 'Process payments and manage subscriptions',
      icon: DollarSign,
      status: 'available',
      features: ['Payment processing', 'Subscription management', 'Invoice generation'],
      pricing: '2.9% + $0.30',
      setupComplexity: 'Medium'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payments',
      description: 'Accept PayPal payments and manage transactions',
      icon: DollarSign,
      status: 'available',
      features: ['Payment acceptance', 'Transaction tracking', 'Refund management'],
      pricing: '2.9% + $0.30',
      setupComplexity: 'Easy'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Sales Navigator',
      category: 'social',
      description: 'Import leads and contacts from LinkedIn',
      icon: Users,
      status: 'available',
      features: ['Lead import', 'Contact enrichment', 'Social insights'],
      pricing: '$79.99/month',
      setupComplexity: 'Medium'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'analytics',
      description: 'Track website visitors and lead sources',
      icon: BarChart3,
      status: 'available',
      features: ['Visitor tracking', 'Lead source analysis', 'Conversion tracking'],
      pricing: 'Free',
      setupComplexity: 'Medium'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      description: 'Connect with 5000+ apps through Zapier',
      icon: Zap,
      status: 'active',
      features: ['Workflow automation', 'Data sync', 'Trigger actions'],
      pricing: '$19.99/month',
      setupComplexity: 'Easy'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Integrations', icon: Plug },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'communication', name: 'Communication', icon: MessageSquare },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'payments', name: 'Payments', icon: DollarSign },
    { id: 'social', name: 'Social', icon: Users },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'automation', name: 'Automation', icon: Zap }
  ];

  useEffect(() => {
    setIntegrations(mockIntegrations);
    setActiveIntegrations(new Set(mockIntegrations.filter(i => i.status === 'active').map(i => i.id)));
  }, []);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      available: 'secondary',
      error: 'destructive',
      pending: 'outline'
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleToggleIntegration = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration.status === 'active') {
      // Disconnect
      setActiveIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId ? { ...i, status: 'available' } : i
      ));
    } else {
      // Connect
      setSelectedIntegration(integration);
      setConfigDialogOpen(true);
    }
  };

  const handleConfigureIntegration = (config) => {
    if (selectedIntegration) {
      setActiveIntegrations(prev => new Set([...prev, selectedIntegration.id]));
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id ? { ...i, status: 'active', config } : i
      ));
      setConfigDialogOpen(false);
      setSelectedIntegration(null);
    }
  };

  const IntegrationCard = ({ integration }) => {
    const Icon = integration.icon;
    const isActive = integration.status === 'active';

    return (
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(integration.status)}
                  {getStatusIcon(integration.status)}
                </div>
              </div>
            </div>
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              onClick={() => handleToggleIntegration(integration.id)}
            >
              {isActive ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {integration.description}
          </CardDescription>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Features</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {integration.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Pricing</Label>
                <p className="font-medium">{integration.pricing}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Setup</Label>
                <p className="font-medium">{integration.setupComplexity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ConfigurationDialog = () => {
    const [config, setConfig] = useState({});

    useEffect(() => {
      if (selectedIntegration?.config) {
        setConfig(selectedIntegration.config);
      }
    }, [selectedIntegration]);

    const handleSave = () => {
      handleConfigureIntegration(config);
    };

    if (!selectedIntegration) return null;

    return (
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
            <DialogDescription>
              Set up your {selectedIntegration.name} integration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedIntegration.config && Object.keys(selectedIntegration.config).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <Input
                  id={key}
                  value={config[key] || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`Enter ${key}`}
                />
              </div>
            ))}
            
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Secure Connection</p>
                <p className="text-blue-700">Your credentials are encrypted and stored securely.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Connect Integration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">
            Connect your CRM with third-party services and tools
          </p>
        </div>
        <Button variant="outline">
          <Webhook className="h-4 w-4 mr-2" />
          Manage Webhooks
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeIntegrations.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Plug className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Automations</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Data Synced</p>
                <p className="text-2xl font-bold">1.2K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-9">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No integrations found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      <ConfigurationDialog />
    </div>
  );
};

export default IntegrationHub;