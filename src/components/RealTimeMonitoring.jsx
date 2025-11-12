import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Database,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Settings,
  Pause,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Filter,
  Download,
  Share,
  Maximize,
  Minimize,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  XCircle
} from 'lucide-react';

const RealTimeMonitoring = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [realtimeData, setRealtimeData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock real-time data generation
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint = {
        timestamp: now.toLocaleTimeString(),
        users: Math.floor(Math.random() * 100) + 50,
        sales: Math.floor(Math.random() * 1000) + 500,
        leads: Math.floor(Math.random() * 50) + 20,
        deals: Math.floor(Math.random() * 20) + 5,
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        disk: Math.floor(Math.random() * 20) + 10,
        network: Math.floor(Math.random() * 100) + 50
      };

      setRealtimeData(prev => {
        const updated = [...prev, newDataPoint];
        return updated.slice(-20); // Keep last 20 data points
      });

      // Update metrics
      setMetrics({
        activeUsers: newDataPoint.users,
        totalSales: newDataPoint.sales,
        newLeads: newDataPoint.leads,
        activeDealss: newDataPoint.deals,
        responseTime: Math.floor(Math.random() * 200) + 100,
        errorRate: (Math.random() * 2).toFixed(2),
        uptime: '99.9%',
        throughput: Math.floor(Math.random() * 1000) + 500
      });

      // Update system health
      setSystemHealth({
        cpu: newDataPoint.cpu,
        memory: newDataPoint.memory,
        disk: newDataPoint.disk,
        network: newDataPoint.network,
        database: Math.floor(Math.random() * 30) + 70,
        api: Math.floor(Math.random() * 20) + 80,
        cache: Math.floor(Math.random() * 25) + 75
      });

      // Generate random alerts
      if (Math.random() < 0.1) { // 10% chance of alert
        const alertTypes = ['warning', 'error', 'info', 'success'];
        const alertMessages = [
          'High CPU usage detected',
          'New lead conversion spike',
          'Database connection restored',
          'Memory usage above threshold',
          'API response time improved',
          'Disk space running low',
          'Network latency increased'
        ];
        
        const newAlert = {
          id: Date.now(),
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          timestamp: now.toLocaleString(),
          source: 'System Monitor',
          acknowledged: false
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep last 20 alerts
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'success': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getHealthColor = (value) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (value) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Monitoring</h1>
          <p className="text-muted-foreground">
            Live system metrics, alerts, and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch 
              checked={soundEnabled} 
              onCheckedChange={setSoundEnabled}
              id="sound-alerts"
            />
            <label htmlFor="sound-alerts" className="text-sm">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm">Auto Refresh</label>
          </div>
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
          </span>
        </div>
        <Badge variant="outline">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
        <Badge variant="outline">
          {alerts.filter(a => !a.acknowledged).length} unacknowledged alerts
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">from last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Volume</p>
                <p className="text-2xl font-bold">${metrics.totalSales || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-muted-foreground ml-1">from last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">{metrics.responseTime || 0}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">-5%</span>
              <span className="text-muted-foreground ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                <p className="text-2xl font-bold">{metrics.uptime || '0%'}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">Excellent</span>
              <span className="text-muted-foreground ml-1">performance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Real-time Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Real-time user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Live sales and conversion tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="leads" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          {/* System Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-5 w-5" />
                    <span className="font-medium">CPU Usage</span>
                  </div>
                  <span className={`font-bold ${getHealthColor(100 - (systemHealth.cpu || 0))}`}>
                    {systemHealth.cpu || 0}%
                  </span>
                </div>
                <Progress value={systemHealth.cpu || 0} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {systemHealth.cpu > 80 ? 'High usage detected' : 'Normal operation'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <span className={`font-bold ${getHealthColor(100 - (systemHealth.memory || 0))}`}>
                    {systemHealth.memory || 0}%
                  </span>
                </div>
                <Progress value={systemHealth.memory || 0} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {systemHealth.memory > 80 ? 'Memory pressure' : 'Optimal usage'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5" />
                    <span className="font-medium">Disk Usage</span>
                  </div>
                  <span className={`font-bold ${getHealthColor(100 - (systemHealth.disk || 0))}`}>
                    {systemHealth.disk || 0}%
                  </span>
                </div>
                <Progress value={systemHealth.disk || 0} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {systemHealth.disk > 80 ? 'Low disk space' : 'Sufficient space'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">Network</span>
                  </div>
                  <span className={`font-bold ${getHealthColor(systemHealth.network || 0)}`}>
                    {systemHealth.network || 0} Mbps
                  </span>
                </div>
                <Progress value={(systemHealth.network || 0) / 2} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {systemHealth.network > 80 ? 'High throughput' : 'Normal traffic'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Current status of all system services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5" />
                    <span className="font-medium">Database</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5" />
                    <span className="font-medium">API Server</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">Web Server</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">Warning</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">Email Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Protected</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600">Running</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* Alert Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">System Alerts</h3>
              <Badge variant="outline">
                {alerts.filter(a => !a.acknowledged).length} unacknowledged
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearAllAlerts}>
                Clear All
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Alert Settings
              </Button>
            </div>
          </div>

          {/* Alerts List */}
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                    <p className="text-muted-foreground">All systems are operating normally</p>
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${getAlertColor(alert.type)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="font-medium">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>{alert.timestamp}</span>
                            <span>Source: {alert.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.acknowledged && (
                          <Badge variant="outline" className="text-green-600">
                            Acknowledged
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>CPU, Memory, and Disk utilization over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#ff7300" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#387908" strokeWidth={2} name="Memory %" />
                    <Line type="monotone" dataKey="disk" stroke="#8884d8" strokeWidth={2} name="Disk %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Activity</CardTitle>
                <CardDescription>Network throughput and latency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="network" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Key performance indicators and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{metrics.responseTime || 0}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{metrics.throughput || 0}</p>
                  <p className="text-sm text-muted-foreground">Requests/min</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{metrics.errorRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{metrics.uptime || '0%'}</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeMonitoring;