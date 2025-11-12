import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Server, 
  Plus, 
  Settings, 
  Key, 
  Globe, 
  Database,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  TestTube,
  Code,
  Activity,
  Zap,
  Shield,
  Link,
  Unlink
} from 'lucide-react';

const APIIntegrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});

  // Mock API integrations data
  const mockIntegrations = [
    {
      id: 'salesforce-api',
      name: 'Salesforce API',
      description: 'Sync leads, contacts, and opportunities with Salesforce',
      category: 'CRM',
      status: 'active',
      version: 'v54.0',
      baseUrl: 'https://your-instance.salesforce.com',
      authType: 'oauth2',
      lastSync: '2024-01-15T10:30:00Z',
      syncCount: 1247,
      errorCount: 3,
      config: {
        clientId: 'your_client_id',
        clientSecret: 'your_client_secret',
        redirectUri: 'https://your-app.com/callback',
        scope: 'api refresh_token'
      },
      endpoints: [
        { name: 'Get Leads', method: 'GET', path: '/services/data/v54.0/sobjects/Lead' },
        { name: 'Create Lead', method: 'POST', path: '/services/data/v54.0/sobjects/Lead' },
        { name: 'Update Lead', method: 'PATCH', path: '/services/data/v54.0/sobjects/Lead/{id}' }
      ]
    },
    {
      id: 'hubspot-api',
      name: 'HubSpot API',
      description: 'Integrate with HubSpot CRM and marketing tools',
      category: 'Marketing',
      status: 'active',
      version: 'v3',
      baseUrl: 'https://api.hubapi.com',
      authType: 'api_key',
      lastSync: '2024-01-15T09:15:00Z',
      syncCount: 892,
      errorCount: 0,
      config: {
        apiKey: 'your_hubspot_api_key'
      },
      endpoints: [
        { name: 'Get Contacts', method: 'GET', path: '/crm/v3/objects/contacts' },
        { name: 'Create Contact', method: 'POST', path: '/crm/v3/objects/contacts' },
        { name: 'Get Deals', method: 'GET', path: '/crm/v3/objects/deals' }
      ]
    },
    {
      id: 'mailchimp-api',
      name: 'Mailchimp API',
      description: 'Sync contacts and manage email campaigns',
      category: 'Email Marketing',
      status: 'error',
      version: 'v3.0',
      baseUrl: 'https://us1.api.mailchimp.com/3.0',
      authType: 'api_key',
      lastSync: '2024-01-14T16:45:00Z',
      syncCount: 456,
      errorCount: 23,
      config: {
        apiKey: 'your_mailchimp_api_key',
        server: 'us1'
      },
      endpoints: [
        { name: 'Get Lists', method: 'GET', path: '/lists' },
        { name: 'Add Member', method: 'POST', path: '/lists/{list_id}/members' },
        { name: 'Get Campaigns', method: 'GET', path: '/campaigns' }
      ]
    },
    {
      id: 'stripe-api',
      name: 'Stripe API',
      description: 'Process payments and manage subscriptions',
      category: 'Payments',
      status: 'inactive',
      version: '2023-10-16',
      baseUrl: 'https://api.stripe.com/v1',
      authType: 'bearer',
      lastSync: null,
      syncCount: 0,
      errorCount: 0,
      config: {
        secretKey: 'sk_test_...',
        publishableKey: 'pk_test_...'
      },
      endpoints: [
        { name: 'Create Customer', method: 'POST', path: '/customers' },
        { name: 'Create Payment Intent', method: 'POST', path: '/payment_intents' },
        { name: 'Get Invoices', method: 'GET', path: '/invoices' }
      ]
    },
    {
      id: 'google-calendar-api',
      name: 'Google Calendar API',
      description: 'Sync meetings and appointments',
      category: 'Calendar',
      status: 'active',
      version: 'v3',
      baseUrl: 'https://www.googleapis.com/calendar/v3',
      authType: 'oauth2',
      lastSync: '2024-01-15T08:20:00Z',
      syncCount: 234,
      errorCount: 1,
      config: {
        clientId: 'your_google_client_id',
        clientSecret: 'your_google_client_secret',
        redirectUri: 'https://your-app.com/google/callback'
      },
      endpoints: [
        { name: 'List Events', method: 'GET', path: '/calendars/{calendarId}/events' },
        { name: 'Create Event', method: 'POST', path: '/calendars/{calendarId}/events' },
        { name: 'Update Event', method: 'PUT', path: '/calendars/{calendarId}/events/{eventId}' }
      ]
    }
  ];

  const categories = ['All', 'CRM', 'Marketing', 'Email Marketing', 'Payments', 'Calendar', 'Analytics'];
  const authTypes = ['api_key', 'oauth2', 'bearer', 'basic'];

  useEffect(() => {
    setIntegrations(mockIntegrations);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      pending: 'outline'
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleToggleIntegration = (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: integration.status === 'active' ? 'inactive' : 'active' }
        : integration
    ));
  };

  const handleConfigureIntegration = (integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleTestIntegration = (integration) => {
    setSelectedIntegration(integration);
    setTestDialogOpen(true);
  };

  const toggleSecretVisibility = (integrationId, field) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${integrationId}-${field}`]: !prev[`${integrationId}-${field}`]
    }));
  };

  const maskSecret = (secret) => {
    if (!secret) return '';
    return secret.length > 8 ? `${secret.substring(0, 4)}${'*'.repeat(secret.length - 8)}${secret.substring(secret.length - 4)}` : '*'.repeat(secret.length);
  };

  const IntegrationCard = ({ integration }) => {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                integration.status === 'active' ? 'bg-green-100 text-green-600' :
                integration.status === 'error' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <Server className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(integration.status)}
                  {getStatusIcon(integration.status)}
                  <Badge variant="outline" className="text-xs">
                    {integration.version}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleIntegration(integration.id)}
              >
                {integration.status === 'active' ? <Unlink className="h-4 w-4" /> : <Link className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleConfigureIntegration(integration)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTestIntegration(integration)}
              >
                <TestTube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {integration.description}
          </CardDescription>
          
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Base URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                  {integration.baseUrl}
                </code>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(integration.baseUrl)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <p className="font-medium">{integration.category}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Auth Type</Label>
                <p className="font-medium capitalize">{integration.authType}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Syncs</Label>
                <p className="font-medium">{integration.syncCount}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Errors</Label>
                <p className="font-medium text-red-600">{integration.errorCount}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Sync</Label>
                <p className="font-medium">
                  {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Available Endpoints</Label>
              <div className="mt-1 space-y-1">
                {integration.endpoints.slice(0, 3).map((endpoint, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {endpoint.method}
                    </Badge>
                    <code className="text-xs">{endpoint.path}</code>
                  </div>
                ))}
                {integration.endpoints.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{integration.endpoints.length - 3} more endpoints
                  </p>
                )}
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
      if (selectedIntegration) {
        setIntegrations(prev => prev.map(integration => 
          integration.id === selectedIntegration.id 
            ? { ...integration, config }
            : integration
        ));
        setConfigDialogOpen(false);
      }
    };

    if (!selectedIntegration) return null;

    return (
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration.name}</DialogTitle>
            <DialogDescription>
              Set up authentication and configuration for {selectedIntegration.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Secure Configuration</p>
                <p className="text-blue-700">Your API credentials are encrypted and stored securely.</p>
              </div>
            </div>
            
            {Object.entries(selectedIntegration.config).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize flex items-center space-x-2">
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? (
                    <Key className="h-3 w-3 text-muted-foreground" />
                  ) : null}
                </Label>
                <div className="relative">
                  <Input
                    id={key}
                    type={
                      (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) && 
                      !showSecrets[`${selectedIntegration.id}-${key}`] 
                        ? 'password' 
                        : 'text'
                    }
                    value={config[key] || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter ${key}`}
                  />
                  {(key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility(selectedIntegration.id, key)}
                    >
                      {showSecrets[`${selectedIntegration.id}-${key}`] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={selectedIntegration.baseUrl}
                readOnly
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Authentication Type</Label>
              <Select value={selectedIntegration.authType} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {authTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const TestDialog = () => {
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);

    const handleTest = async () => {
      setTesting(true);
      // Simulate API test
      setTimeout(() => {
        setTestResult({
          success: Math.random() > 0.3,
          responseTime: Math.floor(Math.random() * 1000) + 100,
          statusCode: Math.random() > 0.3 ? 200 : 401,
          message: Math.random() > 0.3 ? 'Connection successful' : 'Authentication failed'
        });
        setTesting(false);
      }, 2000);
    };

    if (!selectedIntegration) return null;

    return (
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Test {selectedIntegration.name}</DialogTitle>
            <DialogDescription>
              Test the connection and authentication for {selectedIntegration.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Test Endpoint</Label>
              <Select defaultValue={selectedIntegration.endpoints[0]?.name}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedIntegration.endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.name} value={endpoint.name}>
                      {endpoint.method} {endpoint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {testResult.message}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p>Status Code: {testResult.statusCode}</p>
                  <p>Response Time: {testResult.responseTime}ms</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTest} disabled={testing}>
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
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
          <h2 className="text-3xl font-bold tracking-tight">API Integrations</h2>
          <p className="text-muted-foreground">
            Manage third-party API connections and configurations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
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
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Syncs</p>
                <p className="text-2xl font-bold">{integrations.reduce((sum, i) => sum + i.syncCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{integrations.reduce((sum, i) => sum + i.errorCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Endpoints</p>
                <p className="text-2xl font-bold">{integrations.reduce((sum, i) => sum + i.endpoints.length, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-12">
          <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No API integrations configured</h3>
          <p className="text-muted-foreground mb-4">
            Add your first API integration to start syncing data
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      )}

      <ConfigurationDialog />
      <TestDialog />
    </div>
  );
};

export default APIIntegrations;