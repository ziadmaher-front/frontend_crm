
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ActivityService } from "@/services/activityService";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Activity,
  Phone,
  Video,
  Mail,
  MessageSquare,
  Calendar,
  MapPin // Added MapPin for Visit activity type
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import VisitCheckIn from "../components/VisitCheckIn"; // Added VisitCheckIn import

export default function Activities() {
  const [showDialog, setShowDialog] = useState(false);
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [formData, setFormData] = useState({
    activity_type: "Call",
    subject: "",
    description: "",
    activity_date: new Date().toISOString().slice(0, 16),
    duration_minutes: 30,
    outcome: "Successful",
    status: "Completed",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch activities with enhanced filtering
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', searchTerm, filterStatus, filterType],
    queryFn: () => ActivityService.getActivities({
      search: searchTerm || undefined,
      filterBy: buildFilterQuery(),
    }),
  });

  // Fetch activity analytics
  const { data: analytics } = useQuery({
    queryKey: ['activity-analytics'],
    queryFn: () => ActivityService.getActivityAnalytics(),
    enabled: showAnalytics,
  });

  // Fetch upcoming activities
  const { data: upcomingActivities = [] } = useQuery({
    queryKey: ['upcoming-activities'],
    queryFn: () => ActivityService.getUpcomingActivities(7),
  });

  const createMutation = useMutation({
    mutationFn: (data) => editingActivity 
      ? ActivityService.updateActivity(editingActivity.id, data)
      : ActivityService.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-activities'] });
      toast({
        title: "Success",
        description: editingActivity ? "Activity updated successfully" : "Activity created successfully",
      });
      setShowDialog(false);
      setEditingActivity(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save activity",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => ActivityService.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-activities'] });
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete activity",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, completionData }) => ActivityService.completeActivity(id, completionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-activities'] });
      toast({
        title: "Success",
        description: "Activity marked as completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete activity",
        variant: "destructive",
      });
    },
  });

  // Business logic functions
  const buildFilterQuery = () => {
    const filters = [];
    
    if (filterStatus !== "all") {
      filters.push(`status=${filterStatus}`);
    }
    
    if (filterType !== "all") {
      filters.push(`activity_type=${filterType}`);
    }
    
    return filters.join('&');
  };

  const resetForm = () => {
    setFormData({
      activity_type: "Call",
      subject: "",
      description: "",
      activity_date: new Date().toISOString().slice(0, 16),
      duration_minutes: 30,
      outcome: "Successful",
      status: "Completed",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject is required",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(formData);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      activity_type: activity.activity_type,
      subject: activity.subject,
      description: activity.description || "",
      activity_date: activity.activity_date.slice(0, 16),
      duration_minutes: activity.duration_minutes || 30,
      outcome: activity.outcome || "Successful",
      status: activity.status || "Scheduled",
    });
    setShowDialog(true);
  };

  const handleDelete = (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      deleteMutation.mutate(activityId);
    }
  };

  const handleComplete = (activity) => {
    const completionData = {
      outcome: "Successful",
      completed_date: new Date().toISOString(),
    };
    
    completeMutation.mutate({ id: activity.id, completionData });
  };

  const handleViewVisit = (activity) => {
    setSelectedVisit(activity);
    setShowVisitDialog(true);
  };

  const handleLoadTemplate = (template) => {
    setFormData({
      ...formData,
      activity_type: template.activity_type,
      subject: template.subject,
      description: template.description,
      duration_minutes: template.duration_minutes,
    });
    setShowDialog(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
  };

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const activityIcons = {
    'Call': Phone,
    'Meeting': Video,
    'Email': Mail,
    'Task': MessageSquare,
    'Note': MessageSquare,
    'Visit': MapPin, // Added Visit icon
  };

  const activityColors = {
    'Call': 'bg-blue-100 text-blue-800 border-blue-200',
    'Meeting': 'bg-purple-100 text-purple-800 border-purple-200',
    'Email': 'bg-green-100 text-green-800 border-green-200',
    'Task': 'bg-orange-100 text-orange-800 border-orange-200',
    'Note': 'bg-gray-100 text-gray-800 border-gray-200',
    'Visit': 'bg-sky-100 text-sky-800 border-sky-200', // Added Visit color
  };

  const outcomeColors = {
    'Successful': 'bg-green-100 text-green-800',
    'Unsuccessful': 'bg-red-100 text-red-800',
    'Rescheduled': 'bg-yellow-100 text-yellow-800',
    'No Answer': 'bg-gray-100 text-gray-800',
  };

  // Group filtered activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = format(new Date(activity.activity_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  // Get activity templates
  const activityTemplates = ActivityService.getActivityTemplates();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Activity className="w-8 h-8" />
            Activities
          </h1>
          <p className="crm-page-subtitle">Track all your interactions and engagements</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            Analytics
          </Button>
          <Button 
            onClick={() => {
              resetForm();
              setEditingActivity(null);
              setShowDialog(true);
            }}
            className="crm-btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Note">Note</SelectItem>
                <SelectItem value="Visit">Visit</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || filterStatus !== "all" || filterType !== "all") && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{analytics.total}</p>
                <p className="text-sm text-gray-500">Total Activities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{analytics.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{analytics.completionRate}%</p>
                <p className="text-sm text-gray-500">Completion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{analytics.successRate}%</p>
                <p className="text-sm text-gray-500">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Templates */}
      <Card className="border-none shadow-md">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3">Quick Templates</h3>
          <div className="flex flex-wrap gap-2">
            {activityTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                onClick={() => handleLoadTemplate(template)}
                className="text-xs"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {['Call', 'Meeting', 'Email', 'Task', 'Note', 'Visit'].map((type) => {
          const count = filteredActivities.filter(a => a.activity_type === type).length;
          const Icon = activityIcons[type];
          return (
            <Card key={type} className="border-none shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activityColors[type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{type}s</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="space-y-3">
              {dayActivities.map((activity) => {
                const Icon = activityIcons[activity.activity_type];
                return (
                  <Card 
                    key={activity.id} 
                    className="border-none shadow-md hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-xl ${activityColors[activity.activity_type]} h-fit`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{activity.subject}</h4>
                              <p className="text-sm text-gray-500">
                                {format(new Date(activity.activity_date), 'h:mm a')}
                                {activity.duration_minutes && ` • ${activity.duration_minutes} minutes`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={`${activityColors[activity.activity_type]} border`}>
                                {activity.activity_type}
                              </Badge>
                              {activity.outcome && (
                                <Badge className={outcomeColors[activity.outcome]}>
                                  {activity.outcome}
                                </Badge>
                              )}
                              {activity.status && (
                                <Badge variant={activity.status === 'Completed' ? 'default' : 'secondary'}>
                                  {activity.status}
                                </Badge>
                              )}
                              {activity.activity_type === 'Visit' && activity.checked_in && !activity.checked_out && (
                                <Badge className="bg-blue-100 text-blue-700">
                                  In Progress
                                </Badge>
                              )}
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-gray-600 mt-2">{activity.description}</p>
                          )}
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>Status: {activity.status}</span>
                              {activity.created_by && (
                                <span>By: {activity.created_by}</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {activity.activity_type === 'Visit' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewVisit(activity);
                                  }}
                                >
                                  <MapPin className="w-4 h-4 mr-1" />
                                  View Visit
                                </Button>
                              )}
                              {activity.status === 'Scheduled' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleComplete(activity);
                                  }}
                                  disabled={completeMutation.isLoading}
                                >
                                  Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(activity);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(activity.id);
                                }}
                                disabled={deleteMutation.isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          {activity.activity_type === 'Visit' && (activity.start_location || activity.end_location) && (
                            <div className="mt-2 text-xs text-blue-600">
                              📍 Location data available - Click "View Visit" to see details
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No activities logged yet</h3>
            <p className="text-gray-400 mt-1">Start tracking your interactions</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Log New Activity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activity_type">Activity Type</Label>
              <Select value={formData.activity_type} onValueChange={(value) => setFormData({...formData, activity_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Note">Note</SelectItem>
                  <SelectItem value="Visit">Visit</SelectItem> {/* Added Visit option */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_date">Date & Time</Label>
                <Input
                  id="activity_date"
                  type="datetime-local"
                  value={formData.activity_date}
                  onChange={(e) => setFormData({...formData, activity_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select value={formData.outcome} onValueChange={(value) => setFormData({...formData, outcome: value})}>
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
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-orange-600 to-amber-600"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : (editingActivity ? 'Update Activity' : 'Log Activity')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visit Details Dialog */}
      <Dialog open={showVisitDialog} onOpenChange={setShowVisitDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visit Details</DialogTitle>
          </DialogHeader>
          {selectedVisit && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedVisit.subject}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedVisit.description}</p>
              </div>
              <VisitCheckIn 
                visit={selectedVisit} 
                onUpdate={() => {
                  queryClient.invalidateQueries({ queryKey: ['activities'] });
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
