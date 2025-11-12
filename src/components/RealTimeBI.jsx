import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  Calendar,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { AnimatedCard, AnimatedCounter, StaggerContainer } from '@/components/MicroInteractions';

const RealTimeBI = ({ 
  data = {}, 
  refreshInterval = 30000, 
  onDataRefresh,
  onExportData,
  customFilters = []
}) => {
  const [realTimeData, setRealTimeData] = useState({});
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'deals', 'leads']);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  // Mock real-time data generator
  const generateRealTimeData = () => {
    const now = new Date();
    const baseData = {
      revenue: {
        current: 125000 + Math.random() * 10000,
        target: 150000,
        change: (Math.random() - 0.5) * 10,
        trend: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          value: 5000 + Math.random() * 3000,
          deals: Math.floor(Math.random() * 5) + 1
        }))
      },
      deals: {
        total: 45 + Math.floor(Math.random() * 10),
        won: 12 + Math.floor(Math.random() * 3),
        lost: 8 + Math.floor(Math.random() * 2),
        pipeline: 25 + Math.floor(Math.random() * 5),
        stages: [
          { name: 'Prospecting', value: 15, color: '#8884d8' },
          { name: 'Qualification', value: 12, color: '#82ca9d' },
          { name: 'Proposal', value: 8, color: '#ffc658' },
          { name: 'Negotiation', value: 5, color: '#ff7300' },
          { name: 'Closed Won', value: 12, color: '#00ff00' },
          { name: 'Closed Lost', value: 8, color: '#ff0000' }
        ]
      },
      leads: {
        total: 234 + Math.floor(Math.random() * 20),
        hot: 45 + Math.floor(Math.random() * 10),
        warm: 89 + Math.floor(Math.random() * 15),
        cold: 100 + Math.floor(Math.random() * 20),
        sources: [
          { name: 'Website', value: 45, change: 12 },
          { name: 'Social Media', value: 32, change: -5 },
          { name: 'Email Campaign', value: 28, change: 8 },
          { name: 'Referrals', value: 25, change: 15 },
          { name: 'Cold Outreach', value: 18, change: -2 }
        ]
      },
      performance: {
        conversionRate: 24.5 + (Math.random() - 0.5) * 2,
        avgDealSize: 15000 + Math.random() * 5000,
        salesCycle: 45 + Math.random() * 10,
        teamPerformance: [
          { name: 'Sarah Johnson', deals: 8, revenue: 45000, quota: 50000 },
          { name: 'Mike Chen', deals: 6, revenue: 38000, quota: 45000 },
          { name: 'Lisa Rodriguez', deals: 10, revenue: 52000, quota: 55000 },
          { name: 'David Kim', deals: 5, revenue: 28000, quota: 40000 }
        ]
      },
      activities: {
        calls: 156 + Math.floor(Math.random() * 20),
        emails: 342 + Math.floor(Math.random() * 50),
        meetings: 28 + Math.floor(Math.random() * 5),
        demos: 12 + Math.floor(Math.random() * 3),
        timeline: Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          calls: Math.floor(Math.random() * 30) + 10,
          emails: Math.floor(Math.random() * 50) + 20,
          meetings: Math.floor(Math.random() * 8) + 2
        }))
      },
      geography: [
        { region: 'North America', deals: 25, revenue: 75000 },
        { region: 'Europe', deals: 18, revenue: 54000 },
        { region: 'Asia Pacific', deals: 12, revenue: 36000 },
        { region: 'Latin America', deals: 8, revenue: 24000 },
        { region: 'Middle East', deals: 5, revenue: 15000 }
      ]
    };

    // Generate alerts based on data changes
    const newAlerts = [];
    if (baseData.revenue.change > 5) {
      newAlerts.push({
        id: Date.now(),
        type: 'success',
        message: `Revenue increased by ${baseData.revenue.change.toFixed(1)}% in the last hour`,
        timestamp: now
      });
    } else if (baseData.revenue.change < -5) {
      newAlerts.push({
        id: Date.now(),
        type: 'warning',
        message: `Revenue decreased by ${Math.abs(baseData.revenue.change).toFixed(1)}% in the last hour`,
        timestamp: now
      });
    }

    if (baseData.leads.hot > 50) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'info',
        message: `${baseData.leads.hot} hot leads require immediate attention`,
        timestamp: now
      });
    }

    return { ...baseData, alerts: newAlerts };
  };

  // Real-time data updates
  useEffect(() => {
    const updateData = () => {
      const newData = generateRealTimeData();
      setRealTimeData(newData);
      setLastUpdate(new Date());
      
      if (newData.alerts.length > 0) {
        setAlerts(prev => [...newData.alerts, ...prev].slice(0, 10));
      }

      if (onDataRefresh) {
        onDataRefresh(newData);
      }
    };

    // Initial data load
    updateData();

    // Set up interval for live updates
    if (isLive) {
      intervalRef.current = setInterval(updateData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLive, refreshInterval, onDataRefresh]);

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  const handleExport = () => {
    if (onExportData) {
      onExportData(realTimeData);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'percentage') return `${val.toFixed(1)}%`;
      return val.toLocaleString();
    };

    const getChangeIcon = () => {
      if (change > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
      if (change < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
      return <Minus className="w-4 h-4 text-gray-500" />;
    };

    const getChangeColor = () => {
      if (change > 0) return 'text-green-600';
      if (change < 0) return 'text-red-600';
      return 'text-gray-600';
    };

    return (
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={value} format={format} />
              </span>
              {change !== undefined && (
                <div className={`flex items-center gap-1 ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="text-sm font-medium">
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </AnimatedCard>
    );
  };

  const AlertItem = ({ alert }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      alert.type === 'success' ? 'bg-green-50 border-l-green-500' :
      alert.type === 'warning' ? 'bg-yellow-50 border-l-yellow-500' :
      alert.type === 'error' ? 'bg-red-50 border-l-red-500' :
      'bg-blue-50 border-l-blue-500'
    }`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
          {alert.type === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
          {alert.type === 'info' && <Activity className="w-4 h-4 text-blue-500" />}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {alert.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Real-Time Business Intelligence</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{isLive ? 'Live' : 'Paused'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLiveUpdates}
            className={isLive ? 'bg-green-50 border-green-200' : ''}
          >
            {isLive ? <Zap className="w-4 h-4 text-green-600" /> : <RefreshCw className="w-4 h-4" />}
            {isLive ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Revenue Today"
          value={realTimeData.revenue?.current || 0}
          change={realTimeData.revenue?.change}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          title="Active Deals"
          value={realTimeData.deals?.total || 0}
          change={2.5}
          icon={Target}
        />
        <MetricCard
          title="New Leads"
          value={realTimeData.leads?.total || 0}
          change={realTimeData.leads?.hot > 50 ? 8.2 : -1.5}
          icon={Users}
        />
        <MetricCard
          title="Conversion Rate"
          value={realTimeData.performance?.conversionRate || 0}
          change={1.2}
          icon={TrendingUp}
          format="percentage"
        />
      </StaggerContainer>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AnimatedCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Real-Time Alerts</h3>
            <Badge variant="outline">{alerts.length}</Badge>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {alerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <AnimatedCard className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-600" />
                  Revenue Trend (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realTimeData.revenue?.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </AnimatedCard>

            {/* Deal Stages */}
            <AnimatedCard className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-green-600" />
                  Deal Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={realTimeData.deals?.stages || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(realTimeData.deals?.stages || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Progress */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Revenue vs Target</span>
                    <span>{((realTimeData.revenue?.current / realTimeData.revenue?.target) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(realTimeData.revenue?.current / realTimeData.revenue?.target) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Deals Won</span>
                    <span>{realTimeData.deals?.won || 0}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pipeline Health</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </AnimatedCard>

            {/* Team Performance */}
            <div className="lg:col-span-2">
              <AnimatedCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={realTimeData.performance?.teamPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                    <Bar dataKey="quota" fill="#e5e7eb" />
                  </BarChart>
                </ResponsiveContainer>
              </AnimatedCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Sources */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Sources</h3>
              <div className="space-y-3">
                {(realTimeData.leads?.sources || []).map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{source.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{source.value}</span>
                      <div className={`flex items-center gap-1 ${
                        source.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {source.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        <span className="text-sm">{Math.abs(source.change)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Lead Quality */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Lead Quality Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                  { name: 'Hot', value: realTimeData.leads?.hot || 0, fill: '#ef4444' },
                  { name: 'Warm', value: realTimeData.leads?.warm || 0, fill: '#f59e0b' },
                  { name: 'Cold', value: realTimeData.leads?.cold || 0, fill: '#6b7280' }
                ]}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={realTimeData.activities?.timeline || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#3b82f6" />
                  <Bar dataKey="emails" fill="#10b981" />
                  <Bar dataKey="meetings" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </AnimatedCard>

            {/* Key Metrics */}
            <AnimatedCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {realTimeData.performance?.conversionRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${(realTimeData.performance?.avgDealSize || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Avg Deal Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.round(realTimeData.performance?.salesCycle || 0)} days
                  </div>
                  <div className="text-sm text-gray-600">Sales Cycle</div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6">
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Geographic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(realTimeData.geography || []).map((region, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{region.region}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deals:</span>
                      <span className="font-medium">{region.deals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue:</span>
                      <span className="font-medium">${region.revenue.toLocaleString()}</span>
                    </div>
                    <Progress value={(region.revenue / 75000) * 100} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeBI;