import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Activity, 
  Zap, 
  Database, 
  Network, 
  Clock, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Gauge
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { usePerformanceMonitor } from '../hooks/usePerformanceOptimization';

const MetricCard = ({ title, value, unit, icon: Icon, trend, status, description }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${getStatusColor(status)}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{value}{unit}</p>
                {getTrendIcon(trend)}
              </div>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceChart = ({ data, title, dataKey, color = '#3b82f6' }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fill={color} 
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const PerformanceRecommendations = ({ metrics }) => {
  const getRecommendations = () => {
    const recommendations = [];

    if (metrics.loadTime > 3000) {
      recommendations.push({
        type: 'critical',
        title: 'Slow Page Load Time',
        description: 'Page load time exceeds 3 seconds. Consider code splitting and lazy loading.',
        action: 'Optimize bundle size and implement lazy loading'
      });
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push({
        type: 'warning',
        title: 'High Memory Usage',
        description: 'Memory usage is above 100MB. Check for memory leaks.',
        action: 'Review component lifecycle and cleanup functions'
      });
    }

    if (metrics.fps < 30) {
      recommendations.push({
        type: 'warning',
        title: 'Low Frame Rate',
        description: 'Frame rate is below 30 FPS. Optimize animations and rendering.',
        action: 'Use requestAnimationFrame and optimize re-renders'
      });
    }

    if (metrics.networkRequests > 50) {
      recommendations.push({
        type: 'warning',
        title: 'Too Many Network Requests',
        description: 'High number of network requests detected.',
        action: 'Implement request batching and caching'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        title: 'Performance Looks Good',
        description: 'All performance metrics are within acceptable ranges.',
        action: 'Continue monitoring and maintain current optimizations'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Performance Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getRecommendationIcon(rec.type)}
                <div className="flex-1">
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <p className="text-sm font-medium mt-2">Action: {rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ResourceMonitor = () => {
  const [resources, setResources] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    storage: 0
  });

  useEffect(() => {
    const updateResources = () => {
      // Simulate resource monitoring (in a real app, you'd get actual system metrics)
      setResources({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        storage: Math.random() * 100
      });
    };

    const interval = setInterval(updateResources, 2000);
    updateResources();

    return () => clearInterval(interval);
  }, []);

  const getResourceStatus = (value) => {
    if (value > 80) return 'critical';
    if (value > 60) return 'warning';
    if (value > 40) return 'good';
    return 'excellent';
  };

  const getResourceColor = (value) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    if (value > 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Monitor className="h-5 w-5 mr-2" />
          System Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <span className="text-sm">{Math.round(resources.cpu)}%</span>
          </div>
          <Progress value={resources.cpu} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <span className="text-sm">{Math.round(resources.memory)}%</span>
          </div>
          <Progress value={resources.memory} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Network Usage</span>
            </div>
            <span className="text-sm">{Math.round(resources.network)}%</span>
          </div>
          <Progress value={resources.network} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Storage Usage</span>
            </div>
            <span className="text-sm">{Math.round(resources.storage)}%</span>
          </div>
          <Progress value={resources.storage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceDashboard = () => {
  const { metrics } = usePerformanceMonitor();
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      
      setHistoricalData(prev => {
        const newData = [
          ...prev,
          {
            time: timeString,
            loadTime: metrics.loadTime,
            memoryUsage: metrics.memoryUsage,
            fps: metrics.fps,
            networkRequests: metrics.networkRequests
          }
        ].slice(-20); // Keep only last 20 data points
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics]);

  const getLoadTimeStatus = (time) => {
    if (time < 1000) return 'excellent';
    if (time < 2000) return 'good';
    if (time < 3000) return 'warning';
    return 'critical';
  };

  const getMemoryStatus = (memory) => {
    if (memory < 50) return 'excellent';
    if (memory < 100) return 'good';
    if (memory < 150) return 'warning';
    return 'critical';
  };

  const getFpsStatus = (fps) => {
    if (fps >= 60) return 'excellent';
    if (fps >= 30) return 'good';
    if (fps >= 15) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor application performance and system resources</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button>
            <Gauge className="h-4 w-4 mr-2" />
            Run Benchmark
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Load Time"
          value={Math.round(metrics.loadTime)}
          unit="ms"
          icon={Clock}
          trend={0}
          status={getLoadTimeStatus(metrics.loadTime)}
          description="Initial page load time"
        />
        <MetricCard
          title="Memory Usage"
          value={Math.round(metrics.memoryUsage)}
          unit="MB"
          icon={Database}
          trend={0}
          status={getMemoryStatus(metrics.memoryUsage)}
          description="JavaScript heap size"
        />
        <MetricCard
          title="Frame Rate"
          value={Math.round(metrics.fps)}
          unit=" FPS"
          icon={Activity}
          trend={0}
          status={getFpsStatus(metrics.fps)}
          description="Rendering performance"
        />
        <MetricCard
          title="Network Requests"
          value={metrics.networkRequests}
          unit=""
          icon={Network}
          trend={0}
          status="good"
          description="Total API calls made"
        />
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="resources">System Resources</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PerformanceChart
              data={historicalData}
              title="Load Time Trend"
              dataKey="loadTime"
              color="#ef4444"
            />
            <PerformanceChart
              data={historicalData}
              title="Memory Usage Trend"
              dataKey="memoryUsage"
              color="#f59e0b"
            />
            <PerformanceChart
              data={historicalData}
              title="Frame Rate Trend"
              dataKey="fps"
              color="#10b981"
            />
            <PerformanceChart
              data={historicalData}
              title="Network Requests"
              dataKey="networkRequests"
              color="#3b82f6"
            />
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResourceMonitor />
            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall application performance rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-green-600">85</div>
                  <div className="text-lg text-gray-600">Good Performance</div>
                  <Progress value={85} className="h-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Speed Index</div>
                      <div className="text-gray-600">2.1s</div>
                    </div>
                    <div>
                      <div className="font-medium">Largest Paint</div>
                      <div className="text-gray-600">1.8s</div>
                    </div>
                    <div>
                      <div className="font-medium">First Input</div>
                      <div className="text-gray-600">120ms</div>
                    </div>
                    <div>
                      <div className="font-medium">Layout Shift</div>
                      <div className="text-gray-600">0.05</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <PerformanceRecommendations metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;