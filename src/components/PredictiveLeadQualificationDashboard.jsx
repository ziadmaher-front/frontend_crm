import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Users,
  Star,
  Filter,
  Download,
  RefreshCw,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { usePredictiveLeadQualification } from '../hooks/usePredictiveLeadQualification';

const PredictiveLeadQualificationDashboard = () => {
  const {
    loading,
    error,
    leadQualificationData,
    qualificationHistory,
    mlPredictions,
    qualifyLead,
    qualifyLeadsBatch,
    predictConversion,
    getQualificationAnalytics,
    getLeadRecommendations,
    filterLeadsByQualification,
    getQualificationInsights,
    exportQualificationData,
    clearError
  } = usePredictiveLeadQualification();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLead, setSelectedLead] = useState(null);
  const [filters, setFilters] = useState({
    grade: '',
    priority: '',
    minScore: '',
    maxScore: ''
  });
  const [sampleLeads] = useState([
    {
      id: 'lead-001',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      companySize: 'enterprise',
      industry: 'technology',
      revenue: '>100M',
      location: 'tier1',
      source: { quality: 0.9 },
      websiteActivity: { returnVisits: 8, pageViews: 45 },
      emailActivity: { openRate: 0.85, clickRate: 0.65 },
      engagementTrend: 'increasing'
    },
    {
      id: 'lead-002',
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      companySize: 'startup',
      industry: 'finance',
      revenue: '1M-10M',
      location: 'tier2',
      source: { quality: 0.7 },
      websiteActivity: { returnVisits: 3, pageViews: 12 },
      emailActivity: { openRate: 0.45, clickRate: 0.25 },
      engagementTrend: 'stable'
    }
  ]);

  const analytics = getQualificationAnalytics();
  const insights = getQualificationInsights();
  const filteredLeads = filterLeadsByQualification(filters);

  useEffect(() => {
    // Auto-qualify sample leads on component mount
    if (Object.keys(leadQualificationData).length === 0) {
      qualifyLeadsBatch(sampleLeads);
    }
  }, []);

  const handleQualifyLead = async (leadData) => {
    try {
      await qualifyLead(leadData, {
        includeMLPrediction: true,
        includeBehavioralAnalysis: true,
        includeIntentSignals: true
      });
    } catch (err) {
      console.error('Failed to qualify lead:', err);
    }
  };

  const handlePredictConversion = async (leadData) => {
    try {
      await predictConversion(leadData, '30d');
    } catch (err) {
      console.error('Failed to predict conversion:', err);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center mt-1 text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const LeadCard = ({ lead, qualification }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedLead(lead)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.email}</p>
          </div>
          <Badge className={`${getGradeColor(qualification.qualification.grade)} text-white`}>
            Grade {qualification.qualification.grade}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lead Score</span>
            <span className="font-semibold">{qualification.scores.composite}/100</span>
          </div>
          <Progress value={qualification.scores.composite} className="h-2" />
          
          <div className="flex justify-between items-center text-sm">
            <Badge className={getPriorityColor(qualification.qualification.priority)}>
              {qualification.qualification.priority} Priority
            </Badge>
            <span className="text-gray-600">{qualification.qualification.category}</span>
          </div>
          
          {qualification.predictions && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Conversion Prob.</span>
              <span className="font-semibold text-green-600">
                {qualification.predictions.conversionProbability}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ScoreBreakdown = ({ scores }) => (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Demographic Score</span>
          <span className="text-sm font-semibold">{scores.demographic}/100</span>
        </div>
        <Progress value={scores.demographic} className="h-2" />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Behavioral Score</span>
          <span className="text-sm font-semibold">{scores.behavioral}/100</span>
        </div>
        <Progress value={scores.behavioral} className="h-2" />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Intent Score</span>
          <span className="text-sm font-semibold">{scores.intent}/100</span>
        </div>
        <Progress value={scores.intent} className="h-2" />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Lead Qualification</h1>
          <p className="text-gray-600">AI-powered lead scoring and qualification engine</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => exportQualificationData('csv')}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => qualifyLeadsBatch(sampleLeads)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Qualified Leads"
          value={analytics.totalLeads}
          change={12}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Average Lead Score"
          value={analytics.averageScore}
          change={8}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Grade A Leads"
          value={analytics.gradeDistribution.A || 0}
          change={15}
          icon={Star}
          color="yellow"
        />
        <MetricCard
          title="High Conversion Prob."
          value={analytics.conversionPredictions.high}
          change={-3}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-1 rounded-full ${
                    insight.type === 'positive' ? 'bg-green-100' :
                    insight.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    {insight.type === 'positive' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : insight.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Lead Scoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Lead Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getGradeColor(grade)}`} />
                        <span>Grade {grade}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{count}</span>
                        <span className="text-sm text-gray-600">
                          ({Math.round((count / analytics.totalLeads) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conversion Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Conversion Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>High Probability (70%+)</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.conversionPredictions.high}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Probability (40-69%)</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {analytics.conversionPredictions.medium}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Probability (&lt;40%)</span>
                    <Badge className="bg-red-100 text-red-800">
                      {analytics.conversionPredictions.low}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qualificationHistory.slice(0, 5).map((qualification, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-semibold">Lead {qualification.leadId}</span>
                      <p className="text-sm text-gray-600">
                        {new Date(qualification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getGradeColor(qualification.qualification.grade)} text-white`}>
                        {qualification.qualification.grade}
                      </Badge>
                      <span className="font-semibold">{qualification.scores.composite}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="leads" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="grade-filter">Grade</Label>
                  <Select value={filters.grade} onValueChange={(value) => setFilters(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Grades</SelectItem>
                      <SelectItem value="A">Grade A</SelectItem>
                      <SelectItem value="B">Grade B</SelectItem>
                      <SelectItem value="C">Grade C</SelectItem>
                      <SelectItem value="D">Grade D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority-filter">Priority</Label>
                  <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="min-score">Min Score</Label>
                  <Input
                    id="min-score"
                    type="number"
                    placeholder="0"
                    value={filters.minScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max-score">Max Score</Label>
                  <Input
                    id="max-score"
                    type="number"
                    placeholder="100"
                    value={filters.maxScore}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(leadQualificationData).map(([leadId, qualification]) => {
              const lead = sampleLeads.find(l => l.id === leadId);
              if (!lead) return null;
              
              return (
                <LeadCard key={leadId} lead={lead} qualification={qualification} />
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Top Performing Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPerformingCriteria?.map((criteria, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{criteria.criteria}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(criteria.impact / 100) * 100} className="w-20 h-2" />
                        <span className="text-sm font-semibold">{Math.round(criteria.impact)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.improvementAreas?.map((area, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{area.area}</span>
                      <Badge variant="outline" className="text-orange-600">
                        {area.percentage}% need improvement
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ML Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Machine Learning Models
              </CardTitle>
              <CardDescription>
                AI-powered predictions and model performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Lead Scoring Model</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-medium">Gradient Boosting</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Trained:</span>
                      <span className="font-medium">Jan 15, 2024</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Conversion Prediction</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-medium">Random Forest</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium text-green-600">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Trained:</span>
                      <span className="font-medium">Jan 10, 2024</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border">
                  <h3 className="font-semibold mb-2">Churn Prediction</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-medium">Neural Network</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className="font-medium text-green-600">79%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Trained:</span>
                      <span className="font-medium">Jan 12, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {selectedLead ? (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations for {selectedLead.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const recommendations = getLeadRecommendations(selectedLead.id);
                  const qualification = leadQualificationData[selectedLead.id];
                  
                  if (!recommendations || !qualification) {
                    return <p className="text-gray-600">No recommendations available. Please qualify this lead first.</p>;
                  }

                  return (
                    <div className="space-y-6">
                      {/* Score Breakdown */}
                      <div>
                        <h3 className="font-semibold mb-3">Score Breakdown</h3>
                        <ScoreBreakdown scores={qualification.scores} />
                      </div>

                      {/* Next Actions */}
                      <div>
                        <h3 className="font-semibold mb-3">Recommended Next Actions</h3>
                        <div className="space-y-2">
                          {recommendations.nextActions?.map((action, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 rounded bg-blue-50">
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h3 className="font-semibold mb-3">Strategic Recommendations</h3>
                        <div className="space-y-3">
                          {recommendations.recommendations?.map((rec, index) => (
                            <div key={index} className="p-3 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority} Priority
                                </Badge>
                                <span className="text-sm text-gray-600 capitalize">{rec.type}</span>
                              </div>
                              <h4 className="font-semibold">{rec.action}</h4>
                              <p className="text-sm text-gray-600">{rec.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Lead</h3>
                <p className="text-gray-600">Choose a lead from the Lead Scoring tab to view personalized recommendations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveLeadQualificationDashboard;