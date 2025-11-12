import React, { useState, useEffect, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter
} from 'lucide-react';

// Memoized ModelCard component
const ModelCard = memo(({ title, value, change, confidence, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="text-right">
          <Icon className="h-8 w-8 text-blue-500 mb-2" />
          <div className="text-xs text-gray-500">
            {confidence}% confidence
          </div>
          <Progress value={confidence} className="w-16 h-2" />
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized AnomalyAlert component
const AnomalyAlert = memo(({ anomaly }) => (
  <Card className={`border-l-4 ${
    anomaly.severity === 'High' ? 'border-l-red-500' :
    anomaly.severity === 'Medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
  }`}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
            anomaly.severity === 'High' ? 'text-red-500' :
            anomaly.severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
          }`} />
          <div>
            <h4 className="font-medium">{anomaly.type}</h4>
            <p className="text-sm text-gray-600 mt-1">{anomaly.description}</p>
            <p className="text-xs text-blue-600 mt-2">{anomaly.recommendation}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge variant={
            anomaly.severity === 'High' ? 'destructive' :
            anomaly.severity === 'Medium' ? 'default' : 'secondary'
          }>
            {anomaly.severity}
          </Badge>
          <p className="text-xs text-gray-500 mt-1">{anomaly.detected}</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized chart components
const MemoizedRevenueForecastChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line 
        type="monotone" 
        dataKey="actual" 
        stroke="#3b82f6" 
        strokeWidth={3}
        name="Actual Revenue"
      />
      <Line 
        type="monotone" 
        dataKey="predicted" 
        stroke="#ef4444" 
        strokeDasharray="5 5"
        strokeWidth={2}
        name="Predicted Revenue"
      />
    </LineChart>
  </ResponsiveContainer>
));

const MemoizedLeadScorePieChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={80}
        fill="#8884d8"
        dataKey="count"
        label={({ score, count }) => `${score}: ${count}`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
));

const MemoizedConversionBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="score" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="conversionRate" fill="#3b82f6" />
    </BarChart>
  </ResponsiveContainer>
));

const PredictiveAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('3months');
  const [selectedModel, setSelectedModel] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);

  // Sample predictive data
  const revenueForecast = [
    { month: 'Jan', actual: 45000, predicted: 47000, confidence: 85 },
    { month: 'Feb', actual: 52000, predicted: 51000, confidence: 88 },
    { month: 'Mar', actual: 48000, predicted: 49000, confidence: 82 },
    { month: 'Apr', actual: null, predicted: 55000, confidence: 79 },
    { month: 'May', actual: null, predicted: 58000, confidence: 76 },
    { month: 'Jun', actual: null, predicted: 62000, confidence: 73 }
  ];

  const leadScoringData = [
    { score: '90-100', count: 45, conversionRate: 85, color: '#22c55e' },
    { score: '80-89', count: 78, conversionRate: 65, color: '#3b82f6' },
    { score: '70-79', count: 124, conversionRate: 45, color: '#f59e0b' },
    { score: '60-69', count: 89, conversionRate: 25, color: '#ef4444' },
    { score: '<60', count: 156, conversionRate: 8, color: '#6b7280' }
  ];

  const churnPrediction = [
    { segment: 'High Value', risk: 'Low', count: 45, churnProb: 5 },
    { segment: 'Medium Value', risk: 'Medium', count: 123, churnProb: 15 },
    { segment: 'Low Value', risk: 'High', count: 67, churnProb: 35 },
    { segment: 'New Customers', risk: 'Medium', count: 89, churnProb: 20 }
  ];

  const dealProbability = [
    { stage: 'Qualified', probability: 25, avgDays: 45, count: 34 },
    { stage: 'Proposal', probability: 50, avgDays: 30, count: 28 },
    { stage: 'Negotiation', probability: 75, avgDays: 15, count: 19 },
    { stage: 'Closing', probability: 90, avgDays: 7, count: 12 }
  ];

  const marketTrends = [
    { trend: 'Industry Growth', impact: 'Positive', confidence: 92, description: 'Market expanding by 15% YoY' },
    { trend: 'Competitor Activity', impact: 'Negative', confidence: 78, description: 'New competitor entered market' },
    { trend: 'Economic Indicators', impact: 'Neutral', confidence: 85, description: 'Stable economic conditions' },
    { trend: 'Seasonal Patterns', impact: 'Positive', confidence: 88, description: 'Q2 typically shows 20% increase' }
  ];

  const anomalies = [
    { 
      type: 'Revenue Drop', 
      severity: 'High', 
      detected: '2 hours ago', 
      description: 'Unexpected 15% drop in daily revenue',
      recommendation: 'Investigate recent campaign changes'
    },
    { 
      type: 'Lead Quality', 
      severity: 'Medium', 
      detected: '1 day ago', 
      description: 'Lead scoring accuracy decreased by 8%',
      recommendation: 'Retrain lead scoring model'
    },
    { 
      type: 'Conversion Rate', 
      severity: 'Low', 
      detected: '3 days ago', 
      description: 'Slight decrease in email conversion rates',
      recommendation: 'A/B test email templates'
    }
  ];



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered insights and forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModelCard
          title="Revenue Forecast"
          value="$58K"
          change="+12.5%"
          confidence={79}
          icon={DollarSign}
          trend="up"
        />
        <ModelCard
          title="Lead Conversion"
          value="24.8%"
          change="+3.2%"
          confidence={85}
          icon={Target}
          trend="up"
        />
        <ModelCard
          title="Churn Risk"
          value="8.5%"
          change="-2.1%"
          confidence={82}
          icon={Users}
          trend="down"
        />
        <ModelCard
          title="Deal Probability"
          value="67%"
          change="+5.4%"
          confidence={88}
          icon={Activity}
          trend="up"
        />
      </div>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Anomaly Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {anomalies.map((anomaly, index) => (
            <AnomalyAlert key={index} anomaly={anomaly} />
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="forecasting" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="churn">Churn Prediction</TabsTrigger>
          <TabsTrigger value="deals">Deal Analysis</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast Model</CardTitle>
            </CardHeader>
            <CardContent>
               <MemoizedRevenueForecastChart data={revenueForecast} />
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lead Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                 <MemoizedLeadScorePieChart data={leadScoringData} />
               </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates by Score</CardTitle>
              </CardHeader>
              <CardContent>
                 <MemoizedConversionBarChart data={leadScoringData} />
               </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Churn Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPrediction.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded-full ${
                        segment.risk === 'High' ? 'bg-red-500' :
                        segment.risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{segment.segment}</h4>
                        <p className="text-sm text-gray-600">{segment.count} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        segment.risk === 'High' ? 'destructive' :
                        segment.risk === 'Medium' ? 'default' : 'secondary'
                      }>
                        {segment.risk} Risk
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{segment.churnProb}% churn probability</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deal Stage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealProbability.map((stage, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-sm text-gray-600">{stage.count} deals</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={stage.probability} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{stage.probability}%</span>
                      <span className="text-sm text-gray-500">{stage.avgDays} days avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        trend.impact === 'Positive' ? 'bg-green-500' :
                        trend.impact === 'Negative' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{trend.trend}</h4>
                        <p className="text-sm text-gray-600 mt-1">{trend.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        trend.impact === 'Positive' ? 'default' :
                        trend.impact === 'Negative' ? 'destructive' : 'secondary'
                      }>
                        {trend.impact}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{trend.confidence}% confidence</p>
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

export default PredictiveAnalytics;