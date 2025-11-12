import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  UserX,
  Crown,
  AlertTriangle
} from 'lucide-react';

const ROLES = {
  admin: {
    name: 'Administrator',
    description: 'Full system access and user management',
    color: 'bg-red-500',
    icon: Crown
  },
  manager: {
    name: 'Manager',
    description: 'Team management and advanced features',
    color: 'bg-blue-500',
    icon: UserCheck
  },
  sales: {
    name: 'Sales Representative',
    description: 'Sales activities and customer management',
    color: 'bg-green-500',
    icon: Users
  },
  support: {
    name: 'Support Agent',
    description: 'Customer support and ticket management',
    color: 'bg-purple-500',
    icon: Shield
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to assigned data',
    color: 'bg-gray-500',
    icon: Eye
  }
};

const PERMISSIONS = {
  leads: {
    name: 'Leads',
    actions: ['view', 'create', 'edit', 'delete', 'assign']
  },
  contacts: {
    name: 'Contacts',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  },
  accounts: {
    name: 'Accounts',
    actions: ['view', 'create', 'edit', 'delete', 'manage']
  },
  deals: {
    name: 'Deals',
    actions: ['view', 'create', 'edit', 'delete', 'approve']
  },
  tasks: {
    name: 'Tasks',
    actions: ['view', 'create', 'edit', 'delete', 'assign']
  },
  reports: {
    name: 'Reports',
    actions: ['view', 'create', 'edit', 'delete', 'export']
  },
  settings: {
    name: 'Settings',
    actions: ['view', 'edit', 'manage_users', 'system_config']
  },
  integrations: {
    name: 'Integrations',
    actions: ['view', 'create', 'edit', 'delete', 'configure']
  }
};

const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    leads: ['view', 'create', 'edit', 'delete', 'assign'],
    contacts: ['view', 'create', 'edit', 'delete', 'export'],
    accounts: ['view', 'create', 'edit', 'delete', 'manage'],
    deals: ['view', 'create', 'edit', 'delete', 'approve'],
    tasks: ['view', 'create', 'edit', 'delete', 'assign'],
    reports: ['view', 'create', 'edit', 'delete', 'export'],
    settings: ['view', 'edit', 'manage_users', 'system_config'],
    integrations: ['view', 'create', 'edit', 'delete', 'configure']
  },
  manager: {
    leads: ['view', 'create', 'edit', 'assign'],
    contacts: ['view', 'create', 'edit', 'export'],
    accounts: ['view', 'create', 'edit', 'manage'],
    deals: ['view', 'create', 'edit', 'approve'],
    tasks: ['view', 'create', 'edit', 'assign'],
    reports: ['view', 'create', 'export'],
    settings: ['view'],
    integrations: ['view', 'configure']
  },
  sales: {
    leads: ['view', 'create', 'edit'],
    contacts: ['view', 'create', 'edit'],
    accounts: ['view', 'create', 'edit'],
    deals: ['view', 'create', 'edit'],
    tasks: ['view', 'create', 'edit'],
    reports: ['view'],
    settings: [],
    integrations: ['view']
  },
  support: {
    leads: ['view'],
    contacts: ['view', 'edit'],
    accounts: ['view'],
    deals: ['view'],
    tasks: ['view', 'create', 'edit'],
    reports: ['view'],
    settings: [],
    integrations: ['view']
  },
  viewer: {
    leads: ['view'],
    contacts: ['view'],
    accounts: ['view'],
    deals: ['view'],
    tasks: ['view'],
    reports: ['view'],
    settings: [],
    integrations: []
  }
};

const RoleCard = ({ role, roleData, userCount, onEdit, onDelete }) => {
  const IconComponent = roleData.icon;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${roleData.color} text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{roleData.name}</CardTitle>
              <CardDescription>{roleData.description}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{userCount} users</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Role: <span className="font-medium">{role}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(role)}>
              <Edit className="h-4 w-4" />
            </Button>
            {role !== 'admin' && (
              <Button variant="outline" size="sm" onClick={() => onDelete(role)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PermissionMatrix = ({ permissions, onChange, readOnly = false }) => {
  const handlePermissionChange = (module, action, checked) => {
    if (readOnly) return;
    
    const newPermissions = { ...permissions };
    if (!newPermissions[module]) {
      newPermissions[module] = [];
    }
    
    if (checked) {
      newPermissions[module] = [...newPermissions[module], action];
    } else {
      newPermissions[module] = newPermissions[module].filter(a => a !== action);
    }
    
    onChange(newPermissions);
  };

  return (
    <div className="space-y-4">
      {Object.entries(PERMISSIONS).map(([module, moduleData]) => (
        <Card key={module}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{moduleData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {moduleData.actions.map((action) => (
                <div key={action} className="flex items-center space-x-2">
                  <Switch
                    id={`${module}-${action}`}
                    checked={permissions[module]?.includes(action) || false}
                    onCheckedChange={(checked) => handlePermissionChange(module, action, checked)}
                    disabled={readOnly}
                  />
                  <Label 
                    htmlFor={`${module}-${action}`} 
                    className="text-sm capitalize cursor-pointer"
                  >
                    {action.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const UserRoleAssignment = ({ users, onRoleChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={ROLES[user.role]?.color || 'bg-gray-500'}
                    >
                      {ROLES[user.role]?.name || user.role}
                    </Badge>
                    <Select
                      value={user.role}
                      onValueChange={(newRole) => onRoleChange(user.id, newRole)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLES).map(([roleKey, roleData]) => (
                          <SelectItem key={roleKey} value={roleKey}>
                            {roleData.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const RoleBasedAccess = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'manager' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'sales' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'support' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'viewer' }
  ]);

  const getUserCountByRole = (role) => {
    return users.filter(user => user.role === role).length;
  };

  const handleRoleEdit = (role) => {
    setSelectedRole(role);
    setActiveTab('permissions');
  };

  const handleRoleDelete = (role) => {
    // In a real app, you'd show a confirmation dialog
    console.log('Delete role:', role);
  };

  const handlePermissionChange = (permissions) => {
    if (selectedRole) {
      setRolePermissions(prev => ({
        ...prev,
        [selectedRole]: permissions
      }));
    }
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role-Based Access Control</h2>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLES).map(([role, roleData]) => (
              <RoleCard
                key={role}
                role={role}
                roleData={roleData}
                userCount={getUserCountByRole(role)}
                onEdit={handleRoleEdit}
                onDelete={handleRoleDelete}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Permission Matrix</h3>
              <p className="text-gray-600">
                {selectedRole ? `Editing permissions for ${ROLES[selectedRole]?.name}` : 'Select a role to edit permissions'}
              </p>
            </div>
            {selectedRole && (
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([roleKey, roleData]) => (
                    <SelectItem key={roleKey} value={roleKey}>
                      {roleData.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedRole ? (
            <PermissionMatrix
              permissions={rolePermissions[selectedRole] || {}}
              onChange={handlePermissionChange}
            />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please select a role from the dropdown above to view and edit its permissions.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">User Role Assignment</h3>
            <p className="text-gray-600">Assign roles to users and manage access levels</p>
          </div>

          <UserRoleAssignment
            users={users}
            onRoleChange={handleUserRoleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoleBasedAccess;