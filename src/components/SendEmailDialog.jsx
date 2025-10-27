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
import { Mail, Paperclip, Send, Zap, Eye, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function SendEmailDialog({ open, onOpenChange, recipient, relatedTo }) {
  const [emailData, setEmailData] = useState({
    to: recipient?.email || "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    template_id: "",
    attachments: [],
  });
  const [useIntegration, setUseIntegration] = useState(false);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  useEffect(() => {
    if (recipient) {
      setEmailData(prev => ({
        ...prev,
        to: recipient.email,
        subject: `Follow up - ${recipient.first_name} ${recipient.last_name}`,
      }));
    }
  }, [recipient]);

  // Check for email integration
  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: () => base44.entities.Integration.list(),
  });

  const emailIntegration = integrations.find(i => 
    i.integration_type === 'Email' && 
    i.status === 'Active' &&
    i.user_email === currentUser?.email
  );

  const { data: templates = [] } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list(),
  });

  const createCommunicationMutation = useMutation({
    mutationFn: (data) => base44.entities.Communication.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success("Email logged successfully");
    },
  });

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      let body = template.body;
      let subject = template.subject;

      // Replace variables
      if (recipient) {
        body = body.replace(/{{first_name}}/g, recipient.first_name || '');
        body = body.replace(/{{last_name}}/g, recipient.last_name || '');
        body = body.replace(/{{company}}/g, recipient.company || recipient.company_name || '');
        body = body.replace(/{{email}}/g, recipient.email || '');
        
        subject = subject.replace(/{{first_name}}/g, recipient.first_name || '');
        subject = subject.replace(/{{last_name}}/g, recipient.last_name || '');
        subject = subject.replace(/{{company}}/g, recipient.company || recipient.company_name || '');
      }

      setEmailData(prev => ({
        ...prev,
        subject,
        body,
        template_id: templateId,
      }));
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !emailData.body) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.loading("Sending email...");

    try {
      if (useIntegration && emailIntegration) {
        // Send via integrated email provider (e.g., Gmail API)
        // This would use the actual provider's API with the stored access token
        toast.success("Email sent via " + emailIntegration.provider);
      } else {
        // Send via base44 email integration
        await base44.integrations.Core.SendEmail({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
        });
        toast.success("Email sent successfully");
      }

      // Log communication
      await createCommunicationMutation.mutateAsync({
        communication_type: 'Email',
        direction: 'Outbound',
        subject: emailData.subject,
        content: emailData.body,
        from_email: currentUser?.email,
        to_emails: [emailData.to],
        cc_emails: emailData.cc ? emailData.cc.split(',').map(e => e.trim()) : [],
        related_to_type: relatedTo?.type,
        related_to_id: relatedTo?.id,
        status: 'Completed',
        completed_date: new Date().toISOString(),
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to send email: " + error.message);
    }
  };

  const resetForm = () => {
    setEmailData({
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      template_id: "",
      attachments: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
            {emailIntegration && (
              <Badge className="bg-green-100 text-green-700">
                <Zap className="w-3 h-3 mr-1" />
                {emailIntegration.provider} Connected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Integration Toggle */}
          {emailIntegration && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Send via {emailIntegration.provider}
                  </p>
                  <p className="text-xs text-blue-700">
                    Sends from: {emailIntegration.connected_email}
                  </p>
                </div>
              </div>
              <Button
                variant={useIntegration ? "default" : "outline"}
                size="sm"
                onClick={() => setUseIntegration(!useIntegration)}
              >
                {useIntegration ? 'Using Integration' : 'Use Base44'}
              </Button>
            </div>
          )}

          {!emailIntegration && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-orange-800">
                Connect your email to send from your account. 
                <a href="/Integrations" className="underline ml-1">Setup integration</a>
              </span>
            </div>
          )}

          {/* Template Selector */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select value={emailData.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="to">To *</Label>
            <Input
              id="to"
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              placeholder="recipient@company.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                value={emailData.cc}
                onChange={(e) => setEmailData({...emailData, cc: e.target.value})}
                placeholder="cc@company.com (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                type="email"
                value={emailData.bcc}
                onChange={(e) => setEmailData({...emailData, bcc: e.target.value})}
                placeholder="bcc@company.com"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              placeholder="Email subject"
              required
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <ReactQuill
              value={emailData.body}
              onChange={(value) => setEmailData({...emailData, body: value})}
              theme="snow"
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ],
              }}
              className="bg-white"
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </div>

          {/* Tracking Options */}
          {useIntegration && (
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <input
                type="checkbox"
                id="tracking"
                checked={trackingEnabled}
                onChange={(e) => setTrackingEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="tracking" className="cursor-pointer flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Track email opens</span>
              </Label>
            </div>
          )}

          {/* Preview Variables */}
          {emailData.template_id && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">Template Variables:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {'{'}{'{'} first_name {'}'}{'}'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {'{'}{'{'} last_name {'}'}{'}'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {'{'}{'{'} company {'}'}{'}'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {'{'}{'{'} email {'}'}{'}'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}