import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Sparkles,
  Building2,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from "date-fns";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list(),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  // Calculate metrics
  const totalDealsValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const lostDeals = deals.filter(d => d.stage === 'Closed Lost');
  const wonDealsValue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const winRate = (wonDeals.length + lostDeals.length) > 0 
    ? ((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100).toFixed(1)
    : 0;
  const avgDealSize = wonDeals.length > 0 ? (wonDealsValue / wonDeals.length).toFixed(0) : 0;
  const conversionRate = leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1) : 0;

  // Lead funnel data with conversion rates
  const leadFunnelData = [
    { 
      stage: 'New Leads', 
      count: leads.filter(l => l.status === 'New').length,
      rate: 100
    },
    { 
      stage: 'Contacted', 
      count: leads.filter(l => l.status === 'Contacted').length,
      rate: leads.length > 0 ? ((leads.filter(l => l.status === 'Contacted').length / leads.length) * 100).toFixed(1) : 0
    },
    { 
      stage: 'Qualified', 
      count: leads.filter(l => l.status === 'Qualified').length,
      rate: leads.length > 0 ? ((leads.filter(l => l.status === 'Qualified').length / leads.length) * 100).toFixed(1) : 0
    },
    { 
      stage: 'Converted', 
      count: leads.filter(l => l.status === 'Converted').length,
      rate: conversionRate
    },
  ];

  // Deal pipeline by stage with value and count
  const pipelineData = [
    { 
      stage: 'Prospecting', 
      value: deals.filter(d => d.stage === 'Prospecting').reduce((sum, d) => sum + (d.amount || 0), 0),
      count: deals.filter(d => d.stage === 'Prospecting').length,
      avgProbability: deals.filter(d => d.stage === 'Prospecting').reduce((sum, d) => sum + (d.probability || 0), 0) / (deals.filter(d => d.stage === 'Prospecting').length || 1)
    },
    { 
      stage: 'Qualification', 
      value: deals.filter(d => d.stage === 'Qualification').reduce((sum, d) => sum + (d.amount || 0), 0),
      count: deals.filter(d => d.stage === 'Qualification').length,
      avgProbability: deals.filter(d => d.stage === 'Qualification').reduce((sum, d) => sum + (d.probability || 0), 0) / (deals.filter(d => d.stage === 'Qualification').length || 1)
    },
    { 
      stage: 'Proposal', 
      value: deals.filter(d => d.stage === 'Proposal').reduce((sum, d) => sum + (d.amount || 0), 0),
      count: deals.filter(d => d.stage === 'Proposal').length,
      avgProbability: deals.filter(d => d.stage === 'Proposal').reduce((sum, d) => sum + (d.probability || 0), 0) / (deals.filter(d => d.stage === 'Proposal').length || 1)
    },
    { 
      stage: 'Negotiation', 
      value: deals.filter(d => d.stage === 'Negotiation').reduce((sum, d) => sum + (d.amount || 0), 0),
      count: deals.filter(d => d.stage === 'Negotiation').length,
      avgProbability: deals.filter(d => d.stage === 'Negotiation').reduce((sum, d) => sum + (d.probability || 0), 0) / (deals.filter(d => d.stage === 'Negotiation').length || 1)
    },
    { 
      stage: 'Closed Won', 
      value: wonDealsValue,
      count: wonDeals.length,
      avgProbability: 100
    },
  ];

  // Monthly revenue trend (last 12 months)
  const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    const monthDeals = deals.filter(d => {
      const closeDate = d.actual_close_date || d.expected_close_date;
      if (!closeDate) return false;
      const dealDate = new Date(closeDate);
      return dealDate.getMonth() === date.getMonth() && dealDate.getFullYear() === date.getFullYear();
    });
    
    const won = monthDeals.filter(d => d.stage === 'Closed Won');
    const revenue = won.reduce((sum, d) => sum + (d.amount || 0), 0);
    const pipeline = monthDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((sum, d) => sum + (d.amount || 0), 0);
    
    return {
      month: format(date, 'MMM yy'),
      revenue: revenue,
      pipeline: pipeline,
      deals: won.length
    };
  });

  // Lead source analysis
  const leadSourceData = [
    { name: 'Website', value: leads.filter(l => l.lead_source === 'Website').length, color: '#6366F1' },
    { name: 'Referral', value: leads.filter(l => l.lead_source === 'Referral').length, color: '#8B5CF6' },
    { name: 'Cold Call', value: leads.filter(l => l.lead_source === 'Cold Call').length, color: '#10B981' },
    { name: 'Social Media', value: leads.filter(l => l.lead_source === 'Social Media').length, color: '#F59E0B' },
    { name: 'Event', value: leads.filter(l => l.lead_source === 'Event').length, color: '#EF4444' },
    { name: 'Partner', value: leads.filter(l => l.lead_source === 'Partner').length, color: '#EC4899' },
    { name: 'Other', value: leads.filter(l => l.lead_source === 'Other').length, color: '#14B8A6' },
  ].filter(s => s.value > 0);

  // Sales rep performance
  const repPerformance = users
    .filter(u => u.is_active)
    .map(user => {
      const userDeals = deals.filter(d => d.owner_email === user.email);
      const userWonDeals = userDeals.filter(d => d.stage === 'Closed Won');
      const userLostDeals = userDeals.filter(d => d.stage === 'Closed Lost');
      const revenue = userWonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
      const winRate = (userWonDeals.length + userLostDeals.length) > 0 
        ? ((userWonDeals.length / (userWonDeals.length + userLostDeals.length)) * 100).toFixed(1)
        : 0;

      return {
        name: user.full_name,
        revenue: revenue,
        deals: userWonDeals.length,
        winRate: parseFloat(winRate),
        pipeline: userDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).reduce((sum, d) => sum + (d.amount || 0), 0)
      };
    })
    .filter(u => u.revenue > 0 || u.pipeline > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Activity breakdown
  const activityData = [
    { name: 'Calls', value: activities.filter(a => a.activity_type === 'Call').length, color: '#3b82f6' },
    { name: 'Meetings', value: activities.filter(a => a.activity_type === 'Meeting').length, color: '#8b5cf6' },
    { name: 'Emails', value: activities.filter(a => a.activity_type === 'Email').length, color: '#10b981' },
    { name: 'Tasks', value: activities.filter(a => a.activity_type === 'Task').length, color: '#f59e0b' },
    { name: 'Visits', value: activities.filter(a => a.activity_type === 'Visit').length, color: '#ef4444' },
  ].filter(a => a.value > 0);

  // Account industry breakdown
  const industryData = accounts.reduce((acc, account) => {
    const industry = account.industry || 'Other';
    const existing = acc.find(i => i.name === industry);
    if (existing) {
      existing.value += 1;
      existing.revenue += deals.filter(d => d.account_id === account.id && d.stage === 'Closed Won').reduce((sum, d) => sum + (d.amount || 0), 0);
    } else {
      acc.push({
        name: industry,
        value: 1,
        revenue: deals.filter(d => d.account_id === account.id && d.stage === 'Closed Won').reduce((sum, d) => sum + (d.amount || 0), 0)
      });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Campaign ROI
  const campaignROI = campaigns.map(c => ({
    name: c.campaign_name,
    budget: c.budget || 0,
    revenue: c.expected_revenue || 0,
    leads: c.total_leads || 0,
    roi: c.budget > 0 ? (((c.expected_revenue || 0) - c.budget) / c.budget * 100).toFixed(1) : 0
  })).filter(c => c.budget > 0).slice(0, 5);

  // Deal velocity (avg days to close)
  const closedDealsWithDates = wonDeals.filter(d => d.created_date && d.actual_close_date);
  const avgDaysToClose = closedDealsWithDates.length > 0
    ? closedDealsWithDates.reduce((sum, d) => {
        const created = new Date(d.created_date);
        const closed = new Date(d.actual_close_date);
        return sum + ((closed - created) / (1000 * 60 * 60 * 24));
      }, 0) / closedDealsWithDates.length
    : 0;

  // Lead score distribution
  const leadScoreData = [
    { range: '0-20', count: leads.filter(l => (l.lead_score || 0) <= 20).length },
    { range: '21-40', count: leads.filter(l => (l.lead_score || 0) > 20 && (l.lead_score || 0) <= 40).length },
    { range: '41-60', count: leads.filter(l => (l.lead_score || 0) > 40 && (l.lead_score || 0) <= 60).length },
    { range: '61-80', count: leads.filter(l => (l.lead_score || 0) > 60 && (l.lead_score || 0) <= 80).length },
    { range: '81-100', count: leads.filter(l => (l.lead_score || 0) > 80).length },
  ];

  // Sales radar (multi-metric performance)
  const salesRadarData = [
    { metric: 'Revenue', value: (wonDealsValue / (totalDealsValue || 1)) * 100 },
    { metric: 'Win Rate', value: parseFloat(winRate) },
    { metric: 'Activity', value: Math.min((activities.length / (users.length * 10)) * 100, 100) },
    { metric: 'Lead Conv.', value: parseFloat(conversionRate) },
    { metric: 'Pipeline', value: Math.min((deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage)).length / deals.length) * 100, 100) },
  ];

  const exportReport = () => {
    const reportData = {
      summary: {
        totalLeads: leads.length,
        totalDeals: deals.length,
        wonDeals: wonDeals.length,
        totalRevenue: wonDealsValue,
        winRate: winRate,
        conversionRate: conversionRate,
        avgDealSize: avgDealSize,
        avgDaysToClose: avgDaysToClose.toFixed(1),
      },
      pipeline: pipelineData,
      monthlyRevenue: monthlyRevenueData,
      repPerformance: repPerformance,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm-analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-purple-500" />
            Analytics & Reports
          </h1>
          <p className="text-gray-500 mt-1">Comprehensive insights into your sales performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">${(wonDealsValue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/70 mt-1">{wonDeals.length} deals won</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-white">{winRate}%</p>
            <p className="text-xs text-white/70 mt-1">{wonDeals.length}W / {lostDeals.length}L</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Avg Deal Size</p>
            </div>
            <p className="text-2xl font-bold text-white">${(avgDealSize / 1000).toFixed(0)}K</p>
            <p className="text-xs text-white/70 mt-1">Per closed deal</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Lead Conv. Rate</p>
            </div>
            <p className="text-2xl font-bold text-white">{conversionRate}%</p>
            <p className="text-xs text-white/70 mt-1">{leads.filter(l => l.status === 'Converted').length} converted</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Avg Days to Close</p>
            </div>
            <p className="text-2xl font-bold text-white">{avgDaysToClose.toFixed(0)}</p>
            <p className="text-xs text-white/70 mt-1">Sales cycle</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-pink-500 to-pink-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Activities</p>
            </div>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
            <p className="text-xs text-white/70 mt-1">{(activities.length / Math.max(users.length, 1)).toFixed(0)} per rep</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different report views */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-indigo-500" />
                  Revenue Trend (12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPipeline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366F1" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pipeline" 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorPipeline)"
                      name="Pipeline"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-500" />
                  Revenue by Industry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                Campaign ROI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={campaignROI}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="budget" fill="#8B5CF6" name="Budget" />
                  <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#EF4444" name="ROI %" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Pipeline by Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={pipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => 
                      name === 'value' ? `$${(value / 1000).toFixed(0)}K` : value
                    } />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" fill="#8B5CF6" name="Value" radius={[8, 8, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10B981" name="Count" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Pipeline Health Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pipelineData.map((stage, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{stage.count} deals</Badge>
                        <span className="text-sm font-bold text-green-600">
                          ${(stage.value / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${stage.avgProbability}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{stage.avgProbability.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Lead Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadFunnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]}>
                      {leadFunnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {leadFunnelData.map((stage, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{stage.stage}</span>
                      <span className="font-semibold text-indigo-600">{stage.rate}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Lead Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={leadScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Activity Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Sales Rep Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Rep</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deals Won</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Win Rate</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {repPerformance.map((rep, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-amber-500' :
                            idx === 1 ? 'bg-gray-400' :
                            idx === 2 ? 'bg-orange-600' :
                            'bg-indigo-500'
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{rep.name}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          ${(rep.revenue / 1000).toFixed(0)}K
                        </td>
                        <td className="px-4 py-3 text-right">{rep.deals}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge className={
                            rep.winRate >= 50 ? 'bg-green-100 text-green-700' :
                            rep.winRate >= 30 ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {rep.winRate}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                          ${(rep.pipeline / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Top Performers Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repPerformance.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366F1" name="Revenue" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pipeline" fill="#10B981" name="Pipeline" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Sales Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={salesRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar 
                      name="Performance" 
                      dataKey="value" 
                      stroke="#6366F1" 
                      fill="#6366F1" 
                      fillOpacity={0.6} 
                    />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Achievement</span>
                    <span className="text-sm font-bold text-green-600">
                      {wonDealsValue > 0 ? '100%' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Win Rate</span>
                    <span className="text-sm font-bold text-blue-600">{winRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${winRate}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lead Conversion</span>
                    <span className="text-sm font-bold text-purple-600">{conversionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${conversionRate}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Activity Level</span>
                    <span className="text-sm font-bold text-amber-600">
                      {Math.min((activities.length / (users.length * 10)) * 100, 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((activities.length / (users.length * 10)) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">${(avgDealSize / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Avg Close Time</p>
                    <p className="text-2xl font-bold text-gray-900">{avgDaysToClose.toFixed(0)} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}