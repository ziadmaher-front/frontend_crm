import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Brain, 
  Activity, 
  Clock, 
  MapPin, 
  Zap,
  Eye,
  Heart,
  Star,
  ArrowRight,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  ShoppingCart,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useCustomerJourney } from '@/hooks/useCustomerJourney';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Customer Journey Intelligence Dashboard
 * Provides comprehensive customer journey analytics and insights
 */
const CustomerJourneyDashboard = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStage, setFilterStage] = useState('all');

  const {
    loading,
    error,
    journeyData,
    insights,
    personalization,
    realTimeMetrics,
    analyzeCustomerJourney,
    analyzeCohort,
    startRealTimeMonitoring,
    generatePersonalization,
    getBehavioralInsights,
    getJourneyRecommendations,
    clearError
  } = useCustomerJourney();

  // Mock customer data for demo
  const mockCustomers = [
    { id: 'cust_001', name: 'Acme Corp', stage: 'consideration', value: 50000 },
    { id: 'cust_002', name: 'TechStart Inc', stage: 'evaluation', value: 75000 },
    { id: 'cust_003', name: 'Global Solutions', stage: 'negotiation', value: 120000 },
    { id: 'cust_004', name: 'Innovation Labs', stage: 'awareness', value: 30000 }
  ];

  // Handle customer analysis
  const handleAnalyzeCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      await analyzeCustomerJourney(selectedCustomer, {
        timeframe,
        includePersonalization: true,
        includePredictions: true
      });
    } catch (err) {
      console.error('Failed to analyze customer journey:', err);
    }
  };

  // Handle cohort analysis
  const handleCohortAnalysis = async () => {
    try {
      const customerIds = mockCustomers.map(c => c.id);
      await analyzeCohort(customerIds, { timeframe });
    } catch (err) {
      console.error('Failed to analyze cohort:', err);
    }
  };

  // Journey stage colors
  const getStageColor = (stage) => {
    const colors = {
      awareness: 'bg-blue-100 text-blue-800',
      interest: 'bg-green-100 text-green-800',
      consideration: 'bg-yellow-100 text-yellow-800',
      evaluation: 'bg-orange-100 text-orange-800',
      negotiation: 'bg-purple-100 text-purple-800',
      purchase: 'bg-emerald-100 text-emerald-800',
      retention: 'bg-indigo-100 text-indigo-800',
      advocacy: 'bg-pink-100 text-pink-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  // Touchpoint icons
  const getTouchpointIcon = (type) => {
    const icons = {
      email: Mail,
      phone: Phone,
      meeting: Users,
      website: Globe,
      social: MessageSquare,
      demo: Eye,
      proposal: FileText,
      purchase: ShoppingCart
    };
    return icons[type] || Activity;
  };

  // Mock journey data for visualization
  const mockJourneyStages = [
    { stage: 'awareness', progress: 100, duration: '2 days', touchpoints: 3 },
    { stage: 'interest', progress: 100, duration: '5 days', touchpoints: 7 },
    { stage: 'consideration', progress: 80, duration: '12 days', touchpoints: 15 },
    { stage: 'evaluation', progress: 60, duration: '8 days', touchpoints: 12 },
    { stage: 'negotiation', progress: 40, duration: '6 days', touchpoints: 8 },
    { stage: 'purchase', progress: 0, duration: '-', touchpoints: 0 }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Journey Intelligence</h1>
          <p className="text-gray-600 mt-1">AI-powered customer journey analytics and personalization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleCohortAnalysis} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-2">
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analysis Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Customer</label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stage Filter</label>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  <SelectItem value="awareness">Awareness</SelectItem>
                  <SelectItem value="consideration">Consideration</SelectItem>
                  <SelectItem value="evaluation">Evaluation</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAnalyzeCustomer} disabled={!selectedCustomer || loading} className="w-full">
                {loading ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                Analyze Journey
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journey">Journey Map</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Journey Completion</p>
                    <p className="text-2xl font-bold text-gray-900">68%</p>
                    <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Journey Time</p>
                    <p className="text-2xl font-bold text-gray-900">23 days</p>
                    <p className="text-xs text-red-600 mt-1">+3 days vs target</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Touchpoint Efficiency</p>
                    <p className="text-2xl font-bold text-gray-900">84%</p>
                    <p className="text-xs text-green-600 mt-1">+7% improvement</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Personalization Score</p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                    <p className="text-xs text-green-600 mt-1">Excellent match</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journey Stage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Journey Stage Distribution</CardTitle>
              <CardDescription>Current customer distribution across journey stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockJourneyStages.map((stage, index) => (
                  <div key={stage.stage} className="text-center p-4 border rounded-lg">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStageColor(stage.stage)} mb-2`}>
                      {stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stage.touchpoints}</div>
                    <div className="text-sm text-gray-600">customers</div>
                    <Progress value={stage.progress} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey Map Tab */}
        <TabsContent value="journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Journey Visualization</CardTitle>
              <CardDescription>Interactive journey map with touchpoints and progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockJourneyStages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.progress > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {stage.progress > 0 ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">{stage.stage}</h3>
                        <Badge variant={stage.progress > 0 ? 'default' : 'secondary'}>
                          {stage.duration}
                        </Badge>
                      </div>
                      <Progress value={stage.progress} className="mb-2" />
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{stage.touchpoints} touchpoints</span>
                        <span>•</span>
                        <span>{stage.progress}% complete</span>
                      </div>
                    </div>
                    {index < mockJourneyStages.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Behavioral Patterns</CardTitle>
                <CardDescription>Customer interaction patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Email Engagement</span>
                    </div>
                    <Badge variant="secondary">High</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Website Activity</span>
                    </div>
                    <Badge variant="secondary">Very High</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Call Response</span>
                    </div>
                    <Badge variant="secondary">Medium</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Timeline</CardTitle>
                <CardDescription>Recent customer interactions and touchpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'email', action: 'Opened product demo email', time: '2 hours ago', status: 'positive' },
                    { type: 'website', action: 'Visited pricing page', time: '1 day ago', status: 'positive' },
                    { type: 'meeting', action: 'Attended product demo', time: '3 days ago', status: 'positive' },
                    { type: 'phone', action: 'Missed follow-up call', time: '5 days ago', status: 'negative' }
                  ].map((interaction, index) => {
                    const Icon = getTouchpointIcon(interaction.type);
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          interaction.status === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{interaction.action}</p>
                          <p className="text-sm text-gray-600">{interaction.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalization Strategy</CardTitle>
                <CardDescription>AI-generated personalization recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Content Preferences</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Technical documentation and case studies</li>
                      <li>• ROI calculators and cost analysis</li>
                      <li>• Integration guides and API documentation</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Communication Style</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Prefers detailed, data-driven communications</li>
                      <li>• Responds well to email over phone calls</li>
                      <li>• Values technical accuracy and specificity</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Timing Optimization</h4>
                    <ul className="space-y-1 text-sm text-purple-800">
                      <li>• Most active Tuesday-Thursday, 9-11 AM</li>
                      <li>• Email open rates highest on Wednesday</li>
                      <li>• Avoid Friday afternoon communications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Next best actions based on journey analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { 
                      action: 'Send technical integration guide',
                      priority: 'High',
                      confidence: 92,
                      timing: 'Within 24 hours'
                    },
                    {
                      action: 'Schedule technical demo call',
                      priority: 'Medium',
                      confidence: 78,
                      timing: 'This week'
                    },
                    {
                      action: 'Share customer success story',
                      priority: 'Medium',
                      confidence: 85,
                      timing: 'Next week'
                    }
                  ].map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{rec.action}</h4>
                        <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Confidence: {rec.confidence}%</span>
                        <span>{rec.timing}</span>
                      </div>
                      <Progress value={rec.confidence} className="mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Machine learning insights and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Conversion Predictions</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">Purchase Probability</span>
                      <span className="text-2xl font-bold text-green-600">78%</span>
                    </div>
                    <Progress value={78} className="mb-2" />
                    <p className="text-sm text-green-800">High likelihood based on engagement patterns</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">Expected Close Date</span>
                      <span className="font-bold text-blue-600">Dec 15, 2024</span>
                    </div>
                    <p className="text-sm text-blue-800">Based on similar customer journeys</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Risk Factors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-900">Competitor evaluation detected</span>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-red-900">Budget approval pending</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">High Risk</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-900">Strong technical fit</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">Low Risk</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerJourneyDashboard;