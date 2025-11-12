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
  Award, 
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
  UserCheck,
  BookOpen,
  Lightbulb,
  Trophy,
  Gauge,
  TrendingDown,
  PlayCircle,
  PauseCircle,
  SkipForward
} from 'lucide-react';
import { useSalesCoaching } from '@/hooks/useSalesCoaching';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Smart Sales Coaching Dashboard
 * Provides AI-powered coaching insights and performance analytics
 */
const SalesCoachingDashboard = () => {
  const [selectedRep, setSelectedRep] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [coachingMode, setCoachingMode] = useState('individual');

  const {
    loading,
    error,
    coachingData,
    performanceData,
    teamAnalytics,
    realTimeCoaching,
    analyzePerformance,
    generateCoachingPlan,
    getRealTimeCoaching,
    analyzeTeamPerformance,
    trackSkillDevelopment,
    getCoachingRecommendations,
    simulateCoachingSession,
    clearError
  } = useSalesCoaching();

  // Mock sales reps data
  const mockSalesReps = [
    { id: 'rep_001', name: 'John Smith', role: 'Senior Sales Rep', team: 'Enterprise', performance: 92 },
    { id: 'rep_002', name: 'Sarah Johnson', role: 'Sales Rep', team: 'SMB', performance: 78 },
    { id: 'rep_003', name: 'Mike Chen', role: 'Account Executive', team: 'Enterprise', performance: 85 },
    { id: 'rep_004', name: 'Lisa Davis', role: 'Sales Rep', team: 'SMB', performance: 71 }
  ];

  const mockTeams = [
    { id: 'team_001', name: 'Enterprise Sales', members: 8, avgPerformance: 88 },
    { id: 'team_002', name: 'SMB Sales', members: 12, avgPerformance: 75 },
    { id: 'team_003', name: 'Inside Sales', members: 15, avgPerformance: 82 }
  ];

  // Handle performance analysis
  const handleAnalyzePerformance = async () => {
    if (!selectedRep) return;
    
    try {
      await analyzePerformance(selectedRep, {
        timeframe,
        includeSkillAssessment: true,
        includeCoachingRecommendations: true
      });
    } catch (err) {
      console.error('Failed to analyze performance:', err);
    }
  };

  // Handle coaching plan generation
  const handleGenerateCoachingPlan = async () => {
    if (!selectedRep) return;
    
    try {
      const focusAreas = ['prospecting', 'closing', 'objection_handling'];
      await generateCoachingPlan(selectedRep, focusAreas);
    } catch (err) {
      console.error('Failed to generate coaching plan:', err);
    }
  };

  // Handle team analysis
  const handleTeamAnalysis = async () => {
    if (!selectedTeam) return;
    
    try {
      await analyzeTeamPerformance(selectedTeam, { timeframe });
    } catch (err) {
      console.error('Failed to analyze team performance:', err);
    }
  };

  // Get performance color
  const getPerformanceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Get skill level badge
  const getSkillBadge = (level) => {
    const badges = {
      expert: { color: 'bg-green-100 text-green-800', icon: Trophy },
      advanced: { color: 'bg-blue-100 text-blue-800', icon: Award },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: Target },
      beginner: { color: 'bg-red-100 text-red-800', icon: BookOpen }
    };
    return badges[level] || badges.beginner;
  };

  // Mock performance metrics
  const mockPerformanceMetrics = {
    overallScore: 85,
    quotaAttainment: 112,
    conversionRate: 23,
    avgDealSize: 45000,
    salesCycleLength: 32,
    activities: 156,
    skills: {
      prospecting: { level: 'advanced', score: 88 },
      presentation: { level: 'expert', score: 94 },
      negotiation: { level: 'intermediate', score: 76 },
      closing: { level: 'advanced', score: 82 },
      relationship: { level: 'expert', score: 91 }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Sales Coaching</h1>
          <p className="text-gray-600 mt-1">AI-powered performance insights and personalized coaching</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Insights
          </Button>
          <Button onClick={coachingMode === 'individual' ? handleAnalyzePerformance : handleTeamAnalysis} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Analyze
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
            Coaching Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Mode</label>
              <Select value={coachingMode} onValueChange={setCoachingMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {coachingMode === 'individual' ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Sales Rep</label>
                <Select value={selectedRep} onValueChange={setSelectedRep}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSalesReps.map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.name} - {rep.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-2 block">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.members} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
            <div className="flex items-end">
              <Button onClick={handleGenerateCoachingPlan} disabled={!selectedRep || loading} className="w-full">
                {loading ? <LoadingSpinner className="w-4 h-4 mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
                Generate Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="coaching">Coaching Plan</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overall Performance</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.overallScore}%</p>
                    <p className="text-xs text-green-600 mt-1">+5% vs last month</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getPerformanceColor(mockPerformanceMetrics.overallScore)}`}>
                    <Gauge className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quota Attainment</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.quotaAttainment}%</p>
                    <p className="text-xs text-green-600 mt-1">Above target</p>
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
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.conversionRate}%</p>
                    <p className="text-xs text-blue-600 mt-1">Industry avg: 18%</p>
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
                    <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">${(mockPerformanceMetrics.avgDealSize / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-green-600 mt-1">+12% growth</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Monthly performance tracking and coaching impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Key Metrics Trend</h4>
                  <div className="space-y-3">
                    {[
                      { metric: 'Quota Attainment', current: 112, previous: 98, trend: 'up' },
                      { metric: 'Conversion Rate', current: 23, previous: 19, trend: 'up' },
                      { metric: 'Sales Cycle', current: 32, previous: 38, trend: 'down' },
                      { metric: 'Activity Level', current: 156, previous: 142, trend: 'up' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium text-gray-900">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{item.current}{item.metric === 'Sales Cycle' ? 'd' : item.metric.includes('Rate') || item.metric.includes('Attainment') ? '%' : ''}</span>
                          {item.trend === 'up' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Coaching Impact</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">AI Coaching Sessions</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">12</p>
                    <p className="text-sm text-blue-800">This month • 15% improvement in targeted skills</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Goals Achieved</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">8/10</p>
                    <p className="text-sm text-green-800">Monthly coaching objectives completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>Detailed performance analysis across key areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { area: 'Lead Generation', score: 88, target: 85 },
                    { area: 'Qualification', score: 92, target: 90 },
                    { area: 'Presentation', score: 94, target: 88 },
                    { area: 'Negotiation', score: 76, target: 82 },
                    { area: 'Closing', score: 82, target: 85 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{item.area}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Target: {item.target}%</span>
                          <span className={`font-bold ${item.score >= item.target ? 'text-green-600' : 'text-red-600'}`}>
                            {item.score}%
                          </span>
                        </div>
                      </div>
                      <Progress value={item.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improvement Opportunities</CardTitle>
                <CardDescription>AI-identified areas for development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      area: 'Objection Handling',
                      priority: 'High',
                      impact: 'Could increase close rate by 8%',
                      action: 'Practice common objections'
                    },
                    {
                      area: 'Follow-up Timing',
                      priority: 'Medium',
                      impact: 'Reduce sales cycle by 5 days',
                      action: 'Implement automated reminders'
                    },
                    {
                      area: 'Value Proposition',
                      priority: 'Medium',
                      impact: 'Improve qualification rate by 12%',
                      action: 'Refine messaging framework'
                    }
                  ].map((opportunity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{opportunity.area}</h4>
                        <Badge variant={opportunity.priority === 'High' ? 'destructive' : 'secondary'}>
                          {opportunity.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.impact}</p>
                      <p className="text-sm font-medium text-blue-600">{opportunity.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Assessment</CardTitle>
              <CardDescription>Current skill levels and development recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(mockPerformanceMetrics.skills).map(([skill, data]) => {
                  const badge = getSkillBadge(data.level);
                  const Icon = badge.icon;
                  
                  return (
                    <div key={skill} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 capitalize">{skill.replace('_', ' ')}</h4>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          {data.level}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Score</span>
                          <span className="font-bold text-gray-900">{data.score}%</span>
                        </div>
                        <Progress value={data.score} className="h-2" />
                        <div className="text-xs text-gray-500">
                          {data.level === 'expert' ? 'Maintain excellence' : 
                           data.level === 'advanced' ? 'Focus on consistency' :
                           data.level === 'intermediate' ? 'Practice advanced techniques' :
                           'Build foundational skills'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coaching Plan Tab */}
        <TabsContent value="coaching" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Coaching Plan</CardTitle>
                <CardDescription>Personalized development roadmap</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      week: 'Week 1-2',
                      focus: 'Objection Handling Mastery',
                      activities: ['Role-play common objections', 'Study competitor responses', 'Practice with mentor'],
                      status: 'completed'
                    },
                    {
                      week: 'Week 3-4',
                      focus: 'Advanced Closing Techniques',
                      activities: ['Learn assumptive close', 'Practice urgency creation', 'Review successful calls'],
                      status: 'in_progress'
                    },
                    {
                      week: 'Week 5-6',
                      focus: 'Value Proposition Refinement',
                      activities: ['Develop industry-specific messaging', 'A/B test approaches', 'Gather customer feedback'],
                      status: 'pending'
                    }
                  ].map((plan, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{plan.week}</h4>
                        <Badge variant={
                          plan.status === 'completed' ? 'default' :
                          plan.status === 'in_progress' ? 'secondary' : 'outline'
                        }>
                          {plan.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                           plan.status === 'in_progress' ? <Clock className="w-3 h-3 mr-1" /> :
                           <Calendar className="w-3 h-3 mr-1" />}
                          {plan.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h5 className="font-semibold text-blue-600 mb-2">{plan.focus}</h5>
                      <ul className="space-y-1">
                        {plan.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coaching Resources</CardTitle>
                <CardDescription>Recommended learning materials and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: 'video',
                      title: 'Advanced Objection Handling Techniques',
                      duration: '15 min',
                      status: 'completed'
                    },
                    {
                      type: 'article',
                      title: 'Psychology of Closing Deals',
                      duration: '8 min read',
                      status: 'in_progress'
                    },
                    {
                      type: 'simulation',
                      title: 'Enterprise Sales Scenario Practice',
                      duration: '30 min',
                      status: 'pending'
                    },
                    {
                      type: 'webinar',
                      title: 'Industry Trends and Positioning',
                      duration: '45 min',
                      status: 'pending'
                    }
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {resource.type === 'video' && <PlayCircle className="w-5 h-5 text-blue-600" />}
                        {resource.type === 'article' && <BookOpen className="w-5 h-5 text-green-600" />}
                        {resource.type === 'simulation' && <Target className="w-5 h-5 text-purple-600" />}
                        {resource.type === 'webinar' && <Users className="w-5 h-5 text-orange-600" />}
                        <div>
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          <p className="text-sm text-gray-600">{resource.duration}</p>
                        </div>
                      </div>
                      <Badge variant={resource.status === 'completed' ? 'default' : 'outline'}>
                        {resource.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Coaching Assistant</CardTitle>
              <CardDescription>Live coaching suggestions during calls and meetings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Live Call Analysis</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium text-green-900">Call in Progress</span>
                    </div>
                    <p className="text-sm text-green-800 mb-3">Discovery call with Enterprise prospect</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Talk time ratio</span>
                        <span className="font-medium">35% (Good)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Questions asked</span>
                        <span className="font-medium">8 (Excellent)</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Sentiment</span>
                        <span className="font-medium text-green-600">Positive</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-900">Live Suggestions</h5>
                    {[
                      { type: 'question', text: 'Ask about their current solution limitations', priority: 'high' },
                      { type: 'objection', text: 'Prepare for budget concerns', priority: 'medium' },
                      { type: 'next_step', text: 'Suggest technical demo', priority: 'low' }
                    ].map((suggestion, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        suggestion.priority === 'high' ? 'bg-red-50 border-red-400' :
                        suggestion.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          <span className="text-sm font-medium">{suggestion.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Post-Call Analysis</h4>
                  <div className="p-4 border rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-3">Last Call Summary</h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Call Quality Score</span>
                        <span className="font-bold text-green-600">87%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Key Topics Covered</span>
                        <span className="text-sm">6/8</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next Steps Defined</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Coaching Insights</h5>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Excellent discovery questions</li>
                      <li>• Could improve on value articulation</li>
                      <li>• Strong rapport building</li>
                      <li>• Follow up within 24 hours</li>
                    </ul>
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

export default SalesCoachingDashboard;