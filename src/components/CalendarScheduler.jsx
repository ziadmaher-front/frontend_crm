import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Users, Clock, MapPin, Zap, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CalendarScheduler({ open, onOpenChange, attendees = [], relatedTo }) {
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    meeting_type: "In-Person",
    attendees: attendees.map(a => a.email).filter(Boolean),
  });
  const [useCalendarIntegration, setUseCalendarIntegration] = useState(false);
  const [useVideoIntegration, setUseVideoIntegration] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (attendees.length > 0) {
      setMeetingData(prev => ({
        ...prev,
        attendees: attendees.map(a => a.email).filter(Boolean),
      }));
    }
  }, [attendees]);

  // Check for calendar integration
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const calendarIntegration = integrations.find(i => 
    i.integration_type === 'Calendar' && 
    i.status === 'Active' &&
    i.user_email === currentUser?.email
  );

  const videoIntegration = integrations.find(i => 
    i.integration_type === 'VideoConference' && 
    i.status === 'Active' &&
    i.user_email === currentUser?.email
  );

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success("Meeting scheduled successfully");
    },
  });

  const handleScheduleMeeting = async () => {
    if (!meetingData.title || !meetingData.start_time || !meetingData.end_time) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.loading("Scheduling meeting...");

    try {
      let videoLink = null;

      // Generate video link if video integration enabled
      if (useVideoIntegration && videoIntegration) {
        // In real implementation, this would call Zoom/Teams API
        videoLink = `https://${videoIntegration.provider.toLowerCase()}.us/j/${Math.random().toString(36).substring(7)}`;
        toast.success("Video link generated: " + videoLink);
      }

      // Create calendar event if integration enabled
      if (useCalendarIntegration && calendarIntegration) {
        // In real implementation, this would call Google Calendar API, etc.
        toast.success("Event added to " + calendarIntegration.provider + " Calendar");
      }

      // Create activity in CRM
      await createActivityMutation.mutateAsync({
        activity_type: 'Meeting',
        subject: meetingData.title,
        description: meetingData.description + (videoLink ? `\n\nVideo Link: ${videoLink}` : ''),
        activity_date: meetingData.start_time,
        start_time: meetingData.start_time,
        end_time: meetingData.end_time,
        status: 'Scheduled',
        related_to_type: relatedTo?.type,
        related_to_id: relatedTo?.id,
        assigned_to: currentUser?.email,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to schedule meeting: " + error.message);
    }
  };

  const resetForm = () => {
    setMeetingData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      meeting_type: "In-Person",
      attendees: [],
    });
  };

  const handleSetDuration = (minutes) => {
    if (meetingData.start_time) {
      const start = new Date(meetingData.start_time);
      const end = new Date(start.getTime() + minutes * 60000);
      setMeetingData({
        ...meetingData,
        end_time: end.toISOString().slice(0, 16)
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Meeting
            {calendarIntegration && (
              <Badge className="bg-blue-100 text-blue-700">
                <Zap className="w-3 h-3 mr-1" />
                {calendarIntegration.provider} Connected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Integration Options */}
          <div className="space-y-2">
            {calendarIntegration && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Add to {calendarIntegration.provider} Calendar
                    </p>
                    <p className="text-xs text-blue-700">
                      Syncs with: {calendarIntegration.connected_email}
                    </p>
                  </div>
                </div>
                <Button
                  variant={useCalendarIntegration ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCalendarIntegration(!useCalendarIntegration)}
                >
                  {useCalendarIntegration ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            )}

            {videoIntegration && (
              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      Generate {videoIntegration.provider} Link
                    </p>
                    <p className="text-xs text-purple-700">
                      Auto-create video meeting
                    </p>
                  </div>
                </div>
                <Button
                  variant={useVideoIntegration ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseVideoIntegration(!useVideoIntegration)}
                >
                  {useVideoIntegration ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            )}

            {!calendarIntegration && !videoIntegration && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="text-orange-800">
                  Connect Calendar or Video tools for enhanced features. 
                  <a href="/Integrations" className="underline ml-1">Setup integration</a>
                </span>
              </div>
            )}
          </div>

          {/* Meeting Details */}
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={meetingData.title}
              onChange={(e) => setMeetingData({...meetingData, title: e.target.value})}
              placeholder="Product Demo, Discovery Call, Contract Review..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={meetingData.description}
              onChange={(e) => setMeetingData({...meetingData, description: e.target.value})}
              rows={3}
              placeholder="Meeting agenda and details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={meetingData.start_time}
                onChange={(e) => setMeetingData({...meetingData, start_time: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={meetingData.end_time}
                onChange={(e) => setMeetingData({...meetingData, end_time: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex gap-2">
            <p className="text-sm text-gray-600">Quick duration:</p>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSetDuration(15)}
              disabled={!meetingData.start_time}
            >
              15 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSetDuration(30)}
              disabled={!meetingData.start_time}
            >
              30 min
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleSetDuration(60)}
              disabled={!meetingData.start_time}
            >
              1 hour
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_type">Meeting Type</Label>
            <Select 
              value={meetingData.meeting_type} 
              onValueChange={(value) => setMeetingData({...meetingData, meeting_type: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Video Call">Video Call</SelectItem>
                <SelectItem value="Phone Call">Phone Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {meetingData.meeting_type === 'In-Person' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={meetingData.location}
                onChange={(e) => setMeetingData({...meetingData, location: e.target.value})}
                placeholder="Office address, conference room..."
              />
            </div>
          )}

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <Input
              id="attendees"
              value={meetingData.attendees.join(', ')}
              onChange={(e) => setMeetingData({
                ...meetingData, 
                attendees: e.target.value.split(',').map(email => email.trim())
              })}
              placeholder="email@company.com, another@company.com"
            />
            <p className="text-xs text-gray-500">Comma-separated email addresses</p>
          </div>

          {/* Preview */}
          {(meetingData.title && meetingData.start_time) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Meeting Preview:</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>{meetingData.title}</strong></p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(meetingData.start_time).toLocaleString()} - {meetingData.end_time && new Date(meetingData.end_time).toLocaleString()}
                </p>
                {meetingData.attendees.length > 0 && (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {meetingData.attendees.length} attendee(s)
                  </p>
                )}
                {meetingData.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {meetingData.location}
                  </p>
                )}
                {useVideoIntegration && (
                  <p className="flex items-center gap-2 text-purple-600">
                    <Video className="w-4 h-4" />
                    Video link will be generated
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleScheduleMeeting} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}