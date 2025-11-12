import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Key, 
  Users, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Globe,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Clock,
  Activity,
  Zap,
  Link,
  Unlink
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

// SSO Providers
const SSO_PROVIDERS = {
  OKTA: { 
    name: 'Okta', 
    type: 'SAML', 
    icon: '🔐', 
    description: 'Enterprise identity and access management',
    features: ['SAML 2.0', 'SCIM', 'MFA', 'User Provisioning']
  },
  AZURE_AD: { 
    name: 'Azure Active Directory', 
    type: 'OIDC', 
    icon: '🔵', 
    description: 'Microsoft cloud identity service',
    features: ['OpenID Connect', 'OAuth 2.0', 'Conditional Access', 'B2B/B2C']
  },
  GOOGLE_WORKSPACE: { 
    name: 'Google Workspace', 
    type: 'OIDC', 
    icon: '🔴', 
    description: 'Google cloud identity and productivity suite',
    features: ['OpenID Connect', 'OAuth 2.0', 'G Suite Integration', 'Admin Console']
  },
  PING_IDENTITY: { 
    name: 'PingIdentity', 
    type: 'SAML', 
    icon: '🟡', 
    description: 'Enterprise identity and access management',
    features: ['SAML 2.0', 'OAuth 2.0', 'API Security', 'Risk-based Authentication']
  },
  AUTH0: { 
    name: 'Auth0', 
    type: 'OIDC', 
    icon: '🟠', 
    description: 'Identity platform for developers',
    features: ['Universal Login', 'Social Connections', 'MFA', 'Rules Engine']
  }
};

// Connection Status
const CONNECTION_STATUS = {
  ACTIVE: { status: 'active', color: 'green', label: 'Active' },
  INACTIVE: { status: 'inactive', color: 'gray', label: 'Inactive' },
  ERROR: { status: 'error', color: 'red', label: 'Error' },
  TESTING: { status: 'testing', color: 'yellow', label: 'Testing' },
  PENDING: { status: 'pending', color: 'blue', label: 'Pending' }
};

// Mock SSO connections
const mockSSOConnections = [
  {
    id: 'sso_001',
    provider: SSO_PROVIDERS.AZURE_AD,
    name: 'Company Azure AD',
    status: CONNECTION_STATUS.ACTIVE,
    domain: 'company.com',
    entityId: 'https://sts.windows.net/12345678-1234-1234-1234-123456789012/',
    ssoUrl: 'https://login.microsoftonline.com/12345678-1234-1234-1234-123456789012/saml2',
    certificate: 'MIICXjCCAcegAwIBAgIBADANBgkqhkiG9w0BAQ0FADCBhzELMAkGA1UEBhMCVVMx...',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastSync: new Date('2024-01-15T10:30:00Z'),
    userCount: 245,
    groupCount: 12,
    settings: {
      autoProvisioning: true,
      groupMapping: true,
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
      },
      defaultRole: 'user',
      sessionTimeout: 480
    }
  },
  {
    id: 'sso_002',
    provider: SSO_PROVIDERS.OKTA,
    name: 'Okta Enterprise',
    status: CONNECTION_STATUS.ACTIVE,
    domain: 'company.okta.com',
    entityId: 'http://www.okta.com/exk1234567890abcdef',
    ssoUrl: 'https://company.okta.com/app/company_crm_1/exk1234567890abcdef/sso/saml',
    certificate: 'MIICXjCCAcegAwIBAgIBADANBgkqhkiG9w0BAQ0FADCBhzELMAkGA1UEBhMCVVMx...',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastSync: new Date('2024-01-15T09:15:00Z'),
    userCount: 189,
    groupCount: 8,
    settings: {
      autoProvisioning: true,
      groupMapping: true,
      attributeMapping: {
        email: 'email',
        firstName: 'firstName',
        lastName: 'lastName'
      },
      defaultRole: 'user',
      sessionTimeout: 360
    }
  }
];

// Mock user sessions
const mockUserSessions = [
  {
    id: 'session_001',
    userId: 'user_123',
    userName: 'John Doe',
    userEmail: 'john.doe@company.com',
    provider: 'Azure AD',
    loginTime: new Date('2024-01-15T09:00:00Z'),
    lastActivity: new Date('2024-01-15T10:30:00Z'),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    status: 'active',
    sessionDuration: 90
  },
  {
    id: 'session_002',
    userId: 'user_456',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@company.com',
    provider: 'Okta',
    loginTime: new Date('2024-01-15T08:30:00Z'),
    lastActivity: new Date('2024-01-15T10:25:00Z'),
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, US',
    status: 'active',
    sessionDuration: 115
  }
];

