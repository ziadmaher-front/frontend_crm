import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme.jsx";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Zap,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import RolesManagement from "@/components/RolesManagement";
import ProfilesManagement from "@/components/ProfilesManagement";
import Integrations from "@/pages/Integrations";
import { UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores";

export default function Settings() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuthStore();
  
  // Check if user is admin
  const isAdmin = useMemo(() => {
    if (!user) return false;
    
    // Check permissions
    try {
      if (hasPermission && (hasPermission('manage_users') || hasPermission('manage_settings'))) {
        return true;
      }
    } catch (e) {
      console.warn('Error checking permissions:', e);
    }
    
    // Check profile name
    const profileName = user.profile?.name || user.profileId?.name || user.profile_name || user.profileName;
    if (profileName && (profileName.toLowerCase() === 'administrator' || profileName.toLowerCase().includes('admin'))) {
      return true;
    }
    
    // Check role name
    const roleName = user.role?.name || user.roleId?.name || user.role_name || user.roleName || user.role;
    if (roleName && (roleName.toLowerCase() === 'administrator' || roleName.toLowerCase().includes('admin'))) {
      return true;
    }
    
    return false;
  }, [user, hasPermission]);
  
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    rule_name: "",
    entity_type: "Lead",
    trigger_event: "Created",
    action_type: "Send Email",
    is_active: true,
  });
  const [profileFormData, setProfileFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    mobile: "",
    job_title: "",
    department: "",
    bio: "",
    company: "",
    workId: "",
    workLocation: "",
    profileId: "",
    roleId: "",
  });

  const { theme, toggleTheme, isDark } = useTheme();
  const queryClient = useQueryClient();

  // Fetch current user data from backend
  const { data: currentUser, isLoading: isLoadingUser, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const userData = await base44.auth.me();
        console.log('Fetched user data from backend:', userData);
        return userData;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      setProfileFormData({
        full_name: currentUser.full_name || currentUser.name || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || "",
        email: currentUser.email || "",
        phone: currentUser.phone || currentUser.phone_number || "",
        mobile: currentUser.mobile || currentUser.mobile_phone || "",
        job_title: currentUser.job_title || currentUser.jobTitle || currentUser.position || "",
        department: currentUser.department || "",
        bio: currentUser.bio || currentUser.biography || "",
        company: currentUser.company || currentUser.companyName || currentUser.company_name || "",
        workId: currentUser.workId || currentUser.work_id || "",
        workLocation: currentUser.workLocation || currentUser.work_location || "",
        profileId: currentUser.profileId || currentUser.profile_id || currentUser.profile?.id || "",
        roleId: currentUser.roleId || currentUser.role_id || currentUser.role?.id || "",
      });
    }
  }, [currentUser]);

  const { data: automationRules = [] } = useQuery({
    queryKey: ['automationRules'],
    queryFn: () => base44.entities.AutomationRule.list(),
  });

  const createRuleMutation = useMutation({
    mutationFn: (data) => base44.entities.AutomationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      toast.success("Automation rule created");
      setShowWorkflowDialog(false);
      resetWorkflowForm();
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AutomationRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      toast.success("Automation rule updated");
      setShowWorkflowDialog(false);
      setEditingWorkflow(null);
      resetWorkflowForm();
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.AutomationRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] });
      toast.success("Automation rule deleted");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleProfileSubmit = () => {
    updateUserMutation.mutate(profileFormData);
  };

  const resetWorkflowForm = () => {
    setWorkflowData({
      rule_name: "",
      entity_type: "Lead",
      trigger_event: "Created",
      action_type: "Send Email",
      is_active: true,
    });
  };

  const handleCreateWorkflow = () => {
    if (!workflowData.rule_name) {
      toast.error("Please enter a rule name");
      return;
    }

    if (editingWorkflow) {
      updateRuleMutation.mutate({
        id: editingWorkflow.id,
        data: workflowData
      });
    } else {
      createRuleMutation.mutate(workflowData);
    }
  };

  const handleEditWorkflow = (rule) => {
    setEditingWorkflow(rule);
    setWorkflowData({
      rule_name: rule.rule_name,
      entity_type: rule.entity_type,
      trigger_event: rule.trigger_event,
      action_type: rule.action_type,
      is_active: rule.is_active,
      description: rule.description || "",
    });
    setShowWorkflowDialog(true);
  };

  const handleToggleWorkflow = (rule) => {
    updateRuleMutation.mutate({
      id: rule.id,
      data: { is_active: !rule.is_active }
    });
  };

  const handleDeleteWorkflow = (id) => {
    if (confirm("Are you sure you want to delete this automation rule?")) {
      deleteRuleMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account, preferences, and automations</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate('/auth/register')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full flex flex-wrap gap-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingUser ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : userError ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error loading profile information. Please try again.</p>
                </div>
              ) : (
                <>
                  {/* Display Current User Data (Read-only) */}
                  {currentUser && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Profile Data</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">User ID:</span>
                          <span className="ml-2 text-gray-900">{currentUser.id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="ml-2 text-gray-900">{currentUser.email || "N/A"}</span>
                        </div>
                        {currentUser.firstName && (
                          <div>
                            <span className="font-medium text-gray-600">First Name:</span>
                            <span className="ml-2 text-gray-900">{currentUser.firstName}</span>
                          </div>
                        )}
                        {currentUser.lastName && (
                          <div>
                            <span className="font-medium text-gray-600">Last Name:</span>
                            <span className="ml-2 text-gray-900">{currentUser.lastName}</span>
                          </div>
                        )}
                        {currentUser.full_name && (
                          <div>
                            <span className="font-medium text-gray-600">Full Name:</span>
                            <span className="ml-2 text-gray-900">{currentUser.full_name}</span>
                          </div>
                        )}
                        {currentUser.phone && (
                          <div>
                            <span className="font-medium text-gray-600">Phone:</span>
                            <span className="ml-2 text-gray-900">{currentUser.phone}</span>
                          </div>
                        )}
                        {currentUser.mobile && (
                          <div>
                            <span className="font-medium text-gray-600">Mobile:</span>
                            <span className="ml-2 text-gray-900">{currentUser.mobile}</span>
                          </div>
                        )}
                        {currentUser.job_title && (
                          <div>
                            <span className="font-medium text-gray-600">Job Title:</span>
                            <span className="ml-2 text-gray-900">{currentUser.job_title}</span>
                          </div>
                        )}
                        {currentUser.department && (
                          <div>
                            <span className="font-medium text-gray-600">Department:</span>
                            <span className="ml-2 text-gray-900">{currentUser.department}</span>
                          </div>
                        )}
                        {currentUser.company && (
                          <div>
                            <span className="font-medium text-gray-600">Company:</span>
                            <span className="ml-2 text-gray-900">{currentUser.company}</span>
                          </div>
                        )}
                        {currentUser.workId && (
                          <div>
                            <span className="font-medium text-gray-600">Work ID:</span>
                            <span className="ml-2 text-gray-900">{currentUser.workId}</span>
                          </div>
                        )}
                        {currentUser.workLocation && (
                          <div>
                            <span className="font-medium text-gray-600">Work Location:</span>
                            <span className="ml-2 text-gray-900">{currentUser.workLocation}</span>
                          </div>
                        )}
                        {currentUser.profile?.name && (
                          <div>
                            <span className="font-medium text-gray-600">Profile:</span>
                            <span className="ml-2 text-gray-900">{currentUser.profile.name}</span>
                          </div>
                        )}
                        {currentUser.role?.name && (
                          <div>
                            <span className="font-medium text-gray-600">Role:</span>
                            <span className="ml-2 text-gray-900">{currentUser.role.name}</span>
                          </div>
                        )}
                        {currentUser.createdAt && (
                          <div>
                            <span className="font-medium text-gray-600">Created:</span>
                            <span className="ml-2 text-gray-900">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {currentUser.updatedAt && (
                          <div>
                            <span className="font-medium text-gray-600">Last Updated:</span>
                            <span className="ml-2 text-gray-900">{new Date(currentUser.updatedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold mb-4">Edit Profile Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileFormData.full_name}
                        onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileFormData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={profileFormData.mobile}
                        onChange={(e) => setProfileFormData({ ...profileFormData, mobile: e.target.value })}
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={profileFormData.job_title}
                        onChange={(e) => setProfileFormData({ ...profileFormData, job_title: e.target.value })}
                        placeholder="Enter job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileFormData.department}
                        onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })}
                        placeholder="Enter department"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={profileFormData.company}
                        onChange={(e) => setProfileFormData({ ...profileFormData, company: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workId">Work ID</Label>
                      <Input
                        id="workId"
                        value={profileFormData.workId}
                        onChange={(e) => setProfileFormData({ ...profileFormData, workId: e.target.value })}
                        placeholder="Enter work ID"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workLocation">Work Location</Label>
                    <Input
                      id="workLocation"
                      value={profileFormData.workLocation}
                      onChange={(e) => setProfileFormData({ ...profileFormData, workLocation: e.target.value })}
                      placeholder="Enter work location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileFormData.bio}
                      onChange={(e) => setProfileFormData({ ...profileFormData, bio: e.target.value })}
                      rows={3}
                      placeholder="Enter your bio"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      onClick={handleProfileSubmit}
                      disabled={updateUserMutation.isPending}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    {currentUser?.profileId && (
                      <Badge variant="outline" className="ml-2">
                        Profile ID: {currentUser.profileId || currentUser.profile_id || currentUser.profile?.id || "N/A"}
                      </Badge>
                    )}
                    {currentUser?.roleId && (
                      <Badge variant="outline" className="ml-2">
                        Role ID: {currentUser.roleId || currentUser.role_id || currentUser.role?.id || "N/A"}
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-gray-500">Switch to dark theme</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact View</Label>
                  <p className="text-xs text-gray-500">Show more items per page</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select defaultValue={currentUser?.default_currency || "USD"}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EGP">EGP (E£)</SelectItem>
                    <SelectItem value="AED">AED (د.إ)</SelectItem>
                    <SelectItem value="SAR">SAR (﷼)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue={currentUser?.timezone || "UTC"}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                    <SelectItem value="Africa/Cairo">Cairo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <ProfilesManagement />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <RolesManagement />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <Integrations />
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  Automation Rules
                </CardTitle>
                <Button
                  onClick={() => {
                    setEditingWorkflow(null);
                    resetWorkflowForm();
                    setShowWorkflowDialog(true);
                  }}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {automationRules.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No automation rules yet</h3>
                  <p className="text-gray-400 mt-1">Create rules to automate your workflow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${rule.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Zap className={`w-5 h-5 ${rule.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{rule.rule_name}</h4>
                            {rule.is_active ? (
                              <Badge className="bg-green-100 text-green-700">Active</Badge>
                            ) : (
                              <Badge variant="outline">Paused</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            When <span className="font-medium">{rule.entity_type}</span> is <span className="font-medium">{rule.trigger_event}</span> → <span className="font-medium">{rule.action_type}</span>
                          </p>
                          {rule.execution_count > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Executed {rule.execution_count} times
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleWorkflow(rule)}
                        >
                          {rule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditWorkflow(rule)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(rule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Available Automation Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Triggers:</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Record Created</li>
                    <li>• Record Updated</li>
                    <li>• Status Changed</li>
                    <li>• Field Changed</li>
                    <li>• Date Reached</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Actions:</h4>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Send Email</li>
                    <li>• Create Task</li>
                    <li>• Update Field</li>
                    <li>• Send Notification</li>
                    <li>• Assign User</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">Receive email updates for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Deal Alerts</Label>
                  <p className="text-xs text-gray-500">Notify me when deals change stage</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Task Reminders</Label>
                  <p className="text-xs text-gray-500">Get reminders for upcoming tasks</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Lead Assignments</Label>
                  <p className="text-xs text-gray-500">Notify me when leads are assigned to me</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Summary</Label>
                  <p className="text-xs text-gray-500">Receive weekly performance summary</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Workflow Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingWorkflow ? 'Edit' : 'Create'} Automation Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name *</Label>
              <Input
                value={workflowData.rule_name}
                onChange={(e) => setWorkflowData({...workflowData, rule_name: e.target.value})}
                placeholder="e.g., Auto-create follow-up task for new leads"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={workflowData.entity_type} onValueChange={(value) => setWorkflowData({...workflowData, entity_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Contact">Contact</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="Deal">Deal</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Quote">Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trigger Event</Label>
                <Select value={workflowData.trigger_event} onValueChange={(value) => setWorkflowData({...workflowData, trigger_event: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Updated">Updated</SelectItem>
                    <SelectItem value="Status Changed">Status Changed</SelectItem>
                    <SelectItem value="Field Changed">Field Changed</SelectItem>
                    <SelectItem value="Date Reached">Date Reached</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={workflowData.action_type} onValueChange={(value) => setWorkflowData({...workflowData, action_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Send Email">Send Email</SelectItem>
                  <SelectItem value="Create Task">Create Task</SelectItem>
                  <SelectItem value="Update Field">Update Field</SelectItem>
                  <SelectItem value="Send Notification">Send Notification</SelectItem>
                  <SelectItem value="Assign User">Assign User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                value={workflowData.description || ""}
                onChange={(e) => setWorkflowData({...workflowData, description: e.target.value})}
                rows={3}
                placeholder="Describe what this automation does..."
              />
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <Label>Activate immediately</Label>
                <p className="text-xs text-gray-500">Rule will start working right away</p>
              </div>
              <Switch
                checked={workflowData.is_active}
                onCheckedChange={(checked) => setWorkflowData({...workflowData, is_active: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              {editingWorkflow ? 'Update' : 'Create'} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}