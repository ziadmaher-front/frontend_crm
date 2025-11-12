import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Brain, 
  Search, 
  Sparkles, 
  Download, 
  Share2, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Lightbulb,
  Zap,
  Target,
  Users,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Settings,
  Plus,
  Bookmark,
  Star,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  Image,
  Table,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Map,
  Globe,
  Database,
  Code,
  Cpu,
  Network,
  Layers,
  Grid,
  List,
  Layout,
  Maximize2,
  Minimize2,
  Copy,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

const SmartReportingEngine = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_30_days');

  // Sample natural language queries
  const sampleQueries = [
    "Show me sales performance by region for the last quarter",
    "What are the top 5 products by revenue this month?",
    "Compare lead conversion rates between marketing channels",
    "Which sales reps are performing above target?",
    "Show customer churn rate trends over the past year",
    "What's the average deal size by industry?",
    "How many new customers did we acquire last month?",
    "Show pipeline velocity by deal stage"
  ];

  // AI-generated insights
  const aiInsights = [
    {
      id: 1,
      type: 'trend',
      title: 'Sales Momentum Building',
      description: 'Sales velocity has increased 23% over the past 30 days, with Enterprise deals showing the strongest growth.',
      confidence: 94,
      impact: 'high',
      category: 'Sales Performance',
      timestamp: '2 hours ago',
      data: {
        metric: 'Sales Velocity',
        change: '+23%',
        period: '30 days'
      }
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Unusual Drop in Email Opens',
      description: 'Email open rates have decreased by 15% in the Technology sector. This may indicate deliverability issues or content fatigue.',
      confidence: 87,
      impact: 'medium',
      category: 'Marketing',
      timestamp: '4 hours ago',
      data: {
        metric: 'Email Open Rate',
        change: '-15%',
        segment: 'Technology'
      }
    },
    {
      id: 3,
      type: 'opportunity',
      title: 'Cross-sell Opportunity Identified',
      description: 'Customers who purchased Product A have a 67% likelihood of purchasing Product B within 90 days.',
      confidence: 91,
      impact: 'high',
      category: 'Revenue Optimization',
      timestamp: '6 hours ago',
      data: {
        probability: '67%',
        timeframe: '90 days',
        products: ['Product A', 'Product B']
      }
    },
    {
      id: 4,
      type: 'prediction',
      title: 'Q4 Revenue Forecast',
      description: 'Based on current pipeline and historical patterns, Q4 revenue is projected to exceed target by 12%.',
      confidence: 89,
      impact: 'high',
      category: 'Forecasting',
      timestamp: '8 hours ago',
      data: {
        forecast: '+12% above target',
        quarter: 'Q4',
        confidence_interval: '±5%'
      }
    }
  ];

  // Pre-built reports
  const prebuiltReports = [
    {
      id: 1,
      name: 'Sales Performance Dashboard',
      description: 'Comprehensive overview of sales metrics and KPIs',
      category: 'Sales',
      type: 'dashboard',
      lastUpdated: '2 hours ago',
      views: 1247,
      favorite: true,
      charts: ['revenue_trend', 'pipeline_funnel', 'rep_performance'],
      insights: 8,
      thumbnail: 'dashboard'
    },
    {
      id: 2,
      name: 'Marketing Attribution Report',
      description: 'Track marketing channel performance and ROI',
      category: 'Marketing',
      type: 'report',
      lastUpdated: '4 hours ago',
      views: 892,
      favorite: false,
      charts: ['channel_performance', 'attribution_model', 'campaign_roi'],
      insights: 5,
      thumbnail: 'chart'
    },
    {
      id: 3,
      name: 'Customer Health Score',
      description: 'Monitor customer satisfaction and churn risk',
      category: 'Customer Success',
      type: 'scorecard',
      lastUpdated: '1 hour ago',
      views: 634,
      favorite: true,
      charts: ['health_distribution', 'churn_prediction', 'satisfaction_trends'],
      insights: 12,
      thumbnail: 'gauge'
    },
    {
      id: 4,
      name: 'Pipeline Velocity Analysis',
      description: 'Analyze deal progression and bottlenecks',
      category: 'Sales',
      type: 'analysis',
      lastUpdated: '6 hours ago',
      views: 445,
      favorite: false,
      charts: ['velocity_trends', 'stage_duration', 'conversion_rates'],
      insights: 7,
      thumbnail: 'flow'
    }
  ];

  // Sample chart data
  const salesData = [
    { month: 'Jan', revenue: 45000, target: 40000, deals: 23 },
    { month: 'Feb', revenue: 52000, target: 45000, deals: 28 },
    { month: 'Mar', revenue: 48000, target: 50000, deals: 25 },
    { month: 'Apr', revenue: 61000, target: 55000, deals: 32 },
    { month: 'May', revenue: 58000, target: 60000, deals: 29 },
    { month: 'Jun', revenue: 67000, target: 65000, deals: 35 }
  ];

  const channelData = [
    { name: 'Organic Search', value: 35, color: '#8884d8' },
    { name: 'Paid Ads', value: 28, color: '#82ca9d' },
    { name: 'Social Media', value: 18, color: '#ffc658' },
    { name: 'Email', value: 12, color: '#ff7300' },
    { name: 'Direct', value: 7, color: '#00ff88' }
  ];

  const pipelineData = [
    { stage: 'Lead', count: 450, value: 2250000 },
    { stage: 'Qualified', count: 280, value: 1680000 },
    { stage: 'Proposal', count: 120, value: 960000 },
    { stage: 'Negotiation', count: 45, value: 540000 },
    { stage: 'Closed Won', count: 28, value: 420000 }
  ];

  // Recent queries history
  const queryHistory = [
    { id: 1, query: "Show me top performing sales reps this quarter", timestamp: "2 hours ago", results: 15 },
    { id: 2, query: "What's our customer acquisition cost by channel?", timestamp: "4 hours ago", results: 8 },
    { id: 3, query: "Compare revenue growth year over year", timestamp: "1 day ago", results: 12 },
    { id: 4, query: "Which products have the highest profit margins?", timestamp: "2 days ago", results: 6 }
  ];

  // Report templates
  const reportTemplates = [
    {
      id: 1,
      name: 'Executive Summary',
      description: 'High-level KPIs and trends for leadership',
      category: 'Executive',
      estimatedTime: '5 minutes',
      complexity: 'Simple',
      sections: ['Revenue Overview', 'Key Metrics', 'Trends', 'Recommendations']
    },
    {
      id: 2,
      name: 'Sales Team Performance',
      description: 'Individual and team sales metrics',
      category: 'Sales',
      estimatedTime: '10 minutes',
      complexity: 'Medium',
      sections: ['Team Overview', 'Individual Performance', 'Pipeline Analysis', 'Forecasting']
    },
    {
      id: 3,
      name: 'Marketing ROI Analysis',
      description: 'Campaign performance and attribution analysis',
      category: 'Marketing',
      estimatedTime: '15 minutes',
      complexity: 'Advanced',
      sections: ['Campaign Performance', 'Attribution Model', 'ROI Calculation', 'Optimization']
    }
  ];

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      console.log('Generated report for:', query);
    }, 2000);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Implement voice recognition logic here
  };

  const handleSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'opportunity': return Target;
      case 'prediction': return Brain;
      default: return Info;
    }
  };

  const getInsightColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const ReportCard = ({ report }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{report.name}</h3>
              {report.favorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Badge variant="outline">{report.category}</Badge>
              <Badge variant="outline">{report.type}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-500">Views</div>
            <div className="font-semibold">{report.views.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500">Insights</div>
            <div className="font-semibold">{report.insights}</div>
          </div>
          <div>
            <div className="text-gray-500">Updated</div>
            <div className="font-semibold">{report.lastUpdated}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {report.charts.slice(0, 3).map((chart, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {chart.replace('_', ' ')}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const InsightCard = ({ insight }) => {
    const IconComponent = getInsightIcon(insight.type);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${getInsightColor(insight.impact)}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{insight.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                  <Badge variant="outline" className={getInsightColor(insight.impact)}>
                    {insight.impact} impact
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{insight.category}</span>
                <span>{insight.timestamp}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Reporting Engine</h2>
          <p className="text-gray-600">Ask questions in natural language and get instant insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Natural Language Query Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Ask me anything about your data</h3>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="e.g., Show me sales performance by region for the last quarter..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleVoiceToggle}
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleQuerySubmit} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Ask'}
              </Button>
            </div>

            {/* Sample Queries */}
            <div>
              <div className="text-sm text-gray-600 mb-2">Try these sample queries:</div>
              <div className="flex flex-wrap gap-2">
                {sampleQueries.slice(0, 4).map((sampleQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSampleQuery(sampleQuery)}
                    className="text-xs"
                  >
                    {sampleQuery}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Query History</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {/* Key Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Insights</p>
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-sm text-green-600">+12 this week</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Impact</p>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-red-600">Requires attention</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold">89%</p>
                    <p className="text-sm text-green-600">+2% improvement</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actions Taken</p>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-green-600">63% implementation rate</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Reports</h3>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'space-y-4'}>
            {prebuiltReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Report Templates</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline">{template.complexity}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Estimated setup: {template.estimatedTime}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Sections</div>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Channel Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pipelineData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Reports Created</span>
                    <span className="font-semibold">247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reports Viewed This Month</span>
                    <span className="font-semibold">1,834</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average View Time</span>
                    <span className="font-semibold">4m 32s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Most Popular Category</span>
                    <span className="font-semibold">Sales</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Insights Generated</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Query History</h3>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {queryHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{item.query}</div>
                        <div className="text-xs text-gray-500">
                          {item.results} results • {item.timestamp}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setQuery(item.query)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Rerun
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartReportingEngine;