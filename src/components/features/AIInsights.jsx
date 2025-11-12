import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Calendar,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Activity,
  Bot,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDeals, useLeads, useContacts, useTasks, useDashboardAnalytics } from '@/hooks/useBusinessLogic';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');
  const [insightFilter, setInsightFilter] = useState('all');

  const { data: deals, revenueMetrics, pipelineData } = useDeals();
  const { data: leads } = useLeads();
  const { data: contacts } = useContacts();
  const { data: tasks, overdueTasks } = useTasks();
  const { metrics } = useDashboardAnalytics();

  // AI Insight Categories
  const insightCategories = {
    performance: { icon: BarChart3, color: 'text-blue-500', label: 'Performance', bgColor: 'bg-blue-50' },
    opportunities: { icon: Target, color: 'text-green-500', label: 'Opportunities', bgColor: 'bg-green-50' },
    risks: { icon: AlertCircle, color: 'text-red-500', label: 'Risks', bgColor: 'bg-red-50' },
    recommendations: { icon: Lightbulb, color: 'text-yellow-500', label: 'Recommendations', bgColor: 'bg-yellow-50' },
    trends: { icon: TrendingUp, color: 'text-purple-500', label: 'Trends', bgColor: 'bg-purple-50' },
    predictions: { icon: Bot, color: 'text-indigo-500', label: 'Predictions', bgColor: 'bg-indigo-50' }
  };

  // Simplified lead scoring algorithm
  const calculateLeadScore = useCallback((lead) => {
    let score = 0;
    const weights = {
      source: { 'Website': 30, 'Referral': 40, 'Social Media': 20, 'Cold Call': 10, 'Email': 25 },
      industry: { 'Technology': 35, 'Healthcare': 30, 'Finance': 40, 'Manufacturing': 25, 'Retail': 20 },
      company_size: { 'Enterprise': 50, 'Mid-Market': 35, 'Small Business': 20, 'Startup': 15 }
    };

    if (lead.source && weights.source[lead.source]) {
      score += weights.source[lead.source];
    }
    if (lead.industry && weights.industry[lead.industry]) {
      score += weights.industry[lead.industry];
    }
    if (lead.company_size && weights.company_size[lead.company_size]) {
      score += weights.company_size[lead.company_size];
    }

    return Math.min(score, 100);
  }, []);

  // Generate AI insights
  const generateInsights = useCallback(async () => {
    setLoading(true);
    
    try {
      const generatedInsights = [];
      
      // Performance insights
      if (deals && deals.length > 0) {
        const totalRevenue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        const avgDealSize = totalRevenue / deals.length;
        
        generatedInsights.push({
          id: 'perf-1',
          category: 'performance',
          title: 'Revenue Performance',
          description: `Total revenue: $${totalRevenue.toLocaleString()}. Average deal size: $${avgDealSize.toFixed(0)}.`,
          impact: totalRevenue > 100000 ? 'high' : 'medium',
          confidence: 85,
          actionable: true,
          timestamp: new Date().toISOString()
        });
      }

      // Lead insights
      if (leads && leads.length > 0) {
        const highScoreLeads = leads.filter(lead => calculateLeadScore(lead) > 70);
        
        generatedInsights.push({
          id: 'opp-1',
          category: 'opportunities',
          title: 'High-Quality Leads',
          description: `${highScoreLeads.length} leads have high conversion potential.`,
          impact: 'high',
          confidence: 90,
          actionable: true,
          timestamp: new Date().toISOString()
        });
      }

      // Task insights
      if (overdueTasks && overdueTasks.length > 0) {
        generatedInsights.push({
          id: 'risk-1',
          category: 'risks',
          title: 'Overdue Tasks',
          description: `${overdueTasks.length} tasks are overdue and need immediate attention.`,
          impact: 'high',
          confidence: 95,
          actionable: true,
          timestamp: new Date().toISOString()
        });
      }

      // Recommendations
      generatedInsights.push({
        id: 'rec-1',
        category: 'recommendations',
        title: 'Follow-up Optimization',
        description: 'Consider implementing automated follow-up sequences for better lead nurturing.',
        impact: 'medium',
        confidence: 75,
        actionable: true,
        timestamp: new Date().toISOString()
      });

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  }, [deals, leads, overdueTasks, calculateLeadScore]);

  // Generate predictions
  const generatePredictions = useCallback(() => {
    const predictions = [];
    
    if (deals && deals.length > 0) {
      const recentDeals = deals.filter(deal => {
        const dealDate = new Date(deal.created_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return dealDate > thirtyDaysAgo;
      });

      const monthlyRevenue = recentDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const projectedRevenue = monthlyRevenue * 1.15; // 15% growth projection

      predictions.push({
        id: 'pred-1',
        type: 'revenue',
        title: 'Revenue Forecast',
        description: `Projected revenue for next month: $${projectedRevenue.toFixed(0)}`,
        confidence: 78,
        timeframe: '30 days',
        trend: 'up'
      });
    }

    setPredictions(predictions);
  }, [deals]);

  useEffect(() => {
    generateInsights();
    generatePredictions();
  }, [generateInsights, generatePredictions]);

  const filteredInsights = useMemo(() => {
    if (insightFilter === 'all') return insights;
    return insights.filter(insight => insight.category === insightFilter);
  }, [insights, insightFilter]);

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const InsightCard = ({ insight }) => {
    const category = insightCategories[insight.category];
    const IconComponent = category?.icon || Brain;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedInsight(insight)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${category?.bgColor || 'bg-gray-50'}`}>
            <IconComponent className={`h-4 w-4 ${category?.color || 'text-gray-500'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">{insight.title}</h3>
              <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                {insight.impact}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Confidence: {insight.confidence}%</span>
              <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={insightFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInsightFilter('all')}
              >
                All
              </Button>
              {Object.entries(insightCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant={insightFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInsightFilter(key)}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredInsights.length > 0 ? (
                  <AnimatePresence>
                    {filteredInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No insights available for the selected filter.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {predictions.length > 0 ? (
                  predictions.map((prediction) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium">{prediction.title}</h3>
                        <Badge variant="outline">{prediction.timeframe}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{prediction.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Confidence: {prediction.confidence}%</span>
                        <div className="flex items-center gap-1">
                          {prediction.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={prediction.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                            {prediction.trend === 'up' ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No predictions available at the moment.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIInsights;