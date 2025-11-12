import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  FilterIcon,
  DownloadIcon,
  ShareIcon,
  CogIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
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
  ComposedChart,
  Scatter,
  ScatterChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';

// Color schemes for different chart types
const CHART_COLORS = {
  primary: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
  success: ['#10B981', '#059669', '#047857', '#065F46'],
  warning: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
  danger: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
  purple: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
  gradient: [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ]
};

// Advanced metrics calculations
const calculateMetrics = (data, timeframe) => {
  if (!data || data.length === 0) return {};

  const currentPeriod = data.slice(-timeframe);
  const previousPeriod = data.slice(-timeframe * 2, -timeframe);

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 'stable';
    const recent = values.slice(-3);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(Math.ceil(recent.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.05) return 'increasing';
    if (secondAvg < firstAvg * 0.95) return 'decreasing';
    return 'stable';
  };

  return {
    currentValue: currentPeriod.reduce((sum, item) => sum + (item.value || 0), 0),
    previousValue: previousPeriod.reduce((sum, item) => sum + (item.value || 0), 0),
    growth: calculateGrowth(
      currentPeriod.reduce((sum, item) => sum + (item.value || 0), 0),
      previousPeriod.reduce((sum, item) => sum + (item.value || 0), 0)
    ),
    trend: calculateTrend(data.map(item => item.value || 0)),
    average: currentPeriod.reduce((sum, item) => sum + (item.value || 0), 0) / currentPeriod.length,
    peak: Math.max(...currentPeriod.map(item => item.value || 0)),
    low: Math.min(...currentPeriod.map(item => item.value || 0))
  };
};

// Custom chart components
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricCard = ({ title, value, change, trend, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const trendIcon = trend === 'increasing' ? TrendingUpIcon : 
                   trend === 'decreasing' ? TrendingDownIcon : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className="text-right">
          {change !== undefined && (
            <div className={`flex items-center space-x-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendIcon && <trendIcon className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ChartContainer = ({ title, children, actions, loading = false }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
  >
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
    {loading ? (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ) : (
      <div className="h-64">
        {children}
      </div>
    )}
  </motion.div>
);

const AdvancedAnalytics = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'leads', 'conversion']);
  const [chartType, setChartType] = useState('line');
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    source: 'all',
    status: 'all',
    team: 'all'
  });
  const [viewMode, setViewMode] = useState('overview');
  const { showNotification } = useNotifications();

  // Fetch analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery(
    ['analytics', timeframe, filters],
    async () => {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}&${new URLSearchParams(filters)}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000 // Consider data stale after 2 minutes
    }
  );

  // Process and calculate metrics
  const processedData = useMemo(() => {
    if (!analyticsData) return null;

    const timeframeMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    return {
      revenue: calculateMetrics(analyticsData.revenue || [], timeframeMap[timeframe]),
      leads: calculateMetrics(analyticsData.leads || [], timeframeMap[timeframe]),
      conversion: calculateMetrics(analyticsData.conversion || [], timeframeMap[timeframe]),
      activities: calculateMetrics(analyticsData.activities || [], timeframeMap[timeframe]),
      deals: calculateMetrics(analyticsData.deals || [], timeframeMap[timeframe])
    };
  }, [analyticsData, timeframe]);

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!analyticsData) return {};

    return {
      timeline: analyticsData.timeline || [],
      sources: analyticsData.sources || [],
      conversion_funnel: analyticsData.conversion_funnel || [],
      team_performance: analyticsData.team_performance || [],
      geographic: analyticsData.geographic || [],
      product_performance: analyticsData.product_performance || [],
      customer_segments: analyticsData.customer_segments || [],
      pipeline_health: analyticsData.pipeline_health || []
    };
  }, [analyticsData]);

  // Export functionality
  const handleExport = async (format) => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, timeframe, filters, metrics: selectedMetrics })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeframe}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Analytics exported successfully', 'success');
    } catch (error) {
      showNotification('Failed to export analytics', 'error');
    }
  };

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['overview', 'detailed', 'custom'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <DownloadIcon className="h-5 w-5" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="p-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Export as CSV
                  </button>
                </div>
              </div>
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <ShareIcon className="h-5 w-5" />
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <CogIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {processedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${(processedData.revenue.currentValue || 0).toLocaleString()}`}
            change={processedData.revenue.growth}
            trend={processedData.revenue.trend}
            icon={ChartBarIcon}
            color="green"
          />
          <MetricCard
            title="New Leads"
            value={(processedData.leads.currentValue || 0).toLocaleString()}
            change={processedData.leads.growth}
            trend={processedData.leads.trend}
            icon={TrendingUpIcon}
            color="blue"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${(processedData.conversion.currentValue || 0).toFixed(1)}%`}
            change={processedData.conversion.growth}
            trend={processedData.conversion.trend}
            icon={TrendingUpIcon}
            color="purple"
          />
          <MetricCard
            title="Active Deals"
            value={(processedData.deals.currentValue || 0).toLocaleString()}
            change={processedData.deals.growth}
            trend={processedData.deals.trend}
            icon={ChartBarIcon}
            color="yellow"
          />
          <MetricCard
            title="Activities"
            value={(processedData.activities.currentValue || 0).toLocaleString()}
            change={processedData.activities.growth}
            trend={processedData.activities.trend}
            icon={CalendarIcon}
            color="red"
          />
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Timeline */}
        <ChartContainer
          title="Revenue Timeline"
          loading={isLoading}
          actions={
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={chartData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip formatter={(value) => `$${value.toLocaleString()}`} />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.primary[0]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary[0], strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={chartData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip formatter={(value) => `$${value.toLocaleString()}`} />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.primary[0]}
                  fill={CHART_COLORS.primary[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            )}
            {chartType === 'bar' && (
              <BarChart data={chartData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip formatter={(value) => `$${value.toLocaleString()}`} />} />
                <Bar dataKey="revenue" fill={CHART_COLORS.primary[0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>

        {/* Lead Sources */}
        <ChartContainer title="Lead Sources" loading={isLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.sources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS.gradient[index % CHART_COLORS.gradient.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Conversion Funnel */}
        <ChartContainer title="Conversion Funnel" loading={isLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={chartData.conversion_funnel}
                isAnimationActive
              >
                <LabelList position="center" fill="#fff" stroke="none" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Team Performance */}
        <ChartContainer title="Team Performance" loading={isLoading}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.team_performance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="name" type="category" stroke="#666" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="deals" fill={CHART_COLORS.success[0]} />
              <Bar dataKey="revenue" fill={CHART_COLORS.primary[0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Detailed Analytics Section */}
      <AnimatePresence>
        {viewMode === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Geographic Performance */}
            <ChartContainer title="Geographic Performance" loading={isLoading}>
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={chartData.geographic}
                  dataKey="value"
                  ratio={4/3}
                  stroke="#fff"
                  fill={CHART_COLORS.primary[0]}
                />
              </ResponsiveContainer>
            </ChartContainer>

            {/* Customer Segments */}
            <ChartContainer title="Customer Segments" loading={isLoading}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData.customer_segments}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="segment" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Value"
                    dataKey="value"
                    stroke={CHART_COLORS.purple[0]}
                    fill={CHART_COLORS.purple[0]}
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Pipeline Health */}
            <ChartContainer title="Pipeline Health" loading={isLoading}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.pipeline_health}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="stage" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill={CHART_COLORS.primary[0]} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.success[0]}
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Analytics Builder */}
      <AnimatePresence>
        {viewMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Analytics Builder</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Metrics
                </label>
                <div className="space-y-2">
                  {['revenue', 'leads', 'conversion', 'activities', 'deals'].map((metric) => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filters
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({...filters, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="social">Social Media</option>
                    <option value="email">Email</option>
                    <option value="referral">Referral</option>
                  </select>

                  <select
                    value={filters.team}
                    onChange={(e) => setFilters({...filters, team: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Teams</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Options
                </label>
                <div className="space-y-3">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="scatter">Scatter Plot</option>
                  </select>

                  <button
                    onClick={() => refetch()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Activity Feed */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {analyticsData?.recent_activities?.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'lead' ? 'bg-blue-500' :
                activity.type === 'deal' ? 'bg-green-500' :
                activity.type === 'activity' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {activity.value && `$${activity.value.toLocaleString()}`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;