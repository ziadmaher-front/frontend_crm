import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Target,
  Brain,
  Shield,
  Heart,
  Mail,
  Phone,
  MessageCircle,
  Gift,
  Star,
  Clock,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

const PredictiveChurnAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [churnThreshold, setChurnThreshold] = useState(70);
  const [autoAlerts, setAutoAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sample churn prediction data
  const churnPredictions = [
    {
      id: 1,
      customerName: 'Acme Corporation',
      email: 'contact@acme.com',
      churnProbability: 85,
      riskLevel: 'high',
      lastActivity: '15 days ago',
      accountValue: 25000,
      contractEnd: '2024-03-15',
      engagementScore: 25,
      supportTickets: 8,
      paymentDelays: 2,
      featureUsage: 35,
      predictedChurnDate: '2024-02-28',
      retentionActions: ['Personal Call', 'Discount Offer', 'Feature Training']
    },
    {
      id: 2,
      customerName: 'Tech Solutions Inc',
      email: 'admin@techsol.com',
      churnProbability: 72,
      riskLevel: 'high',
      lastActivity: '8 days ago',
      accountValue: 18500,
      contractEnd: '2024-04-20',
      engagementScore: 40,
      supportTickets: 5,
      paymentDelays: 1,
      featureUsage: 45,
      predictedChurnDate: '2024-03-10',
      retentionActions: ['Check-in Call', 'Usage Analytics', 'Success Manager']
    },
    {
      id: 3,
      customerName: 'Global Enterprises',
      email: 'support@global.com',
      churnProbability: 45,
      riskLevel: 'medium',
      lastActivity: '3 days ago',
      accountValue: 42000,
      contractEnd: '2024-06-30',
      engagementScore: 65,
      supportTickets: 2,
      paymentDelays: 0,
      featureUsage: 78,
      predictedChurnDate: '2024-05-15',
      retentionActions: ['Quarterly Review', 'Feature Expansion', 'Case Study']
    },
    {
      id: 4,
      customerName: 'StartUp Dynamics',
      email: 'team@startup.com',
      churnProbability: 28,
      riskLevel: 'low',
      lastActivity: '1 day ago',
      accountValue: 8900,
      contractEnd: '2024-08-15',
      engagementScore: 85,
      supportTickets: 1,
      paymentDelays: 0,
      featureUsage: 92,
      predictedChurnDate: null,
      retentionActions: ['Upsell Opportunity', 'Referral Program', 'Success Story']
    }
  ];

  // Churn factors and their weights
  const churnFactors = [
    { factor: 'Engagement Score', weight: 25, impact: 'high', description: 'User activity and feature adoption' },
    { factor: 'Support Ticket Volume', weight: 20, impact: 'high', description: 'Number of support requests' },
    { factor: 'Payment History', weight: 18, impact: 'high', description: 'On-time payment patterns' },
    { factor: 'Contract Timeline', weight: 15, impact: 'medium', description: 'Time until contract renewal' },
    { factor: 'Feature Usage', weight: 12, impact: 'medium', description: 'Breadth of feature utilization' },
    { factor: 'Communication Frequency', weight: 10, impact: 'low', description: 'Regular touchpoint interactions' }
  ];

  // Retention strategies
  const retentionStrategies = [
    {
      strategy: 'Proactive Outreach',
      description: 'Personal calls and check-ins for high-risk customers',
      effectiveness: 78,
      cost: 'Low',
      timeframe: '1-2 weeks',
      applicableRisk: ['high', 'medium']
    },
    {
      strategy: 'Discount & Incentives',
      description: 'Targeted pricing adjustments and promotional offers',
      effectiveness: 65,
      cost: 'Medium',
      timeframe: 'Immediate',
      applicableRisk: ['high']
    },
    {
      strategy: 'Feature Training',
      description: 'Personalized training sessions to increase adoption',
      effectiveness: 72,
      cost: 'Medium',
      timeframe: '2-4 weeks',
      applicableRisk: ['high', 'medium']
    },
    {
      strategy: 'Success Manager Assignment',
      description: 'Dedicated customer success manager for guidance',
      effectiveness: 85,
      cost: 'High',
      timeframe: 'Ongoing',
      applicableRisk: ['high']
    },
    {
      strategy: 'Product Roadmap Sharing',
      description: 'Exclusive previews of upcoming features and updates',
      effectiveness: 58,
      cost: 'Low',
      timeframe: '1 week',
      applicableRisk: ['medium', 'low']
    }
  ];

  // Sample analytics data
  const churnTrends = [
    { month: 'Jan', predicted: 12, actual: 10, prevented: 8 },
    { month: 'Feb', predicted: 15, actual: 13, prevented: 6 },
    { month: 'Mar', predicted: 18, actual: 14, prevented: 9 },
    { month: 'Apr', predicted: 14, actual: 11, prevented: 7 },
    { month: 'May', predicted: 16, actual: 12, prevented: 8 },
    { month: 'Jun', predicted: 13, actual: 9, prevented: 10 }
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 65, color: '#22c55e' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'High Risk', value: 10, color: '#ef4444' }
  ];

  const retentionROI = [
    { strategy: 'Proactive Outreach', investment: 5000, saved: 45000, roi: 800 },
    { strategy: 'Feature Training', investment: 8000, saved: 38000, roi: 375 },
    { strategy: 'Success Manager', investment: 15000, saved: 85000, roi: 467 },
    { strategy: 'Discount Offers', investment: 12000, saved: 32000, roi: 167 }
  ];

  const handleRefreshPredictions = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleRetentionAction = (customerId, action) => {
    console.log(`Executing ${action} for customer ${customerId}`);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const ChurnPredictionCard = ({ customer }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {customer.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-lg">{customer.customerName}</h4>
              <p className="text-sm text-gray-600">{customer.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {getRiskIcon(customer.riskLevel)}
                <Badge className={getRiskColor(customer.riskLevel)}>
                  {customer.riskLevel} risk
                </Badge>
                <Badge variant="outline">${customer.accountValue.toLocaleString()}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{customer.churnProbability}%</div>
            <div className="text-sm text-gray-500">Churn Probability</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Engagement</div>
            <div className="flex items-center gap-2">
              <Progress value={customer.engagementScore} className="flex-1 h-2" />
              <span className="text-sm font-medium">{customer.engagementScore}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Feature Usage</div>
            <div className="flex items-center gap-2">
              <Progress value={customer.featureUsage} className="flex-1 h-2" />
              <span className="text-sm font-medium">{customer.featureUsage}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Support Tickets</div>
            <div className="font-medium">{customer.supportTickets}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Activity</div>
            <div className="font-medium">{customer.lastActivity}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Contract ends: {customer.contractEnd}</div>
            {customer.predictedChurnDate && (
              <div className="text-sm text-red-600">Predicted churn: {customer.predictedChurnDate}</div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Recommended Actions:</div>
          <div className="flex flex-wrap gap-2">
            {customer.retentionActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleRetentionAction(customer.id, action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
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
            )}
          </div>
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predictive Churn Analysis</h2>
          <p className="text-gray-600">AI-powered customer retention and churn prevention</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshPredictions}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Predictions
          </Button>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Churn Risk Score"
          value="7.2%"
          change="-1.3%"
          icon={AlertTriangle}
          trend="up"
        />
        <MetricCard
          title="At-Risk Customers"
          value="23"
          change="+5"
          icon={Users}
          trend="down"
        />
        <MetricCard
          title="Revenue at Risk"
          value="$485K"
          change="+$45K"
          icon={DollarSign}
          trend="down"
        />
        <MetricCard
          title="Retention Rate"
          value="92.8%"
          change="+2.1%"
          icon={Shield}
          trend="up"
        />
      </div>

      {/* High Priority Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            High Priority Churn Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churnPredictions.filter(c => c.riskLevel === 'high').map((customer, index) => (
              <div key={index} className="p-4 rounded-lg border-l-4 border-l-red-500 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{customer.customerName}</h4>
                    <p className="text-sm text-gray-600">
                      {customer.churnProbability}% churn probability • ${customer.accountValue.toLocaleString()} at risk
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions">Churn Predictions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="strategies">Retention Strategies</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Customer Churn Predictions</h3>
            <div className="flex items-center gap-2">
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <ScrollArea className="h-[600px]">
            {churnPredictions
              .filter(customer => selectedSegment === 'all' || customer.riskLevel === selectedSegment)
              .map((customer) => (
                <ChurnPredictionCard key={customer.id} customer={customer} />
              ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Churn Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={churnTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Predicted Churn"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Actual Churn"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="prevented" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Prevented Churn"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Churn Prevention Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">31</div>
                  <div className="text-sm text-gray-600">Customers Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$1.2M</div>
                  <div className="text-sm text-gray-600">Revenue Retained</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">78%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">4.2x</div>
                  <div className="text-sm text-gray-600">ROI Multiple</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnFactors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{factor.factor}</span>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                      <Badge variant={
                        factor.impact === 'high' ? 'destructive' :
                        factor.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {factor.impact} impact
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={factor.weight * 4} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600 w-16">
                        Weight: {factor.weight}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionStrategies.map((strategy, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{strategy.strategy}</h4>
                        <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{strategy.effectiveness}%</div>
                        <div className="text-sm text-gray-500">Effectiveness</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cost: </span>
                        <Badge variant={
                          strategy.cost === 'Low' ? 'secondary' :
                          strategy.cost === 'Medium' ? 'default' : 'destructive'
                        }>
                          {strategy.cost}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Timeframe: </span>
                        <span className="font-medium">{strategy.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Applicable: </span>
                        <span className="font-medium">{strategy.applicableRisk.join(', ')} risk</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button size="sm">Apply Strategy</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retention ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionROI.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.strategy}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Investment: ${item.investment.toLocaleString()}</span>
                        <span>Revenue Saved: ${item.saved.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{item.roi}%</div>
                      <div className="text-sm text-gray-500">ROI</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800">Total Retention Impact</h4>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$40K</div>
                    <div className="text-sm text-green-700">Total Investment</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">$200K</div>
                    <div className="text-sm text-green-700">Revenue Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">400%</div>
                    <div className="text-sm text-green-700">Overall ROI</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Churn Analysis Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="churn-threshold">Churn Risk Threshold (%)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input 
                    id="churn-threshold"
                    type="number" 
                    value={churnThreshold}
                    onChange={(e) => setChurnThreshold(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">
                    Customers above {churnThreshold}% will be flagged as high risk
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-alerts">Automatic Alerts</Label>
                  <p className="text-sm text-gray-600">Send notifications when customers enter high-risk category</p>
                </div>
                <Switch 
                  id="auto-alerts"
                  checked={autoAlerts}
                  onCheckedChange={setAutoAlerts}
                />
              </div>

              <div>
                <Label htmlFor="prediction-frequency">Prediction Update Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model-sensitivity">Model Sensitivity</Label>
                <Select defaultValue="balanced">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative (fewer false positives)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="aggressive">Aggressive (catch more at-risk customers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveChurnAnalysis;