import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Download,
  Filter,
  Search,
  Calendar as CalendarIcon,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Settings,
  FileText,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';

const ACTION_TYPES = {
  CREATE: { label: 'Create', color: 'bg-green-500', icon: Plus },
  UPDATE: { label: 'Update', color: 'bg-blue-500', icon: Edit },
  DELETE: { label: 'Delete', color: 'bg-red-500', icon: Trash2 },
  VIEW: { label: 'View', color: 'bg-gray-500', icon: Eye },
  LOGIN: { label: 'Login', color: 'bg-purple-500', icon: User },
  LOGOUT: { label: 'Logout', color: 'bg-orange-500', icon: User },
  EXPORT: { label: 'Export', color: 'bg-indigo-500', icon: Download },
  IMPORT: { label: 'Import', color: 'bg-teal-500', icon: Database },
  SETTINGS: { label: 'Settings', color: 'bg-yellow-500', icon: Settings },
  PERMISSION: { label: 'Permission', color: 'bg-pink-500', icon: Shield }
};

const SEVERITY_LEVELS = {
  LOW: { label: 'Low', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800', icon: XCircle }
};

const RESOURCE_TYPES = {
  LEAD: 'Lead',
  CONTACT: 'Contact',
  ACCOUNT: 'Account',
  DEAL: 'Deal',
  TASK: 'Task',
  REPORT: 'Report',
  USER: 'User',
  ROLE: 'Role',
  SETTING: 'Setting',
  INTEGRATION: 'Integration'
};

// Mock audit log data
const generateMockAuditLogs = () => {
  const users = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
  const actions = Object.keys(ACTION_TYPES);
  const resources = Object.keys(RESOURCE_TYPES);
  const severities = Object.keys(SEVERITY_LEVELS);
  
  const logs = [];
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    logs.push({
      id: i + 1,
      timestamp,
      user,
      action,
      resource,
      resourceId: Math.floor(Math.random() * 1000) + 1,
      description: `${user} performed ${ACTION_TYPES[action].label.toLowerCase()} on ${RESOURCE_TYPES[resource]} #${Math.floor(Math.random() * 1000) + 1}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      severity,
      success: Math.random() > 0.1, // 90% success rate
      details: {
        changes: action === 'UPDATE' ? {
          before: { status: 'Open', priority: 'Medium' },
          after: { status: 'Closed', priority: 'High' }
        } : null,
        metadata: {
          sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`
        }
      }
    });
  }
  
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

const AuditLogEntry = ({ log, onViewDetails }) => {
  const ActionIcon = ACTION_TYPES[log.action]?.icon || Activity;
  const SeverityIcon = SEVERITY_LEVELS[log.severity]?.icon || Clock;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`p-2 rounded-lg ${ACTION_TYPES[log.action]?.color || 'bg-gray-500'} text-white`}>
              <ActionIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium text-sm">{log.user}</p>
                <Badge variant="outline" className="text-xs">
                  {ACTION_TYPES[log.action]?.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {RESOURCE_TYPES[log.resource]}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{log.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}</span>
                </span>
                <span>IP: {log.ipAddress}</span>
                <span className="flex items-center space-x-1">
                  {log.success ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>{log.success ? 'Success' : 'Failed'}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={SEVERITY_LEVELS[log.severity]?.color}>
              <SeverityIcon className="h-3 w-3 mr-1" />
              {SEVERITY_LEVELS[log.severity]?.label}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => onViewDetails(log)}>
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AuditLogDetails = ({ log, onClose }) => {
  if (!log) return null;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Audit Log Details</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">User</Label>
            <p className="text-sm text-gray-600">{log.user}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Action</Label>
            <p className="text-sm text-gray-600">{ACTION_TYPES[log.action]?.label}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Resource</Label>
            <p className="text-sm text-gray-600">{RESOURCE_TYPES[log.resource]} #{log.resourceId}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Timestamp</Label>
            <p className="text-sm text-gray-600">{format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">IP Address</Label>
            <p className="text-sm text-gray-600">{log.ipAddress}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge className={log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {log.success ? 'Success' : 'Failed'}
            </Badge>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Label className="text-sm font-medium">User Agent</Label>
          <p className="text-sm text-gray-600 break-all">{log.userAgent}</p>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Description</Label>
          <p className="text-sm text-gray-600">{log.description}</p>
        </div>
        
        {log.details?.changes && (
          <div>
            <Label className="text-sm font-medium">Changes</Label>
            <div className="mt-2 space-y-2">
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-red-800">Before:</p>
                <pre className="text-xs text-red-600 mt-1">
                  {JSON.stringify(log.details.changes.before, null, 2)}
                </pre>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800">After:</p>
                <pre className="text-xs text-green-600 mt-1">
                  {JSON.stringify(log.details.changes.after, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
        
        <div>
          <Label className="text-sm font-medium">Metadata</Label>
          <div className="mt-2 bg-gray-50 p-3 rounded-lg">
            <pre className="text-xs text-gray-600">
              {JSON.stringify(log.details?.metadata, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    user: 'all',
    action: 'all',
    resource: 'all',
    severity: 'all',
    success: 'all',
    dateFrom: null,
    dateTo: null,
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);

  useEffect(() => {
    // Load mock data
    const mockLogs = generateMockAuditLogs();
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = logs;

    if (filters.search) {
      filtered = filtered.filter(log => 
        log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.user.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.user && filters.user !== 'all') {
      filtered = filtered.filter(log => log.user === filters.user);
    }

    if (filters.action && filters.action !== 'all') {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    if (filters.resource && filters.resource !== 'all') {
      filtered = filtered.filter(log => log.resource === filters.resource);
    }

    if (filters.severity && filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.success !== 'all') {
      filtered = filtered.filter(log => log.success === (filters.success === 'true'));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => log.timestamp >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => log.timestamp <= filters.dateTo);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      user: '',
      action: '',
      resource: '',
      severity: '',
      success: '',
      dateFrom: null,
      dateTo: null,
      search: ''
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Description', 'IP Address', 'Status', 'Severity'].join(','),
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.user,
        ACTION_TYPES[log.action]?.label,
        RESOURCE_TYPES[log.resource],
        `"${log.description}"`,
        log.ipAddress,
        log.success ? 'Success' : 'Failed',
        SEVERITY_LEVELS[log.severity]?.label
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const uniqueUsers = [...new Set(logs.map(log => log.user))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-gray-600">Monitor and track all system activities</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>User</Label>
              <Select value={filters.user} onValueChange={(value) => handleFilterChange('user', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {uniqueUsers.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Action</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  {Object.entries(ACTION_TYPES).map(([key, action]) => (
                    <SelectItem key={key} value={key}>{action.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resource</Label>
              <Select value={filters.resource} onValueChange={(value) => handleFilterChange('resource', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  {Object.entries(RESOURCE_TYPES).map(([key, resource]) => (
                    <SelectItem key={key} value={key}>{resource}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity</Label>
              <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  {Object.entries(SEVERITY_LEVELS).map(([key, severity]) => (
                    <SelectItem key={key} value={key}>{severity.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="true">Success</SelectItem>
                  <SelectItem value="false">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => handleFilterChange('dateFrom', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => handleFilterChange('dateTo', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} logs
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {currentLogs.map(log => (
          <AuditLogEntry
            key={log.id}
            log={log}
            onViewDetails={setSelectedLog}
          />
        ))}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AuditLogDetails
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;