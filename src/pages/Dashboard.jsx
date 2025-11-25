import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { memo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useRealTimeNotifications } from '@/hooks/useEnhancedBusinessLogic';
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
const AnimatedStatCard = memo(({ title, value, icon: Icon, subtitle, gradient }) => {
  // Ensure value is a valid number
  const numericValue = typeof value === 'string' 
    ? (value.startsWith('$') ? parseFloat(value.replace(/[^0-9.]/g, '')) : parseFloat(value)) || 0
    : (Number(value) || 0);
  
  // If it's a string (like currency), display as-is, otherwise use AnimatedCounter
  const displayValue = typeof value === 'string' && value.includes('$')
    ? value
    : numericValue;

  return (
    <AnimatedCard className={`relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <CardTitle className="text-3xl font-bold mt-2 text-white">
              {typeof value === 'string' && value.includes('$') ? (
                value
              ) : (
                <AnimatedCounter to={numericValue} from={0} duration={1} />
              )}
            </CardTitle>
            {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
    </AnimatedCard>
  );
});
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
  
  // Notifications hook (for UI notifications, not data)
  const { notifications = [], dismissNotification } = useRealTimeNotifications();
  
  // Fetch data directly from backend using React Query - NO MOCK DATA
  const { data: leads = [], isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      return await base44.entities.Lead.list();
    },
    select: (data) => Array.isArray(data) ? data : []
  });

  const { data: contacts = [], isLoading: contactsLoading, error: contactsError } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      return await base44.entities.Contact.list();
    },
    select: (data) => Array.isArray(data) ? data : []
  });

  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      return await base44.entities.Account.list();
    },
    select: (data) => Array.isArray(data) ? data : []
  });

  // Deals - fetch real data from backend
  const { data: deals = [], isLoading: dealsLoading, error: dealsError } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      try {
        return await base44.entities.Deal.list();
      } catch (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
    },
    select: (data) => Array.isArray(data) ? data : []
  });

  // Tasks - fetch real data from backend
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        return await base44.entities.Task.list();
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
    },
    select: (data) => Array.isArray(data) ? data : []
  });

  // Activities query
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      return await base44.entities.Activity.list();
    }
  });

  // Use ONLY backend data - no mock data
  const combinedLeads = Array.isArray(leads) ? leads : [];
  const combinedDeals = Array.isArray(deals) ? deals : [];
  const combinedContacts = Array.isArray(contacts) ? contacts : [];
  const combinedTasks = Array.isArray(tasks) ? tasks : [];
  const combinedAccounts = Array.isArray(accounts) ? accounts : [];

  // Calculate revenue metrics from deals
  const revenueMetrics = useMemo(() => {
    const totalRevenue = combinedDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const wonDeals = combinedDeals.filter(d => d.stage === 'Closed Won');
    const wonRevenue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
    const conversionRate = combinedLeads.length > 0 
      ? ((combinedLeads.filter(l => l.status === 'Converted').length / combinedLeads.length) * 100).toFixed(1)
      : 0;
    
    return {
      totalRevenue,
      wonRevenue,
      conversionRate: parseFloat(conversionRate)
    };
  }, [combinedDeals, combinedLeads]);

  // Calculate pipeline data from deals
  const pipelineData = useMemo(() => {
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const data = {};
    
    stages.forEach(stage => {
      const stageDeals = combinedDeals.filter(d => {
        const dealStage = d.stage || d.dealStage || '';
        return dealStage.toLowerCase() === stage.toLowerCase() || 
               dealStage === stage ||
               (stage === 'Closed Won' && (dealStage === 'closed won' || dealStage === 'Closed Won')) ||
               (stage === 'Closed Lost' && (dealStage === 'closed lost' || dealStage === 'Closed Lost'));
      });
      data[stage] = {
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => {
          const amount = parseFloat(deal.amount) || parseFloat(deal.value) || 0;
          return sum + amount;
        }, 0)
      };
    });
    
    return data;
  }, [combinedDeals]);

  const isLoading = leadsLoading || contactsLoading || accountsLoading || dealsLoading || tasksLoading;
  const hasError = leadsError || contactsError || accountsError || dealsError || tasksError;

  // Enhanced metrics calculation with AI insights - MUST be before any early returns
  const enhancedMetrics = useMemo(() => {
    // Safely get array lengths
    const totalLeads = Array.isArray(combinedLeads) ? combinedLeads.length : 0;
    const activeContacts = Array.isArray(combinedContacts) ? combinedContacts.length : 0;
    const totalTasks = Array.isArray(combinedTasks) ? combinedTasks.length : 0;
    
    // Calculate total deals value safely
    let totalDealsValue = 0;
    if (Array.isArray(combinedDeals)) {
      totalDealsValue = combinedDeals.reduce((sum, deal) => {
        const amount = parseFloat(deal?.amount) || parseFloat(deal?.value) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    }
    
    // Use revenueMetrics if available, otherwise use calculated value
    if (revenueMetrics?.totalRevenue !== undefined && !isNaN(revenueMetrics.totalRevenue)) {
      totalDealsValue = Number(revenueMetrics.totalRevenue);
    }
    
    // Filter deals safely - handle different stage formats
    const openDeals = Array.isArray(combinedDeals) 
      ? combinedDeals.filter(d => {
          const stage = d?.stage || d?.dealStage || '';
          return stage && 
                 stage.toLowerCase() !== 'closed won' && 
                 stage.toLowerCase() !== 'closed lost' &&
                 stage !== 'Closed Won' &&
                 stage !== 'Closed Lost';
        })
      : [];
    const wonDeals = Array.isArray(combinedDeals)
      ? combinedDeals.filter(d => {
          const stage = d?.stage || d?.dealStage || '';
          return stage.toLowerCase() === 'closed won' || stage === 'Closed Won';
        })
      : [];
    
    // Calculate won deals value
    let wonDealsValue = 0;
    if (Array.isArray(wonDeals)) {
      wonDealsValue = wonDeals.reduce((sum, deal) => {
        const amount = parseFloat(deal?.amount) || parseFloat(deal?.value) || 0;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    }
    
    // Use revenueMetrics if available
    if (revenueMetrics?.wonRevenue !== undefined && !isNaN(revenueMetrics.wonRevenue)) {
      wonDealsValue = Number(revenueMetrics.wonRevenue);
    }
    
    // Calculate conversion rate safely
    const convertedLeads = Array.isArray(combinedLeads)
      ? combinedLeads.filter(l => l?.status === 'Converted').length
      : 0;
    const conversionRateValue = totalLeads > 0 
      ? ((convertedLeads / totalLeads) * 100) 
      : 0;
    const conversionRate = (revenueMetrics?.conversionRate !== undefined && !isNaN(revenueMetrics.conversionRate))
      ? Number(revenueMetrics.conversionRate)
      : conversionRateValue;
    
    // Calculate pending tasks
    const pendingTasks = Array.isArray(combinedTasks)
      ? combinedTasks.filter(t => t?.status && t.status !== 'Completed').length
      : 0;
    
    // Calculate metrics from real data only - no mock analytics
    const qualifiedLeads = totalLeads;
    const aiConversionRate = conversionRate;
    
    const closedDeals = Array.isArray(combinedDeals)
      ? combinedDeals.filter(d => {
          const stage = d?.stage || d?.dealStage || '';
          return stage.toLowerCase() === 'closed won' || 
                 stage.toLowerCase() === 'closed lost' ||
                 stage === 'Closed Won' ||
                 stage === 'Closed Lost';
        })
      : [];
    
    const winRate = closedDeals.length > 0
      ? ((wonDeals.length / closedDeals.length) * 100)
      : 0;
    
    const averageDealSize = wonDeals.length > 0
      ? (wonDealsValue / wonDeals.length)
      : 0;

    return {
      totalLeads: isNaN(totalLeads) ? 0 : totalLeads,
      activeContacts: isNaN(activeContacts) ? 0 : activeContacts,
      totalDealsValue: isNaN(totalDealsValue) ? 0 : totalDealsValue,
      openDeals: isNaN(openDeals.length) ? 0 : openDeals.length,
      wonDealsValue: isNaN(wonDealsValue) ? 0 : wonDealsValue,
      conversionRate: isNaN(aiConversionRate) ? 0 : aiConversionRate,
      pendingTasks: isNaN(pendingTasks) ? 0 : pendingTasks,
      qualifiedLeads: isNaN(qualifiedLeads) ? 0 : qualifiedLeads,
      winRate: isNaN(winRate) ? 0 : winRate,
      averageDealSize: isNaN(averageDealSize) ? 0 : averageDealSize
    };
  }, [combinedLeads, combinedContacts, combinedDeals, combinedTasks, revenueMetrics]);

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

  // Chart data from real backend data only
  const chartData = useMemo(() => {
    // Lead status distribution from real data
    const statusCounts = {};
    
    combinedLeads.forEach(lead => {
      const status = lead.status || lead.leadStatus || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusColors = {
      'New': '#6366F1',
      'Contacted': '#8B5CF6',
      'Qualified': '#10B981',
      'Converted': '#F59E0B',
      'Unqualified': '#EF4444',
      'Unknown': '#6B7280'
    };
    
    const leadStatusData = Object.entries(statusCounts)
      .map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || '#6B7280'
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { leadStatusData };
  }, [combinedLeads]);

  // Performance marks for dashboard mount and data loading - MUST be before any early returns
  useEffect(() => {
    try {
      performanceMonitor.mark('dashboard-mount-start');
      // Measure after first paint
      requestAnimationFrame(() => {
        performanceMonitor.measure('dashboard-mount', 'dashboard-mount-start');
      });
    } catch (err) {
      // Safe fallback if performance monitor is unavailable
      console.warn('Performance monitor mount mark failed:', err);
    }
  }, []);

  useEffect(() => {
    try {
      if (isLoading) {
        performanceMonitor.mark('dashboard-data-loading-start');
      } else {
        // Measure from the start mark to now
        performanceMonitor.measure('dashboard-data-loading', 'dashboard-data-loading-start');
      }
    } catch (err) {
      // Silently handle errors - performance monitoring is optional
    }
  }, [isLoading]);

  const queryClient = useQueryClient();
  
  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['leads'] }),
        queryClient.invalidateQueries({ queryKey: ['contacts'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['deals'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['activities'] }),
      ]);
    } catch (error) {
      // Pass options object to useErrorHandler for correct behavior
      handleError(error, { customMessage: 'Failed to refresh dashboard data' });
    }
  };

  const leadStatusData = chartData.leadStatusData;

  // Deal pipeline data - use the calculated pipelineData
  const pipelineChartData = useMemo(() => {
    return Object.entries(pipelineData).map(([stage, data]) => ({
      stage,
      count: Number(data.count) || 0,
      value: Number(data.value) || 0
    }));
  }, [pipelineData]);

  // Monthly revenue trend - calculate from actual deals
  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const revenueByMonth = {};
    
    // Initialize all months to 0
    months.forEach(month => {
      revenueByMonth[month] = 0;
    });
    
    // Calculate revenue from won deals by month
    const wonDeals = combinedDeals.filter(d => {
      const stage = d.stage || d.dealStage || '';
      return stage.toLowerCase() === 'closed won' || stage === 'Closed Won';
    });
    
    wonDeals.forEach(deal => {
      const closeDate = deal.closingDate || deal.actual_close_date || deal.expected_close_date || deal.createdAt || deal.created_date;
      if (closeDate) {
        try {
          const date = new Date(closeDate);
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];
          const amount = parseFloat(deal.amount) || parseFloat(deal.value) || 0;
          if (monthName && !isNaN(amount)) {
            revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + amount;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
    
    // Get last 6 months
    const last6Months = months.slice(-6);
    return last6Months.map(month => ({
      month,
      revenue: Math.round(revenueByMonth[month] || 0)
    }));
  }, [combinedDeals]);

  // Show loading state - AFTER all hooks
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state with retry option - AFTER all hooks
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
          subtitle={`${(enhancedMetrics.conversionRate || 0).toFixed(1)}% conversion rate`}
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
          value={`$${(enhancedMetrics.totalDealsValue || 0).toLocaleString()}`}
          icon={TrendingUp}
          subtitle={`${enhancedMetrics.openDeals || 0} open deals`}
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
            {pipelineChartData && pipelineChartData.length > 0 ? (
              <MemoizedBarChart data={pipelineChartData} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No pipeline data available</p>
              </div>
            )}
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
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Lead Statistics</h4>
                  <p className="text-sm text-purple-700">
                    Total Leads: {enhancedMetrics.totalLeads} | 
                    Conversion Rate: {enhancedMetrics.conversionRate.toFixed(1)}%
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">Pipeline Statistics</h4>
                  <p className="text-sm text-emerald-700">
                    Open Deals: {enhancedMetrics.openDeals} | 
                    Win Rate: {enhancedMetrics.winRate.toFixed(1)}% | 
                    Avg Deal Size: ${enhancedMetrics.averageDealSize.toLocaleString()}
                  </p>
                </div>
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
                    ${(enhancedMetrics.wonDealsValue * 1.1).toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-indigo-600">Next Quarter</span>
                  <span className="font-medium text-indigo-800">
                    ${(enhancedMetrics.wonDealsValue * 1.3).toLocaleString() || '0'}
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
                    {0}
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
              onClick={() => window.location.href = '/ai-lead-qualification'}
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
              onClick={() => window.location.href = '/intelligent-deal-insights'}
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
              onClick={() => window.location.href = '/conversational-ai'}
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
              onClick={() => window.location.href = '/real-time-bi'}
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
              onClick={() => window.location.href = '/workflow-automation'}
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
              onClick={() => window.location.href = '/predictive-analytics'}
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
