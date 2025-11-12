import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Cog6ToothIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ServerIcon,
  DatabaseIcon,
  BellIcon,
  KeyIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CpuChipIcon,
  CloudIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  AtSymbolIcon,
  MapPinIcon,
  TagIcon,
  StarIcon,
  BoltIcon,
  FireIcon,
  SparklesIcon,
  LightBulbIcon,
  BeakerIcon,
  RocketLaunchIcon,
  TrophyIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  PrinterIcon,
  WifiIcon,
  SignalIcon,
  BatteryIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Admin Engine
class AdminEngine {
  constructor() {
    this.users = new Map();
    this.roles = new Map();
    this.permissions = new Map();
    this.systemConfig = new Map();
    this.auditLogs = [];
    this.systemMetrics = new Map();
    this.notifications = [];
    this.backups = [];
    this.integrations = new Map();
    this.apiKeys = new Map();
    this.webhooks = new Map();
    
    this.initializeDefaultData();
    this.startMetricsCollection();
  }

  // Initialize default data
  initializeDefaultData() {
    // Default roles
    this.roles.set('admin', {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['*'],
      color: 'red',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.roles.set('manager', {
      id: 'manager',
      name: 'Manager',
      description: 'Management access',
      permissions: ['users.read', 'users.write', 'deals.read', 'deals.write', 'reports.read'],
      color: 'blue',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.roles.set('user', {
      id: 'user',
      name: 'User',
      description: 'Standard user access',
      permissions: ['deals.read', 'deals.write', 'tasks.read', 'tasks.write'],
      color: 'green',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Default permissions
    const permissions = [
      'users.read', 'users.write', 'users.delete',
      'deals.read', 'deals.write', 'deals.delete',
      'tasks.read', 'tasks.write', 'tasks.delete',
      'reports.read', 'reports.write',
      'settings.read', 'settings.write',
      'admin.access'
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission, {
        id: permission,
        name: permission.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Permission to ${permission.split('.')[1]} ${permission.split('.')[0]}`,
        category: permission.split('.')[0]
      });
    });

    // Default users
    this.users.set('admin', {
      id: 'admin',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      avatar: null,
      phone: '+1234567890',
      department: 'IT',
      location: 'HQ'
    });

    // Default system configuration
    this.systemConfig.set('general', {
      siteName: 'Sales Pro CRM',
      siteDescription: 'Advanced CRM System',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      language: 'en',
      currency: 'USD',
      theme: 'light'
    });

    this.systemConfig.set('security', {
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true,
      passwordRequireUppercase: true,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      twoFactorRequired: false,
      ipWhitelist: [],
      allowedDomains: []
    });

    this.systemConfig.set('email', {
      provider: 'smtp',
      host: 'smtp.example.com',
      port: 587,
      secure: true,
      username: '',
      password: '',
      fromName: 'Sales Pro CRM',
      fromEmail: 'noreply@example.com'
    });

    this.systemConfig.set('notifications', {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      slackEnabled: false,
      webhookEnabled: false,
      digestFrequency: 'daily',
      quietHours: { start: '22:00', end: '08:00' }
    });

    this.systemConfig.set('backup', {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      location: 'local',
      encryption: true,
      compression: true
    });

    this.systemConfig.set('performance', {
      cacheEnabled: true,
      cacheTTL: 3600,
      compressionEnabled: true,
      cdnEnabled: false,
      maxFileSize: 10485760, // 10MB
      rateLimitEnabled: true,
      rateLimitRequests: 1000,
      rateLimitWindow: 3600
    });
  }

  // Start metrics collection
  startMetricsCollection() {
    this.updateSystemMetrics();
    setInterval(() => {
      this.updateSystemMetrics();
    }, 30000); // Update every 30 seconds
  }

  // Update system metrics
  updateSystemMetrics() {
    const now = new Date();
    
    // Simulate system metrics
    this.systemMetrics.set('cpu', {
      usage: Math.random() * 100,
      cores: 4,
      temperature: 45 + Math.random() * 20,
      timestamp: now
    });

    this.systemMetrics.set('memory', {
      used: Math.random() * 8192,
      total: 8192,
      available: 8192 - (Math.random() * 8192),
      timestamp: now
    });

    this.systemMetrics.set('disk', {
      used: Math.random() * 500,
      total: 500,
      available: 500 - (Math.random() * 500),
      timestamp: now
    });

    this.systemMetrics.set('network', {
      bytesIn: Math.random() * 1000000,
      bytesOut: Math.random() * 1000000,
      packetsIn: Math.random() * 10000,
      packetsOut: Math.random() * 10000,
      timestamp: now
    });

    this.systemMetrics.set('database', {
      connections: Math.floor(Math.random() * 50),
      queries: Math.floor(Math.random() * 1000),
      slowQueries: Math.floor(Math.random() * 10),
      size: Math.random() * 1000,
      timestamp: now
    });

    this.systemMetrics.set('application', {
      activeUsers: Math.floor(Math.random() * 100),
      requests: Math.floor(Math.random() * 10000),
      errors: Math.floor(Math.random() * 50),
      responseTime: Math.random() * 1000,
      timestamp: now
    });
  }

  // User management
  async getUsers(filters = {}) {
    let users = Array.from(this.users.values());
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(search)
      );
    }

    if (filters.role) {
      users = users.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      users = users.filter(user => user.status === filters.status);
    }

    return users;
  }

  async createUser(userData) {
    const id = `user_${Date.now()}`;
    const user = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    this.users.set(id, user);
    this.addAuditLog('user.created', `User ${user.username} created`, { userId: id });
    
    return user;
  }

  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    this.addAuditLog('user.updated', `User ${user.username} updated`, { userId: id });
    
    return updatedUser;
  }

  async deleteUser(id) {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    this.users.delete(id);
    this.addAuditLog('user.deleted', `User ${user.username} deleted`, { userId: id });
    
    return true;
  }

  // Role management
  async getRoles() {
    return Array.from(this.roles.values());
  }

  async createRole(roleData) {
    const id = `role_${Date.now()}`;
    const role = {
      id,
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(id, role);
    this.addAuditLog('role.created', `Role ${role.name} created`, { roleId: id });
    
    return role;
  }

  async updateRole(id, updates) {
    const role = this.roles.get(id);
    if (!role) throw new Error('Role not found');

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: new Date()
    };

    this.roles.set(id, updatedRole);
    this.addAuditLog('role.updated', `Role ${role.name} updated`, { roleId: id });
    
    return updatedRole;
  }

  async deleteRole(id) {
    const role = this.roles.get(id);
    if (!role) throw new Error('Role not found');

    // Check if role is in use
    const usersWithRole = Array.from(this.users.values()).filter(user => user.role === id);
    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    this.roles.delete(id);
    this.addAuditLog('role.deleted', `Role ${role.name} deleted`, { roleId: id });
    
    return true;
  }

  // System configuration
  async getSystemConfig(category = null) {
    if (category) {
      return this.systemConfig.get(category);
    }
    
    const config = {};
    this.systemConfig.forEach((value, key) => {
      config[key] = value;
    });
    
    return config;
  }

  async updateSystemConfig(category, updates) {
    const currentConfig = this.systemConfig.get(category) || {};
    const updatedConfig = { ...currentConfig, ...updates };
    
    this.systemConfig.set(category, updatedConfig);
    this.addAuditLog('config.updated', `System configuration ${category} updated`, { category });
    
    return updatedConfig;
  }

  // System metrics
  getSystemMetrics() {
    const metrics = {};
    this.systemMetrics.forEach((value, key) => {
      metrics[key] = value;
    });
    return metrics;
  }

  // Audit logging
  addAuditLog(action, description, metadata = {}) {
    const log = {
      id: `log_${Date.now()}`,
      action,
      description,
      metadata,
      timestamp: new Date(),
      userId: 'admin', // Would get from current user context
      ipAddress: '127.0.0.1' // Would get from request
    };

    this.auditLogs.unshift(log);
    this.auditLogs = this.auditLogs.slice(0, 1000); // Keep last 1000 logs
  }

  getAuditLogs(filters = {}) {
    let logs = [...this.auditLogs];
    
    if (filters.action) {
      logs = logs.filter(log => log.action.includes(filters.action));
    }

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters.dateFrom) {
      logs = logs.filter(log => log.timestamp >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      logs = logs.filter(log => log.timestamp <= new Date(filters.dateTo));
    }

    return logs;
  }

  // System health check
  async performHealthCheck() {
    const checks = {
      database: { status: 'healthy', responseTime: Math.random() * 100 },
      cache: { status: 'healthy', responseTime: Math.random() * 50 },
      storage: { status: 'healthy', freeSpace: Math.random() * 100 },
      email: { status: 'healthy', lastSent: new Date() },
      api: { status: 'healthy', responseTime: Math.random() * 200 },
      backup: { status: 'healthy', lastBackup: new Date() }
    };

    // Randomly make some checks unhealthy for demo
    if (Math.random() < 0.1) {
      checks.database.status = 'warning';
      checks.database.message = 'High connection count';
    }

    if (Math.random() < 0.05) {
      checks.email.status = 'error';
      checks.email.message = 'SMTP connection failed';
    }

    return checks;
  }

  // Backup management
  async createBackup(type = 'full') {
    const backup = {
      id: `backup_${Date.now()}`,
      type,
      status: 'in_progress',
      size: 0,
      createdAt: new Date(),
      completedAt: null
    };

    this.backups.unshift(backup);

    // Simulate backup process
    setTimeout(() => {
      backup.status = 'completed';
      backup.size = Math.random() * 1000000000; // Random size in bytes
      backup.completedAt = new Date();
    }, 5000);

    this.addAuditLog('backup.created', `${type} backup initiated`, { backupId: backup.id });
    
    return backup;
  }

  getBackups() {
    return this.backups;
  }

  async restoreBackup(backupId) {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) throw new Error('Backup not found');

    this.addAuditLog('backup.restored', `Backup ${backupId} restored`, { backupId });
    
    return true;
  }

  async deleteBackup(backupId) {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index === -1) throw new Error('Backup not found');

    this.backups.splice(index, 1);
    this.addAuditLog('backup.deleted', `Backup ${backupId} deleted`, { backupId });
    
    return true;
  }
}

// System Metrics Component
const SystemMetrics = ({ metrics }) => {
  const getStatusColor = (value, max, thresholds = { warning: 70, critical: 90 }) => {
    const percentage = (value / max) * 100;
    if (percentage >= thresholds.critical) return 'text-red-600';
    if (percentage >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* CPU Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <CpuChipIcon className="h-4 w-4" />
            <span>CPU Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage</span>
              <span className={getStatusColor(metrics.cpu?.usage || 0, 100)}>
                {(metrics.cpu?.usage || 0).toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.cpu?.usage || 0} className="h-2" />
            <div className="text-xs text-gray-500">
              {metrics.cpu?.cores || 0} cores • {(metrics.cpu?.temperature || 0).toFixed(1)}°C
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <ServerIcon className="h-4 w-4" />
            <span>Memory Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span className={getStatusColor(metrics.memory?.used || 0, metrics.memory?.total || 1)}>
                {formatBytes((metrics.memory?.used || 0) * 1024 * 1024)}
              </span>
            </div>
            <Progress 
              value={((metrics.memory?.used || 0) / (metrics.memory?.total || 1)) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-gray-500">
              {formatBytes((metrics.memory?.total || 0) * 1024 * 1024)} total
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disk Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <DatabaseIcon className="h-4 w-4" />
            <span>Disk Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span className={getStatusColor(metrics.disk?.used || 0, metrics.disk?.total || 1)}>
                {formatBytes((metrics.disk?.used || 0) * 1024 * 1024 * 1024)}
              </span>
            </div>
            <Progress 
              value={((metrics.disk?.used || 0) / (metrics.disk?.total || 1)) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-gray-500">
              {formatBytes((metrics.disk?.total || 0) * 1024 * 1024 * 1024)} total
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <GlobeAltIcon className="h-4 w-4" />
            <span>Network</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>In</span>
              <span>{formatBytes(metrics.network?.bytesIn || 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Out</span>
              <span>{formatBytes(metrics.network?.bytesOut || 0)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {(metrics.network?.packetsIn || 0).toLocaleString()} packets in
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <DatabaseIcon className="h-4 w-4" />
            <span>Database</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Connections</span>
              <span>{metrics.database?.connections || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Queries</span>
              <span>{(metrics.database?.queries || 0).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500">
              {metrics.database?.slowQueries || 0} slow queries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Metrics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <ChartBarIcon className="h-4 w-4" />
            <span>Application</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Active Users</span>
              <span>{metrics.application?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Requests</span>
              <span>{(metrics.application?.requests || 0).toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500">
              {(metrics.application?.responseTime || 0).toFixed(0)}ms avg response
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// User Management Component
const UserManagement = ({ engine }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const userData = await engine.getUsers(filters);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const roleData = await engine.getRoles();
      setRoles(roleData);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await engine.createUser(userData);
      loadUsers();
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (id, updates) => {
    try {
      await engine.updateUser(id, updates);
      loadUsers();
      setSelectedUser(null);
      setShowUserModal(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await engine.deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.color : 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => {
          setSelectedUser(null);
          setShowUserModal(true);
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Search</Label>
              <Input
                placeholder="Search users..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Role</Label>
              <Select
                value={filters.role || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, role: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-${getRoleColor(user.role)}-200 text-${getRoleColor(user.role)}-700`}>
                        {getRoleName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className={
                          user.status === 'active' ? 'bg-green-100 text-green-800' :
                          user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Edit User' : 'Create User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update user information and permissions' : 'Add a new user to the system'}
            </DialogDescription>
          </DialogHeader>
          
          <UserForm
            user={selectedUser}
            roles={roles}
            onSubmit={selectedUser ? 
              (data) => handleUpdateUser(selectedUser.id, data) : 
              handleCreateUser
            }
            onCancel={() => setShowUserModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// User Form Component
const UserForm = ({ user, roles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    phone: user?.phone || '',
    department: user?.department || '',
    location: user?.location || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label>Username</Label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Department</Label>
          <Input
            value={formData.department}
            onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

// System Configuration Component
const SystemConfiguration = ({ engine }) => {
  const [config, setConfig] = useState({});
  const [activeCategory, setActiveCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const configData = await engine.getSystemConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (category, updates) => {
    setSaving(true);
    try {
      await engine.updateSystemConfig(category, updates);
      setConfig(prev => ({
        ...prev,
        [category]: { ...prev[category], ...updates }
      }));
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { key: 'general', label: 'General', icon: Cog6ToothIcon },
    { key: 'security', label: 'Security', icon: ShieldCheckIcon },
    { key: 'email', label: 'Email', icon: EnvelopeIcon },
    { key: 'notifications', label: 'Notifications', icon: BellIcon },
    { key: 'backup', label: 'Backup', icon: DatabaseIcon },
    { key: 'performance', label: 'Performance', icon: BoltIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Configuration</h2>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {categories.map(category => (
                <Button
                  key={category.key}
                  variant={activeCategory === category.key ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveCategory(category.key)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Forms */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {categories.find(c => c.key === activeCategory)?.icon && (
                  <categories.find(c => c.key === activeCategory).icon className="h-5 w-5" />
                )}
                <span>{categories.find(c => c.key === activeCategory)?.label} Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigurationForm
                category={activeCategory}
                config={config[activeCategory] || {}}
                onSave={(updates) => handleSaveConfig(activeCategory, updates)}
                saving={saving}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Configuration Form Component
const ConfigurationForm = ({ category, config, onSave, saving }) => {
  const [formData, setFormData] = useState(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderField = (key, value, type = 'text') => {
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, [key]: checked }))
              }
            />
            <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
          </div>
        );
      
      case 'number':
        return (
          <div>
            <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))
              }
            />
          </div>
        );
      
      case 'select':
        const options = getSelectOptions(key);
        return (
          <div>
            <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
            <Select
              value={value}
              onValueChange={(newValue) => 
                setFormData(prev => ({ ...prev, [key]: newValue }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      default:
        return (
          <div>
            <Label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
            <Input
              type={key.includes('password') ? 'password' : 'text'}
              value={value}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, [key]: e.target.value }))
              }
            />
          </div>
        );
    }
  };

  const getSelectOptions = (key) => {
    const optionsMap = {
      timezone: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' }
      ],
      dateFormat: [
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }
      ],
      timeFormat: [
        { value: '12h', label: '12 Hour' },
        { value: '24h', label: '24 Hour' }
      ],
      language: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' }
      ],
      currency: [
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' },
        { value: 'GBP', label: 'British Pound' },
        { value: 'JPY', label: 'Japanese Yen' }
      ],
      theme: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' }
      ],
      provider: [
        { value: 'smtp', label: 'SMTP' },
        { value: 'sendgrid', label: 'SendGrid' },
        { value: 'mailgun', label: 'Mailgun' },
        { value: 'ses', label: 'Amazon SES' }
      ],
      digestFrequency: [
        { value: 'realtime', label: 'Real-time' },
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' }
      ],
      frequency: [
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' }
      ],
      location: [
        { value: 'local', label: 'Local Storage' },
        { value: 's3', label: 'Amazon S3' },
        { value: 'gcs', label: 'Google Cloud Storage' },
        { value: 'azure', label: 'Azure Blob Storage' }
      ]
    };
    
    return optionsMap[key] || [];
  };

  const getFieldType = (key, value) => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (['timezone', 'dateFormat', 'timeFormat', 'language', 'currency', 'theme', 'provider', 'digestFrequency', 'frequency', 'location'].includes(key)) {
      return 'select';
    }
    return 'text';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            {renderField(key, value, getFieldType(key, value))}
          </div>
        ))}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </form>
  );
};

// System Health Component
const SystemHealth = ({ engine }) => {
  const [healthChecks, setHealthChecks] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    performHealthCheck();
    const interval = setInterval(performHealthCheck, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const performHealthCheck = async () => {
    setLoading(true);
    try {
      const checks = await engine.performHealthCheck();
      setHealthChecks(checks);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-gray-600">Monitor system components and services</p>
        </div>
        <Button onClick={performHealthCheck} disabled={loading}>
          {loading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowPathIcon className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(healthChecks).map(([service, check]) => (
          <Card key={service} className={`border-2 ${getStatusColor(check.status)}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="capitalize">{service}</span>
                {getStatusIcon(check.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <Badge 
                    variant="outline"
                    className={
                      check.status === 'healthy' ? 'border-green-200 text-green-700' :
                      check.status === 'warning' ? 'border-yellow-200 text-yellow-700' :
                      'border-red-200 text-red-700'
                    }
                  >
                    {check.status}
                  </Badge>
                </div>
                
                {check.responseTime && (
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>{check.responseTime.toFixed(0)}ms</span>
                  </div>
                )}
                
                {check.freeSpace && (
                  <div className="flex justify-between text-sm">
                    <span>Free Space</span>
                    <span>{check.freeSpace.toFixed(1)}%</span>
                  </div>
                )}
                
                {check.lastSent && (
                  <div className="flex justify-between text-sm">
                    <span>Last Sent</span>
                    <span>{new Date(check.lastSent).toLocaleTimeString()}</span>
                  </div>
                )}
                
                {check.lastBackup && (
                  <div className="flex justify-between text-sm">
                    <span>Last Backup</span>
                    <span>{new Date(check.lastBackup).toLocaleDateString()}</span>
                  </div>
                )}
                
                {check.message && (
                  <div className="text-xs text-gray-600 mt-2">
                    {check.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Audit Logs Component
const AuditLogs = ({ engine }) => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const logData = engine.getAuditLogs(filters);
      setLogs(logData);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    if (action.includes('user')) return <UserIcon className="h-4 w-4" />;
    if (action.includes('role')) return <ShieldCheckIcon className="h-4 w-4" />;
    if (action.includes('config')) return <Cog6ToothIcon className="h-4 w-4" />;
    if (action.includes('backup')) return <DatabaseIcon className="h-4 w-4" />;
    return <InformationCircleIcon className="h-4 w-4" />;
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'text-green-600';
    if (action.includes('updated')) return 'text-blue-600';
    if (action.includes('deleted')) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <p className="text-gray-600">Track system activities and changes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Action</Label>
              <Input
                placeholder="Filter by action..."
                value={filters.action || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">User ID</Label>
              <Input
                placeholder="Filter by user..."
                value={filters.userId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Date To</Label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className={`flex items-center space-x-2 ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="font-medium">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.description}
                    </TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell className="text-sm text-gray-500">{log.ipAddress}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Admin Panel Component
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [engine] = useState(() => new AdminEngine());
  const [metrics, setMetrics] = useState({});
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Check admin permissions
    if (!user || user.role !== 'admin') {
      addNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to access the admin panel'
      });
      return;
    }

    // Load initial metrics
    const updateMetrics = () => {
      const systemMetrics = engine.getSystemMetrics();
      setMetrics(systemMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000);
    return () => clearInterval(interval);
  }, [user, addNotification, engine]);

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { key: 'users', label: 'Users', icon: UserGroupIcon },
    { key: 'system', label: 'System Config', icon: Cog6ToothIcon },
    { key: 'health', label: 'System Health', icon: ServerIcon },
    { key: 'logs', label: 'Audit Logs', icon: DocumentTextIcon }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">System administration and configuration</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map(tab => (
              <TabsTrigger key={tab.key} value={tab.key} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Quick Stats */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="font-semibold">{metrics.application?.activeUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">System Load</span>
                      <span className="font-semibold">{(metrics.cpu?.usage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className="font-semibold">
                        {(((metrics.memory?.used || 0) / (metrics.memory?.total || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Disk Usage</span>
                      <span className="font-semibold">
                        {(((metrics.disk?.used || 0) / (metrics.disk?.total || 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Metrics */}
              <div className="lg:col-span-3">
                <SystemMetrics metrics={metrics} />
              </div>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engine.getAuditLogs().slice(0, 5).map(log => (
                    <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {log.action.includes('user') && <UserIcon className="h-4 w-4 text-blue-600" />}
                        {log.action.includes('config') && <Cog6ToothIcon className="h-4 w-4 text-green-600" />}
                        {log.action.includes('backup') && <DatabaseIcon className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {log.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement engine={engine} />
          </TabsContent>

          {/* System Configuration Tab */}
          <TabsContent value="system">
            <SystemConfiguration engine={engine} />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="health">
            <SystemHealth engine={engine} />
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <AuditLogs engine={engine} />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default AdminPanel;
      