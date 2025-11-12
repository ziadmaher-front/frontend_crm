import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Users, 
  Activity, 
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';

const EnhancedLeadScoring = () => {
  const [leads, setLeads] = useState([]);
  const [scoringModel, setScoringModel] = useState('advanced');
  const [filters, setFilters] = useState({
    scoreRange: 'all',
    source: 'all',
    industry: 'all'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock lead data with enhanced scoring
  const mockLeads = [
    {
      id: 1,
      name: 'Sarah Johnson',
      company: 'TechCorp Inc.',
      email: 'sarah@techcorp.com',
      phone: '+1-555-0123',
      source: 'Website',
      industry: 'Technology',
      score: 92,
      previousScore: 78,
      trend: 'up',
      factors: {
        demographic: 85,
        behavioral: 95,
        engagement: 88,
        firmographic: 90
      },
      activities: [
        { type: 'email_open', count: 12, weight: 0.8 },
        { type: 'website_visit', count: 8, weight: 0.9 },
        { type: 'content_download', count: 3, weight: 1.0 },
        { type: 'demo_request', count: 1, weight: 1.5 }
      ],
      predictedActions: [
        { action: 'Schedule Demo', probability: 0.87 },
        { action: 'Request Proposal', probability: 0.72 },
        { action: 'Convert to Customer', probability: 0.65 }
      ],
      riskFactors: [],
      lastActivity: '2 hours ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Global Solutions Ltd.',
      email: 'mchen@globalsol.com',
      phone: '+1-555-0124',
      source: 'LinkedIn',
      industry: 'Manufacturing',
      score: 76,
      previousScore: 82,
      trend: 'down',
      factors: {
        demographic: 80,
        behavioral: 65,
        engagement: 70,
        firmographic: 85
      },
      activities: [
        { type: 'email_open', count: 5, weight: 0.8 },
        { type: 'website_visit', count: 2, weight: 0.9 },
        { type: 'content_download', count: 1, weight: 1.0 }
      ],
      predictedActions: [
        { action: 'Schedule Demo', probability: 0.45 },
        { action: 'Request Proposal', probability: 0.32 },
        { action: 'Convert to Customer', probability: 0.28 }
      ],
      riskFactors: ['Decreased engagement', 'Long sales cycle'],
      lastActivity: '1 day ago'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      company: 'StartupXYZ',
      email: 'emily@startupxyz.com',
      phone: '+1-555-0125',
      source: 'Referral',
      industry: 'SaaS',
      score: 88,
      previousScore: 85,
      trend: 'up',
      factors: {
        demographic: 90,
        behavioral: 85,
        engagement: 92,
        firmographic: 75
      },
      activities: [
        { type: 'email_open', count: 15, weight: 0.8 },
        { type: 'website_visit', count: 12, weight: 0.9 },
        { type: 'content_download', count: 5, weight: 1.0 },
        { type: 'pricing_page_visit', count: 3, weight: 1.2 }
      ],
      predictedActions: [
        { action: 'Schedule Demo', probability: 0.78 },
        { action: 'Request Proposal', probability: 0.68 },
        { action: 'Convert to Customer', probability: 0.58 }
      ],
      riskFactors: ['Small company size'],
      lastActivity: '30 minutes ago'
    }
  ];

  const scoringModels = [
    { value: 'basic', label: 'Basic Scoring', description: 'Simple demographic and firmographic scoring' },
    { value: 'advanced', label: 'Advanced ML', description: 'Machine learning with behavioral analysis' },
    { value: 'predictive', label: 'Predictive AI', description: 'AI-powered predictive scoring with intent signals' }
  ];

  useEffect(() => {
    setLeads(mockLeads);
  }, []);

  const analyzeLeads = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setLeads(prev => prev.map(lead => ({
        ...lead,
        score: Math.min(100, lead.score + Math.floor(Math.random() * 10) - 5),
        lastAnalyzed: new Date()
      })));
      setIsAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { variant: 'default', label: 'Hot', color: 'bg-red-500' };
    if (score >= 60) return { variant: 'secondary', label: 'Warm', color: 'bg-yellow-500' };
    return { variant: 'outline', label: 'Cold', color: 'bg-blue-500' };
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
    );
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.scoreRange !== 'all') {
      const [min, max] = filters.scoreRange.split('-').map(Number);
      if (lead.score < min || lead.score > max) return false;
    }
    if (filters.source !== 'all' && lead.source !== filters.source) return false;
    if (filters.industry !== 'all' && lead.industry !== filters.industry) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Lead Scoring</h1>
          <p className="text-muted-foreground">
            AI-powered lead scoring with behavioral pattern analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={analyzeLeads} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Re-analyze Leads'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Lead Scores</TabsTrigger>
          <TabsTrigger value="models">Scoring Models</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Score Range</label>
                  <Select value={filters.scoreRange} onValueChange={(value) => setFilters(prev => ({ ...prev, scoreRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="80-100">Hot (80-100)</SelectItem>
                      <SelectItem value="60-79">Warm (60-79)</SelectItem>
                      <SelectItem value="0-59">Cold (0-59)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Industry</label>
                  <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead List */}
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Lead Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        {getTrendIcon(lead.trend)}
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{lead.source}</Badge>
                        <Badge variant="outline">{lead.industry}</Badge>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Previous: {lead.previousScore}
                      </div>
                      <Badge {...getScoreBadge(lead.score)} className="mt-2">
                        {getScoreBadge(lead.score).label}
                      </Badge>
                    </div>

                    {/* Scoring Factors */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Scoring Factors</h4>
                      {Object.entries(lead.factors).map(([factor, score]) => (
                        <div key={factor} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{factor}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={score} className="w-16 h-2" />
                            <span className="text-sm w-8">{score}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Predicted Actions */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Predicted Actions</h4>
                      {lead.predictedActions.map((action, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{action.action}</span>
                          <Badge variant="outline">
                            {Math.round(action.probability * 100)}%
                          </Badge>
                        </div>
                      ))}
                      {lead.riskFactors.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Risk Factors</span>
                          </div>
                          {lead.riskFactors.map((risk, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {risk}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">
                      Last activity: {lead.lastActivity}
                    </span>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm">
                        Contact Lead
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4">
            {scoringModels.map((model) => (
              <Card key={model.value} className={`cursor-pointer transition-all ${scoringModel === model.value ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-6" onClick={() => setScoringModel(model.value)}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{model.label}</h3>
                        {scoringModel === model.value && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                    <Button variant={scoringModel === model.value ? "default" : "outline"}>
                      {scoringModel === model.value ? 'Active' : 'Select'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">247</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">68</div>
                <div className="text-sm text-muted-foreground">Hot Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">124</div>
                <div className="text-sm text-muted-foreground">Warm Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">78.5</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Hot Leads (80-100)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={28} className="w-32" />
                    <span className="text-sm">28%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Warm Leads (60-79)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={50} className="w-32" />
                    <span className="text-sm">50%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cold Leads (0-59)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={22} className="w-32" />
                    <span className="text-sm">22%</span>
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

export default EnhancedLeadScoring;