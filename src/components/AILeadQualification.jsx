import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Star, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  Filter,
  BarChart3
} from 'lucide-react';
import { AnimatedCard, AnimatedCounter, StaggerContainer } from '@/components/MicroInteractions';

const AILeadQualification = ({ leads = [], onLeadUpdate, onRouteAssignment }) => {
  const [qualifiedLeads, setQualifiedLeads] = useState([]);
  const [scoringMetrics, setScoringMetrics] = useState({});
  const [routingRules, setRoutingRules] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Scoring Algorithm
  const calculateLeadScore = (lead) => {
    let score = 0;
    const factors = {};

    // Company Size Factor (0-25 points)
    if (lead.companySize) {
      if (lead.companySize >= 1000) {
        score += 25;
        factors.companySize = { score: 25, reason: 'Enterprise company' };
      } else if (lead.companySize >= 100) {
        score += 20;
        factors.companySize = { score: 20, reason: 'Mid-market company' };
      } else if (lead.companySize >= 10) {
        score += 15;
        factors.companySize = { score: 15, reason: 'Small business' };
      } else {
        score += 5;
        factors.companySize = { score: 5, reason: 'Micro business' };
      }
    }

    // Budget Factor (0-25 points)
    if (lead.budget) {
      if (lead.budget >= 100000) {
        score += 25;
        factors.budget = { score: 25, reason: 'High budget potential' };
      } else if (lead.budget >= 50000) {
        score += 20;
        factors.budget = { score: 20, reason: 'Medium budget' };
      } else if (lead.budget >= 10000) {
        score += 15;
        factors.budget = { score: 15, reason: 'Low budget' };
      } else {
        score += 5;
        factors.budget = { score: 5, reason: 'Very low budget' };
      }
    }

    // Engagement Factor (0-20 points)
    const engagementScore = (lead.emailOpens || 0) * 2 + (lead.websiteVisits || 0) * 3 + (lead.downloadedContent || 0) * 5;
    const normalizedEngagement = Math.min(engagementScore, 20);
    score += normalizedEngagement;
    factors.engagement = { score: normalizedEngagement, reason: 'Digital engagement level' };

    // Authority Factor (0-15 points)
    if (lead.jobTitle) {
      const title = lead.jobTitle.toLowerCase();
      if (title.includes('ceo') || title.includes('president') || title.includes('owner')) {
        score += 15;
        factors.authority = { score: 15, reason: 'C-level executive' };
      } else if (title.includes('director') || title.includes('vp') || title.includes('manager')) {
        score += 10;
        factors.authority = { score: 10, reason: 'Management level' };
      } else {
        score += 5;
        factors.authority = { score: 5, reason: 'Individual contributor' };
      }
    }

    // Industry Factor (0-10 points)
    const highValueIndustries = ['technology', 'healthcare', 'finance', 'manufacturing'];
    if (lead.industry && highValueIndustries.includes(lead.industry.toLowerCase())) {
      score += 10;
      factors.industry = { score: 10, reason: 'High-value industry' };
    } else {
      score += 5;
      factors.industry = { score: 5, reason: 'Standard industry' };
    }

    // Urgency Factor (0-5 points)
    if (lead.timeline) {
      if (lead.timeline === 'immediate') {
        score += 5;
        factors.urgency = { score: 5, reason: 'Immediate need' };
      } else if (lead.timeline === '1-3 months') {
        score += 3;
        factors.urgency = { score: 3, reason: 'Short-term need' };
      } else {
        score += 1;
        factors.urgency = { score: 1, reason: 'Long-term need' };
      }
    }

    return { score: Math.min(score, 100), factors };
  };

  // Lead Classification
  const classifyLead = (score) => {
    if (score >= 80) return { level: 'Hot', color: 'bg-red-500', priority: 'high' };
    if (score >= 60) return { level: 'Warm', color: 'bg-orange-500', priority: 'medium' };
    if (score >= 40) return { level: 'Cold', color: 'bg-blue-500', priority: 'low' };
    return { level: 'Unqualified', color: 'bg-gray-500', priority: 'very-low' };
  };

  // Smart Routing Algorithm
  const routeLead = (lead, score) => {
    const classification = classifyLead(score);
    
    // Route based on score and characteristics
    if (classification.level === 'Hot') {
      return {
        assignee: 'Senior Sales Rep',
        reason: 'High-value lead requires experienced rep',
        priority: 'immediate',
        followUpTime: '1 hour'
      };
    } else if (classification.level === 'Warm') {
      return {
        assignee: 'Sales Rep',
        reason: 'Qualified lead for standard follow-up',
        priority: 'high',
        followUpTime: '4 hours'
      };
    } else if (classification.level === 'Cold') {
      return {
        assignee: 'Inside Sales',
        reason: 'Nurturing required before sales engagement',
        priority: 'medium',
        followUpTime: '24 hours'
      };
    } else {
      return {
        assignee: 'Marketing',
        reason: 'Lead needs further qualification',
        priority: 'low',
        followUpTime: '1 week'
      };
    }
  };

  // Process leads with AI scoring
  useEffect(() => {
    if (leads.length > 0) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const processedLeads = leads.map(lead => {
          const { score, factors } = calculateLeadScore(lead);
          const classification = classifyLead(score);
          const routing = routeLead(lead, score);
          
          return {
            ...lead,
            aiScore: score,
            scoringFactors: factors,
            classification,
            routing,
            processedAt: new Date().toISOString()
          };
        });

        setQualifiedLeads(processedLeads);
        
        // Calculate metrics
        const metrics = {
          totalLeads: processedLeads.length,
          hotLeads: processedLeads.filter(l => l.classification.level === 'Hot').length,
          warmLeads: processedLeads.filter(l => l.classification.level === 'Warm').length,
          coldLeads: processedLeads.filter(l => l.classification.level === 'Cold').length,
          averageScore: processedLeads.reduce((sum, l) => sum + l.aiScore, 0) / processedLeads.length
        };
        
        setScoringMetrics(metrics);
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [leads]);

  const handleAssignLead = (lead) => {
    if (onRouteAssignment) {
      onRouteAssignment(lead);
    }
  };

  const ScoreBreakdown = ({ factors }) => (
    <div className="space-y-2">
      {Object.entries(factors).map(([key, factor]) => (
        <div key={key} className="flex justify-between items-center text-sm">
          <span className="capitalize text-gray-600">{key}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{factor.score}pts</span>
            <span className="text-xs text-gray-500">{factor.reason}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Lead Qualification</h2>
            <p className="text-gray-600">Intelligent scoring and routing system</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-600">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Analyzing leads...</span>
          </div>
        )}
      </div>

      {/* Metrics Overview */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <AnimatedCounter 
                value={scoringMetrics.totalLeads || 0} 
                className="text-2xl font-bold text-gray-900"
              />
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <AnimatedCounter 
                value={scoringMetrics.hotLeads || 0} 
                className="text-2xl font-bold text-red-600"
              />
            </div>
            <Star className="w-8 h-8 text-red-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warm Leads</p>
              <AnimatedCounter 
                value={scoringMetrics.warmLeads || 0} 
                className="text-2xl font-bold text-orange-600"
              />
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <AnimatedCounter 
                value={Math.round(scoringMetrics.averageScore || 0)} 
                className="text-2xl font-bold text-purple-600"
                suffix="/100"
              />
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </AnimatedCard>
      </StaggerContainer>

      {/* Qualified Leads List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Qualified Leads</h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter by Score
          </Button>
        </div>

        <div className="grid gap-4">
          {qualifiedLeads.map((lead, index) => (
            <AnimatedCard key={lead.id || index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {lead.name || lead.company}
                    </h4>
                    <Badge className={`${lead.classification.color} text-white`}>
                      {lead.classification.level}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{lead.aiScore}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Lead Information</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Company:</span> {lead.company}</p>
                        <p><span className="font-medium">Industry:</span> {lead.industry}</p>
                        <p><span className="font-medium">Size:</span> {lead.companySize} employees</p>
                        <p><span className="font-medium">Budget:</span> ${lead.budget?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">AI Score Breakdown</h5>
                      <ScoreBreakdown factors={lead.scoringFactors} />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Recommended Action</p>
                        <p className="text-sm text-gray-600">
                          Assign to <span className="font-medium">{lead.routing.assignee}</span> - {lead.routing.reason}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Follow-up: {lead.routing.followUpTime}</p>
                        <Badge variant="outline" className={`mt-1 ${
                          lead.routing.priority === 'immediate' ? 'border-red-500 text-red-600' :
                          lead.routing.priority === 'high' ? 'border-orange-500 text-orange-600' :
                          lead.routing.priority === 'medium' ? 'border-blue-500 text-blue-600' :
                          'border-gray-500 text-gray-600'
                        }`}>
                          {lead.routing.priority} priority
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Button 
                    onClick={() => handleAssignLead(lead)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Assign
                  </Button>
                  <Button variant="outline" size="sm">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>

              {/* Score Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">AI Qualification Score</span>
                  <span className="font-medium">{lead.aiScore}/100</span>
                </div>
                <Progress 
                  value={lead.aiScore} 
                  className="h-2"
                  style={{
                    '--progress-background': lead.aiScore >= 80 ? '#ef4444' : 
                                           lead.aiScore >= 60 ? '#f97316' : 
                                           lead.aiScore >= 40 ? '#3b82f6' : '#6b7280'
                  }}
                />
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {qualifiedLeads.length === 0 && !isAnalyzing && (
        <AnimatedCard className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads to Analyze</h3>
          <p className="text-gray-600">Import leads to start AI-powered qualification and scoring.</p>
        </AnimatedCard>
      )}
    </div>
  );
};

export default AILeadQualification;