const SSOIntegration = () => {
  const [ssoConnections, setSSOConnections] = useState(mockSSOConnections);
  const [userSessions, setUserSessions] = useState(mockUserSessions);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [newConnectionDialog, setNewConnectionDialog] = useState(false);
  const [testConnectionDialog, setTestConnectionDialog] = useState(false);
  const [showCertificate, setShowCertificate] = useState({});

  const getStatusBadgeColor = (status) => {
    switch (status.status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleConnection = (connectionId) => {
    setSSOConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { 
            ...conn, 
            status: conn.status.status === 'active' 
              ? CONNECTION_STATUS.INACTIVE 
              : CONNECTION_STATUS.ACTIVE 
          }
        : conn
    ));
  };

  const testConnection = (connectionId) => {
    setSSOConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: CONNECTION_STATUS.TESTING }
        : conn
    ));

    // Simulate test completion
    setTimeout(() => {
      setSSOConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: CONNECTION_STATUS.ACTIVE }
          : conn
      ));
    }, 3000);
  };

  const syncUsers = (connectionId) => {
    setSSOConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, lastSync: new Date() }
        : conn
    ));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const ConnectionDetailDialog = ({ connection, isOpen, onClose }) => (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{connection?.provider.icon}</span>
            SSO Connection Details
          </DialogTitle>
          <DialogDescription>
            Configure and manage SSO connection settings
          </DialogDescription>
        </DialogHeader>

        {connection && (
          <div className="space-y-6">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
                <TabsTrigger value="attributes">Attribute Mapping</TabsTrigger>
                <TabsTrigger value="users">Users & Groups</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Connection Name</Label>
                    <Input value={connection.name} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Provider</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{connection.provider.icon}</span>
                      <span>{connection.provider.name}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Domain</Label>
                    <Input value={connection.domain} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusBadgeColor(connection.status)}>
                        {connection.status.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Auto User Provisioning</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically create users when they first sign in
                      </p>
                    </div>
                    <Switch 
                      checked={connection.settings.autoProvisioning}
                      onCheckedChange={(checked) => {
                        // Update connection settings
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Group Mapping</Label>
                      <p className="text-sm text-muted-foreground">
                        Map SSO groups to application roles
                      </p>
                    </div>
                    <Switch 
                      checked={connection.settings.groupMapping}
                      onCheckedChange={(checked) => {
                        // Update connection settings
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Entity ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={connection.entityId} readOnly className="font-mono text-xs" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(connection.entityId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">SSO URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={connection.ssoUrl} readOnly className="font-mono text-xs" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(connection.ssoUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">X.509 Certificate</Label>
                    <div className="mt-1">
                      <Textarea
                        value={connection.certificate}
                        readOnly
                        className="font-mono text-xs h-32"
                        placeholder="Certificate content..."
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            SSO Integration
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage single sign-on connections and user authentication
          </p>
        </div>
        <Button onClick={() => setNewConnectionDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">
                  {ssoConnections.filter(c => c.status.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">SSO Users</p>
                <p className="text-2xl font-bold">
                  {ssoConnections.reduce((sum, c) => sum + c.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">
                  {userSessions.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Session</p>
                <p className="text-2xl font-bold">
                  {Math.round(userSessions.reduce((sum, s) => sum + s.sessionDuration, 0) / userSessions.length)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">SSO Connections</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="providers">Available Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid gap-4">
            {ssoConnections.map((connection) => (
              <Card key={connection.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{connection.provider.icon}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{connection.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {connection.provider.name} • {connection.domain}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={getStatusBadgeColor(connection.status)}>
                            {connection.status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {connection.userCount} users • {connection.groupCount} groups
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Last sync: {connection.lastSync.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(connection.id)}
                        disabled={connection.status.status === 'testing'}
                      >
                        {connection.status.status === 'testing' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncUsers(connection.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConnection(connection)}
                      >
                        <Settings className="h-4 w-4" />
                        Configure
                      </Button>
                      <Switch
                        checked={connection.status.status === 'active'}
                        onCheckedChange={() => toggleConnection(connection.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>
                Monitor and manage current SSO user sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{session.userName}</p>
                          <p className="text-sm text-muted-foreground">{session.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{session.provider}</TableCell>
                      <TableCell>{session.loginTime.toLocaleString()}</TableCell>
                      <TableCell>{session.sessionDuration}m</TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <XCircle className="h-4 w-4" />
                          Terminate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(SSO_PROVIDERS).map((provider) => (
              <Card key={provider.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{provider.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{provider.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {provider.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{provider.type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {provider.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full mt-4" onClick={() => setNewConnectionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Connection Detail Dialog */}
      <ConnectionDetailDialog
        connection={selectedConnection}
        isOpen={!!selectedConnection}
        onClose={() => setSelectedConnection(null)}
      />
    </div>
  );
};

export default SSOIntegration;