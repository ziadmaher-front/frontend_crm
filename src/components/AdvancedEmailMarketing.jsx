import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  Mail, 
  Send, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Zap, 
  Calendar, 
  Target, 
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Plus,
  Filter,
  Download,
  Upload,
  Sparkles,
  Brain,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

const AdvancedEmailMarketing = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      name: 'Q1 Product Launch',
      status: 'active',
      type: 'promotional',
      sent: 15420,
      delivered: 15180,
      opened: 7590,
      clicked: 1518,
      converted: 152,
      revenue: 45600,
      openRate: 50.0,
      clickRate: 10.0,
      conversionRate: 1.0,
      createdAt: '2024-01-15',
      scheduledAt: '2024-01-20 09:00',
      subject: 'Introducing Our Revolutionary New Product Line',
      previewText: 'Get 20% off your first order...',
      template: 'modern-product',
      audience: 'All Customers',
      audienceSize: 15420
    },
    {
      id: 2,
      name: 'Welcome Series - Part 1',
      status: 'scheduled',
      type: 'nurture',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: '2024-01-18',
      scheduledAt: '2024-01-25 10:00',
      subject: 'Welcome to Our Community!',
      previewText: 'Here\'s everything you need to get started...',
      template: 'welcome-series',
      audience: 'New Subscribers',
      audienceSize: 2340
    },
    {
      id: 3,
      name: 'Customer Retention Campaign',
      status: 'draft',
      type: 'retention',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      createdAt: '2024-01-19',
      scheduledAt: null,
      subject: 'We Miss You! Come Back for Exclusive Offers',
      previewText: 'Special discount just for you...',
      template: 'retention-offer',
      audience: 'Inactive Customers',
      audienceSize: 5670
    }
  ];

  // Mock data for email templates
  const emailTemplates = [
    {
      id: 1,
      name: 'Modern Product Launch',
      category: 'promotional',
      thumbnail: '/api/placeholder/300/200',
      description: 'Clean, modern design perfect for product announcements',
      usage: 156,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Welcome Series',
      category: 'nurture',
      thumbnail: '/api/placeholder/300/200',
      description: 'Warm, welcoming template for new subscribers',
      usage: 89,
      rating: 4.9
    },
    {
      id: 3,
      name: 'Newsletter Classic',
      category: 'newsletter',
      thumbnail: '/api/placeholder/300/200',
      description: 'Traditional newsletter layout with multiple sections',
      usage: 234,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Event Invitation',
      category: 'event',
      thumbnail: '/api/placeholder/300/200',
      description: 'Elegant design for event announcements and invitations',
      usage: 67,
      rating: 4.6
    }
  ];

  // Mock data for analytics
  const campaignPerformance = [
    { date: '2024-01-01', sent: 1200, opened: 480, clicked: 96, converted: 12 },
    { date: '2024-01-02', sent: 1350, opened: 540, clicked: 108, converted: 16 },
    { date: '2024-01-03', sent: 1100, opened: 462, clicked: 88, converted: 11 },
    { date: '2024-01-04', sent: 1450, opened: 609, clicked: 145, converted: 22 },
    { date: '2024-01-05', sent: 1600, opened: 720, clicked: 160, converted: 24 },
    { date: '2024-01-06', sent: 1300, opened: 585, clicked: 130, converted: 18 },
    { date: '2024-01-07', sent: 1750, opened: 787, clicked: 175, converted: 28 }
  ];

  const audienceSegments = [
    { name: 'VIP Customers', value: 2340, color: '#8884d8' },
    { name: 'Regular Customers', value: 8760, color: '#82ca9d' },
    { name: 'New Subscribers', value: 4320, color: '#ffc658' },
    { name: 'Inactive Users', value: 1580, color: '#ff7c7c' }
  ];

  const deviceBreakdown = [
    { device: 'Mobile', opens: 4560, clicks: 912, percentage: 60 },
    { device: 'Desktop', opens: 2280, clicks: 456, percentage: 30 },
    { device: 'Tablet', opens: 760, clicks: 152, percentage: 10 }
  ];

  // AI Content Generation
  const generateAIContent = async (type, prompt) => {
    setAiGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiResponses = {
      subject: [
        'Unlock Exclusive Benefits: Your VIP Access Awaits',
        'Limited Time: 50% Off Everything You Love',
        'Your Personalized Recommendations Are Here',
        'Don\'t Miss Out: Last Chance for Early Bird Pricing',
        'New Arrivals Just for You - Shop Now'
      ],
      content: [
        `Dear Valued Customer,

We're excited to share something special with you! Our latest collection has arrived, and we've handpicked items that match your preferences perfectly.

🌟 Exclusive Benefits:
• Early access to new products
• Personalized recommendations
• VIP customer support
• Free shipping on all orders

Ready to explore? Click below to discover your personalized selection.

Best regards,
The Team`,
        `Hello there!

We noticed you've been browsing our latest collection, and we wanted to make sure you don't miss out on these amazing deals.

✨ What's New:
• 50% off selected items
• Free returns within 30 days
• Express shipping available
• Exclusive member pricing

Your cart is waiting - complete your purchase today and save big!

Happy shopping!`,
        `Hi [First Name],

Your journey with us has been amazing, and we want to celebrate that with you!

🎉 Special Rewards:
• Loyalty points doubled
• Exclusive access to sales
• Personalized styling advice
• Birthday month surprises

Thank you for being part of our community. Here's to many more great experiences together!

Warmly,
Customer Success Team`
      ]
    };

    const response = aiResponses[type][Math.floor(Math.random() * aiResponses[type].length)];
    
    if (type === 'subject') {
      setEmailSubject(response);
    } else {
      setEmailContent(response);
    }
    
    setAiGenerating(false);
  };

  const CampaignCard = ({ campaign }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCampaign(campaign)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
          <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'scheduled' ? 'secondary' : 'outline'}>
            {campaign.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{campaign.openRate}%</div>
            <div className="text-xs text-muted-foreground">Open Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{campaign.clickRate}%</div>
            <div className="text-xs text-muted-foreground">Click Rate</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Audience: {campaign.audienceSize.toLocaleString()}</span>
          <span className="font-medium">${campaign.revenue.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );

  const TemplateCard = ({ template }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-3 flex items-center justify-center">
          <Mail className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="font-semibold mb-1">{template.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs">{template.rating}</span>
          </div>
          <Badge variant="outline" className="text-xs">{template.usage} uses</Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Marketing</h1>
          <p className="text-muted-foreground">AI-powered email campaigns and automation</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="composer">AI Composer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {selectedCampaign && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedCampaign.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{selectedCampaign.sent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedCampaign.opened.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedCampaign.clicked.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Clicked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{selectedCampaign.converted.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Converted</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Open Rate</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedCampaign.openRate} className="flex-1" />
                      <span className="text-sm font-medium">{selectedCampaign.openRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Click Rate</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedCampaign.clickRate} className="flex-1" />
                      <span className="text-sm font-medium">{selectedCampaign.clickRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Conversion Rate</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedCampaign.conversionRate} className="flex-1" />
                      <span className="text-sm font-medium">{selectedCampaign.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="composer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Email Composer
              </CardTitle>
              <p className="text-muted-foreground">Generate compelling email content with AI assistance</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-type">Campaign Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="nurture">Nurture</SelectItem>
                        <SelectItem value="retention">Retention</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        <SelectItem value="vip">VIP Customers</SelectItem>
                        <SelectItem value="new">New Subscribers</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone">Tone of Voice</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal">Campaign Goal</Label>
                    <Input placeholder="e.g., Increase product sales, Drive event attendance" />
                  </div>
                  
                  <div>
                    <Label htmlFor="key-points">Key Points to Include</Label>
                    <Textarea 
                      placeholder="Enter key messages, offers, or information to include..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subject">Email Subject Line</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => generateAIContent('subject')}
                    disabled={aiGenerating}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {aiGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Input 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Email Content</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => generateAIContent('content')}
                    disabled={aiGenerating}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    {aiGenerating ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea 
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Enter email content..."
                  rows={12}
                />
              </div>

              <div className="flex gap-4">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Test Email
                </Button>
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Email Templates</h2>
              <p className="text-muted-foreground">Professional templates for every occasion</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {emailTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">156.2K</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+12.5%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">24.8%</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+3.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">4.9%</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-purple-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+1.8%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">$89.2K</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">+18.7%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
                    <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
                    <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicked" />
                    <Line type="monotone" dataKey="converted" stroke="#ff7c7c" name="Converted" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audience Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={audienceSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {audienceSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceBreakdown.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {device.device === 'Mobile' && <Smartphone className="h-5 w-5" />}
                      {device.device === 'Desktop' && <Monitor className="h-5 w-5" />}
                      {device.device === 'Tablet' && <Globe className="h-5 w-5" />}
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{device.opens.toLocaleString()} opens</div>
                        <div className="text-xs text-muted-foreground">{device.clicks.toLocaleString()} clicks</div>
                      </div>
                      <div className="w-20">
                        <Progress value={device.percentage} />
                      </div>
                      <span className="text-sm font-medium w-12">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Email Automation Workflows
              </CardTitle>
              <p className="text-muted-foreground">Set up automated email sequences and triggers</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-dashed border-2 hover:border-solid cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Welcome Series</h3>
                    <p className="text-sm text-muted-foreground">Onboard new subscribers with a sequence of welcome emails</p>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-2 hover:border-solid cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Abandoned Cart</h3>
                    <p className="text-sm text-muted-foreground">Recover lost sales with targeted cart abandonment emails</p>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-2 hover:border-solid cursor-pointer transition-all">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Re-engagement</h3>
                    <p className="text-sm text-muted-foreground">Win back inactive subscribers with personalized content</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedEmailMarketing;