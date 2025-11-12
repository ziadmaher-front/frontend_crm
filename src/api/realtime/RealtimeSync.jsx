import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users, 
  Database, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Settings,
  Monitor,
  Globe,
  Server
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const RealtimeSync = () => {
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 5000,
    batchSize: 100,
    retryAttempts: 3,
    enableCompression: true,
    enableEncryption: true
  });

  const [activeConnections, setActiveConnections] = useState([
    {
      id: '1',
      type: 'websocket',
      endpoint: 'wss://api.crm.com/ws',
      status: 'connected',
      lastPing: new Date(),
      latency: 45,
      messagesReceived: 1247,
      messagesSent: 892,
      uptime: '2h 34m'
    },
    {
      id: '2',
      type: 'sse',
      endpoint: 'https://api.crm.com/events',
      status: 'connected',
      lastPing: new Date(),
      latency: 78,
      messagesReceived: 567,
      messagesSent: 0,
      uptime: '1h 45m'
    },
    {
      id: '3',
      type: 'polling',
      endpoint: 'https://api.crm.com/sync',
      status: 'disconnected',
      lastPing: new Date(Date.now() - 300000),
      latency: 0,
      messagesReceived: 234,
      messagesSent: 156,
      uptime: '0m'
    }
  ]);

  const [syncQueue, setSyncQueue] = useState([
    {
      id: '1',
      type: 'contact',
      action: 'update',
      entityId: 'contact_123',
      data: { firstName: 'John', lastName: 'Doe Updated' },
      status: 'pending',
      timestamp: new Date(),
      retryCount: 0
    },
    {
      id: '2',
      type: 'deal',
      action: 'create',
      entityId: 'deal_456',
      data: { title: 'New Deal', value: 50000 },
      status: 'syncing',
      timestamp: new Date(Date.now() - 30000),
      retryCount: 0
    },
    {
      id: '3',
      type: 'activity',
      action: 'delete',
      entityId: 'activity_789',
      data: null,
      status: 'failed',
      timestamp: new Date(Date.now() - 120000),
      retryCount: 2
    }
  ]);

  const [realtimeMetrics, setRealtimeMetrics] = useState([
    { time: '10:00', messages: 45, latency: 50, errors: 0 },
    { time: '10:05', messages: 52, latency: 48, errors: 1 },
    { time: '10:10', messages: 38, latency: 55, errors: 0 },
    { time: '10:15', messages: 67, latency: 42, errors: 0 },
    { time: '10:20', messages: 71, latency: 45, errors: 2 },
    { time: '10:25', messages: 29, latency: 52, errors: 0 },
    { time: '10:30', messages: 33, latency: 47, errors: 1 }
  ]);

  const [liveUpdates, setLiveUpdates] = useState([
    {
      id: '1',
      type: 'contact_updated',
      message: 'John Doe contact information updated',
      timestamp: new Date(),
      user: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'deal_created',
      message: 'New deal "Enterprise License" created',
      timestamp: new Date(Date.now() - 45000),
      user: 'Mike Chen'
    },
    {
      id: '3',
      type: 'activity_completed',
      message: 'Follow-up call with TechCorp completed',
      timestamp: new Date(Date.now() - 120000),
      user: 'Alex Rodriguez'
    }
  ]);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateRealtimeUpdate();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const initializeWebSocket = () => {
    try {
      // In a real app, this would connect to your WebSocket server
      // wsRef.current = new WebSocket('wss://api.crm.com/ws');
      
      // Simulate WebSocket events
      setConnectionStatus('connected');
      
      // wsRef.current.onopen = () => {
      //   setConnectionStatus('connected');
      // };
      
      // wsRef.current.onclose = () => {
      //   setConnectionStatus('disconnected');
      //   attemptReconnect();
      // };
      
      // wsRef.current.onerror = () => {
      //   setConnectionStatus('error');
      // };
      
      // wsRef.current.onmessage = (event) => {
      //   handleRealtimeMessage(JSON.parse(event.data));
      // };
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const attemptReconnect = () => {
    setConnectionStatus('reconnecting');
    reconnectTimeoutRef.current = setTimeout(() => {
      initializeWebSocket();
    }, 3000);
  };

  const simulateRealtimeUpdate = () => {
    const updateTypes = ['contact_updated', 'deal_created', 'activity_completed', 'user_login'];
    const users = ['Sarah Johnson', 'Mike Chen', 'Alex Rodriguez', 'Emma Davis'];
    const messages = [
      'Contact information updated',
      'New deal created',
      'Activity completed',
      'User logged in',
      'Campaign launched',
      'Report generated'
    ];

    const newUpdate = {
      id: String(Date.now()),
      type: updateTypes[Math.floor(Math.random() * updateTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      user: users[Math.floor(Math.random() * users.length)]
    };

    setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 9)]);

    // Update metrics
    setRealtimeMetrics(prev => {
      const newMetrics = [...prev];
      const lastMetric = newMetrics[newMetrics.length - 1];
      const newTime = new Date();
      const timeStr = `${newTime.getHours()}:${newTime.getMinutes().toString().padStart(2, '0')}`;
      
      newMetrics.push({
        time: timeStr,
        messages: Math.floor(Math.random() * 50) + 20,
        latency: Math.floor(Math.random() * 30) + 40,
        errors: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0
      });
      
      return newMetrics.slice(-10);
    });
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'reconnecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'reconnecting': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'synced': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleAutoSync = () => {
    setSyncSettings(prev => ({ ...prev, autoSync: !prev.autoSync }));
  };

  const handleManualSync = () => {
    // Simulate manual sync
    setSyncQueue(prev => prev.map(item => 
      item.status === 'pending' ? { ...item, status: 'syncing' } : item
    ));
    
    setTimeout(() => {
      setSyncQueue(prev => prev.map(item => 
        item.status === 'syncing' ? { ...item, status: 'synced' } : item
      ));
    }, 2000);
  };

  const handleReconnect = () => {
    setConnectionStatus('reconnecting');
    setTimeout(() => {
      initializeWebSocket();
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Real-time Sync</h1>
          <p className="text-muted-foreground">Monitor live data synchronization and connections</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${getConnectionStatusColor(connectionStatus)}`}>
            {getConnectionStatusIcon(connectionStatus)}
            <span className="font-medium capitalize">{connectionStatus}</span>
          </div>
          {connectionStatus !== 'connected' && (
            <Button onClick={handleReconnect} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reconnect
            </Button>
          )}
        </div>
      </motion.div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Globe className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeConnections.filter(c => c.status === 'connected').length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {activeConnections.length} total
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
              <CardTitle className="text-sm font-medium">Messages/Min</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realtimeMetrics[realtimeMetrics.length - 1]?.messages || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time throughput
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
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {realtimeMetrics[realtimeMetrics.length - 1]?.latency || 0}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Response time
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
              <CardTitle className="text-sm font-medium">Sync Queue</CardTitle>
              <Database className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncQueue.filter(item => item.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Items pending sync
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="sync-queue">Sync Queue</TabsTrigger>
          <TabsTrigger value="live-updates">Live Updates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4">
            {activeConnections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {connection.status === 'connected' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <CardTitle className="text-lg capitalize">{connection.type}</CardTitle>
                        </div>
                        <Badge className={connection.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {connection.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Latency</div>
                        <div className="font-medium">{connection.latency}ms</div>
                      </div>
                    </div>
                    <CardDescription className="font-mono text-sm">
                      {connection.endpoint}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Messages Received</div>
                        <div className="text-lg font-medium">{connection.messagesReceived}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Messages Sent</div>
                        <div className="text-lg font-medium">{connection.messagesSent}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                        <div className="text-lg font-medium">{connection.uptime}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Last Ping</div>
                        <div className="text-lg font-medium">
                          {new Date(connection.lastPing).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync-queue" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Synchronization Queue</h3>
            <div className="flex items-center space-x-2">
              <Switch
                checked={syncSettings.autoSync}
                onCheckedChange={handleToggleAutoSync}
              />
              <Label>Auto Sync</Label>
              <Button onClick={handleManualSync} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Manual Sync
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {syncQueue.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="secondary">{item.action}</Badge>
                    <Badge className={getSyncStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Entity ID:</span>
                  <span className="ml-2 font-mono">{item.entityId}</span>
                  {item.retryCount > 0 && (
                    <span className="ml-4 text-yellow-600">
                      Retries: {item.retryCount}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live-updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Activity Feed</CardTitle>
              <CardDescription>Real-time updates from across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveUpdates.map((update) => (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{update.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        by {update.user} • {new Date(update.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {update.type.replace('_', ' ')}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Performance</CardTitle>
              <CardDescription>Message throughput and latency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={realtimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="messages" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="latency" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Configuration</CardTitle>
              <CardDescription>Configure real-time synchronization settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">Automatically sync data changes</p>
                </div>
                <Switch
                  checked={syncSettings.autoSync}
                  onCheckedChange={handleToggleAutoSync}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Compression</Label>
                  <p className="text-sm text-muted-foreground">Compress data for faster transmission</p>
                </div>
                <Switch
                  checked={syncSettings.enableCompression}
                  onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, enableCompression: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Encryption</Label>
                  <p className="text-sm text-muted-foreground">Encrypt sensitive data in transit</p>
                </div>
                <Switch
                  checked={syncSettings.enableEncryption}
                  onCheckedChange={(checked) => setSyncSettings(prev => ({ ...prev, enableEncryption: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sync Interval (ms)</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1000"
                    max="30000"
                    step="1000"
                    value={syncSettings.syncInterval}
                    onChange={(e) => setSyncSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{syncSettings.syncInterval}ms</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Batch Size</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={syncSettings.batchSize}
                    onChange={(e) => setSyncSettings(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{syncSettings.batchSize}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Retry Attempts</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={syncSettings.retryAttempts}
                    onChange={(e) => setSyncSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{syncSettings.retryAttempts}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeSync;