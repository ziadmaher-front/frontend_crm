import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Brain, 
  DollarSign, 
  MessageSquare, 
  UserX, 
  Zap, 
  Bot, 
  BarChart, 
  Smartphone,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AIDashboardWidgets = () => {
  // Sample AI metrics data
  const aiMetrics = {
    sentiment: {
      positive: 68,
      neutral: 22,
      negative: 10,
      totalAnalyzed: 1247
    },
    pricing: {
      optimizedDeals: 34,
      revenueIncrease: 12.5,
      avgOptimization: 8.3,
      totalSavings: 45600
    },
    chatbot: {
      totalChats: 892,
      resolved: 756,
      avgResponseTime: 2.3,
      satisfaction: 4.6
    },
    churn: {
      atRiskCustomers: 23,
      prevented: 18,
      retentionRate: 94.2,
      predictedChurn: 5.8
    },
    integrations: {
      connected: 12,
      totalAvailable: 45,
      apiCalls: 15420,
      uptime: 99.8
    },
    workflows: {
      active: 28,
      executed: 1456,
      successRate: 97.3,
      timeSaved: 124
    },
    reports: {
      generated: 156,
      insights: 89,
      queries: 234,
      accuracy: 96.1
    },
    mobile: {
      offlineSync: 98.5,
      pushDelivery: 94.2,
      appRating: 4.7,
      activeUsers: 342
    }
  };

  // Chart data
  const sentimentTrendData = [
    { day: 'Mon', positive: 65, negative: 12 },
    { day: 'Tue', positive: 70, negative: 8 },
    { day: 'Wed', positive: 68, negative: 10 },
    { day: 'Thu', positive: 72, negative: 7 },
    { day: 'Fri', positive: 68, negative: 10 },
  ];

  const churnPredictionData = [
    { risk: 'Low', count: 156, color: '#10B981' },
    { risk: 'Medium', count: 45, color: '#F59E0B' },
    { risk: 'High', count: 23, color: '#EF4444' },
  ];

  const workflowPerformanceData = [
    { workflow: 'Lead Qual.', executions: 245 },
    { workflow: 'Deal Prog.', executions: 189 },
    { workflow: 'Onboarding', executions: 156 },
    { workflow: 'Support', executions: 134 },
  ];

  return (
    <div className="space-y-6">
      {/* AI Overview Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Intelligence Center</h2>
            <p className="text-purple-100">Real-time insights from your AI-powered features</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">{aiMetrics.sentiment.totalAnalyzed}</div>
            <div className="text-sm text-purple-100">Interactions Analyzed</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">{aiMetrics.workflows.active}</div>
            <div className="text-sm text-purple-100">Active Workflows</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">{aiMetrics.integrations.connected}</div>
            <div className="text-sm text-purple-100">Connected Apps</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold">{aiMetrics.chatbot.satisfaction}</div>
            <div className="text-sm text-purple-100">AI Satisfaction</div>
          </div>
        </div>
      </div>

      {/* AI Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sentiment Analysis */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Sentiment Analysis</p>
                <CardTitle className="text-2xl font-bold mt-1 text-gray-900">{aiMetrics.sentiment.positive}%</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Positive sentiment</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Dynamic Pricing */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Dynamic Pricing</p>
                <CardTitle className="text-2xl font-bold mt-1 text-gray-900">+{aiMetrics.pricing.revenueIncrease}%</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Revenue increase</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Chatbot */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Chatbot</p>
                <CardTitle className="text-2xl font-bold mt-1 text-gray-900">{aiMetrics.chatbot.resolved}</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Chats resolved</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Churn Prevention */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn Prevention</p>
                <CardTitle className="text-2xl font-bold mt-1 text-gray-900">{aiMetrics.churn.prevented}</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Customers retained</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* AI Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Sentiment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sentimentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={3} />
                <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn Risk Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Churn Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={churnPredictionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ risk, percent }) => `${risk}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {churnPredictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflow Performance */}
        <Card className="border-none shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Bot className="w-5 h-5 text-indigo-500" />
              Top Performing Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsBarChart data={workflowPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="workflow" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }} 
                />
                <Bar dataKey="executions" fill="url(#aiGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Feature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-yellow-500" />
              Integration Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connected Apps</span>
                <span className="font-semibold">{aiMetrics.integrations.connected}/{aiMetrics.integrations.totalAvailable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">{aiMetrics.integrations.uptime}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <BarChart className="w-4 h-4 text-blue-500" />
              Smart Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Generated</span>
                <span className="font-semibold">{aiMetrics.reports.generated}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="font-semibold text-green-600">{aiMetrics.reports.accuracy}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4 text-purple-500" />
              Mobile Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold">{aiMetrics.mobile.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">App Rating</span>
                <span className="font-semibold text-yellow-600">{aiMetrics.mobile.appRating}★</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-green-500" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">AI Models</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-600">Online</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="font-semibold text-blue-600">Real-time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDashboardWidgets;