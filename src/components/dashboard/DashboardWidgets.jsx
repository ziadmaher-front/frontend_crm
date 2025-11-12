import React, { useState, useCallback, useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DragDropContext,
  Droppable,
  Draggable
} from 'react-beautiful-dnd';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Plus,
  RefreshCw,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Widget size configurations
const WIDGET_SIZES = {
  small: { width: 1, height: 1 },
  medium: { width: 2, height: 1 },
  large: { width: 2, height: 2 },
  wide: { width: 3, height: 1 },
  tall: { width: 1, height: 2 }
};

// Color schemes for charts
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#06b6d4'];

// Base Widget Component
const BaseWidget = memo(({ 
  widget, 
  index, 
  onRemove, 
  onResize, 
  onRefresh, 
  onSettings,
  isDragging = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      await onRefresh?.(widget.id);
    } finally {
      setIsLoading(false);
    }
  }, [widget.id, onRefresh]);

  const widgetContent = useMemo(() => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget data={widget.data} config={widget.config} />;
      case 'chart':
        return <ChartWidget data={widget.data} config={widget.config} />;
      case 'table':
        return <TableWidget data={widget.data} config={widget.config} />;
      case 'progress':
        return <ProgressWidget data={widget.data} config={widget.config} />;
      case 'activity':
        return <ActivityWidget data={widget.data} config={widget.config} />;
      default:
        return <div className="p-4 text-gray-500">Unknown widget type</div>;
    }
  }, [widget.type, widget.data, widget.config]);

  return (
    <Draggable draggableId={widget.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${
            isExpanded ? 'fixed inset-4 z-50' : ''
          } transition-all duration-200 ${
            snapshot.isDragging ? 'rotate-2 scale-105' : ''
          }`}
        >
          <Card className={`h-full border-none shadow-lg hover:shadow-xl transition-shadow ${
            snapshot.isDragging ? 'shadow-2xl' : ''
          }`}>
            <CardHeader 
              {...provided.dragHandleProps}
              className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-move"
            >
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {widget.icon && <widget.icon className="w-4 h-4" />}
                {widget.title}
                {widget.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {widget.badge}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSettings?.(widget.id)}
                  className="h-6 w-6 p-0"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove?.(widget.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                widgetContent
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
});

// Metric Widget Component
const MetricWidget = memo(({ data, config }) => {
  const { value, previousValue, label, format = 'number', trend } = data || {};
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;

  const formatValue = (val) => {
    if (!val && val !== 0) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold text-gray-900">
        {formatValue(value)}
      </div>
      {label && (
        <div className="text-sm text-gray-600">{label}</div>
      )}
      {previousValue && (
        <div className={`flex items-center gap-1 text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(1)}% from last period
        </div>
      )}
      {trend && (
        <div className="text-xs text-gray-500">
          Trend: {trend}
        </div>
      )}
    </div>
  );
});

// Chart Widget Component
const ChartWidget = memo(({ data, config }) => {
  const { chartType = 'line', height = 200 } = config || {};
  
  if (!data || !Array.isArray(data)) {
    return <div className="text-gray-500 text-center py-8">No data available</div>;
  }

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={CHART_COLORS[0]} 
              fill={CHART_COLORS[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[0]} />
          </BarChart>
        );
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={CHART_COLORS[0]} 
              strokeWidth={2}
              dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
});

// Table Widget Component
const TableWidget = memo(({ data, config }) => {
  const { columns = [], maxRows = 5 } = config || {};
  
  if (!data || !Array.isArray(data)) {
    return <div className="text-gray-500 text-center py-4">No data available</div>;
  }

  const displayData = data.slice(0, maxRows);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th key={index} className="text-left py-2 px-3 font-medium text-gray-700">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="py-2 px-3 text-gray-900">
                    {row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Showing {maxRows} of {data.length} items
        </div>
      )}
    </div>
  );
});

// Progress Widget Component
const ProgressWidget = memo(({ data, config }) => {
  const { value = 0, target = 100, label, format = 'percentage' } = data || {};
  const percentage = Math.min(100, (value / target) * 100);
  const isOnTrack = percentage >= 75;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {format === 'percentage' ? `${percentage.toFixed(1)}%` : `${value}/${target}`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isOnTrack ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        Target: {target.toLocaleString()}
      </div>
    </div>
  );
});

// Activity Widget Component
const ActivityWidget = memo(({ data, config }) => {
  const { maxItems = 5 } = config || {};
  
  if (!data || !Array.isArray(data)) {
    return <div className="text-gray-500 text-center py-4">No recent activity</div>;
  }

  const displayData = data.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayData.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`w-2 h-2 rounded-full mt-2 ${
            activity.type === 'success' ? 'bg-green-500' :
            activity.type === 'warning' ? 'bg-yellow-500' :
            activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900">{activity.message}</div>
            <div className="text-xs text-gray-500">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// Main Dashboard Grid Component
const DashboardGrid = memo(({ 
  widgets = [], 
  onWidgetMove, 
  onWidgetRemove, 
  onWidgetResize, 
  onWidgetRefresh,
  onWidgetSettings,
  onAddWidget 
}) => {
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    if (source.index === destination.index) return;
    
    onWidgetMove?.(source.index, destination.index);
  }, [onWidgetMove]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        <Button onClick={onAddWidget} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Widget
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-grid">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px] ${
                snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
              }`}
            >
              {widgets.map((widget, index) => (
                <BaseWidget
                  key={widget.id}
                  widget={widget}
                  index={index}
                  onRemove={onWidgetRemove}
                  onResize={onWidgetResize}
                  onRefresh={onWidgetRefresh}
                  onSettings={onWidgetSettings}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

// Widget Factory for creating new widgets
export const createWidget = (type, config = {}) => {
  const baseWidget = {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: config.title || 'New Widget',
    size: config.size || 'medium',
    config: config.config || {},
    data: config.data || null,
    createdAt: new Date().toISOString()
  };

  // Add type-specific defaults
  switch (type) {
    case 'metric':
      return {
        ...baseWidget,
        icon: DollarSign,
        title: config.title || 'Metric',
        data: {
          value: 0,
          label: 'Total Value',
          format: 'number',
          ...config.data
        }
      };
    case 'chart':
      return {
        ...baseWidget,
        icon: BarChart3,
        title: config.title || 'Chart',
        config: {
          chartType: 'line',
          height: 200,
          ...config.config
        }
      };
    case 'table':
      return {
        ...baseWidget,
        icon: Activity,
        title: config.title || 'Data Table',
        config: {
          columns: [],
          maxRows: 5,
          ...config.config
        }
      };
    case 'progress':
      return {
        ...baseWidget,
        icon: Target,
        title: config.title || 'Progress',
        data: {
          value: 0,
          target: 100,
          label: 'Progress',
          ...config.data
        }
      };
    case 'activity':
      return {
        ...baseWidget,
        icon: Activity,
        title: config.title || 'Recent Activity',
        config: {
          maxItems: 5,
          ...config.config
        }
      };
    default:
      return baseWidget;
  }
};

export { DashboardGrid, BaseWidget, WIDGET_SIZES };
export default DashboardGrid;