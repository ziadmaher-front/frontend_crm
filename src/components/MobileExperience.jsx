import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smartphone, 
  Tablet, 
  Wifi, 
  WifiOff, 
  Bell, 
  BellOff, 
  Download, 
  Upload, 
  RefreshCw, 
  Battery,
  Signal,
  Settings,
  User,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Camera,
  Mic,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Sync,
  Plus,
  Edit,
  Trash2,
  Share2,
  Bookmark,
  Star,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Globe,
  Cloud,
  CloudOff,
  Database,
  HardDrive,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Vibrate,
  Moon,
  Sun,
  Palette,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  Home,
  Menu,
  X
} from 'lucide-react';

const MobileExperience = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState('mobile');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [signalStrength, setSignalStrength] = useState(4);

  // Mobile app statistics
  const mobileStats = {
    totalUsers: 12847,
    activeUsers: 8934,
    offlineUsers: 234,
    avgSessionTime: '12m 34s',
    dailyActiveUsers: 5678,
    weeklyActiveUsers: 9876,
    monthlyActiveUsers: 12847,
    crashRate: 0.02,
    appRating: 4.8,
    downloadSize: '45.2 MB',
    offlineStorage: '128 MB',
    syncFrequency: '5 minutes'
  };

  // Offline capabilities
  const offlineFeatures = [
    {
      id: 1,
      name: 'Contact Management',
      description: 'View and edit contacts offline',
      status: 'enabled',
      storageUsed: '12.3 MB',
      lastSync: '2 minutes ago',
      priority: 'high',
      syncConflicts: 0
    },
    {
      id: 2,
      name: 'Deal Pipeline',
      description: 'Access and update deals without internet',
      status: 'enabled',
      storageUsed: '8.7 MB',
      lastSync: '5 minutes ago',
      priority: 'high',
      syncConflicts: 2
    },
    {
      id: 3,
      name: 'Task Management',
      description: 'Create and complete tasks offline',
      status: 'enabled',
      storageUsed: '3.2 MB',
      lastSync: '1 minute ago',
      priority: 'medium',
      syncConflicts: 0
    },
    {
      id: 4,
      name: 'Calendar Events',
      description: 'View upcoming meetings and events',
      status: 'enabled',
      storageUsed: '5.1 MB',
      lastSync: '3 minutes ago',
      priority: 'medium',
      syncConflicts: 1
    },
    {
      id: 5,
      name: 'Email Templates',
      description: 'Access email templates for quick responses',
      status: 'disabled',
      storageUsed: '0 MB',
      lastSync: 'Never',
      priority: 'low',
      syncConflicts: 0
    },
    {
      id: 6,
      name: 'Reports & Analytics',
      description: 'View cached reports and dashboards',
      status: 'partial',
      storageUsed: '15.8 MB',
      lastSync: '10 minutes ago',
      priority: 'low',
      syncConflicts: 0
    }
  ];

  // Push notification settings
  const notificationTypes = [
    {
      id: 1,
      name: 'New Leads',
      description: 'Get notified when new leads are assigned',
      enabled: true,
      priority: 'high',
      sound: true,
      vibration: true,
      badge: true,
      frequency: 'immediate'
    },
    {
      id: 2,
      name: 'Deal Updates',
      description: 'Notifications for deal stage changes',
      enabled: true,
      priority: 'high',
      sound: true,
      vibration: false,
      badge: true,
      frequency: 'immediate'
    },
    {
      id: 3,
      name: 'Task Reminders',
      description: 'Reminders for upcoming tasks',
      enabled: true,
      priority: 'medium',
      sound: false,
      vibration: true,
      badge: true,
      frequency: '15 minutes before'
    },
    {
      id: 4,
      name: 'Meeting Alerts',
      description: 'Alerts for scheduled meetings',
      enabled: true,
      priority: 'high',
      sound: true,
      vibration: true,
      badge: false,
      frequency: '10 minutes before'
    },
    {
      id: 5,
      name: 'Email Responses',
      description: 'Notifications for email replies',
      enabled: false,
      priority: 'low',
      sound: false,
      vibration: false,
      badge: true,
      frequency: 'batched hourly'
    },
    {
      id: 6,
      name: 'System Updates',
      description: 'App updates and maintenance notifications',
      enabled: true,
      priority: 'low',
      sound: false,
      vibration: false,
      badge: false,
      frequency: 'weekly'
    }
  ];

  // Recent sync activities
  const syncActivities = [
    {
      id: 1,
      type: 'contact',
      action: 'updated',
      item: 'John Smith - Acme Corp',
      timestamp: '2 minutes ago',
      status: 'success',
      conflicts: 0
    },
    {
      id: 2,
      type: 'deal',
      action: 'created',
      item: 'New Enterprise Deal - $50K',
      timestamp: '5 minutes ago',
      status: 'success',
      conflicts: 0
    },
    {
      id: 3,
      type: 'task',
      action: 'completed',
      item: 'Follow up with TechStart Inc',
      timestamp: '8 minutes ago',
      status: 'success',
      conflicts: 0
    },
    {
      id: 4,
      type: 'contact',
      action: 'updated',
      item: 'Sarah Johnson - Global Tech',
      timestamp: '12 minutes ago',
      status: 'conflict',
      conflicts: 1
    },
    {
      id: 5,
      type: 'calendar',
      action: 'synced',
      item: '15 upcoming events',
      timestamp: '15 minutes ago',
      status: 'success',
      conflicts: 0
    }
  ];

  // Mobile optimization features
  const mobileFeatures = [
    {
      id: 1,
      name: 'Touch Gestures',
      description: 'Swipe actions for quick operations',
      enabled: true,
      category: 'Navigation'
    },
    {
      id: 2,
      name: 'Voice Commands',
      description: 'Voice-activated CRM operations',
      enabled: true,
      category: 'Accessibility'
    },
    {
      id: 3,
      name: 'Quick Actions',
      description: 'One-tap shortcuts for common tasks',
      enabled: true,
      category: 'Productivity'
    },
    {
      id: 4,
      name: 'Dark Mode',
      description: 'Battery-saving dark theme',
      enabled: false,
      category: 'Display'
    },
    {
      id: 5,
      name: 'Biometric Auth',
      description: 'Fingerprint and face unlock',
      enabled: true,
      category: 'Security'
    },
    {
      id: 6,
      name: 'Location Services',
      description: 'GPS-based check-ins and tracking',
      enabled: true,
      category: 'Location'
    }
  ];

  // Device compatibility
  const deviceCompatibility = [
    {
      device: 'iPhone',
      versions: ['iOS 14+'],
      features: ['All features supported', 'Face ID', 'Siri integration'],
      performance: 'Excellent',
      rating: 4.9
    },
    {
      device: 'Android',
      versions: ['Android 8+'],
      features: ['All features supported', 'Fingerprint', 'Google Assistant'],
      performance: 'Excellent',
      rating: 4.7
    },
    {
      device: 'iPad',
      versions: ['iPadOS 14+'],
      features: ['Tablet-optimized UI', 'Split screen', 'Apple Pencil'],
      performance: 'Excellent',
      rating: 4.8
    },
    {
      device: 'Android Tablet',
      versions: ['Android 8+'],
      features: ['Tablet layout', 'Multi-window', 'Stylus support'],
      performance: 'Good',
      rating: 4.5
    }
  ];

  const handleSyncNow = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 3000);
  };

  const handleOfflineToggle = () => {
    setOfflineMode(!offlineMode);
    setIsOnline(!offlineMode);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'enabled': return 'text-green-600 bg-green-50 border-green-200';
      case 'disabled': return 'text-red-600 bg-red-50 border-red-200';
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'syncing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'synced': return 'text-green-600 bg-green-50 border-green-200';
      case 'conflict': return 'text-red-600 bg-red-50 border-red-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  const OfflineFeatureCard = ({ feature }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{feature.name}</h4>
              <Badge className={getStatusColor(feature.status)}>
                {feature.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                {feature.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
          </div>
          <Switch 
            checked={feature.status === 'enabled'} 
            onCheckedChange={() => console.log('Toggle feature:', feature.id)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Storage Used</div>
            <div className="font-semibold">{feature.storageUsed}</div>
          </div>
          <div>
            <div className="text-gray-500">Last Sync</div>
            <div className="font-semibold">{feature.lastSync}</div>
          </div>
        </div>

        {feature.syncConflicts > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {feature.syncConflicts} sync conflict{feature.syncConflicts > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const NotificationCard = ({ notification }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{notification.name}</h4>
              <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                {notification.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{notification.description}</p>
            <div className="text-xs text-gray-500">
              Frequency: {notification.frequency}
            </div>
          </div>
          <Switch 
            checked={notification.enabled} 
            onCheckedChange={() => console.log('Toggle notification:', notification.id)}
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Volume2 className={`h-4 w-4 ${notification.sound ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-xs">Sound</span>
          </div>
          <div className="flex items-center gap-2">
            <Vibrate className={`h-4 w-4 ${notification.vibration ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-xs">Vibrate</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className={`h-4 w-4 ${notification.badge ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-xs">Badge</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-xs">Config</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mobile Experience</h2>
          <p className="text-gray-600">Optimize CRM for mobile devices with offline capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleSyncNow}>
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Mobile Status Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Mobile Status</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-3 rounded ${
                        bar <= signalStrength ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4" />
                <div className="w-8 h-4 border border-gray-300 rounded-sm relative">
                  <div 
                    className={`h-full rounded-sm ${
                      batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>
                <span className="text-sm">{batteryLevel}%</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Users"
              value={mobileStats.activeUsers.toLocaleString()}
              change="+12.5%"
              icon={Users}
              trend="up"
              color="green"
            />
            <MetricCard
              title="Avg Session"
              value={mobileStats.avgSessionTime}
              change="+2m 15s"
              icon={Clock}
              trend="up"
              color="blue"
            />
            <MetricCard
              title="App Rating"
              value={mobileStats.appRating}
              change="+0.2"
              icon={Star}
              trend="up"
              color="yellow"
            />
            <MetricCard
              title="Offline Storage"
              value={mobileStats.offlineStorage}
              change="12% used"
              icon={HardDrive}
              trend="up"
              color="purple"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="offline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="offline">Offline Features</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
          <TabsTrigger value="optimization">Mobile Optimization</TabsTrigger>
          <TabsTrigger value="sync">Sync Management</TabsTrigger>
          <TabsTrigger value="compatibility">Device Support</TabsTrigger>
        </TabsList>

        <TabsContent value="offline" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Offline Capabilities</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="offline-mode">Offline Mode</Label>
              <Switch 
                id="offline-mode"
                checked={offlineMode} 
                onCheckedChange={handleOfflineToggle}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {offlineFeatures.map(feature => (
              <OfflineFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>

          {/* Offline Storage Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Offline Storage</span>
                  <span className="font-semibold">{mobileStats.offlineStorage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Used Storage</span>
                  <span className="font-semibold">
                    {offlineFeatures.reduce((total, feature) => {
                      const size = parseFloat(feature.storageUsed.replace(' MB', '')) || 0;
                      return total + size;
                    }, 0).toFixed(1)} MB
                  </span>
                </div>
                <Progress 
                  value={(offlineFeatures.reduce((total, feature) => {
                    const size = parseFloat(feature.storageUsed.replace(' MB', '')) || 0;
                    return total + size;
                  }, 0) / 128) * 100} 
                  className="h-2"
                />
                <div className="text-sm text-gray-600">
                  Storage will be automatically managed when limit is reached
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Push Notification Settings</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="notifications-enabled">Enable Notifications</Label>
              <Switch 
                id="notifications-enabled"
                checked={notificationsEnabled} 
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {notificationTypes.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>

          {/* Notification Analytics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Daily Notifications</p>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-sm text-green-600">+15% from yesterday</p>
                  </div>
                  <Bell className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-sm text-green-600">+3% this week</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Action Rate</p>
                    <p className="text-2xl font-bold">45%</p>
                    <p className="text-sm text-red-600">-2% this week</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Mobile Optimization Features</h3>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mobileFeatures.map(feature => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{feature.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                      <Badge variant="outline">{feature.category}</Badge>
                    </div>
                    <Switch 
                      checked={feature.enabled} 
                      onCheckedChange={() => console.log('Toggle feature:', feature.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>App Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">App Launch Time</span>
                    <span className="font-semibold">1.2s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-semibold">45 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CPU Usage</span>
                    <span className="font-semibold">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crash Rate</span>
                    <span className="font-semibold text-green-600">{mobileStats.crashRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-semibold">{mobileStats.dailyActiveUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Session Duration</span>
                    <span className="font-semibold">{mobileStats.avgSessionTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retention Rate (7d)</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Feature Adoption</span>
                    <span className="font-semibold">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sync Management</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm" onClick={handleSyncNow}>
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Now
              </Button>
            </div>
          </div>

          {/* Sync Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  ) : syncStatus === 'synced' ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <h4 className="font-semibold">
                      {syncStatus === 'syncing' ? 'Syncing...' : 
                       syncStatus === 'synced' ? 'All data synced' : 'Sync failed'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Last sync: {syncStatus === 'syncing' ? 'In progress' : '2 minutes ago'}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(syncStatus)}>
                  {syncStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-gray-600">Records Synced</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">23</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-gray-600">Conflicts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5m</div>
                  <div className="text-sm text-gray-600">Frequency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sync Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sync Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {syncActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : activity.status === 'conflict' ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{activity.item}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {activity.type} {activity.action}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{activity.timestamp}</div>
                        {activity.conflicts > 0 && (
                          <div className="text-xs text-red-600">
                            {activity.conflicts} conflict{activity.conflicts > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Device Compatibility</h3>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download App
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {deviceCompatibility.map((device, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {device.device.includes('iPhone') || device.device.includes('iPad') ? (
                        <Smartphone className="h-8 w-8 text-gray-600" />
                      ) : device.device.includes('Tablet') ? (
                        <Tablet className="h-8 w-8 text-gray-600" />
                      ) : (
                        <Smartphone className="h-8 w-8 text-gray-600" />
                      )}
                      <div>
                        <h4 className="font-semibold text-lg">{device.device}</h4>
                        <p className="text-sm text-gray-600">{device.versions.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{device.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">{device.performance}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Supported Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {device.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* App Store Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>App Store Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Downloads</span>
                    <span className="font-semibold">125K+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-semibold">{mobileStats.appRating}/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">App Size</span>
                    <span className="font-semibold">{mobileStats.downloadSize}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Update</span>
                    <span className="font-semibold">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimum iOS</span>
                    <span className="font-semibold">14.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Minimum Android</span>
                    <span className="font-semibold">8.0 (API 26)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">RAM Required</span>
                    <span className="font-semibold">2GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Required</span>
                    <span className="font-semibold">100MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileExperience;