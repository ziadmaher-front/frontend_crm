import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Target, 
  Brain, 
  Zap, 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  Lightbulb, 
  Shield, 
  AlertCircle, 
  Star, 
  Flame, 
  Snowflake, 
  ThermometerSun, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  RefreshCw,
  Filter,
  Download,
  Share,
  Settings,
  Info,
  ChevronRight,
  Briefcase,
  Building,
  User,
  Globe,
  Smartphone
} from 'lucide-react';

export default function PredictiveDealClosure() {
  const [deals, setDeals] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [riskFactors, setRiskFactors] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedStage, setSelectedStage] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadDeals();
    generatePredictions();
    analyzeRiskFactors();
    generateRecommendations();
  }, [selectedTimeframe, selectedStage]);

  const loadDeals = () => {
    const sampleDeals = [
      {
        id: 1,
        company: 'TechCorp Solutions',
        contact: 'John Smith',
        title: 'Enterprise CRM Implementation',
        value: 150000,
        stage: 'negotiation',
        probability: 75,
        daysInStage: 12,
        totalDays: 45,
        lastActivity: '2024-01-14',
        nextActivity: '2024-01-16',
        activities: {
          emails: 23,
          calls: 8,
          meetings: 5,
          demos: 2
        },
        stakeholders: [
          { name: 'John Smith', role: 'CTO', engagement: 'high', influence: 'high' },
          { name: 'Sarah Johnson', role: 'VP Sales', engagement: 'medium', influence: 'medium' },
          { name: 'Mike Davis', role: 'CEO', engagement: 'low', influence: 'high' }
        ],
        competitors: ['Salesforce', 'HubSpot'],
        budget: 'confirmed',
        timeline: 'Q1 2024',
        painPoints: ['Manual processes', 'Data silos', 'Reporting gaps'],
        healthScore: 82,
        riskLevel: 'low',
        predictedCloseDate: '2024-02-15',
        confidenceInterval: [65, 85]
      },
      {
        id: 2,
        company: 'RetailPlus Inc',
        contact: 'Lisa Chen',
        title: 'Multi-location CRM Rollout',
        value: 85000,
        stage: 'proposal',
        probability: 45,
        daysInStage: 18,
        totalDays: 62,
        lastActivity: '2024-01-12',
        nextActivity: '2024-01-17',
        activities: {
          emails: 15,
          calls: 4,
          meetings: 3,
          demos: 1
        },
        stakeholders: [
          { name: 'Lisa Chen', role: 'Operations Director', engagement: 'high', influence: 'medium' },
          { name: 'Tom Wilson', role: 'IT Manager', engagement: 'medium', influence: 'low' }
        ],
        competitors: ['Pipedrive', 'Zoho'],
        budget: 'estimated',
        timeline: 'Q2 2024',
        painPoints: ['Inventory tracking', 'Customer data fragmentation'],
        healthScore: 58,
        riskLevel: 'medium',
        predictedCloseDate: '2024-03-20',
        confidenceInterval: [35, 55]
      },
      {
        id: 3,
        company: 'StartupX',
        contact: 'Alex Rodriguez',
        title: 'Startup CRM Package',
        value: 25000,
        stage: 'discovery',
        probability: 25,
        daysInStage: 8,
        totalDays: 22,
        lastActivity: '2024-01-13',
        nextActivity: '2024-01-18',
        activities: {
          emails: 12,
          calls: 3,
          meetings: 2,
          demos: 0
        },
        stakeholders: [
          { name: 'Alex Rodriguez', role: 'Founder', engagement: 'high', influence: 'high' }
        ],
        competitors: ['Airtable', 'Notion'],
        budget: 'unconfirmed',
        timeline: 'Flexible',
        painPoints: ['Growth scaling', 'Process automation'],
        healthScore: 35,
        riskLevel: 'high',
        predictedCloseDate: '2024-04-10',
        confidenceInterval: [15, 35]
      },
      {
        id: 4,
        company: 'MegaCorp Industries',
        contact: 'Jennifer Brown',
        title: 'Global CRM Transformation',
        value: 500000,
        stage: 'closing',
        probability: 90,
        daysInStage: 5,
        totalDays: 120,
        lastActivity: '2024-01-15',
        nextActivity: '2024-01-16',
        activities: {
          emails: 45,
          calls: 18,
          meetings: 12,
          demos: 4
        },
        stakeholders: [
          { name: 'Jennifer Brown', role: 'Chief Digital Officer', engagement: 'high', influence: 'high' },
          { name: 'Robert Kim', role: 'VP Technology', engagement: 'high', influence: 'high' },
          { name: 'Maria Garcia', role: 'CFO', engagement: 'medium', influence: 'high' }
        ],
        competitors: ['Microsoft Dynamics', 'Oracle'],
        budget: 'approved',
        timeline: 'Q1 2024',
        painPoints: ['Legacy system integration', 'Global standardization'],
        healthScore: 95,
        riskLevel: 'low',
        predictedCloseDate: '2024-01-25',
        confidenceInterval: [85, 95]
      }
    ];

    let filteredDeals = sampleDeals;
    if (selectedStage !== 'all') {
      filteredDeals = sampleDeals.filter(deal => deal.stage === selectedStage);
    }

    setDeals(filteredDeals);
  };

  const generatePredictions = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const predictions = {
        overview: {
          totalPipeline: 760000,
          predictedRevenue: 456000,
          averageCloseRate: 62,
          averageDealCycle: 68,
          atRiskDeals: 2,
          hotDeals: 2
        },
        timeframePredictions: {
          next7Days: {
            deals: 1,
            value: 500000,
            probability: 90
          },
          next30Days: {
            deals: 2,
            value: 650000,
            probability: 75
          },
          next90Days: {
            deals: 4,
            value: 760000,
            probability: 60
          }
        },
        stageAnalysis: {
          discovery: { count: 1, avgDays: 22, conversionRate: 35 },
          proposal: { count: 1, avgDays: 62, conversionRate: 55 },
          negotiation: { count: 1, avgDays: 45, conversionRate: 75 },
          closing: { count: 1, avgDays: 120, conversionRate: 90 }
        },
        trends: {
          velocityTrend: 'increasing',
          volumeTrend: 'stable',
          valueTrend: 'increasing',
          winRateTrend: 'increasing'
        }
      };

      setPredictions(predictions);
      setIsAnalyzing(false);
    }, 2000);
  };

  const analyzeRiskFactors = () => {
    const riskAnalysis = {
      global: [
        {
          factor: 'Long sales cycles',
          impact: 'high',
          affectedDeals: 2,
          description: 'Deals staying in stages longer than average',
          mitigation: 'Accelerate decision-making process'
        },
        {
          factor: 'Limited stakeholder engagement',
          impact: 'medium',
          affectedDeals: 1,
          description: 'Key decision makers not actively engaged',
          mitigation: 'Schedule executive briefings'
        },
        {
          factor: 'Budget uncertainty',
          impact: 'medium',
          affectedDeals: 1,
          description: 'Budget not confirmed or approved',
          mitigation: 'Conduct budget qualification calls'
        },
        {
          factor: 'Strong competition',
          impact: 'low',
          affectedDeals: 4,
          description: 'Multiple competitors in evaluation',
          mitigation: 'Strengthen value proposition'
        }
      ],
      dealSpecific: {
        1: [
          { factor: 'CEO not engaged', severity: 'medium', impact: -10 },
          { factor: 'Multiple competitors', severity: 'low', impact: -5 }
        ],
        2: [
          { factor: 'Long time in stage', severity: 'high', impact: -20 },
          { factor: 'Budget not confirmed', severity: 'medium', impact: -15 },
          { factor: 'Limited stakeholder buy-in', severity: 'medium', impact: -10 }
        ],
        3: [
          { factor: 'Early stage', severity: 'low', impact: -5 },
          { factor: 'Budget unconfirmed', severity: 'high', impact: -25 },
          { factor: 'Single stakeholder', severity: 'medium', impact: -15 }
        ],
        4: [
          { factor: 'Complex integration requirements', severity: 'low', impact: -5 }
        ]
      }
    };

    setRiskFactors(riskAnalysis);
  };

  const generateRecommendations = () => {
    const recs = [
      {
        dealId: 2,
        priority: 'high',
        type: 'engagement',
        title: 'Schedule executive meeting',
        description: 'RetailPlus deal has been in proposal stage for 18 days. Schedule a meeting with decision makers.',
        action: 'Book C-level meeting',
        expectedImpact: '+15% close probability',
        timeframe: 'This week'
      },
      {
        dealId: 3,
        priority: 'high',
        type: 'qualification',
        title: 'Confirm budget and timeline',
        description: 'StartupX needs budget qualification to move forward effectively.',
        action: 'Schedule budget discussion',
        expectedImpact: '+20% close probability',
        timeframe: 'Next 3 days'
      },
      {
        dealId: 1,
        priority: 'medium',
        type: 'stakeholder',
        title: 'Engage CEO in process',
        description: 'TechCorp CEO has low engagement but high influence. Critical for final approval.',
        action: 'Request CEO briefing',
        expectedImpact: '+10% close probability',
        timeframe: 'Next week'
      },
      {
        dealId: 4,
        priority: 'low',
        type: 'acceleration',
        title: 'Prepare contract terms',
        description: 'MegaCorp is ready to close. Prepare final contract and terms.',
        action: 'Draft final agreement',
        expectedImpact: 'Faster close',
        timeframe: 'Immediate'
      }
    ];

    setRecommendations(recs);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return Flame;
    if (score >= 60) return ThermometerSun;
    return Snowflake;
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'discovery': return 'bg-blue-100 text-blue-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closing': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return ArrowUp;
      case 'decreasing': return ArrowDown;
      case 'stable': return Minus;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Predictive Deal Closure
          </h2>
          <p className="text-gray-600">AI-powered deal health and closure predictions</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closing">Closing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generatePredictions} disabled={isAnalyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(predictions.overview?.totalPipeline || 0)}
            </div>
            <p className="text-sm text-gray-600">Total Pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(predictions.overview?.predictedRevenue || 0)}
            </div>
            <p className="text-sm text-gray-600">Predicted Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {predictions.overview?.averageCloseRate || 0}%
            </div>
            <p className="text-sm text-gray-600">Avg Close Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {predictions.overview?.averageDealCycle || 0}
            </div>
            <p className="text-sm text-gray-600">Avg Cycle (days)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {predictions.overview?.atRiskDeals || 0}
            </div>
            <p className="text-sm text-gray-600">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {predictions.overview?.hotDeals || 0}
            </div>
            <p className="text-sm text-gray-600">Hot Deals</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Health Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Deal Health Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deals.map(deal => {
                const HealthIcon = getHealthScoreIcon(deal.healthScore);
                return (
                  <div key={deal.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <HealthIcon className={`h-5 w-5 ${getHealthScoreColor(deal.healthScore)}`} />
                          <div>
                            <h3 className="font-semibold">{deal.company}</h3>
                            <p className="text-sm text-gray-600">{deal.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {deal.contact}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {deal.totalDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage}
                        </Badge>
                        <Badge className={getRiskLevelColor(deal.riskLevel)}>
                          {deal.riskLevel} risk
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Health Score</span>
                          <span className={`text-sm font-bold ${getHealthScoreColor(deal.healthScore)}`}>
                            {deal.healthScore}%
                          </span>
                        </div>
                        <Progress value={deal.healthScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Close Probability</span>
                          <span className="text-sm font-bold text-blue-600">
                            {deal.probability}%
                          </span>
                        </div>
                        <Progress value={deal.probability} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          Range: {deal.confidenceInterval[0]}% - {deal.confidenceInterval[1]}%
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-1">Predicted Close</div>
                        <div className="text-sm text-gray-600">{formatDate(deal.predictedCloseDate)}</div>
                        <div className="text-xs text-gray-500">
                          {deal.daysInStage} days in {deal.stage}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{deal.activities.emails}</div>
                        <div className="text-xs text-gray-600">Emails</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{deal.activities.calls}</div>
                        <div className="text-xs text-gray-600">Calls</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{deal.activities.meetings}</div>
                        <div className="text-xs text-gray-600">Meetings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">{deal.stakeholders.length}</div>
                        <div className="text-xs text-gray-600">Stakeholders</div>
                      </div>
                    </div>

                    {riskFactors.dealSpecific?.[deal.id] && (
                      <div className="pt-3 border-t">
                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Risk Factors
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {riskFactors.dealSpecific[deal.id].map((risk, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`text-xs ${
                                risk.severity === 'high' ? 'border-red-300 text-red-700' :
                                risk.severity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-gray-300 text-gray-700'
                              }`}
                            >
                              {risk.factor} ({risk.impact}%)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Predictions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Revenue Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Next 7 Days</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatCurrency(predictions.timeframePredictions?.next7Days?.value || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {predictions.timeframePredictions?.next7Days?.deals || 0} deals • {predictions.timeframePredictions?.next7Days?.probability || 0}% confidence
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Next 30 Days</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(predictions.timeframePredictions?.next30Days?.value || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {predictions.timeframePredictions?.next30Days?.deals || 0} deals • {predictions.timeframePredictions?.next30Days?.probability || 0}% confidence
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Next 90 Days</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {formatCurrency(predictions.timeframePredictions?.next90Days?.value || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {predictions.timeframePredictions?.next90Days?.deals || 0} deals • {predictions.timeframePredictions?.next90Days?.probability || 0}% confidence
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                    <span className="text-xs text-gray-600 capitalize">{rec.type}</span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">{rec.expectedImpact}</span>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Timeline: {rec.timeframe}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskFactors.global?.map((risk, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className={`h-4 w-4 ${
                      risk.impact === 'high' ? 'text-red-600' :
                      risk.impact === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <span className="font-medium text-sm">{risk.factor}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {risk.affectedDeals} deals affected
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {risk.impact} impact
                    </Badge>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    💡 {risk.mitigation}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(predictions.trends || {}).map(([key, trend]) => {
                const TrendIcon = getTrendIcon(trend);
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`h-4 w-4 ${getTrendColor(trend)}`} />
                      <span className={`text-sm capitalize ${getTrendColor(trend)}`}>
                        {trend}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Stage Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Stage Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(predictions.stageAnalysis || {}).map(([stage, data]) => (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{stage}</span>
                    <Badge className={getStageColor(stage)}>
                      {data.count} deals
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Avg Days: {data.avgDays}</div>
                    <div>Conversion: {data.conversionRate}%</div>
                  </div>
                  <Progress value={data.conversionRate} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}