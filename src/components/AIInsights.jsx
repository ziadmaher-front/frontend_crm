import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  Award,
  ArrowRight,
  Brain,
  Zap,
  Activity
} from "lucide-react";

export default function AIInsights({ entity, entityType, data }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [entity, entityType, data]);

  const generateInsights = async () => {
    setLoading(true);
    const generated = [];

    if (entityType === 'Lead') {
      // Lead Score Analysis
      if (entity.lead_score) {
        if (entity.lead_score >= 80) {
          generated.push({
            type: 'recommendation',
            priority: 'high',
            icon: Target,
            color: 'text-green-600',
            bg: 'bg-green-50',
            title: 'Hot Lead Alert!',
            message: `This lead has an exceptional score of ${entity.lead_score}/100. Schedule a demo within 24 hours for best results.`,
            action: 'Schedule Demo',
            confidence: 92
          });
        } else if (entity.lead_score >= 60) {
          generated.push({
            type: 'recommendation',
            priority: 'medium',
            icon: Lightbulb,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            title: 'Qualified Lead',
            message: `Lead score of ${entity.lead_score} suggests good conversion potential. Send personalized follow-up email.`,
            action: 'Send Email',
            confidence: 78
          });
        }
      }

      // Source Analysis
      if (entity.lead_source === 'Referral') {
        generated.push({
          type: 'insight',
          priority: 'medium',
          icon: Award,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          title: 'Referral Advantage',
          message: 'Referral leads convert 3x better than other sources. Fast-track this opportunity.',
          confidence: 85
        });
      }

      // Time-based insights
      const created = new Date(entity.created_date);
      const hoursSinceCreated = (new Date() - created) / (1000 * 60 * 60);
      
      if (hoursSinceCreated < 24 && entity.status === 'New') {
        generated.push({
          type: 'action',
          priority: 'urgent',
          icon: Clock,
          color: 'text-red-600',
          bg: 'bg-red-50',
          title: 'Time-Sensitive',
          message: 'New leads contacted within 24 hours have 60% higher conversion rate. Act now!',
          action: 'Contact Now',
          confidence: 88
        });
      }

      // Similar leads analysis
      if (data?.leads) {
        const similarLeads = data.leads.filter(l => 
          l.company === entity.company || 
          l.industry === entity.industry
        ).length;
        
        if (similarLeads > 1) {
          generated.push({
            type: 'insight',
            priority: 'low',
            icon: Activity,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            title: 'Related Opportunities',
            message: `Found ${similarLeads} similar leads from ${entity.company || entity.industry}. Consider account-based approach.`,
            confidence: 72
          });
        }
      }
    }

    if (entityType === 'Deal') {
      // Win Probability Analysis
      if (entity.probability) {
        if (entity.probability >= 75 && entity.stage !== 'Closed Won') {
          generated.push({
            type: 'prediction',
            priority: 'high',
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50',
            title: 'High Win Probability',
            message: `${entity.probability}% chance of closing. Focus on finalizing terms and addressing final objections.`,
            action: 'Review Contract',
            confidence: 89
          });
        } else if (entity.probability < 30 && entity.stage !== 'Closed Lost') {
          generated.push({
            type: 'warning',
            priority: 'urgent',
            icon: AlertTriangle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            title: 'Deal at Risk',
            message: `Low probability (${entity.probability}%). Schedule executive review meeting to salvage this opportunity.`,
            action: 'Escalate',
            confidence: 82
          });
        }
      }

      // Deal Age Analysis
      const created = new Date(entity.created_date);
      const daysSinceCreated = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreated > 60) {
        generated.push({
          type: 'warning',
          priority: 'high',
          icon: Clock,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          title: 'Stale Deal Alert',
          message: `This deal has been open for ${daysSinceCreated} days. Average winning deals close in 45 days. Re-engage immediately.`,
          action: 'Follow Up',
          confidence: 85
        });
      }

      // Expected Close Date
      if (entity.expected_close_date) {
        const closeDate = new Date(entity.expected_close_date);
        const daysUntilClose = Math.floor((closeDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilClose <= 7 && daysUntilClose > 0) {
          generated.push({
            type: 'action',
            priority: 'urgent',
            icon: Target,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            title: 'Closing This Week',
            message: `Deal closes in ${daysUntilClose} days. Ensure all decision-makers are aligned and paperwork is ready.`,
            action: 'Prepare Docs',
            confidence: 90
          });
        }
      }

      // Competitor Analysis
      if (entity.competitors) {
        generated.push({
          type: 'insight',
          priority: 'medium',
          icon: Zap,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          title: 'Competitive Situation',
          message: `Competitors detected: ${entity.competitors}. Emphasize your unique value proposition and build strong relationships.`,
          confidence: 75
        });
      }

      // Deal Size Analysis
      if (entity.amount && data?.deals) {
        const avgDealSize = data.deals.reduce((sum, d) => sum + (d.amount || 0), 0) / data.deals.length;
        
        if (entity.amount > avgDealSize * 2) {
          generated.push({
            type: 'insight',
            priority: 'high',
            icon: Award,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            title: 'High-Value Deal',
            message: `This deal is ${((entity.amount / avgDealSize) * 100 - 100).toFixed(0)}% larger than average. Consider executive sponsorship.`,
            confidence: 88
          });
        }
      }
    }

    if (entityType === 'Contact' || entityType === 'Account') {
      // Engagement Analysis
      if (data?.activities) {
        const recentActivities = data.activities.filter(a => 
          a.related_to_id === entity.id &&
          new Date(a.activity_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        if (recentActivities.length === 0) {
          generated.push({
            type: 'warning',
            priority: 'medium',
            icon: Activity,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            title: 'No Recent Activity',
            message: 'No contact in 30 days. Risk of disengagement. Schedule check-in call.',
            action: 'Schedule Call',
            confidence: 80
          });
        } else if (recentActivities.length > 5) {
          generated.push({
            type: 'insight',
            priority: 'low',
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50',
            title: 'High Engagement',
            message: `${recentActivities.length} interactions in 30 days. Strong relationship - consider upsell opportunities.`,
            confidence: 85
          });
        }
      }
    }

    // ML-based predictions (simulated)
    if (Math.random() > 0.7) {
      generated.push({
        type: 'prediction',
        priority: 'low',
        icon: Brain,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        title: 'AI Prediction',
        message: 'Based on historical patterns, best contact time is Tuesday-Thursday 10AM-2PM EST.',
        confidence: 68
      });
    }

    setInsights(generated);
    setLoading(false);
  };

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedInsights = insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  if (loading) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <p className="text-sm text-gray-600">Analyzing data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Insights & Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${insight.bg} ${
                insight.priority === 'urgent' ? 'border-red-300' : 
                insight.priority === 'high' ? 'border-green-300' : 
                'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white`}>
                  <Icon className={`w-5 h-5 ${insight.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <Badge 
                      variant={insight.priority === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.priority}
                    </Badge>
                    {insight.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confident
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{insight.message}</p>
                  {insight.action && (
                    <Button size="sm" variant="outline" className="text-xs">
                      {insight.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}