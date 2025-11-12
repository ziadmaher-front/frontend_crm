import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Zap,
  Eye,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw,
  Bell,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Lightbulb,
  MessageSquare,
  Workflow,
  Shield,
  Globe,
  Smartphone
} from "lucide-react";
import { useEnhancedDashboardAnalytics } from '@/hooks/useEnhancedBusinessLogic';
import { useAILeadScoring, useAIDealInsights, useSalesForecasting } from '@/hooks/useAIFeatures';
import { cn } from '@/lib/utils';

// AI-Powered Widget Components
const AIInsightWidget = ({ insight, priority = 'medium' }) => {
  const priorityColors = {
    high: 'bg-red-500/10 border-red-500/20 text-red-700',
    medium: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700',
    low: 'bg-green-500/10 border-green-500/20 text-green-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-lg border-2 backdrop-blur-sm",
        priorityColors[priority]
      )}
    >
      <div className="flex items-start gap-3">
        <Brain className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
          <p className="text-xs opacity-80">{insight.description}</p>
          {insight.action && (
            <Button size="sm" variant="ghost" className="mt-2 h-6 px-2 text-xs">
              {insight.action}
            </Button>
          )}
        </div>
        <Badge variant="outline" className="text-xs">
          {insight.confidence}% confident
        </Badge>
      </div>
    </motion.div>
  );
};

const SmartMetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  prediction,
  gradient = "from-blue-500 to-purple-600"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={cn(
        "border-none shadow-lg hover:shadow-xl transition-all duration-300",
        `bg-gradient-to-br ${gradient}`
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <p className="text-sm font-medium opacity-90">{title}</p>
              <CardTitle className="text-3xl font-bold mt-2">
                <motion.span
                  key={value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {value}
                </motion.span>
              </CardTitle>
              {change && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className={cn(
                    "w-4 h-4",
                    trend === 'up' ? 'text-green-300' : 'text-red-300'
                  )} />
                  <span className="text-sm opacity-80">{change}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <h4 className="text-white font-semibold text-sm mb-2">AI Prediction</h4>
                  <p className="text-white/80 text-xs">{prediction}</p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const AdaptiveLayoutGrid = ({ children, layout = 'default' }) => {
  const layouts = {
    default: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    compact: "grid-cols-2 lg:grid-cols-6",
    focus: "grid-cols-1 lg:grid-cols-3"
  };

  return (
    <motion.div
      layout
      className={cn("grid gap-6", layouts[layout])}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

const RealTimeActivityFeed = () => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'lead_qualified',
      message: 'New qualified lead: TechCorp Solutions',
      timestamp: new Date(),
      priority: 'high',
      icon: Target
    },
    {
      id: 2,
      type: 'deal_won',
      message: 'Deal closed: $50,000 with Innovate Inc.',
      timestamp: new Date(Date.now() - 300000),
      priority: 'high',
      icon: Award
    },
    {
      id: 3,
      type: 'ai_insight',
      message: 'AI detected opportunity in Enterprise segment',
      timestamp: new Date(Date.now() - 600000),
      priority: 'medium',
      icon: Brain
    }
  ]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Real-Time Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={cn(
                "p-2 rounded-full",
                activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              )}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-gray-500">
                  {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

const AIRecommendationPanel = () => {
  const recommendations = [
    {
      id: 1,
      title: "Optimize Lead Follow-up",
      description: "AI suggests contacting 5 warm leads within 2 hours for 40% higher conversion",
      action: "View Leads",
      confidence: 87,
      priority: 'high'
    },
    {
      id: 2,
      title: "Price Adjustment Opportunity",
      description: "Market analysis suggests 15% price increase for Enterprise tier",
      action: "Review Pricing",
      confidence: 73,
      priority: 'medium'
    },
    {
      id: 3,
      title: "Cross-sell Opportunity",
      description: "3 existing customers show high propensity for premium features",
      action: "Create Campaign",
      confidence: 91,
      priority: 'high'
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          AI Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <AIInsightWidget key={rec.id} insight={rec} priority={rec.priority} />
        ))}
      </CardContent>
    </Card>
  );
};

export const IntelligentDashboard = () => {
  const [layout, setLayout] = useState('default');
  const [refreshing, setRefreshing] = useState(false);
  const { data: businessData, isLoading } = useEnhancedDashboardAnalytics();
  const leadScoring = useAILeadScoring();
  const dealInsights = useAIDealInsights();
  const forecasting = useSalesForecasting();
  
  // Combine AI insights for compatibility
  const aiInsights = leadScoring.insights || [];
  const predictions = forecasting.predictions || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const metrics = useMemo(() => [
    {
      title: "Revenue",
      value: "$2.4M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      prediction: "Projected to reach $2.8M by month-end based on current pipeline velocity",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Active Leads",
      value: "1,247",
      change: "+8.3%",
      trend: "up",
      icon: Users,
      prediction: "AI identifies 156 high-probability leads requiring immediate attention",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      title: "Conversion Rate",
      value: "24.8%",
      change: "+3.2%",
      trend: "up",
      icon: Target,
      prediction: "Optimization suggestions could improve rate to 28% within 30 days",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "AI Score",
      value: "94/100",
      change: "+2 pts",
      trend: "up",
      icon: Brain,
      prediction: "System performance excellent. Minor optimizations available in lead scoring",
      gradient: "from-orange-500 to-red-600"
    }
  ], []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Intelligent Dashboard
          </h1>
          <p className="text-gray-600 mt-1">AI-powered insights and real-time analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
          
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="default">Default Layout</option>
            <option value="compact">Compact Layout</option>
            <option value="focus">Focus Layout</option>
          </select>
        </div>
      </motion.div>

      {/* Smart Metrics */}
      <AdaptiveLayoutGrid layout={layout}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SmartMetricCard {...metric} />
          </motion.div>
        ))}
      </AdaptiveLayoutGrid>

      {/* AI Insights and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AIRecommendationPanel />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RealTimeActivityFeed />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { icon: Users, label: "Add Lead", color: "bg-blue-500" },
                { icon: Calendar, label: "Schedule", color: "bg-green-500" },
                { icon: MessageSquare, label: "Send Email", color: "bg-purple-500" },
                { icon: BarChart3, label: "Analytics", color: "bg-orange-500" },
                { icon: Workflow, label: "Automation", color: "bg-pink-500" },
                { icon: Settings, label: "Settings", color: "bg-gray-500" }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:shadow-md transition-all"
                >
                  <div className={cn("p-3 rounded-full text-white", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default IntelligentDashboard;