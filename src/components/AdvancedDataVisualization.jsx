import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  Sankey,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Filter,
  Layers,
  Grid,
  Map,
  Gauge,
  Radar as RadarIcon,
  Zap as ScatterIcon,
  BarChart2,
  AreaChart as AreaChartIcon
} from 'lucide-react';

// Color palettes for different chart types
const COLOR_PALETTES = {
  primary: ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#8B5A2B'],
  gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
  pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1DC', '#E0BBE4', '#957DAD', '#D291BC'],
  dark: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'],
  vibrant: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
};

// Advanced chart configurations
const CHART_CONFIGS = {
  salesTrend: {
    revenue: { label: 'Revenue', color: '#10B981' },
    deals: { label: 'Deals', color: '#6366F1' },
    leads: { label: 'Leads', color: '#F59E0B' }
  },
  performance: {
    conversion: { label: 'Conversion Rate', color: '#EC4899' },
    engagement: { label: 'Engagement', color: '#8B5CF6' },
    satisfaction: { label: 'Satisfaction', color: '#10B981' }
  },
  distribution: {
    segment1: { label: 'Enterprise', color: '#6366F1' },
    segment2: { label: 'Mid-Market', color: '#8B5CF6' },
    segment3: { label: 'SMB', color: '#EC4899' },
    segment4: { label: 'Startup', color: '#F59E0B' }
  }
};

// Sample data generators
const generateTimeSeriesData = (points = 12, metrics = ['revenue', 'deals', 'leads']) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return Array.from({ length: points }, (_, i) => {
    const data = { month: months[i] || `Month ${i + 1}` };
    metrics.forEach(metric => {
      data[metric] = Math.floor(Math.random() * 100000) + 10000;
    });
    return data;
  });
};

const generateScatterData = (points = 50) => {
  return Array.from({ length: points }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    z: Math.random() * 50 + 10,
    category: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
  }));
};

const generateRadarData = () => {
  return [
    { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
    { subject: 'Marketing', A: 98, B: 130, fullMark: 150 },
    { subject: 'Development', A: 86, B: 130, fullMark: 150 },
    { subject: 'Customer Support', A: 99, B: 100, fullMark: 150 },
    { subject: 'Information Technology', A: 85, B: 90, fullMark: 150 },
    { subject: 'Administration', A: 65, B: 85, fullMark: 150 }
  ];
};

const generateFunnelData = () => {
  return [
    { name: 'Leads', value: 1000, fill: '#6366F1' },
    { name: 'Qualified', value: 750, fill: '#8B5CF6' },
    { name: 'Proposals', value: 500, fill: '#EC4899' },
    { name: 'Negotiations', value: 300, fill: '#EF4444' },
    { name: 'Closed Won', value: 150, fill: '#10B981' }
  ];
};

// Interactive Chart Components
const InteractiveLineChart = ({ data, config, height = 300 }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(Object.keys(config));
  const [showGrid, setShowGrid] = useState(true);
  const [showDots, setShowDots] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {Object.entries(config).map(([key, { label, color }]) => (
            <Badge
              key={key}
              variant={selectedMetrics.includes(key) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedMetrics(prev => 
                  prev.includes(key) 
                    ? prev.filter(m => m !== key)
                    : [...prev, key]
                );
              }}
              style={{ backgroundColor: selectedMetrics.includes(key) ? color : 'transparent' }}
            >
              {label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDots(!showDots)}
          >
            {showDots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      <ChartContainer config={config} className="h-[300px]">
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {selectedMetrics.map(metric => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={config[metric].color}
              strokeWidth={2}
              dot={showDots ? { r: 4 } : false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

const InteractiveBarChart = ({ data, config, height = 300 }) => {
  const [chartType, setChartType] = useState('grouped');
  const [showValues, setShowValues] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="grouped">Grouped</SelectItem>
            <SelectItem value="stacked">Stacked</SelectItem>
          </SelectContent>
        </Select>
        <Switch
          checked={showValues}
          onCheckedChange={setShowValues}
          id="show-values"
        />
        <Label htmlFor="show-values">Show Values</Label>
      </div>

      <ChartContainer config={config} className="h-[300px]">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {Object.entries(config).map(([key, { color }]) => (
            <Bar
              key={key}
              dataKey={key}
              fill={color}
              stackId={chartType === 'stacked' ? 'stack' : undefined}
            >
              {showValues && <LabelList dataKey={key} position="top" />}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
};

const InteractiveAreaChart = ({ data, config, height = 300 }) => {
  const [fillOpacity, setFillOpacity] = useState([0.6]);
  const [stackOffset, setStackOffset] = useState('none');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Fill Opacity:</Label>
          <Slider
            value={fillOpacity}
            onValueChange={setFillOpacity}
            max={1}
            min={0.1}
            step={0.1}
            className="w-20"
          />
          <span className="text-sm text-gray-500">{fillOpacity[0]}</span>
        </div>
        <Select value={stackOffset} onValueChange={setStackOffset}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="expand">Expand</SelectItem>
            <SelectItem value="wiggle">Wiggle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ChartContainer config={config} className="h-[300px]">
        <AreaChart data={data} stackOffset={stackOffset}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {Object.entries(config).map(([key, { color }]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={color}
              fill={color}
              fillOpacity={fillOpacity[0]}
            />
          ))}
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

const InteractiveScatterChart = ({ data, height = 300 }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bubbleSize, setBubbleSize] = useState([10]);

  const filteredData = useMemo(() => {
    return selectedCategory === 'all' 
      ? data 
      : data.filter(item => item.category === selectedCategory);
  }, [data, selectedCategory]);

  const categories = useMemo(() => {
    return ['all', ...new Set(data.map(item => item.category))];
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : `Category ${category}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label>Bubble Size:</Label>
          <Slider
            value={bubbleSize}
            onValueChange={setBubbleSize}
            max={20}
            min={5}
            step={1}
            className="w-20"
          />
        </div>
      </div>

      <ChartContainer config={{}} className="h-[300px]">
        <ScatterChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name="X Value" />
          <YAxis dataKey="y" name="Y Value" />
          <ChartTooltip 
            content={<ChartTooltipContent />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter 
            dataKey="z" 
            fill="#6366F1"
            r={bubbleSize[0]}
          />
        </ScatterChart>
      </ChartContainer>
    </div>
  );
};

const InteractiveRadarChart = ({ data, height = 300 }) => {
  const [showGrid, setShowGrid] = useState(true);
  const [fillOpacity, setFillOpacity] = useState([0.3]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Switch
          checked={showGrid}
          onCheckedChange={setShowGrid}
          id="radar-grid"
        />
        <Label htmlFor="radar-grid">Show Grid</Label>
        <div className="flex items-center gap-2">
          <Label>Fill Opacity:</Label>
          <Slider
            value={fillOpacity}
            onValueChange={setFillOpacity}
            max={0.8}
            min={0.1}
            step={0.1}
            className="w-20"
          />
        </div>
      </div>

      <ChartContainer config={{}} className="h-[300px]">
        <RadarChart data={data}>
          {showGrid && <PolarGrid />}
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 150]} />
          <Radar
            name="Team A"
            dataKey="A"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={fillOpacity[0]}
          />
          <Radar
            name="Team B"
            dataKey="B"
            stroke="#EC4899"
            fill="#EC4899"
            fillOpacity={fillOpacity[0]}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
  );
};

const SalesFunnelChart = ({ data, height = 300 }) => {
  const [showLabels, setShowLabels] = useState(true);
  const [showPercentages, setShowPercentages] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Switch
          checked={showLabels}
          onCheckedChange={setShowLabels}
          id="funnel-labels"
        />
        <Label htmlFor="funnel-labels">Show Labels</Label>
        <Switch
          checked={showPercentages}
          onCheckedChange={setShowPercentages}
          id="funnel-percentages"
        />
        <Label htmlFor="funnel-percentages">Show Percentages</Label>
      </div>

      <ChartContainer config={{}} className="h-[300px]">
        <FunnelChart data={data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
          >
            {showLabels && (
              <LabelList 
                position="center" 
                fill="#fff" 
                stroke="none"
                fontSize={12}
                formatter={(value, name) => 
                  showPercentages 
                    ? `${name}: ${((value / data[0].value) * 100).toFixed(1)}%`
                    : `${name}: ${value}`
                }
              />
            )}
          </Funnel>
        </FunnelChart>
      </ChartContainer>
    </div>
  );
};

// Main Advanced Data Visualization Component
export const AdvancedDataVisualization = () => {
  const [activeTab, setActiveTab] = useState('line');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorPalette, setColorPalette] = useState('primary');

  // Generate sample data
  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  const scatterData = useMemo(() => generateScatterData(), []);
  const radarData = useMemo(() => generateRadarData(), []);
  const funnelData = useMemo(() => generateFunnelData(), []);

  const chartTabs = [
    { id: 'line', label: 'Line Charts', icon: LineChartIcon },
    { id: 'bar', label: 'Bar Charts', icon: BarChart3 },
    { id: 'area', label: 'Area Charts', icon: AreaChartIcon },
    { id: 'scatter', label: 'Scatter Plot', icon: ScatterIcon },
    { id: 'radar', label: 'Radar Chart', icon: RadarIcon },
    { id: 'funnel', label: 'Sales Funnel', icon: Target }
  ];

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Data Visualization</h2>
          <p className="text-gray-600">Interactive charts with advanced customization options</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={colorPalette} onValueChange={setColorPalette}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(COLOR_PALETTES).map(palette => (
                <SelectItem key={palette} value={palette}>
                  {palette.charAt(0).toUpperCase() + palette.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          {chartTabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="line" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Interactive Line Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveLineChart 
                data={timeSeriesData} 
                config={CHART_CONFIGS.salesTrend}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Interactive Bar Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveBarChart 
                data={timeSeriesData} 
                config={CHART_CONFIGS.salesTrend}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="area" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AreaChartIcon className="w-5 h-5" />
                Interactive Area Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveAreaChart 
                data={timeSeriesData} 
                config={CHART_CONFIGS.salesTrend}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scatter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScatterIcon className="w-5 h-5" />
                Interactive Scatter Plot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveScatterChart data={scatterData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RadarIcon className="w-5 h-5" />
                Interactive Radar Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InteractiveRadarChart data={radarData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Sales Funnel Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesFunnelChart data={funnelData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDataVisualization;