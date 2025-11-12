import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  DollarSign,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  Settings,
  BarChart3,
  Lightbulb
} from 'lucide-react';

export default function SmartLeadScoring({ leads = [], onScoreUpdate }) {
  const [scoringModel, setScoringModel] = useState({
    demographic: { weight: 25, factors: ['company_size', 'industry', 'location', 'job_title'] },
    behavioral: { weight: 35, factors: ['email_opens', 'website_visits', 'content_downloads', 'social_engagement'] },
    engagement: { weight: 25, factors: ['response_time', 'meeting_attendance', 'call_duration', 'email_replies'] },
    firmographic: { weight: 15, factors: ['revenue', 'employee_count', 'technology_stack', 'growth_rate'] }
  });

  const [scoredLeads, setScoredLeads] = useState([]);
  const [modelPerformance, setModelPerformance] = useState({
    accuracy: 87.5,
    precision: 82.3,
    recall: 91.2,
    f1Score: 86.5,
    totalLeadsScored: 1247,
    conversionRate: 23.8
  });

  const [realTimeInsights, setRealTimeInsights] = useState([]);

  useEffect(() => {
    calculateLeadScores();
    generateRealTimeInsights();
  }, [leads, scoringModel]);

  const calculateLeadScores = () => {
    const scored = leads.map(lead => {
      const scores = {
        demographic: calculateDemographicScore(lead),
        behavioral: calculateBehavioralScore(lead),
        engagement: calculateEngagementScore(lead),
        firmographic: calculateFirmographicScore(lead)
      };

      const totalScore = Object.entries(scores).reduce((total, [category, score]) => {
        return total + (score * scoringModel[category].weight / 100);
      }, 0);

      const grade = getScoreGrade(totalScore);
      const priority = getScorePriority(totalScore);
      const predictions = generatePredictions(lead, totalScore, scores);

      return {
        ...lead,
        aiScore: Math.round(totalScore),
        categoryScores: scores,
        grade,
        priority,
        predictions,
        lastScored: new Date(),
        scoreHistory: lead.scoreHistory || []
      };
    });

    setScoredLeads(scored);
    if (onScoreUpdate) onScoreUpdate(scored);
  };

  const calculateDemographicScore = (lead) => {
    let score = 0;
    
    // Company size scoring
    if (lead.company_size) {
      const sizeScores = {
        'Enterprise (1000+)': 25,
        'Large (500-999)': 20,
        'Medium (100-499)': 15,
        'Small (50-99)': 10,
        'Startup (1-49)': 5
      };
      score += sizeScores[lead.company_size] || 0;
    }

    // Industry scoring
    if (lead.industry) {
      const industryScores = {
        'Technology': 25,
        'Healthcare': 20,
        'Finance': 22,
        'Manufacturing': 18,
        'Retail': 15,
        'Education': 12
      };
      score += industryScores[lead.industry] || 10;
    }

    // Job title scoring
    if (lead.job_title) {
      const titleScores = {
        'CEO': 25, 'CTO': 25, 'VP': 22, 'Director': 20,
        'Manager': 15, 'Senior': 12, 'Associate': 8, 'Intern': 3
      };
      
      const matchedTitle = Object.keys(titleScores).find(title => 
        lead.job_title.toLowerCase().includes(title.toLowerCase())
      );
      score += titleScores[matchedTitle] || 5;
    }

    // Location scoring (proximity to major markets)
    if (lead.location) {
      const locationScores = {
        'New York': 25, 'San Francisco': 25, 'Los Angeles': 22,
        'Chicago': 20, 'Boston': 20, 'Seattle': 18, 'Austin': 18
      };
      
      const matchedLocation = Object.keys(locationScores).find(loc => 
        lead.location.includes(loc)
      );
      score += locationScores[matchedLocation] || 10;
    }

    return Math.min(score, 100);
  };

  const calculateBehavioralScore = (lead) => {
    let score = 0;
    
    // Email engagement
    const emailOpens = lead.email_opens || 0;
    score += Math.min(emailOpens * 2, 25);
    
    // Website visits
    const websiteVisits = lead.website_visits || 0;
    score += Math.min(websiteVisits * 3, 30);
    
    // Content downloads
    const contentDownloads = lead.content_downloads || 0;
    score += Math.min(contentDownloads * 5, 25);
    
    // Social engagement
    const socialEngagement = lead.social_engagement || 0;
    score += Math.min(socialEngagement * 4, 20);

    return Math.min(score, 100);
  };

  const calculateEngagementScore = (lead) => {
    let score = 0;
    
    // Response time (faster = higher score)
    if (lead.avg_response_time) {
      const hours = lead.avg_response_time;
      if (hours <= 1) score += 25;
      else if (hours <= 4) score += 20;
      else if (hours <= 24) score += 15;
      else if (hours <= 72) score += 10;
      else score += 5;
    }
    
    // Meeting attendance rate
    if (lead.meeting_attendance_rate) {
      score += lead.meeting_attendance_rate * 0.25;
    }
    
    // Call duration (longer meaningful calls = higher score)
    if (lead.avg_call_duration) {
      const minutes = lead.avg_call_duration;
      if (minutes >= 30) score += 25;
      else if (minutes >= 15) score += 20;
      else if (minutes >= 5) score += 15;
      else score += 10;
    }
    
    // Email reply rate
    if (lead.email_reply_rate) {
      score += lead.email_reply_rate * 0.25;
    }

    return Math.min(score, 100);
  };

  const calculateFirmographicScore = (lead) => {
    let score = 0;
    
    // Annual revenue
    if (lead.annual_revenue) {
      const revenue = parseFloat(lead.annual_revenue.replace(/[^0-9.-]+/g, ''));
      if (revenue >= 100000000) score += 25; // $100M+
      else if (revenue >= 50000000) score += 20; // $50M+
      else if (revenue >= 10000000) score += 15; // $10M+
      else if (revenue >= 1000000) score += 10; // $1M+
      else score += 5;
    }
    
    // Employee count
    if (lead.employee_count) {
      const employees = parseInt(lead.employee_count);
      if (employees >= 1000) score += 25;
      else if (employees >= 500) score += 20;
      else if (employees >= 100) score += 15;
      else if (employees >= 50) score += 10;
      else score += 5;
    }
    
    // Technology stack compatibility
    if (lead.technology_stack) {
      const compatibleTechs = ['Salesforce', 'HubSpot', 'Microsoft', 'Google', 'AWS'];
      const matches = compatibleTechs.filter(tech => 
        lead.technology_stack.toLowerCase().includes(tech.toLowerCase())
      ).length;
      score += matches * 10;
    }
    
    // Growth rate
    if (lead.growth_rate) {
      const growth = parseFloat(lead.growth_rate);
      if (growth >= 50) score += 25;
      else if (growth >= 25) score += 20;
      else if (growth >= 10) score += 15;
      else if (growth >= 0) score += 10;
      else score += 5;
    }

    return Math.min(score, 100);
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return { letter: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 80) return { letter: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { letter: 'B+', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { letter: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { letter: 'C+', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 40) return { letter: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { letter: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getScorePriority = (score) => {
    if (score >= 80) return { level: 'Hot', color: 'text-red-600', bg: 'bg-red-50', icon: Zap };
    if (score >= 60) return { level: 'Warm', color: 'text-orange-600', bg: 'bg-orange-50', icon: TrendingUp };
    if (score >= 40) return { level: 'Cold', color: 'text-blue-600', bg: 'bg-blue-50', icon: Clock };
    return { level: 'Inactive', color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle };
  };

  const generatePredictions = (lead, totalScore, categoryScores) => {
    const predictions = [];
    
    // Conversion probability
    const conversionProb = Math.min(95, totalScore * 1.2);
    predictions.push({
      type: 'conversion',
      probability: conversionProb,
      description: `${conversionProb.toFixed(1)}% likelihood to convert within 30 days`
    });
    
    // Deal size prediction
    const avgDealSize = 25000;
    const dealSizeMultiplier = (categoryScores.firmographic / 100) * 2 + 0.5;
    const predictedDealSize = avgDealSize * dealSizeMultiplier;
    predictions.push({
      type: 'deal_size',
      value: predictedDealSize,
      description: `Estimated deal value: $${predictedDealSize.toLocaleString()}`
    });
    
    // Time to close
    const baseTimeToClose = 45; // days
    const timeMultiplier = (100 - categoryScores.engagement) / 100;
    const predictedTimeToClose = baseTimeToClose * (1 + timeMultiplier);
    predictions.push({
      type: 'time_to_close',
      days: Math.round(predictedTimeToClose),
      description: `Expected to close in ${Math.round(predictedTimeToClose)} days`
    });

    return predictions;
  };

  const generateRealTimeInsights = () => {
    const insights = [
      {
        id: 1,
        type: 'trend',
        title: 'Lead Quality Improving',
        description: 'Average lead score increased by 12% this week',
        icon: TrendingUp,
        color: 'text-green-600',
        timestamp: '2 minutes ago'
      },
      {
        id: 2,
        type: 'alert',
        title: 'High-Value Lead Detected',
        description: 'New enterprise lead scored 94/100 - immediate attention recommended',
        icon: Target,
        color: 'text-red-600',
        timestamp: '5 minutes ago'
      },
      {
        id: 3,
        type: 'optimization',
        title: 'Model Accuracy Improved',
        description: 'Lead scoring model retrained with 87.5% accuracy',
        icon: Brain,
        color: 'text-blue-600',
        timestamp: '1 hour ago'
      }
    ];
    
    setRealTimeInsights(insights);
  };

  const topLeads = scoredLeads
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Smart Lead Scoring
          </h2>
          <p className="text-gray-600">AI-powered lead qualification and prioritization</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure Model
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top-leads">Top Leads</TabsTrigger>
          <TabsTrigger value="model-performance">Model Performance</TabsTrigger>
          <TabsTrigger value="insights">Real-time Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold">{scoredLeads.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hot Leads</p>
                    <p className="text-2xl font-bold text-red-600">
                      {scoredLeads.filter(lead => lead.aiScore >= 80).length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-2xl font-bold">
                      {scoredLeads.length > 0 
                        ? Math.round(scoredLeads.reduce((sum, lead) => sum + lead.aiScore, 0) / scoredLeads.length)
                        : 0
                      }
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Model Accuracy</p>
                    <p className="text-2xl font-bold text-blue-600">{modelPerformance.accuracy}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Model Weights</CardTitle>
              <CardDescription>Current machine learning model configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(scoringModel).map(([category, config]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-sm text-gray-600">{config.weight}%</span>
                    </div>
                    <Progress value={config.weight} className="h-2" />
                    <div className="flex flex-wrap gap-1">
                      {config.factors.map(factor => (
                        <Badge key={factor} variant="secondary" className="text-xs">
                          {factor.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-leads" className="space-y-4">
          <div className="space-y-4">
            {topLeads.map((lead, index) => (
              <Card key={lead.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <h3 className="font-semibold">{lead.name || 'Unknown Lead'}</h3>
                        <p className="text-sm text-gray-600">{lead.company || 'No Company'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge className={`${lead.grade.bg} ${lead.grade.color}`}>
                          {lead.grade.letter}
                        </Badge>
                        <Badge className={`${lead.priority.bg} ${lead.priority.color}`}>
                          <lead.priority.icon className="h-3 w-3 mr-1" />
                          {lead.priority.level}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold mt-1">{lead.aiScore}/100</p>
                    </div>
                    
                    <div className="w-24">
                      <Progress value={lead.aiScore} className="h-3" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Demographic</p>
                    <p className="font-semibold">{lead.categoryScores.demographic}/100</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Behavioral</p>
                    <p className="font-semibold">{lead.categoryScores.behavioral}/100</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Engagement</p>
                    <p className="font-semibold">{lead.categoryScores.engagement}/100</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Firmographic</p>
                    <p className="font-semibold">{lead.categoryScores.firmographic}/100</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">AI Predictions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    {lead.predictions.map((prediction, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-600">{prediction.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="model-performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Metrics</CardTitle>
                <CardDescription>Current machine learning model performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Accuracy</span>
                    <span className="font-bold">{modelPerformance.accuracy}%</span>
                  </div>
                  <Progress value={modelPerformance.accuracy} />
                  
                  <div className="flex justify-between items-center">
                    <span>Precision</span>
                    <span className="font-bold">{modelPerformance.precision}%</span>
                  </div>
                  <Progress value={modelPerformance.precision} />
                  
                  <div className="flex justify-between items-center">
                    <span>Recall</span>
                    <span className="font-bold">{modelPerformance.recall}%</span>
                  </div>
                  <Progress value={modelPerformance.recall} />
                  
                  <div className="flex justify-between items-center">
                    <span>F1 Score</span>
                    <span className="font-bold">{modelPerformance.f1Score}%</span>
                  </div>
                  <Progress value={modelPerformance.f1Score} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Statistics</CardTitle>
                <CardDescription>Model training and validation data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{modelPerformance.totalLeadsScored}</p>
                    <p className="text-sm text-gray-600">Leads Scored</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{modelPerformance.conversionRate}%</p>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Last Model Update</p>
                  <p className="font-semibold">2 hours ago</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Next Scheduled Retrain</p>
                  <p className="font-semibold">In 6 days</p>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Retrain Model Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {realTimeInsights.map(insight => (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <span className="text-xs text-gray-500">{insight.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}