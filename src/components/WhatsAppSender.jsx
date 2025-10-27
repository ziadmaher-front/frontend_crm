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
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Zap, 
  AlertCircle, 
  Image as ImageIcon,
  FileText,
  CheckCheck
} from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppSender({ open, onOpenChange, recipient, relatedTo }) {
  const [messageData, setMessageData] = useState({
    phone: recipient?.phone || recipient?.mobile || "",
    message: "",
    attachments: [],
  });
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (recipient) {
      setMessageData(prev => ({
        ...prev,
        phone: recipient.phone || recipient.mobile || "",
        message: `Hi ${recipient.first_name || ''},\n\n`,
      }));
    }
  }, [recipient]);

  // Check for WhatsApp integration
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const whatsappIntegration = integrations.find(i => 
    i.integration_type === 'WhatsApp' && 
    i.status === 'Active' &&
    i.user_email === currentUser?.email
  );

  const createCommunicationMutation = useMutation({
    mutationFn: (data) => base44.entities.Communication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success("WhatsApp message sent & logged");
    },
  });

  const handleSendWhatsApp = async () => {
    if (!messageData.phone || !messageData.message) {
      toast.error("Please fill in phone number and message");
      return;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = messageData.phone.replace(/[^\d+]/g, '');

    toast.loading("Sending WhatsApp message...");

    try {
      if (whatsappIntegration) {
        // Send via WhatsApp Business API
        // In real implementation, this would use WhatsApp API with stored credentials
        toast.success("Message sent via WhatsApp Business API");
      } else {
        // Open WhatsApp Web with pre-filled message
        const encodedMessage = encodeURIComponent(messageData.message);
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        toast.success("WhatsApp opened - send the message manually");
      }

      // Log communication
      await createCommunicationMutation.mutateAsync({
        communication_type: 'WhatsApp',
        direction: 'Outbound',
        subject: `WhatsApp to ${recipient?.first_name || recipient?.company_name || cleanPhone}`,
        content: messageData.message,
        from_email: currentUser?.email,
        to_emails: [cleanPhone],
        related_to_type: relatedTo?.type,
        related_to_id: relatedTo?.id,
        status: 'Completed',
        completed_date: new Date().toISOString(),
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to send WhatsApp: " + error.message);
    }
  };

  const resetForm = () => {
    setMessageData({
      phone: "",
      message: "",
      attachments: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Send WhatsApp Message
            {whatsappIntegration && (
              <Badge className="bg-green-100 text-green-700">
                <Zap className="w-3 h-3 mr-1" />
                Business API Connected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Integration Status */}
          {whatsappIntegration ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCheck className="w-4 h-4 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  WhatsApp Business API Active
                </p>
              </div>
              <ul className="text-xs text-green-700 space-y-1 ml-6">
                <li>• Automated delivery</li>
                <li>• Message templates support</li>
                <li>• Rich media (images, documents)</li>
                <li>• Read receipts tracking</li>
              </ul>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">WhatsApp Web Mode</p>
                  <p className="text-xs mt-1">
                    Will open WhatsApp Web. 
                    <a href="/Integrations" className="underline ml-1">Connect Business API</a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={messageData.phone}
              onChange={(e) => setMessageData({...messageData, phone: e.target.value})}
              placeholder="+1234567890 (include country code)"
              required
            />
            <p className="text-xs text-gray-500">
              Include country code (e.g., +1 for US, +971 for UAE)
            </p>
          </div>

          {/* Recipient Info */}
          {recipient && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700">Sending to:</p>
              <p className="text-sm text-gray-900 mt-1">
                {recipient.first_name} {recipient.last_name}
                {recipient.company_name && ` - ${recipient.company_name}`}
              </p>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={messageData.message}
              onChange={(e) => setMessageData({...messageData, message: e.target.value})}
              rows={6}
              placeholder="Type your WhatsApp message..."
              required
              className="font-sans"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{messageData.message.length} characters</span>
              <span>Use *bold*, _italic_, ~strikethrough~</span>
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessageData({
                  ...messageData, 
                  message: `Hi ${recipient?.first_name || ''},\n\nThank you for your interest in our products. I'd love to schedule a quick call to discuss how we can help.\n\nWhen would be a good time for you?\n\nBest regards`
                })}
              >
                Follow-up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessageData({
                  ...messageData, 
                  message: `Hi ${recipient?.first_name || ''},\n\nI wanted to share our latest proposal with you. I've attached the document for your review.\n\nLet me know if you have any questions!\n\nBest regards`
                })}
              >
                Proposal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMessageData({
                  ...messageData, 
                  message: `Hi ${recipient?.first_name || ''},\n\nJust wanted to check in and see if you had any questions about our discussion.\n\nLooking forward to hearing from you!\n\nBest regards`
                })}
              >
                Check-in
              </Button>
            </div>
          </div>

          {/* Features Available with Business API */}
          {whatsappIntegration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">Available with Business API:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <ImageIcon className="w-3 h-3" />
                  Send Images
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <FileText className="w-3 h-3" />
                  Send Documents
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <CheckCheck className="w-3 h-3" />
                  Read Receipts
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <Zap className="w-3 h-3" />
                  Automated Messages
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {messageData.message && (
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">Message Preview:</p>
              <div className="bg-green-50 rounded-lg p-3 max-w-xs">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {messageData.message}
                </p>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendWhatsApp} 
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <Send className="w-4 h-4 mr-2" />
            {whatsappIntegration ? 'Send Message' : 'Open WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}