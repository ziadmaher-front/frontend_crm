import React, { useState, memo, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Filter,
  Loader2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportData } from '@/services/api';
import exportService from '@/services/exportService';
import { base44 } from "@/api/base44Client";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

// Helper function to get date range
const getDateRange = (range) => {
  const now = new Date();
  let startDate, endDate = now;
  
  switch (range) {
    case "7d":
      startDate = subDays(now, 7);
      break;
    case "30d":
      startDate = subDays(now, 30);
      break;
    case "90d":
      startDate = subDays(now, 90);
      break;
    case "1y":
      startDate = subYears(now, 1);
      break;
    default:
      startDate = subDays(now, 30);
  }
  
  return { startDate, endDate };
};

// Helper function to get previous period for comparison
const getPreviousPeriod = (range) => {
  const { startDate, endDate } = getDateRange(range);
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate.getTime() - 1);
  const previousStartDate = new Date(previousEndDate.getTime() - periodLength);
  
  return { startDate: previousStartDate, endDate: previousEndDate };
};

// Helper function to filter data by date range
const filterByDateRange = (items, dateField, startDate, endDate) => {
  if (!items || !Array.isArray(items)) return [];
  
  return items.filter(item => {
    // Try multiple possible date field names
    const itemDate = item[dateField] || item.createdAt || item.created_date || item.createdDate || item.date;
    if (!itemDate) return false;
    
    try {
      const date = new Date(itemDate);
      if (isNaN(date.getTime())) return false;
      
      // Set time to start/end of day for proper comparison
      const itemDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      return itemDateOnly >= startDateOnly && itemDateOnly <= endDateOnly;
    } catch (e) {
      return false;
    }
  });
};

