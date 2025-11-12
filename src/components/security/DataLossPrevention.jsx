import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  FileText,
  Eye,
  Lock,
  Users,
  Activity,
  TrendingUp,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  User,
  Building,
  Globe,
  Wifi,
  HardDrive,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Badge,
} from '@/components/ui/badge';
import {
  Button,
} from '@/components/ui/button';
import {
  Input,
} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

// DLP Policy Types
const DLP_POLICY_TYPES = {
  'pii': { name: 'Personal Information', icon: User, color: 'bg-blue-500', description: 'Social Security Numbers, Credit Cards, Personal IDs' },
  'financial': { name: 'Financial Data', icon: TrendingUp, color: 'bg-green-500', description: 'Bank accounts, financial records, payment info' },
  'healthcare': { name: 'Healthcare Data', icon: Activity, color: 'bg-red-500', description: 'Medical records, health information, HIPAA data' },
  'intellectual': { name: 'Intellectual Property', icon: Lock, color: 'bg-purple-500', description: 'Patents, trade secrets, proprietary code' },
  'confidential': { name: 'Confidential Business', icon: Building, color: 'bg-orange-500', description: 'Internal documents, strategic plans, contracts' },
  'compliance': { name: 'Compliance Data', icon: Shield, color: 'bg-indigo-500', description: 'Regulatory data, audit trails, legal documents' }
};

// Data Classification Levels
const CLASSIFICATION_LEVELS = {
  'public': { name: 'Public', color: 'bg-gray-500', priority: 1, description: 'Information that can be freely shared' },
  'internal': { name: 'Internal', color: 'bg-blue-500', priority: 2, description: 'Information for internal use only' },
  'confidential': { name: 'Confidential', color: 'bg-orange-500', priority: 3, description: 'Sensitive business information' },
  'restricted': { name: 'Restricted', color: 'bg-red-500', priority: 4, description: 'Highly sensitive, access controlled' },
  'top_secret': { name: 'Top Secret', color: 'bg-purple-500', priority: 5, description: 'Maximum security classification' }
};

// DLP Actions
const DLP_ACTIONS = {
  'allow': { name: 'Allow', icon: CheckCircle, color: 'text-green-500' },
  'warn': { name: 'Warn', icon: AlertTriangle, color: 'text-yellow-500' },
  'block': { name: 'Block', icon: XCircle, color: 'text-red-500' },
  'quarantine': { name: 'Quarantine', icon: Lock, color: 'text-purple-500' },
  'encrypt': { name: 'Encrypt', icon: Shield, color: 'text-blue-500' },
  'audit': { name: 'Audit Only', icon: Eye, color: 'text-gray-500' }
};

// Sample DLP Policies
const dlpPolicies = [
  {
    id: 'pol_001',
    name: 'Credit Card Protection',
    type: 'financial',
    classification: 'confidential',
    action: 'block',
    enabled: true,
    description: 'Prevents transmission of credit card numbers',
    patterns: ['\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}'],
    channels: ['email', 'web', 'usb', 'cloud'],
    violations: 23,
    lastTriggered: '2024-01-15T10:30:00Z',
    createdBy: 'Security Team',
    severity: 'high'
  },
  {
    id: 'pol_002',
    name: 'SSN Detection',
    type: 'pii',
    classification: 'restricted',
    action: 'quarantine',
    enabled: true,
    description: 'Detects and quarantines Social Security Numbers',
    patterns: ['\\d{3}-\\d{2}-\\d{4}', '\\d{9}'],
    channels: ['email', 'web', 'file_share'],
    violations: 8,
    lastTriggered: '2024-01-14T15:45:00Z',
    createdBy: 'Compliance Team',
    severity: 'critical'
  },
  {
    id: 'pol_003',
    name: 'Source Code Protection',
    type: 'intellectual',
    classification: 'confidential',
    action: 'warn',
    enabled: true,
    description: 'Monitors source code file transfers',
    patterns: ['\\.(js|py|java|cpp|c)$'],
    channels: ['email', 'usb', 'cloud'],
    violations: 45,
    lastTriggered: '2024-01-15T09:20:00Z',
    createdBy: 'Development Team',
    severity: 'medium'
  }
];

// Sample DLP Incidents
const dlpIncidents = [
  {
    id: 'inc_001',
    timestamp: '2024-01-15T10:30:00Z',
    policy: 'Credit Card Protection',
    policyId: 'pol_001',
    user: 'john.doe@company.com',
    action: 'blocked',
    channel: 'email',
    dataType: 'financial',
    classification: 'confidential',
    severity: 'high',
    status: 'resolved',
    description: 'Attempted to send email containing credit card number',
    location: 'New York Office',
    device: 'LAPTOP-001',
    fileSize: '2.3 KB',
    matchedPatterns: ['4532-1234-5678-9012'],
    investigator: 'Security Team',
    resolution: 'User educated on data handling policies'
  },
  {
    id: 'inc_002',
    timestamp: '2024-01-14T15:45:00Z',
    policy: 'SSN Detection',
    policyId: 'pol_002',
    user: 'jane.smith@company.com',
    action: 'quarantined',
    channel: 'file_share',
    dataType: 'pii',
    classification: 'restricted',
    severity: 'critical',
    status: 'investigating',
    description: 'File upload containing multiple SSNs detected',
    location: 'Remote',
    device: 'MOBILE-045',
    fileSize: '156 KB',
    matchedPatterns: ['123-45-6789', '987-65-4321'],
    investigator: 'Compliance Team',
    resolution: 'Under investigation'
  }
];

