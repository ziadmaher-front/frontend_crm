
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showVisitDialog, setShowVisitDialog] = useState(false); // Added new state
  const [selectedVisit, setSelectedVisit] = useState(null); // Added new state
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

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-activity_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setShowDialog(false);
      resetForm();
    },
  });

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
    createMutation.mutate(formData);
  };

  const handleViewVisit = (activity) => { // Added handleViewVisit function
    setSelectedVisit(activity);
    setShowVisitDialog(true);
  };

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

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = format(new Date(activity.activity_date), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Activity className="w-8 h-8 text-orange-500" />
            Activities
          </h1>
          <p className="text-gray-500 mt-1">Track all your interactions and engagements</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4"> {/* Adjusted grid-cols to 6 for 'Visit' */}
        {['Call', 'Meeting', 'Email', 'Task', 'Note', 'Visit'].map((type) => { // Added 'Visit' to the types
          const count = activities.filter(a => a.activity_type === type).length;
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
                    className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer" // Added cursor-pointer
                    onClick={() => {
                      if (activity.activity_type === 'Visit') {
                        handleViewVisit(activity);
                      }
                    }}
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
                          <div className="flex gap-4 mt-3 text-sm text-gray-500">
                            <span>Status: {activity.status}</span>
                            {activity.created_by && (
                              <span>By: {activity.created_by}</span>
                            )}
                          </div>
                          {activity.activity_type === 'Visit' && (activity.start_location || activity.end_location) && (
                            <div className="mt-2 text-xs text-blue-600">
                              📍 Location data available - Click to view
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

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log New Activity</DialogTitle>
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
              <Button type="submit" className="bg-gradient-to-r from-orange-600 to-amber-600">
                Log Activity
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
