import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Clock, 
  User, 
  Database, 
  Server, 
  Network,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Lock,
  Unlock,
  Key,
  Trash2,
  Edit,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  Flag,
  Hash,
  ExternalLink,
  Copy,
  Archive,
  Bookmark,
  Tag,
  Layers,
  GitBranch,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  Radio
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
import { DatePickerWithRange } from '../ui/date-range-picker';
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
  PieChart as RechartsPieChart,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter
} from 'recharts';

// Event types and categories
const EVENT_TYPES = {
  AUTHENTICATION: {
    LOGIN_SUCCESS: { name: 'Login Success', severity: 'info', icon: CheckCircle },
    LOGIN_FAILURE: { name: 'Login Failure', severity: 'warning', icon: XCircle },
    LOGOUT: { name: 'Logout', severity: 'info', icon: User },
    PASSWORD_CHANGE: { name: 'Password Change', severity: 'medium', icon: Key },
    MFA_ENABLED: { name: 'MFA Enabled', severity: 'info', icon: Shield },
    MFA_DISABLED: { name: 'MFA Disabled', severity: 'warning', icon: AlertTriangle },
    ACCOUNT_LOCKED: { name: 'Account Locked', severity: 'high', icon: Lock },
    ACCOUNT_UNLOCKED: { name: 'Account Unlocked', severity: 'medium', icon: Unlock }
  },
  DATA_ACCESS: {
    DATA_VIEW: { name: 'Data View', severity: 'info', icon: Eye },
    DATA_EXPORT: { name: 'Data Export', severity: 'medium', icon: Download },
    DATA_IMPORT: { name: 'Data Import', severity: 'medium', icon: Upload },
    BULK_OPERATION: { name: 'Bulk Operation', severity: 'high', icon: Database },
    SENSITIVE_ACCESS: { name: 'Sensitive Data Access', severity: 'high', icon: AlertTriangle }
  },
  SYSTEM_CHANGES: {
    USER_CREATED: { name: 'User Created', severity: 'medium', icon: Plus },
    USER_DELETED: { name: 'User Deleted', severity: 'high', icon: Trash2 },
    ROLE_CHANGED: { name: 'Role Changed', severity: 'high', icon: Edit },
    PERMISSION_GRANTED: { name: 'Permission Granted', severity: 'medium', icon: CheckCircle },
    PERMISSION_REVOKED: { name: 'Permission Revoked', severity: 'medium', icon: XCircle },
    SYSTEM_CONFIG: { name: 'System Configuration', severity: 'high', icon: Settings }
  },
  SECURITY_EVENTS: {
    SUSPICIOUS_ACTIVITY: { name: 'Suspicious Activity', severity: 'critical', icon: AlertTriangle },
    BRUTE_FORCE: { name: 'Brute Force Attack', severity: 'critical', icon: Target },
    UNAUTHORIZED_ACCESS: { name: 'Unauthorized Access', severity: 'critical', icon: Flag },
    DATA_BREACH: { name: 'Data Breach', severity: 'critical', icon: AlertCircle },
    MALWARE_DETECTED: { name: 'Malware Detected', severity: 'critical', icon: Zap },
    INTRUSION_ATTEMPT: { name: 'Intrusion Attempt', severity: 'critical', icon: Shield }
  }
};

// Risk levels and colors
const RISK_LEVELS = {
  info: { color: 'bg-blue-100 text-blue-800 border-blue-200', bgColor: 'bg-blue-50' },
  low: { color: 'bg-green-100 text-green-800 border-green-200', bgColor: 'bg-green-50' },
  medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', bgColor: 'bg-yellow-50' },
  high: { color: 'bg-orange-100 text-orange-800 border-orange-200', bgColor: 'bg-orange-50' },
  critical: { color: 'bg-red-100 text-red-800 border-red-200', bgColor: 'bg-red-50' }
};

