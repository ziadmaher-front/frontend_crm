// Revenue Optimization Dashboard
// Comprehensive dashboard for revenue analytics, pricing optimization, and strategic insights

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Download,
  RefreshCw,
  Zap,
  TrendingDown,
  Calendar,
  Users,
  Award,
  Brain
} from 'lucide-react';
import { useRevenueOptimization } from '../hooks/useRevenueOptimization';
import { format, addDays } from 'date-fns';

const RevenueOptimizationDashboard = () => {
  const {
    loading,
    error,
    revenueMetrics,
    generateRevenueForecast,
    optimizeRevenueStrategy,
    getRevenueInsights,
    clearCache
  } = useRevenueOptimization();

  const [activeTab, setActiveTab] = useState('overview');
  const [forecastData, setForecastData] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [forecastPeriod, setForecastPeriod] = useState(90);
  const [targetRevenue, setTargetRevenue] = useState(1000000);
  const [refreshing, setRefreshing] = useState(false);

  // Get revenue insights
  const insights = useMemo(() => getRevenueInsights(), [getRevenueInsights]);

  // Load initial data
  useEffect(() => {
    loadForecastData();
    loadOptimizationData();
  }, []);

  const loadForecastData = async () => {
    setRefreshing(true);
    try {
      const result = await generateRevenueForecast({
        forecastPeriod,
        granularity: 'weekly',
        includeSeasonality: true,
        includeMarketFactors: true
      });
      
      if (result.success) {
        setForecastData(result.data);
      }
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadOptimizationData = async () => {
    try {
      const result = await optimizeRevenueStrategy(
        { targetRevenue, targetMargin: 0.3, maxRisk: 0.2 },
        { maxDiscountPercent: 25, minMarginPercent: 15 }
      );
      
      if (result.success) {
        setOptimizationData(result.data);
      }
    } catch (err) {
      console.error('Failed to load optimization data:', err);
    }
  };

  const handleRefresh = async () => {
    clearCache();
    await Promise.all([loadForecastData(), loadOptimizationData()]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'forecast', label: 'Revenue Forecast', icon: TrendingUp },
    { id: 'optimization', label: 'Optimization', icon: Target },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-blue-600" />
                Revenue Optimization Engine
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered revenue analytics and optimization strategies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Pipeline"
            value={formatCurrency(revenueMetrics.totalPipeline)}
            change="+12.5%"
            trend="up"
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            title="Weighted Pipeline"
            value={formatCurrency(revenueMetrics.weightedPipeline)}
            change="+8.3%"
            trend="up"
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Avg Deal Size"
            value={formatCurrency(revenueMetrics.averageDealSize)}
            change="-2.1%"
            trend="down"
            icon={Target}
            color="orange"
          />
          <MetricCard
            title="Conversion Rate"
            value={formatPercentage(revenueMetrics.conversionRate)}
            change="+5.7%"
            trend="up"
            icon={Award}
            color="purple"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              metrics={revenueMetrics}
              insights={insights}
              loading={loading}
            />
          )}
          
          {activeTab === 'forecast' && (
            <ForecastTab
              forecastData={forecastData}
              forecastPeriod={forecastPeriod}
              setForecastPeriod={setForecastPeriod}
              onRefresh={loadForecastData}
              loading={loading}
            />
          )}
          
          {activeTab === 'optimization' && (
            <OptimizationTab
              optimizationData={optimizationData}
              targetRevenue={targetRevenue}
              setTargetRevenue={setTargetRevenue}
              onRefresh={loadOptimizationData}
              loading={loading}
            />
          )}
          
          {activeTab === 'insights' && (
            <InsightsTab
              insights={insights}
              metrics={revenueMetrics}
              loading={loading}
            />
          )}
          
          {activeTab === 'pricing' && (
            <PricingTab
              metrics={revenueMetrics}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, trend, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ metrics, insights, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Pipeline Health */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-blue-600" />
        Pipeline Health
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Active Deals</span>
          <span className="font-semibold">{metrics.activeDeals}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Deals</span>
          <span className="font-semibold">{metrics.dealCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Conversion Rate</span>
          <span className="font-semibold">{(metrics.conversionRate * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${metrics.conversionRate * 100}%` }}
          ></div>
        </div>
      </div>
    </div>

    {/* Quick Insights */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        Quick Insights
      </h3>
      <div className="space-y-3">
        {insights.alerts.slice(0, 2).map((alert, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">{alert.message}</p>
              <p className="text-xs text-yellow-600 mt-1">{alert.recommendation}</p>
            </div>
          </div>
        ))}
        {insights.insights.slice(0, 1).map((insight, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">{insight.message}</p>
              <p className="text-xs text-blue-600 mt-1">{insight.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Forecast Tab Component
const ForecastTab = ({ forecastData, forecastPeriod, setForecastPeriod, onRefresh, loading }) => (
  <div className="space-y-6">
    {/* Forecast Controls */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Forecast Parameters</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Generate Forecast
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forecast Period (days)
          </label>
          <select
            value={forecastPeriod}
            onChange={(e) => setForecastPeriod(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>
    </div>

    {/* Forecast Results */}
    {forecastData && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Forecast</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Forecast Chart Placeholder</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Summary</h3>
          <div className="space-y-4">
            {forecastData.insights?.map((insight, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{insight.title}</p>
                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// Optimization Tab Component
const OptimizationTab = ({ optimizationData, targetRevenue, setTargetRevenue, onRefresh, loading }) => (
  <div className="space-y-6">
    {/* Optimization Controls */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Optimization Targets</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Optimize Strategy
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Revenue
          </label>
          <input
            type="number"
            value={targetRevenue}
            onChange={(e) => setTargetRevenue(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000000"
          />
        </div>
      </div>
    </div>

    {/* Optimization Results */}
    {optimizationData && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Strategy</h3>
          <div className="space-y-4">
            {optimizationData.roadmap?.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">{item.action}</p>
                  <p className="text-xs text-green-600 mt-1">Impact: {item.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue Increase</span>
              <span className="font-semibold text-green-600">
                +{optimizationData.expectedImpact?.revenueIncrease || '15%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Margin Improvement</span>
              <span className="font-semibold text-green-600">
                +{optimizationData.expectedImpact?.marginImprovement || '8%'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Risk Level</span>
              <span className="font-semibold text-yellow-600">
                {optimizationData.riskAssessment?.level || 'Medium'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Insights Tab Component
const InsightsTab = ({ insights, metrics, loading }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* AI Insights */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-purple-600" />
        AI-Powered Insights
      </h3>
      <div className="space-y-4">
        {insights.insights.map((insight, index) => (
          <div key={index} className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-800">{insight.message}</p>
                <p className="text-xs text-purple-600 mt-1">Action: {insight.action}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                  {insight.potential} potential
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Alerts & Warnings */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        Alerts & Recommendations
      </h3>
      <div className="space-y-4">
        {insights.alerts.map((alert, index) => (
          <div key={index} className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{alert.message}</p>
                <p className="text-xs text-red-600 mt-1">{alert.recommendation}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  {alert.impact} impact
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Pricing Tab Component
const PricingTab = ({ metrics, loading }) => (
  <div className="space-y-6">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Strategy Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(metrics.averageDealSize)}</div>
          <div className="text-sm text-gray-600 mt-1">Average Deal Size</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{(metrics.conversionRate * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600 mt-1">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{metrics.activeDeals}</div>
          <div className="text-sm text-gray-600 mt-1">Active Opportunities</div>
        </div>
      </div>
    </div>
  </div>
);

export default RevenueOptimizationDashboard;