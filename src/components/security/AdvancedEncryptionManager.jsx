import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Key, 
  Shield, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Database,
  Server,
  HardDrive,
  Network,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Edit,
  Search,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Globe,
  FileText,
  Fingerprint,
  Cpu,
  Monitor,
  Smartphone,
  Wifi,
  AlertCircle,
  Info,
  CheckCircle2
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

// Encryption algorithms and key types
const ENCRYPTION_ALGORITHMS = {
  AES256: { name: 'AES-256-GCM', strength: 'Military Grade', keySize: 256 },
  AES128: { name: 'AES-128-GCM', strength: 'High', keySize: 128 },
  RSA4096: { name: 'RSA-4096', strength: 'Very High', keySize: 4096 },
  RSA2048: { name: 'RSA-2048', strength: 'High', keySize: 2048 },
  ECDSA: { name: 'ECDSA P-256', strength: 'High', keySize: 256 },
  ChaCha20: { name: 'ChaCha20-Poly1305', strength: 'High', keySize: 256 }
};

// Encryption key data
const encryptionKeys = [
  {
    id: 'key_001',
    name: 'Customer Data Master Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES256,
    status: 'active',
    created: new Date('2024-01-01T00:00:00Z'),
    lastRotated: new Date('2024-01-15T10:30:00Z'),
    nextRotation: new Date('2024-04-15T10:30:00Z'),
    usage: 'field_encryption',
    compliance: ['GDPR', 'PCI-DSS', 'HIPAA'],
    encryptedFields: 1247,
    accessCount: 45672,
    keyVersion: 3,
    environment: 'production'
  },
  {
    id: 'key_002',
    name: 'Communication Encryption Key',
    algorithm: ENCRYPTION_ALGORITHMS.RSA4096,
    status: 'active',
    created: new Date('2024-01-05T00:00:00Z'),
    lastRotated: new Date('2024-01-20T14:15:00Z'),
    nextRotation: new Date('2024-07-20T14:15:00Z'),
    usage: 'transport_encryption',
    compliance: ['SOX', 'ISO27001'],
    encryptedFields: 0,
    accessCount: 23451,
    keyVersion: 2,
    environment: 'production'
  },
  {
    id: 'key_003',
    name: 'Backup Encryption Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES256,
    status: 'scheduled_rotation',
    created: new Date('2023-12-01T00:00:00Z'),
    lastRotated: new Date('2023-12-01T00:00:00Z'),
    nextRotation: new Date('2024-02-01T00:00:00Z'),
    usage: 'backup_encryption',
    compliance: ['GDPR', 'SOX'],
    encryptedFields: 0,
    accessCount: 1234,
    keyVersion: 1,
    environment: 'production'
  },
  {
    id: 'key_004',
    name: 'Development Test Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES128,
    status: 'expired',
    created: new Date('2023-11-01T00:00:00Z'),
    lastRotated: new Date('2023-11-01T00:00:00Z'),
    nextRotation: new Date('2024-01-01T00:00:00Z'),
    usage: 'development',
    compliance: [],
    encryptedFields: 89,
    accessCount: 567,
    keyVersion: 1,
    environment: 'development'
  }
];

// Field-level encryption data
const encryptedFields = [
  {
    id: 'field_001',
    table: 'customers',
    field: 'email',
    algorithm: 'AES-256-GCM',
    keyId: 'key_001',
    encryptionLevel: 'high',
    complianceRequired: ['GDPR', 'PCI-DSS'],
    recordCount: 15672,
    lastAccessed: new Date('2024-01-15T10:30:00Z'),
    accessFrequency: 'high',
    dataClassification: 'PII'
  },
  {
    id: 'field_002',
    table: 'customers',
    field: 'phone',
    algorithm: 'AES-256-GCM',
    keyId: 'key_001',
    encryptionLevel: 'high',
    complianceRequired: ['GDPR'],
    recordCount: 14523,
    lastAccessed: new Date('2024-01-15T09:45:00Z'),
    accessFrequency: 'medium',
    dataClassification: 'PII'
  },
  {
    id: 'field_003',
    table: 'deals',
    field: 'value',
    algorithm: 'AES-256-GCM',
    keyId: 'key_001',
    encryptionLevel: 'medium',
    complianceRequired: ['SOX'],
    recordCount: 8934,
    lastAccessed: new Date('2024-01-15T11:20:00Z'),
    accessFrequency: 'high',
    dataClassification: 'Financial'
  },
  {
    id: 'field_004',
    table: 'leads',
    field: 'notes',
    algorithm: 'AES-256-GCM',
    keyId: 'key_001',
    encryptionLevel: 'low',
    complianceRequired: ['GDPR'],
    recordCount: 23456,
    lastAccessed: new Date('2024-01-15T08:15:00Z'),
    accessFrequency: 'low',
    dataClassification: 'Confidential'
  }
];

// Encryption performance data
const encryptionPerformance = [
  { time: '00:00', operations: 1200, latency: 2.3, throughput: 98.5 },
  { time: '04:00', operations: 800, latency: 1.8, throughput: 99.2 },
  { time: '08:00', operations: 2500, latency: 3.1, throughput: 97.8 },
  { time: '12:00', operations: 3200, latency: 3.8, throughput: 96.5 },
  { time: '16:00', operations: 2800, latency: 3.2, throughput: 97.2 },
  { time: '20:00', operations: 1800, latency: 2.5, throughput: 98.8 },
  { time: '24:00', operations: 1000, latency: 2.0, throughput: 99.1 }
];

// Compliance status data
const complianceStatus = [
  { standard: 'GDPR', status: 'compliant', score: 98, lastAudit: '2024-01-10', nextAudit: '2024-04-10' },
  { standard: 'PCI-DSS', status: 'compliant', score: 95, lastAudit: '2024-01-05', nextAudit: '2024-04-05' },
  { standard: 'HIPAA', status: 'compliant', score: 92, lastAudit: '2024-01-08', nextAudit: '2024-04-08' },
  { standard: 'SOX', status: 'warning', score: 88, lastAudit: '2024-01-12', nextAudit: '2024-04-12' },
  { standard: 'ISO27001', status: 'compliant', score: 96, lastAudit: '2024-01-15', nextAudit: '2024-04-15' }
];

// Key rotation history
const keyRotationHistory = [
  { date: '2024-01-15', keyId: 'key_001', type: 'scheduled', status: 'completed', duration: '2.3s' },
  { date: '2024-01-20', keyId: 'key_002', type: 'scheduled', status: 'completed', duration: '4.1s' },
  { date: '2024-01-10', keyId: 'key_003', type: 'emergency', status: 'completed', duration: '1.8s' },
  { date: '2024-01-05', keyId: 'key_001', type: 'scheduled', status: 'completed', duration: '2.7s' }
];

const AdvancedEncryptionManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedKey, setSelectedKey] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [algorithmFilter, setAlgorithmFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [showRotationDialog, setShowRotationDialog] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled_rotation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'revoked': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'scheduled_rotation': return Clock;
      case 'expired': return XCircle;
      case 'revoked': return AlertTriangle;
      default: return Info;
    }
  };

  const getComplianceStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'non_compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEncryptionLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const EncryptionKeyCard = ({ keyData }) => {
    const StatusIcon = getStatusIcon(keyData.status);
    
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedKey(keyData)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{keyData.name}</h3>
                <p className="text-sm text-gray-600">{keyData.algorithm.name}</p>
              </div>
            </div>
            <Badge className={getStatusColor(keyData.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {keyData.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Key Version:</span>
              <span className="ml-2 font-medium">v{keyData.keyVersion}</span>
            </div>
            <div>
              <span className="text-gray-600">Environment:</span>
              <span className="ml-2 font-medium capitalize">{keyData.environment}</span>
            </div>
            <div>
              <span className="text-gray-600">Usage:</span>
              <span className="ml-2 font-medium">{keyData.usage.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="text-gray-600">Access Count:</span>
              <span className="ml-2 font-medium">{keyData.accessCount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Next Rotation:</span>
              <span className="font-medium">{keyData.nextRotation.toLocaleDateString()}</span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, 100 - ((keyData.nextRotation - new Date()) / (90 * 24 * 60 * 60 * 1000)) * 100))} 
              className="h-2" 
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-1">
            {keyData.compliance.map((standard) => (
              <Badge key={standard} variant="outline" className="text-xs">
                {standard}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EncryptedFieldCard = ({ fieldData }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedField(fieldData)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-gray-600" />
            <span className="font-medium">{fieldData.table}.{fieldData.field}</span>
          </div>
          <Badge className={getEncryptionLevelColor(fieldData.encryptionLevel)}>
            {fieldData.encryptionLevel}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Algorithm:</span>
            <span className="ml-1 font-medium">{fieldData.algorithm}</span>
          </div>
          <div>
            <span className="text-gray-600">Records:</span>
            <span className="ml-1 font-medium">{fieldData.recordCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Classification:</span>
            <span className="ml-1 font-medium">{fieldData.dataClassification}</span>
          </div>
          <div>
            <span className="text-gray-600">Access:</span>
            <span className="ml-1 font-medium capitalize">{fieldData.accessFrequency}</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {fieldData.complianceRequired.map((standard) => (
            <Badge key={standard} variant="outline" className="text-xs">
              {standard}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ComplianceStatusCard = ({ compliance }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">{compliance.standard}</span>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${getComplianceStatusColor(compliance.status)}`}>
              {compliance.score}%
            </div>
            <Badge variant={compliance.status === 'compliant' ? 'default' : 'secondary'}>
              {compliance.status}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Last Audit:</span>
            <span className="font-medium">{compliance.lastAudit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next Audit:</span>
            <span className="font-medium">{compliance.nextAudit}</span>
          </div>
        </div>
        
        <Progress value={compliance.score} className="mt-3 h-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Encryption Management</h1>
          <p className="text-gray-600 mt-1">
            Advanced encryption, key management, and compliance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowNewKeyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Key
          </Button>
          <Button variant="outline" onClick={() => setShowRotationDialog(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rotate Keys
          </Button>
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-2xl font-bold text-gray-900">
                  {encryptionKeys.filter(k => k.status === 'active').length}
                </p>
              </div>
              <Key className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Encrypted Fields</p>
                <p className="text-2xl font-bold text-gray-900">{encryptedFields.length}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(complianceStatus.reduce((acc, c) => acc + c.score, 0) / complianceStatus.length)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Operations/Hour</p>
                <p className="text-2xl font-bold text-gray-900">2.4K</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keys">Keys</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Encryption Performance (24h)</CardTitle>
              <CardDescription>Operations, latency, and throughput metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={encryptionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="operations" stackId="1" stroke="#3b82f6" fill="#bfdbfe" />
                  <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Key Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Status Distribution</CardTitle>
                <CardDescription>Current status of encryption keys</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    encryptionKeys.reduce((acc, key) => {
                      acc[key.status] = (acc[key.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'active' ? 'bg-green-500' :
                          status === 'scheduled_rotation' ? 'bg-yellow-500' :
                          status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Key Rotations</CardTitle>
                <CardDescription>Latest key rotation activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {keyRotationHistory.map((rotation, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{rotation.keyId}</div>
                          <div className="text-xs text-gray-600">{rotation.date}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={rotation.status === 'completed' ? 'default' : 'secondary'}>
                            {rotation.status}
                          </Badge>
                          <div className="text-xs text-gray-600 mt-1">{rotation.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search keys..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled_rotation">Scheduled Rotation</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={algorithmFilter} onValueChange={setAlgorithmFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Algorithms</SelectItem>
                    {Object.entries(ENCRYPTION_ALGORITHMS).map(([key, algo]) => (
                      <SelectItem key={key} value={key}>{algo.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Keys Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {encryptionKeys
              .filter(key => 
                (statusFilter === 'all' || key.status === statusFilter) &&
                (algorithmFilter === 'all' || key.algorithm === ENCRYPTION_ALGORITHMS[algorithmFilter]) &&
                (searchTerm === '' || key.name.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((key) => (
                <EncryptionKeyCard key={key.id} keyData={key} />
              ))}
          </div>
        </TabsContent>

        {/* Fields Tab */}
        <TabsContent value="fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Encrypted Fields</CardTitle>
              <CardDescription>Field-level encryption configuration and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {encryptedFields.map((field) => (
                  <EncryptedFieldCard key={field.id} fieldData={field} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStatus.map((compliance) => (
              <ComplianceStatusCard key={compliance.standard} compliance={compliance} />
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Encryption Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis and optimization insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={encryptionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="operations" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Key Details Dialog */}
      <Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Encryption Key Details</DialogTitle>
            <DialogDescription>
              Detailed information about the encryption key
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Key Name</Label>
                  <p className="text-sm">{selectedKey.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Algorithm</Label>
                  <p className="text-sm">{selectedKey.algorithm.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Key Size</Label>
                  <p className="text-sm">{selectedKey.algorithm.keySize} bits</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Strength</Label>
                  <p className="text-sm">{selectedKey.algorithm.strength}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusColor(selectedKey.status)}>
                    {selectedKey.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Version</Label>
                  <p className="text-sm">v{selectedKey.keyVersion}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-sm">{selectedKey.created.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Rotated</Label>
                  <p className="text-sm">{selectedKey.lastRotated.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Next Rotation</Label>
                  <p className="text-sm">{selectedKey.nextRotation.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Access Count</Label>
                  <p className="text-sm">{selectedKey.accessCount.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Compliance Standards</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedKey.compliance.map((standard) => (
                    <Badge key={standard} variant="outline">{standard}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedEncryptionManager;