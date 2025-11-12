import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Layout,
  Plus,
  Settings,
  Save,
  Share,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Grid,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  Filter,
  Maximize,
  Minimize,
  RefreshCw,
  Clock,
  Star,
  Bookmark,
  Search,
  ChevronDown,
  ChevronUp,
  Move,
  Palette,
  Database,
  Activity,
  Zap,
  Globe,
  Mail,
  Phone,
  Building
} from 'lucide-react';

const CustomDashboardBuilder = () => {
  const [dashboards, setDashboards] = useState([]);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [availableWidgets, setAvailableWidgets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);

  // Mock data for charts
  const salesData = [
    { month: 'Jan', sales: 4000, leads: 240, deals: 24 },
    { month: 'Feb', sales: 3000, leads: 139, deals: 22 },
    { month: 'Mar', sales: 2000, leads: 980, deals: 29 },
    { month: 'Apr', sales: 2780, leads: 390, deals: 20 },
    { month: 'May', sales: 1890, leads: 480, deals: 27 },
    { month: 'Jun', sales: 2390, leads: 380, deals: 25 }
  ];

  const pieData = [
    { name: 'New', value: 400, color: '#0088FE' },
    { name: 'Qualified', value: 300, color: '#00C49F' },
    { name: 'Proposal', value: 200, color: '#FFBB28' },
    { name: 'Closed Won', value: 100, color: '#FF8042' }
  ];

  const mockDashboards = [
    {
      id: 1,
      name: 'Sales Overview',
      description: 'Complete sales performance dashboard',
      created_at: '2024-01-15',
      updated_at: '2024-01-20',
      is_default: true,
      widgets: [
        {
          id: 'w1',
          type: 'metric',
          title: 'Total Revenue',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: {
            value: '$125,430',
            change: '+12.5%',
            trend: 'up',
            icon: 'DollarSign',
            color: 'green'
          }
        },
        {
          id: 'w2',
          type: 'metric',
          title: 'Active Deals',
          position: { x: 3, y: 0, w: 3, h: 2 },
          config: {
            value: '47',
            change: '+8',
            trend: 'up',
            icon: 'Target',
            color: 'blue'
          }
        },
        {
          id: 'w3',
          type: 'chart',
          title: 'Sales Trend',
          position: { x: 0, y: 2, w: 6, h: 4 },
          config: {
            chartType: 'line',
            data: salesData,
            xAxis: 'month',
            yAxis: 'sales',
            color: '#8884d8'
          }
        },
        {
          id: 'w4',
          type: 'chart',
          title: 'Lead Sources',
          position: { x: 6, y: 0, w: 6, h: 6 },
          config: {
            chartType: 'pie',
            data: pieData
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Team Performance',
      description: 'Individual and team metrics',
      created_at: '2024-01-10',
      updated_at: '2024-01-18',
      is_default: false,
      widgets: []
    }
  ];

  const widgetTypes = [
    {
      type: 'metric',
      name: 'Metric Card',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Display key performance indicators',
      category: 'KPI'
    },
    {
      type: 'chart',
      name: 'Chart Widget',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Various chart types for data visualization',
      category: 'Charts'
    },
    {
      type: 'table',
      name: 'Data Table',
      icon: <Grid className="h-5 w-5" />,
      description: 'Tabular data display',
      category: 'Data'
    },
    {
      type: 'list',
      name: 'Activity List',
      icon: <Activity className="h-5 w-5" />,
      description: 'Recent activities and updates',
      category: 'Activity'
    },
    {
      type: 'progress',
      name: 'Progress Tracker',
      icon: <Target className="h-5 w-5" />,
      description: 'Goal and target tracking',
      category: 'Goals'
    },
    {
      type: 'calendar',
      name: 'Calendar View',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Upcoming events and tasks',
      category: 'Schedule'
    }
  ];

  useEffect(() => {
    setDashboards(mockDashboards);
    setCurrentDashboard(mockDashboards[0]);
    setWidgets(mockDashboards[0].widgets);
    setAvailableWidgets(widgetTypes);
  }, []);

  const createNewDashboard = () => {
    const newDashboard = {
      id: Date.now(),
      name: 'New Dashboard',
      description: 'Custom dashboard',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      is_default: false,
      widgets: []
    };
    setDashboards([...dashboards, newDashboard]);
    setCurrentDashboard(newDashboard);
    setWidgets([]);
    setIsEditMode(true);
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `w${Date.now()}`,
      type: widgetType.type,
      title: `New ${widgetType.name}`,
      position: { x: 0, y: 0, w: 4, h: 3 },
      config: getDefaultConfig(widgetType.type)
    };
    setWidgets([...widgets, newWidget]);
  };

  const getDefaultConfig = (type) => {
    switch (type) {
      case 'metric':
        return {
          value: '0',
          change: '0%',
          trend: 'neutral',
          icon: 'TrendingUp',
          color: 'blue'
        };
      case 'chart':
        return {
          chartType: 'bar',
          data: salesData,
          xAxis: 'month',
          yAxis: 'sales',
          color: '#8884d8'
        };
      case 'table':
        return {
          columns: ['Name', 'Value', 'Status'],
          data: []
        };
      case 'list':
        return {
          items: [],
          showTimestamp: true,
          maxItems: 10
        };
      case 'progress':
        return {
          current: 0,
          target: 100,
          unit: '%',
          color: 'blue'
        };
      case 'calendar':
        return {
          view: 'month',
          showEvents: true,
          showTasks: true
        };
      default:
        return {};
    }
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'metric':
        return (
          <Card className="h-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{widget.title}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{widget.config.value}</p>
                  <Badge className={`${widget.config.trend === 'up' ? 'bg-green-500' : widget.config.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'}`}>
                    {widget.config.change}
                  </Badge>
                </div>
              </div>
              <div className={`p-3 rounded-full ${widget.config.color === 'green' ? 'bg-green-100' : widget.config.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {widget.config.icon === 'DollarSign' && <DollarSign className="h-6 w-6" />}
                {widget.config.icon === 'Target' && <Target className="h-6 w-6" />}
                {widget.config.icon === 'Users' && <Users className="h-6 w-6" />}
                {widget.config.icon === 'TrendingUp' && <TrendingUp className="h-6 w-6" />}
              </div>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                {widget.config.chartType === 'line' && (
                  <LineChart data={widget.config.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={widget.config.yAxis} stroke={widget.config.color} />
                  </LineChart>
                )}
                {widget.config.chartType === 'bar' && (
                  <BarChart data={widget.config.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={widget.config.xAxis} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={widget.config.yAxis} fill={widget.config.color} />
                  </BarChart>
                )}
                {widget.config.chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={widget.config.data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {widget.config.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-8 w-8 mx-auto mb-2" />
                <p>Table widget - Configure data source</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'list':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-2 bg-muted rounded">
                    <Activity className="h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Activity {item}</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'progress':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">75 of 100 target achieved</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'calendar':
        return (
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>Calendar widget - Configure events</p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="h-full">
            <CardContent className="p-6 text-center">
              <p>Unknown widget type</p>
            </CardContent>
          </Card>
        );
    }
  };

  const saveDashboard = () => {
    const updatedDashboards = dashboards.map(d => 
      d.id === currentDashboard.id 
        ? { ...d, widgets, updated_at: new Date().toISOString().split('T')[0] }
        : d
    );
    setDashboards(updatedDashboards);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Builder</h1>
          <p className="text-muted-foreground">
            Create and customize your analytics dashboards
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={createNewDashboard}>
            <Plus className="h-4 w-4 mr-2" />
            New Dashboard
          </Button>
          {isEditMode ? (
            <Button onClick={saveDashboard}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Mode
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard Selector */}
      <div className="flex items-center space-x-4">
        <Select 
          value={currentDashboard?.id.toString()} 
          onValueChange={(value) => {
            const dashboard = dashboards.find(d => d.id.toString() === value);
            setCurrentDashboard(dashboard);
            setWidgets(dashboard.widgets);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select dashboard" />
          </SelectTrigger>
          <SelectContent>
            {dashboards.map((dashboard) => (
              <SelectItem key={dashboard.id} value={dashboard.id.toString()}>
                <div className="flex items-center space-x-2">
                  <span>{dashboard.name}</span>
                  {dashboard.is_default && <Star className="h-3 w-3 text-yellow-500" />}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {currentDashboard && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Last updated: {currentDashboard.updated_at}</span>
            <Badge variant="outline">{widgets.length} widgets</Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Widget Library (shown in edit mode) */}
        {isEditMode && (
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Widget Library</CardTitle>
                <CardDescription>Drag widgets to add them to your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {availableWidgets.map((widget, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => addWidget(widget)}
                      >
                        <div className="flex items-center space-x-3">
                          {widget.icon}
                          <div className="flex-1">
                            <p className="font-medium text-sm">{widget.name}</p>
                            <p className="text-xs text-muted-foreground">{widget.description}</p>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className={isEditMode ? "col-span-9" : "col-span-12"}>
          {widgets.length === 0 ? (
            <Card className="h-96">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Empty Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    {isEditMode 
                      ? "Add widgets from the library to get started" 
                      : "This dashboard has no widgets configured"}
                  </p>
                  {!isEditMode && (
                    <Button onClick={() => setIsEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Start Editing
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-12 gap-4 auto-rows-min">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`col-span-${widget.position.w} row-span-${widget.position.h} relative group`}
                  style={{ minHeight: `${widget.position.h * 100}px` }}
                >
                  {isEditMode && (
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0"
                          onClick={() => setWidgets(widgets.filter(w => w.id !== widget.id))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Settings Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="fixed bottom-6 right-6">
            <Settings className="h-4 w-4 mr-2" />
            Dashboard Settings
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Configure dashboard properties and sharing options
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input 
                  id="dashboard-name" 
                  value={currentDashboard?.name || ''} 
                  placeholder="Enter dashboard name"
                />
              </div>
              <div>
                <Label htmlFor="dashboard-description">Description</Label>
                <Input 
                  id="dashboard-description" 
                  value={currentDashboard?.description || ''} 
                  placeholder="Enter dashboard description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Display Options</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch id="auto-refresh" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="full-screen">Full Screen Mode</Label>
                <Switch id="full-screen" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-theme">Dark Theme</Label>
                <Switch id="dark-theme" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Sharing & Access</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="public-access">Public Access</Label>
                <Switch id="public-access" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="embed-enabled">Embed Enabled</Label>
                <Switch id="embed-enabled" />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Settings</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomDashboardBuilder;