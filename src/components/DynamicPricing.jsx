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
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Brain,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter
} from 'lucide-react';

const DynamicPricing = () => {
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [pricingStrategy, setPricingStrategy] = useState('competitive');
  const [autoAdjustment, setAutoAdjustment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Sample pricing data
  const products = [
    {
      id: 1,
      name: 'CRM Pro License',
      currentPrice: 99,
      suggestedPrice: 105,
      confidence: 0.87,
      priceChange: '+6.1%',
      trend: 'up',
      competitorAvg: 110,
      demandScore: 85,
      conversionRate: 12.5,
      revenue: 45600,
      category: 'Software'
    },
    {
      id: 2,
      name: 'Analytics Dashboard',
      currentPrice: 49,
      suggestedPrice: 45,
      confidence: 0.92,
      priceChange: '-8.2%',
      trend: 'down',
      competitorAvg: 52,
      demandScore: 65,
      conversionRate: 8.3,
      revenue: 23400,
      category: 'Add-on'
    },
    {
      id: 3,
      name: 'Enterprise Suite',
      currentPrice: 299,
      suggestedPrice: 325,
      confidence: 0.78,
      priceChange: '+8.7%',
      trend: 'up',
      competitorAvg: 340,
      demandScore: 92,
      conversionRate: 15.2,
      revenue: 89700,
      category: 'Enterprise'
    }
  ];

  const marketTrends = [
    { date: '2024-01-01', demand: 75, competition: 68, price: 95 },
    { date: '2024-01-08', demand: 78, competition: 70, price: 97 },
    { date: '2024-01-15', demand: 82, competition: 72, price: 99 },
    { date: '2024-01-22', demand: 85, competition: 75, price: 102 },
    { date: '2024-01-29', demand: 88, competition: 78, price: 105 }
  ];

  const competitorAnalysis = [
    { competitor: 'Salesforce', price: 150, marketShare: 35, features: 95, rating: 4.5 },
    { competitor: 'HubSpot', price: 90, marketShare: 25, features: 85, rating: 4.3 },
    { competitor: 'Pipedrive', price: 65, marketShare: 15, features: 75, rating: 4.1 },
    { competitor: 'Zoho CRM', price: 45, marketShare: 12, features: 70, rating: 3.9 },
    { competitor: 'Monday.com', price: 80, marketShare: 8, features: 80, rating: 4.2 }
  ];

  const pricingFactors = [
    { factor: 'Market Demand', weight: 25, current: 85, impact: 'positive', change: '+5%' },
    { factor: 'Competitor Pricing', weight: 20, current: 72, impact: 'neutral', change: '+2%' },
    { factor: 'Customer Willingness to Pay', weight: 20, current: 78, impact: 'positive', change: '+8%' },
    { factor: 'Product Value Score', weight: 15, current: 92, impact: 'positive', change: '+3%' },
    { factor: 'Seasonal Trends', weight: 10, current: 68, impact: 'negative', change: '-4%' },
    { factor: 'Economic Indicators', weight: 10, current: 75, impact: 'neutral', change: '+1%' }
  ];

  const pricingRecommendations = [
    {
      type: 'Immediate Action',
      priority: 'high',
      title: 'Increase CRM Pro License Price',
      description: 'Market analysis suggests 6% price increase will optimize revenue',
      impact: '+$12,400 monthly revenue',
      confidence: 87,
      timeframe: 'Next 7 days'
    },
    {
      type: 'Market Opportunity',
      priority: 'medium',
      title: 'Bundle Analytics Dashboard',
      description: 'Create bundle offer to increase average order value',
      impact: '+15% conversion rate',
      confidence: 73,
      timeframe: 'Next 30 days'
    },
    {
      type: 'Competitive Response',
      priority: 'high',
      title: 'Enterprise Suite Positioning',
      description: 'Competitor price cuts detected, adjust positioning strategy',
      impact: 'Maintain market share',
      confidence: 91,
      timeframe: 'Next 14 days'
    }
  ];

  const priceOptimizationHistory = [
    { date: '2024-01-01', product: 'CRM Pro', oldPrice: 95, newPrice: 99, result: '+8.2% revenue' },
    { date: '2024-01-15', product: 'Analytics', oldPrice: 52, newPrice: 49, result: '+12% conversions' },
    { date: '2024-01-20', product: 'Enterprise', oldPrice: 285, newPrice: 299, result: '+5.5% revenue' }
  ];

  const handleRefreshData = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleApplyPricing = (productId) => {
    // Simulate applying pricing suggestion
    console.log(`Applying pricing suggestion for product ${productId}`);
  };

  const PricingCard = ({ product }) => (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <Badge variant="outline" className="mt-1">{product.category}</Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${product.suggestedPrice}</div>
            <div className="text-sm text-gray-500">Current: ${product.currentPrice}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price Change</span>
            <div className="flex items-center gap-1">
              {product.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                product.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.priceChange}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence</span>
            <div className="flex items-center gap-2">
              <Progress value={product.confidence * 100} className="w-16 h-2" />
              <span className="text-sm font-medium">{(product.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <div className="text-xs text-gray-500">Demand Score</div>
              <div className="font-medium">{product.demandScore}/100</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Conversion Rate</div>
              <div className="font-medium">{product.conversionRate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Competitor Avg</div>
              <div className="font-medium">${product.competitorAvg}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Monthly Revenue</div>
              <div className="font-medium">${product.revenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => handleApplyPricing(product.id)}
          >
            Apply Suggestion
          </Button>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4" />
          </Button>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dynamic Pricing Intelligence</h2>
          <p className="text-gray-600">AI-powered pricing optimization based on market conditions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
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
          title="Revenue Optimization"
          value="+18.5%"
          change="+2.3%"
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Price Accuracy"
          value="87%"
          change="+5.1%"
          icon={Target}
          trend="up"
        />
        <MetricCard
          title="Market Position"
          value="Competitive"
          change="Improved"
          icon={BarChart3}
          trend="up"
        />
        <MetricCard
          title="Conversion Impact"
          value="+12.3%"
          change="+4.2%"
          icon={Users}
          trend="up"
        />
      </div>

      {/* Pricing Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Pricing Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pricingRecommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'high' ? 'border-l-red-500 bg-red-50' : 'border-l-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                      {rec.priority}
                    </Badge>
                    <Badge variant="outline">{rec.type}</Badge>
                  </div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-green-600 font-medium">{rec.impact}</span>
                    <span className="text-gray-500">Confidence: {rec.confidence}%</span>
                    <span className="text-gray-500">{rec.timeframe}</span>
                  </div>
                </div>
                <Button size="sm">Apply</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Product Pricing</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
          <TabsTrigger value="factors">Pricing Factors</TabsTrigger>
          <TabsTrigger value="history">Optimization History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <PricingCard key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends & Demand Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Market Demand"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="competition" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Competition Level"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Optimal Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorAnalysis.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">{competitor.competitor}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Market Share: {competitor.marketShare}%</span>
                          <span>Rating: {competitor.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${competitor.price}/month</div>
                        <div className="text-sm text-gray-600">Features: {competitor.features}%</div>
                      </div>
                      <Progress value={competitor.features} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Factors & Weights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingFactors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{factor.factor}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          factor.impact === 'positive' ? 'default' :
                          factor.impact === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {factor.impact}
                        </Badge>
                        <span className="text-sm text-gray-600">{factor.change}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={factor.current} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600 w-16">
                        Weight: {factor.weight}%
                      </div>
                      <div className="text-sm font-medium w-12">
                        {factor.current}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price Optimization History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceOptimizationHistory.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{entry.product}</h4>
                      <p className="text-sm text-gray-600">{entry.date}</p>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Price Change</div>
                      <div className="font-medium">
                        ${entry.oldPrice} → ${entry.newPrice}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Result</div>
                      <div className="font-medium text-green-600">{entry.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Strategy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="strategy">Pricing Strategy</Label>
                  <Select value={pricingStrategy} onValueChange={setPricingStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitive">Competitive Pricing</SelectItem>
                      <SelectItem value="value">Value-Based Pricing</SelectItem>
                      <SelectItem value="penetration">Market Penetration</SelectItem>
                      <SelectItem value="premium">Premium Pricing</SelectItem>
                      <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-adjust">Automatic Price Adjustments</Label>
                    <p className="text-sm text-gray-600">Allow AI to automatically adjust prices based on market conditions</p>
                  </div>
                  <Switch 
                    id="auto-adjust"
                    checked={autoAdjustment}
                    onCheckedChange={setAutoAdjustment}
                  />
                </div>

                <div>
                  <Label htmlFor="max-change">Maximum Price Change (%)</Label>
                  <Input 
                    id="max-change"
                    type="number" 
                    placeholder="10"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="min-confidence">Minimum Confidence Level (%)</Label>
                  <Input 
                    id="min-confidence"
                    type="number" 
                    placeholder="80"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
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

export default DynamicPricing;