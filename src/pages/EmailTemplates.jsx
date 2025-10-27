import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Mail,
  Edit,
  Eye,
  Copy,
  BarChart3
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
import { Switch } from "@/components/ui/switch";

export default function EmailTemplates() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    template_name: "",
    subject: "",
    body: "",
    category: "Custom",
    is_active: true,
    variables: [],
  });

  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      setShowDialog(false);
      setEditingTemplate(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      template_name: "",
      subject: "",
      body: "",
      category: "Custom",
      is_active: true,
      variables: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name || "",
      subject: template.subject || "",
      body: template.body || "",
      category: template.category || "Custom",
      is_active: template.is_active !== undefined ? template.is_active : true,
      variables: template.variables || [],
    });
    setShowDialog(true);
  };

  const categoryColors = {
    'Welcome': 'bg-blue-100 text-blue-800',
    'Follow Up': 'bg-green-100 text-green-800',
    'Proposal': 'bg-purple-100 text-purple-800',
    'Meeting': 'bg-orange-100 text-orange-800',
    'Thank You': 'bg-pink-100 text-pink-800',
    'Marketing': 'bg-indigo-100 text-indigo-800',
    'Custom': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Mail className="w-8 h-8 text-blue-500" />
            Email Templates
          </h1>
          <p className="text-gray-500 mt-1">Create reusable email templates for faster communication</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTemplate(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="border-none shadow-lg hover:shadow-xl transition-all group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{template.subject}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(template)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge className={categoryColors[template.category]}>
                  {template.category}
                </Badge>
                {!template.is_active && (
                  <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.usage_count > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Used {template.usage_count} times</span>
                </div>
              )}
              {template.variables && template.variables.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No templates yet</h3>
            <p className="text-gray-400 mt-1">Create your first email template</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({...formData, template_name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Welcome">Welcome</SelectItem>
                    <SelectItem value="Follow Up">Follow Up</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Thank You">Thank You</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-7">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Template</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Use {{variable}} for dynamic content"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                rows={12}
                placeholder="Use {{first_name}}, {{company}}, etc. for personalization"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {['first_name', 'last_name', 'email', 'company', 'phone', 'job_title'].map((v) => (
                  <Badge key={v} variant="secondary" className="text-xs font-mono">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}