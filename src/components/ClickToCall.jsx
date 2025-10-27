import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Zap,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ClickToCall({ phoneNumber, recipientName, relatedTo }) {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [callOutcome, setCallOutcome] = useState("Successful");
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callInProgress) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callInProgress]);

  // Check for VoIP integration
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const voipIntegration = integrations.find(i => 
    i.integration_type === 'VoIP' && 
    i.status === 'Active' &&
    i.user_email === currentUser?.email
  );

  const createActivityMutation = useMutation({
    mutationFn: (data) => base44.entities.Activity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success("Call logged successfully");
    },
  });

  const handleStartCall = () => {
    if (!phoneNumber) {
      toast.error("No phone number available");
      return;
    }

    setShowCallDialog(true);
    setCallInProgress(true);
    setCallDuration(0);

    if (voipIntegration) {
      // In real implementation, this would initiate call via Twilio API
      toast.success(`Calling via ${voipIntegration.provider}...`);
    } else {
      toast.info("Dialing " + phoneNumber);
    }
  };

  const handleEndCall = async () => {
    setCallInProgress(false);

    // Log the call as activity
    try {
      await createActivityMutation.mutateAsync({
        activity_type: 'Call',
        subject: `Call with ${recipientName || phoneNumber}`,
        description: callNotes,
        activity_date: new Date().toISOString(),
        duration_minutes: Math.ceil(callDuration / 60),
        outcome: callOutcome,
        status: 'Completed',
        related_to_type: relatedTo?.type,
        related_to_id: relatedTo?.id,
        assigned_to: currentUser?.email,
      });

      setShowCallDialog(false);
      resetCall();
    } catch (error) {
      toast.error("Failed to log call: " + error.message);
    }
  };

  const resetCall = () => {
    setCallDuration(0);
    setCallNotes("");
    setCallOutcome("Successful");
    setIsMuted(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleStartCall}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Phone className="w-4 h-4" />
        Call {phoneNumber}
        {voipIntegration && (
          <Badge variant="secondary" className="ml-2 text-xs">
            <Zap className="w-3 h-3" />
          </Badge>
        )}
      </Button>

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Call in Progress</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Integration Badge */}
            {voipIntegration && (
              <div className="flex items-center justify-center">
                <Badge className="bg-green-100 text-green-700">
                  <Zap className="w-3 h-3 mr-1" />
                  Connected via {voipIntegration.provider}
                </Badge>
              </div>
            )}

            {!voipIntegration && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <div className="text-orange-800">
                  <p className="font-medium">No VoIP integration</p>
                  <p className="text-xs">Manually dialing. <a href="/Integrations" className="underline">Connect Twilio</a></p>
                </div>
              </div>
            )}

            {/* Call Display */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                {callInProgress ? (
                  <PhoneCall className="w-10 h-10 text-white animate-pulse" />
                ) : (
                  <Phone className="w-10 h-10 text-white" />
                )}
              </div>

              <div>
                <p className="font-semibold text-lg">{recipientName || "Contact"}</p>
                <p className="text-sm text-gray-600">{phoneNumber}</p>
              </div>

              {/* Call Duration */}
              <div className="flex items-center justify-center gap-2 text-2xl font-mono">
                <Clock className="w-5 h-5 text-gray-500" />
                {formatDuration(callDuration)}
              </div>
            </div>

            {/* Call Controls */}
            {callInProgress && (
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-12 h-12"
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleEndCall}
                  className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Call Notes */}
            {callInProgress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outcome">Call Outcome</Label>
                  <Select value={callOutcome} onValueChange={setCallOutcome}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Successful">Successful</SelectItem>
                      <SelectItem value="No Answer">No Answer</SelectItem>
                      <SelectItem value="Voicemail">Left Voicemail</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Call Notes</Label>
                  <Textarea
                    id="notes"
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    rows={3}
                    placeholder="Take notes during the call..."
                  />
                </div>
              </div>
            )}

            {/* Features Available */}
            {voipIntegration && callInProgress && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">Available Features:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Call Recording
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Auto Transcription
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Call Transfer
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Conference Call
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}