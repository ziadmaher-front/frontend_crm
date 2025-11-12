// Real-time Analytics Component with Live Data Streaming
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  PlayIcon,
  PauseIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNotifications } from '../../hooks/useNotifications';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Real-time data processor
class RealtimeDataProcessor {
  constructor() {
    this.dataBuffer = new Map();
    this.maxBufferSize = 100;
    this.aggregationWindow = 60000; // 1 minute
  }

  processDataPoint(metric, value, timestamp = Date.now()) {
    if (!this.dataBuffer.has(metric)) {
      this.dataBuffer.set(metric, []);
    }

    const buffer = this.dataBuffer.get(metric);
    buffer.push({ value, timestamp });

    // Keep only recent data
    const cutoff = timestamp - (this.maxBufferSize * this.aggregationWindow);
    const filteredBuffer = buffer.filter(point => point.timestamp > cutoff);
    this.dataBuffer.set(metric, filteredBuffer);

    return this.aggregateData(metric);
  }

  aggregateData(metric) {
    const buffer = this.dataBuffer.get(metric) || [];
    if (buffer.length === 0) return null;

    const now = Date.now();
    const windowStart = now - this.aggregationWindow;
    const windowData = buffer.filter(point => point.timestamp > windowStart);

    if (windowData.length === 0) return null;

    const sum = windowData.reduce((acc, point) => acc + point.value, 0);
    const avg = sum / windowData.length;
    const min = Math.min(...windowData.map(p => p.value));
    const max = Math.max(...windowData.map(p => p.value));
    const latest = windowData[windowData.length - 1]?.value || 0;

    return {
      metric,
      current: latest,
      average: avg,
      min,
      max,
      count: windowData.length,
      trend: this.calculateTrend(buffer),
      timestamp: now,
    };
  }

  calculateTrend(buffer) {
    if (buffer.length < 2) return 'stable';

    const recent = buffer.slice(-10); // Last 10 points
    const older = buffer.slice(-20, -10); // Previous 10 points

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.value, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  getHistoricalData(metric, points = 50) {
    const buffer = this.dataBuffer.get(metric) || [];
    return buffer.slice(-points).map(point => ({
      x: new Date(point.timestamp).toLocaleTimeString(),
      y: point.value,
    }));
  }
}

const RealtimeAnalytics = ({ className = '' }) => {
  const [isStreaming, setIsStreaming] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['leads', 'deals', 'revenue']);
  const [timeRange, setTimeRange] = useState('1h');
  const [activeTab, setActiveTab] = useState('overview');
  const [dataProcessor] = useState(() => new RealtimeDataProcessor());
  const [realtimeData, setRealtimeData] = useState(new Map());

  const { addNotification } = useNotifications();
  const { data: analyticsData } = useAnalytics();

  // WebSocket connection for real-time data
  const { 
    isConnected, 
    lastMessage, 
    sendMessage,
    connect,
    disconnect 
  } = useWebSocket({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws',
    protocols: ['analytics'],
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  });

  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && isStreaming) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'analytics_update') {
          const { metric, value, timestamp } = data.payload;
          const processed = dataProcessor.processDataPoint(metric, value, timestamp);
          
          if (processed) {
            setRealtimeData(prev => new Map(prev.set(metric, processed)));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, isStreaming, dataProcessor]);

  // Connect/disconnect WebSocket based on streaming state
  useEffect(() => {
    if (isStreaming && !isConnected) {
      connect();
    } else if (!isStreaming && isConnected) {
      disconnect();
    }
  }, [isStreaming, isConnected, connect, disconnect]);

  // Simulate real-time data for demo purposes
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Simulate incoming data
      const metrics = ['leads', 'deals', 'revenue', 'activities', 'conversions'];
      
      metrics.forEach(metric => {
        const baseValue = {
          leads: 50,
          deals: 20,
          revenue: 10000,
          activities: 100,
          conversions: 5,
        }[metric];

        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        const value = baseValue * (1 + variation);
        
        const processed = dataProcessor.processDataPoint(metric, value);
        if (processed) {
          setRealtimeData(prev => new Map(prev.set(metric, processed)));
        }
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isStreaming, dataProcessor]);

  // Toggle streaming
  const toggleStreaming = useCallback(() => {
    setIsStreaming(prev => {
      const newState = !prev;
      addNotification({
        type: 'info',
        title: newState ? 'Real-time Analytics Started' : 'Real-time Analytics Paused',
        message: newState ? 'Live data streaming is now active' : 'Live data streaming has been paused',
      });
      return newState;
    });
  }, [addNotification]);

  // Get metric display info
  const getMetricInfo = useCallback((metric) => {
    const info = {
      leads: {
        label: 'Leads',
        icon: UserGroupIcon,
        color: 'blue',
        format: (value) => Math.round(value).toLocaleString(),
      },
      deals: {
        label: 'Deals',
        icon: ChartBarIcon,
        color: 'green',
        format: (value) => Math.round(value).toLocaleString(),
      },
      revenue: {
        label: 'Revenue',
        icon: CurrencyDollarIcon,
        color: 'purple',
        format: (value) => `$${Math.round(value).toLocaleString()}`,
      },
      activities: {
        label: 'Activities',
        icon: BoltIcon,
        color: 'orange',
        format: (value) => Math.round(value).toLocaleString(),
      },
      conversions: {
        label: 'Conversions',
        icon: ArrowTrendingUpIcon,
        color: 'emerald',
        format: (value) => Math.round(value).toLocaleString(),
      },
    };

    return info[metric] || {
      label: metric,
      icon: EyeIcon,
      color: 'gray',
      format: (value) => Math.round(value).toLocaleString(),
    };
  }, []);

  // Get trend icon
  const getTrendIcon = useCallback((trend) => {
    switch (trend) {
      case 'increasing':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    const datasets = selectedMetrics.map((metric, index) => {
      const data = dataProcessor.getHistoricalData(metric);
      const metricInfo = getMetricInfo(metric);
      
      const colors = [
        'rgb(59, 130, 246)', // blue
        'rgb(16, 185, 129)', // green
        'rgb(139, 92, 246)', // purple
        'rgb(245, 158, 11)', // orange
        'rgb(34, 197, 94)',  // emerald
      ];

      return {
        label: metricInfo.label,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        fill: false,
        tension: 0.4,
      };
    });

    return {
      datasets,
    };
  }, [selectedMetrics, dataProcessor, getMetricInfo]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Real-time Metrics',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
    animation: {
      duration: 0, // Disable animations for real-time updates
    },
  };

  // Metric cards data
  const metricCards = useMemo(() => {
    return Array.from(realtimeData.entries()).map(([metric, data]) => {
      const metricInfo = getMetricInfo(metric);
      const IconComponent = metricInfo.icon;

      return {
        metric,
        label: metricInfo.label,
        value: data.current,
        formattedValue: metricInfo.format(data.current),
        trend: data.trend,
        average: data.average,
        formattedAverage: metricInfo.format(data.average),
        icon: IconComponent,
        color: metricInfo.color,
        timestamp: data.timestamp,
      };
    });
  }, [realtimeData, getMetricInfo]);

  // Activity feed
  const activityFeed = useMemo(() => {
    const activities = [];
    
    realtimeData.forEach((data, metric) => {
      const metricInfo = getMetricInfo(metric);
      activities.push({
        id: `${metric}-${data.timestamp}`,
        type: 'metric_update',
        metric,
        label: metricInfo.label,
        value: data.current,
        formattedValue: metricInfo.format(data.current),
        trend: data.trend,
        timestamp: data.timestamp,
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [realtimeData, getMetricInfo]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'charts', label: 'Charts' },
    { id: 'activity', label: 'Activity Feed' },
    { id: 'alerts', label: 'Alerts' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Real-time Analytics</h2>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={[
              { value: '5m', label: '5 minutes' },
              { value: '15m', label: '15 minutes' },
              { value: '1h', label: '1 hour' },
              { value: '4h', label: '4 hours' },
              { value: '24h', label: '24 hours' },
            ]}
            className="w-32"
          />

          <Button
            onClick={toggleStreaming}
            variant={isStreaming ? 'secondary' : 'primary'}
            className="flex items-center space-x-2"
          >
            {isStreaming ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                <span>Start</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {metricCards.map(({ metric, label, formattedValue, trend, formattedAverage, icon: IconComponent, color }) => (
              <Card key={metric} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                      <IconComponent className={`h-6 w-6 text-${color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{label}</p>
                      <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
                    </div>
                  </div>
                  {getTrendIcon(trend)}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Avg: {formattedAverage}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Metrics</span>
                  <Badge variant="primary">{realtimeData.size}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Streaming Status</span>
                  <Badge variant={isStreaming ? 'success' : 'secondary'}>
                    {isStreaming ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connection</span>
                  <Badge variant={isConnected ? 'success' : 'danger'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Update</span>
                  <span className="text-sm text-gray-900">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
              <div className="space-y-3">
                {metricCards.slice(0, 5).map(({ metric, label, trend, color }) => (
                  <div key={metric} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{label}</span>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend)}
                      <Badge 
                        variant={trend === 'increasing' ? 'success' : trend === 'decreasing' ? 'danger' : 'secondary'}
                      >
                        {trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Metric Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Metrics to Display</h3>
            <div className="flex flex-wrap gap-2">
              {['leads', 'deals', 'revenue', 'activities', 'conversions'].map(metric => {
                const metricInfo = getMetricInfo(metric);
                const isSelected = selectedMetrics.includes(metric);
                
                return (
                  <Button
                    key={metric}
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => {
                      setSelectedMetrics(prev => 
                        isSelected 
                          ? prev.filter(m => m !== metric)
                          : [...prev, metric]
                      );
                    }}
                  >
                    {metricInfo.label}
                  </Button>
                );
              })}
            </div>
          </Card>

          {/* Real-time Chart */}
          <Card className="p-6">
            <div className="h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'activity' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activityFeed.map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTrendIcon(activity.trend)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.label} updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.formattedValue}
                  </p>
                  <Badge 
                    variant={activity.trend === 'increasing' ? 'success' : activity.trend === 'decreasing' ? 'danger' : 'secondary'}
                    size="sm"
                  >
                    {activity.trend}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Alerts</h3>
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts at this time</p>
            <p className="text-sm text-gray-400 mt-2">
              Alerts will appear here when thresholds are exceeded
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RealtimeAnalytics;