import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Database,
  Lock,
  Unlock,
  Settings,
  Bell,
  History,
  FileCheck,
  UserX,
  RefreshCw
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
import { Checkbox } from '../ui/checkbox';

// GDPR Request Types
const REQUEST_TYPES = {
  ACCESS: 'access',
  RECTIFICATION: 'rectification',
  ERASURE: 'erasure',
  PORTABILITY: 'portability',
  RESTRICTION: 'restriction',
  OBJECTION: 'objection',
  CONSENT_WITHDRAWAL: 'consent_withdrawal'
};

// Request Status
const REQUEST_STATUS = {
  PENDING: { status: 'pending', color: 'yellow', label: 'Pending' },
  IN_PROGRESS: { status: 'in_progress', color: 'blue', label: 'In Progress' },
  COMPLETED: { status: 'completed', color: 'green', label: 'Completed' },
  REJECTED: { status: 'rejected', color: 'red', label: 'Rejected' },
  EXPIRED: { status: 'expired', color: 'gray', label: 'Expired' }
};

// Data Categories
const DATA_CATEGORIES = {
  PERSONAL: 'Personal Information',
  CONTACT: 'Contact Details',
  FINANCIAL: 'Financial Data',
  BEHAVIORAL: 'Behavioral Data',
  TECHNICAL: 'Technical Data',
  MARKETING: 'Marketing Preferences',
  COMMUNICATION: 'Communication History'
};

// Mock GDPR requests
const mockGDPRRequests = [
  {
    id: 'req_001',
    type: REQUEST_TYPES.ACCESS,
    userId: 'user_123',
    userEmail: 'john.doe@email.com',
    userName: 'John Doe',
    requestDate: new Date('2024-01-10T10:00:00Z'),
    dueDate: new Date('2024-02-09T10:00:00Z'),
    status: REQUEST_STATUS.COMPLETED,
    description: 'Request for all personal data stored in the system',
    assignedTo: 'privacy@company.com',
    completedDate: new Date('2024-01-15T14:30:00Z'),
    dataCategories: [DATA_CATEGORIES.PERSONAL, DATA_CATEGORIES.CONTACT, DATA_CATEGORIES.BEHAVIORAL],
    notes: 'Data export provided via secure download link',
    priority: 'medium'
  },
  {
    id: 'req_002',
    type: REQUEST_TYPES.ERASURE,
    userId: 'user_456',
    userEmail: 'jane.smith@email.com',
    userName: 'Jane Smith',
    requestDate: new Date('2024-01-12T15:30:00Z'),
    dueDate: new Date('2024-02-11T15:30:00Z'),
    status: REQUEST_STATUS.IN_PROGRESS,
    description: 'Request to delete all personal data due to account closure',
    assignedTo: 'privacy@company.com',
    dataCategories: [DATA_CATEGORIES.PERSONAL, DATA_CATEGORIES.CONTACT, DATA_CATEGORIES.FINANCIAL, DATA_CATEGORIES.COMMUNICATION],
    notes: 'Verifying legal basis for retention of financial records',
    priority: 'high'
  },
  {
    id: 'req_003',
    type: REQUEST_TYPES.RECTIFICATION,
    userId: 'user_789',
    userEmail: 'mike.johnson@email.com',
    userName: 'Mike Johnson',
    requestDate: new Date('2024-01-14T09:15:00Z'),
    dueDate: new Date('2024-02-13T09:15:00Z'),
    status: REQUEST_STATUS.PENDING,
    description: 'Request to correct incorrect contact information',
    assignedTo: 'privacy@company.com',
    dataCategories: [DATA_CATEGORIES.CONTACT],
    notes: 'Awaiting verification documents',
    priority: 'low'
  }
];

// Mock consent records
const mockConsentRecords = [
  {
    id: 'consent_001',
    userId: 'user_123',
    userEmail: 'john.doe@email.com',
    consentType: 'Marketing Communications',
    status: 'granted',
    grantedDate: new Date('2024-01-01T10:00:00Z'),
    purpose: 'Email marketing and promotional communications',
    legalBasis: 'Consent',
    withdrawnDate: null,
    source: 'Website Registration'
  },
  {
    id: 'consent_002',
    userId: 'user_123',
    userEmail: 'john.doe@email.com',
    consentType: 'Data Analytics',
    status: 'granted',
    grantedDate: new Date('2024-01-01T10:00:00Z'),
    purpose: 'Website analytics and user behavior tracking',
    legalBasis: 'Consent',
    withdrawnDate: null,
    source: 'Cookie Banner'
  },
  {
    id: 'consent_003',
    userId: 'user_456',
    userEmail: 'jane.smith@email.com',
    consentType: 'Marketing Communications',
    status: 'withdrawn',
    grantedDate: new Date('2023-12-15T14:30:00Z'),
    purpose: 'Email marketing and promotional communications',
    legalBasis: 'Consent',
    withdrawnDate: new Date('2024-01-10T16:45:00Z'),
    source: 'Website Registration'
  }
];

const GDPRTools = () => {
  const [gdprRequests, setGdprRequests] = useState(mockGDPRRequests);
  const [consentRecords, setConsentRecords] = useState(mockConsentRecords);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [dataExportDialog, setDataExportDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter requests
  const filteredRequests = gdprRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeColor = (status) => {
    switch (status.status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case REQUEST_TYPES.ACCESS: return <Eye className="h-4 w-4" />;
      case REQUEST_TYPES.RECTIFICATION: return <FileCheck className="h-4 w-4" />;
      case REQUEST_TYPES.ERASURE: return <Trash2 className="h-4 w-4" />;
      case REQUEST_TYPES.PORTABILITY: return <Download className="h-4 w-4" />;
      case REQUEST_TYPES.RESTRICTION: return <Lock className="h-4 w-4" />;
      case REQUEST_TYPES.OBJECTION: return <UserX className="h-4 w-4" />;
      case REQUEST_TYPES.CONSENT_WITHDRAWAL: return <UserCheck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleRequestUpdate = (requestId, updates) => {
    setGdprRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, ...updates } : req
    ));
  };

  const exportUserData = (userId) => {
    // Simulate data export
    const userData = {
      userId,
      exportDate: new Date().toISOString(),
      personalData: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1234567890',
        address: '123 Main St, City, Country'
      },
      activityData: {
        loginHistory: [],
        purchaseHistory: [],
        communicationHistory: []
      },
      preferences: {
        marketing: true,
        analytics: true,
        notifications: false
      }
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const RequestDetailDialog = ({ request, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRequestTypeIcon(request?.type)}
            GDPR Request Details
          </DialogTitle>
          <DialogDescription>
            Manage and track GDPR compliance request
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="space-y-6">
            {/* Request Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Request ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{request.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <p className="text-sm text-muted-foreground">{request.type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {request.status.label}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <Badge variant={request.priority === 'high' ? 'destructive' : request.priority === 'medium' ? 'default' : 'secondary'}>
                  {request.priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div>
              <Label className="text-sm font-medium mb-2 block">User Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="text-sm font-mono">{request.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm">{request.userName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{request.userEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned To</Label>
                  <p className="text-sm">{request.assignedTo}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Timeline</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Request Date</Label>
                  <p className="text-sm">{request.requestDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p className="text-sm">{request.dueDate.toLocaleDateString()}</p>
                </div>
                {request.completedDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Completed Date</Label>
                    <p className="text-sm">{request.completedDate.toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">Days Remaining</Label>
                  <p className="text-sm">{getDaysRemaining(request.dueDate)} days</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Data Categories */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Data Categories</Label>
              <div className="flex flex-wrap gap-2">
                {request.dataCategories.map((category, index) => (
                  <Badge key={index} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Description and Notes */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea
                  value={request.notes}
                  onChange={(e) => handleRequestUpdate(request.id, { notes: e.target.value })}
                  placeholder="Add notes about this request..."
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleRequestUpdate(request.id, { status: REQUEST_STATUS.COMPLETED })}
                disabled={request.status.status === 'completed'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                onClick={() => exportUserData(request.userId)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRequestUpdate(request.id, { status: REQUEST_STATUS.IN_PROGRESS })}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Status
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
          <h2 className="text-2xl font-bold tracking-tight">GDPR Compliance Tools</h2>
          <p className="text-muted-foreground">
            Manage data privacy requests and ensure GDPR compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewRequestDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="outline" onClick={() => setDataExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{gdprRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {gdprRequests.filter(r => r.status.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {gdprRequests.filter(r => r.status.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">
                  {gdprRequests.filter(r => getDaysRemaining(r.dueDate) < 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">GDPR Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
          <TabsTrigger value="data-mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.values(REQUEST_STATUS).map((status) => (
                        <SelectItem key={status.status} value={status.status}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(REQUEST_TYPES).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GDPR Requests</CardTitle>
              <CardDescription>
                Manage and track data privacy requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="mt-1">
                              {getRequestTypeIcon(request.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{request.type.replace('_', ' ').toUpperCase()}</span>
                                <Badge className={getStatusBadgeColor(request.status)}>
                                  {request.status.label}
                                </Badge>
                                <Badge variant={request.priority === 'high' ? 'destructive' : request.priority === 'medium' ? 'default' : 'secondary'}>
                                  {request.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {request.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {request.userEmail}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {request.dueDate.toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getDaysRemaining(request.dueDate)} days remaining
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consent Management</CardTitle>
              <CardDescription>
                Track and manage user consent records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {consentRecords.map((consent) => (
                    <div key={consent.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{consent.consentType}</h4>
                          <p className="text-sm text-muted-foreground">{consent.userEmail}</p>
                        </div>
                        <Badge variant={consent.status === 'granted' ? 'default' : 'destructive'}>
                          {consent.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{consent.purpose}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Legal Basis: {consent.legalBasis}</span>
                        <span>Source: {consent.source}</span>
                        <span>Granted: {consent.grantedDate.toLocaleDateString()}</span>
                        {consent.withdrawnDate && (
                          <span>Withdrawn: {consent.withdrawnDate.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Mapping</CardTitle>
              <CardDescription>
                Map and categorize personal data across systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(DATA_CATEGORIES).map(([key, category]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4" />
                      <h4 className="font-medium">{category}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Data fields and processing activities for {category.toLowerCase()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Active</Badge>
                      <span className="text-xs text-muted-foreground">Last updated: 2024-01-15</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Dashboard</CardTitle>
              <CardDescription>
                Monitor GDPR compliance status and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Request Response Rate</Label>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Data Mapping Coverage</Label>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Consent Collection Rate</Label>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Policy Compliance</Label>
                    <span className="text-sm text-muted-foreground">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Detail Dialog */}
      <RequestDetailDialog
        request={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};

export default GDPRTools;