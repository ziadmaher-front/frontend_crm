import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Database, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Download, 
  Upload,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Info,
  Clock,
  User,
  FileText,
  Zap
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
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// Encryption Algorithms
const ENCRYPTION_ALGORITHMS = {
  AES_256: { name: 'AES-256-GCM', strength: 'Very High', description: 'Advanced Encryption Standard with 256-bit key' },
  AES_128: { name: 'AES-128-GCM', strength: 'High', description: 'Advanced Encryption Standard with 128-bit key' },
  CHACHA20: { name: 'ChaCha20-Poly1305', strength: 'Very High', description: 'Modern stream cipher with authentication' },
  RSA_2048: { name: 'RSA-2048', strength: 'High', description: 'RSA public-key cryptography with 2048-bit key' },
  RSA_4096: { name: 'RSA-4096', strength: 'Very High', description: 'RSA public-key cryptography with 4096-bit key' }
};

// Field Types
const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  SSN: 'ssn',
  CREDIT_CARD: 'credit_card',
  ADDRESS: 'address',
  DATE: 'date',
  CUSTOM: 'custom'
};

// Encryption Status
const ENCRYPTION_STATUS = {
  ENCRYPTED: { status: 'encrypted', color: 'green', label: 'Encrypted' },
  DECRYPTED: { status: 'decrypted', color: 'red', label: 'Decrypted' },
  PENDING: { status: 'pending', color: 'yellow', label: 'Pending' },
  ERROR: { status: 'error', color: 'red', label: 'Error' }
};

// Mock encrypted fields data
const mockEncryptedFields = [
  {
    id: 'field_001',
    tableName: 'customers',
    fieldName: 'email',
    fieldType: FIELD_TYPES.EMAIL,
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: ENCRYPTION_STATUS.ENCRYPTED,
    encryptedAt: new Date('2024-01-10T10:00:00Z'),
    lastAccessed: new Date('2024-01-15T14:30:00Z'),
    accessCount: 45,
    keyId: 'key_001',
    dataClassification: 'PII',
    complianceLevel: 'GDPR',
    originalValue: 'john.doe@email.com',
    encryptedValue: 'AQECAHhwm0YaISJeRtJm5n1G6uqeekXuoXXPe5UFce2cq5B9AA==',
    size: 256
  },
  {
    id: 'field_002',
    tableName: 'customers',
    fieldName: 'phone',
    fieldType: FIELD_TYPES.PHONE,
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: ENCRYPTION_STATUS.ENCRYPTED,
    encryptedAt: new Date('2024-01-10T10:00:00Z'),
    lastAccessed: new Date('2024-01-15T12:15:00Z'),
    accessCount: 23,
    keyId: 'key_001',
    dataClassification: 'PII',
    complianceLevel: 'GDPR',
    originalValue: '+1234567890',
    encryptedValue: 'AQECAHhwm0YaISJeRtJm5n1G6uqeekXuoXXPe5UFce2cq5B9BB==',
    size: 128
  },
  {
    id: 'field_003',
    tableName: 'payments',
    fieldName: 'credit_card',
    fieldType: FIELD_TYPES.CREDIT_CARD,
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: ENCRYPTION_STATUS.ENCRYPTED,
    encryptedAt: new Date('2024-01-10T10:00:00Z'),
    lastAccessed: new Date('2024-01-15T16:45:00Z'),
    accessCount: 12,
    keyId: 'key_002',
    dataClassification: 'Financial',
    complianceLevel: 'PCI-DSS',
    originalValue: '4532-1234-5678-9012',
    encryptedValue: 'AQECAHhwm0YaISJeRtJm5n1G6uqeekXuoXXPe5UFce2cq5B9CC==',
    size: 256
  },
  {
    id: 'field_004',
    tableName: 'employees',
    fieldName: 'ssn',
    fieldType: FIELD_TYPES.SSN,
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: ENCRYPTION_STATUS.ENCRYPTED,
    encryptedAt: new Date('2024-01-10T10:00:00Z'),
    lastAccessed: new Date('2024-01-14T09:30:00Z'),
    accessCount: 8,
    keyId: 'key_003',
    dataClassification: 'Sensitive',
    complianceLevel: 'SOX',
    originalValue: '123-45-6789',
    encryptedValue: 'AQECAHhwm0YaISJeRtJm5n1G6uqeekXuoXXPe5UFce2cq5B9DD==',
    size: 128
  }
];

// Mock encryption keys
const mockEncryptionKeys = [
  {
    id: 'key_001',
    name: 'Customer Data Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    expiresAt: new Date('2025-01-01T00:00:00Z'),
    rotationSchedule: '90 days',
    lastRotated: new Date('2024-01-01T00:00:00Z'),
    usage: 'Customer PII encryption',
    fieldsCount: 25
  },
  {
    id: 'key_002',
    name: 'Payment Data Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    expiresAt: new Date('2025-01-01T00:00:00Z'),
    rotationSchedule: '30 days',
    lastRotated: new Date('2024-01-01T00:00:00Z'),
    usage: 'Financial data encryption',
    fieldsCount: 8
  },
  {
    id: 'key_003',
    name: 'Employee Data Key',
    algorithm: ENCRYPTION_ALGORITHMS.AES_256,
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    expiresAt: new Date('2025-01-01T00:00:00Z'),
    rotationSchedule: '60 days',
    lastRotated: new Date('2024-01-01T00:00:00Z'),
    usage: 'Employee sensitive data encryption',
    fieldsCount: 12
  }
];

const FieldEncryption = () => {
  const [encryptedFields, setEncryptedFields] = useState(mockEncryptedFields);
  const [encryptionKeys, setEncryptionKeys] = useState(mockEncryptionKeys);
  const [selectedField, setSelectedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableFilter, setTableFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDecrypted, setShowDecrypted] = useState({});
  const [newFieldDialog, setNewFieldDialog] = useState(false);
  const [keyManagementDialog, setKeyManagementDialog] = useState(false);
  const [bulkOperationDialog, setBulkOperationDialog] = useState(false);

  // Filter fields
  const filteredFields = encryptedFields.filter(field => {
    const matchesSearch = field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         field.dataClassification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTable = tableFilter === 'all' || field.tableName === tableFilter;
    const matchesStatus = statusFilter === 'all' || field.status.status === statusFilter;
    
    return matchesSearch && matchesTable && matchesStatus;
  });

  const getStatusBadgeColor = (status) => {
    switch (status.status) {
      case 'encrypted': return 'bg-green-100 text-green-800 border-green-200';
      case 'decrypted': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlgorithmStrengthColor = (strength) => {
    switch (strength) {
      case 'Very High': return 'text-green-600';
      case 'High': return 'text-blue-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const toggleFieldVisibility = (fieldId) => {
    setShowDecrypted(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const encryptField = (fieldId) => {
    setEncryptedFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, status: ENCRYPTION_STATUS.ENCRYPTED, encryptedAt: new Date() }
        : field
    ));
  };

  const decryptField = (fieldId) => {
    setEncryptedFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, status: ENCRYPTION_STATUS.DECRYPTED }
        : field
    ));
  };

  const rotateKey = (keyId) => {
    setEncryptionKeys(prev => prev.map(key => 
      key.id === keyId 
        ? { ...key, lastRotated: new Date() }
        : key
    ));
  };

  const FieldDetailDialog = ({ field, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Field Encryption Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about encrypted field
          </DialogDescription>
        </DialogHeader>

        {field && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Field ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{field.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Table</Label>
                <p className="text-sm text-muted-foreground">{field.tableName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Field Name</Label>
                <p className="text-sm text-muted-foreground">{field.fieldName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-muted-foreground">{field.fieldType}</p>
              </div>
            </div>

            <Separator />

            {/* Encryption Details */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Encryption Details</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Algorithm</Label>
                  <p className="text-sm">{field.algorithm.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Strength</Label>
                  <p className={`text-sm font-medium ${getAlgorithmStrengthColor(field.algorithm.strength)}`}>
                    {field.algorithm.strength}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Key ID</Label>
                  <p className="text-sm font-mono">{field.keyId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadgeColor(field.status)}>
                    {field.status.label}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Classification */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Data Classification</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Classification</Label>
                  <Badge variant="outline">{field.dataClassification}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Compliance Level</Label>
                  <Badge variant="outline">{field.complianceLevel}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Access Information */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Access Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Access Count</Label>
                  <p className="text-sm">{field.accessCount}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Accessed</Label>
                  <p className="text-sm">{field.lastAccessed.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Encrypted At</Label>
                  <p className="text-sm">{field.encryptedAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Size</Label>
                  <p className="text-sm">{field.size} bytes</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Values */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Data Values</Label>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Original Value</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type={showDecrypted[field.id] ? 'text' : 'password'}
                      value={field.originalValue}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFieldVisibility(field.id)}
                    >
                      {showDecrypted[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Encrypted Value</Label>
                  <Textarea
                    value={field.encryptedValue}
                    readOnly
                    className="font-mono text-xs mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => encryptField(field.id)}
                disabled={field.status.status === 'encrypted'}
              >
                <Lock className="h-4 w-4 mr-2" />
                Encrypt
              </Button>
              <Button
                variant="outline"
                onClick={() => decryptField(field.id)}
                disabled={field.status.status === 'decrypted'}
              >
                <Unlock className="h-4 w-4 mr-2" />
                Decrypt
              </Button>
              <Button
                variant="outline"
                onClick={() => rotateKey(field.keyId)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rotate Key
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Field-Level Encryption</h2>
          <p className="text-muted-foreground">
            Manage encryption for sensitive data fields across your database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewFieldDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
          <Button variant="outline" onClick={() => setKeyManagementDialog(true)}>
            <Key className="h-4 w-4 mr-2" />
            Manage Keys
          </Button>
          <Button variant="outline" onClick={() => setBulkOperationDialog(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Bulk Operations
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Encrypted Fields</p>
                <p className="text-2xl font-bold">
                  {encryptedFields.filter(f => f.status.status === 'encrypted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold">{encryptionKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Database className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Tables Protected</p>
                <p className="text-2xl font-bold">
                  {new Set(encryptedFields.map(f => f.tableName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="fields" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fields">Encrypted Fields</TabsTrigger>
          <TabsTrigger value="keys">Key Management</TabsTrigger>
          <TabsTrigger value="policies">Encryption Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Table</Label>
                  <Select value={tableFilter} onValueChange={setTableFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Tables" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tables</SelectItem>
                      {Array.from(new Set(encryptedFields.map(f => f.tableName))).map((table) => (
                        <SelectItem key={table} value={table}>
                          {table}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.values(ENCRYPTION_STATUS).map((status) => (
                        <SelectItem key={status.status} value={status.status}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fields Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encrypted Fields</CardTitle>
              <CardDescription>
                Manage encryption for sensitive database fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Last Accessed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFields.map((field) => (
                    <TableRow key={field.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{field.fieldName}</TableCell>
                      <TableCell>{field.tableName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{field.fieldType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{field.algorithm.name}</p>
                          <p className={`text-xs ${getAlgorithmStrengthColor(field.algorithm.strength)}`}>
                            {field.algorithm.strength}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(field.status)}>
                          {field.status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{field.dataClassification}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {field.lastAccessed.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedField(field)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFieldVisibility(field.id)}
                          >
                            {showDecrypted[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => field.status.status === 'encrypted' ? decryptField(field.id) : encryptField(field.id)}
                          >
                            {field.status.status === 'encrypted' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encryption Keys</CardTitle>
              <CardDescription>
                Manage encryption keys and rotation schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {encryptionKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          {key.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{key.usage}</p>
                      </div>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Algorithm</Label>
                        <p>{key.algorithm.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Fields</Label>
                        <p>{key.fieldsCount} fields</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Rotation</Label>
                        <p>{key.rotationSchedule}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Rotated</Label>
                        <p>{key.lastRotated.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" onClick={() => rotateKey(key.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Rotate Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encryption Policies</CardTitle>
              <CardDescription>
                Configure automatic encryption rules and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-encrypt PII fields</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically encrypt fields containing personally identifiable information
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Encrypt financial data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically encrypt credit card numbers, bank accounts, and financial data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Key rotation alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications when encryption keys need rotation
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Compliance monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor encryption compliance with GDPR, PCI-DSS, and other regulations
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encryption Audit Trail</CardTitle>
              <CardDescription>
                Track encryption and decryption activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: 'Field Encrypted',
                    field: 'customers.email',
                    user: 'admin@company.com',
                    timestamp: new Date('2024-01-15T10:30:00Z'),
                    details: 'Field encrypted using AES-256-GCM'
                  },
                  {
                    action: 'Key Rotated',
                    field: 'key_001',
                    user: 'system',
                    timestamp: new Date('2024-01-15T09:15:00Z'),
                    details: 'Automatic key rotation completed'
                  },
                  {
                    action: 'Field Accessed',
                    field: 'payments.credit_card',
                    user: 'user@company.com',
                    timestamp: new Date('2024-01-15T08:45:00Z'),
                    details: 'Decrypted for payment processing'
                  }
                ].map((event, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{event.action}</h4>
                        <p className="text-sm text-muted-foreground">{event.field}</p>
                      </div>
                      <Badge variant="outline">{event.timestamp.toLocaleTimeString()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {event.user}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Field Detail Dialog */}
      <FieldDetailDialog
        field={selectedField}
        isOpen={!!selectedField}
        onClose={() => setSelectedField(null)}
      />
    </div>
  );
};

export default FieldEncryption;