// Advanced Performance Dashboard Component
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
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { usePerformanceMonitor } from '../../hooks/performance/usePerformanceMonitor';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

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
  ArcElement
);

const PerformanceDashboard = ({ className = '' }) => {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const {
    metrics,
    performanceScore,
    isMonitoring,
    recommendations,
    getMetricHistory,
    getAverageMetric,
  } = usePerformanceMonitor({
    enabled: true,
    autoReport: true,
    reportInterval: 5000,
  });

  // Performance score color and status
  const getScoreStatus = (score) => {
    if (score >= 90) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Excellent' };
    if (score >= 75) return { color: 'text-blue-600', bg: 'bg-blue-100', status: 'Good' };
    if (score >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Fair' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Poor' };
  };

  const scoreStatus = getScoreStatus(performanceScore);

  // Web Vitals data
  const webVitalsData = useMemo(() => {
    const vitals = ['fcp', 'lcp', 'fid', 'cls'];
    const data = vitals.map(vital => {
      const metric = metrics[vital];
      return {
        name: vital.toUpperCase(),
        value: metric?.value || 0,
        threshold: metric?.threshold || 0,
        isGood: metric?.isGood || false,
        unit: metric?.unit || 'ms',
      };
    });

    return {
      labels: data.map(d => d.name),
      datasets: [
        {
          label: 'Current Value',
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.isGood ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
          borderColor: data.map(d => d.isGood ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
          borderWidth: 2,
        },
        {
          label: 'Threshold',
          data: data.map(d => d.threshold),
          backgroundColor: 'rgba(156, 163, 175, 0.3)',
          borderColor: 'rgb(156, 163, 175)',
          borderWidth: 1,
          type: 'line',
        },
      ],
    };
  }, [metrics]);

  // Memory usage chart
  const memoryData = useMemo(() => {
    const memoryHistory = getMetricHistory('memoryUsage');
    const last20 = memoryHistory.slice(-20);

    return {
      labels: last20.map((_, index) => `${index + 1}`),
      datasets: [
        {
          label: 'Used Memory (MB)',
          data: last20.map(m => (m.value / (1024 * 1024)).toFixed(2)),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Memory Limit (MB)',
          data: last20.map(m => m.additional?.limit ? (m.additional.limit / (1024 * 1024)).toFixed(2) : 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderDash: [5, 5],
          fill: false,
        },
      ],
    };
  }, [getMetricHistory]);

  // Performance trends
  const performanceTrends = useMemo(() => {
    const trends = {};
    const vitals = ['fcp', 'lcp', 'fid', 'cls'];
    
    vitals.forEach(vital => {
      const history = getMetricHistory(vital);
      if (history.length >= 2) {
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + m.value, 0) / older.length : recentAvg;
        
        const change = ((recentAvg - olderAvg) / olderAvg) * 100;
        trends[vital] = {
          change: change.toFixed(1),
          improving: change < 0, // Lower is better for most metrics
        };
      }
    });
    
    return trends;
  }, [getMetricHistory]);

  // Component render performance
  const renderPerformanceData = useMemo(() => {
    const renderMetrics = Object.entries(metrics)
      .filter(([key]) => key.startsWith('render_'))
      .map(([key, metric]) => ({
        component: key.replace('render_', ''),
        avgTime: metric.value,
        isGood: metric.isGood,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    return {
      labels: renderMetrics.map(m => m.component),
      datasets: [
        {
          label: 'Render Time (ms)',
          data: renderMetrics.map(m => m.avgTime),
          backgroundColor: renderMetrics.map(m => 
            m.isGood ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
          ),
          borderColor: renderMetrics.map(m => 
            m.isGood ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [metrics]);

  // Chart options
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
        beginAtZero: true,
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

  // Performance score doughnut chart
  const scoreChartData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [performanceScore, 100 - performanceScore],
        backgroundColor: [
          scoreStatus.color.includes('green') ? '#22c55e' :
          scoreStatus.color.includes('blue') ? '#3b82f6' :
          scoreStatus.color.includes('yellow') ? '#eab308' : '#ef4444',
          '#f3f4f6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const scoreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataIndex === 0) {
              return `Performance Score: ${context.parsed}%`;
            }
            return null;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor and optimize application performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
          </Button>
        </div>
      </div>

      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance Score</p>
              <p className={`text-3xl font-bold ${scoreStatus.color}`}>
                {performanceScore}
              </p>
              <Badge variant={scoreStatus.status === 'Excellent' ? 'success' : 
                             scoreStatus.status === 'Good' ? 'info' :
                             scoreStatus.status === 'Fair' ? 'warning' : 'error'}>
                {scoreStatus.status}
              </Badge>
            </div>
            <div className="w-16 h-16">
              <Doughnut data={scoreChartData} options={scoreChartOptions} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Load Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {getAverageMetric('loadComplete')?.toFixed(0) || 0}ms
              </p>
              {performanceTrends.lcp && (
                <div className="flex items-center mt-1">
                  {performanceTrends.lcp.improving ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${performanceTrends.lcp.improving ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(performanceTrends.lcp.change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CpuChipIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.memoryUsage ? 
                  `${(metrics.memoryUsage.value / (1024 * 1024)).toFixed(1)}MB` : 
                  '0MB'
                }
              </p>
              {metrics.memoryUsage?.additional && (
                <p className="text-sm text-gray-500">
                  {metrics.memoryUsage.additional.percentage.toFixed(1)}% of limit
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Monitoring Status</p>
              <div className="flex items-center mt-2">
                {isMonitoring ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-600 font-medium">Active</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-600 font-medium">Inactive</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Performance Recommendations</h3>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{rec.message}</h4>
                  <Badge variant={rec.severity === 'high' ? 'error' : 'warning'}>
                    {rec.severity}
                  </Badge>
                </div>
                <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                  {rec.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Charts */}
      <Tabs defaultValue="vitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="memory">Memory Usage</TabsTrigger>
          <TabsTrigger value="renders">Render Performance</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
            <div className="h-80">
              <Bar data={webVitalsData} options={chartOptions} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage Over Time</h3>
            <div className="h-80">
              <Line data={memoryData} options={chartOptions} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="renders">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Render Performance</h3>
            <div className="h-80">
              <Bar data={renderPerformanceData} options={chartOptions} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.ttfb?.value?.toFixed(0) || 0}ms
                </p>
                <p className="text-sm text-gray-600">Time to First Byte</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {metrics.domContentLoaded?.value?.toFixed(0) || 0}ms
                </p>
                <p className="text-sm text-gray-600">DOM Content Loaded</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.loadComplete?.value?.toFixed(0) || 0}ms
                </p>
                <p className="text-sm text-gray-600">Load Complete</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;