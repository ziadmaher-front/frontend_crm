import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Shield,
  AlertTriangle,
  CheckSquare,
  Square,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Available modules for permissions
const MODULES = ['accounts', 'contacts', 'leads', 'deals', 'tasks', 'quotes', 'campaigns', 'reports'];

// Permission actions
const PERMISSIONS = ['create', 'read', 'update', 'delete'];

export default function ProfilesManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {},
  });

  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      try {
        return await base44.entities.Profile.list();
      } catch (err) {
        if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
          console.warn('Unauthorized to access profiles. Returning empty array.');
          return [];
        }
        throw err;
      }
    },
    retry: false,
    onError: (error) => {
      console.error('Error fetching profiles:', error);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Profile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile created successfully');
      setShowDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create profile');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile updated successfully');
      setShowDialog(false);
      setEditingProfile(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Profile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success('Profile deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete profile');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data) => base44.entities.Profile.bulkUpdate(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success(`Updated ${result.updatedCount} profile(s)`);
      if (result.failedItems && result.failedItems.length > 0) {
        toast.warning(`${result.failedItems.length} profile(s) failed to update`);
      }
      setShowBulkDialog(false);
      setSelectedProfiles([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk update profiles');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (data) => base44.entities.Profile.bulkDelete(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast.success(`Deleted ${result.deletedCount} profile(s)`);
      if (result.failedIds && result.failedIds.length > 0) {
        result.failedIds.forEach((item) => {
          toast.error(item.error);
        });
      }
      setSelectedProfiles([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to bulk delete profiles');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: {},
    });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Profile name is required');
      return;
    }

    // Ensure permissions object is properly structured
    // Clean up permissions - remove modules with all false values
    const cleanedPermissions = {};
    if (formData.permissions) {
      Object.keys(formData.permissions).forEach((module) => {
        const modulePerms = formData.permissions[module];
        if (modulePerms && typeof modulePerms === 'object') {
          // Check if at least one action is true
          const hasAnyPermission = Object.values(modulePerms).some(val => val === true);
          if (hasAnyPermission) {
            cleanedPermissions[module] = { ...modulePerms };
          }
        }
      });
    }
    
    // Validate that permissions has at least one module with at least one permission
    if (Object.keys(cleanedPermissions).length === 0) {
      toast.error('At least one permission must be set');
      return;
    }

    const data = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      permissions: cleanedPermissions,
    };

    createMutation.mutate(data);
  };

  const handleUpdate = () => {
    if (!formData.name.trim()) {
      toast.error('Profile name is required');
      return;
    }

    // Ensure permissions object is properly structured
    // Clean up permissions - remove modules with all false values
    const cleanedPermissions = {};
    if (formData.permissions) {
      Object.keys(formData.permissions).forEach((module) => {
        const modulePerms = formData.permissions[module];
        if (modulePerms && typeof modulePerms === 'object') {
          // Check if at least one action is true
          const hasAnyPermission = Object.values(modulePerms).some(val => val === true);
          if (hasAnyPermission) {
            cleanedPermissions[module] = { ...modulePerms };
          }
        }
      });
    }

    const data = {
      name: formData.name.trim(),
      ...(formData.description && { description: formData.description.trim() }),
      permissions: cleanedPermissions,
    };

    updateMutation.mutate({ id: editingProfile.id, data });
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    // Deep clone permissions to avoid mutating the original object
    const permissions = profile.permissions ? JSON.parse(JSON.stringify(profile.permissions)) : {};
    setFormData({
      name: profile.name || '',
      description: profile.description || '',
      permissions: permissions,
    });
    setShowDialog(true);
  };

  const handleDelete = (profile) => {
    if (profile.name === 'Administrator') {
      toast.error('Cannot delete the Administrator profile');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${profile.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    deleteMutation.mutate(profile.id);
  };

  const handleBulkUpdate = () => {
    if (selectedProfiles.length === 0) {
      toast.error('Please select at least one profile');
      return;
    }

    // Build updateFields object - only include fields that have values
    const updateFields = {};
    if (formData.description !== undefined && formData.description !== '') {
      updateFields.description = formData.description.trim();
    }
    if (formData.name !== undefined && formData.name !== '') {
      updateFields.name = formData.name.trim();
    }
    if (formData.permissions && Object.keys(formData.permissions).length > 0) {
      updateFields.permissions = formData.permissions;
    }

    if (Object.keys(updateFields).length === 0) {
      toast.error('Please provide at least one field to update');
      return;
    }

    bulkUpdateMutation.mutate({
      ids: selectedProfiles,
      updateFields,
    });
  };

  const handleBulkDelete = () => {
    if (selectedProfiles.length === 0) {
      toast.error('Please select at least one profile');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProfiles.length} profile(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    bulkDeleteMutation.mutate({ ids: selectedProfiles });
  };

  const toggleProfileSelection = (profileId) => {
    setSelectedProfiles((prev) =>
      prev.includes(profileId)
        ? prev.filter((id) => id !== profileId)
        : [...prev, profileId]
    );
  };

  const toggleAllProfiles = () => {
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles.map((p) => p.id));
    }
  };

  const updatePermission = (module, action, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value,
        },
      },
    }));
  };

  const getPermissionValue = (module, action) => {
    return formData.permissions[module]?.[action] || false;
  };

  const isAdministrator = (profile) => {
    return profile.name === 'Administrator';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading profiles...</div>
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
            <p className="font-semibold">Error loading profiles</p>
            <p className="text-sm mt-1">{error.message || 'Failed to fetch profiles. Please try again later.'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeProfiles = Array.isArray(profiles) ? profiles : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Profiles Management
            </CardTitle>
            <div className="flex gap-2">
              {selectedProfiles.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkDialog(true)}
                  >
                    Bulk Update ({selectedProfiles.length})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    Bulk Delete ({selectedProfiles.length})
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  setEditingProfile(null);
                  resetForm();
                  setShowDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {safeProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600">No profiles yet</h3>
              <p className="text-gray-400 mt-1">Create profiles to manage user permissions</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 border-b">
                <button onClick={toggleAllProfiles} className="p-1">
                  {selectedProfiles.length === safeProfiles.length ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 grid grid-cols-4 gap-4 font-semibold text-sm">
                  <div>Name</div>
                  <div>Description</div>
                  <div>Permissions</div>
                  <div>Actions</div>
                </div>
              </div>
              {safeProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50"
                >
                  <button
                    onClick={() => toggleProfileSelection(profile.id)}
                    className="p-1"
                  >
                    {selectedProfiles.includes(profile.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      {isAdministrator(profile) && (
                        <Lock className="w-4 h-4 text-yellow-600" />
                      )}
                      <h4 className="font-semibold">{profile.name}</h4>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {profile.description || 'No description'}
                      </p>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {MODULES.slice(0, 3).map((module) => {
                          const hasPermission = profile.permissions?.[module];
                          if (!hasPermission) return null;
                          const count = Object.values(hasPermission).filter(Boolean).length;
                          return (
                            <Badge key={module} variant="outline" className="text-xs">
                              {module}: {count}
                            </Badge>
                          );
                        })}
                        {Object.keys(profile.permissions || {}).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(profile.permissions || {}).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(profile)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(profile)}
                        disabled={isAdministrator(profile)}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Profile Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? 'Edit Profile' : 'Create Profile'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Profile Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Sales Representative"
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
                placeholder="Describe the profile's purpose..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4 space-y-4">
                {MODULES.map((module) => (
                  <div key={module} className="space-y-2">
                    <Label className="font-semibold capitalize">{module}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {PERMISSIONS.map((action) => (
                        <div key={action} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`${module}-${action}`}
                            checked={getPermissionValue(module, action)}
                            onChange={(e) =>
                              updatePermission(module, action, e.target.checked)
                            }
                            className="w-4 h-4"
                          />
                          <Label
                            htmlFor={`${module}-${action}`}
                            className="text-sm capitalize cursor-pointer"
                          >
                            {action}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={editingProfile ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingProfile ? 'Update' : 'Create'} Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Update Profiles</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name (Optional)</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Update name for all selected profiles..."
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Update description for all selected profiles..."
                rows={3}
              />
            </div>
            <div className="text-sm text-gray-500">
              Note: Only filled fields will be updated. Permissions can be updated individually by editing each profile.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowBulkDialog(false);
              setFormData(prev => ({ ...prev, name: '', description: '' }));
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={bulkUpdateMutation.isPending}
            >
              Update {selectedProfiles.length} Profile(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

