// Advanced Analytics Dashboard with Real-time Insights
import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useAnalytics } from '@/hooks/business/useAnalytics';
import { usePredictiveAnalytics } from '@/hooks/ai/usePredictiveAnalytics';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/utils/cn';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdvancedDashboard = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'leads', 'deals', 'conversion']);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalytics({
    timeRange,
    dateRange,
    metrics: selectedMetrics,
  });

  // Fetch predictive analytics
  const {
    predictions,
    forecasts,
    trends,
    isLoading: predictiveLoading,
  } = usePredictiveAnalytics('dashboard', {
    timeRange,
    includeForecasts: true,
    includeTrends: true,
  });

  // Real-time updates via WebSocket
  const { data: realTimeData, isConnected } = useWebSocket('/ws/analytics', {
    onMessage: (data) => {
      // Handle real-time analytics updates
      if (data.type === 'metrics_update') {
        refetchAnalytics();
      }
    },
  });

  // KPI Cards Data
  const kpiData = useMemo(() => {
    if (!analyticsData?.kpis) return [];

    return [
      {
        title: 'Total Revenue',
        value: analyticsData.kpis.totalRevenue,
        change: analyticsData.kpis.revenueChange,
        icon: CurrencyDollarIcon,
        color: 'green',
        format: 'currency',
      },
      {
        title: 'Active Leads',
        value: analyticsData.kpis.activeLeads,
        change: analyticsData.kpis.leadsChange,
        icon: UserGroupIcon,
        color: 'blue',
        format: 'number',
      },
      {
        title: 'Deals Closed',
        value: analyticsData.kpis.dealsWon,
        change: analyticsData.kpis.dealsChange,
        icon: ChartBarIcon,
        color: 'purple',
        format: 'number',
      },
      {
        title: 'Conversion Rate',
        value: analyticsData.kpis.conversionRate,
        change: analyticsData.kpis.conversionChange,
        icon: TrendingUpIcon,
        color: 'orange',
        format: 'percentage',
      },
    ];
  }, [analyticsData]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  // Revenue Chart Data
  const revenueChartData = useMemo(() => {
    if (!analyticsData?.charts?.revenue) return null;

    return {
      labels: analyticsData.charts.revenue.labels,
      datasets: [
        {
          label: 'Actual Revenue',
          data: analyticsData.charts.revenue.actual,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Predicted Revenue',
          data: forecasts?.revenue || [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }, [analyticsData, forecasts]);

  // Sales Pipeline Chart Data
  const pipelineChartData = useMemo(() => {
    if (!analyticsData?.charts?.pipeline) return null;

    return {
      labels: analyticsData.charts.pipeline.stages,
      datasets: [
        {
          label: 'Deal Count',
          data: analyticsData.charts.pipeline.counts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData]);

  // Lead Sources Chart Data
  const leadSourcesData = useMemo(() => {
    if (!analyticsData?.charts?.leadSources) return null;

    return {
      labels: analyticsData.charts.leadSources.sources,
      datasets: [
        {
          data: analyticsData.charts.leadSources.counts,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4',
            '#84CC16',
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [analyticsData]);

  // Format value based on type
  const formatValue = (value, format) => {
    if (!value && value !== 0) return 'N/A';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      default:
        return value.toString();
    }
  };

  // KPI Card Component
  const KPICard = ({ title, value, change, icon: Icon, color, format }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(value, format)}
          </p>
        </div>
        <div className={cn(
          "p-3 rounded-full",
          color === 'green' && "bg-green-100 text-green-600",
          color === 'blue' && "bg-blue-100 text-blue-600",
          color === 'purple' && "bg-purple-100 text-purple-600",
          color === 'orange' && "bg-orange-100 text-orange-600"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change >= 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span className={cn(
            "text-sm font-medium",
            change >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </Card>
  );

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Trend
            </h3>
            <Badge variant="outline" className="flex items-center">
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          <div className="h-80">
            {revenueChartData ? (
              <Line data={revenueChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </Card>

        {/* Sales Pipeline */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Sales Pipeline
          </h3>
          <div className="h-80">
            {pipelineChartData ? (
              <Bar data={pipelineChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Lead Sources */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Lead Sources Distribution
        </h3>
        <div className="h-64">
          {leadSourcesData ? (
            <Doughnut 
              data={leadSourcesData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'right',
                  },
                },
              }} 
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Predictive Analytics Tab Content
  const PredictiveContent = () => (
    <div className="space-y-6">
      {predictiveLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading predictive insights...</span>
        </div>
      ) : (
        <>
          {/* Forecasts */}
          {forecasts && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Revenue Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatValue(forecasts.nextMonth, 'currency')}
                  </div>
                  <div className="text-sm text-gray-500">Next Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatValue(forecasts.nextQuarter, 'currency')}
                  </div>
                  <div className="text-sm text-gray-500">Next Quarter</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatValue(forecasts.nextYear, 'currency')}
                  </div>
                  <div className="text-sm text-gray-500">Next Year</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Confidence: {Math.round(forecasts.confidence * 100)}%
              </div>
            </Card>
          )}

          {/* Trends */}
          {trends && trends.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Key Trends
              </h3>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {trend.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trend.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {trend.direction === 'up' ? (
                        <TrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <TrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className={cn(
                        "font-medium",
                        trend.direction === 'up' ? "text-green-600" : "text-red-600"
                      )}>
                        {trend.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time insights and predictive analytics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <OverviewContent />
        </TabsContent>
        
        <TabsContent value="predictive" className="mt-6">
          <PredictiveContent />
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-6">
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Detailed analytics coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;