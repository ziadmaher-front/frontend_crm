// AI Performance Monitoring Dashboard
// Real-time monitoring and optimization of AI engine performance

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { useAdvancedAI } from '@/hooks/useAdvancedAI';

const AIPerformanceDashboard = () => {
  const { aiEngine } = useAdvancedAI();
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [cacheHealth, setCacheHealth] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch performance metrics
  const fetchMetrics = async () => {
    try {
      if (aiEngine) {
        const metrics = aiEngine.getPerformanceMetrics();
        const health = aiEngine.getCacheHealth();
        
        setPerformanceMetrics(metrics);
        setCacheHealth(health);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    }
  };

  // Auto-refresh metrics
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [aiEngine]);

  // Optimize cache
  const handleOptimizeCache = async () => {
    setIsOptimizing(true);
    try {
      if (aiEngine) {
        await aiEngine.optimizeCache();
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Cache optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Clear cache
  const handleClearCache = async (type = null) => {
    try {
      if (aiEngine) {
        aiEngine.clearCache(type);
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  };

  // Warm up cache
  const handleWarmUpCache = async () => {
    try {
      if (aiEngine) {
        await aiEngine.warmUpCache();
        await fetchMetrics();
      }
    } catch (error) {
      console.error('Cache warm-up failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
      good: 'bg-green-100 text-green-800',
      poor: 'bg-red-100 text-red-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!performanceMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and optimize AI engine performance in real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleOptimizeCache} 
            disabled={isOptimizing}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <Badge className={getStatusBadge(cacheHealth?.status)}>
                  {cacheHealth?.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.memoryUsage * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.processingMetrics.leadScoring.averageTime || 0)}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Cache Hit Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(performanceMetrics.cacheStatistics?.leadScoring?.hitRate || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="processing">Processing Metrics</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Processing Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(performanceMetrics.processingMetrics).map(([key, metrics]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <Badge variant="outline">
                        {metrics.totalProcessed} processed
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Avg Time: {Math.round(metrics.averageTime || 0)}ms</span>
                        <span>Error Rate: {Math.round(metrics.errorRate || 0)}%</span>
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - metrics.errorRate)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Status</span>
                  <Badge className={getStatusBadge(cacheHealth?.status)}>
                    {cacheHealth?.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{Math.round(performanceMetrics.memoryUsage * 100)}%</span>
                  </div>
                  <Progress value={performanceMetrics.memoryUsage * 100} className="h-2" />
                </div>

                {cacheHealth?.issues && cacheHealth.issues.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-yellow-600">Issues Detected:</span>
                    {cacheHealth.issues.map((issue, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cache Management Tab */}
        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Cache Statistics</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleWarmUpCache} variant="outline" size="sm">
                      Warm Up
                    </Button>
                    <Button onClick={() => handleClearCache()} variant="outline" size="sm">
                      Clear All
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(performanceMetrics.cacheStatistics || {}).map(([type, stats]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadge(stats.efficiency?.toLowerCase())}>
                          {stats.efficiency}
                        </Badge>
                        <Button 
                          onClick={() => handleClearCache(type)} 
                          variant="ghost" 
                          size="sm"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-1 font-medium">{stats.currentSize}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hit Rate:</span>
                        <span className="ml-1 font-medium">{stats.hitRate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hits:</span>
                        <span className="ml-1 font-medium">{stats.hits}</span>
                      </div>
                    </div>
                    <Progress value={stats.hitRate} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5" />
                  <span>Cache Health Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(cacheHealth?.caches || {}).map(([type, cache]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <Badge className={getStatusBadge(cache.status)}>
                        {cache.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Utilization: {Math.round(cache.utilization)}%</span>
                        <span>Size: {cache.size}/{cache.maxSize}</span>
                      </div>
                      <Progress value={cache.utilization} className="h-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Processing Metrics Tab */}
        <TabsContent value="processing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(performanceMetrics.processingMetrics).map(([key, metrics]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  <CardDescription>
                    Performance metrics and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.totalProcessed}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(metrics.averageTime || 0)}ms
                      </p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{Math.round(100 - (metrics.errorRate || 0))}%</span>
                    </div>
                    <Progress value={100 - (metrics.errorRate || 0)} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2 text-xs">
                      {metrics.errorRate < 5 ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      <span>
                        {metrics.errorRate < 5 ? 'Performing well' : 'Needs attention'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(performanceMetrics.batchProcessing).map(([key, batch]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                  <CardDescription>
                    Batch processing queue status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {batch.queueSize}
                      </p>
                      <p className="text-xs text-muted-foreground">Queue Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(batch.successRate)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing Efficiency</span>
                      <span>{Math.round(batch.successRate)}%</span>
                    </div>
                    <Progress value={batch.successRate} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center space-x-2 text-xs">
                      {batch.queueSize === 0 ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <Network className="h-3 w-3 text-blue-500" />
                      )}
                      <span>
                        {batch.queueSize === 0 ? 'Queue empty' : `${batch.queueSize} items queued`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AIPerformanceDashboard;