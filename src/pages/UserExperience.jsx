import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
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
  LineChart,
  Line
} from 'recharts';
import {
  Eye,
  Zap,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Accessibility,
  Palette,
  Type,
  Mouse,
  Keyboard,
  Volume2,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Star,
  ThumbsUp,
  MessageSquare,
  BarChart3
} from 'lucide-react';

// Import our custom components
import AccessibilityPanel from '@/components/AccessibilityPanel';
import UserExperienceEnhancements from '@/components/UserExperienceEnhancements';

// Mock data for UX metrics
const uxMetrics = {
  userSatisfaction: 4.6,
  taskCompletionRate: 87,
  averageTaskTime: 2.3,
  errorRate: 3.2,
  accessibilityScore: 94,
  mobileUsability: 91
};

const usageData = [
  { name: 'Desktop', value: 65, color: '#3b82f6' },
  { name: 'Mobile', value: 25, color: '#10b981' },
  { name: 'Tablet', value: 10, color: '#f59e0b' }
];

const satisfactionTrend = [
  { month: 'Jan', score: 4.2 },
  { month: 'Feb', score: 4.3 },
  { month: 'Mar', score: 4.4 },
  { month: 'Apr', score: 4.5 },
  { month: 'May', score: 4.6 },
  { month: 'Jun', score: 4.6 }
];

const featureUsage = [
  { feature: 'Dashboard', usage: 95 },
  { feature: 'Leads', usage: 88 },
  { feature: 'Contacts', usage: 82 },
  { feature: 'Deals', usage: 76 },
  { feature: 'Reports', usage: 64 },
  { feature: 'Settings', usage: 45 }
];

// UX Overview Component
const UXOverview = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Satisfaction</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{uxMetrics.userSatisfaction}</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(uxMetrics.userSatisfaction)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
                <p className="text-2xl font-bold">{uxMetrics.taskCompletionRate}%</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Task Time</p>
                <p className="text-2xl font-bold">{uxMetrics.averageTaskTime}m</p>
                <p className="text-xs text-green-600">-12s improvement</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{uxMetrics.errorRate}%</p>
                <p className="text-xs text-red-600">+0.3% from last month</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accessibility Score</p>
                <p className="text-2xl font-bold">{uxMetrics.accessibilityScore}%</p>
                <p className="text-xs text-green-600">WCAG 2.1 AA compliant</p>
              </div>
              <Accessibility className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile Usability</p>
                <p className="text-2xl font-bold">{uxMetrics.mobileUsability}%</p>
                <p className="text-xs text-green-600">Responsive design</p>
              </div>
              <Smartphone className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Device Usage Distribution</CardTitle>
            <CardDescription>How users access the application</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Satisfaction Trend</CardTitle>
            <CardDescription>Monthly satisfaction scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[4.0, 5.0]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Analytics</CardTitle>
          <CardDescription>Most and least used features</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureUsage} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="feature" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
              <Bar dataKey="usage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Recent User Feedback
          </CardTitle>
          <CardDescription>Latest comments and suggestions from users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                user: 'Sarah Johnson',
                rating: 5,
                comment: 'The new dashboard is much more intuitive. Love the quick actions!',
                date: '2 hours ago',
                category: 'Dashboard'
              },
              {
                user: 'Mike Chen',
                rating: 4,
                comment: 'Mobile experience has improved significantly. Still some minor issues with forms.',
                date: '1 day ago',
                category: 'Mobile'
              },
              {
                user: 'Emily Davis',
                rating: 5,
                comment: 'Accessibility features are excellent. Screen reader support is perfect.',
                date: '2 days ago',
                category: 'Accessibility'
              }
            ].map((feedback, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{feedback.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {feedback.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < feedback.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{feedback.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main User Experience Page
export default function UserExperience() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Experience Center</h1>
          <p className="text-muted-foreground">
            Monitor usability, accessibility, and user satisfaction metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            UX Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center space-x-2">
            <Accessibility className="h-4 w-4" />
            <span>Accessibility</span>
          </TabsTrigger>
          <TabsTrigger value="enhancements" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Enhancements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UXOverview />
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Accessibility className="h-5 w-5 mr-2" />
                Accessibility Features
              </CardTitle>
              <CardDescription>
                Customize accessibility settings to improve usability for all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccessibilityPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhancements" className="space-y-4">
          <UserExperienceEnhancements />
        </TabsContent>
      </Tabs>
    </div>
  );
}