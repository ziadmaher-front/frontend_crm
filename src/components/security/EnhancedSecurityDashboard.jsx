import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Lock, 
  Unlock,
  Activity,
  Globe,
  Database,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Bell,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  Cpu,
  Network,
  FileText,
  UserCheck,
  Key,
  Fingerprint,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle2,
  XOctagon
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
import { 
  LineChart as RechartsLineChart, 
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
  RadialBar
} from 'recharts';

// Security Metrics Data
const securityMetrics = {
  overall: {
    score: 94,
    status: 'excellent',
    trend: 'up',
    change: '+2.3%'
  },
  threats: {
    blocked: 1247,
    detected: 1389,
    resolved: 1342,
    active: 47,
    trend: 'down',
    change: '-12.5%'
  },
  compliance: {
    gdpr: 98,
    sox: 95,
    hipaa: 92,
    iso27001: 96,
    overall: 95.25
  },
  authentication: {
    mfaAdoption: 87,
    ssoSessions: 2341,
    failedLogins: 23,
    suspiciousActivity: 5,
    activeUsers: 1847
  },
  encryption: {
    dataAtRest: 100,
    dataInTransit: 100,
    fieldLevel: 89,
    keyRotation: 95,
    certificates: 12
  },
  audit: {
    totalEvents: 45672,
    criticalEvents: 12,
    highRiskEvents: 89,
    mediumRiskEvents: 234,
    lowRiskEvents: 45337
  }
};

// Real-time threat data
const threatData = [
  { time: '00:00', threats: 12, blocked: 11, resolved: 10 },
  { time: '04:00', threats: 8, blocked: 8, resolved: 7 },
  { time: '08:00', threats: 25, blocked: 23, resolved: 22 },
  { time: '12:00', threats: 18, blocked: 17, resolved: 16 },
  { time: '16:00', threats: 32, blocked: 30, resolved: 28 },
  { time: '20:00', threats: 15, blocked: 14, resolved: 13 },
  { time: '24:00', threats: 9, blocked: 9, resolved: 8 }
];

// Security events timeline
const securityEvents = [
  {
    id: 1,
    type: 'threat_blocked',
    severity: 'high',
    title: 'Malicious IP Blocked',
    description: 'Blocked suspicious login attempts from 203.0.113.45',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    source: 'Firewall',
    status: 'resolved'
  },
  {
    id: 2,
    type: 'compliance_alert',
    severity: 'medium',
    title: 'GDPR Data Access Request',
    description: 'New data subject access request received',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    source: 'GDPR Tools',
    status: 'pending'
  },
  {
    id: 3,
    type: 'authentication',
    severity: 'low',
    title: 'MFA Setup Completed',
    description: 'User john.doe@company.com enabled two-factor authentication',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    source: 'Auth System',
    status: 'completed'
  },
  {
    id: 4,
    type: 'encryption',
    severity: 'info',
    title: 'Key Rotation Scheduled',
    description: 'Automatic encryption key rotation completed successfully',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    source: 'Encryption Service',
    status: 'completed'
  },
  {
    id: 5,
    type: 'vulnerability',
    severity: 'critical',
    title: 'Critical Vulnerability Detected',
    description: 'CVE-2024-0001 detected in system component',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    source: 'Vulnerability Scanner',
    status: 'investigating'
  }
];

// Compliance trend data
const complianceData = [
  { month: 'Jan', gdpr: 92, sox: 88, hipaa: 85, iso27001: 90 },
  { month: 'Feb', gdpr: 94, sox: 91, hipaa: 87, iso27001: 92 },
  { month: 'Mar', gdpr: 96, sox: 93, hipaa: 89, iso27001: 94 },
  { month: 'Apr', gdpr: 97, sox: 94, hipaa: 91, iso27001: 95 },
  { month: 'May', gdpr: 98, sox: 95, hipaa: 92, iso27001: 96 }
];

// Authentication methods distribution
const authMethodsData = [
  { name: 'Password + MFA', value: 65, color: '#10b981' },
  { name: 'SSO', value: 25, color: '#3b82f6' },
  { name: 'Biometric', value: 8, color: '#8b5cf6' },
  { name: 'Hardware Token', value: 2, color: '#f59e0b' }
];

// System health data
const systemHealthData = [
  { component: 'Authentication', status: 'healthy', uptime: 99.9, response: 45 },
  { component: 'Encryption', status: 'healthy', uptime: 99.8, response: 23 },
  { component: 'Audit Logging', status: 'healthy', uptime: 99.7, response: 67 },
  { component: 'Firewall', status: 'warning', uptime: 98.5, response: 89 },
  { component: 'Intrusion Detection', status: 'healthy', uptime: 99.6, response: 34 },
  { component: 'Vulnerability Scanner', status: 'healthy', uptime: 99.4, response: 156 }
];

const EnhancedSecurityDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate real-time security updates
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'critical': return XCircle;
      default: return Info;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return XOctagon;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low': return Info;
      case 'info': return CheckCircle2;
      default: return Info;
    }
  };

  const SecurityMetricCard = ({ title, value, subtitle, icon: Icon, trend, change, color = "blue" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        {trend && change && (
          <div className="mt-4 flex items-center">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const SystemHealthCard = ({ component, status, uptime, response }) => {
    const StatusIcon = getStatusIcon(status);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${getStatusColor(status)}`} />
              <span className="font-medium">{component}</span>
            </div>
            <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
              {status}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">{uptime}%</span>
            </div>
            <Progress value={uptime} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Time</span>
              <span className="font-medium">{response}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SecurityEventCard = ({ event }) => {
    const SeverityIcon = getSeverityIcon(event.severity);
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <SeverityIcon className="h-5 w-5 mt-0.5 text-gray-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{event.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{event.source}</span>
                  <span>{event.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={getSeverityColor(event.severity)}>
                {event.severity}
              </Badge>
              <Badge variant={event.status === 'resolved' ? 'default' : event.status === 'pending' ? 'secondary' : 'outline'}>
                {event.status}
              </Badge>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive security monitoring and threat management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
            <Label>Real-time Updates</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
            <Label>Alerts</Label>
          </div>
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Overall Security Score</h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-4xl font-bold text-blue-600">{securityMetrics.overall.score}</span>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    {securityMetrics.overall.status}
                  </Badge>
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{securityMetrics.overall.change}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Last Updated</div>
              <div className="text-sm font-medium">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityMetricCard
              title="Threats Blocked"
              value={securityMetrics.threats.blocked.toLocaleString()}
              subtitle="Last 24 hours"
              icon={Shield}
              trend={securityMetrics.threats.trend}
              change={securityMetrics.threats.change}
              color="green"
            />
            <SecurityMetricCard
              title="Active Users"
              value={securityMetrics.authentication.activeUsers.toLocaleString()}
              subtitle="Currently online"
              icon={Users}
              color="blue"
            />
            <SecurityMetricCard
              title="MFA Adoption"
              value={`${securityMetrics.authentication.mfaAdoption}%`}
              subtitle="Two-factor enabled"
              icon={Key}
              color="purple"
            />
            <SecurityMetricCard
              title="Compliance Score"
              value={`${securityMetrics.compliance.overall}%`}
              subtitle="Overall compliance"
              icon={CheckCircle}
              color="indigo"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Activity (24h)</CardTitle>
                <CardDescription>Real-time threat detection and response</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={threatData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="threats" stackId="1" stroke="#ef4444" fill="#fecaca" />
                    <Area type="monotone" dataKey="blocked" stackId="2" stroke="#10b981" fill="#bbf7d0" />
                    <Area type="monotone" dataKey="resolved" stackId="3" stroke="#3b82f6" fill="#bfdbfe" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Authentication Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Authentication Methods</CardTitle>
                <CardDescription>Distribution of authentication types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={authMethodsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {authMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Status</CardTitle>
              <CardDescription>Real-time monitoring of security components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemHealthData.map((system, index) => (
                  <SystemHealthCard key={index} {...system} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>Latest security activities and alerts</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {securityEvents
                    .filter(event => selectedSeverity === 'all' || event.severity === selectedSeverity)
                    .map((event) => (
                      <SecurityEventCard key={event.id} event={event} />
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly with specific content */}
        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Threat Management</CardTitle>
              <CardDescription>Advanced threat detection and response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Threat management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>GDPR, SOX, HIPAA, and ISO 27001 compliance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="gdpr" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="sox" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="hipaa" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="iso27001" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Access Control</CardTitle>
              <CardDescription>Multi-factor authentication and access management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Authentication management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Management</CardTitle>
              <CardDescription>Data encryption, key management, and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Encryption management interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Security Monitoring</CardTitle>
              <CardDescription>Real-time security monitoring and alerting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Security monitoring interface coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about the security event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Event Type</Label>
                  <p className="text-sm">{selectedEvent.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Severity</Label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Source</Label>
                  <p className="text-sm">{selectedEvent.source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge variant="outline">{selectedEvent.status}</Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm mt-1">{selectedEvent.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                <p className="text-sm mt-1">{selectedEvent.timestamp.toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedSecurityDashboard;