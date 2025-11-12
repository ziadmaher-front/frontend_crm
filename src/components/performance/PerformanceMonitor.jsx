import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CpuChipIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SignalIcon,
  WifiIcon,
  CloudIcon,
  DatabaseIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  EyeIcon,
  Cog6ToothIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  InformationCircleIcon,
  FireIcon,
  BeakerIcon,
  CubeIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  SparklesIcon
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
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

// Performance monitoring engine
class PerformanceEngine {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      network: { warning: 80, critical: 95 },
      responseTime: { warning: 1000, critical: 3000 },
      errorRate: { warning: 1, critical: 5 }
    };
  }

  // Real-time metrics collection
  collectMetrics() {
    const timestamp = Date.now();
    
    // Simulate real-time metrics (in production, these would come from actual monitoring)
    const metrics = {
      timestamp,
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100,
      network: Math.random() * 100,
      responseTime: Math.random() * 2000 + 200,
      errorRate: Math.random() * 10,
      throughput: Math.random() * 1000 + 500,
      activeUsers: Math.floor(Math.random() * 500) + 100,
      dbConnections: Math.floor(Math.random() * 50) + 10,
      cacheHitRate: Math.random() * 100
    };

    this.metrics.set(timestamp, metrics);
    this.checkThresholds(metrics);
    
    return metrics;
  }

  // Threshold monitoring
  checkThresholds(metrics) {
    Object.entries(this.thresholds).forEach(([metric, thresholds]) => {
      const value = metrics[metric];
      if (value > thresholds.critical) {
        this.createAlert(metric, 'critical', value, thresholds.critical);
      } else if (value > thresholds.warning) {
        this.createAlert(metric, 'warning', value, thresholds.warning);
      }
    });
  }

  createAlert(metric, severity, value, threshold) {
    const alert = {
      id: Math.random().toString(36).substr(2, 9),
      metric,
      severity,
      value,
      threshold,
      timestamp: Date.now(),
      message: `${metric.toUpperCase()} ${severity}: ${value.toFixed(1)}% exceeds ${threshold}% threshold`
    };
    
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(0, 50);
    }
  }

  // Performance analysis
  analyzePerformance(timeRange = '1h') {
    const now = Date.now();
    const ranges = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - ranges[timeRange];
    const relevantMetrics = Array.from(this.metrics.entries())
      .filter(([timestamp]) => timestamp >= cutoff)
      .map(([, metrics]) => metrics);

    if (relevantMetrics.length === 0) return null;

    return {
      avg: this.calculateAverages(relevantMetrics),
      min: this.calculateMinimums(relevantMetrics),
      max: this.calculateMaximums(relevantMetrics),
      trend: this.calculateTrends(relevantMetrics)
    };
  }

  calculateAverages(metrics) {
    const sums = {};
    metrics.forEach(metric => {
      Object.entries(metric).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'timestamp') {
          sums[key] = (sums[key] || 0) + value;
        }
      });
    });
    
    const averages = {};
    Object.entries(sums).forEach(([key, sum]) => {
      averages[key] = sum / metrics.length;
    });
    
    return averages;
  }

  calculateMinimums(metrics) {
    const mins = {};
    metrics.forEach(metric => {
      Object.entries(metric).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'timestamp') {
          mins[key] = Math.min(mins[key] || Infinity, value);
        }
      });
    });
    return mins;
  }

  calculateMaximums(metrics) {
    const maxs = {};
    metrics.forEach(metric => {
      Object.entries(metric).forEach(([key, value]) => {
        if (typeof value === 'number' && key !== 'timestamp') {
          maxs[key] = Math.max(maxs[key] || -Infinity, value);
        }
      });
    });
    return maxs;
  }

  calculateTrends(metrics) {
    if (metrics.length < 2) return {};
    
    const trends = {};
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    
    Object.entries(first).forEach(([key, value]) => {
      if (typeof value === 'number' && key !== 'timestamp') {
        const change = last[key] - value;
        const percentChange = (change / value) * 100;
        trends[key] = {
          change,
          percentChange,
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
        };
      }
    });
    
    return trends;
  }
}

// Metric Card Component
const MetricCard = ({ title, value, unit, status, trend, icon: Icon, onClick }) => {
  const statusColors = {
    good: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    critical: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };

  const TrendIcon = trend?.direction === 'up' ? ArrowTrendingUpIcon : 
                   trend?.direction === 'down' ? ArrowTrendingDownIcon : 
                   SignalIcon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </p>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-full ${statusColors[status]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center space-x-2">
          <TrendIcon className={`h-4 w-4 ${trendColors[trend.direction]}`} />
          <span className={`text-sm font-medium ${trendColors[trend.direction]}`}>
            {Math.abs(trend.percentChange).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

// Real-time Chart Component
const RealTimeChart = ({ data, metric, title, color = '#3b82f6' }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              stroke="#6b7280"
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value) => [value.toFixed(2), metric]}
            />
            <Line 
              type="monotone" 
              dataKey={metric} 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// System Health Component
const SystemHealth = ({ metrics }) => {
  const healthItems = [
    { name: 'CPU Usage', value: metrics?.cpu || 0, threshold: 80, icon: CpuChipIcon },
    { name: 'Memory Usage', value: metrics?.memory || 0, threshold: 85, icon: CircleStackIcon },
    { name: 'Disk Usage', value: metrics?.disk || 0, threshold: 90, icon: DatabaseIcon },
    { name: 'Network Usage', value: metrics?.network || 0, threshold: 75, icon: WifiIcon }
  ];

  const getHealthStatus = (value, threshold) => {
    if (value >= threshold) return 'critical';
    if (value >= threshold * 0.8) return 'warning';
    return 'good';
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
      
      <div className="space-y-4">
        {healthItems.map((item) => {
          const status = getHealthStatus(item.value, item.threshold);
          const Icon = item.icon;
          
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${getHealthColor(status)}`} />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      status === 'critical' ? 'bg-red-500' :
                      status === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getHealthColor(status)}`}>
                  {item.value.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Performance Alerts Component
const PerformanceAlerts = ({ alerts, onDismiss }) => {
  const severityColors = {
    critical: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  };

  const severityIcons = {
    critical: FireIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
        <span className="text-sm text-gray-500">{alerts.length} active</span>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {alerts.slice(0, 10).map((alert) => {
            const Icon = severityIcons[alert.severity];
            
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`border rounded-lg p-3 ${severityColors[alert.severity]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <Icon className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-current opacity-50 hover:opacity-75"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Analytics Component
const PerformanceAnalytics = ({ timeRange, onTimeRangeChange }) => {
  const [analyticsData, setAnalyticsData] = useState([]);

  // Load performance analytics
  const { data: analytics, isLoading } = useQuery(
    ['performance-analytics', timeRange],
    async () => {
      const response = await fetch(`/api/performance/analytics?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to load analytics');
      return response.json();
    }
  );

  useEffect(() => {
    if (analytics) {
      setAnalyticsData(analytics);
    }
  }, [analytics]);

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Response Time Trends</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timestamp" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throughput Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Throughput Analysis</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timestamp" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="throughput" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Error Rate Chart */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Error Rate Monitoring</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timestamp" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="errorRate" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cache Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Cache Hit Rate</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="timestamp" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="cacheHitRate" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Performance Monitor Component
const PerformanceMonitor = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [currentMetrics, setCurrentMetrics] = useState({});
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const performanceEngine = useRef(new PerformanceEngine());
  const intervalRef = useRef(null);
  
  const { user } = useAuth();
  const { showNotification } = useNotifications();

  // Start/stop monitoring
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        const metrics = performanceEngine.current.collectMetrics();
        setCurrentMetrics(metrics);
        setMetricsHistory(prev => [...prev.slice(-59), metrics]); // Keep last 60 data points
        setAlerts(performanceEngine.current.alerts);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    showNotification(
      isMonitoring ? 'Performance monitoring stopped' : 'Performance monitoring started',
      'info'
    );
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    performanceEngine.current.alerts = performanceEngine.current.alerts.filter(alert => alert.id !== alertId);
  };

  const getMetricStatus = (value, thresholds) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'good';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'realtime', name: 'Real-time', icon: BoltIcon },
    { id: 'analytics', name: 'Analytics', icon: BeakerIcon },
    { id: 'alerts', name: 'Alerts', icon: BellIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Monitor</h1>
              <p className="text-sm text-gray-600">Real-time system performance monitoring and analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
              </span>
            </div>
            
            <button
              onClick={toggleMonitoring}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              <span>{isMonitoring ? 'Stop' : 'Start'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="CPU Usage"
                    value={currentMetrics.cpu}
                    unit="%"
                    status={getMetricStatus(currentMetrics.cpu, performanceEngine.current.thresholds.cpu)}
                    icon={CpuChipIcon}
                  />
                  <MetricCard
                    title="Memory Usage"
                    value={currentMetrics.memory}
                    unit="%"
                    status={getMetricStatus(currentMetrics.memory, performanceEngine.current.thresholds.memory)}
                    icon={CircleStackIcon}
                  />
                  <MetricCard
                    title="Response Time"
                    value={currentMetrics.responseTime}
                    unit="ms"
                    status={getMetricStatus(currentMetrics.responseTime, performanceEngine.current.thresholds.responseTime)}
                    icon={ClockIcon}
                  />
                  <MetricCard
                    title="Active Users"
                    value={currentMetrics.activeUsers}
                    status="info"
                    icon={DevicePhoneMobileIcon}
                  />
                </div>

                {/* System Health */}
                <SystemHealth metrics={currentMetrics} />

                {/* Performance Alerts */}
                <PerformanceAlerts alerts={alerts} onDismiss={dismissAlert} />
              </div>
            )}

            {activeTab === 'realtime' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RealTimeChart
                    data={metricsHistory}
                    metric="cpu"
                    title="CPU Usage"
                    color="#ef4444"
                  />
                  <RealTimeChart
                    data={metricsHistory}
                    metric="memory"
                    title="Memory Usage"
                    color="#f59e0b"
                  />
                  <RealTimeChart
                    data={metricsHistory}
                    metric="responseTime"
                    title="Response Time"
                    color="#3b82f6"
                  />
                  <RealTimeChart
                    data={metricsHistory}
                    metric="throughput"
                    title="Throughput"
                    color="#10b981"
                  />
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <PerformanceAnalytics
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <PerformanceAlerts alerts={alerts} onDismiss={dismissAlert} />
                
                {/* Alert Configuration */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(performanceEngine.current.thresholds).map(([metric, thresholds]) => (
                      <div key={metric} className="space-y-3">
                        <h4 className="font-medium text-gray-900 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">Warning</label>
                            <input
                              type="number"
                              value={thresholds.warning}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              readOnly
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-600">Critical</label>
                            <input
                              type="number"
                              value={thresholds.critical}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>
                <p className="text-gray-600">Performance monitoring settings will be implemented here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;