// Sample DLP Analytics
const dlpAnalytics = {
  totalPolicies: 15,
  activePolicies: 12,
  totalIncidents: 156,
  blockedAttempts: 89,
  quarantinedFiles: 34,
  falsePositives: 12,
  riskScore: 7.2,
  complianceScore: 94
};

// Sample trend data
const dlpTrends = [
  { date: '2024-01-01', incidents: 12, blocked: 8, quarantined: 3, warnings: 15 },
  { date: '2024-01-02', incidents: 15, blocked: 10, quarantined: 4, warnings: 18 },
  { date: '2024-01-03', incidents: 8, blocked: 5, quarantined: 2, warnings: 12 },
  { date: '2024-01-04', incidents: 20, blocked: 14, quarantined: 5, warnings: 25 },
  { date: '2024-01-05', incidents: 18, blocked: 12, quarantined: 4, warnings: 22 },
  { date: '2024-01-06', incidents: 10, blocked: 7, quarantined: 2, warnings: 14 },
  { date: '2024-01-07', incidents: 25, blocked: 18, quarantined: 6, warnings: 30 }
];

// Sample channel distribution
const channelDistribution = [
  { name: 'Email', value: 45, color: '#3B82F6' },
  { name: 'Web Upload', value: 25, color: '#10B981' },
  { name: 'USB/Removable', value: 15, color: '#F59E0B' },
  { name: 'Cloud Storage', value: 10, color: '#EF4444' },
  { name: 'File Share', value: 5, color: '#8B5CF6' }
];

const DataLossPrevention = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);

  // Helper functions
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'investigating': return 'bg-yellow-500';
      case 'open': return 'bg-red-500';
      case 'false_positive': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getActionColor = (action) => {
    return DLP_ACTIONS[action]?.color || 'text-gray-500';
  };

  // Filter functions
  const filteredPolicies = dlpPolicies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || policy.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const filteredIncidents = dlpIncidents.filter(incident => {
    const matchesSearch = incident.policy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesChannel = filterChannel === 'all' || incident.channel === filterChannel;
    return matchesSearch && matchesSeverity && matchesStatus && matchesChannel;
  });

  // Component for policy cards
  const PolicyCard = ({ policy }) => {
    const policyType = DLP_POLICY_TYPES[policy.type];
    const classification = CLASSIFICATION_LEVELS[policy.classification];
    const action = DLP_ACTIONS[policy.action];
    const Icon = policyType?.icon || Shield;
    const ActionIcon = action?.icon || CheckCircle;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={() => {
          setSelectedPolicy(policy);
          setPolicyDialogOpen(true);
        }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${policyType?.color || 'bg-gray-500'}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{policy.name}</CardTitle>
                  <CardDescription className="text-sm">{policyType?.name}</CardDescription>
                </div>
              </div>
              <Badge variant={policy.enabled ? "default" : "secondary"}>
                {policy.enabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{policy.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ActionIcon className={`h-4 w-4 ${action?.color}`} />
                  <span className="text-sm font-medium">{action?.name}</span>
                </div>
                <Badge className={`${classification?.color} text-white`}>
                  {classification?.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{policy.violations} violations</span>
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(policy.severity)} text-white`}>
                  {policy.severity.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Component for incident cards
  const IncidentCard = ({ incident }) => {
    const policyType = DLP_POLICY_TYPES[incident.dataType];
    const classification = CLASSIFICATION_LEVELS[incident.classification];
    const Icon = policyType?.icon || AlertTriangle;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={() => {
          setSelectedIncident(incident);
          setIncidentDialogOpen(true);
        }}
      >
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${policyType?.color || 'bg-gray-500'}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{incident.policy}</CardTitle>
                  <CardDescription className="text-sm">{incident.user}</CardDescription>
                </div>
              </div>
              <Badge className={`${getStatusColor(incident.status)} text-white`}>
                {incident.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{incident.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium capitalize">{incident.action}</span>
                  <Badge variant="outline">{incident.channel}</Badge>
                </div>
                <Badge className={`${classification?.color} text-white`}>
                  {classification?.name}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{new Date(incident.timestamp).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(incident.severity)} text-white`}>
                  {incident.severity.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Data Loss Prevention
          </h1>
          <p className="text-gray-600 mt-1">
            Protect sensitive data with advanced content inspection and policy enforcement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={realTimeMonitoring ? "default" : "secondary"} className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {realTimeMonitoring ? 'Live Monitoring' : 'Monitoring Paused'}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold">{dlpAnalytics.activePolicies}</p>
                <p className="text-xs text-gray-500">of {dlpAnalytics.totalPolicies} total</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold">{dlpAnalytics.totalIncidents}</p>
                <p className="text-xs text-green-600">↓ 12% from last week</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold">{dlpAnalytics.riskScore}/10</p>
                <p className="text-xs text-yellow-600">Medium Risk</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold">{dlpAnalytics.complianceScore}%</p>
                <p className="text-xs text-green-600">Excellent</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Trends */}
            <Card>
              <CardHeader>
                <CardTitle>DLP Incident Trends</CardTitle>
                <CardDescription>Daily incident activity over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dlpTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Area type="monotone" dataKey="incidents" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="quarantined" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Distribution by Channel</CardTitle>
                <CardDescription>Where data loss attempts are occurring</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={channelDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {channelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Critical Incidents */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Critical Incidents</CardTitle>
              <CardDescription>High-priority DLP incidents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dlpIncidents.filter(incident => incident.severity === 'critical' || incident.severity === 'high').slice(0, 4).map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Triggered Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Most Triggered Policies</CardTitle>
              <CardDescription>Policies with the highest violation rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dlpPolicies.sort((a, b) => b.violations - a.violations).slice(0, 3).map((policy) => (
                  <PolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Policies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="web">Web Upload</SelectItem>
                <SelectItem value="usb">USB/Removable</SelectItem>
                <SelectItem value="cloud">Cloud Storage</SelectItem>
                <SelectItem value="file_share">File Share</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incidents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Monitoring</CardTitle>
              <CardDescription>Live data flow monitoring and threat detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-Time Monitoring Active</h3>
                <p className="text-gray-600 mb-4">
                  Monitoring all data channels for policy violations and sensitive data exposure
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <div className="text-sm text-gray-600">Files Scanned Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <div className="text-sm text-gray-600">Active Policies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">8</div>
                    <div className="text-sm text-gray-600">Violations Detected</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DLP Reports</CardTitle>
              <CardDescription>Generate comprehensive reports on data protection activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  Policy Compliance Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Incident Analysis Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Risk Assessment Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  User Activity Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Shield className="h-6 w-6 mb-2" />
                  Data Classification Report
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  Executive Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DLP Analytics Dashboard</CardTitle>
              <CardDescription>Advanced analytics and insights on data protection</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={dlpTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <Bar dataKey="incidents" fill="#3B82F6" name="Total Incidents" />
                  <Bar dataKey="blocked" fill="#EF4444" name="Blocked" />
                  <Bar dataKey="quarantined" fill="#F59E0B" name="Quarantined" />
                  <Bar dataKey="warnings" fill="#10B981" name="Warnings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Policy Details Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected DLP policy
            </DialogDescription>
          </DialogHeader>
          {selectedPolicy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Policy Name</label>
                  <p className="text-sm text-gray-600">{selectedPolicy.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-gray-600">{DLP_POLICY_TYPES[selectedPolicy.type]?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Classification</label>
                  <Badge className={`${CLASSIFICATION_LEVELS[selectedPolicy.classification]?.color} text-white`}>
                    {CLASSIFICATION_LEVELS[selectedPolicy.classification]?.name}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <Badge variant="outline">{DLP_ACTIONS[selectedPolicy.action]?.name}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600">{selectedPolicy.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Detection Patterns</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedPolicy.patterns?.map((pattern, index) => (
                    <code key={index} className="block text-xs font-mono">{pattern}</code>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Monitored Channels</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedPolicy.channels?.map((channel) => (
                    <Badge key={channel} variant="secondary">{channel}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Violations</label>
                  <p className="text-sm text-gray-600">{selectedPolicy.violations}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created By</label>
                  <p className="text-sm text-gray-600">{selectedPolicy.createdBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Triggered</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPolicy.lastTriggered).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Incident Details Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected DLP incident
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Incident ID</label>
                  <p className="text-sm text-gray-600">{selectedIncident.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedIncident.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Policy</label>
                  <p className="text-sm text-gray-600">{selectedIncident.policy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-gray-600">{selectedIncident.user}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Action Taken</label>
                  <Badge variant="outline" className="capitalize">{selectedIncident.action}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Channel</label>
                  <Badge variant="secondary">{selectedIncident.channel}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Badge className={`${getSeverityColor(selectedIncident.severity)} text-white`}>
                    {selectedIncident.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={`${getStatusColor(selectedIncident.status)} text-white`}>
                    {selectedIncident.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600">{selectedIncident.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-sm text-gray-600">{selectedIncident.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Device</label>
                  <p className="text-sm text-gray-600">{selectedIncident.device}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">File Size</label>
                  <p className="text-sm text-gray-600">{selectedIncident.fileSize}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Investigator</label>
                  <p className="text-sm text-gray-600">{selectedIncident.investigator}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Matched Patterns</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedIncident.matchedPatterns?.map((pattern, index) => (
                    <code key={index} className="block text-xs font-mono">{pattern}</code>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Resolution</label>
                <p className="text-sm text-gray-600">{selectedIncident.resolution}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataLossPrevention;