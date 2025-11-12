import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Brain, 
  Zap,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Maximize2,
  Calendar,
  Globe,
  Smartphone,
  MessageSquare,
  Shield,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
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
  Radar
} from 'recharts';
import { useEnhancedDashboardAnalytics } from '@/hooks/useEnhancedBusinessLogic';
import { useAILeadScoring, useAIDealInsights, useSalesForecasting } from '@/hooks/useAIFeatures';

const BusinessIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'leads', 'conversion', 'satisfaction']);

  const { data: businessData, isLoading } = useEnhancedDashboardAnalytics();
  const leadScoring = useAILeadScoring();
  const dealInsights = useAIDealInsights();
  const forecasting = useSalesForecasting();
  
  // Combine AI insights for compatibility
  const aiInsights = leadScoring.insights || [];
  const predictiveAnalytics = forecasting.analytics || {};

  // Mock comprehensive business intelligence data
  const biData = useMemo(() => ({
    kpis: {
      revenue: { value: 2847500, change: 12.5, trend: 'up' },
      leads: { value: 1247, change: -3.2, trend: 'down' },
      conversion: { value: 24.8, change: 8.7, trend: 'up' },
      satisfaction: { value: 4.6, change: 0.3, trend: 'up' },
      churn: { value: 2.1, change: -15.2, trend: 'down' },
      ltv: { value: 12450, change: 18.9, trend: 'up' }
    },
    revenueData: [
      { month: 'Jan', revenue: 2100000, forecast: 2200000, target: 2000000 },
      { month: 'Feb', revenue: 2300000, forecast: 2400000, target: 2200000 },
      { month: 'Mar', revenue: 2500000, forecast: 2600000, target: 2400000 },
      { month: 'Apr', revenue: 2700000, forecast: 2800000, target: 2600000 },
      { month: 'May', revenue: 2847500, forecast: 2900000, target: 2800000 },
    ],
    leadFunnelData: [
      { stage: 'Visitors', count: 15420, conversion: 100 },
      { stage: 'Leads', count: 3084, conversion: 20 },
      { stage: 'Qualified', count: 1542, conversion: 50 },
      { stage: 'Opportunities', count: 617, conversion: 40 },
      { stage: 'Customers', count: 185, conversion: 30 }
    ],
    customerSegments: [
      { name: 'Enterprise', value: 45, revenue: 1278375, color: '#8b5cf6' },
      { name: 'Mid-Market', value: 35, revenue: 996625, color: '#06b6d4' },
      { name: 'SMB', value: 20, revenue: 569500, color: '#10b981' }
    ],
    aiInsights: [
      {
        type: 'opportunity',
        title: 'Revenue Optimization Opportunity',
        description: 'AI detected 23% increase potential in Enterprise segment',
        impact: 'high',
        confidence: 89,
        action: 'Focus on upselling existing Enterprise clients'
      },
      {
        type: 'warning',
        title: 'Churn Risk Alert',
        description: '12 high-value customers showing early churn signals',
        impact: 'critical',
        confidence: 94,
        action: 'Immediate intervention required'
      },
      {
        type: 'trend',
        title: 'Market Trend Analysis',
        description: 'Mobile engagement increased 45% this quarter',
        impact: 'medium',
        confidence: 76,
        action: 'Enhance mobile experience features'
      }
    ],
    performanceMetrics: [
      { metric: 'Sales Velocity', current: 85, target: 90, unit: 'days' },
      { metric: 'Lead Response Time', current: 2.3, target: 2.0, unit: 'hours' },
      { metric: 'Deal Close Rate', current: 24.8, target: 25.0, unit: '%' },
      { metric: 'Customer Acquisition Cost', current: 245, target: 200, unit: '$' },
      { metric: 'Monthly Recurring Revenue', current: 125000, target: 130000, unit: '$' }
    ],
    teamPerformance: [
      { name: 'Sales Team A', performance: 95, deals: 45, revenue: 890000 },
      { name: 'Sales Team B', performance: 87, deals: 38, revenue: 720000 },
      { name: 'Sales Team C', performance: 92, deals: 42, revenue: 810000 },
      { name: 'Marketing Team', performance: 89, leads: 1247, conversion: 24.8 }
    ]
  }), [timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const MetricCard = ({ title, value, change, trend, icon: Icon, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val}%`;
      if (format === 'rating') return `${val}/5`;
      return val.toLocaleString();
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden"
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                trend === 'up' ? 'bg-green-100 text-green-600' : 
                trend === 'down' ? 'bg-red-100 text-red-600' : 
                'bg-blue-100 text-blue-600'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                trend === 'up' ? 'bg-green-100 text-green-700' : 
                trend === 'down' ? 'bg-red-100 text-red-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                 trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : 
                 <Activity className="w-4 h-4" />}
                {Math.abs(change)}%
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatValue(value)}
              </h3>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const AIInsightCard = ({ insight }) => {
    const getInsightIcon = (type) => {
      switch (type) {
        case 'opportunity': return <Lightbulb className="w-5 h-5" />;
        case 'warning': return <AlertTriangle className="w-5 h-5" />;
        case 'trend': return <TrendingUp className="w-5 h-5" />;
        default: return <Brain className="w-5 h-5" />;
      }
    };

    const getInsightColor = (impact) => {
      switch (impact) {
        case 'critical': return 'border-red-200 bg-red-50';
        case 'high': return 'border-orange-200 bg-orange-50';
        case 'medium': return 'border-blue-200 bg-blue-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-4 rounded-lg border-2 ${getInsightColor(insight.impact)} hover:shadow-md transition-all duration-200`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            insight.impact === 'critical' ? 'bg-red-100 text-red-600' :
            insight.impact === 'high' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {getInsightIcon(insight.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
              <Badge variant="outline" className="text-xs">
                {insight.confidence}% confidence
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{insight.action}</span>
              <Button size="sm" variant="outline" className="text-xs">
                Take Action
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and analytics for data-driven decisions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricCard
          title="Total Revenue"
          value={biData.kpis.revenue.value}
          change={biData.kpis.revenue.change}
          trend={biData.kpis.revenue.trend}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Active Leads"
          value={biData.kpis.leads.value}
          change={biData.kpis.leads.change}
          trend={biData.kpis.leads.trend}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={biData.kpis.conversion.value}
          change={biData.kpis.conversion.change}
          trend={biData.kpis.conversion.trend}
          icon={Target}
          format="percentage"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={biData.kpis.satisfaction.value}
          change={biData.kpis.satisfaction.change}
          trend={biData.kpis.satisfaction.trend}
          icon={CheckCircle}
          format="rating"
        />
        <MetricCard
          title="Churn Rate"
          value={biData.kpis.churn.value}
          change={biData.kpis.churn.change}
          trend={biData.kpis.churn.trend}
          icon={AlertTriangle}
          format="percentage"
        />
        <MetricCard
          title="Customer LTV"
          value={biData.kpis.ltv.value}
          change={biData.kpis.ltv.change}
          trend={biData.kpis.ltv.trend}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend & Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={biData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Actual Revenue" />
                    <Line type="monotone" dataKey="forecast" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                    <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={biData.customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {biData.customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Lead Funnel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Sales Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {biData.leadFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{stage.count.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">{stage.conversion}%</span>
                      </div>
                      <Progress value={stage.conversion} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI-Powered Insights
              </h3>
              {biData.aiInsights.map((insight, index) => (
                <AIInsightCard key={index} insight={insight} />
              ))}
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biData.performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <span className="text-sm text-gray-600">
                          {metric.current}{metric.unit} / {metric.target}{metric.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(metric.current / metric.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessIntelligenceDashboard;