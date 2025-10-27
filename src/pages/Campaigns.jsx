import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Megaphone,
  Edit,
  TrendingUp,
  Users,
  DollarSign,
  Target
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

export default function Campaigns() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_type: "Email",
    status: "Planning",
    start_date: "",
    end_date: "",
    budget: 0,
    actual_cost: 0,
    expected_revenue: 0,
    expected_response: 0,
    target_audience: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowDialog(false);
      setEditingCampaign(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      campaign_name: "",
      campaign_type: "Email",
      status: "Planning",
      start_date: "",
      end_date: "",
      budget: 0,
      actual_cost: 0,
      expected_revenue: 0,
      expected_response: 0,
      target_audience: "",
      description: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      campaign_name: campaign.campaign_name || "",
      campaign_type: campaign.campaign_type || "Email",
      status: campaign.status || "Planning",
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
      budget: campaign.budget || 0,
      actual_cost: campaign.actual_cost || 0,
      expected_revenue: campaign.expected_revenue || 0,
      expected_response: campaign.expected_response || 0,
      target_audience: campaign.target_audience || "",
      description: campaign.description || "",
    });
    setShowDialog(true);
  };

  const statusColors = {
    'Planning': 'bg-blue-100 text-blue-800',
    'Active': 'bg-green-100 text-green-800',
    'Paused': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-purple-100 text-purple-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.total_leads || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-pink-500" />
            Marketing Campaigns
          </h1>
          <p className="text-gray-500 mt-1">Plan and track your marketing initiatives</p>
        </div>
        <Button 
          onClick={() => {
            setEditingCampaign(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-pink-500 bg-opacity-20">
                <Megaphone className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 bg-opacity-20">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-20">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500 bg-opacity-20">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {totalLeads > 0 
                    ? ((campaigns.reduce((sum, c) => sum + (c.converted_leads || 0), 0) / totalLeads * 100).toFixed(1))
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const roi = campaign.actual_cost > 0 
            ? (((campaign.expected_revenue || 0) - campaign.actual_cost) / campaign.actual_cost * 100).toFixed(1)
            : 0;
          const conversionRate = campaign.total_leads > 0
            ? ((campaign.converted_leads || 0) / campaign.total_leads * 100).toFixed(1)
            : 0;

          return (
            <Card key={campaign.id} className="border-none shadow-lg hover:shadow-xl transition-all group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{campaign.campaign_type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(campaign)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className={`${statusColors[campaign.status]} mt-2 w-fit`}>
                  {campaign.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold">${campaign.budget?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Leads</p>
                    <p className="font-semibold">{campaign.total_leads || 0}</p>
                  </div>
                </div>
                {campaign.start_date && (
                  <div className="text-xs text-gray-500">
                    {format(new Date(campaign.start_date), 'MMM d')} - {campaign.end_date ? format(new Date(campaign.end_date), 'MMM d, yyyy') : 'Ongoing'}
                  </div>
                )}
                {roi > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">ROI</span>
                      <span className="text-sm font-semibold text-green-600">{roi}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No campaigns yet</h3>
            <p className="text-gray-400 mt-1">Launch your first marketing campaign</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_name">Campaign Name *</Label>
              <Input
                id="campaign_name"
                value={formData.campaign_name}
                onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_type">Campaign Type</Label>
                <Select value={formData.campaign_type} onValueChange={(value) => setFormData({...formData, campaign_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="Advertising">Advertising</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_revenue">Expected Revenue ($)</Label>
                <Input
                  id="expected_revenue"
                  type="number"
                  value={formData.expected_revenue}
                  onChange={(e) => setFormData({...formData, expected_revenue: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-pink-600 to-rose-600">
                {editingCampaign ? 'Update' : 'Create'} Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}