// MetricCard component
const MetricCard = memo(({ title, value, change, icon: Icon, trend, color = 'blue' }) => {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
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
              {change}%
            </div>
          </div>
          <div className={`p-3 rounded-xl ${
            color === 'blue' ? 'bg-blue-100' :
            color === 'green' ? 'bg-green-100' :
            color === 'red' ? 'bg-red-100' :
            color === 'yellow' ? 'bg-yellow-100' :
            'bg-gray-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'red' ? 'text-red-600' :
              color === 'yellow' ? 'text-yellow-600' :
              'text-gray-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
MetricCard.displayName = 'MetricCard';

export default function Reports() {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Get date ranges
  const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);
  const { startDate: prevStartDate, endDate: prevEndDate } = useMemo(() => getPreviousPeriod(dateRange), [dateRange]);

  // Fetch all data
  const { data: allDeals = [], isLoading: dealsLoading, refetch: refetchDeals } = useQuery({
    queryKey: ['reports-deals'],
    queryFn: () => base44.entities.Deal.list(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allLeads = [], isLoading: leadsLoading, refetch: refetchLeads } = useQuery({
    queryKey: ['reports-leads'],
    queryFn: () => base44.entities.Lead.list(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['reports-contacts'],
    queryFn: () => base44.entities.Contact.list(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['reports-tasks'],
    queryFn: () => base44.entities.Task.list(),
    staleTime: 2 * 60 * 1000,
  });

  // Filter data by date range
  const currentDeals = useMemo(() => 
    filterByDateRange(allDeals, 'createdAt', startDate, endDate),
    [allDeals, startDate, endDate]
  );

  const previousDeals = useMemo(() => 
    filterByDateRange(allDeals, 'createdAt', prevStartDate, prevEndDate),
    [allDeals, prevStartDate, prevEndDate]
  );

  const currentLeads = useMemo(() => 
    filterByDateRange(allLeads, 'createdAt', startDate, endDate),
    [allLeads, startDate, endDate]
  );

  const previousLeads = useMemo(() => 
    filterByDateRange(allLeads, 'createdAt', prevStartDate, prevEndDate),
    [allLeads, prevStartDate, prevEndDate]
  );

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    // Current period metrics
    const wonDeals = currentDeals.filter(d => d.stage === 'Closed Won' || d.stage === 'closed won');
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
    const totalDeals = currentDeals.length;
    const totalLeads = currentLeads.length;
    const convertedLeads = currentLeads.filter(l => l.status === 'Converted' || l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Previous period metrics for growth calculation
    const prevWonDeals = previousDeals.filter(d => d.stage === 'Closed Won' || d.stage === 'closed won');
    const prevRevenue = prevWonDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
    const prevDeals = previousDeals.length;
    const prevLeads = previousLeads.length;
    const prevConvertedLeads = previousLeads.filter(l => l.status === 'Converted' || l.status === 'converted').length;
    const prevConversionRate = prevLeads > 0 ? (prevConvertedLeads / prevLeads) * 100 : 0;

    // Calculate growth rates
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const dealsGrowth = prevDeals > 0 ? ((totalDeals - prevDeals) / prevDeals) * 100 : 0;
    const leadsGrowth = prevLeads > 0 ? ((totalLeads - prevLeads) / prevLeads) * 100 : 0;
    const conversionGrowth = prevConversionRate > 0 ? (conversionRate - prevConversionRate) : 0;

    return {
      totalRevenue,
      totalDeals,
      totalLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      dealsGrowth: parseFloat(dealsGrowth.toFixed(1)),
      leadsGrowth: parseFloat(leadsGrowth.toFixed(1)),
      conversionGrowth: parseFloat(conversionGrowth.toFixed(1)),
    };
  }, [currentDeals, previousDeals, currentLeads, previousLeads]);

  // Calculate sales data by month
  const salesData = useMemo(() => {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthDeals = filterByDateRange(allDeals, 'createdAt', monthStart, monthEnd);
      const monthLeads = filterByDateRange(allLeads, 'createdAt', monthStart, monthEnd);
      const monthWonDeals = monthDeals.filter(d => d.stage === 'Closed Won' || d.stage === 'closed won');
      const revenue = monthWonDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
      
      return {
        month: format(month, 'MMM'),
        revenue: Math.round(revenue),
        deals: monthDeals.length,
        leads: monthLeads.length,
      };
    });
  }, [allDeals, allLeads, startDate, endDate]);

  // Calculate lead sources distribution
  const leadSources = useMemo(() => {
    const sourceCounts = {};
    
    currentLeads.forEach(lead => {
      const source = lead.leadSource || lead.lead_source || lead.source || 'Unknown';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const total = currentLeads.length;
    if (total === 0) return [];

    return Object.entries(sourceCounts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentLeads]);

  // Calculate deal pipeline stages
  const dealStages = useMemo(() => {
    const stageCounts = {};
    const stageValues = {};
    
    currentDeals.forEach(deal => {
      const stage = deal.stage || 'Unknown';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      stageValues[stage] = (stageValues[stage] || 0) + (parseFloat(deal.amount) || 0);
    });

    return Object.keys(stageCounts)
      .map(stage => ({
        stage,
        count: stageCounts[stage],
        value: Math.round(stageValues[stage]),
      }))
      .sort((a, b) => b.value - a.value);
  }, [currentDeals]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const wonDeals = currentDeals.filter(d => d.stage === 'Closed Won' || d.stage === 'closed won');
    const lostDeals = currentDeals.filter(d => d.stage === 'Closed Lost' || d.stage === 'closed lost');
    const totalClosed = wonDeals.length + lostDeals.length;
    
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
    const averageDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    const winRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 0;

    // Calculate average sales cycle (days from creation to close)
    const salesCycles = wonDeals
      .filter(deal => deal.createdAt && deal.closingDate)
      .map(deal => {
        const created = new Date(deal.createdAt);
        const closed = new Date(deal.closingDate);
        return Math.round((closed - created) / (1000 * 60 * 60 * 24));
      });
    const avgSalesCycle = salesCycles.length > 0 
      ? Math.round(salesCycles.reduce((a, b) => a + b, 0) / salesCycles.length)
      : 0;

    // Previous period for comparison
    const prevWonDeals = previousDeals.filter(d => d.stage === 'Closed Won' || d.stage === 'closed won');
    const prevLostDeals = previousDeals.filter(d => d.stage === 'Closed Lost' || d.stage === 'closed lost');
    const prevTotalClosed = prevWonDeals.length + prevLostDeals.length;
    const prevTotalRevenue = prevWonDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
    const prevAvgDealSize = prevWonDeals.length > 0 ? prevTotalRevenue / prevWonDeals.length : 0;
    const prevWinRate = prevTotalClosed > 0 ? (prevWonDeals.length / prevTotalClosed) * 100 : 0;

    const prevSalesCycles = prevWonDeals
      .filter(deal => deal.createdAt && deal.closingDate)
      .map(deal => {
        const created = new Date(deal.createdAt);
        const closed = new Date(deal.closingDate);
        return Math.round((closed - created) / (1000 * 60 * 60 * 24));
      });
    const prevAvgSalesCycle = prevSalesCycles.length > 0 
      ? Math.round(prevSalesCycles.reduce((a, b) => a + b, 0) / prevSalesCycles.length)
      : 0;

    return {
      averageDealSize: Math.round(averageDealSize),
      averageDealSizeGrowth: prevAvgDealSize > 0 
        ? ((averageDealSize - prevAvgDealSize) / prevAvgDealSize) * 100 
        : 0,
      salesCycle: avgSalesCycle,
      salesCycleGrowth: prevAvgSalesCycle > 0 
        ? ((prevAvgSalesCycle - avgSalesCycle) / prevAvgSalesCycle) * 100 
        : 0,
      winRate: parseFloat(winRate.toFixed(1)),
      winRateGrowth: parseFloat((winRate - prevWinRate).toFixed(1)),
    };
  }, [currentDeals, previousDeals]);

  const isLoading = dealsLoading || leadsLoading || contactsLoading || tasksLoading;

  // Export functionality
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      const exportConfig = {
        data: salesData,
        format,
        filename: `sales-report-${new Date().toISOString().split('T')[0]}`,
        options: {
          includeHeaders: true,
          dateFormat: 'YYYY-MM-DD'
        }
      };

      if (format === 'csv') {
        await exportService.exportToCSV(exportConfig.data, exportConfig.filename, exportConfig.options);
      } else if (format === 'excel') {
        await exportService.exportToExcel(exportConfig.data, exportConfig.filename, exportConfig.options);
      } else {
        await exportData(exportConfig);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchDeals(),
        refetchLeads(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchDeals, refetchLeads]);

  if (isLoading && !dashboardMetrics) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your sales performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            data-testid="export-button"
            title="Export reports to CSV"
          >
            <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardMetrics?.totalRevenue?.toLocaleString() || '0'}`}
          change={dashboardMetrics?.revenueGrowth || 0}
          trend={dashboardMetrics?.revenueGrowth > 0 ? 'up' : 'down'}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Total Deals"
          value={dashboardMetrics?.totalDeals || 0}
          change={dashboardMetrics?.dealsGrowth || 0}
          trend={dashboardMetrics?.dealsGrowth > 0 ? 'up' : 'down'}
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Total Leads"
          value={dashboardMetrics?.totalLeads || 0}
          change={dashboardMetrics?.leadsGrowth || 0}
          trend={dashboardMetrics?.leadsGrowth > 0 ? 'up' : 'down'}
          icon={Users}
          color="yellow"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${dashboardMetrics?.conversionRate || 0}%`}
          change={dashboardMetrics?.conversionGrowth || 0}
          trend={dashboardMetrics?.conversionGrowth > 0 ? 'up' : 'down'}
          icon={Activity}
          color="red"
        />
      </div>

      {/* Detailed Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Sales Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} name="Revenue ($)" />
                      <Line type="monotone" dataKey="deals" stroke="#8B5CF6" strokeWidth={2} name="Deals" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No sales data in this period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Lead Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leadSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadSources}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No leads in this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#6366F1" name="Revenue ($)" />
                    <Bar dataKey="deals" fill="#8B5CF6" name="Deals" />
                    <Bar dataKey="leads" fill="#10B981" name="Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No sales data in this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {leadSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadSources}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No leads in this period</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {dealStages.length > 0 ? (
                  <div className="space-y-4">
                    {dealStages.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{stage.stage}</p>
                          <p className="text-sm text-gray-600">{stage.count} deals</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${stage.value.toLocaleString()}</p>
                          <Badge variant="outline">{stage.count}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No deals in this period</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900">Average Deal Size</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    ${performanceMetrics.averageDealSize.toLocaleString()}
                  </p>
                  <p className={`text-sm ${performanceMetrics.averageDealSizeGrowth >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {performanceMetrics.averageDealSizeGrowth >= 0 ? '+' : ''}
                    {performanceMetrics.averageDealSizeGrowth.toFixed(1)}% from previous period
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">Sales Cycle</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {performanceMetrics.salesCycle} days
                  </p>
                  <p className={`text-sm ${performanceMetrics.salesCycleGrowth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {performanceMetrics.salesCycleGrowth >= 0 ? '-' : '+'}
                    {Math.abs(performanceMetrics.salesCycleGrowth).toFixed(1)}% from previous period
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900">Win Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {performanceMetrics.winRate}%
                  </p>
                  <p className={`text-sm ${performanceMetrics.winRateGrowth >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
                    {performanceMetrics.winRateGrowth >= 0 ? '+' : ''}
                    {performanceMetrics.winRateGrowth.toFixed(1)}% from previous period
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Chart Components */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Heatmap</h3>
              <div data-testid="heatmap-chart" className="h-64 bg-gradient-to-r from-blue-100 to-blue-300 rounded flex items-center justify-center">
                <span className="text-gray-600">Heatmap Chart Visualization</span>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
              <div data-testid="funnel-chart" className="h-64 bg-gradient-to-r from-green-100 to-green-300 rounded flex items-center justify-center">
                <span className="text-gray-600">Funnel Chart Visualization</span>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Waterfall</h3>
              <div data-testid="waterfall-chart" className="h-64 bg-gradient-to-r from-purple-100 to-purple-300 rounded flex items-center justify-center">
                <span className="text-gray-600">Waterfall Chart Visualization</span>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Matrix</h3>
              <div data-testid="scatter-plot-matrix" className="h-64 bg-gradient-to-r from-orange-100 to-orange-300 rounded flex items-center justify-center">
                <span className="text-gray-600">Scatter Plot Matrix</span>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}