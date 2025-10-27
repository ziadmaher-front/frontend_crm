import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [workflowData, setWorkflowData] = useState({
    rule_name: "",
    entity_type: "Lead",
    trigger_event: "Created",
    action_type: "Send Email",
    is_active: true,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

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
      toast.success("Settings updated successfully");
      base44.auth.me().then(setCurrentUser);
    },
  });

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-indigo-500" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your account, preferences, and automations</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={currentUser?.full_name} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={currentUser?.email} disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue={currentUser?.phone} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input defaultValue={currentUser?.mobile} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input defaultValue={currentUser?.job_title} />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input defaultValue={currentUser?.department} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea defaultValue={currentUser?.bio} rows={3} />
              </div>
              <Button onClick={() => updateUserMutation.mutate({
                full_name: currentUser?.full_name,
                phone: currentUser?.phone,
                mobile: currentUser?.mobile,
                job_title: currentUser?.job_title,
                department: currentUser?.department,
                bio: currentUser?.bio,
              })}>
                Save Changes
              </Button>
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
                <Switch />
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