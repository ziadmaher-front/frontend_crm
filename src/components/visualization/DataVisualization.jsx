import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  MapIcon,
  FunnelIcon,
  BeakerIcon,
  CubeIcon,
  EyeIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PhotoIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  BoltIcon,
  LightBulbIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  TrophyIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CloudIcon,
  ServerIcon,
  DatabaseIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  WifiIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
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
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  TreemapChart,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  SankeyChart,
  Sankey,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ErrorBar
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

// Data visualization engine
class VisualizationEngine {
  constructor() {
    this.chartTypes = {
      line: { name: 'Line Chart', icon: PresentationChartLineIcon, component: 'LineChart' },
      area: { name: 'Area Chart', icon: ChartBarIcon, component: 'AreaChart' },
      bar: { name: 'Bar Chart', icon: ChartBarIcon, component: 'BarChart' },
      pie: { name: 'Pie Chart', icon: ChartPieIcon, component: 'PieChart' },
      scatter: { name: 'Scatter Plot', icon: SparklesIcon, component: 'ScatterChart' },
      radar: { name: 'Radar Chart', icon: GlobeAltIcon, component: 'RadarChart' },
      funnel: { name: 'Funnel Chart', icon: FunnelIcon, component: 'FunnelChart' },
      treemap: { name: 'Treemap', icon: CubeIcon, component: 'TreemapChart' },
      radialBar: { name: 'Radial Bar', icon: CircleStackIcon, component: 'RadialBarChart' },
      composed: { name: 'Composed Chart', icon: BeakerIcon, component: 'ComposedChart' }
    };
    
    this.colorPalettes = {
      default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
      pastel: ['#fecaca', '#fed7d7', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#fce7f3', '#f3e8ff'],
      vibrant: ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669', '#0891b2', '#7c3aed', '#c026d3'],
      monochrome: ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb'],
      ocean: ['#0c4a6e', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'],
      sunset: ['#7c2d12', '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed']
    };
  }

  // Generate sample data for different chart types
  generateSampleData(type, count = 10) {
    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    switch (type) {
      case 'line':
      case 'area':
      case 'bar':
        return categories.slice(0, count).map(month => ({
          name: month,
          sales: Math.floor(Math.random() * 10000) + 1000,
          revenue: Math.floor(Math.random() * 50000) + 10000,
          profit: Math.floor(Math.random() * 20000) + 5000,
          customers: Math.floor(Math.random() * 500) + 100
        }));
        
      case 'pie':
        return products.slice(0, count).map(product => ({
          name: product,
          value: Math.floor(Math.random() * 1000) + 100,
          fill: this.colorPalettes.default[Math.floor(Math.random() * this.colorPalettes.default.length)]
        }));
        
      case 'scatter':
        return Array.from({ length: count * 5 }, (_, i) => ({
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 50 + 10,
          category: products[i % products.length]
        }));
        
      case 'radar':
        return products.slice(0, count).map(product => ({
          subject: product,
          A: Math.floor(Math.random() * 100) + 20,
          B: Math.floor(Math.random() * 100) + 20,
          C: Math.floor(Math.random() * 100) + 20,
          fullMark: 100
        }));
        
      case 'funnel':
        return [
          { name: 'Leads', value: 1000, fill: '#3b82f6' },
          { name: 'Qualified', value: 800, fill: '#10b981' },
          { name: 'Proposals', value: 600, fill: '#f59e0b' },
          { name: 'Negotiations', value: 400, fill: '#ef4444' },
          { name: 'Closed', value: 200, fill: '#8b5cf6' }
        ];
        
      case 'treemap':
        return regions.map(region => ({
          name: region,
          size: Math.floor(Math.random() * 1000) + 200,
          fill: this.colorPalettes.default[Math.floor(Math.random() * this.colorPalettes.default.length)]
        }));
        
      default:
        return [];
    }
  }

  // Data transformation utilities
  transformData(data, transformations) {
    let result = [...data];
    
    transformations.forEach(transform => {
      switch (transform.type) {
        case 'filter':
          result = result.filter(item => 
            item[transform.field] && 
            item[transform.field].toString().toLowerCase().includes(transform.value.toLowerCase())
          );
          break;
          
        case 'sort':
          result.sort((a, b) => {
            const aVal = a[transform.field];
            const bVal = b[transform.field];
            return transform.order === 'asc' ? aVal - bVal : bVal - aVal;
          });
          break;
          
        case 'group':
          const grouped = {};
          result.forEach(item => {
            const key = item[transform.field];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
          });
          result = Object.entries(grouped).map(([key, items]) => ({
            name: key,
            value: items.reduce((sum, item) => sum + (item[transform.aggregateField] || 0), 0),
            count: items.length
          }));
          break;
          
        case 'aggregate':
          const aggregated = {};
          result.forEach(item => {
            const key = item[transform.groupBy];
            if (!aggregated[key]) {
              aggregated[key] = { name: key, count: 0 };
            }
            aggregated[key].count++;
            transform.fields.forEach(field => {
              if (!aggregated[key][field]) aggregated[key][field] = 0;
              aggregated[key][field] += item[field] || 0;
            });
          });
          result = Object.values(aggregated);
          break;
      }
    });
    
    return result;
  }

  // Export utilities
  exportToCSV(data, filename = 'data.csv') {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToJSON(data, filename = 'data.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

// Chart Configuration Panel
const ChartConfigPanel = ({ config, onChange, onClose }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const visualizationEngine = useRef(new VisualizationEngine());

  const updateConfig = (key, value) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 overflow-y-auto"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Chart Configuration</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
            <select
              value={localConfig.type}
              onChange={(e) => updateConfig('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(visualizationEngine.current.chartTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={localConfig.title || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter chart title"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(visualizationEngine.current.colorPalettes).map(([key, colors]) => (
                <button
                  key={key}
                  onClick={() => updateConfig('colorPalette', key)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    localConfig.colorPalette === key ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex space-x-1">
                    {colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 capitalize">{key}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Width</label>
                <input
                  type="number"
                  value={localConfig.width || 400}
                  onChange={(e) => updateConfig('width', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Height</label>
                <input
                  type="number"
                  value={localConfig.height || 300}
                  onChange={(e) => updateConfig('height', parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          {/* Animation */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.animated !== false}
                onChange={(e) => updateConfig('animated', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Animation</span>
            </label>
          </div>

          {/* Grid Lines */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.showGrid !== false}
                onChange={(e) => updateConfig('showGrid', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Grid Lines</span>
            </label>
          </div>

          {/* Legend */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.showLegend !== false}
                onChange={(e) => updateConfig('showLegend', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Legend</span>
            </label>
          </div>

          {/* Tooltip */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.showTooltip !== false}
                onChange={(e) => updateConfig('showTooltip', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Tooltip</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Dynamic Chart Component
const DynamicChart = ({ config, data }) => {
  const visualizationEngine = useRef(new VisualizationEngine());
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return visualizationEngine.current.generateSampleData(config.type, 8);
    }
    return data;
  }, [data, config.type]);

  const colors = visualizationEngine.current.colorPalettes[config.colorPalette || 'default'];

  const renderChart = () => {
    const commonProps = {
      width: config.width || 400,
      height: config.height || 300,
      data: chartData
    };

    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: colors[0] }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke={colors[1]} 
              strokeWidth={2}
              dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="sales" 
              stackId="1"
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1"
              stroke={colors[1]} 
              fill={colors[1]}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Bar dataKey="sales" fill={colors[0]} />
            <Bar dataKey="revenue" fill={colors[1]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis type="number" dataKey="x" stroke="#6b7280" />
            <YAxis type="number" dataKey="y" stroke="#6b7280" />
            {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {config.showLegend && <Legend />}
            <Scatter name="Data Points" data={chartData} fill={colors[0]} />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Radar
              name="Series A"
              dataKey="A"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
            <Radar
              name="Series B"
              dataKey="B"
              stroke={colors[1]}
              fill={colors[1]}
              fillOpacity={0.6}
            />
          </RadarChart>
        );

      case 'funnel':
        return (
          <FunnelChart {...commonProps}>
            {config.showTooltip && <Tooltip />}
            <Funnel
              dataKey="value"
              data={chartData}
              isAnimationActive={config.animated !== false}
            >
              <LabelList position="center" fill="#fff" stroke="none" />
            </Funnel>
          </FunnelChart>
        );

      case 'treemap':
        return (
          <Treemap
            {...commonProps}
            data={chartData}
            dataKey="size"
            ratio={4/3}
            stroke="#fff"
            fill={colors[0]}
          />
        );

      case 'radialBar':
        return (
          <RadialBarChart {...commonProps} innerRadius="10%" outerRadius="80%">
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="value"
              data={chartData}
              fill={colors[0]}
            />
          </RadialBarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Area 
              type="monotone" 
              dataKey="sales" 
              fill={colors[0]}
              fillOpacity={0.3}
              stroke={colors[0]}
            />
            <Bar dataKey="revenue" barSize={20} fill={colors[1]} />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke={colors[2]}
              strokeWidth={2}
            />
          </ComposedChart>
        );

      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {config.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{config.title}</h3>
      )}
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={config.height || 300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Dashboard Builder Component
const DashboardBuilder = ({ dashboards, onSave, onDelete }) => {
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [charts, setCharts] = useState([]);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [selectedChart, setSelectedChart] = useState(null);

  const addChart = () => {
    const newChart = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'line',
      title: 'New Chart',
      colorPalette: 'default',
      width: 400,
      height: 300,
      animated: true,
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      data: null
    };
    
    setCharts([...charts, newChart]);
    setSelectedChart(newChart);
    setShowConfigPanel(true);
  };

  const updateChart = (updatedChart) => {
    setCharts(charts.map(chart => 
      chart.id === updatedChart.id ? updatedChart : chart
    ));
    setSelectedChart(updatedChart);
  };

  const deleteChart = (chartId) => {
    setCharts(charts.filter(chart => chart.id !== chartId));
    if (selectedChart?.id === chartId) {
      setSelectedChart(null);
      setShowConfigPanel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Builder</h2>
          <p className="text-gray-600">Create and customize your data visualizations</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={addChart}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Chart</span>
          </button>
          
          <button
            onClick={() => onSave({ charts })}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Dashboard
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {charts.map((chart) => (
            <motion.div
              key={chart.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group"
            >
              <DynamicChart config={chart} data={chart.data} />
              
              {/* Chart Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedChart(chart);
                      setShowConfigPanel(true);
                    }}
                    className="p-1 bg-white rounded shadow-md hover:bg-gray-50"
                  >
                    <Cog6ToothIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => deleteChart(chart.id)}
                    className="p-1 bg-white rounded shadow-md hover:bg-gray-50 text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Add Chart Placeholder */}
        {charts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No charts yet</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first chart</p>
              <button
                onClick={addChart}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Chart
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfigPanel && selectedChart && (
          <ChartConfigPanel
            config={selectedChart}
            onChange={updateChart}
            onClose={() => setShowConfigPanel(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Data Visualization Component
const DataVisualization = () => {
  const [activeTab, setActiveTab] = useState('builder');
  const [dashboards, setDashboards] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  
  const visualizationEngine = useRef(new VisualizationEngine());
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Load dashboards
  const { data: dashboardsData, isLoading } = useQuery(
    'visualization-dashboards',
    async () => {
      const response = await fetch('/api/visualization/dashboards');
      if (!response.ok) throw new Error('Failed to load dashboards');
      return response.json();
    }
  );

  // Save dashboard mutation
  const saveDashboardMutation = useMutation(
    async (dashboard) => {
      const response = await fetch('/api/visualization/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboard)
      });
      if (!response.ok) throw new Error('Failed to save dashboard');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('visualization-dashboards');
        showNotification('Dashboard saved successfully', 'success');
      },
      onError: () => {
        showNotification('Failed to save dashboard', 'error');
      }
    }
  );

  const handleSaveDashboard = (dashboard) => {
    saveDashboardMutation.mutate(dashboard);
  };

  const handleDeleteDashboard = (dashboardId) => {
    setDashboards(dashboards.filter(d => d.id !== dashboardId));
    showNotification('Dashboard deleted', 'info');
  };

  const tabs = [
    { id: 'builder', name: 'Dashboard Builder', icon: CubeIcon },
    { id: 'gallery', name: 'Chart Gallery', icon: PhotoIcon },
    { id: 'data', name: 'Data Sources', icon: DatabaseIcon },
    { id: 'export', name: 'Export & Share', icon: ShareIcon }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Visualization</h1>
              <p className="text-sm text-gray-600">Create stunning charts and interactive dashboards</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Import Data</span>
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>New Dashboard</span>
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
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'builder' && (
              <DashboardBuilder
                dashboards={dashboards}
                onSave={handleSaveDashboard}
                onDelete={handleDeleteDashboard}
              />
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chart Gallery</h2>
                  <p className="text-gray-600">Explore different chart types and visualizations</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(visualizationEngine.current.chartTypes).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <Icon className="h-6 w-6 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{config.name}</h3>
                        </div>
                        
                        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                          <DynamicChart
                            config={{ type, width: 200, height: 120, showGrid: false, showLegend: false }}
                            data={null}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
                <p className="text-gray-600">Connect and manage your data sources for visualization.</p>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Export & Share</h2>
                <p className="text-gray-600">Export your visualizations and share with others.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;