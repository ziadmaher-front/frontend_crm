import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Mail, 
  Phone, 
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  Calendar,
  Users,
  Activity
} from 'lucide-react';

const SentimentAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7days');
  const [selectedChannel, setSelectedChannel] = useState('all');

  // Sample sentiment data
  const sentimentOverTime = [
    { date: '2024-01-01', positive: 65, neutral: 25, negative: 10 },
    { date: '2024-01-02', positive: 70, neutral: 20, negative: 10 },
    { date: '2024-01-03', positive: 60, neutral: 30, negative: 10 },
    { date: '2024-01-04', positive: 75, neutral: 15, negative: 10 },
    { date: '2024-01-05', positive: 68, neutral: 22, negative: 10 },
    { date: '2024-01-06', positive: 72, neutral: 18, negative: 10 },
    { date: '2024-01-07', positive: 78, neutral: 15, negative: 7 }
  ];

  const channelSentiment = [
    { channel: 'Email', positive: 72, neutral: 20, negative: 8, total: 1250 },
    { channel: 'Live Chat', positive: 85, neutral: 12, negative: 3, total: 890 },
    { channel: 'Phone', positive: 68, neutral: 25, negative: 7, total: 456 },
    { channel: 'Social Media', positive: 45, neutral: 35, negative: 20, total: 234 },
    { channel: 'Support Tickets', positive: 55, neutral: 30, negative: 15, total: 678 }
  ];

  const customerSentiment = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: null,
      overallSentiment: 'positive',
      sentimentScore: 0.85,
      lastInteraction: '2 hours ago',
      channel: 'email',
      recentMessages: [
        { content: 'Thank you so much for the quick response!', sentiment: 'positive', score: 0.9 },
        { content: 'The product works perfectly as described.', sentiment: 'positive', score: 0.8 }
      ]
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar: null,
      overallSentiment: 'negative',
      sentimentScore: -0.65,
      lastInteraction: '1 hour ago',
      channel: 'chat',
      recentMessages: [
        { content: 'This is taking way too long to resolve.', sentiment: 'negative', score: -0.7 },
        { content: 'I\'m very disappointed with the service.', sentiment: 'negative', score: -0.6 }
      ]
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma@example.com',
      avatar: null,
      overallSentiment: 'neutral',
      sentimentScore: 0.15,
      lastInteraction: '30 min ago',
      channel: 'phone',
      recentMessages: [
        { content: 'I need more information about the pricing.', sentiment: 'neutral', score: 0.1 },
        { content: 'Can you explain the features in detail?', sentiment: 'neutral', score: 0.2 }
      ]
    }
  ];

  const sentimentTriggers = [
    { trigger: 'Pricing concerns', count: 45, sentiment: 'negative', impact: 'high' },
    { trigger: 'Product quality', count: 78, sentiment: 'positive', impact: 'high' },
    { trigger: 'Support response time', count: 32, sentiment: 'negative', impact: 'medium' },
    { trigger: 'Feature requests', count: 56, sentiment: 'neutral', impact: 'medium' },
    { trigger: 'Delivery issues', count: 23, sentiment: 'negative', impact: 'high' }
  ];

  const sentimentAlerts = [
    {
      type: 'Negative Spike',
      severity: 'high',
      description: 'Negative sentiment increased by 15% in the last 2 hours',
      affectedCustomers: 12,
      channel: 'Social Media',
      time: '2 hours ago'
    },
    {
      type: 'Customer at Risk',
      severity: 'medium',
      description: 'High-value customer showing declining sentiment',
      affectedCustomers: 1,
      channel: 'Email',
      time: '4 hours ago'
    }
  ];

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="h-4 w-4 text-green-500" />;
      case 'negative': return <Frown className="h-4 w-4 text-red-500" />;
      default: return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const SentimentCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-2 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </span>
            </div>
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );

  const CustomerSentimentCard = ({ customer }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={customer.avatar} />
              <AvatarFallback>
                {customer.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{customer.name}</h4>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {getSentimentIcon(customer.overallSentiment)}
                <span className="text-sm capitalize">{customer.overallSentiment}</span>
                <Badge variant="outline" className="text-xs">
                  {customer.channel}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">{customer.lastInteraction}</div>
            <div className="mt-2">
              <Progress 
                value={Math.abs(customer.sentimentScore) * 100} 
                className="w-20 h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                Score: {customer.sentimentScore.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium">Recent Messages:</h5>
          {customer.recentMessages.map((message, index) => (
            <div key={index} className={`p-2 rounded text-sm ${getSentimentColor(message.sentiment)}`}>
              <div className="flex items-start justify-between">
                <p className="flex-1">{message.content}</p>
                <div className="flex items-center gap-1 ml-2">
                  {getSentimentIcon(message.sentiment)}
                  <span className="text-xs">{message.score.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sentiment Analysis</h2>
          <p className="text-gray-600">Monitor customer emotions and satisfaction</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">24 Hours</SelectItem>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="chat">Live Chat</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SentimentCard
          title="Overall Sentiment"
          value="72%"
          change="+5.2%"
          icon={Heart}
          trend="up"
        />
        <SentimentCard
          title="Positive Interactions"
          value="1,847"
          change="+12.3%"
          icon={ThumbsUp}
          trend="up"
        />
        <SentimentCard
          title="Negative Interactions"
          value="234"
          change="-8.1%"
          icon={ThumbsDown}
          trend="down"
        />
        <SentimentCard
          title="Avg Response Time"
          value="2.4h"
          change="-15.6%"
          icon={Activity}
          trend="down"
        />
      </div>

      {/* Alerts */}
      {sentimentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Sentiment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentimentAlerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{alert.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{alert.affectedCustomers} customers affected</span>
                      <span>Channel: {alert.channel}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">By Channel</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
          <TabsTrigger value="triggers">Sentiment Triggers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={sentimentOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e"
                    name="Positive"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutral" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    name="Neutral"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444"
                    name="Negative"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment by Communication Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelSentiment.map((channel, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{channel.channel}</span>
                      <span className="text-sm text-gray-600">{channel.total} interactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex rounded-full overflow-hidden h-3">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${channel.positive}%` }}
                        />
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${channel.neutral}%` }}
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${channel.negative}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">{channel.positive}%</span>
                        <span className="text-yellow-600">{channel.neutral}%</span>
                        <span className="text-red-600">{channel.negative}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Customer Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {customerSentiment.map((customer) => (
                  <CustomerSentimentCard key={customer.id} customer={customer} />
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Triggers & Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentimentTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getSentimentIcon(trigger.sentiment)}
                      <div>
                        <h4 className="font-medium">{trigger.trigger}</h4>
                        <p className="text-sm text-gray-600">{trigger.count} mentions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        trigger.impact === 'high' ? 'destructive' :
                        trigger.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {trigger.impact} impact
                      </Badge>
                      <Badge variant="outline" className={getSentimentColor(trigger.sentiment)}>
                        {trigger.sentiment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SentimentAnalysis;