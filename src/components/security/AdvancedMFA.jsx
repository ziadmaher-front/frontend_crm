import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Fingerprint,
  Eye,
  EyeOff,
  Scan,
  ScanLine,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  Monitor,
  Settings,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Bell,
  User,
  Users,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  Lock,
  Unlock,
  Zap,
  Target,
  Database,
  Server,
  HardDrive,
  Network,
  CreditCard,
  QrCode,
  Usb,
  Bluetooth,
  Radio,
  Cpu,
  MemoryStick,
  HardDriveIcon,
  MousePointer,
  Keyboard,
  Headphones,
  Camera,
  Mic,
  Speaker,
  Battery,
  Power,
  Plug,
  Cable,
  Router,
  Antenna,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

// MFA Method Types
const MFA_METHODS = {
  SMS: {
    name: 'SMS Authentication',
    icon: Smartphone,
    description: 'Text message verification codes',
    security: 'medium',
    setup: 'easy',
    reliability: 85
  },
  EMAIL: {
    name: 'Email Authentication',
    icon: Bell,
    description: 'Email verification codes',
    security: 'medium',
    setup: 'easy',
    reliability: 90
  },
  TOTP: {
    name: 'Authenticator App',
    icon: QrCode,
    description: 'Time-based one-time passwords',
    security: 'high',
    setup: 'medium',
    reliability: 95
  },
  HARDWARE: {
    name: 'Hardware Token',
    icon: Key,
    description: 'Physical security keys (FIDO2/WebAuthn)',
    security: 'very_high',
    setup: 'medium',
    reliability: 98
  },
  BIOMETRIC: {
    name: 'Biometric Authentication',
    icon: Fingerprint,
    description: 'Fingerprint, face, or voice recognition',
    security: 'very_high',
    setup: 'easy',
    reliability: 92
  },
  PUSH: {
    name: 'Push Notification',
    icon: Smartphone,
    description: 'Mobile app push notifications',
    security: 'high',
    setup: 'medium',
    reliability: 88
  }
};

// Risk Levels
const RISK_LEVELS = {
  LOW: { name: 'Low Risk', color: 'green', threshold: 30 },
  MEDIUM: { name: 'Medium Risk', color: 'yellow', threshold: 60 },
  HIGH: { name: 'High Risk', color: 'orange', threshold: 85 },
  CRITICAL: { name: 'Critical Risk', color: 'red', threshold: 100 }
};

// Sample user MFA configurations
const userMFAConfigs = [
  {
    id: 'user_001',
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: 'Admin',
    mfaEnabled: true,
    methods: ['TOTP', 'HARDWARE', 'BIOMETRIC'],
    primaryMethod: 'HARDWARE',
    backupMethods: ['TOTP', 'BIOMETRIC'],
    lastAuth: new Date('2024-01-15T09:30:00Z'),
    authAttempts: 3,
    failedAttempts: 0,
    riskScore: 15,
    deviceCount: 4,
    trustedDevices: 2,
    adaptiveEnabled: true,
    biometricEnabled: true,
    hardwareTokens: 2
  },
  {
    id: 'user_002',
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    role: 'Manager',
    mfaEnabled: true,
    methods: ['TOTP', 'SMS'],
    primaryMethod: 'TOTP',
    backupMethods: ['SMS'],
    lastAuth: new Date('2024-01-15T08:45:00Z'),
    authAttempts: 1,
    failedAttempts: 1,
    riskScore: 45,
    deviceCount: 2,
    trustedDevices: 1,
    adaptiveEnabled: true,
    biometricEnabled: false,
    hardwareTokens: 0
  },
  {
    id: 'user_003',
    email: 'bob.wilson@company.com',
    name: 'Bob Wilson',
    role: 'Sales',
    mfaEnabled: false,
    methods: [],
    primaryMethod: null,
    backupMethods: [],
    lastAuth: new Date('2024-01-14T16:20:00Z'),
    authAttempts: 0,
    failedAttempts: 3,
    riskScore: 85,
    deviceCount: 1,
    trustedDevices: 0,
    adaptiveEnabled: false,
    biometricEnabled: false,
    hardwareTokens: 0
  }
];

// Authentication events
const authEvents = [
  {
    id: 'event_001',
    userId: 'user_001',
    email: 'john.doe@company.com',
    timestamp: new Date('2024-01-15T09:30:00Z'),
    method: 'HARDWARE',
    result: 'success',
    riskScore: 15,
    location: 'New York, NY',
    device: 'Chrome on Windows',
    ipAddress: '192.168.1.100',
    duration: 2.3
  },
  {
    id: 'event_002',
    userId: 'user_002',
    email: 'jane.smith@company.com',
    timestamp: new Date('2024-01-15T08:45:00Z'),
    method: 'TOTP',
    result: 'success',
    riskScore: 25,
    location: 'San Francisco, CA',
    device: 'Safari on macOS',
    ipAddress: '192.168.1.105',
    duration: 8.7
  },
  {
    id: 'event_003',
    userId: 'user_003',
    email: 'bob.wilson@company.com',
    timestamp: new Date('2024-01-15T07:15:00Z'),
    method: 'SMS',
    result: 'failed',
    riskScore: 75,
    location: 'Unknown',
    device: 'Chrome on Android',
    ipAddress: '203.0.113.45',
    duration: 45.2
  },
  {
    id: 'event_004',
    userId: 'user_001',
    email: 'john.doe@company.com',
    timestamp: new Date('2024-01-15T06:30:00Z'),
    method: 'BIOMETRIC',
    result: 'success',
    riskScore: 10,
    location: 'New York, NY',
    device: 'Mobile App on iOS',
    ipAddress: '192.168.1.100',
    duration: 1.8
  }
];

// Hardware tokens
const hardwareTokens = [
  {
    id: 'token_001',
    name: 'YubiKey 5 NFC',
    type: 'FIDO2',
    userId: 'user_001',
    serialNumber: 'YK5NFC-12345678',
    registeredDate: new Date('2024-01-01T00:00:00Z'),
    lastUsed: new Date('2024-01-15T09:30:00Z'),
    usageCount: 247,
    status: 'active',
    protocols: ['FIDO2', 'WebAuthn', 'OTP'],
    batteryLevel: null,
    firmwareVersion: '5.4.3'
  },
  {
    id: 'token_002',
    name: 'Google Titan Key',
    type: 'FIDO2',
    userId: 'user_001',
    serialNumber: 'GTK-87654321',
    registeredDate: new Date('2024-01-05T00:00:00Z'),
    lastUsed: new Date('2024-01-14T15:20:00Z'),
    usageCount: 89,
    status: 'active',
    protocols: ['FIDO2', 'WebAuthn'],
    batteryLevel: 85,
    firmwareVersion: '2.1.0'
  }
];

// Biometric enrollments
const biometricEnrollments = [
  {
    id: 'bio_001',
    userId: 'user_001',
    type: 'fingerprint',
    enrolledDate: new Date('2024-01-01T00:00:00Z'),
    lastUsed: new Date('2024-01-15T06:30:00Z'),
    usageCount: 156,
    accuracy: 98.5,
    status: 'active',
    deviceId: 'iPhone-12345',
    templateQuality: 'high'
  },
  {
    id: 'bio_002',
    userId: 'user_001',
    type: 'face',
    enrolledDate: new Date('2024-01-02T00:00:00Z'),
    lastUsed: new Date('2024-01-14T18:45:00Z'),
    usageCount: 89,
    accuracy: 96.2,
    status: 'active',
    deviceId: 'iPhone-12345',
    templateQuality: 'high'
  }
];

// MFA Analytics
const mfaAnalytics = {
  totalUsers: 1247,
  mfaEnabledUsers: 1089,
  adoptionRate: 87.3,
  averageRiskScore: 32,
  successRate: 94.2,
  averageAuthTime: 5.8,
  hardwareTokenUsers: 234,
  biometricUsers: 456,
  adaptiveAuthUsers: 789
};

// Authentication trends
const authTrends = [
  { date: '2024-01-09', attempts: 1245, successes: 1178, failures: 67, avgRisk: 28 },
  { date: '2024-01-10', attempts: 1356, successes: 1289, failures: 67, avgRisk: 31 },
  { date: '2024-01-11', attempts: 1189, successes: 1134, failures: 55, avgRisk: 26 },
  { date: '2024-01-12', attempts: 1423, successes: 1356, failures: 67, avgRisk: 33 },
  { date: '2024-01-13', attempts: 1298, successes: 1234, failures: 64, avgRisk: 29 },
  { date: '2024-01-14', attempts: 1367, successes: 1298, failures: 69, avgRisk: 35 },
  { date: '2024-01-15', attempts: 1456, successes: 1389, failures: 67, avgRisk: 32 }
];

const AdvancedMFA = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-600 bg-green-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    if (score <= 85) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSecurityLevel = (methods) => {
    if (methods.includes('HARDWARE') || methods.includes('BIOMETRIC')) return 'Very High';
    if (methods.includes('TOTP')) return 'High';
    if (methods.includes('SMS') || methods.includes('EMAIL')) return 'Medium';
    return 'Low';
  };

  const UserMFACard = ({ user }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedUser(user)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${user.mfaEnabled ? 'bg-green-100' : 'bg-red-100'}`}>
              <User className={`h-4 w-4 ${user.mfaEnabled ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{user.name}</h3>
              <p className="text-xs text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={user.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {user.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge className={getRiskColor(user.riskScore)} variant="outline">
              Risk: {user.riskScore}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <span className="text-gray-600">Methods:</span>
            <span className="ml-1 font-medium">{user.methods.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Devices:</span>
            <span className="ml-1 font-medium">{user.deviceCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Security:</span>
            <span className="ml-1 font-medium">{getSecurityLevel(user.methods)}</span>
          </div>
          <div>
            <span className="text-gray-600">Failed:</span>
            <span className={`ml-1 font-medium ${user.failedAttempts > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {user.failedAttempts}
            </span>
          </div>
        </div>

        {user.mfaEnabled && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {user.methods.map((method) => {
                const MethodIcon = MFA_METHODS[method]?.icon || Key;
                return (
                  <div key={method} className="flex items-center space-x-1 bg-gray-100 rounded px-2 py-1">
                    <MethodIcon className="h-3 w-3" />
                    <span className="text-xs">{method}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Primary:</span>
              <span className="font-medium">{user.primaryMethod}</span>
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Risk Score:</span>
            <span className="font-medium">{user.riskScore}%</span>
          </div>
          <Progress value={user.riskScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  const AuthEventCard = ({ event }) => {
    const MethodIcon = MFA_METHODS[event.method]?.icon || Key;
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${event.result === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                <MethodIcon className={`h-4 w-4 ${event.result === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{event.email}</h3>
                <p className="text-xs text-gray-600">{MFA_METHODS[event.method]?.name}</p>
                <p className="text-xs text-gray-500">{event.timestamp.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={event.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {event.result}
              </Badge>
              <Badge className={getRiskColor(event.riskScore)} variant="outline">
                Risk: {event.riskScore}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-1 font-medium">{event.location}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-1 font-medium">{event.duration}s</span>
            </div>
            <div>
              <span className="text-gray-600">Device:</span>
              <span className="ml-1 font-medium">{event.device}</span>
            </div>
            <div>
              <span className="text-gray-600">IP:</span>
              <span className="ml-1 font-medium">{event.ipAddress}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const HardwareTokenCard = ({ token }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedToken(token)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{token.name}</h3>
              <p className="text-xs text-gray-600">{token.serialNumber}</p>
              <p className="text-xs text-gray-500">{token.type}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={token.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {token.status}
            </Badge>
            {token.batteryLevel && (
              <div className="flex items-center mt-1">
                <Battery className="h-3 w-3 text-gray-600 mr-1" />
                <span className="text-xs">{token.batteryLevel}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Usage:</span>
            <span className="ml-1 font-medium">{token.usageCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Firmware:</span>
            <span className="ml-1 font-medium">{token.firmwareVersion}</span>
          </div>
          <div>
            <span className="text-gray-600">Registered:</span>
            <span className="ml-1 font-medium">{token.registeredDate.toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Used:</span>
            <span className="ml-1 font-medium">{token.lastUsed.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs text-gray-600">Protocols:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {token.protocols.map((protocol) => (
              <Badge key={protocol} variant="outline" className="text-xs">
                {protocol}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BiometricCard = ({ biometric }) => {
    const getTypeIcon = (type) => {
      switch (type) {
        case 'fingerprint': return Fingerprint;
        case 'face': return Eye;
        case 'voice': return Mic;
        default: return Scan;
      }
    };

    const TypeIcon = getTypeIcon(biometric.type);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TypeIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm capitalize">{biometric.type} Recognition</h3>
                <p className="text-xs text-gray-600">{biometric.deviceId}</p>
                <p className="text-xs text-gray-500">Quality: {biometric.templateQuality}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={biometric.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {biometric.status}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {biometric.accuracy}% accuracy
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Usage:</span>
              <span className="ml-1 font-medium">{biometric.usageCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Enrolled:</span>
              <span className="ml-1 font-medium">{biometric.enrolledDate.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Last Used:</span>
              <span className="ml-1 font-medium">{biometric.lastUsed.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <span className="ml-1 font-medium">{biometric.accuracy}%</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-medium">{biometric.accuracy}%</span>
            </div>
            <Progress value={biometric.accuracy} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced MFA</h1>
          <p className="text-gray-600 mt-1">
            Multi-factor authentication with biometric support and adaptive security
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowSetupDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Setup MFA
          </Button>
          <Button variant="outline" onClick={() => setShowTokenDialog(true)}>
            <Key className="h-4 w-4 mr-2" />
            Add Token
          </Button>
          <Button variant="outline" onClick={() => setIsScanning(true)}>
            <Scan className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
            Scan Devices
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">MFA Adoption</p>
                <p className="text-2xl font-bold text-green-600">{mfaAnalytics.adoptionRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Users className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">{mfaAnalytics.mfaEnabledUsers} of {mfaAnalytics.totalUsers} users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{mfaAnalytics.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Clock className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">Avg: {mfaAnalytics.averageAuthTime}s</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hardware Tokens</p>
                <p className="text-2xl font-bold text-purple-600">{mfaAnalytics.hardwareTokenUsers}</p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Fingerprint className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">{mfaAnalytics.biometricUsers} biometric users</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-orange-600">{mfaAnalytics.averageRiskScore}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Zap className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">{mfaAnalytics.adaptiveAuthUsers} adaptive users</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="events">Auth Events</TabsTrigger>
          <TabsTrigger value="tokens">Hardware Tokens</TabsTrigger>
          <TabsTrigger value="biometric">Biometric</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Authentication Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Trends</CardTitle>
              <CardDescription>Daily authentication attempts and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={authTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="successes" stackId="1" stroke="#10b981" fill="#d1fae5" />
                  <Area yAxisId="left" type="monotone" dataKey="failures" stackId="1" stroke="#ef4444" fill="#fee2e2" />
                  <Line yAxisId="right" type="monotone" dataKey="avgRisk" stroke="#f59e0b" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Authentication Events</CardTitle>
                <CardDescription>Latest MFA authentication attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {authEvents.slice(0, 3).map((event) => (
                      <AuthEventCard key={event.id} event={event} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Users</CardTitle>
                <CardDescription>Users requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {userMFAConfigs
                      .filter(user => user.riskScore > 60)
                      .map((user) => (
                        <UserMFACard key={user.id} user={user} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* User Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="MFA Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="enabled">MFA Enabled</SelectItem>
                    <SelectItem value="disabled">MFA Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userMFAConfigs
              .filter(user => 
                (statusFilter === 'all' || 
                 (statusFilter === 'enabled' && user.mfaEnabled) ||
                 (statusFilter === 'disabled' && !user.mfaEnabled)) &&
                (searchTerm === '' || 
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((user) => (
                <UserMFACard key={user.id} user={user} />
              ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {/* Event Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Auth Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {Object.entries(MFA_METHODS).map(([key, method]) => (
                      <SelectItem key={key} value={key}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {authEvents
              .filter(event => 
                (methodFilter === 'all' || event.method === methodFilter) &&
                (searchTerm === '' || 
                  event.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  event.location.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((event) => (
                <AuthEventCard key={event.id} event={event} />
              ))}
          </div>
        </TabsContent>

        {/* Hardware Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hardwareTokens.map((token) => (
              <HardwareTokenCard key={token.id} token={token} />
            ))}
          </div>
        </TabsContent>

        {/* Biometric Tab */}
        <TabsContent value="biometric" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biometricEnrollments.map((biometric) => (
              <BiometricCard key={biometric.id} biometric={biometric} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MFA Analytics Dashboard</CardTitle>
              <CardDescription>Comprehensive authentication analytics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={authTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attempts" fill="#3b82f6" />
                  <Bar dataKey="successes" fill="#10b981" />
                  <Bar dataKey="failures" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>MFA Configuration Details</DialogTitle>
            <DialogDescription>
              Detailed MFA settings and security information
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">User</Label>
                  <p className="text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Role</Label>
                  <p className="text-sm">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">MFA Status</Label>
                  <Badge className={selectedUser.mfaEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedUser.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Risk Score</Label>
                  <Badge className={getRiskColor(selectedUser.riskScore)}>
                    {selectedUser.riskScore}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Primary Method</Label>
                  <p className="text-sm">{selectedUser.primaryMethod || 'None'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Device Count</Label>
                  <p className="text-sm">{selectedUser.deviceCount} ({selectedUser.trustedDevices} trusted)</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Authentication</Label>
                  <p className="text-sm">{selectedUser.lastAuth.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Failed Attempts</Label>
                  <p className="text-sm">{selectedUser.failedAttempts}</p>
                </div>
              </div>

              {selectedUser.mfaEnabled && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Configured Methods</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedUser.methods.map((method) => {
                        const MethodIcon = MFA_METHODS[method]?.icon || Key;
                        return (
                          <div key={method} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <MethodIcon className="h-4 w-4" />
                            <span className="text-sm">{MFA_METHODS[method]?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Backup Methods</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUser.backupMethods.map((method) => (
                        <Badge key={method} variant="outline">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Adaptive Auth</p>
                      <Badge className={selectedUser.adaptiveEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedUser.adaptiveEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Biometric</p>
                      <Badge className={selectedUser.biometricEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedUser.biometricEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Hardware Tokens</p>
                      <p className="text-sm font-bold">{selectedUser.hardwareTokens}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedMFA;