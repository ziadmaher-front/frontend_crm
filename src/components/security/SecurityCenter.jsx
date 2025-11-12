import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Activity,
  Eye,
  Lock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Zap,
  Database,
  Network,
  Key,
  Fingerprint,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Calendar,
  Clock,
  MapPin,
  User,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  HardDrive,
  Cloud,
  Server,
  Terminal,
  Code,
  Bug,
  Wrench,
  Target,
  Crosshair,
  Radar,
  Scan,
  ScanLine,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertCircle,
  Info,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  MoreVertical,
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  Hand
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Security modules configuration
const SECURITY_MODULES = [
  {
    id: 'dashboard',
    title: 'Security Dashboard',
    description: 'Centralized security monitoring and overview',
    icon: Shield,
    color: 'blue',
    status: 'active',
    route: '/SecurityDashboard',
    metrics: {
      threats: 12,
      incidents: 3,
      compliance: 98,
      uptime: 99.9
    }
  },
  {
    id: 'mfa',
    title: 'Advanced MFA',
    description: 'Multi-factor authentication management',
    icon: Fingerprint,
    color: 'green',
    status: 'active',
    route: '/AdvancedMFA',
    metrics: {
      users: 1247,
      methods: 5,
      success: 99.2,
      failures: 8
    }
  },
  {
    id: 'incident',
    title: 'Incident Response',
    description: 'Security incident management and response',
    icon: Activity,
    color: 'red',
    status: 'active',
    route: '/SecurityIncidentResponse',
    metrics: {
      open: 2,
      resolved: 45,
      avgTime: '2.3h',
      severity: 'Medium'
    }
  },
  {
    id: 'vulnerability',
    title: 'Vulnerability Management',
    description: 'Vulnerability scanning and remediation',
    icon: Eye,
    color: 'orange',
    status: 'active',
    route: '/VulnerabilityManagement',
    metrics: {
      critical: 0,
      high: 3,
      medium: 12,
      low: 28
    }
  },
  {
    id: 'dlp',
    title: 'Data Loss Prevention',
    description: 'Data protection and loss prevention',
    icon: Lock,
    color: 'purple',
    status: 'active',
    route: '/DataLossPrevention',
    metrics: {
      policies: 15,
      violations: 2,
      blocked: 127,
      quarantined: 5
    }
  },
  {
    id: 'audit',
    title: 'Audit Logger',
    description: 'Security audit logging and compliance',
    icon: FileText,
    color: 'indigo',
    status: 'active',
    route: '/AuditLogger',
    metrics: {
      events: 15420,
      alerts: 23,
      compliance: 100,
      retention: '7 years'
    }
  },
  {
    id: 'gdpr',
    title: 'GDPR Tools',
    description: 'GDPR compliance and data protection',
    icon: Shield,
    color: 'teal',
    status: 'active',
    route: '/GDPRTools',
    metrics: {
      requests: 8,
      processed: 6,
      pending: 2,
      compliance: 100
    }
  },
  {
    id: 'encryption',
    title: 'Field Encryption',
    description: 'Data encryption and key management',
    icon: Key,
    color: 'cyan',
    status: 'active',
    route: '/FieldEncryption',
    metrics: {
      encrypted: 98.5,
      keys: 156,
      rotations: 12,
      strength: 'AES-256'
    }
  },
  {
    id: 'sso',
    title: 'SSO Integration',
    description: 'Single sign-on integration and management',
    icon: Users,
    color: 'pink',
    status: 'active',
    route: '/SSOIntegration',
    metrics: {
      providers: 3,
      users: 892,
      sessions: 1247,
      success: 99.8
    }
  }
];

// Security alerts and notifications
const SECURITY_ALERTS = [
  {
    id: 1,
    type: 'critical',
    title: 'Suspicious Login Attempt',
    description: 'Multiple failed login attempts from unknown IP address',
    timestamp: '2 minutes ago',
    source: 'Authentication System',
    status: 'active'
  },
  {
    id: 2,
    type: 'warning',
    title: 'DLP Policy Violation',
    description: 'Sensitive data detected in outbound email',
    timestamp: '15 minutes ago',
    source: 'Data Loss Prevention',
    status: 'investigating'
  },
  {
    id: 3,
    type: 'info',
    title: 'Security Scan Completed',
    description: 'Weekly vulnerability scan finished successfully',
    timestamp: '1 hour ago',
    source: 'Vulnerability Scanner',
    status: 'resolved'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Certificate Expiring Soon',
    description: 'SSL certificate expires in 7 days',
    timestamp: '2 hours ago',
    source: 'Certificate Manager',
    status: 'pending'
  }
];

// Security metrics data
const securityMetricsData = [
  { name: 'Jan', threats: 45, incidents: 12, compliance: 98 },
  { name: 'Feb', threats: 38, incidents: 8, compliance: 99 },
  { name: 'Mar', threats: 52, incidents: 15, compliance: 97 },
  { name: 'Apr', threats: 41, incidents: 9, compliance: 99 },
  { name: 'May', threats: 35, incidents: 6, compliance: 100 },
  { name: 'Jun', threats: 29, incidents: 4, compliance: 100 }
];

const threatDistribution = [
  { name: 'Malware', value: 35, color: '#ef4444' },
  { name: 'Phishing', value: 28, color: '#f97316' },
  { name: 'Brute Force', value: 20, color: '#eab308' },
  { name: 'DDoS', value: 12, color: '#22c55e' },
  { name: 'Other', value: 5, color: '#6366f1' }
];

const complianceScores = [
  { framework: 'SOC 2', score: 98, target: 95 },
  { framework: 'ISO 27001', score: 96, target: 90 },
  { framework: 'GDPR', score: 100, target: 100 },
  { framework: 'HIPAA', score: 94, target: 95 },
  { framework: 'PCI DSS', score: 97, target: 90 }
];

const SecurityCenter = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filter modules based on search and status
  const filteredModules = SECURITY_MODULES.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || module.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get alert color based on type
  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'default';
    }
  };

  // Get module color classes
  const getModuleColorClasses = (color) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      green: 'border-green-200 bg-green-50 text-green-700',
      red: 'border-red-200 bg-red-50 text-red-700',
      orange: 'border-orange-200 bg-orange-50 text-orange-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      teal: 'border-teal-200 bg-teal-50 text-teal-700',
      cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      pink: 'border-pink-200 bg-pink-50 text-pink-700'
    };
    return colorMap[color] || colorMap.blue;
  };

  // Module card component
  const ModuleCard = ({ module }) => {
    const Icon = module.icon;
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getModuleColorClasses(module.color)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="text-sm">{module.description}</CardDescription>
                </div>
              </div>
              <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                {module.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(module.metrics).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => window.location.href = module.route}
              >
                Open Module
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedModule(module)}
              >
                Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Alert card component
  const AlertCard = ({ alert }) => {
    const getAlertIcon = (type) => {
      switch (type) {
        case 'critical': return AlertTriangle;
        case 'warning': return AlertCircle;
        case 'info': return Info;
        default: return Info;
      }
    };

    const AlertIcon = getAlertIcon(alert.type);

    return (
      <Alert variant={getAlertColor(alert.type)} className="mb-3">
        <AlertIcon className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          {alert.title}
          <Badge variant="outline" className="text-xs">
            {alert.timestamp}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          {alert.description}
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Source: {alert.source}</span>
            <Badge variant="secondary" className="text-xs">
              {alert.status}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">
            Comprehensive security management and monitoring dashboard
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch
              checked={realTimeMonitoring}
              onCheckedChange={setRealTimeMonitoring}
            />
            <span className="text-sm">Real-time</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
            <span className="text-sm">Notifications</span>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              -23% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">
              2 critical, 1 medium priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">97.2%</div>
            <p className="text-xs text-muted-foreground">
              Across all frameworks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Security Modules</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Incidents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Security Trends</CardTitle>
                <CardDescription>
                  Monthly security metrics overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={securityMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="threats"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      stackId="1"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threat Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Threat Distribution</CardTitle>
                <CardDescription>
                  Current threat landscape breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={threatDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {threatDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
              <CardDescription>
                Latest security events and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {SECURITY_ALERTS.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search security modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Active Security Alerts</CardTitle>
                  <CardDescription>
                    Current security events requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {SECURITY_ALERTS.map((alert) => (
                      <AlertCard key={alert.id} alert={alert} />
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Critical</span>
                    <Badge variant="destructive">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Warning</span>
                    <Badge variant="default">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Info</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    Configure Alerts
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Alert Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics Trend</CardTitle>
                <CardDescription>
                  6-month security performance overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={securityMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="compliance"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="threats"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module Performance</CardTitle>
                <CardDescription>
                  Security module effectiveness metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SECURITY_MODULES.slice(0, 5).map((module) => (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{module.title}</span>
                        <span className="font-medium">
                          {Math.floor(Math.random() * 20) + 80}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.floor(Math.random() * 20) + 80} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Scores</CardTitle>
                <CardDescription>
                  Current compliance status across frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceScores.map((item) => (
                    <div key={item.framework} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.framework}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">
                            Target: {item.target}%
                          </span>
                          <span className="font-bold">{item.score}%</span>
                        </div>
                      </div>
                      <Progress 
                        value={item.score} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Actions</CardTitle>
                <CardDescription>
                  Required actions to maintain compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Certificate Renewal</AlertTitle>
                    <AlertDescription>
                      SSL certificate expires in 7 days. Renewal required for PCI DSS compliance.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Policy Review</AlertTitle>
                    <AlertDescription>
                      Annual security policy review due next month.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Audit Complete</AlertTitle>
                    <AlertDescription>
                      SOC 2 Type II audit completed successfully.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Details Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedModule && (
                <>
                  <selectedModule.icon className="h-5 w-5" />
                  <span>{selectedModule.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedModule?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedModule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant={selectedModule.status === 'active' ? 'default' : 'secondary'}>
                    {selectedModule.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <Badge variant="outline">{selectedModule.color}</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Metrics</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedModule.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted rounded">
                      <span className="capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    window.location.href = selectedModule.route;
                    setSelectedModule(null);
                  }}
                >
                  Open Module
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedModule(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityCenter;