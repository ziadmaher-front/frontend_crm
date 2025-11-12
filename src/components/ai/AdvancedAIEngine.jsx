import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Lightbulb,
  Cpu,
  Database,
  Network,
  Shield,
  Rocket,
  Eye,
  Settings
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from '@/lib/utils';

// AI Model Performance Metrics
const AIModelCard = ({ model, accuracy, status, lastTrained, predictions }) => {
  const statusColors = {
    active: 'bg-green-500',
    training: 'bg-yellow-500',
    inactive: 'bg-gray-500'
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{model.name}</CardTitle>
            <p className="text-sm text-gray-600">{model.description}</p>
          </div>
          <Badge className={cn("text-white", statusColors[status])}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Accuracy</span>
            <span className="font-semibold">{accuracy}%</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Last Trained</p>
            <p className="font-semibold">{lastTrained}</p>
          </div>
          <div>
            <p className="text-gray-600">Predictions</p>
            <p className="font-semibold">{predictions.toLocaleString()}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={model.performanceHistory}>
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  
  const predictions = [
    {
      metric: "Revenue Forecast",
      current: 2400000,
      predicted: 2850000,
      confidence: 87,
      trend: "up",
      timeframe: "Next 30 days"
    },
    {
      metric: "Lead Conversion",
      current: 24.8,
      predicted: 28.2,
      confidence: 92,
      trend: "up",
      timeframe: "Next 30 days"
    },
    {
      metric: "Churn Risk",
      current: 5.2,
      predicted: 3.8,
      confidence: 78,
      trend: "down",
      timeframe: "Next 30 days"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Predictive Analytics
          </CardTitle>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions.map((prediction, index) => (
          <motion.div
            key={prediction.metric}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{prediction.metric}</h4>
              <Badge variant="outline" className="text-xs">
                {prediction.confidence}% confident
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Current</p>
                <p className="text-lg font-bold">
                  {prediction.metric.includes('Revenue') ? 
                    `$${(prediction.current / 1000000).toFixed(1)}M` :
                    `${prediction.current}${prediction.metric.includes('Rate') || prediction.metric.includes('Risk') ? '%' : ''}`
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Predicted</p>
                <p className={cn(
                  "text-lg font-bold",
                  prediction.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {prediction.metric.includes('Revenue') ? 
                    `$${(prediction.predicted / 1000000).toFixed(1)}M` :
                    `${prediction.predicted}${prediction.metric.includes('Rate') || prediction.metric.includes('Risk') ? '%' : ''}`
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-600">{prediction.timeframe}</p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

// Smart Recommendations Engine
const SmartRecommendations = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const recommendations = [
    {
      id: 1,
      category: 'sales',
      priority: 'high',
      title: 'Optimize Follow-up Timing',
      description: 'AI analysis shows 40% higher conversion when leads are contacted within 2 hours',
      impact: 'High',
      effort: 'Low',
      roi: '+$125K annually',
      action: 'Implement Auto-scheduling',
      confidence: 94
    },
    {
      id: 2,
      category: 'marketing',
      priority: 'medium',
      title: 'Segment Email Campaigns',
      description: 'Personalized campaigns show 65% better engagement rates',
      impact: 'Medium',
      effort: 'Medium',
      roi: '+$85K annually',
      action: 'Create Segments',
      confidence: 87
    },
    {
      id: 3,
      category: 'product',
      priority: 'high',
      title: 'Feature Usage Analytics',
      description: 'Underutilized premium features present upselling opportunities',
      impact: 'High',
      effort: 'Low',
      roi: '+$200K annually',
      action: 'Launch Feature Campaign',
      confidence: 91
    }
  ];

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === activeCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Smart Recommendations
        </CardTitle>
        <div className="flex gap-2 mt-3">
          {['all', 'sales', 'marketing', 'product'].map((category) => (
            <Button
              key={category}
              size="sm"
              variant={activeCategory === category ? 'default' : 'outline'}
              onClick={() => setActiveCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {filteredRecommendations.map((rec) => (
            <motion.div
              key={rec.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {rec.confidence}% confident
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-xs mb-3">
                <div>
                  <p className="text-gray-500">Impact</p>
                  <p className="font-semibold">{rec.impact}</p>
                </div>
                <div>
                  <p className="text-gray-500">Effort</p>
                  <p className="font-semibold">{rec.effort}</p>
                </div>
                <div>
                  <p className="text-gray-500">ROI</p>
                  <p className="font-semibold text-green-600">{rec.roi}</p>
                </div>
              </div>
              
              <Button size="sm" className="w-full">
                {rec.action}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

// AI System Health Monitor
const AISystemHealth = () => {
  const systemMetrics = [
    { name: 'Model Performance', value: 94, status: 'excellent' },
    { name: 'Data Quality', value: 87, status: 'good' },
    { name: 'Processing Speed', value: 91, status: 'excellent' },
    { name: 'Memory Usage', value: 76, status: 'good' },
    { name: 'API Response', value: 98, status: 'excellent' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          AI System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold", getStatusColor(metric.status))}>
                  {metric.value}%
                </span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  metric.status === 'excellent' ? 'bg-green-500' :
                  metric.status === 'good' ? 'bg-blue-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                )} />
              </div>
            </div>
            <Progress value={metric.value} className="h-2" />
          </motion.div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health Score</span>
            <span className="text-lg font-bold text-green-600">89/100</span>
          </div>
          <Progress value={89} className="h-3 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export const AdvancedAIEngine = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const aiModels = [
    {
      name: 'Lead Scoring Model',
      description: 'Predicts lead conversion probability',
      performanceHistory: [
        { accuracy: 85 }, { accuracy: 87 }, { accuracy: 89 }, { accuracy: 91 }, { accuracy: 94 }
      ]
    },
    {
      name: 'Churn Prediction',
      description: 'Identifies at-risk customers',
      performanceHistory: [
        { accuracy: 78 }, { accuracy: 82 }, { accuracy: 85 }, { accuracy: 87 }, { accuracy: 89 }
      ]
    },
    {
      name: 'Price Optimization',
      description: 'Recommends optimal pricing strategies',
      performanceHistory: [
        { accuracy: 72 }, { accuracy: 75 }, { accuracy: 78 }, { accuracy: 82 }, { accuracy: 85 }
      ]
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'models', label: 'AI Models', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
    { id: 'health', label: 'System Health', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Advanced AI Engine
          </h1>
          <p className="text-gray-600 mt-1">Intelligent automation and predictive analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            AI Active
          </Badge>
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictiveAnalytics />
              <AISystemHealth />
            </div>
          )}

          {activeTab === 'models' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiModels.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AIModelCard
                    model={model}
                    accuracy={94 - index * 5}
                    status="active"
                    lastTrained="2 hours ago"
                    predictions={1247 + index * 300}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'predictions' && (
            <PredictiveAnalytics />
          )}

          {activeTab === 'recommendations' && (
            <SmartRecommendations />
          )}

          {activeTab === 'health' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AISystemHealth />
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { time: '00:00', performance: 85 },
                      { time: '04:00', performance: 87 },
                      { time: '08:00', performance: 92 },
                      { time: '12:00', performance: 89 },
                      { time: '16:00', performance: 94 },
                      { time: '20:00', performance: 91 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="performance" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAIEngine;