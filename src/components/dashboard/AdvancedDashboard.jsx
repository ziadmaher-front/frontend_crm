import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  CogIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  DownloadIcon,
  FullScreenIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon
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
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';

// Dashboard Engine for managing widgets and layouts
class DashboardEngine {
  constructor() {
    this.widgets = new Map();
    this.layouts = new Map();
    this.themes = new Map();
    this.filters = new Map();
    this.realTimeData = new Map();
    this.alerts = new Map();
    this.subscriptions = new Set();
  }

  // Register a widget
  registerWidget(widget) {
    this.widgets.set(widget.id, {
      ...widget,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    });
  }

  // Create a dashboard layout
  createLayout(layoutConfig) {
    const layout = {
      id: layoutConfig.id,
      name: layoutConfig.name,
      description: layoutConfig.description,
      widgets: layoutConfig.widgets || [],
      filters: layoutConfig.filters || {},
      theme: layoutConfig.theme || 'default',
      isPublic: layoutConfig.isPublic || false,
      owner: layoutConfig.owner,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.layouts.set(layout.id, layout);
    return layout;
  }

  // Update widget data
  updateWidgetData(widgetId, data) {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.data = data;
      widget.lastUpdated = new Date();
      this.notifySubscribers(widgetId, data);
    }
  }

  // Subscribe to real-time updates
  subscribe(widgetId, callback) {
    const subscription = { widgetId, callback };
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  }

  // Notify subscribers of data changes
  notifySubscribers(widgetId, data) {
    this.subscriptions.forEach(subscription => {
      if (subscription.widgetId === widgetId) {
        subscription.callback(data);
      }
    });
  }

  // Apply filters to data
  applyFilters(data, filters) {
    let filteredData = [...data];

    Object.entries(filters).forEach(([key, filter]) => {
      if (filter.enabled) {
        switch (filter.type) {
          case 'date_range':
            filteredData = filteredData.filter(item => {
              const date = new Date(item[key]);
              return date >= filter.start && date <= filter.end;
            });
            break;
          case 'value_range':
            filteredData = filteredData.filter(item => 
              item[key] >= filter.min && item[key] <= filter.max
            );
            break;
          case 'category':
            filteredData = filteredData.filter(item => 
              filter.values.includes(item[key])
            );
            break;
          case 'search':
            filteredData = filteredData.filter(item =>
              item[key]?.toString().toLowerCase().includes(filter.query.toLowerCase())
            );
            break;
        }
      }
    });

    return filteredData;
  }

  // Generate insights from data
  generateInsights(data, type) {
    const insights = [];

    switch (type) {
      case 'trends':
        insights.push(...this.analyzeTrends(data));
        break;
      case 'anomalies':
        insights.push(...this.detectAnomalies(data));
        break;
      case 'correlations':
        insights.push(...this.findCorrelations(data));
        break;
      case 'forecasts':
        insights.push(...this.generateForecasts(data));
        break;
    }

    return insights;
  }

  analyzeTrends(data) {
    // Implement trend analysis
    return [
      {
        type: 'trend',
        title: 'Revenue Growth',
        description: 'Revenue has increased by 15% over the last month',
        confidence: 0.85,
        impact: 'positive'
      }
    ];
  }

  detectAnomalies(data) {
    // Implement anomaly detection
    return [
      {
        type: 'anomaly',
        title: 'Unusual Activity',
        description: 'Customer acquisition rate spiked 300% yesterday',
        confidence: 0.92,
        impact: 'neutral'
      }
    ];
  }

  findCorrelations(data) {
    // Implement correlation analysis
    return [
      {
        type: 'correlation',
        title: 'Marketing Impact',
        description: 'Email campaigns correlate with 23% increase in sales',
        confidence: 0.78,
        impact: 'positive'
      }
    ];
  }

  generateForecasts(data) {
    // Implement forecasting
    return [
      {
        type: 'forecast',
        title: 'Next Month Projection',
        description: 'Expected revenue: $125,000 (±$15,000)',
        confidence: 0.73,
        impact: 'positive'
      }
    ];
  }
}

// Widget types configuration
const WIDGET_TYPES = [
  {
    id: 'kpi_card',
    name: 'KPI Card',
    description: 'Display key performance indicators',
    icon: ChartBarIcon,
    category: 'metrics',
    defaultSize: { width: 1, height: 1 },
    configurable: ['title', 'metric', 'comparison', 'format']
  },
  {
    id: 'line_chart',
    name: 'Line Chart',
    description: 'Show trends over time',
    icon: TrendingUpIcon,
    category: 'charts',
    defaultSize: { width: 2, height: 1 },
    configurable: ['title', 'xAxis', 'yAxis', 'series', 'colors']
  },
  {
    id: 'bar_chart',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: ChartBarIcon,
    category: 'charts',
    defaultSize: { width: 2, height: 1 },
    configurable: ['title', 'xAxis', 'yAxis', 'series', 'colors']
  },
  {
    id: 'pie_chart',
    name: 'Pie Chart',
    description: 'Show proportions and percentages',
    icon: ChartBarIcon,
    category: 'charts',
    defaultSize: { width: 1, height: 1 },
    configurable: ['title', 'dataKey', 'colors']
  },
  {
    id: 'area_chart',
    name: 'Area Chart',
    description: 'Display cumulative values over time',
    icon: TrendingUpIcon,
    category: 'charts',
    defaultSize: { width: 2, height: 1 },
    configurable: ['title', 'xAxis', 'yAxis', 'series', 'colors']
  },
  {
    id: 'funnel_chart',
    name: 'Funnel Chart',
    description: 'Visualize conversion processes',
    icon: FunnelIcon,
    category: 'charts',
    defaultSize: { width: 1, height: 2 },
    configurable: ['title', 'stages', 'colors']
  },
  {
    id: 'table',
    name: 'Data Table',
    description: 'Display structured data in rows and columns',
    icon: TableCellsIcon,
    category: 'data',
    defaultSize: { width: 2, height: 2 },
    configurable: ['title', 'columns', 'pagination', 'sorting']
  },
  {
    id: 'activity_feed',
    name: 'Activity Feed',
    description: 'Show recent activities and events',
    icon: ListBulletIcon,
    category: 'data',
    defaultSize: { width: 1, height: 2 },
    configurable: ['title', 'limit', 'filters']
  }
];

// Sample dashboard data
const generateSampleData = () => ({
  kpis: {
    revenue: { value: 125000, change: 15.3, trend: 'up' },
    customers: { value: 1250, change: 8.7, trend: 'up' },
    conversion: { value: 3.2, change: -2.1, trend: 'down' },
    satisfaction: { value: 4.6, change: 0.3, trend: 'up' }
  },
  revenueData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 3000,
    target: 4000
  })),
  customerData: [
    { name: 'New', value: 400, color: '#8884d8' },
    { name: 'Returning', value: 300, color: '#82ca9d' },
    { name: 'Churned', value: 100, color: '#ffc658' }
  ],
  salesFunnel: [
    { name: 'Leads', value: 1000, color: '#8884d8' },
    { name: 'Qualified', value: 600, color: '#82ca9d' },
    { name: 'Proposals', value: 300, color: '#ffc658' },
    { name: 'Closed', value: 150, color: '#ff7300' }
  ],
  activities: [
    { id: 1, type: 'sale', message: 'New sale: $2,500', time: '2 minutes ago', icon: CurrencyDollarIcon },
    { id: 2, type: 'customer', message: 'New customer registered', time: '5 minutes ago', icon: UserGroupIcon },
    { id: 3, type: 'email', message: 'Email campaign sent', time: '10 minutes ago', icon: EnvelopeIcon },
    { id: 4, type: 'meeting', message: 'Meeting scheduled', time: '15 minutes ago', icon: CalendarIcon }
  ]
});

// KPI Card Widget
const KPICard = ({ title, value, change, trend, format = 'number', icon: Icon }) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{formatValue(value)}</p>
            <div className={`flex items-center mt-2 ${trendColor}`}>
              <TrendIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          </div>
          {Icon && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon className="h-8 w-8 text-blue-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Chart Widget
const ChartWidget = ({ title, type, data, config = {} }) => {
  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 300,
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis || 'date'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={config.yAxis || 'value'} 
              stroke={config.color || '#8884d8'} 
              strokeWidth={2}
            />
          </LineChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis || 'name'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={config.yAxis || 'value'} fill={config.color || '#8884d8'} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={config.xAxis || 'date'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={config.yAxis || 'value'} 
              stroke={config.color || '#8884d8'} 
              fill={config.color || '#8884d8'} 
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      
      case 'pie':
        return (
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      
      case 'funnel':
        return (
          <FunnelChart width={300} height={300}>
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
            <Tooltip />
          </FunnelChart>
        );
      
      default:
        return <div className="flex items-center justify-center h-64 text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Activity Feed Widget
const ActivityFeed = ({ activities, limit = 10 }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.slice(0, limit).map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <IconComponent className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Widget Configuration Modal
const WidgetConfigModal = ({ widget, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState(widget?.config || {});

  const handleSave = () => {
    onSave(widget.id, config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
          <DialogDescription>
            Customize the appearance and behavior of your widget
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label>Widget Title</Label>
            <Input
              value={config.title || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter widget title"
            />
          </div>
          
          {widget?.type === 'chart' && (
            <>
              <div>
                <Label>Chart Type</Label>
                <Select
                  value={config.chartType || 'line'}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, chartType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Primary Color</Label>
                <Input
                  type="color"
                  value={config.color || '#8884d8'}
                  onChange={(e) => setConfig(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Refresh</Label>
              <p className="text-sm text-gray-600">Automatically update widget data</p>
            </div>
            <Switch
              checked={config.autoRefresh || false}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoRefresh: checked }))}
            />
          </div>
          
          {config.autoRefresh && (
            <div>
              <Label>Refresh Interval (seconds)</Label>
              <Slider
                value={[config.refreshInterval || 30]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, refreshInterval: value }))}
                min={10}
                max={300}
                step={10}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">
                Current: {config.refreshInterval || 30} seconds
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Dashboard Layout Builder
const DashboardBuilder = ({ onSave }) => {
  const [widgets, setWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const addWidget = (widgetType) => {
    const newWidget = {
      id: Math.random().toString(36).substr(2, 9),
      type: widgetType.id,
      title: widgetType.name,
      config: {},
      position: { x: 0, y: 0, width: widgetType.defaultSize.width, height: widgetType.defaultSize.height }
    };
    
    setWidgets(prev => [...prev, newWidget]);
  };

  const removeWidget = (widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const configureWidget = (widget) => {
    setSelectedWidget(widget);
    setConfigModalOpen(true);
  };

  const saveWidgetConfig = (widgetId, config) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, config } : w
    ));
  };

  return (
    <div className="space-y-6">
      {/* Widget Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Add Widgets</CardTitle>
          <CardDescription>Drag and drop widgets to build your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WIDGET_TYPES.map((widgetType) => {
              const IconComponent = widgetType.icon;
              return (
                <Button
                  key={widgetType.id}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => addWidget(widgetType)}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs">{widgetType.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dashboard Preview</CardTitle>
            <Button onClick={() => onSave(widgets)}>
              Save Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-96">
            {widgets.map((widget) => (
              <div key={widget.id} className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => configureWidget(widget)}
                    >
                      <CogIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeWidget(widget.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Widget Preview */}
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-medium">{widget.title}</div>
                    <div className="text-sm text-gray-500">{widget.type}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {widgets.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Add widgets to start building your dashboard</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Widget Configuration Modal */}
      <WidgetConfigModal
        widget={selectedWidget}
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={saveWidgetConfig}
      />
    </div>
  );
};

// Main Advanced Dashboard Component
const AdvancedDashboard = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();
  const [dashboardEngine] = useState(() => new DashboardEngine());
  
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [timeRange, setTimeRange] = useState('30d');
  const [filters, setFilters] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sample data
  const sampleData = useMemo(() => generateSampleData(), [timeRange]);

  // Query for dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery(
    ['dashboard-data', timeRange, filters],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sampleData;
    },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 10000
    }
  );

  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = dashboardEngine.subscribe('real-time', (data) => {
      queryClient.setQueryData(['dashboard-data', timeRange, filters], data);
    });

    return unsubscribe;
  }, [dashboardEngine, queryClient, timeRange, filters]);

  // Save dashboard layout
  const saveDashboard = useMutation(
    async (widgets) => {
      const layout = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'My Dashboard',
        widgets,
        owner: user.id
      };
      
      dashboardEngine.createLayout(layout);
      await new Promise(resolve => setTimeout(resolve, 500));
      return layout;
    },
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Dashboard Saved',
          message: 'Your dashboard layout has been saved successfully.'
        });
      }
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive analytics and business intelligence
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <XMarkIcon className="h-4 w-4" /> : <FullScreenIcon className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value={dashboardData?.kpis.revenue.value}
              change={dashboardData?.kpis.revenue.change}
              trend={dashboardData?.kpis.revenue.trend}
              format="currency"
              icon={CurrencyDollarIcon}
            />
            <KPICard
              title="Total Customers"
              value={dashboardData?.kpis.customers.value}
              change={dashboardData?.kpis.customers.change}
              trend={dashboardData?.kpis.customers.trend}
              icon={UserGroupIcon}
            />
            <KPICard
              title="Conversion Rate"
              value={dashboardData?.kpis.conversion.value}
              change={dashboardData?.kpis.conversion.change}
              trend={dashboardData?.kpis.conversion.trend}
              format="percentage"
              icon={TrendingUpIcon}
            />
            <KPICard
              title="Satisfaction Score"
              value={dashboardData?.kpis.satisfaction.value}
              change={dashboardData?.kpis.satisfaction.change}
              trend={dashboardData?.kpis.satisfaction.trend}
              icon={CheckCircleIcon}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="Revenue Trend"
              type="line"
              data={dashboardData?.revenueData}
              config={{ xAxis: 'date', yAxis: 'revenue', color: '#8884d8' }}
            />
            <ChartWidget
              title="Customer Distribution"
              type="pie"
              data={dashboardData?.customerData}
            />
          </div>

          {/* Activity and Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed activities={dashboardData?.activities} />
            <ChartWidget
              title="Sales Funnel"
              type="funnel"
              data={dashboardData?.salesFunnel}
            />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="Revenue vs Target"
              type="area"
              data={dashboardData?.revenueData}
              config={{ xAxis: 'date', yAxis: 'revenue', color: '#82ca9d' }}
            />
            <ChartWidget
              title="Monthly Performance"
              type="bar"
              data={dashboardData?.revenueData?.slice(-12)}
              config={{ xAxis: 'date', yAxis: 'revenue', color: '#ffc658' }}
            />
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Alert>
            <InformationCircleIcon className="h-4 w-4" />
            <AlertTitle>Performance Monitoring</AlertTitle>
            <AlertDescription>
              Real-time system performance and health metrics
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">CPU Usage</p>
                    <p className="text-2xl font-bold">45%</p>
                  </div>
                  <CpuChipIcon className="h-8 w-8 text-blue-500" />
                </div>
                <Progress value={45} className="mt-4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                    <p className="text-2xl font-bold">62%</p>
                  </div>
                  <ServerIcon className="h-8 w-8 text-green-500" />
                </div>
                <Progress value={62} className="mt-4" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="text-2xl font-bold">120ms</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-purple-500" />
                </div>
                <Progress value={30} className="mt-4" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder">
          <DashboardBuilder onSave={(widgets) => saveDashboard.mutate(widgets)} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;