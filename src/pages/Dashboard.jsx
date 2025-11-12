import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Users, 
  TrendingUp, 
  Target,
  Calendar,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Brain,
  MessageSquare,
  BarChart3,
  Zap,
  Building2,
  CheckSquare,
  Workflow,
  Plus,
  UserPlus,
  Activity,
  Award,
  Lightbulb,
  Bell
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PullToRefresh } from "@/components/TouchInteractions";
import { DashboardSkeleton, LoadingWithRetry } from "@/components/LoadingStates";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useEnhancedLeads, 
  useEnhancedDeals, 
  useEnhancedDashboardAnalytics, 
  useRealTimeNotifications 
} from '@/hooks/useEnhancedBusinessLogic';
import { useAILeadScoring, useAIDealInsights, useSalesForecasting } from '@/hooks/useAIFeatures';
import { 
  EnhancedButton, 
  EnhancedCard, 
  SmartNotification, 
  AnimatedStatCard as EnhancedAnimatedStatCard
} from '@/components/ui/EnhancedComponents';
import { cn } from '@/lib/utils';
import PredictiveAnalytics from "../components/PredictiveAnalytics";
import AIDashboardWidgets from "../components/AIDashboardWidgets";
import SmartNotifications from "../components/features/SmartNotifications";
import AIInsights from "../components/features/AIInsights";
import { 
  AnimatedCard, 
  AnimatedCounter, 
  StaggerContainer, 
  AnimatedProgressBar,
  AnimatedBadge,
  AnimatedButton 
} from "@/components/MicroInteractions";
import { 
  useContacts, 
  useDeals, 
  useLeads, 
  useTasks, 
  useAccounts, 
  useDashboardAnalytics 
} from "@/hooks/useBusinessLogic";
import base44 from "@/api/base44Client";
import performanceMonitor from "@/utils/performanceMonitor";

// Memoized AnimatedStatCard component
const AnimatedStatCard = memo(({ title, value, icon: Icon, subtitle, gradient }) => (
  <AnimatedCard className={`relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <CardTitle className="text-3xl font-bold mt-2 text-white">
            <AnimatedCounter value={typeof value === 'string' ? value : value} />
          </CardTitle>
          {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardHeader>
  </AnimatedCard>
));
AnimatedStatCard.displayName = 'AnimatedStatCard';

// Memoized chart components
const MemoizedPieChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));
MemoizedPieChart.displayName = 'MemoizedPieChart';

const MemoizedLineChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: 'none', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        formatter={(value) => `$${value.toLocaleString()}`}
      />
      <Line 
        type="monotone" 
        dataKey="revenue" 
        stroke="#10B981" 
        strokeWidth={3}
        dot={{ fill: '#10B981', r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
));
MemoizedLineChart.displayName = 'MemoizedLineChart';

const MemoizedBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <defs>
        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
      <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
      <YAxis />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: 'white', 
          border: 'none', 
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }} 
      />
      <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
));
MemoizedBarChart.displayName = 'MemoizedBarChart';

export default function Dashboard() {
  const { handleError } = useErrorHandler();
  
  // Enhanced hooks with AI capabilities
  const { data: enhancedLeads = [], analytics: leadAnalytics } = useEnhancedLeads();
  const { data: enhancedDeals = [], pipelineAnalytics } = useEnhancedDeals();
  const { analytics: dashboardAnalytics } = useEnhancedDashboardAnalytics();
  const { notifications, dismissNotification } = useRealTimeNotifications();
  
  // AI Features
  const { calculateLeadScore } = useAILeadScoring();
  const { analyzeDeals, predictRevenue } = useAIDealInsights();
  const { generateForecast } = useSalesForecasting();

  // Legacy hooks for compatibility
  const { data: legacyLeads = [], loading: leadsLoading, error: leadsError, refresh: refreshLeads } = useLeads();
  const { data: legacyContacts = [], loading: contactsLoading, error: contactsError, refresh: refreshContacts } = useContacts();
  const { data: legacyAccounts = [], loading: accountsLoading, error: accountsError, refresh: refreshAccounts } = useAccounts();
  const { 
    data: legacyDeals = [], 
    loading: dealsLoading, 
    error: dealsError, 
    refresh: refreshDeals,
    revenueMetrics,
    pipelineData 
  } = useDeals();
  const { 
    data: legacyTasks = [], 
    loading: tasksLoading, 
    error: tasksError, 
    refresh: refreshTasks,
    overdueTasks,
    upcomingTasks 
  } = useTasks();
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useDashboardAnalytics();

  // Combine data sources (enhanced + legacy) with safe fallbacks
  const combinedLeads = (Array.isArray(enhancedLeads) && enhancedLeads.length > 0)
    ? enhancedLeads
    : (Array.isArray(legacyLeads) ? legacyLeads : []);
  const combinedDeals = (Array.isArray(enhancedDeals) && enhancedDeals.length > 0)
    ? enhancedDeals
    : (Array.isArray(legacyDeals) ? legacyDeals : []);
  const combinedContacts = Array.isArray(legacyContacts) ? legacyContacts : [];
  const combinedTasks = Array.isArray(legacyTasks) ? legacyTasks : [];
  const combinedAccounts = Array.isArray(legacyAccounts) ? legacyAccounts : [];

  // Activities query
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      return await base44.entities.Activity.list();
    }
  });

  const isLoading = leadsLoading || contactsLoading || accountsLoading || dealsLoading || tasksLoading || metricsLoading;

  // Performance marks for dashboard mount and data loading
  useEffect(() => {
    try {
      performanceMonitor.mark('dashboard-mount');
      // Measure after first paint
      requestAnimationFrame(() => {
        performanceMonitor.measure('dashboard-mount');
      });
    } catch (err) {
      // Safe fallback if performance monitor is unavailable
      console.warn('Performance monitor mount mark failed:', err);
    }
  }, []);

  useEffect(() => {
    try {
      if (isLoading) {
        performanceMonitor.mark('dashboard-data-loading');
      } else {
        performanceMonitor.measure('dashboard-data-loading');
      }
    } catch (err) {
      console.warn('Performance monitor data loading mark failed:', err);
    }
  }, [isLoading]);
  const hasError = leadsError || contactsError || accountsError || dealsError || tasksError;

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refreshLeads(),
        refreshContacts(),
        refreshAccounts(),
        refreshDeals(),
        refreshTasks(),
        refreshMetrics()
      ]);
    } catch (error) {
      // Pass options object to useErrorHandler for correct behavior
      handleError(error, { customMessage: 'Failed to refresh dashboard data' });
    }
  };

  // Show loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry option
  if (hasError) {
    return (
      <div className="p-6 lg:p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
        <LoadingWithRetry
          message="Unable to load dashboard data"
          onRetry={handleRefreshAll}
          showRetry={true}
        />
      </div>
    );
  }

  // Enhanced metrics calculation with AI insights
  const enhancedMetrics = useMemo(() => {
    const totalLeads = combinedLeads.length;
    const activeContacts = combinedContacts.filter(contact => contact.status === 'Active').length;
    const totalDealsValue = revenueMetrics?.totalRevenue || combinedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const openDeals = combinedDeals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
    const wonDeals = combinedDeals.filter(d => d.stage === 'Closed Won');
    const wonDealsValue = revenueMetrics?.totalRevenue || wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const conversionRate = revenueMetrics?.conversionRate || (combinedLeads.length > 0 ? ((combinedLeads.filter(l => l.status === 'Converted').length / combinedLeads.length) * 100).toFixed(1) : 0);
    const pendingTasks = combinedTasks.filter(t => t.status !== 'Completed').length;
    
    // AI-enhanced metrics
    const qualifiedLeads = leadAnalytics?.qualifiedLeads || 0;
    const aiConversionRate = leadAnalytics?.conversionRate || conversionRate;
    const winRate = pipelineAnalytics?.winRate || 0;
    const averageDealSize = pipelineAnalytics?.averageDealSize || 0;

    return {
      totalLeads,
      activeContacts,
      totalDealsValue,
      openDeals: openDeals.length,
      wonDealsValue,
      conversionRate: aiConversionRate,
      pendingTasks,
      qualifiedLeads,
      winRate,
      averageDealSize
    };
  }, [combinedLeads, combinedContacts, combinedDeals, combinedTasks, leadAnalytics, pipelineAnalytics, revenueMetrics]);

  const getStatusColor = (status) => {
    const colors = {
      'New': '#6366F1',
      'Contacted': '#8B5CF6',
      'Qualified': '#10B981',
      'Converted': '#F59E0B',
      'Unqualified': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  // Enhanced chart data with AI insights
  const chartData = useMemo(() => {
    // Lead status distribution with AI enhancement
    const leadStatusData = leadAnalytics?.statusDistribution ? 
      Object.entries(leadAnalytics.statusDistribution).map(([status, count]) => ({
        name: status,
        value: count,
        color: getStatusColor(status)
      })) : [
        { name: 'New', value: combinedLeads.filter(l => l.status === 'New').length, color: '#6366F1' },
        { name: 'Contacted', value: combinedLeads.filter(l => l.status === 'Contacted').length, color: '#8B5CF6' },
        { name: 'Qualified', value: combinedLeads.filter(l => l.status === 'Qualified').length, color: '#10B981' },
        { name: 'Converted', value: combinedLeads.filter(l => l.status === 'Converted').length, color: '#F59E0B' },
      ];

    return { leadStatusData };
  }, [combinedLeads, leadAnalytics]);

  const leadStatusData = chartData.leadStatusData;

  // Deal pipeline data - use the new pipelineData if available
  const pipelineChartData = pipelineData && Object.keys(pipelineData).length > 0 
    ? Object.entries(pipelineData).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value
      }))
    : [
        { stage: 'Prospecting', count: combinedDeals.filter(d => d.stage === 'Prospecting').length },
        { stage: 'Qualification', count: combinedDeals.filter(d => d.stage === 'Qualification').length },
        { stage: 'Proposal', count: combinedDeals.filter(d => d.stage === 'Proposal').length },
        { stage: 'Negotiation', count: combinedDeals.filter(d => d.stage === 'Negotiation').length },
        { stage: 'Closed Won', count: combinedDeals.filter(d => d.stage === 'Closed Won').length },
      ];

  // Monthly revenue trend
  const revenueData = [
    { month: 'Jan', revenue: enhancedMetrics.wonDealsValue * 0.6 },
    { month: 'Feb', revenue: enhancedMetrics.wonDealsValue * 0.7 },
    { month: 'Mar', revenue: enhancedMetrics.wonDealsValue * 0.85 },
    { month: 'Apr', revenue: enhancedMetrics.wonDealsValue },
  ];

  return (
    <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="p-6 lg:p-8 space-y-6 bg-gray-50">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your sales overview</p>
        </div>

      {/* Stats Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedStatCard
          title="Total Leads"
          value={enhancedMetrics.totalLeads}
          icon={Sparkles}
          subtitle={`${enhancedMetrics.conversionRate}% conversion rate`}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
        />
        <AnimatedStatCard
          title="Active Contacts"
          value={enhancedMetrics.activeContacts}
          icon={Users}
          subtitle={`${combinedAccounts.length} accounts`}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <AnimatedStatCard
          title="Pipeline Value"
          value={`$${enhancedMetrics.totalDealsValue.toLocaleString()}`}
          icon={TrendingUp}
          subtitle={`${enhancedMetrics.openDeals} open deals`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <AnimatedStatCard
          title="Pending Tasks"
          value={enhancedMetrics.pendingTasks}
          icon={Calendar}
          subtitle={`${combinedTasks.length} total tasks`}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
      </StaggerContainer>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Pipeline */}
        <AnimatedCard className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="w-5 h-5 text-indigo-500" />
              Sales Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedBarChart data={pipelineData} />
          </CardContent>
        </AnimatedCard>

        {/* Lead Status Distribution */}
        <AnimatedCard className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Lead Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemoizedPieChart data={leadStatusData} />
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Revenue Trend with AI Forecasting */}
      <AnimatedCard className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Revenue Trend & AI Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemoizedLineChart data={revenueData} />
          {dashboardAnalytics?.forecast && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">
                AI Forecast: ${dashboardAnalytics.forecast.nextMonth?.toLocaleString()} projected for next month
              </p>
            </div>
          )}
        </CardContent>
      </AnimatedCard>

      {/* Smart Features Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Notifications with Real-time Updates */}
        <AnimatedCard className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Bell className="w-5 h-5 text-blue-500" />
              Smart Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <SmartNotification
                  key={notification.id}
                  notification={notification}
                  onDismiss={() => dismissNotification(notification.id)}
                />
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-500 text-center py-4">No new notifications</p>
              )}
            </div>
          </CardContent>
        </AnimatedCard>
        
        {/* AI Insights with Enhanced Analytics */}
        <div className="lg:col-span-2">
          <AnimatedCard className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadAnalytics?.insights && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Lead Intelligence</h4>
                    <ul className="space-y-1 text-sm text-purple-700">
                      {leadAnalytics.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {pipelineAnalytics?.recommendations && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Pipeline Optimization</h4>
                    <ul className="space-y-1 text-sm text-emerald-700">
                      {pipelineAnalytics.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </AnimatedCard>
        </div>
      </div>

      {/* Predictive Analytics with AI Forecasting */}
      <AnimatedCard className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Predictive Analytics & Forecasting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
              <h4 className="font-semibold text-indigo-800 mb-2">Sales Forecast</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-600">Next Month</span>
                  <span className="font-medium text-indigo-800">
                    ${dashboardAnalytics?.forecast?.nextMonth?.toLocaleString() || 'Calculating...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-600">Next Quarter</span>
                  <span className="font-medium text-indigo-800">
                    ${dashboardAnalytics?.forecast?.nextQuarter?.toLocaleString() || 'Calculating...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">Risk Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-amber-600">At Risk Deals</span>
                  <span className="font-medium text-amber-800">
                    {pipelineAnalytics?.atRiskDeals || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-amber-600">Win Probability</span>
                  <span className="font-medium text-amber-800">
                    {enhancedMetrics.winRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Advanced CRM Features Quick Access with Enhanced UI */}
      <AnimatedCard className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI-Powered CRM Features
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Access advanced AI capabilities to supercharge your sales process
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              onClick={() => window.location.href = '/AILeadQualification'}
            >
              <Brain className="w-6 h-6 mb-2" />
              <span className="font-semibold">AI Lead Qualification</span>
              <span className="text-xs opacity-90 mt-1">
                Automatically score and qualify leads using AI
              </span>
            </EnhancedButton>

            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              onClick={() => window.location.href = '/IntelligentDealInsights'}
            >
              <Target className="w-6 h-6 mb-2" />
              <span className="font-semibold">Deal Intelligence</span>
              <span className="text-xs opacity-90 mt-1">
                Get AI-powered insights on deal progression
              </span>
            </EnhancedButton>

            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              onClick={() => window.location.href = '/ConversationalAI'}
            >
              <MessageSquare className="w-6 h-6 mb-2" />
              <span className="font-semibold">Conversational AI</span>
              <span className="text-xs opacity-90 mt-1">
                AI-powered customer communication
              </span>
            </EnhancedButton>

            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              onClick={() => window.location.href = '/RealTimeBI'}
            >
              <BarChart3 className="w-6 h-6 mb-2" />
              <span className="font-semibold">Real-Time BI</span>
              <span className="text-xs opacity-90 mt-1">
                Advanced business intelligence dashboard
              </span>
            </EnhancedButton>

            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => window.location.href = '/WorkflowAutomation'}
            >
              <Workflow className="w-6 h-6 mb-2" />
              <span className="font-semibold">Smart Automation</span>
              <span className="text-xs opacity-90 mt-1">
                Automate repetitive sales tasks
              </span>
            </EnhancedButton>

            <EnhancedButton
              variant="gradient"
              size="lg"
              className="h-auto p-4 flex-col items-start text-left bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
              onClick={() => window.location.href = '/PredictiveAnalytics'}
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <span className="font-semibold">Predictive Analytics</span>
              <span className="text-xs opacity-90 mt-1">
                Forecast sales and identify trends
              </span>
            </EnhancedButton>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Quick Actions with Enhanced Interactions */}
      <AnimatedCard className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Zap className="w-5 h-5 text-orange-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              onClick={() => window.location.href = '/leads/new'}
            >
              <UserPlus className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium">Add Lead</span>
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              onClick={() => window.location.href = '/contacts/new'}
            >
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium">Add Contact</span>
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
              onClick={() => window.location.href = '/deals/new'}
            >
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium">New Deal</span>
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
              onClick={() => window.location.href = '/tasks/new'}
            >
              <Calendar className="w-6 h-6 text-amber-600" />
              <span className="text-sm font-medium">Schedule Task</span>
            </EnhancedButton>
          </div>
        </CardContent>
      </AnimatedCard>
      </div>
    </PullToRefresh>
  );
}
