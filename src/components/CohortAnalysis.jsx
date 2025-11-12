import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DatePickerWithRange } from './ui/date-range-picker';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  HeatmapChart, Cell
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Filter,
  Download,
  Share,
  RefreshCw,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Target,
  DollarSign,
  Percent,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  AlertCircle,
  CheckCircle,
  Search,
  Grid,
  List,
  Table,
  Maximize,
  Minimize
} from 'lucide-react';

const CohortAnalysis = () => {
  const [cohortData, setCohortData] = useState([]);
  const [retentionMatrix, setRetentionMatrix] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('retention');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCohortType, setSelectedCohortType] = useState('acquisition');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isLoading, setIsLoading] = useState(false);

  // Mock cohort data
  const mockCohortData = [
    {
      cohort: '2024-01',
      cohort_size: 1000,
      period_0: 1000,
      period_1: 850,
      period_2: 720,
      period_3: 650,
      period_4: 580,
      period_5: 520,
      period_6: 480,
      retention_0: 100,
      retention_1: 85,
      retention_2: 72,
      retention_3: 65,
      retention_4: 58,
      retention_5: 52,
      retention_6: 48,
      revenue_0: 50000,
      revenue_1: 45000,
      revenue_2: 38000,
      revenue_3: 35000,
      revenue_4: 32000,
      revenue_5: 28000,
      revenue_6: 25000
    },
    {
      cohort: '2024-02',
      cohort_size: 1200,
      period_0: 1200,
      period_1: 1020,
      period_2: 900,
      period_3: 810,
      period_4: 720,
      period_5: 650,
      period_6: null,
      retention_0: 100,
      retention_1: 85,
      retention_2: 75,
      retention_3: 67.5,
      retention_4: 60,
      retention_5: 54.2,
      retention_6: null,
      revenue_0: 60000,
      revenue_1: 55000,
      revenue_2: 48000,
      revenue_3: 42000,
      revenue_4: 38000,
      revenue_5: 34000,
      revenue_6: null
    },
    {
      cohort: '2024-03',
      cohort_size: 950,
      period_0: 950,
      period_1: 808,
      period_2: 712,
      period_3: 627,
      period_4: 560,
      period_5: null,
      period_6: null,
      retention_0: 100,
      retention_1: 85.1,
      retention_2: 74.9,
      retention_3: 66,
      retention_4: 58.9,
      retention_5: null,
      retention_6: null,
      revenue_0: 47500,
      revenue_1: 43000,
      revenue_2: 38000,
      revenue_3: 33000,
      revenue_4: 29000,
      revenue_5: null,
      revenue_6: null
    },
    {
      cohort: '2024-04',
      cohort_size: 1100,
      period_0: 1100,
      period_1: 935,
      period_2: 825,
      period_3: 726,
      period_4: null,
      period_5: null,
      period_6: null,
      retention_0: 100,
      retention_1: 85,
      retention_2: 75,
      retention_3: 66,
      retention_4: null,
      retention_5: null,
      retention_6: null,
      revenue_0: 55000,
      revenue_1: 50000,
      revenue_2: 44000,
      revenue_3: 38000,
      revenue_4: null,
      revenue_5: null,
      revenue_6: null
    },
    {
      cohort: '2024-05',
      cohort_size: 1300,
      period_0: 1300,
      period_1: 1105,
      period_2: 975,
      period_3: null,
      period_4: null,
      period_5: null,
      period_6: null,
      retention_0: 100,
      retention_1: 85,
      retention_2: 75,
      retention_3: null,
      retention_4: null,
      retention_5: null,
      retention_6: null,
      revenue_0: 65000,
      revenue_1: 58000,
      revenue_2: 52000,
      revenue_3: null,
      revenue_4: null,
      revenue_5: null,
      revenue_6: null
    },
    {
      cohort: '2024-06',
      cohort_size: 1150,
      period_0: 1150,
      period_1: 978,
      period_2: null,
      period_3: null,
      period_4: null,
      period_5: null,
      period_6: null,
      retention_0: 100,
      retention_1: 85,
      retention_2: null,
      retention_3: null,
      retention_4: null,
      retention_5: null,
      retention_6: null,
      revenue_0: 57500,
      revenue_1: 52000,
      revenue_2: null,
      revenue_3: null,
      revenue_4: null,
      revenue_5: null,
      revenue_6: null
    }
  ];

  const cohortTypes = [
    { value: 'acquisition', label: 'Acquisition Cohorts', description: 'Group by first purchase date' },
    { value: 'behavioral', label: 'Behavioral Cohorts', description: 'Group by specific actions' },
    { value: 'demographic', label: 'Demographic Cohorts', description: 'Group by user characteristics' },
    { value: 'geographic', label: 'Geographic Cohorts', description: 'Group by location' }
  ];

  const metrics = [
    { value: 'retention', label: 'Retention Rate', description: 'Percentage of users returning' },
    { value: 'revenue', label: 'Revenue per Cohort', description: 'Revenue generated by cohort' },
    { value: 'ltv', label: 'Lifetime Value', description: 'Customer lifetime value' },
    { value: 'churn', label: 'Churn Rate', description: 'Percentage of users leaving' }
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  useEffect(() => {
    setCohortData(mockCohortData);
    generateRetentionMatrix();
  }, [selectedMetric, selectedPeriod]);

  const generateRetentionMatrix = () => {
    const matrix = mockCohortData.map(cohort => {
      const row = { cohort: cohort.cohort, cohort_size: cohort.cohort_size };
      for (let i = 0; i <= 6; i++) {
        const key = selectedMetric === 'retention' ? `retention_${i}` : 
                   selectedMetric === 'revenue' ? `revenue_${i}` : `period_${i}`;
        row[`period_${i}`] = cohort[key];
      }
      return row;
    });
    setRetentionMatrix(matrix);
  };

  const getRetentionColor = (value, max = 100) => {
    if (!value) return 'bg-gray-100';
    const intensity = value / max;
    if (intensity >= 0.8) return 'bg-green-500';
    if (intensity >= 0.6) return 'bg-green-400';
    if (intensity >= 0.4) return 'bg-yellow-400';
    if (intensity >= 0.2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getRetentionTextColor = (value, max = 100) => {
    if (!value) return 'text-gray-500';
    const intensity = value / max;
    return intensity >= 0.5 ? 'text-white' : 'text-gray-900';
  };

  const calculateCohortInsights = () => {
    const insights = {
      avgRetentionMonth1: 0,
      avgRetentionMonth3: 0,
      avgRetentionMonth6: 0,
      bestPerformingCohort: null,
      worstPerformingCohort: null,
      totalCustomers: 0,
      avgCohortSize: 0
    };

    const validCohorts = cohortData.filter(c => c.retention_1 !== null);
    
    if (validCohorts.length > 0) {
      insights.avgRetentionMonth1 = validCohorts.reduce((sum, c) => sum + c.retention_1, 0) / validCohorts.length;
      
      const month3Cohorts = cohortData.filter(c => c.retention_3 !== null);
      if (month3Cohorts.length > 0) {
        insights.avgRetentionMonth3 = month3Cohorts.reduce((sum, c) => sum + c.retention_3, 0) / month3Cohorts.length;
      }
      
      const month6Cohorts = cohortData.filter(c => c.retention_6 !== null);
      if (month6Cohorts.length > 0) {
        insights.avgRetentionMonth6 = month6Cohorts.reduce((sum, c) => sum + c.retention_6, 0) / month6Cohorts.length;
      }

      insights.bestPerformingCohort = validCohorts.reduce((best, current) => 
        current.retention_1 > best.retention_1 ? current : best
      );

      insights.worstPerformingCohort = validCohorts.reduce((worst, current) => 
        current.retention_1 < worst.retention_1 ? current : worst
      );
    }

    insights.totalCustomers = cohortData.reduce((sum, c) => sum + c.cohort_size, 0);
    insights.avgCohortSize = cohortData.length > 0 ? insights.totalCustomers / cohortData.length : 0;

    return insights;
  };

  const insights = calculateCohortInsights();

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Cohort,Size,Period 0,Period 1,Period 2,Period 3,Period 4,Period 5,Period 6\n" +
      retentionMatrix.map(row => 
        `${row.cohort},${row.cohort_size},${row.period_0 || ''},${row.period_1 || ''},${row.period_2 || ''},${row.period_3 || ''},${row.period_4 || ''},${row.period_5 || ''},${row.period_6 || ''}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cohort_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Analysis</h1>
          <p className="text-muted-foreground">
            Analyze customer behavior and retention patterns over time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Report
          </Button>
          <Button onClick={() => setIsLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <Label htmlFor="cohort-type">Cohort Type:</Label>
          <Select value={selectedCohortType} onValueChange={setSelectedCohortType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cohortTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="metric">Metric:</Label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metrics.map((metric) => (
                <SelectItem key={metric.value} value={metric.value}>
                  {metric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="period">Period:</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg 1-Month Retention</p>
                <p className="text-2xl font-bold">{insights.avgRetentionMonth1.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+2.3%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg 3-Month Retention</p>
                <p className="text-2xl font-bold">{insights.avgRetentionMonth3.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">-1.2%</span>
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{insights.totalCustomers.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+15%</span>
              <span className="text-muted-foreground ml-1">growth</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Cohort Size</p>
                <p className="text-2xl font-bold">{Math.round(insights.avgCohortSize).toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Minus className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-500">Stable</span>
              <span className="text-muted-foreground ml-1">trend</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Cohort Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Retention Trends</TabsTrigger>
          <TabsTrigger value="comparison">Cohort Comparison</TabsTrigger>
          <TabsTrigger value="insights">Detailed Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          {/* Cohort Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Heatmap</CardTitle>
              <CardDescription>
                {selectedMetric === 'retention' ? 'Retention rates' : 
                 selectedMetric === 'revenue' ? 'Revenue values' : 'User counts'} 
                 by cohort and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left p-2 font-medium">Cohort</th>
                        <th className="text-left p-2 font-medium">Size</th>
                        <th className="text-center p-2 font-medium">Period 0</th>
                        <th className="text-center p-2 font-medium">Period 1</th>
                        <th className="text-center p-2 font-medium">Period 2</th>
                        <th className="text-center p-2 font-medium">Period 3</th>
                        <th className="text-center p-2 font-medium">Period 4</th>
                        <th className="text-center p-2 font-medium">Period 5</th>
                        <th className="text-center p-2 font-medium">Period 6</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retentionMatrix.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 font-medium">{row.cohort}</td>
                          <td className="p-2">{row.cohort_size.toLocaleString()}</td>
                          {[0, 1, 2, 3, 4, 5, 6].map((period) => {
                            const value = row[`period_${period}`];
                            const displayValue = selectedMetric === 'revenue' && value 
                              ? `$${(value / 1000).toFixed(0)}k`
                              : selectedMetric === 'retention' && value
                              ? `${value.toFixed(1)}%`
                              : value?.toLocaleString() || '-';
                            
                            return (
                              <td key={period} className="p-1">
                                <div 
                                  className={`p-2 rounded text-center text-sm font-medium ${
                                    getRetentionColor(value, selectedMetric === 'retention' ? 100 : Math.max(...retentionMatrix.map(r => r[`period_${period}`] || 0)))
                                  } ${getRetentionTextColor(value, selectedMetric === 'retention' ? 100 : Math.max(...retentionMatrix.map(r => r[`period_${period}`] || 0)))}`}
                                >
                                  {displayValue}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Retention Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Retention Trends Over Time</CardTitle>
              <CardDescription>Compare retention curves across different cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    type="category"
                    domain={[0, 6]}
                    ticks={[0, 1, 2, 3, 4, 5, 6]}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {cohortData.slice(0, 4).map((cohort, index) => {
                    const data = [];
                    for (let i = 0; i <= 6; i++) {
                      const value = cohort[`retention_${i}`];
                      if (value !== null) {
                        data.push({ period: i, value });
                      }
                    }
                    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];
                    return (
                      <Line
                        key={cohort.cohort}
                        type="monotone"
                        dataKey="value"
                        data={data}
                        stroke={colors[index]}
                        strokeWidth={2}
                        name={cohort.cohort}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Period-over-Period Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Period-over-Period Retention</CardTitle>
              <CardDescription>Average retention rates by time period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { period: 'Month 1', retention: insights.avgRetentionMonth1 },
                  { period: 'Month 2', retention: cohortData.filter(c => c.retention_2).reduce((sum, c) => sum + c.retention_2, 0) / cohortData.filter(c => c.retention_2).length },
                  { period: 'Month 3', retention: insights.avgRetentionMonth3 },
                  { period: 'Month 4', retention: cohortData.filter(c => c.retention_4).reduce((sum, c) => sum + c.retention_4, 0) / cohortData.filter(c => c.retention_4).length },
                  { period: 'Month 5', retention: cohortData.filter(c => c.retention_5).reduce((sum, c) => sum + c.retention_5, 0) / cohortData.filter(c => c.retention_5).length },
                  { period: 'Month 6', retention: insights.avgRetentionMonth6 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Retention Rate']} />
                  <Bar dataKey="retention" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          {/* Cohort Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best vs Worst Performing Cohorts</CardTitle>
                <CardDescription>Compare retention rates of top and bottom performers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.bestPerformingCohort && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-800">Best Performer</h4>
                        <Badge className="bg-green-500">{insights.bestPerformingCohort.cohort}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-600">Cohort Size</p>
                          <p className="font-bold">{insights.bestPerformingCohort.cohort_size.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-green-600">1-Month Retention</p>
                          <p className="font-bold">{insights.bestPerformingCohort.retention_1}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {insights.worstPerformingCohort && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-800">Needs Improvement</h4>
                        <Badge className="bg-red-500">{insights.worstPerformingCohort.cohort}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-red-600">Cohort Size</p>
                          <p className="font-bold">{insights.worstPerformingCohort.cohort_size.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-red-600">1-Month Retention</p>
                          <p className="font-bold">{insights.worstPerformingCohort.retention_1}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cohort Size Distribution</CardTitle>
                <CardDescription>Distribution of cohort sizes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={cohortData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohort" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cohort_size" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* Detailed Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
                <CardDescription>Automated insights from cohort analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Retention Pattern</p>
                      <p className="text-sm text-blue-600">
                        Average 1-month retention is {insights.avgRetentionMonth1.toFixed(1)}%, 
                        indicating strong initial engagement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Opportunity</p>
                      <p className="text-sm text-yellow-600">
                        3-month retention drops to {insights.avgRetentionMonth3.toFixed(1)}%. 
                        Focus on month 2-3 engagement strategies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Growth Trend</p>
                      <p className="text-sm text-green-600">
                        Cohort sizes are growing, with recent cohorts showing 
                        {((cohortData[cohortData.length-1]?.cohort_size - cohortData[0]?.cohort_size) / cohortData[0]?.cohort_size * 100).toFixed(1)}% 
                        increase.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Data-driven suggestions for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Improve Early Retention</h4>
                    <p className="text-sm text-muted-foreground">
                      Implement onboarding improvements and early engagement campaigns 
                      to boost month 1-2 retention rates.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Segment Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Analyze behavioral differences between high and low-performing 
                      cohorts to identify success factors.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Re-engagement Campaign</h4>
                    <p className="text-sm text-muted-foreground">
                      Target users at risk of churning (months 2-3) with personalized 
                      re-engagement campaigns.
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-2">📈 Value Demonstration</h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on demonstrating product value early to improve 
                      long-term retention rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CohortAnalysis;