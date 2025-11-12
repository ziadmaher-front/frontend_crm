import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Share2,
  Play,
  Pause,
  Settings,
  Users,
  Target,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Filter,
  Download,
  Upload
} from 'lucide-react';

const MultiChannelCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    channels: [],
    audience: '',
    schedule: 'immediate',
    scheduledDate: '',
    triggers: [],
    goals: []
  });

  // Mock campaign data
  const mockCampaigns = [
    {
      id: 1,
      name: 'Q1 Product Launch',
      description: 'Multi-channel campaign for new product launch',
      status: 'active',
      channels: ['email', 'sms', 'social', 'phone'],
      audience: 'High-value prospects',
      audienceSize: 2847,
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      progress: 65,
      metrics: {
        sent: 18450,
        delivered: 17892,
        opened: 8946,
        clicked: 2684,
        converted: 156,
        revenue: 234500
      },
      channels_performance: {
        email: { sent: 8500, opened: 4250, clicked: 1275, converted: 85 },
        sms: { sent: 5200, opened: 4680, clicked: 936, converted: 42 },
        social: { sent: 3500, opened: 2800, clicked: 420, converted: 21 },
        phone: { sent: 1250, connected: 875, interested: 53, converted: 8 }
      },
      automation_rules: [
        { trigger: 'Email opened', action: 'Send follow-up SMS after 2 hours' },
        { trigger: 'SMS clicked', action: 'Schedule phone call' },
        { trigger: 'No response after 3 days', action: 'Send social media message' }
      ]
    },
    {
      id: 2,
      name: 'Customer Retention Drive',
      description: 'Re-engagement campaign for inactive customers',
      status: 'paused',
      channels: ['email', 'phone'],
      audience: 'Inactive customers (90+ days)',
      audienceSize: 1523,
      startDate: '2024-01-10',
      endDate: '2024-02-28',
      progress: 45,
      metrics: {
        sent: 6092,
        delivered: 5874,
        opened: 2349,
        clicked: 469,
        converted: 23,
        revenue: 45600
      },
      channels_performance: {
        email: { sent: 4592, opened: 1836, clicked: 367, converted: 18 },
        phone: { sent: 1500, connected: 900, interested: 102, converted: 5 }
      },
      automation_rules: [
        { trigger: 'Email bounced', action: 'Try phone call' },
        { trigger: 'Phone call answered', action: 'Send personalized offer email' }
      ]
    }
  ];

  const channelIcons = {
    email: <Mail className="h-4 w-4" />,
    sms: <MessageSquare className="h-4 w-4" />,
    social: <Share2 className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />
  };

  const channelColors = {
    email: 'bg-blue-500',
    sms: 'bg-green-500',
    social: 'bg-purple-500',
    phone: 'bg-orange-500'
  };

  useEffect(() => {
    setCampaigns(mockCampaigns);
  }, []);

  const handleCreateCampaign = () => {
    const newCampaign = {
      id: Date.now(),
      ...campaignForm,
      status: 'draft',
      progress: 0,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        revenue: 0
      }
    };
    setCampaigns([...campaigns, newCampaign]);
    setIsCreating(false);
    setCampaignForm({
      name: '',
      description: '',
      channels: [],
      audience: '',
      schedule: 'immediate',
      scheduledDate: '',
      triggers: [],
      goals: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateROI = (metrics) => {
    if (metrics.sent === 0) return 0;
    const cost = metrics.sent * 0.5; // Assume $0.5 per message
    return ((metrics.revenue - cost) / cost * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Channel Campaigns</h1>
          <p className="text-muted-foreground">
            Orchestrate automated campaigns across email, SMS, social media, and phone
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a multi-channel campaign with automated sequences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Campaign Name</Label>
                    <Input
                      id="name"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                      placeholder="Enter campaign name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select value={campaignForm.audience} onValueChange={(value) => setCampaignForm({...campaignForm, audience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-leads">All Leads</SelectItem>
                        <SelectItem value="hot-prospects">Hot Prospects</SelectItem>
                        <SelectItem value="existing-customers">Existing Customers</SelectItem>
                        <SelectItem value="inactive-customers">Inactive Customers</SelectItem>
                        <SelectItem value="custom">Custom Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                    placeholder="Describe your campaign objectives"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Channels</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['email', 'sms', 'social', 'phone'].map((channel) => (
                      <div key={channel} className="flex items-center space-x-2">
                        <Switch
                          checked={campaignForm.channels.includes(channel)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCampaignForm({...campaignForm, channels: [...campaignForm.channels, channel]});
                            } else {
                              setCampaignForm({...campaignForm, channels: campaignForm.channels.filter(c => c !== channel)});
                            }
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          {channelIcons[channel]}
                          <span className="capitalize">{channel}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Select value={campaignForm.schedule} onValueChange={(value) => setCampaignForm({...campaignForm, schedule: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Start Immediately</SelectItem>
                        <SelectItem value="scheduled">Schedule for Later</SelectItem>
                        <SelectItem value="trigger">Trigger-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {campaignForm.schedule === 'scheduled' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Start Date</Label>
                      <Input
                        id="scheduledDate"
                        type="datetime-local"
                        value={campaignForm.scheduledDate}
                        onChange={(e) => setCampaignForm({...campaignForm, scheduledDate: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCampaign}>
                    Create Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{campaigns.length}</div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Campaigns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {campaigns.reduce((sum, c) => sum + (c.metrics?.sent || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Messages Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Revenue Generated</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={`${getStatusColor(campaign.status)} text-white`}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.audienceSize?.toLocaleString()} contacts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{campaign.startDate} - {campaign.endDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {campaign.status === 'active' ? (
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium">Channels:</span>
                {campaign.channels.map((channel) => (
                  <Badge key={channel} variant="outline" className="flex items-center space-x-1">
                    {channelIcons[channel]}
                    <span className="capitalize">{channel}</span>
                  </Badge>
                ))}
              </div>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Campaign Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold">{campaign.metrics?.sent?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{campaign.metrics?.delivered?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{campaign.metrics?.opened?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Opened</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{campaign.metrics?.clicked?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Clicked</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold">{campaign.metrics?.converted?.toLocaleString() || 0}</div>
                  <div className="text-xs text-muted-foreground">Converted</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {calculateROI(campaign.metrics)}%
                  </div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                </div>
              </div>

              {/* Channel Performance */}
              {campaign.channels_performance && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Channel Performance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(campaign.channels_performance).map(([channel, metrics]) => (
                      <div key={channel} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          {channelIcons[channel]}
                          <span className="font-medium capitalize">{channel}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Sent:</span>
                            <span>{metrics.sent?.toLocaleString()}</span>
                          </div>
                          {metrics.opened && (
                            <div className="flex justify-between">
                              <span>Opened:</span>
                              <span>{metrics.opened?.toLocaleString()}</span>
                            </div>
                          )}
                          {metrics.connected && (
                            <div className="flex justify-between">
                              <span>Connected:</span>
                              <span>{metrics.connected?.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Converted:</span>
                            <span className="text-green-600">{metrics.converted}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automation Rules */}
              {campaign.automation_rules && campaign.automation_rules.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Automation Rules</h4>
                  <div className="space-y-2">
                    {campaign.automation_rules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span><strong>When:</strong> {rule.trigger}</span>
                        <span>→</span>
                        <span><strong>Then:</strong> {rule.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first multi-channel campaign to start engaging with your audience
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultiChannelCampaigns;