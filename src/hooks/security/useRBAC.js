// Role-Based Access Control (RBAC) Hook
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { apiClient } from '../../utils/api';

// Permission definitions
const PERMISSIONS = {
  // User management
  'users.view': 'View users',
  'users.create': 'Create users',
  'users.edit': 'Edit users',
  'users.delete': 'Delete users',
  'users.manage_roles': 'Manage user roles',
  
  // Lead management
  'leads.view': 'View leads',
  'leads.create': 'Create leads',
  'leads.edit': 'Edit leads',
  'leads.delete': 'Delete leads',
  'leads.assign': 'Assign leads',
  'leads.export': 'Export leads',
  'leads.import': 'Import leads',
  
  // Deal management
  'deals.view': 'View deals',
  'deals.create': 'Create deals',
  'deals.edit': 'Edit deals',
  'deals.delete': 'Delete deals',
  'deals.close': 'Close deals',
  'deals.reopen': 'Reopen deals',
  
  // Contact management
  'contacts.view': 'View contacts',
  'contacts.create': 'Create contacts',
  'contacts.edit': 'Edit contacts',
  'contacts.delete': 'Delete contacts',
  'contacts.merge': 'Merge contacts',
  
  // Company management
  'companies.view': 'View companies',
  'companies.create': 'Create companies',
  'companies.edit': 'Edit companies',
  'companies.delete': 'Delete companies',
  
  // Activity management
  'activities.view': 'View activities',
  'activities.create': 'Create activities',
  'activities.edit': 'Edit activities',
  'activities.delete': 'Delete activities',
  
  // Analytics and reporting
  'analytics.view': 'View analytics',
  'analytics.export': 'Export analytics',
  'reports.view': 'View reports',
  'reports.create': 'Create reports',
  'reports.edit': 'Edit reports',
  'reports.delete': 'Delete reports',
  'reports.share': 'Share reports',
  
  // System administration
  'system.settings': 'Manage system settings',
  'system.integrations': 'Manage integrations',
  'system.audit_logs': 'View audit logs',
  'system.backup': 'Manage backups',
  'system.maintenance': 'System maintenance',
  
  // Data management
  'data.export': 'Export data',
  'data.import': 'Import data',
  'data.delete': 'Delete data',
  'data.restore': 'Restore data',
  
  // Security
  'security.view_logs': 'View security logs',
  'security.manage_permissions': 'Manage permissions',
  'security.manage_roles': 'Manage roles',
};

// Predefined roles with permissions
const DEFAULT_ROLES = {
  super_admin: {
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(PERMISSIONS),
    isSystemRole: true,
  },
  admin: {
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.manage_roles',
      'leads.view', 'leads.create', 'leads.edit', 'leads.delete', 'leads.assign', 'leads.export', 'leads.import',
      'deals.view', 'deals.create', 'deals.edit', 'deals.delete', 'deals.close', 'deals.reopen',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.delete', 'contacts.merge',
      'companies.view', 'companies.create', 'companies.edit', 'companies.delete',
      'activities.view', 'activities.create', 'activities.edit', 'activities.delete',
      'analytics.view', 'analytics.export',
      'reports.view', 'reports.create', 'reports.edit', 'reports.delete', 'reports.share',
      'system.settings', 'system.integrations', 'system.audit_logs',
      'data.export', 'data.import',
      'security.view_logs', 'security.manage_permissions', 'security.manage_roles',
    ],
    isSystemRole: true,
  },
  manager: {
    name: 'Sales Manager',
    description: 'Management access with team oversight capabilities',
    permissions: [
      'users.view',
      'leads.view', 'leads.create', 'leads.edit', 'leads.assign', 'leads.export',
      'deals.view', 'deals.create', 'deals.edit', 'deals.close', 'deals.reopen',
      'contacts.view', 'contacts.create', 'contacts.edit', 'contacts.merge',
      'companies.view', 'companies.create', 'companies.edit',
      'activities.view', 'activities.create', 'activities.edit',
      'analytics.view', 'analytics.export',
      'reports.view', 'reports.create', 'reports.edit', 'reports.share',
      'data.export',
    ],
    isSystemRole: true,
  },
  sales_rep: {
    name: 'Sales Representative',
    description: 'Standard sales access with basic CRM functionality',
    permissions: [
      'leads.view', 'leads.create', 'leads.edit',
      'deals.view', 'deals.create', 'deals.edit',
      'contacts.view', 'contacts.create', 'contacts.edit',
      'companies.view', 'companies.create', 'companies.edit',
      'activities.view', 'activities.create', 'activities.edit',
      'analytics.view',
      'reports.view',
    ],
    isSystemRole: true,
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access to CRM data',
    permissions: [
      'leads.view',
      'deals.view',
      'contacts.view',
      'companies.view',
      'activities.view',
      'analytics.view',
      'reports.view',
    ],
    isSystemRole: true,
  },
};

// RBAC Engine
class RBACEngine {
  constructor() {
    this.permissionCache = new Map();
    this.roleCache = new Map();
  }

  // Check if user has specific permission
  hasPermission(userPermissions, permission) {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }

    // Check direct permission
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Check wildcard permissions
    const permissionParts = permission.split('.');
    for (let i = permissionParts.length - 1; i > 0; i--) {
      const wildcardPermission = permissionParts.slice(0, i).join('.') + '.*';
      if (userPermissions.includes(wildcardPermission)) {
        return true;
      }
    }

    return false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userPermissions, permissions) {
    if (!permissions || !Array.isArray(permissions)) {
      return false;
    }

    return permissions.some(permission => this.hasPermission(userPermissions, permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(userPermissions, permissions) {
    if (!permissions || !Array.isArray(permissions)) {
      return true;
    }

    return permissions.every(permission => this.hasPermission(userPermissions, permission));
  }

  // Get effective permissions for user roles
  getEffectivePermissions(roles) {
    if (!roles || !Array.isArray(roles)) {
      return [];
    }

    const permissions = new Set();
    
    roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(permission => permissions.add(permission));
      }
    });

    return Array.from(permissions);
  }

  // Filter resources based on permissions
  filterByPermission(resources, permission, userPermissions) {
    if (!resources || !Array.isArray(resources)) {
      return [];
    }

    if (this.hasPermission(userPermissions, permission)) {
      return resources;
    }

    // If no permission, return empty array or apply row-level security
    return [];
  }

  // Apply row-level security
  applyRowLevelSecurity(resources, user, context = {}) {
    if (!resources || !Array.isArray(resources)) {
      return [];
    }

    return resources.filter(resource => {
      // Owner can always access their own resources
      if (resource.ownerId === user.id || resource.createdBy === user.id) {
        return true;
      }

      // Team members can access team resources
      if (resource.teamId && user.teamIds?.includes(resource.teamId)) {
        return true;
      }

      // Managers can access subordinate resources
      if (user.role === 'manager' && resource.assignedTo && user.subordinates?.includes(resource.assignedTo)) {
        return true;
      }

      // Apply custom context-based rules
      if (context.allowShared && resource.isShared) {
        return true;
      }

      return false;
    });
  }

  // Validate role permissions
  validateRolePermissions(permissions) {
    if (!permissions || !Array.isArray(permissions)) {
      return { isValid: false, errors: ['Permissions must be an array'] };
    }

    const errors = [];
    const validPermissions = Object.keys(PERMISSIONS);

    permissions.forEach(permission => {
      if (!validPermissions.includes(permission) && !permission.endsWith('.*')) {
        errors.push(`Invalid permission: ${permission}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get permission hierarchy
  getPermissionHierarchy() {
    const hierarchy = {};
    
    Object.keys(PERMISSIONS).forEach(permission => {
      const parts = permission.split('.');
      let current = hierarchy;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? { _permission: permission } : {};
        }
        current = current[part];
      });
    });

    return hierarchy;
  }
}

const useRBAC = () => {
  const [rbacEngine] = useState(() => new RBACEngine());
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Fetch user roles and permissions
  const {
    data: userRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery(
    ['user-roles', user?.id],
    () => apiClient.get(`/users/${user.id}/roles`),
    {
      enabled: !!user?.id && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch all available roles (for admin users)
  const {
    data: allRoles = [],
    isLoading: allRolesLoading,
  } = useQuery(
    'all-roles',
    () => apiClient.get('/roles'),
    {
      enabled: !!user?.id && isAuthenticated,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Calculate effective permissions
  const effectivePermissions = useMemo(() => {
    return rbacEngine.getEffectivePermissions(userRoles);
  }, [userRoles, rbacEngine]);

  // Permission checking functions
  const hasPermission = useCallback((permission) => {
    return rbacEngine.hasPermission(effectivePermissions, permission);
  }, [effectivePermissions, rbacEngine]);

  const hasAnyPermission = useCallback((permissions) => {
    return rbacEngine.hasAnyPermission(effectivePermissions, permissions);
  }, [effectivePermissions, rbacEngine]);

  const hasAllPermissions = useCallback((permissions) => {
    return rbacEngine.hasAllPermissions(effectivePermissions, permissions);
  }, [effectivePermissions, rbacEngine]);

  // Resource filtering
  const filterByPermission = useCallback((resources, permission) => {
    return rbacEngine.filterByPermission(resources, permission, effectivePermissions);
  }, [effectivePermissions, rbacEngine]);

  const applyRowLevelSecurity = useCallback((resources, context = {}) => {
    return rbacEngine.applyRowLevelSecurity(resources, user, context);
  }, [user, rbacEngine]);

  // Role management mutations
  const assignRoleMutation = useMutation(
    ({ userId, roleId }) => apiClient.post(`/users/${userId}/roles`, { roleId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-roles']);
        addNotification({
          type: 'success',
          title: 'Role Assigned',
          message: 'Role has been assigned successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Assignment Failed',
          message: error.message || 'Failed to assign role',
        });
      },
    }
  );

  const removeRoleMutation = useMutation(
    ({ userId, roleId }) => apiClient.delete(`/users/${userId}/roles/${roleId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user-roles']);
        addNotification({
          type: 'success',
          title: 'Role Removed',
          message: 'Role has been removed successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Removal Failed',
          message: error.message || 'Failed to remove role',
        });
      },
    }
  );

  const createRoleMutation = useMutation(
    (roleData) => apiClient.post('/roles', roleData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-roles');
        addNotification({
          type: 'success',
          title: 'Role Created',
          message: 'New role has been created successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message: error.message || 'Failed to create role',
        });
      },
    }
  );

  const updateRoleMutation = useMutation(
    ({ roleId, ...updates }) => apiClient.put(`/roles/${roleId}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-roles');
        queryClient.invalidateQueries(['user-roles']);
        addNotification({
          type: 'success',
          title: 'Role Updated',
          message: 'Role has been updated successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update role',
        });
      },
    }
  );

  const deleteRoleMutation = useMutation(
    (roleId) => apiClient.delete(`/roles/${roleId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-roles');
        queryClient.invalidateQueries(['user-roles']);
        addNotification({
          type: 'success',
          title: 'Role Deleted',
          message: 'Role has been deleted successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Deletion Failed',
          message: error.message || 'Failed to delete role',
        });
      },
    }
  );

  // Utility functions
  const assignRole = useCallback((userId, roleId) => {
    return assignRoleMutation.mutateAsync({ userId, roleId });
  }, [assignRoleMutation]);

  const removeRole = useCallback((userId, roleId) => {
    return removeRoleMutation.mutateAsync({ userId, roleId });
  }, [removeRoleMutation]);

  const createRole = useCallback((roleData) => {
    const validation = rbacEngine.validateRolePermissions(roleData.permissions);
    if (!validation.isValid) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: validation.errors.join(', '),
      });
      return Promise.reject(new Error('Invalid permissions'));
    }

    return createRoleMutation.mutateAsync(roleData);
  }, [createRoleMutation, rbacEngine, addNotification]);

  const updateRole = useCallback((roleId, updates) => {
    if (updates.permissions) {
      const validation = rbacEngine.validateRolePermissions(updates.permissions);
      if (!validation.isValid) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: validation.errors.join(', '),
        });
        return Promise.reject(new Error('Invalid permissions'));
      }
    }

    return updateRoleMutation.mutateAsync({ roleId, ...updates });
  }, [updateRoleMutation, rbacEngine, addNotification]);

  const deleteRole = useCallback((roleId) => {
    return deleteRoleMutation.mutateAsync(roleId);
  }, [deleteRoleMutation]);

  // Permission guard component
  const PermissionGuard = useCallback(({ permission, permissions, requireAll = false, fallback = null, children }) => {
    let hasAccess = false;

    if (permission) {
      hasAccess = hasPermission(permission);
    } else if (permissions) {
      hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    }

    return hasAccess ? children : fallback;
  }, [hasPermission, hasAllPermissions, hasAnyPermission]);

  // Get user's role names
  const userRoleNames = useMemo(() => {
    return userRoles.map(role => role.name);
  }, [userRoles]);

  // Check if user has specific role
  const hasRole = useCallback((roleName) => {
    return userRoleNames.includes(roleName);
  }, [userRoleNames]);

  // Get permission hierarchy for UI
  const permissionHierarchy = useMemo(() => {
    return rbacEngine.getPermissionHierarchy();
  }, [rbacEngine]);

  return {
    // State
    userRoles,
    allRoles,
    effectivePermissions,
    userRoleNames,
    isLoading: rolesLoading || allRolesLoading,
    error: rolesError,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,

    // Resource filtering
    filterByPermission,
    applyRowLevelSecurity,

    // Role management
    assignRole,
    removeRole,
    createRole,
    updateRole,
    deleteRole,

    // Mutation states
    isAssigning: assignRoleMutation.isLoading,
    isRemoving: removeRoleMutation.isLoading,
    isCreating: createRoleMutation.isLoading,
    isUpdating: updateRoleMutation.isLoading,
    isDeleting: deleteRoleMutation.isLoading,

    // Utilities
    PermissionGuard,
    permissionHierarchy,
    PERMISSIONS,
    DEFAULT_ROLES,
    rbacEngine,
  };
};

export default useRBAC;