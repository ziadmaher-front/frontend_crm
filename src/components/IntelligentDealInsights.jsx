import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Target,
  Brain,
  Lightbulb,
  Calendar,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';
import { AnimatedCard, AnimatedCounter, StaggerContainer } from '@/components/MicroInteractions';

const IntelligentDealInsights = ({ deals = [], onDealUpdate, onActionTaken }) => {
  const [dealAnalytics, setDealAnalytics] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // AI Risk Assessment Algorithm
  const assessDealRisk = (deal) => {
    let riskScore = 0;
    const riskFactors = [];

    // Time-based risk factors
    const daysInStage = deal.daysInCurrentStage || 0;
    const expectedStageTime = getExpectedStageTime(deal.stage);
    
    if (daysInStage > expectedStageTime * 1.5) {
      riskScore += 30;
      riskFactors.push({
        factor: 'Stalled Deal',
        impact: 'high',
        description: `Deal has been in ${deal.stage} for ${daysInStage} days (expected: ${expectedStageTime})`
      });
    }

    // Value-based risk factors
    if (deal.value > 100000 && !deal.decisionMaker) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Missing Decision Maker',
        impact: 'high',
        description: 'High-value deal without identified decision maker'
      });
    }

    // Competition risk
    if (deal.competitors && deal.competitors.length > 2) {
      riskScore += 20;
      riskFactors.push({
        factor: 'High Competition',
        impact: 'medium',
        description: `${deal.competitors.length} competitors identified`
      });
    }

    // Budget risk
    if (deal.budget && deal.value > deal.budget * 1.2) {
      riskScore += 25;
      riskFactors.push({
        factor: 'Budget Mismatch',
        impact: 'high',
        description: 'Deal value exceeds customer budget by 20%+'
      });
    }

    // Engagement risk
    const daysSinceLastContact = deal.daysSinceLastContact || 0;
    if (daysSinceLastContact > 14) {
      riskScore += 15;
      riskFactors.push({
        factor: 'Low Engagement',
        impact: 'medium',
        description: `No contact for ${daysSinceLastContact} days`
      });
    }

    // Probability vs Stage mismatch
    const expectedProbability = getExpectedProbability(deal.stage);
    if (deal.probability < expectedProbability - 20) {
      riskScore += 20;
      riskFactors.push({
        factor: 'Low Confidence',
        impact: 'medium',
        description: 'Probability below expected for current stage'
      });
    }

    return {
      score: Math.min(riskScore, 100),
      level: getRiskLevel(riskScore),
      factors: riskFactors
    };
  };

  // Generate AI Recommendations
  const generateRecommendations = (deal, riskAssessment) => {
    const recommendations = [];

    // Risk-based recommendations
    riskAssessment.factors.forEach(factor => {
      switch (factor.factor) {
        case 'Stalled Deal':
          recommendations.push({
            type: 'urgent',
            action: 'Schedule Follow-up',
            description: 'Reach out to re-engage and understand current status',
            priority: 'high',
            estimatedImpact: '+15% close probability'
          });
          break;
        case 'Missing Decision Maker':
          recommendations.push({
            type: 'strategic',
            action: 'Identify Decision Maker',
            description: 'Map organizational structure and identify key stakeholders',
            priority: 'high',
            estimatedImpact: '+25% close probability'
          });
          break;
        case 'High Competition':
          recommendations.push({
            type: 'competitive',
            action: 'Competitive Analysis',
            description: 'Prepare competitive battlecard and differentiation strategy',
            priority: 'medium',
            estimatedImpact: '+10% close probability'
          });
          break;
        case 'Budget Mismatch':
          recommendations.push({
            type: 'pricing',
            action: 'Adjust Proposal',
            description: 'Consider value-based pricing or phased implementation',
            priority: 'high',
            estimatedImpact: '+20% close probability'
          });
          break;
        case 'Low Engagement':
          recommendations.push({
            type: 'engagement',
            action: 'Re-engagement Campaign',
            description: 'Send personalized content and schedule check-in call',
            priority: 'medium',
            estimatedImpact: '+12% close probability'
          });
          break;
      }
    });

    // Stage-based recommendations
    switch (deal.stage) {
      case 'Prospecting':
        recommendations.push({
          type: 'process',
          action: 'Qualify Lead',
          description: 'Conduct discovery call to understand needs and budget',
          priority: 'high',
          estimatedImpact: 'Move to next stage'
        });
        break;
      case 'Qualification':
        recommendations.push({
          type: 'process',
          action: 'Needs Analysis',
          description: 'Deep dive into requirements and pain points',
          priority: 'high',
          estimatedImpact: 'Move to next stage'
        });
        break;
      case 'Proposal':
        recommendations.push({
          type: 'process',
          action: 'Follow-up on Proposal',
          description: 'Schedule proposal review meeting with stakeholders',
          priority: 'high',
          estimatedImpact: '+30% close probability'
        });
        break;
    }

    // Value-based recommendations
    if (deal.value > 50000) {
      recommendations.push({
        type: 'strategic',
        action: 'Executive Sponsor',
        description: 'Engage executive sponsor for high-value deal',
        priority: 'medium',
        estimatedImpact: '+18% close probability'
      });
    }

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  };

  // Helper functions
  const getExpectedStageTime = (stage) => {
    const stageTimes = {
      'Prospecting': 7,
      'Qualification': 14,
      'Needs Analysis': 21,
      'Proposal': 14,
      'Negotiation': 10,
      'Closed Won': 0,
      'Closed Lost': 0
    };
    return stageTimes[stage] || 14;
  };

  const getExpectedProbability = (stage) => {
    const stageProbabilities = {
      'Prospecting': 10,
      'Qualification': 25,
      'Needs Analysis': 50,
      'Proposal': 75,
      'Negotiation': 90,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    return stageProbabilities[stage] || 50;
  };

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'High', color: 'bg-red-500', textColor: 'text-red-600' };
    if (score >= 40) return { level: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { level: 'Low', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'strategic': return <Target className="w-4 h-4 text-blue-500" />;
      case 'competitive': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'pricing': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'engagement': return <Users className="w-4 h-4 text-orange-500" />;
      case 'process': return <ArrowRight className="w-4 h-4 text-indigo-500" />;
      default: return <Lightbulb className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Process deals with AI analysis
  useEffect(() => {
    if (deals.length > 0) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const analytics = deals.map(deal => {
          const risk = assessDealRisk(deal);
          const recs = generateRecommendations(deal, risk);
          
          return {
            ...deal,
            riskAssessment: risk,
            recommendations: recs,
            aiScore: 100 - risk.score, // Inverse of risk
            processedAt: new Date().toISOString()
          };
        });

        setDealAnalytics(analytics);
        setIsAnalyzing(false);
      }, 2000);
    }
  }, [deals]);

  const handleTakeAction = (deal, recommendation) => {
    if (onActionTaken) {
      onActionTaken(deal, recommendation);
    }
  };

  const RiskIndicator = ({ risk }) => (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${risk.level.color}`}></div>
      <span className={`font-medium ${risk.level.textColor}`}>{risk.level.level} Risk</span>
      <span className="text-sm text-gray-500">({risk.score}/100)</span>
    </div>
  );

  const RecommendationCard = ({ recommendation, deal }) => (
    <div className="p-3 border rounded-lg bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          {getRecommendationIcon(recommendation.type)}
          <div className="flex-1">
            <h5 className="font-medium text-gray-900">{recommendation.action}</h5>
            <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className={`text-xs ${
                recommendation.priority === 'high' ? 'border-red-500 text-red-600' :
                recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                'border-green-500 text-green-600'
              }`}>
                {recommendation.priority} priority
              </Badge>
              <span className="text-xs text-green-600 font-medium">
                {recommendation.estimatedImpact}
              </span>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={() => handleTakeAction(deal, recommendation)}
          className="ml-2"
        >
          Take Action
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Intelligent Deal Insights</h2>
            <p className="text-gray-600">AI-powered risk assessment and recommendations</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-600">
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Analyzing deals...</span>
          </div>
        )}
      </div>

      {/* Deal Analytics */}
      <div className="space-y-4">
        {dealAnalytics.map((deal, index) => (
          <AnimatedCard key={deal.id || index} className="p-6">
            <div className="space-y-4">
              {/* Deal Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{deal.name}</h3>
                    <Badge className="bg-blue-100 text-blue-800">{deal.stage}</Badge>
                    <RiskIndicator risk={deal.riskAssessment} />
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${deal.value?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {deal.probability}% probability
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Close: {deal.expectedCloseDate}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{deal.aiScore}/100</div>
                  <div className="text-sm text-gray-600">AI Score</div>
                </div>
              </div>

              {/* Risk Factors */}
              {deal.riskAssessment.factors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risk Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {deal.riskAssessment.factors.map((factor, idx) => (
                      <Alert key={idx} className={`border-l-4 ${
                        factor.impact === 'high' ? 'border-l-red-500' : 
                        factor.impact === 'medium' ? 'border-l-yellow-500' : 
                        'border-l-blue-500'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <span className="font-medium">{factor.factor}:</span> {factor.description}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deal.recommendations.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} deal={deal} />
                  ))}
                </div>
              </div>

              {/* Deal Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Deal Health Score</span>
                  <span className="font-medium">{deal.aiScore}/100</span>
                </div>
                <Progress 
                  value={deal.aiScore} 
                  className="h-2"
                  style={{
                    '--progress-background': deal.aiScore >= 80 ? '#10b981' : 
                                           deal.aiScore >= 60 ? '#f59e0b' : 
                                           deal.aiScore >= 40 ? '#ef4444' : '#6b7280'
                  }}
                />
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {dealAnalytics.length === 0 && !isAnalyzing && (
        <AnimatedCard className="p-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Deals to Analyze</h3>
          <p className="text-gray-600">Add deals to your pipeline to get AI-powered insights and recommendations.</p>
        </AnimatedCard>
      )}
    </div>
  );
};

export default IntelligentDealInsights;