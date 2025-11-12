import React, { useState, memo, useCallback } from "react";
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
  Filter
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

const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

// Mock data for demonstration
const mockDashboardMetrics = {
  totalRevenue: 125000,
  totalDeals: 45,
  totalLeads: 128,
  conversionRate: 35.2,
  revenueGrowth: 12.5,
  dealsGrowth: 8.3,
  leadsGrowth: -2.1,
  conversionGrowth: 5.7
};

const mockSalesData = [
  { month: 'Jan', revenue: 15000, deals: 8, leads: 25 },
  { month: 'Feb', revenue: 18000, deals: 12, leads: 30 },
  { month: 'Mar', revenue: 22000, deals: 15, leads: 28 },
  { month: 'Apr', revenue: 19000, deals: 10, leads: 32 },
  { month: 'May', revenue: 25000, deals: 18, leads: 35 },
  { month: 'Jun', revenue: 28000, deals: 20, leads: 40 }
];

const mockLeadSources = [
  { name: 'Website', value: 35, color: '#6366F1' },
  { name: 'Social Media', value: 25, color: '#8B5CF6' },
  { name: 'Email', value: 20, color: '#10B981' },
  { name: 'Referrals', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#EF4444' }
];

const mockDealStages = [
  { stage: 'Prospecting', count: 15, value: 45000 },
  { stage: 'Qualification', count: 12, value: 38000 },
  { stage: 'Proposal', count: 8, value: 28000 },
  { stage: 'Negotiation', count: 5, value: 22000 },
  { stage: 'Closed Won', count: 3, value: 15000 }
];

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

  // Export functionality
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      const exportConfig = {
        data: salesData || mockSalesData,
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

  // Mock data queries
  const { data: dashboardMetrics, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['dashboard-metrics', dateRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDashboardMetrics;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', dateRange],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockSalesData;
    },
    enabled: activeTab === 'sales',
    staleTime: 5 * 60 * 1000,
  });

  const { data: leadSources, isLoading: leadsLoading } = useQuery({
    queryKey: ['lead-sources', dateRange],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockLeadSources;
    },
    enabled: activeTab === 'leads',
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchDashboard();
    } finally {
      setRefreshing(false);
    }
  }, [refetchDashboard]);

  if (dashboardLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
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
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
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
                      {leadSources?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#6366F1" />
                  <Bar dataKey="deals" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
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
                      {leadSources?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deal Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDealStages.map((stage, index) => (
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
                  <p className="text-2xl font-bold text-blue-600">$2,778</p>
                  <p className="text-sm text-blue-700">+15% from last month</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900">Sales Cycle</h3>
                  <p className="text-2xl font-bold text-green-600">28 days</p>
                  <p className="text-sm text-green-700">-3 days from last month</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900">Win Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">35.2%</p>
                  <p className="text-sm text-purple-700">+2.1% from last month</p>
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