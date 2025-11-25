import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Recursive component to render nested roles
function RoleTreeItem({ role, allRoles, onEdit, onDelete, onToggleSelect, isSelected, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = role.children && role.children.length > 0;

  return (
    <div className="mb-2">
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 ${
          level > 0 ? 'ml-6' : ''
        }`}
      >
        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(role.id)}
            className="p-1"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        )}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{role.name}</h4>
            {role.shareDataWithPeers && (
              <Badge variant="outline" className="text-xs">
                Share Data
              </Badge>
            )}
            {role.parent && (
              <Badge variant="secondary" className="text-xs">
                Child of {role.parent.name}
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {role.createdBy && (
              <span>Created by {role.createdBy.name}</span>
            )}
            {role.createdAt && (
              <span>
                {(() => {
                  try {
                    const date = new Date(role.createdAt);
                    if (isNaN(date.getTime())) return 'Invalid date';
                    return format(date, 'MMM dd, yyyy HH:mm');
                  } catch (e) {
                    return 'Invalid date';
                  }
                })()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(role)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(role)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2">
          {role.children.map((child) => (
            <RoleTreeItem
              key={child.id}
              role={child}
              allRoles={allRoles}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleSelect={onToggleSelect}
              isSelected={onToggleSelect ? isSelected(child.id) : false}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RolesManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    shareDataWithPeers: false,
  });

  const queryClient = useQueryClient();

  // Debug: Log when showDialog changes
  useEffect(() => {
    console.log('showDialog state changed to:', showDialog);
  }, [showDialog]);

  const { data: roles = [], isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        return await base44.entities.Role.list();
      } catch (err) {
        // If unauthorized, return empty array instead of throwing
        if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
          console.warn('Unauthorized to access roles. Returning empty array.');
          return [];
        }
        throw err;
      }
    },
    retry: false,
    onError: (error) => {
      console.error('Error fetching roles:', error);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
      setShowDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create role');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Role.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role updated successfully');
      setShowDialog(false);
      setEditingRole(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Role.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete role');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.bulkUpdate(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Updated ${result.updatedCount} role(s)`);
      if (result.failedItems && result.failedItems.length > 0) {
        toast.warning(`${result.failedItems.length} role(s) failed to update`);
      }
      setShowBulkDialog(false);
      setSelectedRoles([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk update roles');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (data) => base44.entities.Role.bulkDelete(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success(`Deleted ${result.deletedCount} role(s)`);
      if (result.failedIds && result.failedIds.length > 0) {
        result.failedIds.forEach((item) => {
          toast.error(item.error);
        });
      }
      setSelectedRoles([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk delete roles');
    },
  });

  const resetForm = () => {
    const resetData = {
      name: '',
      description: '',
      parentId: '',
      shareDataWithPeers: false,
    };
    console.log('Resetting form with data:', resetData);
    setFormData(resetData);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    const data = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      parentId: formData.parentId && formData.parentId.trim() !== '' ? formData.parentId : null,
      shareDataWithPeers: formData.shareDataWithPeers || false,
    };

    console.log('Creating role with data:', data);
    createMutation.mutate(data);
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    const data = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      parentId: formData.parentId && formData.parentId.trim() !== '' ? formData.parentId : null,
      shareDataWithPeers: formData.shareDataWithPeers || false,
    };

    console.log('Updating role with data:', data);
    updateMutation.mutate({ id: editingRole.id, data });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || '',
      description: role.description || '',
      parentId: role.parentId || '',
      shareDataWithPeers: role.shareDataWithPeers || false,
    });
    setShowDialog(true);
  };

  const handleDelete = (role) => {
    if (
      !confirm(
        `Are you sure you want to delete "${role.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteMutation.mutate(role.id);
  };

  const handleBulkUpdate = () => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    const updateFields = {
      shareDataWithPeers: formData.shareDataWithPeers,
    };

    bulkUpdateMutation.mutate({
      ids: selectedRoles,
      updateFields,
    });
  };

  const handleBulkDelete = () => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRoles.length} role(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    bulkDeleteMutation.mutate({ ids: selectedRoles });
  };

  const toggleRoleSelection = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading roles...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Error loading roles</p>
            <p className="text-sm mt-1">{error.message || 'Failed to fetch roles. Please try again later.'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure roles is always an array
  const safeRoles = Array.isArray(roles) ? roles : [];

  // Flatten roles for parent selection (exclude self and children when editing)
  const getAvailableParents = () => {
    if (!editingRole) {
      return safeRoles;
    }

    // Exclude the role being edited and its children
    const excludeIds = [editingRole.id];
    const getChildIds = (role) => {
      if (role.children) {
        role.children.forEach((child) => {
          excludeIds.push(child.id);
          getChildIds(child);
        });
      }
    };
    getChildIds(editingRole);

    const flattenRoles = (rolesList) => {
      let result = [];
      if (!Array.isArray(rolesList)) return result;
      rolesList.forEach((role) => {
        if (!excludeIds.includes(role.id)) {
          result.push(role);
          if (role.children) {
            result = result.concat(flattenRoles(role.children));
          }
        }
      });
      return result;
    };

    return flattenRoles(safeRoles);
  };

  const toggleAllRoles = () => {
    // Flatten roles tree to get all role IDs
    const getAllRoleIds = (rolesList) => {
      let ids = [];
      if (!Array.isArray(rolesList)) return ids;
      rolesList.forEach((role) => {
        ids.push(role.id);
        if (role.children && role.children.length > 0) {
          ids = ids.concat(getAllRoleIds(role.children));
        }
      });
      return ids;
    };

    const allRoleIds = getAllRoleIds(safeRoles);
    if (selectedRoles.length === allRoleIds.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(allRoleIds);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Roles Management
            </CardTitle>
            <div className="flex gap-2">
              {selectedRoles.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkDialog(true)}
                  >
                    Bulk Update ({selectedRoles.length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Bulk Delete ({selectedRoles.length})
                  </Button>
                </>
              )}
              <Button onClick={() => {
                console.log('Create Role button clicked');
                setEditingRole(null);
                resetForm();
                setShowDialog(true);
                console.log('Dialog should be open, showDialog:', true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">
                No roles yet
              </h3>
              <p className="text-gray-400 mt-1">
                Create your first role to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 border-b">
                <button onClick={toggleAllRoles} className="p-1">
                  {selectedRoles.length ===
                  roles.reduce(
                    (acc, role) => {
                      const getCount = (r) => {
                        let count = 1;
                        if (r.children) {
                          r.children.forEach((child) => {
                            count += getCount(child);
                          });
                        }
                        return count;
                      };
                      return acc + getCount(role);
                    },
                    0
                  ) ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <span className="text-sm text-gray-600">
                  Select All ({selectedRoles.length} selected)
                </span>
              </div>
              {safeRoles.map((role) => (
                <div key={role.id} className="flex-1">
                  <RoleTreeItem
                    role={role}
                    allRoles={roles}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleSelect={toggleRoleSelection}
                    isSelected={(id) => selectedRoles.includes(id)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Role Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        console.log('Dialog onOpenChange called with:', open);
        setShowDialog(open);
        if (!open) {
          setEditingRole(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? 'Update the role information below.' 
                : 'Fill in the details to create a new role. Name is required.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Senior Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the role's responsibilities..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Role</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) => {
                  console.log('Parent role selected:', value);
                  setFormData({ ...formData, parentId: value === "none" ? "" : value });
                }}
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Select parent role (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Top-level role)</SelectItem>
                  {getAvailableParents().map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="shareData">Share Data With Peers</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Allow users with this role to share data with each other
                </p>
              </div>
              <Switch
                id="shareData"
                checked={formData.shareDataWithPeers}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, shareDataWithPeers: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setEditingRole(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingRole ? handleUpdate : handleCreate}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !formData.name.trim()
              }
            >
              {editingRole ? 'Update' : 'Create'} Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Roles</DialogTitle>
            <DialogDescription>
              Update settings for {selectedRoles.length} selected role(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Updating {selectedRoles.length} role(s)
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>Share Data With Peers</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Update this setting for all selected roles
                </p>
              </div>
              <Switch
                checked={formData.shareDataWithPeers}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, shareDataWithPeers: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={bulkUpdateMutation.isPending}
            >
              Update Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

