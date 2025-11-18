import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Webhook, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Copy,
  Eye,
  Settings,
  Activity,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      name: 'Salesforce Integration',
      url: 'https://api.salesforce.com/webhook/crm',
      events: ['contact.created', 'deal.updated', 'activity.completed'],
      status: 'active',
      lastTriggered: new Date('2024-01-25T10:30:00Z'),
      successRate: 98.5,
      totalCalls: 1247,
      failedCalls: 18,
      retryPolicy: 'exponential',
      timeout: 30,
      headers: {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-25')
    },
    {
      id: '2',
      name: 'Slack Notifications',
      url: 'https://example.com/webhooks/slack/placeholder',
      events: ['deal.won', 'deal.lost', 'activity.overdue'],
      status: 'active',
      lastTriggered: new Date('2024-01-25T09:15:00Z'),
      successRate: 100,
      totalCalls: 342,
      failedCalls: 0,
      retryPolicy: 'linear',
      timeout: 15,
      headers: {
        'Content-Type': 'application/json'
      },
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Marketing Automation',
      url: 'https://api.hubspot.com/webhook/marketing',
      events: ['contact.created', 'contact.updated', 'campaign.completed'],
      status: 'paused',
      lastTriggered: new Date('2024-01-24T16:45:00Z'),
      successRate: 95.2,
      totalCalls: 856,
      failedCalls: 41,
      retryPolicy: 'exponential',
      timeout: 25,
      headers: {
        'Authorization': 'Bearer ***',
        'Content-Type': 'application/json',
        'X-API-Key': '***'
      },
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-24')
    }
  ]);

  const [webhookLogs, setWebhookLogs] = useState([
    {
      id: '1',
      webhookId: '1',
      event: 'contact.created',
      status: 'success',
      responseCode: 200,
      responseTime: 245,
      payload: { contactId: '123', firstName: 'John', lastName: 'Doe' },
      response: { success: true, id: 'sf_123' },
      timestamp: new Date('2024-01-25T10:30:00Z'),
      retryCount: 0
    },
    {
      id: '2',
      webhookId: '2',
      event: 'deal.won',
      status: 'success',
      responseCode: 200,
      responseTime: 156,
      payload: { dealId: '456', value: 50000, stage: 'closed_won' },
      response: { ok: true },
      timestamp: new Date('2024-01-25T09:15:00Z'),
      retryCount: 0
    },
    {
      id: '3',
      webhookId: '3',
      event: 'contact.updated',
      status: 'failed',
      responseCode: 500,
      responseTime: 5000,
      payload: { contactId: '789', email: 'updated@example.com' },
      response: { error: 'Internal Server Error' },
      timestamp: new Date('2024-01-24T16:45:00Z'),
      retryCount: 3
    }
  ]);

  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
    retryPolicy: 'exponential',
    timeout: 30,
    headers: {}
  });

  const availableEvents = [
    'contact.created',
    'contact.updated',
    'contact.deleted',
    'deal.created',
    'deal.updated',
    'deal.won',
    'deal.lost',
    'activity.created',
    'activity.completed',
    'activity.overdue',
    'campaign.started',
    'campaign.completed',
    'user.login',
    'user.logout'
  ];

  const webhookMetrics = [
    { name: 'Mon', success: 45, failed: 2 },
    { name: 'Tue', success: 52, failed: 1 },
    { name: 'Wed', success: 38, failed: 5 },
    { name: 'Thu', success: 67, failed: 3 },
    { name: 'Fri', success: 71, failed: 2 },
    { name: 'Sat', success: 29, failed: 1 },
    { name: 'Sun', success: 33, failed: 0 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getLogStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateWebhook = () => {
    const webhook = {
      id: String(webhooks.length + 1),
      ...newWebhook,
      status: 'active',
      lastTriggered: null,
      successRate: 0,
      totalCalls: 0,
      failedCalls: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({
      name: '',
      url: '',
      events: [],
      retryPolicy: 'exponential',
      timeout: 30,
      headers: {}
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleWebhook = (id) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, status: webhook.status === 'active' ? 'paused' : 'active' }
        : webhook
    ));
  };

  const handleDeleteWebhook = (id) => {
    setWebhooks(webhooks.filter(webhook => webhook.id !== id));
  };

  const handleTestWebhook = async (webhook) => {
    // Simulate webhook test
    const testLog = {
      id: String(webhookLogs.length + 1),
      webhookId: webhook.id,
      event: 'test.webhook',
      status: 'success',
      responseCode: 200,
      responseTime: Math.floor(Math.random() * 1000) + 100,
      payload: { test: true, timestamp: new Date() },
      response: { success: true, message: 'Test webhook received' },
      timestamp: new Date(),
      retryCount: 0
    };
    
    setWebhookLogs([testLog, ...webhookLogs]);
  };

  const copyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Webhook Management</h1>
          <p className="text-muted-foreground">Manage external integrations and real-time data sync</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a new webhook endpoint for external integrations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                    placeholder="Enter webhook name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={newWebhook.timeout}
                    onChange={(e) => setNewWebhook({ ...newWebhook, timeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                          }
                        }}
                      />
                      <Label htmlFor={event} className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retryPolicy">Retry Policy</Label>
                <Select value={newWebhook.retryPolicy} onValueChange={(value) => setNewWebhook({ ...newWebhook, retryPolicy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Retry</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook}>
                  Create Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              <Webhook className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhooks.length}</div>
              <p className="text-xs text-muted-foreground">
                {webhooks.filter(w => w.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {webhooks.reduce((sum, w) => sum + w.totalCalls, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {webhooks.length > 0 
                  ? (webhooks.reduce((sum, w) => sum + w.successRate, 0) / webhooks.length).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average across all webhooks
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Calls</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {webhooks.reduce((sum, w) => sum + w.failedCalls, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <motion.div
                key={webhook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(webhook.status)}
                          <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleWebhook(webhook.id)}
                        >
                          {webhook.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyWebhookUrl(webhook.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="font-mono text-sm">{webhook.url}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Events</h4>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Statistics</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Calls:</span>
                            <span className="font-medium">{webhook.totalCalls}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <span className="font-medium text-green-600">{webhook.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Failed Calls:</span>
                            <span className="font-medium text-red-600">{webhook.failedCalls}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Configuration</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Retry Policy:</span>
                            <span className="font-medium">{webhook.retryPolicy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timeout:</span>
                            <span className="font-medium">{webhook.timeout}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Triggered:</span>
                            <span className="font-medium">
                              {webhook.lastTriggered 
                                ? new Date(webhook.lastTriggered).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Activity Logs</CardTitle>
              <CardDescription>Recent webhook calls and their responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookLogs.map((log) => {
                  const webhook = webhooks.find(w => w.id === log.webhookId);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{webhook?.name}</Badge>
                            <Badge variant="secondary">{log.event}</Badge>
                            <Badge className={`${getLogStatusColor(log.status)} bg-transparent border-current`}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Response Code:</span>
                              <div className="font-medium">{log.responseCode}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Response Time:</span>
                              <div className="font-medium">{log.responseTime}ms</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Retry Count:</span>
                              <div className="font-medium">{log.retryCount}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Timestamp:</span>
                              <div className="font-medium">
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Performance</CardTitle>
              <CardDescription>Success and failure rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={webhookMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="#10b981" name="Successful" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookManager;