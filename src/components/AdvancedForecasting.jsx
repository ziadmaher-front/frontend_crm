import React, { useState, useEffect, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Target, 
  Calendar, 
  Users, 
  DollarSign, 
  Percent,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  LineChart as LineChartIcon,
  Filter,
  Download,
  Settings,
  RefreshCw,
  Eye,
  Layers,
  GitBranch,
  Gauge
} from 'lucide-react';

const AdvancedForecasting = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarterly');
  const [selectedModel, setSelectedModel] = useState('ml_ensemble');
  const [selectedCohort, setSelectedCohort] = useState('monthly');
  const [selectedTab, setSelectedTab] = useState('revenue');

  // Sample revenue forecasting data
  const revenueForecastData = [
    { period: 'Q1 2024', actual: 450000, predicted: 445000, confidence: 92, pipeline: 380000 },
    { period: 'Q2 2024', actual: 520000, predicted: 515000, confidence: 89, pipeline: 450000 },
    { period: 'Q3 2024', actual: 480000, predicted: 485000, confidence: 87, pipeline: 420000 },
    { period: 'Q4 2024', actual: null, predicted: 580000, confidence: 85, pipeline: 520000 },
    { period: 'Q1 2025', actual: null, predicted: 620000, confidence: 78, pipeline: 580000 },
    { period: 'Q2 2025', actual: null, predicted: 680000, confidence: 72, pipeline: 640000 }
  ];

  // Sample cohort analysis data
  const cohortData = [
    { cohort: 'Jan 2024', month0: 100, month1: 85, month2: 72, month3: 65, month4: 58, month5: 52 },
    { cohort: 'Feb 2024', month0: 120, month1: 98, month2: 84, month3: 76, month4: 68, month5: null },
    { cohort: 'Mar 2024', month0: 95, month1: 82, month2: 71, month3: 64, month4: null, month5: null },
    { cohort: 'Apr 2024', month0: 110, month1: 94, month2: 81, month3: null, month4: null, month5: null },
    { cohort: 'May 2024', month0: 130, month1: 108, month2: null, month3: null, month4: null, month5: null },
    { cohort: 'Jun 2024', month0: 140, month1: null, month2: null, month3: null, month4: null, month5: null }
  ];

  // Sample deal probability data
  const dealProbabilityData = [
    { stage: 'Qualified', probability: 20, count: 45, value: 2250000 },
    { stage: 'Needs Analysis', probability: 40, count: 32, value: 1920000 },
    { stage: 'Proposal', probability: 60, count: 28, value: 1680000 },
    { stage: 'Negotiation', probability: 80, count: 18, value: 1440000 },
    { stage: 'Closed Won', probability: 100, count: 12, value: 720000 }
  ];

  // Sample market trends data
  const marketTrendsData = [
    { month: 'Jan', industry: 125, competitors: 110, market: 118 },
    { month: 'Feb', industry: 132, competitors: 115, market: 124 },
    { month: 'Mar', industry: 128, competitors: 108, market: 119 },
    { month: 'Apr', industry: 145, competitors: 125, market: 135 },
    { month: 'May', industry: 158, competitors: 142, market: 150 },
    { month: 'Jun', industry: 162, competitors: 138, market: 148 }
  ];

  // Sample seasonal patterns
  const seasonalData = [
    { month: 'Jan', historical: 85, predicted: 88, seasonal_factor: 0.85 },
    { month: 'Feb', historical: 78, predicted: 82, seasonal_factor: 0.78 },
    { month: 'Mar', historical: 95, predicted: 98, seasonal_factor: 0.95 },
    { month: 'Apr', historical: 110, predicted: 108, seasonal_factor: 1.10 },
    { month: 'May', historical: 125, predicted: 128, seasonal_factor: 1.25 },
    { month: 'Jun', historical: 135, predicted: 132, seasonal_factor: 1.35 },
    { month: 'Jul', historical: 142, predicted: 145, seasonal_factor: 1.42 },
    { month: 'Aug', historical: 138, predicted: 140, seasonal_factor: 1.38 },
    { month: 'Sep', historical: 128, predicted: 125, seasonal_factor: 1.28 },
    { month: 'Oct', historical: 115, predicted: 118, seasonal_factor: 1.15 },
    { month: 'Nov', historical: 105, predicted: 108, seasonal_factor: 1.05 },
    { month: 'Dec', historical: 95, predicted: 92, seasonal_factor: 0.95 }
  ];

  // Sample model performance data
  const modelPerformanceData = [
    { model: 'Linear Regression', accuracy: 78.5, mape: 12.3, rmse: 45000 },
    { model: 'Random Forest', accuracy: 84.2, mape: 9.8, rmse: 38000 },
    { model: 'Neural Network', accuracy: 87.6, mape: 8.1, rmse: 32000 },
    { model: 'ML Ensemble', accuracy: 91.3, mape: 6.4, rmse: 28000 },
    { model: 'Time Series ARIMA', accuracy: 82.1, mape: 10.2, rmse: 41000 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Memoized MetricCard component
  const MetricCard = memo(({ title, value, change, icon: Icon, trend }) => (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {change}
            </div>
          </div>
          <div className={`p-3 rounded-xl ${
            trend === 'up' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  // Memoized CohortHeatmap component
  const CohortHeatmap = memo(({ data }) => (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-600">
        <div>Cohort</div>
        <div>Month 0</div>
        <div>Month 1</div>
        <div>Month 2</div>
        <div>Month 3</div>
        <div>Month 4</div>
        <div>Month 5</div>
      </div>
      {data.map((cohort, index) => (
        <div key={index} className="grid grid-cols-7 gap-1">
          <div className="text-sm font-medium py-2">{cohort.cohort}</div>
          {[0, 1, 2, 3, 4, 5].map((month) => {
            const value = cohort[`month${month}`];
            const retention = month === 0 ? 100 : value ? (value / cohort.month0 * 100) : null;
            
            return (
              <div
                key={month}
                className={`p-2 text-xs text-center rounded ${
                  value === null 
                    ? 'bg-gray-100 text-gray-400' 
                    : retention >= 80 
                      ? 'bg-green-100 text-green-800'
                      : retention >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                }`}
              >
                {value === null ? '-' : `${retention.toFixed(0)}%`}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  ));

  CohortHeatmap.displayName = 'CohortHeatmap';

  // Memoized ModelComparisonRadar component
  const ModelComparisonRadar = memo(({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="model" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="Accuracy"
          dataKey="accuracy"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Forecasting</h2>
          <p className="text-gray-600">AI-powered predictions and cohort analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear Regression</SelectItem>
              <SelectItem value="random_forest">Random Forest</SelectItem>
              <SelectItem value="neural_network">Neural Network</SelectItem>
              <SelectItem value="ml_ensemble">ML Ensemble</SelectItem>
              <SelectItem value="arima">Time Series ARIMA</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Forecast Accuracy"
          value="91.3%"
          change="+2.1%"
          icon={Target}
          trend="up"
        />
        <MetricCard
          title="Next Quarter Prediction"
          value="$580K"
          change="+12.5%"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Pipeline Confidence"
          value="85%"
          change="-3.2%"
          icon={Gauge}
          trend="down"
        />
        <MetricCard
          title="Model Performance"
          value="6.4% MAPE"
          change="-1.8%"
          icon={Brain}
          trend="up"
        />
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="deals">Deal Probability</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Forecasting</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueForecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, '']} />
                  <Legend />
                  <Bar dataKey="actual" fill="#8884d8" name="Actual Revenue" />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#ff7300" 
                    strokeWidth={3}
                    name="Predicted Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pipeline" 
                    stroke="#00C49F" 
                    strokeDasharray="5 5"
                    name="Pipeline Value"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Confidence Intervals</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueForecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="historical" 
                      stroke="#8884d8" 
                      name="Historical"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#ff7300" 
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Cohort Analysis</CardTitle>
                <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span>80%+ Retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                    <span>60-80% Retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                    <span>&lt;60% Retention</span>
                  </div>
                </div>
                <CohortHeatmap data={cohortData} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Retention Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="month1" 
                      stroke="#8884d8" 
                      name="Month 1"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="month3" 
                      stroke="#ff7300" 
                      name="Month 3"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="month5" 
                      stroke="#00C49F" 
                      name="Month 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Strong Retention</span>
                  </div>
                  <p className="text-sm text-green-700">
                    May 2024 cohort shows 83% retention at month 1, indicating improved onboarding.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Attention Needed</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    March 2024 cohort retention dropped to 67% at month 3. Review customer success touchpoints.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Trend Analysis</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Overall retention improving by 5% month-over-month since implementing new features.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deal Probability by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealProbabilityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="probability" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dealProbabilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ stage, value }) => `${stage}: $${(value / 1000).toFixed(0)}K`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dealProbabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deal Stage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealProbabilityData.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-sm text-gray-500">{stage.count} deals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(stage.value / 1000).toFixed(0)}K</p>
                      <Badge variant="outline">{stage.probability}% probability</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="industry" 
                    stroke="#8884d8" 
                    name="Industry Average"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="competitors" 
                    stroke="#ff7300" 
                    name="Competitors"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="market" 
                    stroke="#00C49F" 
                    name="Market Index"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Growth</p>
                    <p className="text-2xl font-bold">+24.5%</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +5.2% vs last quarter
                    </div>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Competitive Position</p>
                    <p className="text-2xl font-bold">2nd</p>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <TrendingUp className="h-3 w-3" />
                      Improved from 3rd
                    </div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Market Share</p>
                    <p className="text-2xl font-bold">18.3%</p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +2.1% growth
                    </div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PieChartIcon className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ModelComparisonRadar data={modelPerformanceData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Model Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelPerformanceData.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{model.model}</p>
                        <p className="text-sm text-gray-500">
                          {model.model === 'ML Ensemble' ? 'Currently Active' : 'Available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold">{model.accuracy}%</p>
                        <p className="text-gray-500">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{model.mape}%</p>
                        <p className="text-gray-500">MAPE</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">${(model.rmse / 1000).toFixed(0)}K</p>
                        <p className="text-gray-500">RMSE</p>
                      </div>
                      {model.model === 'ML Ensemble' && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedForecasting;