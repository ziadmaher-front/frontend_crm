import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Bot,
  Target,
  Users,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Filter,
  Search,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Database,
  MessageSquare,
  Phone,
  FileText,
  Code,
  Timer,
  Activity,
  Lightbulb,
  Cpu,
  Network,
  Workflow,
  Layers,
  Gauge,
  Sparkles,
  Rocket,
  Shield,
  Award,
  Star,
  Flame,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

const IntelligentWorkflowEngine = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [workflowMetrics, setWorkflowMetrics] = useState({});
  const [mlModels, setMlModels] = useState({});

  // Enhanced workflow data with ML capabilities
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'AI-Powered Lead Qualification',
      description: 'Machine learning-based lead scoring and intelligent routing',
      status: 'active',
      category: 'Lead Management',
      complexity: 'high',
      aiEnabled: true,
      mlModel: 'lead_scoring_v2',
      trigger: 'New Lead Created',
      lastRun: '2 minutes ago',
      executions: 2847,
      successRate: 96.8,
      avgExecutionTime: '0.9s',
      created: '2024-01-15',
      aiAccuracy: 94.2,
      learningRate: 0.85,
      confidenceThreshold: 0.8,
      steps: [
        { id: 1, type: 'trigger', name: 'New Lead Created', icon: Users, aiEnhanced: false },
        { id: 2, type: 'ml_analysis', name: 'ML Lead Scoring', icon: Brain, aiEnhanced: true },
        { id: 3, type: 'condition', name: 'Score Threshold Check', icon: Filter, aiEnhanced: true },
        { id: 4, type: 'ai_routing', name: 'Intelligent Assignment', icon: Target, aiEnhanced: true },
        { id: 5, type: 'action', name: 'Personalized Email', icon: Mail, aiEnhanced: true },
        { id: 6, type: 'ml_prediction', name: 'Predict Next Action', icon: Sparkles, aiEnhanced: true }
      ],
      mlFeatures: [
        'lead_source', 'company_size', 'industry', 'engagement_score', 
        'website_behavior', 'email_interactions', 'social_signals'
      ],
      performanceMetrics: {
        conversionRate: 24.8,
        avgDealSize: 15200,
        timeToConversion: 18,
        qualityScore: 8.7
      }
    },
    {
      id: 2,
      name: 'Smart Deal Progression',
      description: 'AI-driven deal stage automation with predictive insights',
      status: 'active',
      category: 'Sales Pipeline',
      complexity: 'high',
      aiEnabled: true,
      mlModel: 'deal_progression_v1',
      trigger: 'Deal Stage Changed',
      lastRun: '8 minutes ago',
      executions: 1923,
      successRate: 98.4,
      avgExecutionTime: '1.2s',
      created: '2024-01-10',
      aiAccuracy: 91.7,
      learningRate: 0.78,
      confidenceThreshold: 0.75,
      steps: [
        { id: 1, type: 'trigger', name: 'Deal Stage Changed', icon: Target, aiEnhanced: false },
        { id: 2, type: 'ml_analysis', name: 'Analyze Deal Health', icon: Brain, aiEnhanced: true },
        { id: 3, type: 'ai_prediction', name: 'Predict Closure Probability', icon: TrendingUp, aiEnhanced: true },
        { id: 4, type: 'condition', name: 'Risk Assessment', icon: AlertTriangle, aiEnhanced: true },
        { id: 5, type: 'ai_action', name: 'Smart Recommendations', icon: Lightbulb, aiEnhanced: true },
        { id: 6, type: 'action', name: 'Automated Follow-up', icon: Calendar, aiEnhanced: true }
      ],
      mlFeatures: [
        'deal_value', 'stage_duration', 'contact_frequency', 'competitor_presence',
        'decision_maker_engagement', 'proposal_response_time', 'meeting_attendance'
      ],
      performanceMetrics: {
        closureRate: 67.3,
        avgSalesCycle: 45,
        revenueImpact: 2.4,
        accuracyScore: 9.1
      }
    },
    {
      id: 3,
      name: 'Intelligent Customer Onboarding',
      description: 'Adaptive onboarding sequences based on customer behavior',
      status: 'active',
      category: 'Customer Success',
      complexity: 'medium',
      aiEnabled: true,
      mlModel: 'onboarding_optimizer_v1',
      trigger: 'Deal Won',
      lastRun: '1 hour ago',
      executions: 456,
      successRate: 93.2,
      avgExecutionTime: '2.8s',
      created: '2024-01-08',
      aiAccuracy: 88.9,
      learningRate: 0.72,
      confidenceThreshold: 0.7,
      steps: [
        { id: 1, type: 'trigger', name: 'Deal Won', icon: CheckCircle, aiEnhanced: false },
        { id: 2, type: 'ml_analysis', name: 'Customer Profiling', icon: Brain, aiEnhanced: true },
        { id: 3, type: 'ai_personalization', name: 'Customize Journey', icon: Users, aiEnhanced: true },
        { id: 4, type: 'action', name: 'Welcome Package', icon: Mail, aiEnhanced: true },
        { id: 5, type: 'ml_timing', name: 'Optimal Timing', icon: Clock, aiEnhanced: true },
        { id: 6, type: 'ai_monitoring', name: 'Progress Tracking', icon: Activity, aiEnhanced: true }
      ],
      mlFeatures: [
        'customer_segment', 'product_complexity', 'team_size', 'technical_expertise',
        'implementation_timeline', 'support_requirements', 'success_metrics'
      ],
      performanceMetrics: {
        completionRate: 89.4,
        timeToValue: 12,
        satisfactionScore: 4.6,
        retentionRate: 94.8
      }
    },
    {
      id: 4,
      name: 'Predictive Support Escalation',
      description: 'AI-powered ticket routing and escalation prediction',
      status: 'active',
      category: 'Customer Support',
      complexity: 'medium',
      aiEnabled: true,
      mlModel: 'support_classifier_v2',
      trigger: 'Support Ticket Created',
      lastRun: '3 minutes ago',
      executions: 1834,
      successRate: 97.6,
      avgExecutionTime: '0.6s',
      created: '2024-01-20',
      aiAccuracy: 92.8,
      learningRate: 0.81,
      confidenceThreshold: 0.85,
      steps: [
        { id: 1, type: 'trigger', name: 'Ticket Created', icon: AlertTriangle, aiEnhanced: false },
        { id: 2, type: 'ml_classification', name: 'Classify Issue', icon: Brain, aiEnhanced: true },
        { id: 3, type: 'ai_priority', name: 'Smart Prioritization', icon: Target, aiEnhanced: true },
        { id: 4, type: 'ai_routing', name: 'Expert Assignment', icon: Users, aiEnhanced: true },
        { id: 5, type: 'ml_prediction', name: 'Escalation Risk', icon: TrendingUp, aiEnhanced: true },
        { id: 6, type: 'action', name: 'Proactive Response', icon: MessageSquare, aiEnhanced: true }
      ],
      mlFeatures: [
        'issue_category', 'customer_tier', 'urgency_keywords', 'historical_interactions',
        'product_version', 'complexity_score', 'sentiment_analysis'
      ],
      performanceMetrics: {
        resolutionTime: 4.2,
        firstContactResolution: 78.9,
        customerSatisfaction: 4.7,
        escalationReduction: 34.6
      }
    }
  ]);

  // AI-powered workflow recommendations
  const generateAiRecommendations = useCallback(() => {
    const recommendations = [
      {
        id: 1,
        type: 'optimization',
        title: 'Optimize Lead Scoring Model',
        description: 'Your lead scoring accuracy can be improved by 12% with additional behavioral data',
        impact: 'high',
        confidence: 87,
        workflowId: 1,
        action: 'Add website engagement tracking',
        estimatedImprovement: '+12% accuracy',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        id: 2,
        type: 'automation',
        title: 'Automate Follow-up Sequences',
        description: 'Create intelligent follow-up workflows based on customer engagement patterns',
        impact: 'medium',
        confidence: 92,
        workflowId: null,
        action: 'Create new workflow',
        estimatedImprovement: '+23% response rate',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      },
      {
        id: 3,
        type: 'prediction',
        title: 'Implement Churn Prediction',
        description: 'Predict customer churn risk and trigger retention workflows automatically',
        impact: 'high',
        confidence: 89,
        workflowId: null,
        action: 'Deploy ML model',
        estimatedImprovement: '+15% retention',
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        id: 4,
        type: 'enhancement',
        title: 'Enhance Deal Progression AI',
        description: 'Improve deal closure predictions with competitor analysis data',
        impact: 'medium',
        confidence: 84,
        workflowId: 2,
        action: 'Update model features',
        estimatedImprovement: '+8% prediction accuracy',
        icon: Target,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    ];
    setAiRecommendations(recommendations);
  }, []);

  // ML model performance metrics
  const mlModelMetrics = {
    lead_scoring_v2: {
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.6,
      f1Score: 90.7,
      trainingData: 15420,
      lastTrained: '2024-01-22',
      version: '2.1.3',
      features: 23,
      performance: 'excellent'
    },
    deal_progression_v1: {
      accuracy: 91.7,
      precision: 88.9,
      recall: 87.3,
      f1Score: 88.1,
      trainingData: 8934,
      lastTrained: '2024-01-20',
      version: '1.4.2',
      features: 18,
      performance: 'good'
    },
    onboarding_optimizer_v1: {
      accuracy: 88.9,
      precision: 86.4,
      recall: 85.1,
      f1Score: 85.7,
      trainingData: 3456,
      lastTrained: '2024-01-18',
      version: '1.2.1',
      features: 15,
      performance: 'good'
    },
    support_classifier_v2: {
      accuracy: 92.8,
      precision: 90.2,
      recall: 89.7,
      f1Score: 89.9,
      trainingData: 12678,
      lastTrained: '2024-01-21',
      version: '2.0.4',
      features: 20,
      performance: 'excellent'
    }
  };

  // Workflow analytics data
  const workflowAnalytics = useMemo(() => {
    const totalExecutions = workflows.reduce((sum, w) => sum + w.executions, 0);
    const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;
    const aiEnabledWorkflows = workflows.filter(w => w.aiEnabled).length;
    const avgAiAccuracy = workflows
      .filter(w => w.aiEnabled)
      .reduce((sum, w) => sum + w.aiAccuracy, 0) / aiEnabledWorkflows;

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.status === 'active').length,
      aiEnabledWorkflows,
      totalExecutions,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      avgAiAccuracy: avgAiAccuracy.toFixed(1),
      executionsToday: 2847,
      executionsThisWeek: 18934,
      timeSaved: '342 hours',
      errorRate: 1.8,
      aiImprovementRate: 23.4,
      mlModelAccuracy: 91.9
    };
  }, [workflows]);

  // Performance trend data
  const performanceTrendData = [
    { month: 'Jan', traditional: 78, aiEnhanced: 89, mlAccuracy: 87 },
    { month: 'Feb', traditional: 82, aiEnhanced: 92, mlAccuracy: 89 },
    { month: 'Mar', traditional: 79, aiEnhanced: 94, mlAccuracy: 91 },
    { month: 'Apr', traditional: 85, aiEnhanced: 96, mlAccuracy: 93 },
    { month: 'May', traditional: 83, aiEnhanced: 97, mlAccuracy: 94 },
    { month: 'Jun', traditional: 87, aiEnhanced: 98, mlAccuracy: 95 }
  ];

  // Workflow execution data
  const executionData = [
    { time: '00:00', executions: 45, success: 43, ai: 28 },
    { time: '04:00', executions: 23, success: 22, ai: 15 },
    { time: '08:00', executions: 156, success: 151, ai: 98 },
    { time: '12:00', executions: 234, success: 228, ai: 145 },
    { time: '16:00', executions: 189, success: 184, ai: 112 },
    { time: '20:00', executions: 98, success: 95, ai: 67 }
  ];

  // AI model distribution
  const aiModelDistribution = [
    { name: 'Lead Scoring', value: 35, color: '#8b5cf6' },
    { name: 'Deal Prediction', value: 28, color: '#3b82f6' },
    { name: 'Customer Classification', value: 22, color: '#10b981' },
    { name: 'Support Routing', value: 15, color: '#f59e0b' }
  ];

  useEffect(() => {
    generateAiRecommendations();
  }, [generateAiRecommendations]);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow => {
      const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workflow.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [workflows, searchQuery, filterStatus, filterCategory]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleWorkflowAction = (workflowId, action) => {
    setLoading(true);
    setTimeout(() => {
      console.log(`${action} workflow ${workflowId}`);
      setLoading(false);
    }, 1000);
  };

  const handleImplementRecommendation = (recommendationId) => {
    setLoading(true);
    setTimeout(() => {
      setAiRecommendations(prev => 
        prev.filter(rec => rec.id !== recommendationId)
      );
      setLoading(false);
    }, 2000);
  };

  const EnhancedWorkflowCard = ({ workflow }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all duration-200 relative overflow-hidden">
        {workflow.aiEnabled && (
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-10 rounded-full -mr-10 -mt-10"></div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{workflow.name}</h3>
                <Badge className={getStatusColor(workflow.status)}>
                  {workflow.status}
                </Badge>
                <Badge variant="outline" className={getComplexityColor(workflow.complexity)}>
                  {workflow.complexity}
                </Badge>
                {workflow.aiEnabled && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Category: {workflow.category}</span>
                <span>•</span>
                <span>Model: {workflow.mlModel}</span>
                <span>•</span>
                <span>Created: {workflow.created}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Executions</div>
              <div className="font-semibold">{workflow.executions.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Success Rate</div>
              <div className="font-semibold text-green-600">{workflow.successRate}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">AI Accuracy</div>
              <div className="font-semibold text-purple-600">{workflow.aiAccuracy}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Avg Time</div>
              <div className="font-semibold">{workflow.avgExecutionTime}</div>
            </div>
          </div>

          {workflow.aiEnabled && (
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">AI Performance</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  Learning Rate: {workflow.learningRate}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Confidence: </span>
                  <span className="font-medium">{(workflow.confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Features: </span>
                  <span className="font-medium">{workflow.mlFeatures.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="h-4 w-4" />
              <span>Trigger: {workflow.trigger}</span>
            </div>
            <div className="flex gap-2">
              {workflow.status === 'active' ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleWorkflowAction(workflow.id, 'pause')}
                  disabled={loading}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => handleWorkflowAction(workflow.id, 'activate')}
                  disabled={loading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Activate
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AiRecommendationCard = ({ recommendation }) => {
    const { icon: Icon, color, bgColor } = recommendation;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="cursor-pointer"
      >
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <h4 className="font-medium">{recommendation.title}</h4>
                  <Badge className={getImpactColor(recommendation.impact)} variant="secondary">
                    {recommendation.impact} impact
                  </Badge>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {recommendation.confidence}% confidence
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-500">Expected: </span>
                <span className="font-medium text-green-600">{recommendation.estimatedImprovement}</span>
              </div>
              <Button 
                size="sm" 
                onClick={() => handleImplementRecommendation(recommendation.id)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Implement
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Intelligent Workflow Engine</h2>
            <p className="text-gray-600">AI-powered automation with machine learning capabilities</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Models
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="ml-models" className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span>ML Models</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Workflows</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.totalWorkflows}</p>
                  </div>
                  <Workflow className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI-Enabled</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.aiEnabledWorkflows}</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.avgSuccessRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Accuracy</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.avgAiAccuracy}%</p>
                  </div>
                  <Target className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="traditional" stroke="#6b7280" name="Traditional" />
                      <Line type="monotone" dataKey="aiEnhanced" stroke="#8b5cf6" name="AI Enhanced" strokeWidth={2} />
                      <Line type="monotone" dataKey="mlAccuracy" stroke="#3b82f6" name="ML Accuracy" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Model Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aiModelDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {aiModelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Execution Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={executionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="executions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="success" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="ai" stackId="3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Lead Management">Lead Management</SelectItem>
                  <SelectItem value="Sales Pipeline">Sales Pipeline</SelectItem>
                  <SelectItem value="Customer Success">Customer Success</SelectItem>
                  <SelectItem value="Customer Support">Customer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filteredWorkflows.length} workflows found
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map((workflow) => (
              <EnhancedWorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
              <p className="text-sm text-gray-600">Intelligent suggestions to optimize your workflows</p>
            </div>
            <Button variant="outline" size="sm" onClick={generateAiRecommendations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiRecommendations.map((recommendation) => (
              <AiRecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <span>Smart Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Performance Boost</span>
                  </div>
                  <p className="text-sm text-gray-600">AI-enhanced workflows show 23.4% better performance than traditional ones</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Time Savings</span>
                  </div>
                  <p className="text-sm text-gray-600">Automated workflows have saved 342 hours this month</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">ML Accuracy</span>
                  </div>
                  <p className="text-sm text-gray-600">Machine learning models maintain 91.9% average accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ml-models" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Machine Learning Models</h3>
              <p className="text-sm text-gray-600">Monitor and manage AI model performance</p>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Deploy Model
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(mlModelMetrics).map(([modelName, metrics]) => (
              <Card key={modelName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      <span>{modelName.replace(/_/g, ' ').toUpperCase()}</span>
                    </CardTitle>
                    <Badge className={`${getPerformanceColor(metrics.performance)} bg-opacity-10`}>
                      {metrics.performance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                        <div className="text-xl font-bold">{metrics.accuracy}%</div>
                        <Progress value={metrics.accuracy} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">F1 Score</div>
                        <div className="text-xl font-bold">{metrics.f1Score}%</div>
                        <Progress value={metrics.f1Score} className="h-2 mt-1" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Version: </span>
                        <span className="font-medium">{metrics.version}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Features: </span>
                        <span className="font-medium">{metrics.features}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Training Data: </span>
                        <span className="font-medium">{metrics.trainingData.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Trained: </span>
                        <span className="font-medium">{metrics.lastTrained}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retrain
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.totalExecutions.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.timeSaved}</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold">{workflowAnalytics.errorRate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">AI Improvement</p>
                    <p className="text-2xl font-bold">+{workflowAnalytics.aiImprovementRate}%</p>
                  </div>
                  <Rocket className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="traditional" fill="#6b7280" name="Traditional Workflows" />
                    <Bar dataKey="aiEnhanced" fill="#8b5cf6" name="AI-Enhanced Workflows" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentWorkflowEngine;