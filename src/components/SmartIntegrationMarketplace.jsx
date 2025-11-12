import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  Settings, 
  Zap, 
  Shield, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  MessageSquare,
  Phone,
  Video,
  Database,
  Cloud,
  Lock,
  Workflow,
  Bot,
  Palette,
  Code,
  Plug,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';

const SmartIntegrationMarketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [installing, setInstalling] = useState({});
  const [showConnected, setShowConnected] = useState(false);

  // Sample integration data
  const integrations = [
    {
      id: 1,
      name: 'Slack',
      description: 'Team communication and collaboration platform',
      category: 'communication',
      icon: '💬',
      rating: 4.8,
      reviews: 2847,
      price: 'Free',
      developer: 'Slack Technologies',
      isConnected: true,
      isPopular: true,
      isFeatured: true,
      tags: ['messaging', 'team', 'notifications'],
      features: ['Real-time notifications', 'Channel integration', 'File sharing', 'Bot commands'],
      permissions: ['Read messages', 'Send notifications', 'Access user profiles'],
      lastUpdated: '2024-01-15',
      version: '2.1.4',
      installations: 45000,
      dataSync: 'Real-time',
      setupTime: '2 minutes'
    },
    {
      id: 2,
      name: 'HubSpot',
      description: 'Complete CRM and marketing automation platform',
      category: 'crm',
      icon: '🎯',
      rating: 4.6,
      reviews: 1923,
      price: '$45/month',
      developer: 'HubSpot Inc.',
      isConnected: false,
      isPopular: true,
      isFeatured: true,
      tags: ['crm', 'marketing', 'automation', 'analytics'],
      features: ['Contact sync', 'Deal pipeline', 'Email campaigns', 'Analytics dashboard'],
      permissions: ['Read contacts', 'Sync deals', 'Access analytics', 'Manage campaigns'],
      lastUpdated: '2024-01-20',
      version: '3.2.1',
      installations: 38000,
      dataSync: 'Every 15 minutes',
      setupTime: '5 minutes'
    },
    {
      id: 3,
      name: 'Mailchimp',
      description: 'Email marketing and automation platform',
      category: 'marketing',
      icon: '📧',
      rating: 4.5,
      reviews: 3421,
      price: 'Free - $299/month',
      developer: 'Mailchimp',
      isConnected: true,
      isPopular: true,
      isFeatured: false,
      tags: ['email', 'marketing', 'automation', 'campaigns'],
      features: ['Email campaigns', 'Audience segmentation', 'A/B testing', 'Analytics'],
      permissions: ['Manage audiences', 'Send emails', 'Access reports', 'Create campaigns'],
      lastUpdated: '2024-01-18',
      version: '4.1.2',
      installations: 52000,
      dataSync: 'Real-time',
      setupTime: '3 minutes'
    },
    {
      id: 4,
      name: 'Zoom',
      description: 'Video conferencing and online meetings',
      category: 'communication',
      icon: '📹',
      rating: 4.4,
      reviews: 1876,
      price: 'Free - $19.99/month',
      developer: 'Zoom Video Communications',
      isConnected: false,
      isPopular: false,
      isFeatured: true,
      tags: ['video', 'meetings', 'webinars', 'recording'],
      features: ['Schedule meetings', 'Auto-join links', 'Recording integration', 'Calendar sync'],
      permissions: ['Schedule meetings', 'Access recordings', 'Manage participants'],
      lastUpdated: '2024-01-22',
      version: '1.8.3',
      installations: 29000,
      dataSync: 'On-demand',
      setupTime: '2 minutes'
    },
    {
      id: 5,
      name: 'QuickBooks',
      description: 'Accounting and financial management software',
      category: 'finance',
      icon: '💰',
      rating: 4.3,
      reviews: 987,
      price: '$25 - $180/month',
      developer: 'Intuit Inc.',
      isConnected: false,
      isPopular: false,
      isFeatured: false,
      tags: ['accounting', 'invoicing', 'expenses', 'reporting'],
      features: ['Invoice sync', 'Expense tracking', 'Financial reports', 'Tax preparation'],
      permissions: ['Read financial data', 'Create invoices', 'Access reports'],
      lastUpdated: '2024-01-10',
      version: '2.5.7',
      installations: 15000,
      dataSync: 'Daily',
      setupTime: '10 minutes'
    },
    {
      id: 6,
      name: 'Trello',
      description: 'Project management and team collaboration',
      category: 'productivity',
      icon: '📋',
      rating: 4.7,
      reviews: 2156,
      price: 'Free - $17.50/month',
      developer: 'Atlassian',
      isConnected: true,
      isPopular: true,
      isFeatured: false,
      tags: ['project management', 'kanban', 'collaboration', 'tasks'],
      features: ['Board sync', 'Card creation', 'Due date tracking', 'Team collaboration'],
      permissions: ['Read boards', 'Create cards', 'Manage lists', 'Access members'],
      lastUpdated: '2024-01-16',
      version: '1.9.2',
      installations: 34000,
      dataSync: 'Real-time',
      setupTime: '1 minute'
    }
  ];

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: Globe, count: integrations.length },
    { id: 'communication', name: 'Communication', icon: MessageSquare, count: 2 },
    { id: 'crm', name: 'CRM & Sales', icon: Users, count: 1 },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: 1 },
    { id: 'finance', name: 'Finance', icon: DollarSign, count: 1 },
    { id: 'productivity', name: 'Productivity', icon: CheckCircle, count: 1 }
  ];

  // Connected integrations
  const connectedIntegrations = integrations.filter(integration => integration.isConnected);

  // Integration analytics
  const integrationAnalytics = {
    totalIntegrations: integrations.length,
    connectedIntegrations: connectedIntegrations.length,
    dataTransferred: '2.4 GB',
    apiCalls: 45672,
    uptime: '99.9%',
    avgResponseTime: '120ms'
  };

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'connection',
      integration: 'Slack',
      action: 'Connected successfully',
      timestamp: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'sync',
      integration: 'Mailchimp',
      action: 'Synced 150 contacts',
      timestamp: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'error',
      integration: 'HubSpot',
      action: 'Authentication failed',
      timestamp: '6 hours ago',
      status: 'error'
    },
    {
      id: 4,
      type: 'update',
      integration: 'Trello',
      action: 'Updated to version 1.9.2',
      timestamp: '1 day ago',
      status: 'info'
    }
  ];

  const handleInstallIntegration = async (integrationId) => {
    setInstalling(prev => ({ ...prev, [integrationId]: true }));
    
    // Simulate installation process
    setTimeout(() => {
      setInstalling(prev => ({ ...prev, [integrationId]: false }));
      // Update integration status
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        integration.isConnected = true;
      }
    }, 2000);
  };

  const handleDisconnectIntegration = (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.isConnected = false;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'connected' && integration.isConnected) ||
                         (selectedFilter === 'popular' && integration.isPopular) ||
                         (selectedFilter === 'featured' && integration.isFeatured) ||
                         (selectedFilter === 'free' && integration.price.toLowerCase().includes('free'));
    
    const matchesConnectedFilter = !showConnected || integration.isConnected;
    
    return matchesSearch && matchesCategory && matchesFilter && matchesConnectedFilter;
  });

  const IntegrationCard = ({ integration }) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <h3 className="font-semibold text-lg">{integration.name}</h3>
              <p className="text-sm text-gray-600">{integration.developer}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {integration.isFeatured && <Badge variant="secondary">Featured</Badge>}
            {integration.isPopular && <Badge variant="outline">Popular</Badge>}
            {integration.isConnected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="font-medium">{integration.rating}</span>
            <span className="text-gray-500">({integration.reviews})</span>
          </div>
          <div className="text-gray-500">•</div>
          <div className="font-medium text-green-600">{integration.price}</div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {integration.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {integration.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{integration.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Installations:</span>
            <span>{integration.installations.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Setup time:</span>
            <span>{integration.setupTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Data sync:</span>
            <span>{integration.dataSync}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {integration.isConnected ? (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDisconnectIntegration(integration.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => handleInstallIntegration(integration.id)}
                disabled={installing[integration.id]}
              >
                {installing[integration.id] ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Details
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integration Marketplace</h2>
          <p className="text-gray-600">Connect your favorite apps with one-click integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Request Integration
          </Button>
          <Button size="sm">
            <Code className="h-4 w-4 mr-2" />
            Build Custom
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Available Integrations"
          value={integrationAnalytics.totalIntegrations}
          icon={Plug}
          trend="+3 this week"
        />
        <MetricCard
          title="Connected Apps"
          value={integrationAnalytics.connectedIntegrations}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Data Transferred"
          value={integrationAnalytics.dataTransferred}
          icon={Database}
          trend="+12% this month"
        />
        <MetricCard
          title="System Uptime"
          value={integrationAnalytics.uptime}
          icon={Shield}
          color="green"
        />
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="connected">My Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Apps</option>
                <option value="featured">Featured</option>
                <option value="popular">Popular</option>
                <option value="free">Free</option>
                <option value="connected">Connected</option>
              </select>
            </div>
          </div>

          {/* Featured Integrations */}
          {selectedCategory === 'all' && selectedFilter === 'all' && !searchQuery && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Featured Integrations</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.filter(i => i.isFeatured).map(integration => (
                  <IntegrationCard key={integration.id} integration={integration} />
                ))}
              </div>
            </div>
          )}

          {/* All Integrations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {searchQuery ? `Search Results (${filteredIntegrations.length})` : 'All Integrations'}
              </h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-connected" className="text-sm">Connected only</Label>
                <Switch
                  id="show-connected"
                  checked={showConnected}
                  onCheckedChange={setShowConnected}
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>

            {filteredIntegrations.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Connected Integrations ({connectedIntegrations.length})</h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>

          <div className="grid gap-4">
            {connectedIntegrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Connected: {integration.lastUpdated}</span>
                          <span>Version: {integration.version}</span>
                          <span>Sync: {integration.dataSync}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDisconnectIntegration(integration.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {connectedIntegrations.length === 0 && (
              <div className="text-center py-12">
                <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connected integrations</h3>
                <p className="text-gray-600 mb-4">Start by connecting your first app from the marketplace</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="API Calls Today"
              value={integrationAnalytics.apiCalls.toLocaleString()}
              icon={BarChart3}
              trend="+8.2%"
            />
            <MetricCard
              title="Avg Response Time"
              value={integrationAnalytics.avgResponseTime}
              icon={Clock}
              color="green"
            />
            <MetricCard
              title="Error Rate"
              value="0.1%"
              icon={AlertCircle}
              trend="-0.05%"
              color="red"
            />
            <MetricCard
              title="Data Processed"
              value="1.2 TB"
              icon={Database}
              trend="+15%"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Integration Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedIntegrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{integration.icon}</span>
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.random() * 100} className="w-20 h-2" />
                        <span className="text-sm text-gray-600 w-12">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Successful Syncs</span>
                    <span className="font-semibold text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Failed Requests</span>
                    <span className="font-semibold text-red-600">1.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Sync Time</span>
                    <span className="font-semibold">2.4s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Peak Usage</span>
                    <span className="font-semibold">2:00 PM - 4:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-100 text-green-600' :
                        activity.status === 'error' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.status === 'success' ? <CheckCircle className="h-4 w-4" /> :
                         activity.status === 'error' ? <XCircle className="h-4 w-4" /> :
                         <Info className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.integration}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-sm text-gray-600">Automatically sync data between connected apps</p>
                </div>
                <Switch id="auto-sync" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Integration Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified about sync status and errors</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>

              <div>
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <select className="mt-2 w-full px-3 py-2 border rounded-md">
                  <option value="realtime">Real-time</option>
                  <option value="5min">Every 5 minutes</option>
                  <option value="15min">Every 15 minutes</option>
                  <option value="1hour">Every hour</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <Label htmlFor="data-retention">Data Retention Period</Label>
                <select className="mt-2 w-full px-3 py-2 border rounded-md">
                  <option value="30days">30 days</option>
                  <option value="90days">90 days</option>
                  <option value="1year">1 year</option>
                  <option value="forever">Forever</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    id="api-key"
                    type="password" 
                    value="sk-1234567890abcdef"
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input 
                  id="webhook-url"
                  value="https://api.yourcrm.com/webhooks/integrations"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="rate-limit">Rate Limit (requests/minute)</Label>
                <Input 
                  id="rate-limit"
                  type="number"
                  value="1000"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartIntegrationMarketplace;