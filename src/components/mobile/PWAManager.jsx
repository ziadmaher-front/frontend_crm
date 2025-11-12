import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Database, 
  RefreshCw, 
  Battery,
  Signal,
  Globe,
  HardDrive,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Share,
  Home,
  Zap
} from 'lucide-react';

const PWAManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [syncQueue, setSyncQueue] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);

  const [pwaStats, setPwaStats] = useState({
    cacheHits: 1247,
    cacheMisses: 89,
    offlineRequests: 23,
    syncOperations: 156,
    notificationsSent: 45,
    installRate: 78
  });

  const [offlineData, setOfflineData] = useState({
    contacts: 150,
    deals: 89,
    activities: 234,
    lastSync: new Date(Date.now() - 300000) // 5 minutes ago
  });

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Deal Created',
      body: 'Enterprise License deal worth $50,000 has been created',
      timestamp: new Date(),
      read: false,
      type: 'deal'
    },
    {
      id: '2',
      title: 'Contact Updated',
      body: 'John Doe contact information has been updated',
      timestamp: new Date(Date.now() - 120000),
      read: false,
      type: 'contact'
    },
    {
      id: '3',
      title: 'Sync Complete',
      body: 'All offline changes have been synchronized',
      timestamp: new Date(Date.now() - 300000),
      read: true,
      type: 'sync'
    }
  ]);

  const [deviceInfo, setDeviceInfo] = useState({
    platform: 'Unknown',
    userAgent: navigator.userAgent,
    screenSize: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    touchSupport: 'ontouchstart' in window,
    orientation: screen.orientation?.type || 'unknown'
  });

  useEffect(() => {
    // Detect platform
    const platform = /Android/i.test(navigator.userAgent) ? 'Android' :
                    /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' :
                    /Windows/i.test(navigator.userAgent) ? 'Windows' :
                    /Mac/i.test(navigator.userAgent) ? 'macOS' : 'Unknown';
    
    setDeviceInfo(prev => ({ ...prev, platform }));

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if PWA is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    // Request notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    // Simulate cache size calculation
    if ('caches' in window) {
      calculateCacheSize();
    }

    // Simulate sync queue
    simulateSyncQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const calculateCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setCacheSize(estimate.usage || 0);
      } else {
        // Fallback simulation
        setCacheSize(Math.floor(Math.random() * 50000000) + 10000000); // 10-60MB
      }
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSize(25000000); // 25MB fallback
    }
  };

  const simulateSyncQueue = () => {
    const queueItems = [
      { id: '1', type: 'contact', action: 'update', data: 'John Doe', status: 'pending' },
      { id: '2', type: 'deal', action: 'create', data: 'New Enterprise Deal', status: 'syncing' },
      { id: '3', type: 'activity', action: 'complete', data: 'Follow-up call', status: 'failed' }
    ];
    setSyncQueue(queueItems);
  };

  const handleInstallPWA = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      if (result.outcome === 'accepted') {
        setIsPWAInstalled(true);
        setInstallPrompt(null);
      }
    }
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        // Send a test notification
        new Notification('CRM Notifications Enabled', {
          body: 'You will now receive important updates from your CRM',
          icon: '/icon-192x192.png'
        });
      }
    }
  };

  const handleSendTestNotification = () => {
    if (notificationsEnabled) {
      new Notification('Test Notification', {
        body: 'This is a test notification from your CRM system',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });
    }
  };

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setCacheSize(0);
        
        // Show success message
        alert('Cache cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache');
    }
  };

  const handleForceSync = () => {
    // Simulate sync operation
    setSyncQueue(prev => prev.map(item => ({ ...item, status: 'syncing' })));
    
    setTimeout(() => {
      setSyncQueue(prev => prev.map(item => ({ ...item, status: 'completed' })));
      setOfflineData(prev => ({ ...prev, lastSync: new Date() }));
    }, 2000);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'text-red-600', icon: WifiOff };
    
    // Simulate connection quality
    const quality = Math.random();
    if (quality > 0.8) return { status: 'excellent', color: 'text-green-600', icon: Wifi };
    if (quality > 0.6) return { status: 'good', color: 'text-blue-600', icon: Wifi };
    if (quality > 0.4) return { status: 'fair', color: 'text-yellow-600', icon: Wifi };
    return { status: 'poor', color: 'text-orange-600', icon: Wifi };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">PWA Manager</h1>
          <p className="text-muted-foreground">Progressive Web App features and offline functionality</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-2 ${connectionStatus.color}`}>
            <connectionStatus.icon className="h-5 w-5" />
            <span className="font-medium capitalize">{connectionStatus.status}</span>
          </div>
          {!isPWAInstalled && installPrompt && (
            <Button onClick={handleInstallPWA} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Install App
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
              <CardTitle className="text-sm font-medium">PWA Status</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPWAInstalled ? 'Installed' : 'Available'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPWAInstalled ? 'Running as app' : 'Can be installed'}
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
              <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
              <HardDrive className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(cacheSize)}</div>
              <p className="text-xs text-muted-foreground">
                Offline storage used
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
              <CardTitle className="text-sm font-medium">Sync Queue</CardTitle>
              <RefreshCw className="h-4 w-4 text-purple-600" />
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              {notificationsEnabled ? <Bell className="h-4 w-4 text-yellow-600" /> : <BellOff className="h-4 w-4 text-gray-400" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notificationsEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-xs text-muted-foreground">
                Push notifications
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="installation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="installation">Installation</TabsTrigger>
          <TabsTrigger value="offline">Offline Mode</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sync">Background Sync</TabsTrigger>
          <TabsTrigger value="device">Device Info</TabsTrigger>
        </TabsList>

        <TabsContent value="installation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>PWA Installation</CardTitle>
                <CardDescription>Install the CRM as a native app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPWAInstalled ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      CRM is installed and running as a Progressive Web App
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Alert>
                      <Download className="h-4 w-4" />
                      <AlertDescription>
                        Install the CRM as an app for better performance and offline access
                      </AlertDescription>
                    </Alert>
                    
                    {installPrompt ? (
                      <Button onClick={handleInstallPWA} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Install CRM App
                      </Button>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Installation prompt not available. You can manually install by:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Chrome: Menu → Install CRM</li>
                          <li>Safari: Share → Add to Home Screen</li>
                          <li>Edge: Menu → Apps → Install this site as an app</li>
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">App Features</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Works offline</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Push notifications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Background sync</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Native app experience</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installation Stats</CardTitle>
                <CardDescription>PWA adoption and usage metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Install Rate</span>
                      <span>{pwaStats.installRate}%</span>
                    </div>
                    <Progress value={pwaStats.installRate} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{pwaStats.cacheHits}</div>
                      <div className="text-xs text-muted-foreground">Cache Hits</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{pwaStats.cacheMisses}</div>
                      <div className="text-xs text-muted-foreground">Cache Misses</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Cache hit ratio: {Math.round((pwaStats.cacheHits / (pwaStats.cacheHits + pwaStats.cacheMisses)) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Offline Functionality</CardTitle>
                <CardDescription>Work without internet connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Offline Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable offline data access</p>
                  </div>
                  <Switch
                    checked={offlineMode}
                    onCheckedChange={setOfflineMode}
                  />
                </div>

                <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  <AlertDescription>
                    {isOnline ? 'Online - All features available' : 'Offline - Limited functionality'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Cached Data</h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold">{offlineData.contacts}</div>
                      <div className="text-xs text-muted-foreground">Contacts</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold">{offlineData.deals}</div>
                      <div className="text-xs text-muted-foreground">Deals</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-bold">{offlineData.activities}</div>
                      <div className="text-xs text-muted-foreground">Activities</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last sync: {offlineData.lastSync.toLocaleString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleClearCache} variant="outline" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button onClick={handleForceSync} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Force Sync
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offline Requests</CardTitle>
                <CardDescription>Requests made while offline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{pwaStats.offlineRequests}</div>
                    <div className="text-sm text-muted-foreground">Offline requests handled</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Offline requests are queued and will sync when connection is restored
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Stay updated with important events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications</p>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={handleRequestNotifications}
                  />
                </div>

                {!notificationsEnabled && (
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      Enable notifications to receive important updates about deals, contacts, and activities
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button 
                    onClick={handleRequestNotifications} 
                    disabled={notificationsEnabled}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    {notificationsEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
                  </Button>
                  
                  {notificationsEnabled && (
                    <Button 
                      onClick={handleSendTestNotification} 
                      variant="outline"
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Send Test Notification
                    </Button>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{pwaStats.notificationsSent}</div>
                  <div className="text-sm text-muted-foreground">Notifications sent this month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest push notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {notification.type === 'deal' && <Database className="h-4 w-4 text-green-600" />}
                        {notification.type === 'contact' && <Smartphone className="h-4 w-4 text-blue-600" />}
                        {notification.type === 'sync' && <RefreshCw className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{notification.body}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Background Sync</CardTitle>
                <CardDescription>Automatic data synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Background Sync</Label>
                    <p className="text-sm text-muted-foreground">Sync data when connection is restored</p>
                  </div>
                  <Switch
                    checked={backgroundSync}
                    onCheckedChange={setBackgroundSync}
                  />
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{pwaStats.syncOperations}</div>
                  <div className="text-sm text-muted-foreground">Sync operations completed</div>
                </div>

                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    Background sync ensures your data is always up to date, even after being offline
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Queue</CardTitle>
                <CardDescription>Pending synchronization operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {item.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {item.status === 'syncing' && <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />}
                          {item.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                          {item.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{item.data}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.type} • {item.action}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className={
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'syncing' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="device" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>Current device and browser capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Platform</Label>
                    <div className="text-lg">{deviceInfo.platform}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Screen Size</Label>
                    <div className="text-lg">{deviceInfo.screenSize}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Color Depth</Label>
                    <div className="text-lg">{deviceInfo.colorDepth}-bit</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Pixel Ratio</Label>
                    <div className="text-lg">{deviceInfo.pixelRatio}x</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Touch Support</Label>
                    <div className="text-lg">
                      {deviceInfo.touchSupport ? (
                        <Badge className="bg-green-100 text-green-800">Supported</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Not Supported</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Orientation</Label>
                    <div className="text-lg capitalize">{deviceInfo.orientation}</div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Connection</Label>
                    <div className="text-lg">
                      <Badge className={isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Label className="text-sm font-medium">User Agent</Label>
                <div className="text-xs text-muted-foreground font-mono mt-1 p-2 bg-gray-50 rounded">
                  {deviceInfo.userAgent}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PWAManager;