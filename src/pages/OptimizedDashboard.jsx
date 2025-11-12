import React, { Suspense, lazy, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { memo } from "react";
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
  Plus,
  UserPlus,
  Activity,
  Award,
  Lightbulb,
  Bell,
  Gauge
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PullToRefresh } from "@/components/TouchInteractions";
import { DashboardSkeleton, LoadingWithRetry } from "@/components/LoadingStates";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useOptimizedContacts,
  useOptimizedDeals,
  useOptimizedLeads,
  useOptimizedTasks,
  useOptimizedAccounts,
  useOptimizedDashboardAnalytics,
  usePerformanceMonitor
} from '@/hooks/useOptimizedBusinessLogic';
import { usePerformanceMonitor as usePerformanceHook } from '@/utils/performanceMonitor';
import { 
  EnhancedButton, 
  EnhancedCard, 
  SmartNotification, 
  AnimatedStatCard as EnhancedAnimatedStatCard
} from '@/components/ui/EnhancedComponents';
import { cn } from '@/lib/utils';
import { 
  AnimatedCard, 
  AnimatedCounter, 
  StaggerContainer, 
  AnimatedProgressBar,
  AnimatedBadge,
  AnimatedButton 
} from "@/components/MicroInteractions";

// Lazy load heavy components for better performance
const PredictiveAnalytics = lazy(() => import("../components/PredictiveAnalytics"));
const AIDashboardWidgets = lazy(() => import("../components/AIDashboardWidgets"));
const SmartNotifications = lazy(() => import("../components/features/SmartNotifications"));
const AIInsights = lazy(() => import("../components/features/AIInsights"));

// Memoized Performance Monitor Component
const PerformanceMonitor = memo(() => {
  const { metrics, isMonitoring, startMonitoring, stopMonitoring, generateReport } = usePerformanceHook();

  return (
    <AnimatedCard className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Gauge className="w-5 h-5 text-blue-500" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {metrics.api && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.api.averageResponseTime}ms</div>
              <div className="text-xs text-gray-600">Avg API Response</div>
            </div>
          )}
          {metrics.memory && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.memory.used}MB</div>
              <div className="text-xs text-gray-600">Memory Usage</div>
            </div>
          )}
          {metrics.render && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.render.averageRenderTime}ms</div>
              <div className="text-xs text-gray-600">Avg Render Time</div>
            </div>
          )}
          {metrics.resources && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.resources.totalSize}KB</div>
              <div className="text-xs text-gray-600">Bundle Size</div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? "Stop" : "Start"} Monitoring
          </Button>
          <Button size="sm" variant="outline" onClick={generateReport}>
            Generate Report
          </Button>
        </div>
      </CardContent>
    </AnimatedCard>
  );
});
PerformanceMonitor.displayName = 'PerformanceMonitor';

// Memoized AnimatedStatCard component with enhanced performance
const AnimatedStatCard = memo(({ title, value, icon: Icon, subtitle, gradient, trend }) => (
  <AnimatedCard className={`relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <CardTitle className="text-3xl font-bold mt-2 text-white">
            <AnimatedCounter value={typeof value === 'string' ? value : value} />
          </CardTitle>
          {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.direction === 'up' ? 'text-green-200' : trend.direction === 'down' ? 'text-red-200' : 'text-white/70'}`}>
              <TrendingUp className={`w-3 h-3 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
              <span>{trend.percentage}% vs last period</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardHeader>
  </AnimatedCard>
));
AnimatedStatCard.displayName = 'AnimatedStatCard';

// Memoized chart components with performance optimizations
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
        animationBegin={0}
        animationDuration={800}
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
        animationDuration={1000}
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
      <Bar 
        dataKey="count" 
        fill="url(#colorGradient)" 
        radius={[8, 8, 0, 0]}
        animationDuration={800}
      />
    </BarChart>
  </ResponsiveContainer>
));
MemoizedBarChart.displayName = 'MemoizedBarChart';

export default function OptimizedDashboard() {
  const { handleError } = useErrorHandler();
  
  // Optimized hooks with intelligent caching
  const { 
    data: contacts = [], 
    loading: contactsLoading, 
    error: contactsError, 
    refresh: refreshContacts,
    totalCount: contactsCount,
    searchContacts,
    getContactsByAccount
  } = useOptimizedContacts();

  const { 
    data: deals = [], 
    loading: dealsLoading, 
    error: dealsError, 
    refresh: refreshDeals,
    pipelineData,
    revenueMetrics,
    getDealsByStage,
    totalCount: dealsCount
  } = useOptimizedDeals();

  const { 
    data: leads = [], 
    loading: leadsLoading, 
    error: leadsError, 
    refresh: refreshLeads,
    getLeadsByStatus,
    getLeadsBySource,
    convertLead,
    totalCount: leadsCount
  } = useOptimizedLeads();

  const { 
    data: tasks = [], 
    loading: tasksLoading, 
    error: tasksError, 
    refresh: refreshTasks,
    getTasksByStatus,
    getOverdueTasks,
    totalCount: tasksCount
  } = useOptimizedTasks();

  const { 
    data: accounts = [], 
    loading: accountsLoading, 
    error: accountsError, 
    refresh: refreshAccounts,
    totalCount: accountsCount
  } = useOptimizedAccounts();

  const { 
    data: dashboardData = {}, 
    loading: dashboardLoading, 
    error: dashboardError, 
    refresh: refreshDashboard 
  } = useOptimizedDashboardAnalytics();

  // Performance monitoring
  const performanceMetrics = usePerformanceMonitor();

  // Memoized calculations for better performance
  const enhancedMetrics = useMemo(() => {
    const activeContacts = contacts.filter(c => c.status === 'Active').length;
    const openDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
    const wonDeals = deals.filter(d => d.stage === 'Closed Won');
    const totalDealsValue = openDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const wonDealsValue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const conversionRate = leads.length > 0 ? ((wonDeals.length / leads.length) * 100).toFixed(1) : 0;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

    return {
      totalLeads: leadsCount || leads.length,
      activeContacts,
      totalDealsValue,
      openDeals: openDeals.length,
      wonDealsValue,
      conversionRate: parseFloat(conversionRate),
      pendingTasks,
      overdueTasks,
      totalAccounts: accountsCount || accounts.length,
      totalTasks: tasksCount || tasks.length,
      // Performance trends (mock data for demo)
      trends: {
        leads: { percentage: 12.5, direction: 'up' },
        deals: { percentage: 8.3, direction: 'up' },
        revenue: { percentage: 15.7, direction: 'up' },
        tasks: { percentage: 5.2, direction: 'down' }
      }
    };
  }, [contacts, deals, leads, tasks, accounts, leadsCount, dealsCount, accountsCount, tasksCount]);

  // Memoized chart data
  const chartData = useMemo(() => {
    // Pipeline data
    const pipelineChartData = [
      { stage: 'Prospecting', count: deals.filter(d => d.stage === 'Prospecting').length },
      { stage: 'Qualification', count: deals.filter(d => d.stage === 'Qualification').length },
      { stage: 'Proposal', count: deals.filter(d => d.stage === 'Proposal').length },
      { stage: 'Negotiation', count: deals.filter(d => d.stage === 'Negotiation').length },
      { stage: 'Closed Won', count: deals.filter(d => d.stage === 'Closed Won').length },
    ];

    // Revenue trend (mock data - in real app, this would come from historical data)
    const revenueChartData = [
      { month: 'Jan', revenue: enhancedMetrics.wonDealsValue * 0.6 },
      { month: 'Feb', revenue: enhancedMetrics.wonDealsValue * 0.7 },
      { month: 'Mar', revenue: enhancedMetrics.wonDealsValue * 0.85 },
      { month: 'Apr', revenue: enhancedMetrics.wonDealsValue },
    ];

    // Lead sources pie chart
    const leadSourcesData = [
      { name: 'Website', value: leads.filter(l => l.source === 'Website').length, color: '#8884d8' },
      { name: 'Referral', value: leads.filter(l => l.source === 'Referral').length, color: '#82ca9d' },
      { name: 'Social Media', value: leads.filter(l => l.source === 'Social Media').length, color: '#ffc658' },
      { name: 'Email', value: leads.filter(l => l.source === 'Email').length, color: '#ff7300' },
      { name: 'Other', value: leads.filter(l => !['Website', 'Referral', 'Social Media', 'Email'].includes(l.source)).length, color: '#8dd1e1' },
    ].filter(item => item.value > 0);

    return {
      pipeline: pipelineChartData,
      revenue: revenueChartData,
      leadSources: leadSourcesData
    };
  }, [deals, leads, enhancedMetrics.wonDealsValue]);

  // Loading and error states
  const isLoading = contactsLoading || dealsLoading || leadsLoading || tasksLoading || accountsLoading || dashboardLoading;
  const hasError = contactsError || dealsError || leadsError || tasksError || accountsError || dashboardError;

  // Optimized refresh function with error handling
  const handleRefreshAll = useCallback(async () => {
    try {
      await Promise.all([
        refreshContacts(),
        refreshDeals(),
        refreshLeads(),
        refreshTasks(),
        refreshAccounts(),
        refreshDashboard()
      ]);
    } catch (error) {
      handleError(error, 'Failed to refresh dashboard data');
    }
  }, [refreshContacts, refreshDeals, refreshLeads, refreshTasks, refreshAccounts, refreshDashboard, handleError]);

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
        <Button onClick={handleRefreshAll} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefreshAll}>
      <div className="p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
        {/* Header with Performance Indicator */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Optimized Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Enhanced with intelligent caching and performance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Updates
            </div>
            <Button onClick={handleRefreshAll} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Performance Monitor */}
        <PerformanceMonitor />

        {/* Enhanced Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStatCard
            title="Total Leads"
            value={enhancedMetrics.totalLeads}
            icon={Sparkles}
            subtitle={`${enhancedMetrics.conversionRate}% conversion rate`}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            trend={enhancedMetrics.trends.leads}
          />
          <AnimatedStatCard
            title="Active Contacts"
            value={enhancedMetrics.activeContacts}
            icon={Users}
            subtitle={`${enhancedMetrics.totalAccounts} accounts`}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={enhancedMetrics.trends.deals}
          />
          <AnimatedStatCard
            title="Pipeline Value"
            value={`$${enhancedMetrics.totalDealsValue.toLocaleString()}`}
            icon={Target}
            subtitle={`${enhancedMetrics.openDeals} open deals`}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            trend={enhancedMetrics.trends.revenue}
          />
          <AnimatedStatCard
            title="Pending Tasks"
            value={enhancedMetrics.pendingTasks}
            icon={CheckSquare}
            subtitle={`${enhancedMetrics.overdueTasks} overdue`}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
            trend={enhancedMetrics.trends.tasks}
          />
        </StaggerContainer>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Chart */}
          <AnimatedCard className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Sales Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemoizedBarChart data={chartData.pipeline} />
            </CardContent>
          </AnimatedCard>

          {/* Revenue Trend */}
          <AnimatedCard className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemoizedLineChart data={chartData.revenue} />
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Lead Sources Chart */}
        {chartData.leadSources.length > 0 && (
          <AnimatedCard className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Users className="w-5 h-5 text-purple-500" />
                Lead Sources Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemoizedPieChart data={chartData.leadSources} />
            </CardContent>
          </AnimatedCard>
        )}

        {/* Smart Features Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Smart Notifications */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
              <SmartNotifications />
            </Suspense>
          </div>
          
          {/* AI Insights */}
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
              <AIInsights />
            </Suspense>
          </div>
        </div>

        {/* Predictive Analytics */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>}>
          <PredictiveAnalytics 
            entity="dashboard"
            entityType="Dashboard"
            data={{
              leads,
              contacts,
              accounts,
              deals,
              tasks,
              revenueData: chartData.revenue,
              pipelineData: chartData.pipeline
            }}
          />
        </Suspense>

        {/* AI Dashboard Widgets */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
          <AIDashboardWidgets />
        </Suspense>

        {/* Quick Actions */}
        <AnimatedCard className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EnhancedButton
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/leads/new'}
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-sm">Add Lead</span>
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/deals/new'}
              >
                <Target className="w-5 h-5" />
                <span className="text-sm">New Deal</span>
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/tasks/new'}
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add Task</span>
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                className="flex flex-col items-center gap-2 h-20"
                onClick={() => window.location.href = '/reports'}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">View Reports</span>
              </EnhancedButton>
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </PullToRefresh>
  );
}