// Sample audit log data
const auditLogs = [
  {
    id: 'log_001',
    timestamp: new Date('2024-01-15T14:30:25Z'),
    eventType: 'AUTHENTICATION.LOGIN_SUCCESS',
    userId: 'user_123',
    userName: 'john.doe@company.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, NY, US',
    device: 'Desktop',
    resource: 'CRM Dashboard',
    action: 'login',
    result: 'success',
    riskLevel: 'info',
    sessionId: 'sess_abc123',
    metadata: {
      loginMethod: '2FA',
      previousLogin: '2024-01-15T08:15:00Z',
      failedAttempts: 0
    }
  },
  {
    id: 'log_002',
    timestamp: new Date('2024-01-15T14:25:10Z'),
    eventType: 'SECURITY_EVENTS.SUSPICIOUS_ACTIVITY',
    userId: 'user_456',
    userName: 'suspicious.user@external.com',
    ipAddress: '203.0.113.45',
    userAgent: 'curl/7.68.0',
    location: 'Unknown Location',
    device: 'Unknown',
    resource: 'API Endpoint',
    action: 'bulk_data_access',
    result: 'blocked',
    riskLevel: 'critical',
    sessionId: null,
    metadata: {
      requestCount: 1500,
      timeWindow: '5 minutes',
      blockedReason: 'Rate limit exceeded',
      threatScore: 95
    }
  },
  {
    id: 'log_003',
    timestamp: new Date('2024-01-15T14:20:45Z'),
    eventType: 'DATA_ACCESS.DATA_EXPORT',
    userId: 'user_789',
    userName: 'manager@company.com',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: 'San Francisco, CA, US',
    device: 'MacBook Pro',
    resource: 'Customer Database',
    action: 'export_customer_data',
    result: 'success',
    riskLevel: 'medium',
    sessionId: 'sess_def456',
    metadata: {
      recordCount: 2500,
      exportFormat: 'CSV',
      dataTypes: ['PII', 'Financial'],
      approvalRequired: true,
      approvedBy: 'admin@company.com'
    }
  },
  {
    id: 'log_004',
    timestamp: new Date('2024-01-15T14:15:30Z'),
    eventType: 'AUTHENTICATION.LOGIN_FAILURE',
    userId: null,
    userName: 'attacker@malicious.com',
    ipAddress: '198.51.100.25',
    userAgent: 'Python-requests/2.28.1',
    location: 'Moscow, Russia',
    device: 'Unknown',
    resource: 'Login Page',
    action: 'login_attempt',
    result: 'failed',
    riskLevel: 'high',
    sessionId: null,
    metadata: {
      failureReason: 'Invalid credentials',
      attemptCount: 15,
      isBlocked: true,
      threatIntelligence: 'Known malicious IP'
    }
  },
  {
    id: 'log_005',
    timestamp: new Date('2024-01-15T14:10:15Z'),
    eventType: 'SYSTEM_CHANGES.ROLE_CHANGED',
    userId: 'admin_001',
    userName: 'admin@company.com',
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Chicago, IL, US',
    device: 'Desktop',
    resource: 'User Management',
    action: 'role_update',
    result: 'success',
    riskLevel: 'high',
    sessionId: 'sess_ghi789',
    metadata: {
      targetUser: 'user_123',
      oldRole: 'Sales Rep',
      newRole: 'Sales Manager',
      permissions: ['view_all_deals', 'manage_team'],
      approvalWorkflow: 'completed'
    }
  }
];

// Threat detection rules
const threatDetectionRules = [
  {
    id: 'rule_001',
    name: 'Multiple Failed Logins',
    description: 'Detect multiple failed login attempts from same IP',
    enabled: true,
    severity: 'high',
    conditions: {
      eventType: 'AUTHENTICATION.LOGIN_FAILURE',
      threshold: 5,
      timeWindow: '5 minutes'
    },
    actions: ['block_ip', 'send_alert', 'log_incident']
  },
  {
    id: 'rule_002',
    name: 'Unusual Data Export',
    description: 'Large data exports outside business hours',
    enabled: true,
    severity: 'medium',
    conditions: {
      eventType: 'DATA_ACCESS.DATA_EXPORT',
      recordThreshold: 1000,
      timeRange: 'outside_business_hours'
    },
    actions: ['require_approval', 'send_alert', 'enhanced_logging']
  },
  {
    id: 'rule_003',
    name: 'Privilege Escalation',
    description: 'Rapid role or permission changes',
    enabled: true,
    severity: 'critical',
    conditions: {
      eventType: 'SYSTEM_CHANGES.ROLE_CHANGED',
      frequency: 'multiple_in_hour'
    },
    actions: ['freeze_account', 'immediate_alert', 'security_review']
  }
];

// Analytics data
const auditAnalytics = {
  totalEvents: 125847,
  todayEvents: 2341,
  criticalEvents: 23,
  blockedAttempts: 156,
  uniqueUsers: 1247,
  uniqueIPs: 892,
  topRiskEvents: 45,
  complianceScore: 94
};

// Event trends data
const eventTrends = [
  { time: '00:00', total: 45, critical: 2, high: 8, medium: 15, low: 20 },
  { time: '04:00', total: 23, critical: 0, high: 3, medium: 8, low: 12 },
  { time: '08:00', total: 156, critical: 5, high: 25, medium: 56, low: 70 },
  { time: '12:00', total: 234, critical: 8, high: 45, medium: 89, low: 92 },
  { time: '16:00', total: 198, critical: 6, high: 38, medium: 74, low: 80 },
  { time: '20:00', total: 89, critical: 3, high: 15, medium: 31, low: 40 },
  { time: '24:00', total: 67, critical: 1, high: 12, medium: 24, low: 30 }
];

// Geographic distribution
const geographicData = [
  { country: 'United States', events: 45623, risk: 'low' },
  { country: 'United Kingdom', events: 12456, risk: 'low' },
  { country: 'Germany', events: 8934, risk: 'low' },
  { country: 'Russia', events: 2341, risk: 'high' },
  { country: 'China', events: 1876, risk: 'medium' },
  { country: 'Unknown', events: 892, risk: 'critical' }
];

const ComprehensiveAuditLogger = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [showThreatRules, setShowThreatRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState(auditLogs);

  // Real-time log simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate new log entry
      const newLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date(),
        eventType: Object.keys(EVENT_TYPES)[Math.floor(Math.random() * Object.keys(EVENT_TYPES).length)],
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        userName: `user${Math.floor(Math.random() * 1000)}@company.com`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        location: 'Real-time Location',
        device: 'Desktop',
        resource: 'CRM System',
        action: 'real_time_action',
        result: Math.random() > 0.8 ? 'failed' : 'success',
        riskLevel: ['info', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
        metadata: { realTime: true }
      };
      
      setFilteredLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  const getRiskLevelColor = (level) => RISK_LEVELS[level]?.color || RISK_LEVELS.info.color;
  const getRiskLevelBg = (level) => RISK_LEVELS[level]?.bgColor || RISK_LEVELS.info.bgColor;

  const getEventTypeInfo = (eventType) => {
    const [category, type] = eventType.split('.');
    return EVENT_TYPES[category]?.[type] || { name: eventType, severity: 'info', icon: Info };
  };

  const AuditLogCard = ({ log }) => {
    const eventInfo = getEventTypeInfo(log.eventType);
    const EventIcon = eventInfo.icon;

    return (
      <Card 
        className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
          log.riskLevel === 'critical' ? 'border-l-red-500' :
          log.riskLevel === 'high' ? 'border-l-orange-500' :
          log.riskLevel === 'medium' ? 'border-l-yellow-500' :
          'border-l-blue-500'
        } ${getRiskLevelBg(log.riskLevel)}`}
        onClick={() => setSelectedLog(log)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                log.riskLevel === 'critical' ? 'bg-red-100' :
                log.riskLevel === 'high' ? 'bg-orange-100' :
                log.riskLevel === 'medium' ? 'bg-yellow-100' :
                'bg-blue-100'
              }`}>
                <EventIcon className={`h-4 w-4 ${
                  log.riskLevel === 'critical' ? 'text-red-600' :
                  log.riskLevel === 'high' ? 'text-orange-600' :
                  log.riskLevel === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900">{eventInfo.name}</h3>
                <p className="text-xs text-gray-600">{log.userName || 'Unknown User'}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getRiskLevelColor(log.riskLevel)}>
                {log.riskLevel}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {log.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">IP:</span>
              <span className="ml-1 font-mono">{log.ipAddress}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-1">{log.location}</span>
            </div>
            <div>
              <span className="text-gray-600">Resource:</span>
              <span className="ml-1">{log.resource}</span>
            </div>
            <div>
              <span className="text-gray-600">Result:</span>
              <span className={`ml-1 font-medium ${
                log.result === 'success' ? 'text-green-600' : 
                log.result === 'failed' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {log.result}
              </span>
            </div>
          </div>

          {log.metadata?.threatScore && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Threat Score:</span>
                <span className="font-bold text-red-600">{log.metadata.threatScore}%</span>
              </div>
              <Progress value={log.metadata.threatScore} className="h-1 mt-1" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ThreatRuleCard = ({ rule }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              rule.severity === 'critical' ? 'bg-red-100' :
              rule.severity === 'high' ? 'bg-orange-100' :
              'bg-yellow-100'
            }`}>
              <Shield className={`h-4 w-4 ${
                rule.severity === 'critical' ? 'text-red-600' :
                rule.severity === 'high' ? 'text-orange-600' :
                'text-yellow-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{rule.name}</h3>
              <p className="text-xs text-gray-600">{rule.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>
              {rule.severity}
            </Badge>
            <Switch checked={rule.enabled} />
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-600">Conditions:</span>
            <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
              {JSON.stringify(rule.conditions, null, 2)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Actions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {rule.actions.map((action) => (
                <Badge key={action} variant="outline" className="text-xs">
                  {action.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit & Compliance</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive audit logging with real-time threat detection
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="realtime" className="text-sm">Real-time</Label>
            <Switch 
              id="realtime"
              checked={isRealTimeEnabled} 
              onCheckedChange={setIsRealTimeEnabled}
            />
          </div>
          <Button variant="outline" onClick={() => setShowThreatRules(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Threat Rules
          </Button>
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auditAnalytics.totalEvents.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-600 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{auditAnalytics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">-8%</span>
              <span className="text-gray-600 ml-1">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked Attempts</p>
                <p className="text-2xl font-bold text-orange-600">{auditAnalytics.blockedAttempts}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600">+23%</span>
              <span className="text-gray-600 ml-1">vs last hour</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{auditAnalytics.complianceScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={auditAnalytics.complianceScore} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Event Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Event Trends (24h)</CardTitle>
              <CardDescription>Real-time audit event monitoring by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={eventTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#fecaca" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#fed7aa" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#eab308" fill="#fef3c7" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#dcfce7" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Critical Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Critical Events</CardTitle>
                <CardDescription>High-priority security events requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {filteredLogs
                      .filter(log => log.riskLevel === 'critical' || log.riskLevel === 'high')
                      .slice(0, 5)
                      .map((log) => (
                        <AuditLogCard key={log.id} log={log} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Event distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {geographicData.map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{country.events.toLocaleString()}</span>
                        <Badge className={getRiskLevelColor(country.risk)}>
                          {country.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {Object.keys(EVENT_TYPES).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredLogs
              .filter(log => 
                (eventTypeFilter === 'all' || log.eventType.startsWith(eventTypeFilter)) &&
                (riskLevelFilter === 'all' || log.riskLevel === riskLevelFilter) &&
                (searchTerm === '' || 
                  log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  log.ipAddress.includes(searchTerm) ||
                  log.resource.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((log) => (
                <AuditLogCard key={log.id} log={log} />
              ))}
          </div>
        </TabsContent>

        {/* Threats Tab */}
        <TabsContent value="threats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {threatDetectionRules.map((rule) => (
              <ThreatRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Detailed analysis of audit events and patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={eventTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" fill="#ef4444" />
                  <Bar dataKey="high" fill="#f97316" />
                  <Bar dataKey="medium" fill="#eab308" />
                  <Bar dataKey="low" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>Regulatory compliance status and audit trails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['GDPR', 'SOX', 'HIPAA', 'PCI-DSS', 'ISO27001'].map((standard) => (
                  <Card key={standard}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{standard}</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <Progress value={Math.floor(Math.random() * 20) + 80} className="h-2" />
                      <p className="text-xs text-gray-600 mt-2">
                        Last audit: {new Date().toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the audit event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Event ID</Label>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                  <p className="text-sm">{selectedLog.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Event Type</Label>
                  <p className="text-sm">{getEventTypeInfo(selectedLog.eventType).name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Risk Level</Label>
                  <Badge className={getRiskLevelColor(selectedLog.riskLevel)}>
                    {selectedLog.riskLevel}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">User</Label>
                  <p className="text-sm">{selectedLog.userName || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">IP Address</Label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p className="text-sm">{selectedLog.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Device</Label>
                  <p className="text-sm">{selectedLog.device}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Resource</Label>
                  <p className="text-sm">{selectedLog.resource}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Action</Label>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Result</Label>
                  <Badge variant={selectedLog.result === 'success' ? 'default' : 'destructive'}>
                    {selectedLog.result}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Session ID</Label>
                  <p className="text-sm font-mono">{selectedLog.sessionId || 'N/A'}</p>
                </div>
              </div>
              
              {selectedLog.userAgent && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">User Agent</Label>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded mt-1">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Metadata</Label>
                  <pre className="text-xs bg-gray-50 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComprehensiveAuditLogger;