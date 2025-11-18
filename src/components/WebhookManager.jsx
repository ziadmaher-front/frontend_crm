import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Webhook, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  Code,
  Send,
  RefreshCw,
  Filter,
  Search,
  Download,
  Upload,
  Globe,
  Lock,
  Unlock,
  Key,
  Database,
  Zap,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Building,
  DollarSign,
  BarChart3
} from 'lucide-react';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('webhooks');
  const [signingSecret, setSigningSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  // Generate a secure signing secret
  const generateSigningSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Initialize signing secret from environment or generate new one
  useEffect(() => {
    const envSecret = import.meta.env.VITE_WEBHOOK_SIGNING_SECRET;
    if (envSecret) {
      setSigningSecret(envSecret);
    } else {
      // Generate a new secret if none exists
      setSigningSecret(generateSigningSecret());
    }
  }, []);

  // Sample webhook data
  const sampleWebhooks = [
    {
      id: 1,
      name: 'Lead Created Notification',
      url: 'https://api.example.com/webhooks/lead-created',
      method: 'POST',
      events: ['lead.created', 'lead.updated'],
      status: 'active',
      lastTriggered: '2024-01-15 10:30 AM',
      successRate: 98.5,
      totalCalls: 1247,
      failedCalls: 18,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ***hidden***'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 3,
        backoffStrategy: 'exponential'
      },
      timeout: 30,
      description: 'Sends notifications when leads are created or updated'
    },
    {
      id: 2,
      name: 'Deal Stage Change',
      url: 'https://crm.company.com/api/deal-updates',
      method: 'POST',
      events: ['deal.stage_changed', 'deal.won', 'deal.lost'],
      status: 'active',
      lastTriggered: '2024-01-15 09:45 AM',
      successRate: 95.2,
      totalCalls: 856,
      failedCalls: 41,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': '***hidden***'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 5,
        backoffStrategy: 'linear'
      },
      timeout: 45,
      description: 'Triggers when deal stages change or deals are closed'
    },
    {
      id: 3,
      name: 'Customer Support Ticket',
      url: 'https://support.helpdesk.com/webhooks/ticket',
      method: 'POST',
      events: ['contact.created', 'activity.created'],
      status: 'paused',
      lastTriggered: '2024-01-14 3:20 PM',
      successRate: 89.7,
      totalCalls: 432,
      failedCalls: 45,
      headers: {
        'Content-Type': 'application/json'
      },
      retryPolicy: {
        enabled: false,
        maxRetries: 1,
        backoffStrategy: 'none'
      },
      timeout: 20,
      description: 'Creates support tickets for new contacts and activities'
    },
    {
      id: 4,
      name: 'Slack Notifications',
      url: 'https://example.com/webhooks/slack/placeholder',
      method: 'POST',
      events: ['deal.won', 'lead.qualified'],
      status: 'error',
      lastTriggered: '2024-01-15 8:15 AM',
      successRate: 76.3,
      totalCalls: 234,
      failedCalls: 55,
      headers: {
        'Content-Type': 'application/json'
      },
      retryPolicy: {
        enabled: true,
        maxRetries: 2,
        backoffStrategy: 'fixed'
      },
      timeout: 15,
      description: 'Sends Slack notifications for important events'
    }
  ];

  // Sample webhook logs
  const sampleLogs = [
    {
      id: 1,
      webhookId: 1,
      event: 'lead.created',
      status: 'success',
      statusCode: 200,
      timestamp: '2024-01-15 10:30:15',
      duration: 245,
      payload: {
        event: 'lead.created',
        data: {
          id: 123,
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp'
        }
      },
      response: {
        status: 'received',
        message: 'Webhook processed successfully'
      }
    },
    {
      id: 2,
      webhookId: 2,
      event: 'deal.stage_changed',
      status: 'success',
      statusCode: 200,
      timestamp: '2024-01-15 09:45:32',
      duration: 189,
      payload: {
        event: 'deal.stage_changed',
        data: {
          id: 456,
          name: 'Enterprise Deal',
          stage: 'negotiation',
          value: 50000
        }
      },
      response: {
        status: 'processed',
        id: 'webhook_789'
      }
    },
    {
      id: 3,
      webhookId: 4,
      event: 'deal.won',
      status: 'failed',
      statusCode: 500,
      timestamp: '2024-01-15 08:15:22',
      duration: 5000,
      payload: {
        event: 'deal.won',
        data: {
          id: 789,
          name: 'Big Sale',
          value: 100000
        }
      },
      response: {
        error: 'Internal Server Error',
        message: 'Service temporarily unavailable'
      }
    }
  ];

  useEffect(() => {
    setWebhooks(sampleWebhooks);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventIcon = (event) => {
    if (event.includes('lead')) return <User className="h-4 w-4" />;
    if (event.includes('deal')) return <DollarSign className="h-4 w-4" />;
    if (event.includes('contact')) return <Building className="h-4 w-4" />;
    if (event.includes('activity')) return <Activity className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const handleToggleWebhook = (id) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'paused' : 'active' }
        : webhook
    ));
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
  };

  const WebhookCard = ({ webhook }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">{webhook.name}</h3>
              <p className="text-sm text-gray-500 truncate max-w-xs">{webhook.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(webhook.status)}
            <Badge variant="outline" className={getStatusColor(webhook.status)}>
              {webhook.status}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">{webhook.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {webhook.events.map((event, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {getEventIcon(event)}
              <span className="ml-1">{event}</span>
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">Success Rate</p>
            <p className="font-semibold text-green-600">{webhook.successRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">Total Calls</p>
            <p className="font-semibold">{webhook.totalCalls.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Failed</p>
            <p className="font-semibold text-red-600">{webhook.failedCalls}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Last triggered: {webhook.lastTriggered}
          </p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsTestDialogOpen(true)}
            >
              <Send className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedWebhook(webhook)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleToggleWebhook(webhook.id)}
            >
              {webhook.status === 'active' ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LogEntry = ({ log }) => (
    <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-2">
        {log.status === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
        <div>
          <p className="font-medium text-sm">{log.event}</p>
          <p className="text-xs text-gray-500">{log.timestamp}</p>
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-4 text-sm">
          <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
            {log.statusCode}
          </Badge>
          <span className="text-gray-500">{log.duration}ms</span>
        </div>
      </div>
      
      <Button size="sm" variant="outline">
        <Eye className="h-3 w-3" />
      </Button>
    </div>
  );

  const CreateWebhookDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Webhook</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Webhook Name</Label>
              <Input id="name" placeholder="Enter webhook name" />
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select defaultValue="POST">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="url">Webhook URL</Label>
            <Input id="url" placeholder="https://api.example.com/webhook" />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe what this webhook does" />
          </div>
          
          <div>
            <Label>Events to Subscribe</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                'lead.created', 'lead.updated', 'lead.deleted',
                'deal.created', 'deal.updated', 'deal.stage_changed',
                'contact.created', 'contact.updated',
                'activity.created', 'task.completed'
              ].map((event) => (
                <div key={event} className="flex items-center space-x-2">
                  <input type="checkbox" id={event} className="rounded" />
                  <Label htmlFor={event} className="text-sm">{event}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input id="timeout" type="number" defaultValue="30" />
            </div>
            <div>
              <Label htmlFor="retries">Max Retries</Label>
              <Input id="retries" type="number" defaultValue="3" />
            </div>
          </div>
          
          <div>
            <Label>Custom Headers</Label>
            <div className="space-y-2 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Header name" />
                <Input placeholder="Header value" />
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Add Header
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="active" defaultChecked />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
            Create Webhook
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Manager
            </CardTitle>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="webhooks" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search webhooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {webhooks
                  .filter(webhook => 
                    (filterStatus === 'all' || webhook.status === filterStatus) &&
                    (searchQuery === '' || webhook.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((webhook) => (
                    <WebhookCard key={webhook.id} webhook={webhook} />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {sampleLogs.map((log) => (
                    <LogEntry key={log.id} log={log} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Enable Webhook Logging</Label>
                      <p className="text-sm text-gray-500">Log all webhook requests and responses</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Retry Failed Webhooks</Label>
                      <p className="text-sm text-gray-500">Automatically retry failed webhook calls</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defaultTimeout">Default Timeout (seconds)</Label>
                      <Input id="defaultTimeout" type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label htmlFor="defaultRetries">Default Max Retries</Label>
                      <Input id="defaultRetries" type="number" defaultValue="3" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="userAgent">User Agent</Label>
                    <Input id="userAgent" defaultValue="CRM-Webhook/1.0" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Require HTTPS</Label>
                      <p className="text-sm text-gray-500">Only allow HTTPS webhook URLs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="signingSecret">Webhook Signing Secret</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        id="signingSecret" 
                        type={showSecret ? "text" : "password"} 
                        value={signingSecret}
                        onChange={(e) => setSigningSecret(e.target.value)}
                        placeholder="Enter webhook signing secret"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSecret(!showSecret)}
                        type="button"
                      >
                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setSigningSecret(generateSigningSecret())}
                        type="button"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Used to sign webhook payloads for verification. Click refresh to generate a new secret.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <CreateWebhookDialog />
    </div>
  );
};

export default WebhookManager;