import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  TrendingUp,
  Database,
  Webhook,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Globe,
  Shield,
  Cpu
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { integrationHub } from '../../services/integrationHub';

const IntegrationDashboard = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [healthStatus, setHealthStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncInProgress, setSyncInProgress] = useState(new Set());

  // Load integrations and analytics
  useEffect(() => {
    loadIntegrations();
    const interval = setInterval(loadIntegrations, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, fetch from integrationHub
      const mockIntegrations = [
        {
          id: 'int_gmail_001',
          name: 'Gmail Integration',
          type: 'email',
          provider: 'gmail',
          status: 'active',
          health: { status: 'healthy', lastCheck: new Date().toISOString() },
          syncStats: { totalSyncs: 1250, successfulSyncs: 1200, failedSyncs: 50 },
          lastSync: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'int_salesforce_001',
          name: 'Salesforce CRM',
          type: 'sales',
          provider: 'salesforce',
          status: 'active',
          health: { status: 'healthy', lastCheck: new Date().toISOString() },
          syncStats: { totalSyncs: 890, successfulSyncs: 875, failedSyncs: 15 },
          lastSync: new Date(Date.now() - 600000).toISOString()
        },
        {
          id: 'int_slack_001',
          name: 'Slack Notifications',
          type: 'communication',
          provider: 'slack',
          status: 'active',
          health: { status: 'degraded', lastCheck: new Date().toISOString() },
          syncStats: { totalSyncs: 450, successfulSyncs: 420, failedSyncs: 30 },
          lastSync: new Date(Date.now() - 900000).toISOString()
        },
        {
          id: 'int_hubspot_001',
          name: 'HubSpot Marketing',
          type: 'marketing',
          provider: 'hubspot',
          status: 'inactive',
          health: { status: 'unhealthy', lastCheck: new Date().toISOString() },
          syncStats: { totalSyncs: 200, successfulSyncs: 180, failedSyncs: 20 },
          lastSync: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      setIntegrations(mockIntegrations);

      // Load analytics for each integration
      const analyticsData = {};
      const healthData = {};
      
      for (const integration of mockIntegrations) {
        analyticsData[integration.id] = await generateMockAnalytics(integration);
        healthData[integration.id] = await generateMockHealthStatus(integration);
      }

      setAnalytics(analyticsData);
      setHealthStatus(healthData);
      
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock analytics data
  const generateMockAnalytics = async (integration) => {
    const days = 7;
    const syncData = [];
    const errorData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      syncData.push({
        date: date.toISOString().split('T')[0],
        successful: Math.floor(Math.random() * 50) + 10,
        failed: Math.floor(Math.random() * 5),
        duration: Math.floor(Math.random() * 5000) + 1000
      });
      
      errorData.push({
        date: date.toISOString().split('T')[0],
        errors: Math.floor(Math.random() * 10),
        warnings: Math.floor(Math.random() * 20)
      });
    }

    return {
      syncTrends: syncData,
      errorTrends: errorData,
      dataVolume: {
        inbound: Math.floor(Math.random() * 10000) + 5000,
        outbound: Math.floor(Math.random() * 8000) + 3000
      },
      performance: {
        averageResponseTime: Math.floor(Math.random() * 2000) + 500,
        successRate: 0.95 + Math.random() * 0.04,
        uptime: 0.98 + Math.random() * 0.02
      }
    };
  };

  const generateMockHealthStatus = async (integration) => {
    return {
      overall: integration.health.status,
      checks: {
        connection: { status: 'healthy', responseTime: 150 },
        api: { status: integration.health.status, responseTime: 300 },
        sync: { status: 'healthy', lastSync: integration.lastSync },
        rateLimit: { status: 'healthy', usage: '45%' }
      },
      recommendations: integration.health.status !== 'healthy' ? [
        'Check API credentials',
        'Verify network connectivity',
        'Review rate limit settings'
      ] : []
    };
  };

  // Handle integration actions
  const handleSync = async (integrationId) => {
    setSyncInProgress(prev => new Set([...prev, integrationId]));
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update integration sync stats
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? {
              ...integration,
              lastSync: new Date().toISOString(),
              syncStats: {
                ...integration.syncStats,
                totalSyncs: integration.syncStats.totalSyncs + 1,
                successfulSyncs: integration.syncStats.successfulSyncs + 1
              }
            }
          : integration
      ));
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  };

  const handleToggleStatus = async (integrationId) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? {
            ...integration,
            status: integration.status === 'active' ? 'inactive' : 'active'
          }
        : integration
    ));
  };

  // Computed values
  const overallStats = useMemo(() => {
    const total = integrations.length;
    const active = integrations.filter(i => i.status === 'active').length;
    const healthy = integrations.filter(i => i.health.status === 'healthy').length;
    const totalSyncs = integrations.reduce((sum, i) => sum + i.syncStats.totalSyncs, 0);
    const successRate = totalSyncs > 0 ? 
      integrations.reduce((sum, i) => sum + i.syncStats.successfulSyncs, 0) / totalSyncs : 0;

    return { total, active, healthy, totalSyncs, successRate };
  }, [integrations]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertCircle className="h-4 w-4" />;
      case 'unhealthy': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your third-party integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadIntegrations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                <p className="text-2xl font-bold">{overallStats.total}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.active}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Healthy</p>
                <p className="text-2xl font-bold text-green-600">{overallStats.healthy}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{(overallStats.successRate * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(integration.status)}`} />
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{integration.provider}</Badge>
                  </div>
                  <CardDescription>
                    {integration.type.charAt(0).toUpperCase() + integration.type.slice(1)} Integration
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Health Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Health</span>
                    <div className={`flex items-center space-x-1 ${getHealthColor(integration.health.status)}`}>
                      {getHealthIcon(integration.health.status)}
                      <span className="text-sm font-medium capitalize">
                        {integration.health.status}
                      </span>
                    </div>
                  </div>

                  {/* Sync Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Syncs</span>
                      <span className="font-medium">{integration.syncStats.totalSyncs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-medium">
                        {((integration.syncStats.successfulSyncs / integration.syncStats.totalSyncs) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="font-medium">
                        {new Date(integration.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncInProgress.has(integration.id)}
                    >
                      {syncInProgress.has(integration.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(integration.id)}
                    >
                      {integration.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Detailed Integration List */}
          <Card>
            <CardHeader>
              <CardTitle>All Integrations</CardTitle>
              <CardDescription>
                Detailed view of all configured integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(integration.status)}`} />
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {integration.provider} • {integration.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {integration.syncStats.totalSyncs} syncs
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {((integration.syncStats.successfulSyncs / integration.syncStats.totalSyncs) * 100).toFixed(1)}% success
                        </p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${getHealthColor(integration.health.status)}`}>
                        {getHealthIcon(integration.health.status)}
                        <span className="text-sm capitalize">{integration.health.status}</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics[integrations[0]?.id]?.syncTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Inbound', value: analytics[integrations[0]?.id]?.dataVolume?.inbound || 0 },
                    { name: 'Outbound', value: analytics[integrations[0]?.id]?.dataVolume?.outbound || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {/* Health Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{integration.name}</span>
                    <div className={`flex items-center space-x-1 ${getHealthColor(integration.health.status)}`}>
                      {getHealthIcon(integration.health.status)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthStatus[integration.id]?.checks && Object.entries(healthStatus[integration.id].checks).map(([check, status]) => (
                    <div key={check} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{check.replace(/([A-Z])/g, ' $1')}</span>
                      <div className={`flex items-center space-x-1 ${getHealthColor(status.status)}`}>
                        {getHealthIcon(status.status)}
                        <span className="text-sm">{status.status}</span>
                      </div>
                    </div>
                  ))}
                  
                  {healthStatus[integration.id]?.recommendations?.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {healthStatus[integration.id].recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDashboard;