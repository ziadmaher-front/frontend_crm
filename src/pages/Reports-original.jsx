import { useState, memo, useEffect, useCallback, Suspense, lazy } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services";
import { performanceMonitor, debounce, throttle, useMemoizedCallback, useMemoizedValue } from '@/utils/performanceOptimizer.js';
import cacheManager from '@/utils/cacheManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Sparkles,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
  Filter,
  Settings,
  Trophy,
  MessageSquare,
  AlertTriangle,
  Zap,
  Brain,
  Wifi,
  Grid3X3,
  Layers,
  Clock,
  Bell
} from "lucide-react";

// Import advanced features
// Lazy load advanced chart components for better performance
const HeatmapChart = lazy(() => import('@/components/charts/AdvancedCharts').then(module => ({ default: module.HeatmapChart })));
const FunnelChart = lazy(() => import('@/components/charts/AdvancedCharts').then(module => ({ default: module.FunnelChart })));
const WaterfallChart = lazy(() => import('@/components/charts/AdvancedCharts').then(module => ({ default: module.WaterfallChart })));
const ScatterPlotMatrix = lazy(() => import('@/components/charts/AdvancedCharts').then(module => ({ default: module.ScatterPlotMatrix })));
const InteractiveDashboard = lazy(() => import('@/components/charts/AdvancedCharts').then(module => ({ default: module.InteractiveDashboard })));
import { realTimeService, realTimeAnalytics } from "@/services/realTimeService";
import predictiveService from "@/services/predictiveService";
import { DashboardGrid, createWidget } from "@/components/dashboard/DashboardWidgets";
import exportService from "@/services/exportService";
import { 
  BarChart, 
  Bar, 
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
  ComposedChart
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subMonths } from "date-fns";
import { AccessibleTable } from '@/components/AccessibilityEnhancements';

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

export default function Reports() {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Advanced features state
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [exportHistory, setExportHistory] = useState([]);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);

  // Performance monitoring
  useEffect(() => {
    performanceMonitor.mark('reports-component-mount');
    return () => {
      performanceMonitor.measure('reports-component-mount');
    };
  }, []);

  // Memoized error handler
  const handleError = useMemoizedCallback((error, context) => {
    console.error(`Reports Error [${context}]:`, error);
    setError({ message: error.message || 'An unexpected error occurred', context });
    
    // Track error for analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Reports ${context}: ${error.message}`,
        fatal: false
      });
    }
  }, []);

  // Debounced refresh function
  const debouncedRefresh = useMemoizedCallback(
    debounce(async () => {
      try {
        setRefreshing(true);
        setError(null);
        performanceMonitor.mark('reports-refresh');
        
        // Clear cache for fresh data
        await cacheManager.invalidate('reports-*');
        
        // Trigger refetch of all queries
        await Promise.all([
          refetchDashboard(),
          // Add other refetch calls as needed
        ]);
        
        performanceMonitor.measure('reports-refresh');
      } catch (error) {
        handleError(error, 'refresh');
      } finally {
        setRefreshing(false);
      }
    }, 300),
    [refetchDashboard, handleError]
  );

  // Enhanced queries using the new ReportsService with error handling and caching
  const { data: dashboardMetrics, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboard-metrics', dateRange],
    queryFn: async () => {
      try {
        performanceMonitor.mark('dashboard-metrics-fetch');
        const data = await cacheManager.getOrFetch(
          `dashboard-metrics-${dateRange}`,
          () => reportsService.getDashboardMetrics(dateRange),
          { ttl: 5 * 60 * 1000 }
        );
        performanceMonitor.measure('dashboard-metrics-fetch');
        return data;
      } catch (error) {
        handleError(error, 'dashboard-metrics');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: salesAnalytics, isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales-analytics', dateRange],
    queryFn: async () => {
      try {
        return await cacheManager.getOrFetch(
          `sales-analytics-${dateRange}`,
          () => reportsService.getSalesAnalytics({ dateRange, includeForecasting: true }),
          { ttl: 5 * 60 * 1000 }
        );
      } catch (error) {
        handleError(error, 'sales-analytics');
        throw error;
      }
    },
    enabled: activeTab === 'sales',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: leadAnalytics, isLoading: leadsLoading, error: leadsError } = useQuery({
    queryKey: ['lead-analytics', dateRange],
    queryFn: async () => {
      try {
        return await cacheManager.getOrFetch(
          `lead-analytics-${dateRange}`,
          () => reportsService.getLeadAnalytics({ dateRange, includeScoring: true, includeAttribution: true }),
          { ttl: 5 * 60 * 1000 }
        );
      } catch (error) {
        handleError(error, 'lead-analytics');
        throw error;
      }
    },
    enabled: activeTab === 'leads',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: contactAnalytics, isLoading: contactsLoading, error: contactsError } = useQuery({
    queryKey: ['contact-analytics', dateRange],
    queryFn: async () => {
      try {
        return await cacheManager.getOrFetch(
          `contact-analytics-${dateRange}`,
          () => reportsService.getContactAnalytics({ dateRange, includeEngagement: true, includeRelationships: true }),
          { ttl: 5 * 60 * 1000 }
        );
      } catch (error) {
        handleError(error, 'contact-analytics');
        throw error;
      }
    },
    enabled: activeTab === 'contacts',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: teamAnalytics, isLoading: teamLoading, error: teamError } = useQuery({
    queryKey: ['team-analytics', dateRange],
    queryFn: async () => {
      try {
        return await cacheManager.getOrFetch(
          `team-analytics-${dateRange}`,
          () => reportsService.getTeamAnalytics({ dateRange, includeIndividual: true }),
          { ttl: 5 * 60 * 1000 }
        );
      } catch (error) {
        handleError(error, 'team-analytics');
        throw error;
      }
    },
    enabled: activeTab === 'team',
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: predictiveAnalytics, isLoading: predictiveLoading, error: predictiveError } = useQuery({
    queryKey: ['predictive-analytics', dateRange],
    queryFn: async () => {
      try {
        return await cacheManager.getOrFetch(
          `predictive-analytics-${dateRange}`,
          () => reportsService.getPredictiveAnalytics({ type: 'revenue', period: 'quarter' }),
          { ttl: 10 * 60 * 1000 }
        );
      } catch (error) {
        handleError(error, 'predictive-analytics');
        throw error;
      }
    },
    enabled: activeTab === 'predictive',
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const { data: realTimeData, error: realTimeError } = useQuery({
    queryKey: ['real-time-analytics'],
    queryFn: async () => {
      try {
        return await reportsService.getRealTimeAnalytics();
      } catch (error) {
        handleError(error, 'real-time-analytics');
        throw error;
      }
    },
    refetchInterval: 30000,
    enabled: activeTab === 'realtime',
    retry: 1,
  });

  // Fallback to legacy data for backward compatibility
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
    enabled: !dashboardMetrics,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list(),
    enabled: !dashboardMetrics,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list(),
    enabled: !dashboardMetrics,
  });

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      reportsService.clearCache();
      await refetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize advanced features
  useEffect(() => {
    // Initialize default dashboard widgets
    const defaultWidgets = [
      createWidget('metric', {
        title: 'Total Revenue',
        data: { value: dashboardMetrics?.revenue || 0, format: 'currency', label: 'This Month' }
      }),
      createWidget('metric', {
        title: 'Active Deals',
        data: { value: dashboardMetrics?.activeDeals || 0, format: 'number', label: 'In Pipeline' }
      }),
      createWidget('chart', {
        title: 'Revenue Trend',
        config: { chartType: 'line', height: 200 },
        data: salesAnalytics?.revenueHistory || []
      }),
      createWidget('activity', {
        title: 'Recent Activity',
        data: realTimeData?.recentActivity || []
      })
    ];
    
    if (dashboardWidgets.length === 0) {
      setDashboardWidgets(defaultWidgets);
    }
  }, [dashboardMetrics, salesAnalytics, realTimeData]);

  // Real-time service setup
  useEffect(() => {
    // Set up real-time event listeners
    const handleRealTimeData = (data) => {
      setRealTimeMetrics(prev => ({ ...prev, ...data }));
    };

    const handleNotification = (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    };

    const handleConnection = () => {
      setIsRealTimeConnected(true);
    };

    const handleDisconnection = () => {
      setIsRealTimeConnected(false);
    };

    // Subscribe to real-time events
    realTimeService.on('data:live-sales', handleRealTimeData);
    realTimeService.on('data:live-activity', handleRealTimeData);
    realTimeService.on('data:live-performance', handleRealTimeData);
    realTimeService.on('notification', handleNotification);
    realTimeService.on('connected', handleConnection);
    realTimeService.on('disconnected', handleDisconnection);

    // Start real-time analytics
    realTimeAnalytics.startLiveMetrics();

    return () => {
      // Cleanup
      realTimeService.off('data:live-sales', handleRealTimeData);
      realTimeService.off('data:live-activity', handleRealTimeData);
      realTimeService.off('data:live-performance', handleRealTimeData);
      realTimeService.off('notification', handleNotification);
      realTimeService.off('connected', handleConnection);
      realTimeService.off('disconnected', handleDisconnection);
      
      realTimeAnalytics.stopLiveMetrics();
    };
  }, []);

  // Load predictive insights
  useEffect(() => {
    const loadPredictiveInsights = async () => {
      if (activeTab === 'predictive' && salesAnalytics?.revenueHistory) {
        try {
          const forecast = await predictiveService.forecastSales(salesAnalytics.revenueHistory, 6);
          setPredictiveInsights(forecast);
        } catch (error) {
          console.error('Failed to load predictive insights:', error);
        }
      }
    };

    loadPredictiveInsights();
  }, [activeTab, salesAnalytics]);

  // Widget management functions
  const handleWidgetMove = useCallback((sourceIndex, destinationIndex) => {
    const newWidgets = [...dashboardWidgets];
    const [removed] = newWidgets.splice(sourceIndex, 1);
    newWidgets.splice(destinationIndex, 0, removed);
    setDashboardWidgets(newWidgets);
  }, [dashboardWidgets]);

  const handleWidgetRemove = useCallback((widgetId) => {
    setDashboardWidgets(prev => prev.filter(w => w.id !== widgetId));
  }, []);

  const handleWidgetRefresh = useCallback(async (widgetId) => {
    // Refresh specific widget data
    const widget = dashboardWidgets.find(w => w.id === widgetId);
    if (widget) {
      // Trigger data refresh based on widget type
      await handleRefresh();
    }
  }, [dashboardWidgets, handleRefresh]);

  const handleAddWidget = useCallback(() => {
    const newWidget = createWidget('metric', {
      title: 'New Metric',
      data: { value: 0, format: 'number', label: 'Custom Metric' }
    });
    setDashboardWidgets(prev => [...prev, newWidget]);
  }, []);

  // Advanced export functionality
  const handleAdvancedExport = useCallback(async (format, options = {}) => {
    try {
      let result;
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics_report_${timestamp}`;

      switch (format) {
        case 'csv':
          result = await exportService.exportToCSV(
            salesAnalytics?.deals || [], 
            filename, 
            { includeHeaders: true, ...options }
          );
          break;
        case 'excel':
          result = await exportService.exportToExcel(
            salesAnalytics?.deals || [], 
            filename,
            { sheetName: 'Sales Analytics', ...options }
          );
          break;
        case 'pdf':
          result = await exportService.exportToPDF(
            { 
              title: 'Sales Analytics Report',
              data: salesAnalytics,
              metrics: dashboardMetrics,
              dateRange 
            },
            filename,
            { title: 'Sales Analytics Report', ...options }
          );
          break;
      }

      // Update export history
      setExportHistory(prev => [result, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [salesAnalytics, dashboardMetrics, dateRange]);

  // Export functionality
  const handleExport = async (type, format = 'json') => {
    try {
      const data = await reportsService.exportAnalytics(type, format, { dateRange });
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-analytics-${dateRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Calculate legacy metrics for backward compatibility
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

  // Memoized loading state
  const isAnyLoading = useMemoizedValue(() => {
    return dashboardLoading || salesLoading || leadsLoading || contactsLoading || teamLoading || predictiveLoading;
  }, [dashboardLoading, salesLoading, leadsLoading, contactsLoading, teamLoading, predictiveLoading]);

  // Memoized error state
  const hasAnyError = useMemoizedValue(() => {
    return dashboardError || salesError || leadsError || contactsError || teamError || predictiveError || realTimeError || error;
  }, [dashboardError, salesError, leadsError, contactsError, teamError, predictiveError, realTimeError, error]);

  // Loading component
  const LoadingState = memo(() => (
    <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Loading analytics data">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    </div>
  ));

  // Error component
  const ErrorState = memo(({ error, onRetry }) => (
    <div className="flex items-center justify-center min-h-[400px]" role="alert">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground mt-2">
            {error?.message || 'Failed to load analytics data. Please try again.'}
          </p>
        </div>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  ));

  // Show loading state
  if (isAnyLoading && !dashboardMetrics) {
    return <LoadingState />;
  }

  // Show error state
  if (hasAnyError && !dashboardMetrics) {
    return <ErrorState error={hasAnyError} onRetry={debouncedRefresh} />;
  }

  return (
    <ErrorBoundary fallback={<ErrorState error={{ message: 'Component crashed' }} onRetry={() => window.location.reload()} />}>
      <div className="p-6 lg:p-8 space-y-6" role="main" aria-label="Analytics and Reports Dashboard">
        {/* Enhanced Header */}
        <div className="crm-page-header">
          <div>
            <h1 className="crm-page-title" id="reports-title">
              <FileText className="w-8 h-8" aria-hidden="true" />
              Analytics & Reports
            </h1>
            <p className="crm-page-subtitle">Comprehensive insights with advanced analytics and real-time data</p>
          </div>
          <div className="flex gap-3" role="toolbar" aria-label="Report controls">
            <Select value={dateRange} onValueChange={setDateRange} aria-label="Select date range">
              <SelectTrigger className="crm-select w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="180d">Last 6 Months</SelectItem>
                <SelectItem value="365d">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={debouncedRefresh} 
              variant="outline" 
              disabled={refreshing}
              className="min-w-[100px]"
              aria-label={refreshing ? 'Refreshing data' : 'Refresh data'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => handleExport('dashboard')} 
              variant="outline"
              aria-label="Export dashboard data"
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4" role="alert">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <h4 className="font-medium text-destructive">Error in {error.context}</h4>
                <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="ml-auto"
                aria-label="Dismiss error"
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" role="region" aria-label="Key metrics overview">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-white/80" />
              <p className="text-xs font-medium text-white/80">Total Revenue</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${dashboardMetrics?.revenue?.totalRevenue ? 
                (dashboardMetrics.revenue.totalRevenue / 1000).toFixed(0) : 
                (wonDealsValue / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-white/70 mt-1">
              {dashboardMetrics?.revenue?.dealCount || wonDeals.length} deals won
            </p>
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

      {/* Enhanced Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Enhanced Dashboard Tab with Interactive Widgets */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : (
            <>
              {/* Dashboard Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-semibold">Interactive Dashboard</h3>
                  {isRealTimeConnected && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Wifi className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddWidget} variant="outline" size="sm">
                    <Layers className="w-4 h-4 mr-2" />
                    Add Widget
                  </Button>
                  <Button onClick={() => handleAdvancedExport('pdf')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Dashboard
                  </Button>
                </div>
              </div>

              {/* Interactive Dashboard Grid */}
              <DashboardGrid
                widgets={dashboardWidgets}
                onWidgetMove={handleWidgetMove}
                onWidgetRemove={handleWidgetRemove}
                onWidgetRefresh={handleWidgetRefresh}
              />

              {/* Advanced Analytics Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {predictiveInsights?.insights?.slice(0, 3).map((insight, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-800">{insight.title}</p>
                          <p className="text-xs text-purple-600 mt-1">{insight.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                            <span className="text-xs text-purple-500">{insight.impact}</span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-4 text-gray-500">
                          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">AI insights loading...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      Live Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((notification, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-amber-500' :
                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4 text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent notifications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Overview */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Revenue Growth</span>
                        <span className="text-lg font-semibold text-green-600">
                          +{dashboardMetrics?.trends?.revenue?.percentage || 15.2}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Deal Velocity</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {dashboardMetrics?.performance?.avgDealCycle || 45} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="text-lg font-semibold text-purple-600">
                          {dashboardMetrics?.conversion?.conversionRate || conversionRate}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Activities</span>
                        <span className="text-lg font-semibold">
                          {realTimeMetrics?.totalActivities || dashboardMetrics?.overview?.totalActivities || activities.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">New Leads</span>
                        <span className="text-lg font-semibold">
                          {realTimeMetrics?.newLeads || dashboardMetrics?.overview?.totalLeads || leads.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Deals</span>
                        <span className="text-lg font-semibold">
                          {realTimeMetrics?.activeDeals || dashboardMetrics?.overview?.totalDeals || deals.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Enhanced Sales Analytics Tab with Advanced Charts */}
        <TabsContent value="sales" className="space-y-6">
          {salesLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : salesAnalytics ? (
            <>
              {/* Advanced Export Controls */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sales Analytics</h3>
                <div className="flex gap-2">
                  <Button onClick={() => handleAdvancedExport('excel')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button onClick={() => handleAdvancedExport('csv')} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {/* Advanced Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Sales Funnel Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading chart...</div>}>
                      <FunnelChart 
                        data={pipelineData}
                        height={300}
                        colors={['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
                      />
                    </Suspense>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Revenue Waterfall
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading chart...</div>}>
                      <WaterfallChart 
                        data={monthlyRevenueData.slice(-6)}
                        height={300}
                        dataKey="revenue"
                        nameKey="month"
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap and Scatter Analysis */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="w-5 h-5 text-purple-500" />
                      Sales Performance Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading chart...</div>}>
                      <HeatmapChart 
                        data={repPerformance}
                        xKey="name"
                        yKey="winRate"
                        valueKey="revenue"
                        height={300}
                      />
                    </Suspense>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-amber-500" />
                      Deal Size vs Win Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense fallback={<div className="h-[300px] flex items-center justify-center">Loading chart...</div>}>
                      <ScatterPlotMatrix 
                        data={repPerformance}
                        xKey="revenue"
                        yKey="winRate"
                        sizeKey="deals"
                        height={300}
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>

              {/* Traditional Analytics */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Sales Pipeline Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(salesAnalytics.pipeline || {}).map(([stage, data]) => (
                        <div key={stage} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{stage}</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold">{data.count}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ${(data.value / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Sales Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {salesAnalytics.forecast && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Best Case</span>
                          <span className="text-lg font-semibold text-green-600">
                            ${(salesAnalytics.forecast.bestCase / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Most Likely</span>
                          <span className="text-lg font-semibold text-blue-600">
                            ${(salesAnalytics.forecast.mostLikely / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Worst Case</span>
                          <span className="text-lg font-semibold text-orange-600">
                            ${(salesAnalytics.forecast.worstCase / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No sales analytics data available
            </div>
          )}
        </TabsContent>

        {/* Legacy Revenue Tab for backward compatibility */}
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
              <AccessibleTable
                caption="Sales Rep Performance Leaderboard showing rankings, revenue, deals won, win rates, and pipeline values"
                headers={['Rank', 'Sales Rep', 'Revenue', 'Deals Won', 'Win Rate', 'Pipeline']}
                data={repPerformance.map((rep, idx) => [
                  <div key={`rank-${idx}`} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-amber-500' :
                    idx === 1 ? 'bg-gray-400' :
                    idx === 2 ? 'bg-orange-600' :
                    'bg-indigo-500'
                  }`}>
                    {idx + 1}
                  </div>,
                  <span key={`name-${idx}`}>{rep.name}</span>,
                  <span key={`revenue-${idx}`} className="font-bold text-green-600">${(rep.revenue / 1000).toFixed(0)}K</span>,
                  <span key={`deals-${idx}`}>{rep.deals}</span>,
                  <Badge key={`winrate-${idx}`} className={
                    rep.winRate >= 50 ? 'bg-green-100 text-green-700' :
                    rep.winRate >= 30 ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }>
                    {rep.winRate}%
                  </Badge>,
                  <span key={`pipeline-${idx}`} className="font-semibold text-indigo-600">${(rep.pipeline / 1000).toFixed(0)}K</span>
                ])}
                className="w-full"
              />
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

        {/* Leads Analytics Tab */}
        <TabsContent value="leads" className="space-y-6">
          {leadsLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : leadAnalytics ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Lead Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(leadAnalytics.conversionFunnel || {}).map(([stage, count]) => (
                      <div key={stage} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{stage}</span>
                        <span className="text-lg font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Lead Sources Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(leadAnalytics.sourcePerformance || {}).map(([source, data]) => (
                      <div key={source} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{source}</span>
                        <div className="text-right">
                          <span className="text-lg font-semibold">{data.count}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {data.conversionRate}% conv.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No lead analytics data available
            </div>
          )}
        </TabsContent>

        {/* Contacts Analytics Tab */}
        <TabsContent value="contacts" className="space-y-6">
          {contactsLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : contactAnalytics ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Engagement Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Engagement Score</span>
                      <span className="text-lg font-semibold text-purple-600">
                        {contactAnalytics.engagement?.avgScore || 0}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Contacts</span>
                      <span className="text-lg font-semibold">
                        {contactAnalytics.engagement?.activeContacts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-lg font-semibold text-green-600">
                        {contactAnalytics.engagement?.responseRate || 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Communication Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(contactAnalytics.communication || {}).map(([channel, data]) => (
                      <div key={channel} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{channel}</span>
                        <div className="text-right">
                          <span className="text-lg font-semibold">{data.count}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {data.successRate}% success
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contact analytics data available
            </div>
          )}
        </TabsContent>

        {/* Team Analytics Tab */}
        <TabsContent value="team" className="space-y-6">
          {teamLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : teamAnalytics ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamAnalytics.topPerformers?.slice(0, 5).map((performer, index) => (
                      <div key={performer.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="text-sm text-gray-800">{performer.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold">${(performer.revenue / 1000).toFixed(0)}K</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {performer.deals} deals
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Team Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Team Win Rate</span>
                      <span className="text-lg font-semibold text-green-600">
                        {teamAnalytics.performance?.winRate || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Deal Size</span>
                      <span className="text-lg font-semibold">
                        ${(teamAnalytics.performance?.avgDealSize / 1000 || 0).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Activity Score</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {teamAnalytics.performance?.activityScore || 0}/100
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No team analytics data available
            </div>
          )}
        </TabsContent>

        {/* Predictive Analytics Tab */}
        <TabsContent value="predictive" className="space-y-6">
          {/* AI Insights Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">AI-Powered Predictive Analytics</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadPredictiveInsights()}
                disabled={predictiveLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${predictiveLoading ? 'animate-spin' : ''}`} />
                Refresh Models
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAdvancedExport('predictive-insights', 'pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Insights
              </Button>
            </div>
          </div>

          {predictiveLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Predictive Insights Cards */}
              {predictiveInsights.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predictiveInsights.map((insight, index) => (
                    <Card key={index} className="border-none shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                            insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {insight.type === 'opportunity' ? <TrendingUp className="w-4 h-4" /> :
                             insight.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                             <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Advanced ML Models Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sales Forecasting */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Advanced Sales Forecasting
                    </CardTitle>
                    <p className="text-sm text-gray-600">ML-powered revenue predictions</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Forecast Models */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-600">
                            ${((predictiveAnalytics?.revenueForecast?.nextMonth || 0) / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-600">Linear Model</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-semibold text-green-600">
                            ${((predictiveAnalytics?.revenueForecast?.nextQuarter || 0) / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-600">Moving Avg</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-600">
                            ${((predictiveAnalytics?.revenueForecast?.nextYear || 0) / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-600">Exp. Smooth</div>
                        </div>
                      </div>
                      
                      {/* Forecast Chart */}
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={predictiveAnalytics?.forecastData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${(value/1000).toFixed(0)}K`, 'Revenue']} />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
                            <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Churn Prediction */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Customer Churn Prediction
                    </CardTitle>
                    <p className="text-sm text-gray-600">AI-driven retention insights</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Risk Metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            {predictiveAnalytics?.riskAnalysis?.churnRisk || 0}%
                          </div>
                          <div className="text-xs text-gray-600">High Risk</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {100 - (predictiveAnalytics?.riskAnalysis?.churnRisk || 0)}%
                          </div>
                          <div className="text-xs text-gray-600">Retention Rate</div>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Top Risk Factors</h4>
                        {['Low engagement', 'Payment delays', 'Support tickets', 'Usage decline'].map((factor, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{factor}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full" 
                                  style={{ width: `${Math.random() * 80 + 20}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{Math.floor(Math.random() * 30 + 50)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Scoring */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      AI Lead Scoring
                    </CardTitle>
                    <p className="text-sm text-gray-600">Intelligent lead prioritization</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Score Distribution */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-lg font-semibold text-green-600">24</div>
                          <div className="text-xs text-gray-600">Hot (80-100)</div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <div className="text-lg font-semibold text-yellow-600">45</div>
                          <div className="text-xs text-gray-600">Warm (50-79)</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="text-lg font-semibold text-gray-600">31</div>
                          <div className="text-xs text-gray-600">Cold (0-49)</div>
                        </div>
                      </div>

                      {/* Top Scoring Factors */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Scoring Factors</h4>
                        {[
                          { factor: 'Company size', weight: 25 },
                          { factor: 'Engagement level', weight: 20 },
                          { factor: 'Budget fit', weight: 18 },
                          { factor: 'Decision timeline', weight: 15 }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.factor}</span>
                            <span className="font-medium">{item.weight}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Trends */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Market Trend Analysis
                    </CardTitle>
                    <p className="text-sm text-gray-600">Industry insights & predictions</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Trend Indicators */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-600">+12.5%</div>
                          <div className="text-xs text-gray-600">Market Growth</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-600">87</div>
                          <div className="text-xs text-gray-600">Trend Score</div>
                        </div>
                      </div>

                      {/* Opportunity Areas */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Emerging Opportunities</h4>
                        {[
                          { area: 'Enterprise SaaS', growth: '+18%' },
                          { area: 'Remote Solutions', growth: '+25%' },
                          { area: 'AI Integration', growth: '+32%' }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{item.area}</span>
                            <Badge variant="secondary" className="text-green-600">
                              {item.growth}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Real-time Analytics Tab */}
        <TabsContent value="realtime" className="space-y-6">
          {/* Real-time Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Wifi className={`w-6 h-6 ${isRealTimeConnected ? 'text-green-500' : 'text-red-500'}`} />
                <h2 className="text-xl font-semibold">Live Analytics Dashboard</h2>
                <Badge variant={isRealTimeConnected ? "default" : "destructive"} className="text-xs">
                  {isRealTimeConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => realTimeService.connect()}
                disabled={isRealTimeConnected}
              >
                <Wifi className="w-4 h-4 mr-2" />
                Connect
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleAdvancedExport('realtime-metrics', 'csv')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Live Data
              </Button>
            </div>
          </div>

          {/* Live Notifications */}
          {notifications.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.slice(0, 3).map((notification, index) => (
                <Card key={index} className="border-none shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification.type === 'success' ? 'bg-green-100 text-green-600' :
                        notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {realtimeLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Real-time Metrics Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Live Users</p>
                        <p className="text-2xl font-bold text-green-600">
                          {realTimeMetrics.activeUsers || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+12% from yesterday</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Today's Revenue</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${((realTimeMetrics.todayRevenue || 0) / 1000).toFixed(1)}K
                        </p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-600">+8.5% from yesterday</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">New Leads</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {realTimeMetrics.newLeads || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                      <span className="text-xs text-purple-600">+15 in last hour</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {realTimeMetrics.conversionRate || 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Activity className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-xs text-orange-600">+2.3% this week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Live Activity Stream */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Live Activity Stream
                      <Badge variant="secondary" className="ml-auto">
                        {realtimeAnalytics?.liveActivities?.length || 0} events
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {realtimeAnalytics?.liveActivities?.slice(0, 15).map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'sale' ? 'bg-green-500' :
                            activity.type === 'lead' ? 'bg-blue-500' :
                            activity.type === 'meeting' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Live Performance Chart */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-500" />
                      Real-time Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={realTimeMetrics.performanceData || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="leads" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Activity Heatmap */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="w-5 h-5 text-purple-500" />
                      Team Activity Heatmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <Suspense fallback={<div className="h-full flex items-center justify-center">Loading heatmap...</div>}>
                        <HeatmapChart 
                          data={realTimeMetrics.teamActivity || []}
                          title="Team Performance"
                        />
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Alerts & Notifications */}
                <Card className="border-none shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      Live Alerts
                      <Badge variant="destructive" className="ml-auto">
                        {notifications.filter(n => n.priority === 'high').length} urgent
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.map((notification, index) => (
                        <div key={index} className={`p-3 rounded-lg border-l-4 ${
                          notification.priority === 'high' ? 'border-red-500 bg-red-50' :
                          notification.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <Badge 
                              variant={notification.priority === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Memoized chart components
const MemoizedPieChart = memo(({ data, colors }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, value }) => `${name}: ${value}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
));
MemoizedPieChart.displayName = 'MemoizedPieChart';

const MemoizedComposedChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis yAxisId="left" />
      <YAxis yAxisId="right" orientation="right" />
      <Tooltip />
      <Legend />
      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
      <Line yAxisId="right" type="monotone" dataKey="deals" stroke="#ef4444" strokeWidth={2} name="Deals Closed" />
    </ComposedChart>
  </ResponsiveContainer>
));
MemoizedComposedChart.displayName = 'MemoizedComposedChart';

const MemoizedBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="performance" fill="#22c55e" />
    </BarChart>
  </ResponsiveContainer>
));
MemoizedBarChart.displayName = 'MemoizedBarChart';

// Simple MetricCard component
const MetricCard = memo(({ title, value, change, icon: Icon, trend, color = 'blue' }) => {
  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {change}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${
            color === 'blue' ? 'bg-blue-100' :
            color === 'green' ? 'bg-green-100' :
            color === 'red' ? 'bg-red-100' :
            color === 'yellow' ? 'bg-yellow-100' :
            color === 'purple' ? 'bg-purple-100' :
            'bg-gray-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'red' ? 'text-red-600' :
              color === 'yellow' ? 'text-yellow-600' :
              color === 'purple' ? 'text-purple-600' :
              'text-gray-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
MetricCard.displayName = 'MetricCard';