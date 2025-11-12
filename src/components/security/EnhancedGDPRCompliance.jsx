import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  EyeOff,
  Search, 
  Filter, 
  Download, 
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Clock,
  User,
  Users,
  Database,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  Flag,
  Target,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Smartphone,
  Monitor,
  Server,
  HardDrive,
  Network,
  Wifi,
  Mail,
  Phone,
  CreditCard,
  Building,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck,
  FileMinus,
  FileX,
  Scan,
  ScanLine,
  Radar,
  Crosshair,
  Layers,
  GitBranch,
  Code,
  Terminal
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
  PieChart as RechartsPieChart,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Data categories and types
const DATA_CATEGORIES = {
  PERSONAL: {
    name: 'Personal Data',
    description: 'Basic personal information',
    fields: ['name', 'email', 'phone', 'address', 'date_of_birth'],
    riskLevel: 'medium',
    retention: '7 years'
  },
  SENSITIVE: {
    name: 'Sensitive Personal Data',
    description: 'Special categories requiring extra protection',
    fields: ['health_data', 'biometric_data', 'political_opinions', 'religious_beliefs'],
    riskLevel: 'high',
    retention: '3 years'
  },
  FINANCIAL: {
    name: 'Financial Data',
    description: 'Payment and financial information',
    fields: ['credit_card', 'bank_account', 'payment_history', 'financial_status'],
    riskLevel: 'high',
    retention: '10 years'
  },
  BEHAVIORAL: {
    name: 'Behavioral Data',
    description: 'User behavior and preferences',
    fields: ['browsing_history', 'preferences', 'interaction_data', 'analytics'],
    riskLevel: 'medium',
    retention: '2 years'
  },
  TECHNICAL: {
    name: 'Technical Data',
    description: 'Technical identifiers and logs',
    fields: ['ip_address', 'device_id', 'cookies', 'session_data'],
    riskLevel: 'low',
    retention: '1 year'
  }
};

// GDPR request types
const REQUEST_TYPES = {
  ACCESS: { name: 'Data Access', icon: Eye, description: 'Right to access personal data' },
  RECTIFICATION: { name: 'Data Rectification', icon: Edit, description: 'Right to correct inaccurate data' },
  ERASURE: { name: 'Data Erasure', icon: Trash2, description: 'Right to be forgotten' },
  PORTABILITY: { name: 'Data Portability', icon: Download, description: 'Right to data portability' },
  RESTRICTION: { name: 'Processing Restriction', icon: Lock, description: 'Right to restrict processing' },
  OBJECTION: { name: 'Processing Objection', icon: Flag, description: 'Right to object to processing' }
};

// Sample data discovery results
const dataDiscoveryResults = [
  {
    id: 'discovery_001',
    table: 'customers',
    field: 'email',
    dataType: 'email_address',
    category: 'PERSONAL',
    recordCount: 15672,
    lastScanned: new Date('2024-01-15T10:30:00Z'),
    riskScore: 75,
    hasConsent: true,
    retentionStatus: 'compliant',
    encryptionStatus: 'encrypted',
    accessFrequency: 'high'
  },
  {
    id: 'discovery_002',
    table: 'customers',
    field: 'phone',
    dataType: 'phone_number',
    category: 'PERSONAL',
    recordCount: 14523,
    lastScanned: new Date('2024-01-15T10:30:00Z'),
    riskScore: 70,
    hasConsent: true,
    retentionStatus: 'compliant',
    encryptionStatus: 'encrypted',
    accessFrequency: 'medium'
  },
  {
    id: 'discovery_003',
    table: 'payments',
    field: 'credit_card_number',
    dataType: 'payment_card',
    category: 'FINANCIAL',
    recordCount: 8934,
    lastScanned: new Date('2024-01-15T10:30:00Z'),
    riskScore: 95,
    hasConsent: true,
    retentionStatus: 'review_required',
    encryptionStatus: 'encrypted',
    accessFrequency: 'low'
  },
  {
    id: 'discovery_004',
    table: 'analytics',
    field: 'browsing_data',
    dataType: 'behavioral_data',
    category: 'BEHAVIORAL',
    recordCount: 45678,
    lastScanned: new Date('2024-01-15T10:30:00Z'),
    riskScore: 60,
    hasConsent: false,
    retentionStatus: 'expired',
    encryptionStatus: 'not_encrypted',
    accessFrequency: 'high'
  }
];

// Sample GDPR requests
const gdprRequests = [
  {
    id: 'req_001',
    type: 'ACCESS',
    dataSubject: 'john.doe@example.com',
    requestDate: new Date('2024-01-15T09:00:00Z'),
    dueDate: new Date('2024-02-14T09:00:00Z'),
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'privacy.officer@company.com',
    description: 'Request for all personal data held by the company',
    dataCategories: ['PERSONAL', 'BEHAVIORAL'],
    estimatedRecords: 1247,
    completionPercentage: 65
  },
  {
    id: 'req_002',
    type: 'ERASURE',
    dataSubject: 'jane.smith@example.com',
    requestDate: new Date('2024-01-14T14:30:00Z'),
    dueDate: new Date('2024-02-13T14:30:00Z'),
    status: 'completed',
    priority: 'high',
    assignedTo: 'privacy.officer@company.com',
    description: 'Complete deletion of all personal data',
    dataCategories: ['PERSONAL', 'FINANCIAL', 'BEHAVIORAL'],
    estimatedRecords: 892,
    completionPercentage: 100
  },
  {
    id: 'req_003',
    type: 'RECTIFICATION',
    dataSubject: 'bob.wilson@example.com',
    requestDate: new Date('2024-01-13T11:15:00Z'),
    dueDate: new Date('2024-02-12T11:15:00Z'),
    status: 'pending',
    priority: 'low',
    assignedTo: null,
    description: 'Correction of incorrect contact information',
    dataCategories: ['PERSONAL'],
    estimatedRecords: 23,
    completionPercentage: 0
  }
];

// Consent records
const consentRecords = [
  {
    id: 'consent_001',
    dataSubject: 'john.doe@example.com',
    consentDate: new Date('2024-01-01T00:00:00Z'),
    consentType: 'marketing',
    status: 'active',
    method: 'web_form',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    purposes: ['email_marketing', 'product_updates', 'newsletters'],
    dataCategories: ['PERSONAL', 'BEHAVIORAL'],
    expiryDate: new Date('2025-01-01T00:00:00Z'),
    withdrawalDate: null
  },
  {
    id: 'consent_002',
    dataSubject: 'jane.smith@example.com',
    consentDate: new Date('2023-12-15T00:00:00Z'),
    consentType: 'processing',
    status: 'withdrawn',
    method: 'email_confirmation',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0...',
    purposes: ['data_processing', 'analytics'],
    dataCategories: ['PERSONAL', 'BEHAVIORAL'],
    expiryDate: new Date('2024-12-15T00:00:00Z'),
    withdrawalDate: new Date('2024-01-10T00:00:00Z')
  }
];

// Privacy Impact Assessments
const privacyImpactAssessments = [
  {
    id: 'pia_001',
    name: 'Customer Analytics Platform',
    description: 'Assessment for new customer behavior analytics system',
    status: 'completed',
    riskLevel: 'medium',
    createdDate: new Date('2024-01-01T00:00:00Z'),
    completedDate: new Date('2024-01-10T00:00:00Z'),
    assessor: 'privacy.officer@company.com',
    dataCategories: ['PERSONAL', 'BEHAVIORAL'],
    processingPurposes: ['analytics', 'personalization', 'marketing'],
    riskScore: 65,
    mitigationMeasures: 8,
    complianceScore: 92
  },
  {
    id: 'pia_002',
    name: 'Payment Processing Integration',
    description: 'Assessment for third-party payment processor integration',
    status: 'in_progress',
    riskLevel: 'high',
    createdDate: new Date('2024-01-05T00:00:00Z'),
    completedDate: null,
    assessor: 'privacy.officer@company.com',
    dataCategories: ['PERSONAL', 'FINANCIAL'],
    processingPurposes: ['payment_processing', 'fraud_prevention'],
    riskScore: 85,
    mitigationMeasures: 12,
    complianceScore: 78
  }
];

// Compliance metrics
const complianceMetrics = {
  overallScore: 94,
  dataDiscoveryProgress: 87,
  consentRate: 92,
  requestResponseTime: 18, // days
  breachNotificationTime: 2, // hours
  retentionCompliance: 89,
  encryptionCoverage: 96,
  staffTrainingCompletion: 85
};

// Trends data
const complianceTrends = [
  { month: 'Jan', score: 89, requests: 45, breaches: 0, assessments: 3 },
  { month: 'Feb', score: 91, requests: 52, breaches: 1, assessments: 2 },
  { month: 'Mar', score: 88, requests: 38, breaches: 0, assessments: 4 },
  { month: 'Apr', score: 93, requests: 41, breaches: 0, assessments: 1 },
  { month: 'May', score: 95, requests: 36, breaches: 0, assessments: 3 },
  { month: 'Jun', score: 94, requests: 43, breaches: 0, assessments: 2 }
];

const EnhancedGDPRCompliance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState(null);
  const [selectedPIA, setSelectedPIA] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showNewPIA, setShowNewPIA] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const DataDiscoveryCard = ({ discovery }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDiscovery(discovery)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{discovery.table}.{discovery.field}</h3>
              <p className="text-xs text-gray-600">{discovery.dataType}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getRiskColor(DATA_CATEGORIES[discovery.category]?.riskLevel)}>
              Risk: {discovery.riskScore}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {discovery.recordCount.toLocaleString()} records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Category:</span>
            <span className="ml-1 font-medium">{DATA_CATEGORIES[discovery.category]?.name}</span>
          </div>
          <div>
            <span className="text-gray-600">Consent:</span>
            <span className={`ml-1 font-medium ${discovery.hasConsent ? 'text-green-600' : 'text-red-600'}`}>
              {discovery.hasConsent ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Encryption:</span>
            <span className={`ml-1 font-medium ${discovery.encryptionStatus === 'encrypted' ? 'text-green-600' : 'text-red-600'}`}>
              {discovery.encryptionStatus}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Retention:</span>
            <span className={`ml-1 font-medium ${discovery.retentionStatus === 'compliant' ? 'text-green-600' : 'text-orange-600'}`}>
              {discovery.retentionStatus}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Risk Score:</span>
            <span className="font-medium">{discovery.riskScore}%</span>
          </div>
          <Progress value={discovery.riskScore} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  const GDPRRequestCard = ({ request }) => {
    const RequestIcon = REQUEST_TYPES[request.type]?.icon || FileText;
    const daysRemaining = Math.ceil((request.dueDate - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <RequestIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{REQUEST_TYPES[request.type]?.name}</h3>
                <p className="text-xs text-gray-600">{request.dataSubject}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(request.status)}>
                {request.status.replace('_', ' ')}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                {request.priority}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Records:</span>
              <span className="font-medium">{request.estimatedRecords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned:</span>
              <span className="font-medium">{request.assignedTo || 'Unassigned'}</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">{request.completionPercentage}%</span>
            </div>
            <Progress value={request.completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const ConsentRecordCard = ({ consent }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{consent.dataSubject}</h3>
              <p className="text-xs text-gray-600">{consent.consentType} consent</p>
            </div>
          </div>
          <Badge className={getStatusColor(consent.status)}>
            {consent.status}
          </Badge>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Method:</span>
            <span className="font-medium">{consent.method.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{consent.consentDate.toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Expires:</span>
            <span className="font-medium">{consent.expiryDate.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs text-gray-600">Purposes:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {consent.purposes.map((purpose) => (
              <Badge key={purpose} variant="outline" className="text-xs">
                {purpose.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PIACard = ({ pia }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPIA(pia)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileCheck className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{pia.name}</h3>
              <p className="text-xs text-gray-600">{pia.description}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(pia.status)}>
              {pia.status.replace('_', ' ')}
            </Badge>
            <Badge className={getRiskColor(pia.riskLevel)} variant="outline">
              {pia.riskLevel} risk
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Risk Score:</span>
            <span className="ml-1 font-medium">{pia.riskScore}%</span>
          </div>
          <div>
            <span className="text-gray-600">Compliance:</span>
            <span className="ml-1 font-medium">{pia.complianceScore}%</span>
          </div>
          <div>
            <span className="text-gray-600">Mitigations:</span>
            <span className="ml-1 font-medium">{pia.mitigationMeasures}</span>
          </div>
          <div>
            <span className="text-gray-600">Assessor:</span>
            <span className="ml-1 font-medium">{pia.assessor.split('@')[0]}</span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Risk Score:</span>
            <span className="font-medium">{pia.riskScore}%</span>
          </div>
          <Progress value={pia.riskScore} className="h-1" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Compliance:</span>
            <span className="font-medium">{pia.complianceScore}%</span>
          </div>
          <Progress value={pia.complianceScore} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GDPR Compliance</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive data protection and privacy compliance management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setIsScanning(true)}>
            <Scan className={`h-4 w-4 mr-2 ${isScanning ? 'animate-pulse' : ''}`} />
            Data Discovery
          </Button>
          <Button variant="outline" onClick={() => setShowNewRequest(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="outline" onClick={() => setShowNewPIA(true)}>
            <FileCheck className="h-4 w-4 mr-2" />
            New PIA
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.overallScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={complianceMetrics.overallScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Requests</p>
                <p className="text-2xl font-bold text-blue-600">
                  {gdprRequests.filter(r => r.status !== 'completed').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Clock className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-gray-600">Avg: {complianceMetrics.requestResponseTime} days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consent Rate</p>
                <p className="text-2xl font-bold text-purple-600">{complianceMetrics.consentRate}%</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={complianceMetrics.consentRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Discovery</p>
                <p className="text-2xl font-bold text-orange-600">{complianceMetrics.dataDiscoveryProgress}%</p>
              </div>
              <Radar className="h-8 w-8 text-orange-600" />
            </div>
            <Progress value={complianceMetrics.dataDiscoveryProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="discovery">Data Discovery</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="assessments">PIAs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Compliance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Monthly compliance metrics and request volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="assessments" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Latest GDPR data subject requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {gdprRequests.slice(0, 3).map((request) => (
                      <GDPRRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High-Risk Data</CardTitle>
                <CardDescription>Data fields requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {dataDiscoveryResults
                      .filter(d => d.riskScore > 80)
                      .map((discovery) => (
                        <DataDiscoveryCard key={discovery.id} discovery={discovery} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Discovery Tab */}
        <TabsContent value="discovery" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search data fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Data Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(DATA_CATEGORIES).map(([key, category]) => (
                      <SelectItem key={key} value={key}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsScanning(true)}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  Scan Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discovery Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataDiscoveryResults
              .filter(discovery => 
                (categoryFilter === 'all' || discovery.category === categoryFilter) &&
                (searchTerm === '' || 
                  discovery.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  discovery.field.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((discovery) => (
                <DataDiscoveryCard key={discovery.id} discovery={discovery} />
              ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Request Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gdprRequests
              .filter(request => 
                (statusFilter === 'all' || request.status === statusFilter) &&
                (searchTerm === '' || 
                  request.dataSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  request.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((request) => (
                <GDPRRequestCard key={request.id} request={request} />
              ))}
          </div>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consentRecords.map((consent) => (
              <ConsentRecordCard key={consent.id} consent={consent} />
            ))}
          </div>
        </TabsContent>

        {/* PIAs Tab */}
        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {privacyImpactAssessments.map((pia) => (
              <PIACard key={pia.id} pia={pia} />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance Analytics</CardTitle>
              <CardDescription>Detailed compliance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={complianceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fill="#d1fae5" />
                  <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>GDPR Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the data subject request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Request Type</Label>
                  <p className="text-sm">{REQUEST_TYPES[selectedRequest.type]?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Data Subject</Label>
                  <p className="text-sm">{selectedRequest.dataSubject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge variant={selectedRequest.priority === 'high' ? 'destructive' : 'secondary'}>
                    {selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Request Date</Label>
                  <p className="text-sm">{selectedRequest.requestDate.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Due Date</Label>
                  <p className="text-sm">{selectedRequest.dueDate.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                  <p className="text-sm">{selectedRequest.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estimated Records</Label>
                  <p className="text-sm">{selectedRequest.estimatedRecords}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Data Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRequest.dataCategories.map((category) => (
                    <Badge key={category} variant="outline">
                      {DATA_CATEGORIES[category]?.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Progress</Label>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{selectedRequest.completionPercentage}%</span>
                  </div>
                  <Progress value={selectedRequest.completionPercentage} className="h-2" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedGDPRCompliance;