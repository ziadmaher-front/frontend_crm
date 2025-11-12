import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Activity, 
  Cpu, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react';
import { AISystemBootstrap } from '../services/aiSystemBootstrap';
import { useAISystem } from '../hooks/useAISystem';

const AISystemMonitor = () => {
  const [systemStatus, setSystemStatus] = useState({});
  const [metrics, setMetrics] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { 
    systemHealth, 
    performanceMetrics, 
    isLoading, 
    error,
    refreshMetrics 
  } = useAISystem();

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      setIsRefreshing(true);
      const status = await AISystemBootstrap.getSystemStatus();
      const healthMetrics = await AISystemBootstrap.getHealthMetrics();
      
      setSystemStatus(status);
      setMetrics(healthMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const SystemOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(systemStatus.overall)}`}>
                {systemStatus.overall || 'Unknown'}
              </p>
            </div>
            <div className={getStatusColor(systemStatus.overall)}>
              {getStatusIcon(systemStatus.overall)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Services</p>
              <p className="text-lg font-semibold text-blue-600">
                {systemStatus.activeServices || 0}/{systemStatus.totalServices || 0}
              </p>
            </div>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU Usage</p>
              <p className="text-lg font-semibold text-purple-600">
                {metrics.cpu?.usage || 0}%
              </p>
            </div>
            <Cpu className="h-4 w-4 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-lg font-semibold text-orange-600">
                {metrics.memory?.usage || 0}%
              </p>
            </div>
            <Database className="h-4 w-4 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ServiceStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Service Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(systemStatus.services || {}).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={getStatusColor(status.status)}>
                  {getStatusIcon(status.status)}
                </div>
                <div>
                  <p className="font-medium">{service}</p>
                  <p className="text-sm text-gray-600">
                    Uptime: {formatUptime(status.uptime || 0)}
                  </p>
                </div>
              </div>
              <Badge variant={status.status === 'healthy' ? 'success' : 'destructive'}>
                {status.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const PerformanceMetrics = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm text-gray-600">{metrics.responseTime || 0}ms</span>
            </div>
            <Progress value={Math.min((metrics.responseTime || 0) / 10, 100)} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Throughput</span>
              <span className="text-sm text-gray-600">{metrics.throughput || 0} req/s</span>
            </div>
            <Progress value={Math.min((metrics.throughput || 0) * 10, 100)} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Cache Hit Rate</span>
              <span className="text-sm text-gray-600">{metrics.cacheHitRate || 0}%</span>
            </div>
            <Progress value={metrics.cacheHitRate || 0} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm text-gray-600">{metrics.errorRate || 0}%</span>
            </div>
            <Progress 
              value={metrics.errorRate || 0} 
              className="[&>div]:bg-red-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SystemActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={fetchSystemStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>

          <Button 
            variant="outline"
            onClick={() => AISystemBootstrap.optimizePerformance()}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Optimize Performance
          </Button>

          <Button 
            variant="outline"
            onClick={() => AISystemBootstrap.clearCache()}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Clear Cache
          </Button>

          <Button 
            variant="outline"
            onClick={() => AISystemBootstrap.runHealthCheck()}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Health Check
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI System Monitor</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          onClick={fetchSystemStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <SystemOverview />

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          <ServiceStatus />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <SystemActions />
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">System Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISystemMonitor;