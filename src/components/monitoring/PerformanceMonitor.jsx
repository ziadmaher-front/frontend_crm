import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  HardDrive, 
  MemoryStick, 
  Monitor, 
  Network, 
  RefreshCw, 
  Server, 
  Smartphone, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Wifi, 
  Zap,
  Eye,
  Bug,
  Timer,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  Download
} from 'lucide-react';

const PerformanceMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [realTimeData, setRealTimeData] = useState({});
  const [alerts, setAlerts] = useState([]);

  // Performance metrics
  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', cpu: 45, memory: 62, network: 23, responseTime: 120 },
    { time: '00:05', cpu: 52, memory: 58, network: 31, responseTime: 135 },
    { time: '00:10', cpu: 38, memory: 65, network: 28, responseTime: 98 },
    { time: '00:15', cpu: 61, memory: 71, network: 45, responseTime: 156 },
    { time: '00:20', cpu: 43, memory: 59, network: 33, responseTime: 112 },
    { time: '00:25', cpu: 55, memory: 68, network: 39, responseTime: 143 },
    { time: '00:30', cpu: 49, memory: 63, network: 35, responseTime: 128 }
  ]);

  // Error tracking
  const [errorData, setErrorData] = useState([
    { time: '00:00', errors: 2, warnings: 5, info: 12 },
    { time: '00:05', errors: 1, warnings: 8, info: 15 },
    { time: '00:10', errors: 0, warnings: 3, info: 9 },
    { time: '00:15', errors: 3, warnings: 12, info: 18 },
    { time: '00:20', errors: 1, warnings: 6, info: 14 },
    { time: '00:25', errors: 2, warnings: 9, info: 16 },
    { time: '00:30', errors: 0, warnings: 4, info: 11 }
  ]);

  // User experience metrics
  const [uxMetrics, setUxMetrics] = useState({
    pageLoadTime: 2.3,
    firstContentfulPaint: 1.2,
    largestContentfulPaint: 2.8,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 45,
    timeToInteractive: 3.1
  });

  // Browser/device breakdown
  const [browserData, setBrowserData] = useState([
    { name: 'Chrome', value: 65, color: '#4285f4' },
    { name: 'Firefox', value: 18, color: '#ff7139' },
    { name: 'Safari', value: 12, color: '#000000' },
    { name: 'Edge', value: 5, color: '#0078d4' }
  ]);

  const [deviceData, setDeviceData] = useState([
    { name: 'Desktop', value: 58, color: '#8884d8' },
    { name: 'Mobile', value: 35, color: '#82ca9d' },
    { name: 'Tablet', value: 7, color: '#ffc658' }
  ]);

  // API performance
  const [apiMetrics, setApiMetrics] = useState([
    { endpoint: '/api/contacts', avgResponseTime: 145, requests: 1250, errors: 3 },
    { endpoint: '/api/deals', avgResponseTime: 189, requests: 890, errors: 1 },
    { endpoint: '/api/companies', avgResponseTime: 167, requests: 650, errors: 2 },
    { endpoint: '/api/activities', avgResponseTime: 134, requests: 1100, errors: 0 },
    { endpoint: '/api/reports', avgResponseTime: 456, requests: 320, errors: 5 }
  ]);

  // System health
  const [systemHealth, setSystemHealth] = useState({
    cpu: { usage: 45, status: 'good' },
    memory: { usage: 62, status: 'warning' },
    disk: { usage: 78, status: 'warning' },
    network: { latency: 23, status: 'good' },
    database: { connections: 45, maxConnections: 100, status: 'good' }
  });

  // Recent errors
  const [recentErrors, setRecentErrors] = useState([
    {
      id: '1',
      timestamp: new Date(),
      level: 'error',
      message: 'Database connection timeout',
      component: 'ContactService',
      stack: 'Error: Connection timeout\n  at ContactService.getContacts()',
      count: 3
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 300000),
      level: 'warning',
      message: 'Slow API response detected',
      component: 'DealController',
      stack: 'Warning: Response time exceeded 2s threshold',
      count: 1
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 600000),
      level: 'error',
      message: 'Failed to send email notification',
      component: 'EmailService',
      stack: 'Error: SMTP connection failed',
      count: 2
    }
  ]);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // Simulate real-time data updates
        const newDataPoint = {
          time: new Date().toLocaleTimeString().slice(0, 5),
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 30) + 50,
          network: Math.floor(Math.random() * 30) + 20,
          responseTime: Math.floor(Math.random() * 100) + 80
        };

        setPerformanceData(prev => [...prev.slice(-6), newDataPoint]);

        // Update system health
        setSystemHealth(prev => ({
          ...prev,
          cpu: { ...prev.cpu, usage: newDataPoint.cpu },
          memory: { ...prev.memory, usage: newDataPoint.memory },
          network: { ...prev.network, latency: newDataPoint.network }
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const getHealthStatus = (usage, thresholds = { warning: 70, critical: 90 }) => {
    if (usage >= thresholds.critical) return 'critical';
    if (usage >= thresholds.warning) return 'warning';
    return 'good';
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      performance: performanceData,
      errors: errorData,
      uxMetrics,
      systemHealth,
      apiMetrics
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">Real-time system performance and error tracking</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "default" : "outline"}
          >
            {isMonitoring ? (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button onClick={exportMetrics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.cpu.usage}%</div>
              <div className="flex items-center space-x-2 mt-2">
                {getHealthIcon(getHealthStatus(systemHealth.cpu.usage))}
                <span className={`text-sm ${getHealthColor(getHealthStatus(systemHealth.cpu.usage))}`}>
                  {getHealthStatus(systemHealth.cpu.usage)}
                </span>
              </div>
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
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
              <MemoryStick className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.memory.usage}%</div>
              <div className="flex items-center space-x-2 mt-2">
                {getHealthIcon(getHealthStatus(systemHealth.memory.usage))}
                <span className={`text-sm ${getHealthColor(getHealthStatus(systemHealth.memory.usage))}`}>
                  {getHealthStatus(systemHealth.memory.usage)}
                </span>
              </div>
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
              <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.disk.usage}%</div>
              <div className="flex items-center space-x-2 mt-2">
                {getHealthIcon(getHealthStatus(systemHealth.disk.usage))}
                <span className={`text-sm ${getHealthColor(getHealthStatus(systemHealth.disk.usage))}`}>
                  {getHealthStatus(systemHealth.disk.usage)}
                </span>
              </div>
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
              <CardTitle className="text-sm font-medium">Network</CardTitle>
              <Network className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemHealth.network.latency}ms</div>
              <div className="flex items-center space-x-2 mt-2">
                {getHealthIcon(getHealthStatus(systemHealth.network.latency, { warning: 50, critical: 100 }))}
                <span className={`text-sm ${getHealthColor(getHealthStatus(systemHealth.network.latency, { warning: 50, critical: 100 }))}`}>
                  {getHealthStatus(systemHealth.network.latency, { warning: 50, critical: 100 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemHealth.database.connections}/{systemHealth.database.maxConnections}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {getHealthIcon(systemHealth.database.status)}
                <span className={`text-sm ${getHealthColor(systemHealth.database.status)}`}>
                  {systemHealth.database.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
          <TabsTrigger value="ux">User Experience</TabsTrigger>
          <TabsTrigger value="api">API Metrics</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time system metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                    <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network ms" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>API response time trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="responseTime" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} name="Response Time (ms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
                <CardDescription>Error, warning, and info message trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="errors" fill="#ef4444" name="Errors" />
                    <Bar dataKey="warnings" fill="#f59e0b" name="Warnings" />
                    <Bar dataKey="info" fill="#3b82f6" name="Info" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Errors</CardTitle>
                <CardDescription>Latest error messages and stack traces</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <div className="space-y-3">
                    {recentErrors.map((error) => (
                      <div key={error.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={error.level === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {error.level}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {error.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {error.count}x
                          </Badge>
                        </div>
                        <div className="font-medium text-sm mb-1">{error.message}</div>
                        <div className="text-xs text-muted-foreground mb-2">{error.component}</div>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600">Stack trace</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ux" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>User experience performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Page Load Time</span>
                      <span>{uxMetrics.pageLoadTime}s</span>
                    </div>
                    <Progress value={(uxMetrics.pageLoadTime / 5) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>First Contentful Paint</span>
                      <span>{uxMetrics.firstContentfulPaint}s</span>
                    </div>
                    <Progress value={(uxMetrics.firstContentfulPaint / 3) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Largest Contentful Paint</span>
                      <span>{uxMetrics.largestContentfulPaint}s</span>
                    </div>
                    <Progress value={(uxMetrics.largestContentfulPaint / 4) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cumulative Layout Shift</span>
                      <span>{uxMetrics.cumulativeLayoutShift}</span>
                    </div>
                    <Progress value={(uxMetrics.cumulativeLayoutShift / 0.1) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>First Input Delay</span>
                      <span>{uxMetrics.firstInputDelay}ms</span>
                    </div>
                    <Progress value={(uxMetrics.firstInputDelay / 100) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to Interactive</span>
                      <span>{uxMetrics.timeToInteractive}s</span>
                    </div>
                    <Progress value={(uxMetrics.timeToInteractive / 5) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser & Device Analytics</CardTitle>
                <CardDescription>User distribution by browser and device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3">Browsers</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={browserData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {browserData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Devices</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {[...browserData, ...deviceData].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span>{item.name}</span>
                      </div>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance Metrics</CardTitle>
              <CardDescription>Response times and error rates by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiMetrics.map((api, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">{api.endpoint}</div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{api.requests} requests</span>
                        <span>{api.avgResponseTime}ms avg</span>
                        <Badge className={api.errors === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {api.errors} errors
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Response Time</div>
                        <div className="text-lg font-bold">{api.avgResponseTime}ms</div>
                        <Progress value={(api.avgResponseTime / 500) * 100} className="mt-1" />
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Requests</div>
                        <div className="text-lg font-bold">{api.requests.toLocaleString()}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground">Error Rate</div>
                        <div className="text-lg font-bold">
                          {((api.errors / api.requests) * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score</CardTitle>
                <CardDescription>Overall system performance</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">87</div>
                <div className="text-sm text-muted-foreground">Out of 100</div>
                <Progress value={87} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uptime</CardTitle>
                <CardDescription>System availability</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-muted-foreground">Last 30 days</div>
                <div className="text-xs text-muted-foreground mt-2">
                  43 minutes downtime
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
                <CardDescription>System error percentage</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">0.12%</div>
                <div className="text-sm text-muted-foreground">Last 24 hours</div>
                <div className="text-xs text-muted-foreground mt-2">
                  7 errors out of 5,847 requests
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;