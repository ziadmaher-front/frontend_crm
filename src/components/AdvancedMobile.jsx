import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  RefreshCw, 
  MapPin,
  Camera,
  Mic,
  Bell,
  Settings,
  User,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Battery,
  Signal,
  Globe,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Unlock,
  Sync,
  CloudOff,
  Cloud
} from 'lucide-react';
import { AnimatedCard, StaggerContainer } from '@/components/MicroInteractions';

const AdvancedMobile = ({ 
  isOnline = true, 
  syncStatus = 'synced',
  offlineData = {},
  onSyncData,
  onOfflineToggle,
  mobileSettings = {}
}) => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingSync, setPendingSync] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [dataUsage, setDataUsage] = useState({
    today: 45.2,
    thisMonth: 1.2,
    limit: 5.0
  });

  // Offline capabilities
  const offlineFeatures = [
    {
      id: 'contacts',
      name: 'Contacts',
      icon: User,
      status: 'available',
      lastSync: '2 minutes ago',
      size: '2.3 MB',
      records: 1247
    },
    {
      id: 'deals',
      name: 'Deals',
      icon: BarChart3,
      status: 'syncing',
      lastSync: 'Syncing...',
      size: '1.8 MB',
      records: 89
    },
    {
      id: 'tasks',
      name: 'Tasks',
      icon: CheckCircle,
      status: 'available',
      lastSync: '5 minutes ago',
      size: '0.5 MB',
      records: 156
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      status: 'pending',
      lastSync: '1 hour ago',
      size: '0.8 MB',
      records: 45
    },
    {
      id: 'notes',
      name: 'Notes',
      icon: FileText,
      status: 'available',
      lastSync: '1 minute ago',
      size: '3.1 MB',
      records: 234
    }
  ];

  // Mobile-specific features
  const mobileFeatures = [
    {
      id: 'voice-notes',
      name: 'Voice Notes',
      description: 'Record voice memos and convert to text',
      icon: Mic,
      enabled: true,
      usage: '12 recordings this week'
    },
    {
      id: 'photo-capture',
      name: 'Photo Capture',
      description: 'Take photos and attach to contacts/deals',
      icon: Camera,
      enabled: true,
      usage: '8 photos captured'
    },
    {
      id: 'location-tracking',
      name: 'Location Tracking',
      description: 'Track meeting locations and travel time',
      icon: MapPin,
      enabled: locationEnabled,
      usage: '15 locations logged'
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Real-time alerts and reminders',
      icon: Bell,
      enabled: pushNotifications,
      usage: '23 notifications today'
    },
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      description: 'Swipe gestures and shortcuts',
      icon: Zap,
      enabled: true,
      usage: 'Swipe left: Call, Right: Email'
    },
    {
      id: 'offline-maps',
      name: 'Offline Maps',
      description: 'Download maps for offline navigation',
      icon: Globe,
      enabled: false,
      usage: 'No maps downloaded'
    }
  ];

  // Security features
  const securityFeatures = [
    {
      id: 'biometric',
      name: 'Biometric Authentication',
      description: 'Use fingerprint or face ID to unlock',
      icon: Fingerprint,
      enabled: biometricAuth,
      status: 'configured'
    },
    {
      id: 'auto-lock',
      name: 'Auto Lock',
      description: 'Automatically lock after inactivity',
      icon: Lock,
      enabled: true,
      status: '5 minutes'
    },
    {
      id: 'data-encryption',
      name: 'Data Encryption',
      description: 'Encrypt local data storage',
      icon: Shield,
      enabled: true,
      status: 'AES-256'
    },
    {
      id: 'remote-wipe',
      name: 'Remote Wipe',
      description: 'Remotely clear data if device is lost',
      icon: AlertCircle,
      enabled: true,
      status: 'enabled'
    }
  ];

  // Simulate sync process
  const handleSync = async () => {
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onSyncData) onSyncData();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Toggle offline mode
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
    if (onOfflineToggle) {
      onOfflineToggle(!offlineMode);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50';
      case 'syncing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const OfflineFeatureCard = ({ feature }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <feature.icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{feature.name}</h3>
            <p className="text-sm text-gray-600">{feature.records} records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(feature.status)}
          <Badge className={getStatusColor(feature.status)}>
            {feature.status}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Size:</span>
          <span className="font-medium">{feature.size}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last sync:</span>
          <span className="font-medium">{feature.lastSync}</span>
        </div>
      </div>
    </AnimatedCard>
  );

  const MobileFeatureCard = ({ feature, onToggle }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <feature.icon className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{feature.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{feature.description}</p>
            <p className="text-xs text-gray-500">{feature.usage}</p>
          </div>
        </div>
        <Switch
          checked={feature.enabled}
          onCheckedChange={() => onToggle && onToggle(feature.id)}
        />
      </div>
    </AnimatedCard>
  );

  const SecurityFeatureCard = ({ feature, onToggle }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <feature.icon className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{feature.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{feature.description}</p>
            <p className="text-xs text-gray-500">Status: {feature.status}</p>
          </div>
        </div>
        <Switch
          checked={feature.enabled}
          onCheckedChange={() => onToggle && onToggle(feature.id)}
        />
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Smartphone className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mobile Features</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                {isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <span className="flex items-center gap-1">
                <Battery className="w-4 h-4" />
                85%
              </span>
              <span className="flex items-center gap-1">
                <Signal className="w-4 h-4" />
                4G
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleOfflineMode}
            className={offlineMode ? 'bg-orange-50 border-orange-200' : ''}
          >
            {offlineMode ? <CloudOff className="w-4 h-4 text-orange-600" /> : <Cloud className="w-4 h-4" />}
            {offlineMode ? 'Offline Mode' : 'Online Mode'}
          </Button>
          <Button size="sm" onClick={handleSync} disabled={syncProgress > 0 && syncProgress < 100}>
            <RefreshCw className={`w-4 h-4 ${syncProgress > 0 && syncProgress < 100 ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Sync Progress */}
      {syncProgress > 0 && syncProgress < 100 && (
        <AnimatedCard className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="font-medium">Syncing data...</span>
            <span className="text-sm text-gray-600">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </AnimatedCard>
      )}

      {/* Data Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Used Today</p>
              <p className="text-2xl font-bold text-gray-900">{dataUsage.today} MB</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Usage</p>
              <p className="text-2xl font-bold text-gray-900">{dataUsage.thisMonth} GB</p>
              <div className="mt-2">
                <Progress value={(dataUsage.thisMonth / dataUsage.limit) * 100} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">of {dataUsage.limit} GB limit</p>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline Storage</p>
              <p className="text-2xl font-bold text-gray-900">8.5 MB</p>
              <p className="text-sm text-gray-600">Available offline</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CloudOff className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Mobile Features Tabs */}
      <Tabs defaultValue="offline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="offline" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Offline Data Management</h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offlineFeatures.map(feature => (
              <OfflineFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>

          {/* Offline Actions */}
          <AnimatedCard className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Offline Actions</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Contact Updated</p>
                    <p className="text-sm text-gray-600">John Doe - Phone number changed</p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Note Added</p>
                    <p className="text-sm text-gray-600">Meeting notes for Acme Corp</p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Meeting Scheduled</p>
                    <p className="text-sm text-gray-600">Follow-up call with TechStart</p>
                  </div>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Mobile-Specific Features</h3>
          
          <div className="space-y-4">
            {mobileFeatures.map(feature => (
              <MobileFeatureCard 
                key={feature.id} 
                feature={feature}
                onToggle={(id) => {
                  if (id === 'location-tracking') setLocationEnabled(!locationEnabled);
                  if (id === 'push-notifications') setPushNotifications(!pushNotifications);
                }}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <AnimatedCard className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Phone className="w-6 h-6 mb-2" />
                <span className="text-sm">Quick Call</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Mail className="w-6 h-6 mb-2" />
                <span className="text-sm">Send Email</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm">Text Message</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">Schedule</span>
              </Button>
            </div>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Security & Privacy</h3>
          
          <div className="space-y-4">
            {securityFeatures.map(feature => (
              <SecurityFeatureCard 
                key={feature.id} 
                feature={feature}
                onToggle={(id) => {
                  if (id === 'biometric') setBiometricAuth(!biometricAuth);
                }}
              />
            ))}
          </div>

          {/* Security Status */}
          <AnimatedCard className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Security Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Device Encryption</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">App Lock</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Backup</span>
                <Badge className="bg-blue-100 text-blue-800">Encrypted</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Security Scan</span>
                <span className="text-sm font-medium">2 hours ago</span>
              </div>
            </div>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Mobile Settings</h3>
          
          <div className="space-y-6">
            {/* Display Settings */}
            <AnimatedCard className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Display</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-600">Use dark theme for better battery life</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-rotate</p>
                    <p className="text-sm text-gray-600">Rotate screen automatically</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Large Text</p>
                    <p className="text-sm text-gray-600">Increase text size for better readability</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </AnimatedCard>

            {/* Sync Settings */}
            <AnimatedCard className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Sync & Storage</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Sync</p>
                    <p className="text-sm text-gray-600">Automatically sync when online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WiFi Only Sync</p>
                    <p className="text-sm text-gray-600">Only sync when connected to WiFi</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Background Sync</p>
                    <p className="text-sm text-gray-600">Sync data in the background</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AnimatedCard>

            {/* Performance Settings */}
            <AnimatedCard className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Performance</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reduce Animations</p>
                    <p className="text-sm text-gray-600">Improve performance on older devices</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Image Compression</p>
                    <p className="text-sm text-gray-600">Compress images to save storage</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cache Management</p>
                    <p className="text-sm text-gray-600">Automatically clear old cache</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedMobile;