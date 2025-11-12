import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Globe, 
  Database, 
  Download, 
  Filter, 
  Search,
  Calendar,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Lock,
  Unlock,
  Activity
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

// Audit Event Types
const AUDIT_EVENT_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  DATA_ACCESS: 'data_access',
  DATA_MODIFICATION: 'data_modification',
  DATA_DELETION: 'data_deletion',
  PERMISSION_CHANGE: 'permission_change',
  SYSTEM_CONFIG: 'system_config',
  SECURITY_ALERT: 'security_alert',
  API_ACCESS: 'api_access',
  EXPORT: 'export',
  IMPORT: 'import',
  BACKUP: 'backup',
  RESTORE: 'restore'
};

// Risk Levels
const RISK_LEVELS = {
  LOW: { level: 'low', color: 'green', label: 'Low Risk' },
  MEDIUM: { level: 'medium', color: 'yellow', label: 'Medium Risk' },
  HIGH: { level: 'high', color: 'orange', label: 'High Risk' },
  CRITICAL: { level: 'critical', color: 'red', label: 'Critical Risk' }
};

// Mock audit data
const mockAuditLogs = [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    eventType: AUDIT_EVENT_TYPES.LOGIN,
    userId: 'user123',
    userName: 'John Doe',
    userEmail: 'john.doe@company.com',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    resource: 'CRM Dashboard',
    action: 'User Login',
    details: 'Successful login via SSO',
    riskLevel: RISK_LEVELS.LOW,
    sessionId: 'sess_abc123',
    success: true,
    metadata: {
      loginMethod: 'SSO',
      deviceType: 'Desktop',
      browser: 'Chrome'
    }
  },
  {
    id: '2',
    timestamp: new Date('2024-01-15T10:25:00Z'),
    eventType: AUDIT_EVENT_TYPES.DATA_MODIFICATION,
    userId: 'user456',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@company.com',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, US',
    resource: 'Customer Record #12345',
    action: 'Update Customer Information',
    details: 'Modified customer contact information and deal value',
    riskLevel: RISK_LEVELS.MEDIUM,
    sessionId: 'sess_def456',
    success: true,
    metadata: {
      fieldsModified: ['email', 'phone', 'dealValue'],
      oldValues: { email: 'old@email.com', dealValue: 5000 },
      newValues: { email: 'new@email.com', dealValue: 7500 }
    }
  },
  {
    id: '3',
    timestamp: new Date('2024-01-15T10:20:00Z'),
    eventType: AUDIT_EVENT_TYPES.SECURITY_ALERT,
    userId: 'system',
    userName: 'System',
    userEmail: 'system@company.com',
    ipAddress: '203.0.113.1',
    userAgent: 'Unknown',
    location: 'Unknown Location',
    resource: 'Authentication System',
    action: 'Multiple Failed Login Attempts',
    details: 'Detected 5 failed login attempts from suspicious IP',
    riskLevel: RISK_LEVELS.HIGH,
    sessionId: null,
    success: false,
    metadata: {
      attemptCount: 5,
      targetAccount: 'admin@company.com',
      blocked: true,
      alertTriggered: true
    }
  },
  {
    id: '4',
    timestamp: new Date('2024-01-15T10:15:00Z'),
    eventType: AUDIT_EVENT_TYPES.DATA_DELETION,
    userId: 'user789',
    userName: 'Mike Johnson',
    userEmail: 'mike.johnson@company.com',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'Chicago, US',
    resource: 'Lead Record #67890',
    action: 'Delete Lead Record',
    details: 'Permanently deleted lead record after GDPR request',
    riskLevel: RISK_LEVELS.CRITICAL,
    sessionId: 'sess_ghi789',
    success: true,
    metadata: {
      deletionReason: 'GDPR Compliance',
      approvedBy: 'supervisor@company.com',
      backupCreated: true,
      retentionPeriod: '30 days'
    }
  }
];

const AuditLogger = () => {
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);
  const [filteredLogs, setFilteredLogs] = useState(mockAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedLog, setSelectedLog] = useState(null);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Real-time log simulation
  useEffect(() => {
    if (!realTimeEnabled || !autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate new audit log entry
      const newLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        eventType: Object.values(AUDIT_EVENT_TYPES)[Math.floor(Math.random() * Object.values(AUDIT_EVENT_TYPES).length)],
        userId: `user${Math.floor(Math.random() * 1000)}`,
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'][Math.floor(Math.random() * 4)],
        userEmail: 'user@company.com',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: ['New York, US', 'San Francisco, US', 'London, UK'][Math.floor(Math.random() * 3)],
        resource: 'CRM System',
        action: 'System Activity',
        details: 'Automated system activity',
        riskLevel: Object.values(RISK_LEVELS)[Math.floor(Math.random() * Object.values(RISK_LEVELS).length)],
        sessionId: `sess_${Date.now()}`,
        success: Math.random() > 0.1,
        metadata: {}
      };

      setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
    }, 10000); // New log every 10 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, autoRefresh]);

  // Filter logs based on search and filters
  useEffect(() => {
    let filtered = auditLogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Event type filter
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(log => log.eventType === selectedEventType);
    }

    // Risk level filter
    if (selectedRiskLevel !== 'all') {
      filtered = filtered.filter(log => log.riskLevel.level === selectedRiskLevel);
    }

    // Date range filter
    const now = new Date();
    if (dateRange !== 'all') {
      const startDate = new Date();
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter(log => log.timestamp >= startDate);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, selectedEventType, selectedRiskLevel, dateRange]);

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel.level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case AUDIT_EVENT_TYPES.LOGIN: return <User className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.LOGOUT: return <User className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.DATA_ACCESS: return <Eye className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.DATA_MODIFICATION: return <Database className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.DATA_DELETION: return <XCircle className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.SECURITY_ALERT: return <AlertTriangle className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.PERMISSION_CHANGE: return <Lock className="h-4 w-4" />;
      case AUDIT_EVENT_TYPES.SYSTEM_CONFIG: return <Activity className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'User', 'Action', 'Resource', 'Risk Level', 'Success', 'IP Address', 'Location'],
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.eventType,
        log.userName,
        log.action,
        log.resource,
        log.riskLevel.label,
        log.success ? 'Yes' : 'No',
        log.ipAddress,
        log.location
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const LogDetailDialog = ({ log, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventIcon(log?.eventType)}
            Audit Log Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this audit event
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Event ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{log.id}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Timestamp</Label>
                <p className="text-sm text-muted-foreground">{log.timestamp.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Event Type</Label>
                <p className="text-sm text-muted-foreground">{log.eventType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Risk Level</Label>
                <Badge className={getRiskBadgeColor(log.riskLevel)}>
                  {log.riskLevel.label}
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
                  <p className="text-sm font-mono">{log.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm">{log.userName}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{log.userEmail}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Session ID</Label>
                  <p className="text-sm font-mono">{log.sessionId || 'N/A'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Information */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Technical Information</Label>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">IP Address</Label>
                  <p className="text-sm font-mono">{log.ipAddress}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-sm">{log.location}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User Agent</Label>
                  <p className="text-sm font-mono text-wrap break-all">{log.userAgent}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Details */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Action Details</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Resource</Label>
                  <p className="text-sm">{log.resource}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Action</Label>
                  <p className="text-sm">{log.action}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Details</Label>
                  <p className="text-sm">{log.details}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Success</Label>
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{log.success ? 'Success' : 'Failed'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Additional Metadata</Label>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
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
          <h2 className="text-2xl font-bold tracking-tight">Audit Logger</h2>
          <p className="text-muted-foreground">
            Monitor and track all system activities for security compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportLogs} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={() => setAutoRefresh(!autoRefresh)} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Label>Real-time Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Enable real-time audit log collection
              </p>
            </div>
            <Switch
              checked={realTimeEnabled}
              onCheckedChange={setRealTimeEnabled}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Label>Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for high-risk events
              </p>
            </div>
            <Switch
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {Object.entries(AUDIT_EVENT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Object.values(RISK_LEVELS).map((risk) => (
                    <SelectItem key={risk.level} value={risk.level}>
                      {risk.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Logs ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Recent system activities and security events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getEventIcon(log.eventType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.action}</span>
                            <Badge className={getRiskBadgeColor(log.riskLevel)}>
                              {log.riskLevel.label}
                            </Badge>
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {log.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {log.ipAddress}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.timestamp.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredLogs.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No audit logs found matching your criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogger;