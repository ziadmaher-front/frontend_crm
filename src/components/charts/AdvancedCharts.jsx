import React, { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart,
  Line,
  Area,
  Treemap,
  Sankey,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

// Color palettes for different chart types
const HEATMAP_COLORS = ['#f7fafc', '#e2e8f0', '#cbd5e0', '#a0aec0', '#718096', '#4a5568', '#2d3748'];
const FUNNEL_COLORS = ['#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#d97706', '#ca8a04'];
const WATERFALL_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  total: '#6366f1',
  neutral: '#6b7280'
};

// Heatmap Chart Component
export const HeatmapChart = memo(({ data, title, width = "100%", height = 300 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      colorValue: Math.min(Math.max(item.value || 0, 0), 100)
    }));
  }, [data]);

  const getHeatmapColor = (value) => {
    const intensity = Math.floor((value / 100) * (HEATMAP_COLORS.length - 1));
    return HEATMAP_COLORS[intensity] || HEATMAP_COLORS[0];
  };

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          {title || 'Heatmap Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width={width} height={height}>
          <Treemap
            data={processedData}
            dataKey="value"
            aspectRatio={4/3}
            stroke="#fff"
            fill="#8884d8"
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getHeatmapColor(entry.colorValue)}
              />
            ))}
          </Treemap>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>Low Activity</span>
          <span>High Activity</span>
        </div>
      </CardContent>
    </Card>
  );
});

// Funnel Chart Component
export const FunnelChart = memo(({ data, title, width = "100%", height = 400 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    const maxValue = Math.max(...data.map(item => item.value || 0));
    return data.map((item, index) => ({
      ...item,
      percentage: maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0,
      conversionRate: index > 0 ? ((item.value || 0) / (data[index - 1]?.value || 1)) * 100 : 100,
      barWidth: maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0
    }));
  }, [data]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          {title || 'Conversion Funnel'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processedData.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{item.value?.toLocaleString()}</span>
                  {index > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.conversionRate?.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 ease-out"
                  style={{
                    width: `${item.barWidth}%`,
                    backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length]
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                  {item.percentage?.toFixed(1)}%
                </div>
              </div>
              {index < processedData.length - 1 && (
                <div className="flex justify-center mt-2">
                  <TrendingDown className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Waterfall Chart Component
export const WaterfallChart = memo(({ data, title, width = "100%", height = 350 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    let runningTotal = 0;
    return data.map((item, index) => {
      const value = item.value || 0;
      const isTotal = item.type === 'total';
      const isPositive = value > 0;
      
      if (!isTotal) {
        runningTotal += value;
      }
      
      return {
        ...item,
        start: isTotal ? 0 : runningTotal - value,
        end: isTotal ? runningTotal : runningTotal,
        value: Math.abs(value),
        color: isTotal 
          ? WATERFALL_COLORS.total 
          : isPositive 
            ? WATERFALL_COLORS.positive 
            : WATERFALL_COLORS.negative,
        isPositive,
        isTotal
      };
    });
  }, [data]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          {title || 'Waterfall Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width={width} height={height}>
          <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => [
                `${value > 0 ? '+' : ''}${value.toLocaleString()}`,
                name
              ]}
            />
            <Bar dataKey="value" stackId="waterfall">
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 flex justify-center space-x-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: WATERFALL_COLORS.positive }} />
            <span>Positive Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: WATERFALL_COLORS.negative }} />
            <span>Negative Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: WATERFALL_COLORS.total }} />
            <span>Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Scatter Plot Matrix Component
export const ScatterPlotMatrix = memo(({ data, title, xKey, yKey, sizeKey, colorKey, width = "100%", height = 400 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      x: item[xKey] || 0,
      y: item[yKey] || 0,
      z: item[sizeKey] || 10,
      color: item[colorKey] || index
    }));
  }, [data, xKey, yKey, sizeKey, colorKey]);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          {title || 'Correlation Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width={width} height={height}>
          <ScatterChart data={processedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xKey}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yKey}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value, name) => [value, name]}
            />
            <Scatter dataKey="z" fill="#6366f1">
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={FUNNEL_COLORS[entry.color % FUNNEL_COLORS.length]}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});

// Interactive Dashboard Grid Component
export const InteractiveDashboard = memo(({ widgets, title, onWidgetClick }) => {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-500" />
          {title || 'Interactive Dashboard'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets?.map((widget, index) => (
            <div
              key={widget.id || index}
              className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onWidgetClick?.(widget)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{widget.title}</h4>
                {widget.trend && (
                  <div className={`flex items-center gap-1 text-xs ${
                    widget.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {widget.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(widget.trend)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {widget.value?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {widget.subtitle}
              </div>
              {widget.progress && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(widget.progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

// Export all components
export default {
  HeatmapChart,
  FunnelChart,
  WaterfallChart,
  ScatterPlotMatrix,
  InteractiveDashboard
};