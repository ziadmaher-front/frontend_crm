// AI-Powered Predictive Dashboard Component
// Provides advanced analytics, forecasting, and intelligent recommendations

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Brain, Target, AlertTriangle, 
  Lightbulb, Zap, Activity, DollarSign, Users, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Download, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiPredictiveAnalytics } from '@/services/aiPredictiveAnalytics';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const AIPredictiveDashboard = ({ className }) => {
  const [activeTab, setActiveTab] = useState('forecast');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [predictiveData, setPredictiveData] = useState({
    salesForecast: null,
    leadPredictions: null,
    churnAnalysis: null,
    marketOpportunities: null,
    revenueOptimization: null
  });
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch real data from backend
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['ai-predictive-leads'],
    queryFn: async () => {
      try {
        return await base44.entities.Lead.list();
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['ai-predictive-deals'],
    queryFn: async () => {
      try {
        return await base44.entities.Deal.list();
      } catch (error) {
        console.error('Error fetching deals:', error);
        return [];
      }
    },
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['ai-predictive-contacts'],
    queryFn: async () => {
      try {
        return await base44.entities.Contact.list();
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
    },
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['ai-predictive-accounts'],
    queryFn: async () => {
      try {
        return await base44.entities.Account.list();
      } catch (error) {
        console.error('Error fetching accounts:', error);
        return [];
      }
    },
  });

  // Load predictive analytics data
  const loadPredictiveData = useCallback(async () => {
    if (leadsLoading || dealsLoading || contactsLoading || accountsLoading) return;

    try {
      setIsLoading(true);
      
      // Generate sales forecast
      const salesForecast = await aiPredictiveAnalytics.generateSalesForecast(
        deals, 
        [], // Historical data would come from API
        { 
          forecastPeriod: 90,
          includeSeasonality: true,
          granularity: 'weekly'
        }
      );

      // Predict lead conversions
      const leadPredictions = await aiPredictiveAnalytics.predictLeadConversion(
        leads,
        {
          includeEngagementScore: true,
          includeBehavioralAnalysis: true
        }
      );

      // Analyze customer churn
      const churnAnalysis = await aiPredictiveAnalytics.predictCustomerChurn(
        contacts,
        {
          timeHorizon: 90,
          includeEngagementMetrics: true
        }
      );

      // Market opportunities
      const marketOpportunities = await aiPredictiveAnalytics.analyzeMarketOpportunities(
        { deals, leads, contacts, accounts }
      );

      // Revenue optimization
      const revenueOptimization = await aiPredictiveAnalytics.generateRevenueOptimization(
        deals,
        contacts
      );

      setPredictiveData({
        salesForecast,
        leadPredictions,
        churnAnalysis,
        marketOpportunities,
        revenueOptimization
      });

      // Generate insights and recommendations
      generateInsightsAndRecommendations({
        salesForecast,
        leadPredictions,
        churnAnalysis,
        marketOpportunities,
        revenueOptimization
      });

    } catch (error) {
      console.error('Failed to load predictive data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [leads, deals, contacts, accounts, leadsLoading, dealsLoading, contactsLoading, accountsLoading]);

  useEffect(() => {
    loadPredictiveData();
  }, [loadPredictiveData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPredictiveData();
    setRefreshing(false);
  };

  const generateInsightsAndRecommendations = (data) => {
    const newInsights = [];
    const newRecommendations = [];

    // Sales forecast insights
    if (data.salesForecast?.success) {
      const forecast = data.salesForecast.data.forecast;
      const trend = forecast.length > 1 ? 
        (forecast[forecast.length - 1].value > forecast[0].value ? 'up' : 'down') : 'stable';
      
      newInsights.push({
        id: 'sales-trend',
        type: 'forecast',
        title: 'Sales Forecast Trend',
        description: `Sales are trending ${trend} with ${Math.round(data.salesForecast.data.models[0]?.confidence * 100)}% confidence`,
        impact: 'high',
        trend,
        icon: trend === 'up' ? TrendingUp : TrendingDown
      });
    }

    // Lead conversion insights
    if (data.leadPredictions?.success) {
      const highProbLeads = data.leadPredictions.data.summary.highProbability;
      newInsights.push({
        id: 'lead-conversion',
        type: 'leads',
        title: 'High-Probability Leads',
        description: `${highProbLeads} leads have >70% conversion probability`,
        impact: 'high',
        value: highProbLeads,
        icon: Target
      });

      if (highProbLeads > 0) {
        newRecommendations.push({
          id: 'focus-high-prob-leads',
          title: 'Focus on High-Probability Leads',
          description: `Prioritize the ${highProbLeads} leads with highest conversion probability`,
          impact: 'high',
          effort: 'low',
          category: 'sales'
        });
      }
    }

    // Churn analysis insights
    if (data.churnAnalysis?.success) {
      const highRisk = data.churnAnalysis.data.summary.highRisk;
      if (highRisk > 0) {
        newInsights.push({
          id: 'churn-risk',
          type: 'retention',
          title: 'Churn Risk Alert',
          description: `${highRisk} customers at high risk of churning`,
          impact: 'critical',
          value: highRisk,
          icon: AlertTriangle
        });

        newRecommendations.push({
          id: 'retention-campaign',
          title: 'Launch Retention Campaign',
          description: `Implement targeted retention strategies for ${highRisk} high-risk customers`,
          impact: 'high',
          effort: 'medium',
          category: 'retention'
        });
      }
    }

    // Revenue optimization insights
    if (data.revenueOptimization?.success) {
      const potentialRevenue = data.revenueOptimization.data.potentialRevenue;
      if (potentialRevenue > 0) {
        newInsights.push({
          id: 'revenue-opportunity',
          type: 'revenue',
          title: 'Revenue Optimization Opportunity',
          description: `Potential to increase revenue by $${potentialRevenue.toLocaleString()}`,
          impact: 'high',
          value: potentialRevenue,
          icon: DollarSign
        });
      }
    }

    setInsights(newInsights);
    setRecommendations(newRecommendations);
  };

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!predictiveData.salesForecast?.success) return null;
    
    return predictiveData.salesForecast.data.forecast.map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      value: Math.round(point.value),
      confidence: Math.round(point.confidence * 100)
    }));
  }, [predictiveData.salesForecast]);

  const leadScoreData = useMemo(() => {
    if (!predictiveData.leadPredictions?.success) return null;
    
    const predictions = predictiveData.leadPredictions.data.predictions;
    return [
      { name: 'High (70-100%)', value: predictions.filter(p => p.score >= 70).length, color: '#22c55e' },
      { name: 'Medium (40-69%)', value: predictions.filter(p => p.score >= 40 && p.score < 70).length, color: '#f59e0b' },
      { name: 'Low (0-39%)', value: predictions.filter(p => p.score < 40).length, color: '#ef4444' }
    ];
  }, [predictiveData.leadPredictions]);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">AI Predictive Dashboard</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <Card key={insight.id} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className={cn(
                      "h-5 w-5",
                      insight.impact === 'critical' && "text-red-500",
                      insight.impact === 'high' && "text-orange-500",
                      insight.impact === 'medium' && "text-yellow-500",
                      insight.impact === 'low' && "text-green-500"
                    )} />
                    <Badge variant={
                      insight.impact === 'critical' ? 'destructive' :
                      insight.impact === 'high' ? 'default' :
                      'secondary'
                    }>
                      {insight.impact}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {insight.value && (
                    <div className="text-2xl font-bold mb-1">
                      {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
          <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
          <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Sales Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>90-Day Sales Forecast</span>
              </CardTitle>
              <CardDescription>
                AI-powered sales predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? `$${value.toLocaleString()}` : `${value}%`,
                        name === 'value' ? 'Predicted Sales' : 'Confidence'
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Predicted Sales"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#10b981" 
                      strokeDasharray="5 5"
                      name="Confidence %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No forecast data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="leads" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Probability</CardTitle>
                <CardDescription>Distribution of lead scores</CardDescription>
              </CardHeader>
              <CardContent>
                {leadScoreData ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadScoreData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {leadScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    No lead data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Conversion Opportunities</CardTitle>
                <CardDescription>Leads with highest conversion probability</CardDescription>
              </CardHeader>
              <CardContent>
                {predictiveData.leadPredictions?.success ? (
                  <div className="space-y-3">
                    {predictiveData.leadPredictions.data.predictions
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map((prediction, index) => (
                        <div key={prediction.leadId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">Lead #{prediction.leadId}</div>
                            <div className="text-sm text-muted-foreground">
                              {prediction.timeToConversion} days to conversion
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{prediction.score}%</div>
                            <Progress value={prediction.score} className="w-20" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    No prediction data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Churn Analysis Tab */}
        <TabsContent value="churn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Customer Churn Risk Analysis</span>
              </CardTitle>
              <CardDescription>
                Identify customers at risk of churning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictiveData.churnAnalysis?.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-red-50">
                      <div className="text-2xl font-bold text-red-600">
                        {predictiveData.churnAnalysis.data.summary.highRisk}
                      </div>
                      <div className="text-sm text-red-700">High Risk</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-yellow-50">
                      <div className="text-2xl font-bold text-yellow-600">
                        {predictiveData.churnAnalysis.data.summary.mediumRisk}
                      </div>
                      <div className="text-sm text-yellow-700">Medium Risk</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">
                        {predictiveData.churnAnalysis.data.summary.lowRisk}
                      </div>
                      <div className="text-sm text-green-700">Low Risk</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">High-Risk Customers</h4>
                    {predictiveData.churnAnalysis.data.predictions
                      .filter(p => p.riskLevel === 'high')
                      .slice(0, 5)
                      .map((prediction) => (
                        <div key={prediction.customerId} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                          <div>
                            <div className="font-medium">Customer #{prediction.customerId}</div>
                            <div className="text-sm text-muted-foreground">
                              LTV: ${prediction.lifetimeValue.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">
                              {Math.round(prediction.churnProbability * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {prediction.timeToChurn} days
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No churn analysis data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Market Opportunities</span>
              </CardTitle>
              <CardDescription>
                AI-identified growth opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictiveData.marketOpportunities?.success ? (
                <div className="space-y-4">
                  {predictiveData.marketOpportunities.data.opportunities.map((opportunity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opportunity.title || `Opportunity ${index + 1}`}</h4>
                        <Badge variant="outline">
                          Impact: {opportunity.potentialImpact || 'Medium'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {opportunity.description || 'Market opportunity identified by AI analysis'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs">
                        <span>Effort: {opportunity.effort || 'Medium'}</span>
                        <span>Timeline: {opportunity.timeline || '30-60 days'}</span>
                        <span>ROI: {opportunity.roi || 'High'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No opportunities data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span>AI Recommendations</span>
              </CardTitle>
              <CardDescription>
                Actionable insights to improve performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <Alert key={rec.id} className="border-l-4 border-l-blue-500">
                      <Lightbulb className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={rec.impact === 'high' ? 'default' : 'secondary'}>
                              {rec.impact} impact
                            </Badge>
                            <Badge variant="outline">
                              {rec.effort} effort
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm">{rec.description}</p>
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            Implement
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No recommendations available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPredictiveDashboard;