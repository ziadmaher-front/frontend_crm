import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckSquare, 
  Activity as ActivityIcon, 
  Calendar,
  MapPin,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import SendEmailDialog from "./SendEmailDialog";
import { getQuickActionsPrefs, saveQuickActionsPrefs } from "@/store/userPreferences";

export default function QuickActions({ relatedTo }) {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Calls');
  const [prefs, setPrefs] = useState(getQuickActionsPrefs());

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
    due_time: "09:00",
    priority: "Medium",
    status: "Not Started",
    related_to_type: relatedTo.type,
    related_to_id: relatedTo.id,
    assigned_to: "",
  });

  const [activityForm, setActivityForm] = useState({
    activity_type: "Call",
    subject: "",
    description: "",
    activity_date: new Date().toISOString().slice(0, 16),
    start_time: "",
    end_time: "",
    outcome: "Successful",
    status: "Scheduled",
    related_to_type: relatedTo.type,
    related_to_id: relatedTo.id,
    assigned_to: "",
    start_location: null,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      setTaskForm(prev => ({ ...prev, assigned_to: user.email }));
      setActivityForm(prev => ({ ...prev, assigned_to: user.email }));
    });
  }, []);

  useEffect(() => {
    // persist preferences when changed
    saveQuickActionsPrefs(prefs);
  }, [prefs]);

  // Listen for Command Palette follow-up macro trigger
  useEffect(() => {
    const handler = () => {
      runFollowUpMacro();
    };
    window.addEventListener('crm:run-followup', handler);
    return () => window.removeEventListener('crm:run-followup', handler);
  }, [currentUser, relatedTo]);

  // Listen for Command Palette open actions
  useEffect(() => {
    const openEmail = () => {
      setActiveCategory('Email');
      setShowEmailDialog(true);
    };
    const openCall = () => {
      setActiveCategory('Calls');
      setActivityForm(prev => ({ ...prev, activity_type: 'Call' }));
      setShowActivityDialog(true);
    };
    const openMeeting = () => {
      setActiveCategory('Schedule');
      setActivityForm(prev => ({ ...prev, activity_type: 'Meeting', status: 'Scheduled' }));
      setShowActivityDialog(true);
    };

    window.addEventListener('crm:open-quick-actions-email', openEmail);
    window.addEventListener('crm:open-quick-actions-call', openCall);
    window.addEventListener('crm:open-quick-actions-meeting', openMeeting);
    return () => {
      window.removeEventListener('crm:open-quick-actions-email', openEmail);
      window.removeEventListener('crm:open-quick-actions-call', openCall);
      window.removeEventListener('crm:open-quick-actions-meeting', openMeeting);
    };
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              address: data.display_name || `${latitude}, ${longitude}`,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const createTaskMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success("Task created successfully");
      setShowTaskDialog(false);
      resetTaskForm();
    },
    onError: () => {
      toast.error("Failed to create task");
    }
  });

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success("Activity logged successfully");
      setShowActivityDialog(false);
      resetActivityForm();
    },
    onError: () => {
      toast.error("Failed to log activity");
    }
  });

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      due_date: "",
      due_time: "09:00",
      priority: "Medium",
      status: "Not Started",
      related_to_type: relatedTo.type,
      related_to_id: relatedTo.id,
      assigned_to: currentUser?.email || "",
    });
  };

  const resetActivityForm = () => {
    setActivityForm({
      activity_type: "Call",
      subject: "",
      description: "",
      activity_date: new Date().toISOString().slice(0, 16),
      start_time: "",
      end_time: "",
      outcome: "Successful",
      status: "Scheduled",
      related_to_type: relatedTo.type,
      related_to_id: relatedTo.id,
      assigned_to: currentUser?.email || "",
      start_location: null,
    });
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    createTaskMutation.mutate(taskForm);
  };

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    createActivityMutation.mutate(activityForm);
  };

  const handleGetLocation = async () => {
    toast.loading("Getting location...");
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setActivityForm(prev => ({
        ...prev,
        start_location: location
      }));
      toast.success("Location captured");
    } catch (error) {
      toast.error("Failed to get location: " + error.message);
    }
  };

  // Macro: Follow-up — logs a call and schedules a task, then opens email dialog
  const runFollowUpMacro = async () => {
    try {
      toast.loading("Running follow-up...");
      const nowIso = new Date().toISOString();
      await createActivityMutation.mutateAsync({
        activity_type: "Call",
        subject: "Follow-up call",
        description: "Quick follow-up call logged via macro",
        activity_date: nowIso,
        outcome: "Successful",
        status: "Completed",
        related_to_type: relatedTo.type,
        related_to_id: relatedTo.id,
        assigned_to: currentUser?.email || "",
      });

      await createTaskMutation.mutateAsync({
        title: "Send follow-up email",
        description: "Auto-created from follow-up macro",
        due_date: nowIso.slice(0, 10),
        due_time: "09:00",
        priority: "Medium",
        status: "Not Started",
        related_to_type: relatedTo.type,
        related_to_id: relatedTo.id,
        assigned_to: currentUser?.email || "",
      });

      toast.success("Follow-up created: activity + task");
      setShowEmailDialog(true);
    } catch (e) {
      toast.error("Follow-up failed: " + e.message);
    }
  };

  return (
    <>
      {/* Tabbed quick actions */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="mb-2">
          {prefs.categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>

        {/* Calls */}
        <TabsContent value="Calls">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setActivityForm({
              ...activityForm,
              activity_type: 'Call',
              subject: activityForm.subject || 'Follow-up call',
            }); setShowActivityDialog(true); }} className="gap-2">
              <ActivityIcon className="w-4 h-4" />
              Log Call
            </Button>
            <Button variant="outline" size="sm" onClick={runFollowUpMacro} className="gap-2">
              <Clock className="w-4 h-4" />
              Follow-up
            </Button>
          </div>
        </TabsContent>

        {/* Email */}
        <TabsContent value="Email">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEmailDialog(true)} className="gap-2">
              <Calendar className="w-4 h-4" />
              Send Email
            </Button>
            <Button variant="outline" size="sm" onClick={runFollowUpMacro} className="gap-2">
              <Clock className="w-4 h-4" />
              Follow-up
            </Button>
          </div>
        </TabsContent>

        {/* Messaging */}
        <TabsContent value="Messaging">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowActivityDialog(true)} className="gap-2">
              <ActivityIcon className="w-4 h-4" />
              Log Message
            </Button>
            <Button variant="outline" size="sm" onClick={runFollowUpMacro} className="gap-2">
              <Clock className="w-4 h-4" />
              Follow-up
            </Button>
          </div>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="Schedule">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTaskDialog(true)} className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Schedule Task
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setActivityForm({
              ...activityForm,
              activity_type: 'Meeting',
              subject: activityForm.subject || 'Customer meeting',
              status: 'Scheduled',
            }); setShowActivityDialog(true); }} className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule Meeting
            </Button>
            <Button variant="outline" size="sm" onClick={runFollowUpMacro} className="gap-2">
              <Clock className="w-4 h-4" />
              Follow-up
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task_title">Title *</Label>
              <Input
                id="task_title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                placeholder="Follow up call, Send proposal..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task_description">Description</Label>
              <Textarea
                id="task_description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                rows={3}
                placeholder="Task details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_due_date">Due Date *</Label>
                <Input
                  id="task_due_date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({...taskForm, due_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_due_time">Due Time</Label>
                <Input
                  id="task_due_time"
                  type="time"
                  value={taskForm.due_time}
                  onChange={(e) => setTaskForm({...taskForm, due_time: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task_priority">Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task_status">Status</Label>
                <Select value={taskForm.status} onValueChange={(value) => setTaskForm({...taskForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckSquare className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleActivitySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type</Label>
              <Select value={activityForm.activity_type} onValueChange={(value) => setActivityForm({...activityForm, activity_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Visit">Visit</SelectItem>
                  <SelectItem value="Note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_subject">Subject *</Label>
              <Input
                id="activity_subject"
                value={activityForm.subject}
                onChange={(e) => setActivityForm({...activityForm, subject: e.target.value})}
                placeholder="Called about proposal, Site visit..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_description">Description</Label>
              <Textarea
                id="activity_description"
                value={activityForm.description}
                onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                rows={3}
                placeholder="Activity details..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity_date">Date & Time</Label>
              <Input
                id="activity_date"
                type="datetime-local"
                value={activityForm.activity_date}
                onChange={(e) => setActivityForm({...activityForm, activity_date: e.target.value})}
              />
            </div>

            {(activityForm.activity_type === 'Visit' || activityForm.activity_type === 'Meeting') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="datetime-local"
                      value={activityForm.start_time}
                      onChange={(e) => setActivityForm({...activityForm, start_time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="datetime-local"
                      value={activityForm.end_time}
                      onChange={(e) => setActivityForm({...activityForm, end_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    className="w-full gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {currentLocation ? 'Location Captured' : 'Get Current Location'}
                  </Button>
                  {currentLocation && (
                    <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {currentLocation.address}
                      </p>
                      <p className="text-gray-500 mt-1">
                        {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={activityForm.outcome} onValueChange={(value) => setActivityForm({...activityForm, outcome: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Successful">Successful</SelectItem>
                    <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                    <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="No Answer">No Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity_status">Status</Label>
                <Select value={activityForm.status} onValueChange={(value) => setActivityForm({...activityForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowActivityDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <ActivityIcon className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <SendEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        recipient={null}
        relatedTo={relatedTo}
      />
    </>
  );
}
