import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  LightBulbIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CpuChipIcon,
  BeakerIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  EyeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SignalIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
  MapIcon,
  CubeIcon,
  CircleStackIcon,
  DatabaseIcon,
  ServerIcon,
  CloudIcon,
  WifiIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PrinterIcon,
  EnvelopeIcon,
  LinkIcon,
  QrCodeIcon,
  CommandLineIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  BookOpenIcon,
  NewspaperIcon,
  MegaphoneIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  HeartIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  ScatterChart,
  Scatter,
  FunnelChart,
  Funnel,
  LabelList,
  TreemapChart,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
  ReferenceArea,
  Brush,
  ErrorBar
} from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

// Business Intelligence Engine
class BusinessIntelligenceEngine {
  constructor() {
    this.models = {
      salesForecasting: new SalesForecastingModel(),
      customerSegmentation: new CustomerSegmentationModel(),
      churnPrediction: new ChurnPredictionModel(),
      leadScoring: new LeadScoringModel(),
      priceOptimization: new PriceOptimizationModel(),
      inventoryOptimization: new InventoryOptimizationModel(),
      marketingAttribution: new MarketingAttributionModel(),
      competitiveAnalysis: new CompetitiveAnalysisModel()
    };
    
    this.insights = [];
    this.recommendations = [];
    this.alerts = [];
  }

  // Generate business insights
  async generateInsights(data, timeframe = '30d') {
    const insights = [];
    
    // Revenue insights
    const revenueInsight = this.analyzeRevenueTrends(data.revenue, timeframe);
    if (revenueInsight) insights.push(revenueInsight);
    
    // Customer insights
    const customerInsight = this.analyzeCustomerBehavior(data.customers, data.interactions);
    if (customerInsight) insights.push(customerInsight);
    
    // Sales insights
    const salesInsight = this.analyzeSalesPerformance(data.sales, data.targets);
    if (salesInsight) insights.push(salesInsight);
    
    // Marketing insights
    const marketingInsight = this.analyzeMarketingEffectiveness(data.marketing, data.conversions);
    if (marketingInsight) insights.push(marketingInsight);
    
    // Product insights
    const productInsight = this.analyzeProductPerformance(data.products, data.sales);
    if (productInsight) insights.push(productInsight);
    
    return insights;
  }
  
  analyzeRevenueTrends(revenueData, timeframe) {
    if (!revenueData || revenueData.length < 2) return null;
    
    const currentPeriod = revenueData.slice(-timeframe);
    const previousPeriod = revenueData.slice(-timeframe * 2, -timeframe);
    
    const currentRevenue = currentPeriod.reduce((sum, item) => sum + item.amount, 0);
    const previousRevenue = previousPeriod.reduce((sum, item) => sum + item.amount, 0);
    
    const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    
    return {
      id: `revenue-${Date.now()}`,
      type: 'revenue',
      title: growth > 0 ? 'Revenue Growth Detected' : 'Revenue Decline Alert',
      description: `Revenue has ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared to the previous period.`,
      impact: Math.abs(growth) > 20 ? 'high' : Math.abs(growth) > 10 ? 'medium' : 'low',
      trend: growth > 0 ? 'positive' : 'negative',
      confidence: 0.85,
      timestamp: new Date().toISOString(),
      recommendation: growth < -10 ? 'Consider reviewing pricing strategy and customer retention programs.' : 'Maintain current growth strategies and explore expansion opportunities.'
    };
  }
  
  analyzeCustomerBehavior(customerData, interactionData) {
    if (!customerData || !interactionData) return null;
    
    const activeCustomers = customerData.filter(c => c.lastActivity && 
      new Date(c.lastActivity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const churnRisk = customerData.filter(c => c.riskScore > 70).length;
    const churnRate = (churnRisk / customerData.length) * 100;
    
    return {
      id: `customer-${Date.now()}`,
      type: 'customer',
      title: churnRate > 15 ? 'High Customer Churn Risk' : 'Customer Engagement Insights',
      description: `${churnRate.toFixed(1)}% of customers are at risk of churning. ${activeCustomers.length} customers are highly engaged.`,
      impact: churnRate > 20 ? 'high' : churnRate > 10 ? 'medium' : 'low',
      trend: churnRate > 15 ? 'negative' : 'positive',
      confidence: 0.78,
      timestamp: new Date().toISOString(),
      recommendation: churnRate > 15 ? 'Implement customer retention campaigns and personalized outreach.' : 'Continue nurturing customer relationships and expand engagement programs.'
    };
  }
  
  analyzeSalesPerformance(salesData, targetData) {
    if (!salesData || !targetData) return null;
    
    const totalSales = salesData.reduce((sum, sale) => sum + sale.amount, 0);
    const target = targetData.monthly || 0;
    const achievement = (totalSales / target) * 100;
    
    return {
      id: `sales-${Date.now()}`,
      type: 'sales',
      title: achievement >= 100 ? 'Sales Target Exceeded' : 'Sales Performance Alert',
      description: `Current sales performance is at ${achievement.toFixed(1)}% of target (${totalSales.toLocaleString()} / ${target.toLocaleString()}).`,
      impact: Math.abs(achievement - 100) > 20 ? 'high' : 'medium',
      trend: achievement >= 100 ? 'positive' : 'negative',
      confidence: 0.92,
      timestamp: new Date().toISOString(),
      recommendation: achievement < 80 ? 'Focus on high-value prospects and accelerate deal closure.' : 'Maintain momentum and explore upselling opportunities.'
    };
  }
  
  analyzeMarketingEffectiveness(marketingData, conversionData) {
    if (!marketingData || !conversionData) return null;
    
    const totalSpend = marketingData.reduce((sum, campaign) => sum + campaign.spend, 0);
    const totalConversions = conversionData.length;
    const costPerConversion = totalSpend / totalConversions;
    
    const topPerformingChannel = marketingData.reduce((best, campaign) => 
      campaign.roi > (best?.roi || 0) ? campaign : best, null);
    
    return {
      id: `marketing-${Date.now()}`,
      type: 'marketing',
      title: 'Marketing Performance Analysis',
      description: `Cost per conversion: $${costPerConversion.toFixed(2)}. Top performing channel: ${topPerformingChannel?.name || 'N/A'} with ${(topPerformingChannel?.roi * 100 || 0).toFixed(1)}% ROI.`,
      impact: costPerConversion > 100 ? 'high' : 'medium',
      trend: topPerformingChannel?.roi > 2 ? 'positive' : 'neutral',
      confidence: 0.81,
      timestamp: new Date().toISOString(),
      recommendation: 'Reallocate budget to high-performing channels and optimize underperforming campaigns.'
    };
  }
  
  analyzeProductPerformance(productData, salesData) {
    if (!productData || !salesData) return null;
    
    const productSales = {};
    salesData.forEach(sale => {
      if (sale.productId) {
        productSales[sale.productId] = (productSales[sale.productId] || 0) + sale.amount;
      }
    });
    
    const topProduct = Object.entries(productSales).reduce((best, [productId, revenue]) => 
      revenue > (best?.revenue || 0) ? { productId, revenue } : best, null);
    
    const product = productData.find(p => p.id === topProduct?.productId);
    
    return {
      id: `product-${Date.now()}`,
      type: 'product',
      title: 'Product Performance Insights',
      description: `Top performing product: ${product?.name || 'Unknown'} with $${(topProduct?.revenue || 0).toLocaleString()} in revenue.`,
      impact: 'medium',
      trend: 'positive',
      confidence: 0.75,
      timestamp: new Date().toISOString(),
      recommendation: 'Focus marketing efforts on top-performing products and analyze success factors for replication.'
    };
  }
  
  generateRecommendations(insights, businessData) {
    const recommendations = [];
    
    insights.forEach(insight => {
      switch (insight.type) {
        case 'revenue':
          if (insight.trend === 'negative') {
            recommendations.push({
              id: `rec-revenue-${Date.now()}`,
              title: 'Revenue Recovery Strategy',
              description: 'Implement targeted campaigns to recover revenue decline',
              priority: 'high',
              impact: 'High',
              effort: 'Medium',
              actions: [
                'Analyze customer churn patterns',
                'Launch win-back campaigns',
                'Review pricing strategy',
                'Enhance customer support'
              ]
            });
          }
          break;
        case 'customer':
          if (insight.impact === 'high') {
            recommendations.push({
              id: `rec-customer-${Date.now()}`,
              title: 'Customer Retention Program',
              description: 'Reduce churn risk through proactive engagement',
              priority: 'high',
              impact: 'High',
              effort: 'Medium',
              actions: [
                'Identify at-risk customers',
                'Create personalized retention offers',
                'Implement customer success programs',
                'Enhance onboarding process'
              ]
            });
          }
          break;
        case 'sales':
          if (insight.trend === 'negative') {
            recommendations.push({
              id: `rec-sales-${Date.now()}`,
              title: 'Sales Performance Optimization',
              description: 'Accelerate sales performance to meet targets',
              priority: 'high',
              impact: 'High',
              effort: 'Low',
              actions: [
                'Focus on high-value prospects',
                'Streamline sales process',
                'Provide additional sales training',
                'Implement sales automation tools'
              ]
            });
          }
          break;
      }
    });
    
    return recommendations;
  }
  
  async generateForecasts(businessData) {
    const forecasts = {};
    
    // Sales forecast
    if (businessData.sales) {
      forecasts.sales = await this.salesForecastingModel.forecast(businessData.sales, 12);
    }
    
    // Revenue forecast
    if (businessData.revenue) {
      forecasts.revenue = await this.generateRevenueForecast(businessData.revenue);
    }
    
    // Customer growth forecast
    if (businessData.customers) {
      forecasts.customers = await this.generateCustomerGrowthForecast(businessData.customers);
    }
    
    return forecasts;
  }
  
  async generateRevenueForecast(revenueData) {
    // Simple linear regression for revenue forecasting
    const points = revenueData.map((item, index) => ({ x: index, y: item.amount }));
    const n = points.length;
    
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const forecast = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      
      const predictedValue = slope * (n + i) + intercept;
      const confidence = Math.max(0.5, 0.9 - (i * 0.05)); // Decreasing confidence over time
      
      forecast.push({
        date: futureDate.toISOString(),
        value: Math.max(0, predictedValue),
        confidence: confidence
      });
    }
    
    return forecast;
  }
  
  async generateCustomerGrowthForecast(customerData) {
    // Simple growth rate calculation
    const monthlyGrowth = [];
    const sortedData = customerData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Calculate monthly growth rates
    const monthlyCustomers = {};
    sortedData.forEach(customer => {
      const month = new Date(customer.createdAt).toISOString().slice(0, 7);
      monthlyCustomers[month] = (monthlyCustomers[month] || 0) + 1;
    });
    
    const months = Object.keys(monthlyCustomers).sort();
    const avgGrowthRate = months.length > 1 ? 
      (monthlyCustomers[months[months.length - 1]] - monthlyCustomers[months[0]]) / months.length : 0;
    
    const forecast = [];
    const baseDate = new Date();
    let currentCustomers = customerData.length;
    
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(futureDate.getMonth() + i + 1);
      
      currentCustomers += avgGrowthRate;
      const confidence = Math.max(0.4, 0.8 - (i * 0.04));
      
      forecast.push({
        date: futureDate.toISOString(),
        value: Math.round(Math.max(0, currentCustomers)),
        confidence: confidence
      });
    }
    
    return forecast;
  }
}

class LeadScoringModel {
  calculateLeadScore(lead) {
    let score = 0;
    
    // Company size scoring
    if (lead.companySize > 1000) score += 25;
    else if (lead.companySize > 100) score += 15;
    else if (lead.companySize > 10) score += 10;
    
    // Job title scoring
    if (lead.jobTitle) {
      const seniorTitles = ['ceo', 'cto', 'vp', 'director', 'manager'];
      if (seniorTitles.some(title => lead.jobTitle.toLowerCase().includes(title))) {
        score += 20;
      }
    }
    
    // Engagement scoring
    if (lead.emailOpens > 5) score += 10;
    if (lead.websiteVisits > 3) score += 15;
    if (lead.contentDownloads > 0) score += 10;
    if (lead.demoRequested) score += 25;
    
    // Budget scoring
    if (lead.budget > 100000) score += 30;
    else if (lead.budget > 50000) score += 20;
    else if (lead.budget > 10000) score += 10;
    
    return Math.min(100, score);
  }
  
  getLeadGrade(lead) {
    const score = this.calculateLeadScore(lead);
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  }
  
  getScoringFactors(lead) {
    const factors = [];
    
    if (lead.jobTitle && ['ceo', 'vp', 'director'].some(title => 
      lead.jobTitle.toLowerCase().includes(title))) {
      factors.push('Senior decision maker');
    }
    if (lead.companySize > 100) {
      factors.push('Large company');
    }
    if (lead.demoRequested) {
      factors.push('Requested demo');
    }
    if (lead.contentDownloads > 2) {
      factors.push('High content engagement');
    }
    
    return factors;
  }
}

class PriceOptimizationModel {
  async optimize(products, marketData) {
    return products.map(product => ({
      productId: product.id,
      currentPrice: product.price,
      optimizedPrice: this.calculateOptimalPrice(product, marketData),
      priceElasticity: this.calculatePriceElasticity(product),
      revenueImpact: this.calculateRevenueImpact(product, marketData)
    }));
  }
  
  calculateOptimalPrice(product, marketData) {
    // Simplified price optimization
    const demandFactor = product.demand / 100;
    const competitionFactor = marketData.averagePrice / product.price;
    const elasticity = this.calculatePriceElasticity(product);
    
    const adjustment = (demandFactor * competitionFactor) / (1 + Math.abs(elasticity));
    return product.price * (1 + adjustment * 0.1);
  }
  
  calculatePriceElasticity(product) {
    // Simplified elasticity calculation
    return -1.5 + (Math.random() * 1); // Between -2.5 and -0.5
  }
  
  calculateRevenueImpact(product, marketData) {
    const optimizedPrice = this.calculateOptimalPrice(product, marketData);
    const priceChange = (optimizedPrice - product.price) / product.price;
    const elasticity = this.calculatePriceElasticity(product);
    
    const demandChange = elasticity * priceChange;
    const revenueChange = (1 + priceChange) * (1 + demandChange) - 1;
    
    return revenueChange * product.revenue;
  }
}

class InventoryOptimizationModel {
  async optimize(inventory, salesData) {
    return inventory.map(item => ({
      itemId: item.id,
      currentStock: item.stock,
      optimalStock: this.calculateOptimalStock(item, salesData),
      reorderPoint: this.calculateReorderPoint(item, salesData),
      stockoutRisk: this.calculateStockoutRisk(item, salesData)
    }));
  }
  
  calculateOptimalStock(item, salesData) {
    const avgDemand = item.avgDailySales || 10;
    const leadTime = item.leadTimeDays || 7;
    const safetyStock = Math.sqrt(leadTime) * avgDemand * 0.5;
    
    return (avgDemand * leadTime) + safetyStock;
  }
  
  calculateReorderPoint(item, salesData) {
    const avgDemand = item.avgDailySales || 10;
    const leadTime = item.leadTimeDays || 7;
    const safetyStock = Math.sqrt(leadTime) * avgDemand * 0.3;
    
    return (avgDemand * leadTime) + safetyStock;
  }
  
  calculateStockoutRisk(item, salesData) {
    const daysOfStock = item.stock / (item.avgDailySales || 1);
    const leadTime = item.leadTimeDays || 7;
    
    if (daysOfStock < leadTime * 0.5) return 'high';
    if (daysOfStock < leadTime) return 'medium';
    return 'low';
  }
}

class MarketingAttributionModel {
  async analyze(campaigns, conversions) {
    const attribution = {};
    
    campaigns.forEach(campaign => {
      const campaignConversions = conversions.filter(c => 
        c.touchpoints.some(t => t.campaignId === campaign.id)
      );
      
      attribution[campaign.id] = {
        campaignId: campaign.id,
        campaignName: campaign.name,
        firstTouch: this.calculateFirstTouchAttribution(campaign, campaignConversions),
        lastTouch: this.calculateLastTouchAttribution(campaign, campaignConversions),
        linear: this.calculateLinearAttribution(campaign, campaignConversions),
        timeDecay: this.calculateTimeDecayAttribution(campaign, campaignConversions)
      };
    });
    
    return attribution;
  }
  
  calculateFirstTouchAttribution(campaign, conversions) {
    const firstTouchConversions = conversions.filter(c => 
      c.touchpoints[0]?.campaignId === campaign.id
    );
    
    return {
      conversions: firstTouchConversions.length,
      revenue: firstTouchConversions.reduce((sum, c) => sum + c.value, 0),
      attribution: firstTouchConversions.length / conversions.length
    };
  }
  
  calculateLastTouchAttribution(campaign, conversions) {
    const lastTouchConversions = conversions.filter(c => 
      c.touchpoints[c.touchpoints.length - 1]?.campaignId === campaign.id
    );
    
    return {
      conversions: lastTouchConversions.length,
      revenue: lastTouchConversions.reduce((sum, c) => sum + c.value, 0),
      attribution: lastTouchConversions.length / conversions.length
    };
  }
  
  calculateLinearAttribution(campaign, conversions) {
    let totalAttribution = 0;
    let totalRevenue = 0;
    
    conversions.forEach(conversion => {
      const touchpoints = conversion.touchpoints.filter(t => t.campaignId === campaign.id);
      if (touchpoints.length > 0) {
        const attribution = touchpoints.length / conversion.touchpoints.length;
        totalAttribution += attribution;
        totalRevenue += conversion.value * attribution;
      }
    });
    
    return {
      conversions: totalAttribution,
      revenue: totalRevenue,
      attribution: totalAttribution / conversions.length
    };
  }
  
  calculateTimeDecayAttribution(campaign, conversions) {
    let totalAttribution = 0;
    let totalRevenue = 0;
    
    conversions.forEach(conversion => {
      const touchpoints = conversion.touchpoints;
      const campaignTouchpoints = touchpoints.filter(t => t.campaignId === campaign.id);
      
      if (campaignTouchpoints.length > 0) {
        const totalWeight = touchpoints.reduce((sum, t, i) => 
          sum + Math.pow(2, -(touchpoints.length - 1 - i)), 0
        );
        
        campaignTouchpoints.forEach(touchpoint => {
          const index = touchpoints.indexOf(touchpoint);
          const weight = Math.pow(2, -(touchpoints.length - 1 - index));
          const attribution = weight / totalWeight;
          
          totalAttribution += attribution;
          totalRevenue += conversion.value * attribution;
        });
      }
    });
    
    return {
      conversions: totalAttribution,
      revenue: totalRevenue,
      attribution: totalAttribution / conversions.length
    };
  }
}

class CompetitiveAnalysisModel {
  async analyze(competitors, marketData) {
    return competitors.map(competitor => ({
      competitorId: competitor.id,
      competitorName: competitor.name,
      marketShare: this.calculateMarketShare(competitor, marketData),
      pricePosition: this.analyzePricePosition(competitor, marketData),
      strengthsWeaknesses: this.analyzeStrengthsWeaknesses(competitor),
      threatLevel: this.assessThreatLevel(competitor, marketData)
    }));
  }
  
  calculateMarketShare(competitor, marketData) {
    return (competitor.revenue / marketData.totalMarketSize) * 100;
  }
  
  analyzePricePosition(competitor, marketData) {
    const avgPrice = marketData.averagePrice;
    const priceRatio = competitor.averagePrice / avgPrice;
    
    if (priceRatio > 1.2) return 'premium';
    if (priceRatio < 0.8) return 'budget';
    return 'competitive';
  }
  
  analyzeStrengthsWeaknesses(competitor) {
    return {
      strengths: competitor.strengths || ['Market presence', 'Brand recognition'],
      weaknesses: competitor.weaknesses || ['Limited innovation', 'High prices'],
      opportunities: ['Digital transformation', 'New market segments'],
      threats: ['New competitors', 'Market saturation']
    };
  }
  
  assessThreatLevel(competitor, marketData) {
    const marketShare = this.calculateMarketShare(competitor, marketData);
    const growthRate = competitor.growthRate || 0;
    
    if (marketShare > 20 && growthRate > 15) return 'high';
    if (marketShare > 10 || growthRate > 10) return 'medium';
    return 'low';
  }
}

// Insight Card Component
const InsightCard = ({ insight, onDismiss }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'revenue': return CurrencyDollarIcon;
      case 'customer': return UserGroupIcon;
      case 'sales': return TrendingUpIcon;
      case 'marketing': return MegaphoneIcon;
      case 'product': return CubeIcon;
      default: return LightBulbIcon;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'positive': return ArrowTrendingUpIcon;
      case 'negative': return ArrowTrendingDownIcon;
      default: return MinusIcon;
    }
  };

  const Icon = getInsightIcon(insight.type);
  const TrendIcon = getTrendIcon(insight.trend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${getImpactColor(insight.impact)}`}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
              <TrendIcon className={`h-4 w-4 ${
                insight.trend === 'positive' ? 'text-green-600' : 
                insight.trend === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>
            
            <p className="text-gray-600 mb-3">{insight.description}</p>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                {insight.impact.toUpperCase()} IMPACT
              </span>
              
              <span className="text-gray-500">
                Confidence: {(insight.confidence * 100).toFixed(0)}%
              </span>
              
              <span className="text-gray-500">
                {new Date(insight.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            {insight.recommendation && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Recommendation:</strong> {insight.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onDismiss(insight.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ recommendation, onImplement, onDismiss }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
              {recommendation.priority.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600">{recommendation.description}</p>
        </div>
        
        <button
          onClick={() => onDismiss(recommendation.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{recommendation.impact}</div>
          <div className="text-sm text-gray-500">Impact</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{recommendation.effort}</div>
          <div className="text-sm text-gray-500">Effort</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{recommendation.priority}</div>
          <div className="text-sm text-gray-500">Priority</div>
        </div>
      </div>
      
      {recommendation.actions && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
          <ul className="space-y-1">
            {recommendation.actions.map((action, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onImplement(recommendation)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Implement
        </button>
        
        <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Learn More
        </button>
      </div>
    </motion.div>
  );
};

// Predictive Analytics Component
const PredictiveAnalytics = ({ forecasts, onRefresh }) => {
  const [selectedMetric, setSelectedMetric] = useState('sales');
  
  const metrics = [
    { key: 'sales', name: 'Sales Forecast', icon: TrendingUpIcon, color: '#3b82f6' },
    { key: 'revenue', name: 'Revenue Forecast', icon: CurrencyDollarIcon, color: '#10b981' },
    { key: 'customers', name: 'Customer Growth', icon: UserGroupIcon, color: '#f59e0b' }
  ];

  const selectedForecast = forecasts[selectedMetric] || [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {metrics.map((metric) => (
              <option key={metric.key} value={metric.key}>
                {metric.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={selectedForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              stroke="#6b7280"
            />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6'}
              strokeWidth={2}
              dot={{ fill: metrics.find(m => m.key === selectedMetric)?.color || '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        {selectedForecast.slice(-3).map((point, index) => (
          <div key={index} className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {typeof point.value === 'number' ? point.value.toLocaleString() : point.value}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(point.date).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-400">
              {(point.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Business Intelligence Component
const BusinessIntelligence = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [forecasts, setForecasts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const biEngine = useRef(new BusinessIntelligenceEngine());
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Load business data
  const { data: businessData, isLoading: dataLoading } = useQuery(
    'business-intelligence-data',
    async () => {
      const response = await fetch('/api/business-intelligence/data');
      if (!response.ok) throw new Error('Failed to load business data');
      return response.json();
    }
  );

  // Generate insights
  useEffect(() => {
    if (businessData && !dataLoading) {
      generateInsights();
    }
  }, [businessData, dataLoading]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const generatedInsights = await biEngine.current.generateInsights(businessData);
      const generatedRecommendations = biEngine.current.generateRecommendations(generatedInsights, businessData);
      const generatedForecasts = await biEngine.current.generateForecasts(businessData);
      
      setInsights(generatedInsights);
      setRecommendations(generatedRecommendations);
      setForecasts(generatedForecasts);
      
      showNotification('Business insights generated successfully', 'success');
    } catch (error) {
      showNotification('Failed to generate insights', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissInsight = (insightId) => {
    setInsights(insights.filter(insight => insight.id !== insightId));
  };

  const dismissRecommendation = (recommendationId) => {
    setRecommendations(recommendations.filter(rec => rec.id !== recommendationId));
  };

  const implementRecommendation = (recommendation) => {
    showNotification(`Implementation plan created for: ${recommendation.title}`, 'info');
    // In a real app, this would create tasks or workflows
  };

  const tabs = [
    { id: 'insights', name: 'Insights', icon: LightBulbIcon },
    { id: 'recommendations', name: 'Recommendations', icon: RocketLaunchIcon },
    { id: 'forecasts', name: 'Forecasts', icon: BeakerIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'reports', name: 'Reports', icon: DocumentTextIcon }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Intelligence</h1>
              <p className="text-sm text-gray-600">AI-powered insights and predictive analytics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isLoading ? 'Analyzing...' : 'Ready'}
              </span>
            </div>
            
            <button
              onClick={generateInsights}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>Generate Insights</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
                {tab.id === 'insights' && insights.length > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {insights.length}
                  </span>
                )}
                {tab.id === 'recommendations' && recommendations.length > 0 && (
                  <span className="ml-auto bg-green-500 text-white text-xs rounded-full px-2 py-1">
                    {recommendations.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Insights</h2>
                  <p className="text-gray-600">AI-generated insights from your business data</p>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {insights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        onDismiss={dismissInsight}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {insights.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                      <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
                      <p className="text-gray-600 mb-4">Generate insights from your business data</p>
                      <button
                        onClick={generateInsights}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Generate Insights
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommendations</h2>
                  <p className="text-gray-600">Actionable recommendations to improve your business</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {recommendations.map((recommendation) => (
                      <RecommendationCard
                        key={recommendation.id}
                        recommendation={recommendation}
                        onImplement={implementRecommendation}
                        onDismiss={dismissRecommendation}
                      />
                    ))}
                  </AnimatePresence>
                </div>
                
                {recommendations.length === 0 && (
                  <div className="text-center py-12">
                    <RocketLaunchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
                    <p className="text-gray-600">Recommendations will appear based on your insights</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'forecasts' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Predictive Forecasts</h2>
                  <p className="text-gray-600">AI-powered predictions for your business metrics</p>
                </div>
                
                <PredictiveAnalytics
                  forecasts={forecasts}
                  onRefresh={generateInsights}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Advanced Analytics</h2>
                <p className="text-gray-600">Detailed analytics and data exploration tools will be implemented here.</p>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Automated Reports</h2>
                <p className="text-gray-600">Scheduled reports and custom report builder will be implemented here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence; Revenue insights
    const revenueInsight = this.analyzeRevenueTrends(data.revenue, timeframe);
    if (revenueInsight) insights.push(revenueInsight);
    
    // Customer insights
    const customerInsight = this.analyzeCustomerBehavior(data.customers, timeframe);
    if (customerInsight) insights.push(customerInsight);
    
    // Sales insights
    const salesInsight = this.analyzeSalesPerformance(data.sales, timeframe);
    if (salesInsight) insights.push(salesInsight);
    
    // Marketing insights
    const marketingInsight = this.analyzeMarketingEffectiveness(data.marketing, timeframe);
    if (marketingInsight) insights.push(marketingInsight);
    
    // Product insights
    const productInsight = this.analyzeProductPerformance(data.products, timeframe);
    if (productInsight) insights.push(productInsight);
    
    this.insights = insights;
    return insights;
  }

  analyzeRevenueTrends(revenueData, timeframe) {
    if (!revenueData || revenueData.length < 2) return null;
    
    const current = revenueData[revenueData.length - 1];
    const previous = revenueData[revenueData.length - 2];
    const growth = ((current.value - previous.value) / previous.value) * 100;
    
    return {
      id: 'revenue-trend',
      type: 'revenue',
      title: 'Revenue Trend Analysis',
      description: `Revenue ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared to previous period`,
      impact: growth > 10 ? 'high' : growth > 5 ? 'medium' : 'low',
      trend: growth > 0 ? 'positive' : 'negative',
      value: growth,
      recommendation: growth < 0 ? 'Consider reviewing pricing strategy and sales processes' : 'Maintain current growth momentum',
      confidence: 0.85,
      timestamp: Date.now()
    };
  }

  analyzeCustomerBehavior(customerData, timeframe) {
    if (!customerData) return null;
    
    const avgLifetimeValue = customerData.reduce((sum, c) => sum + c.lifetimeValue, 0) / customerData.length;
    const churnRate = (customerData.filter(c => c.status === 'churned').length / customerData.length) * 100;
    
    return {
      id: 'customer-behavior',
      type: 'customer',
      title: 'Customer Behavior Analysis',
      description: `Average customer lifetime value is $${avgLifetimeValue.toFixed(0)} with ${churnRate.toFixed(1)}% churn rate`,
      impact: churnRate > 15 ? 'high' : churnRate > 10 ? 'medium' : 'low',
      trend: churnRate > 15 ? 'negative' : 'neutral',
      value: churnRate,
      recommendation: churnRate > 15 ? 'Implement customer retention programs' : 'Monitor customer satisfaction metrics',
      confidence: 0.78,
      timestamp: Date.now()
    };
  }

  analyzeSalesPerformance(salesData, timeframe) {
    if (!salesData) return null;
    
    const conversionRate = (salesData.closed / salesData.total) * 100;
    const avgDealSize = salesData.totalValue / salesData.closed;
    
    return {
      id: 'sales-performance',
      type: 'sales',
      title: 'Sales Performance Analysis',
      description: `Conversion rate is ${conversionRate.toFixed(1)}% with average deal size of $${avgDealSize.toFixed(0)}`,
      impact: conversionRate < 20 ? 'high' : conversionRate < 30 ? 'medium' : 'low',
      trend: conversionRate > 25 ? 'positive' : 'neutral',
      value: conversionRate,
      recommendation: conversionRate < 20 ? 'Focus on lead qualification and sales training' : 'Optimize deal closing processes',
      confidence: 0.82,
      timestamp: Date.now()
    };
  }

  analyzeMarketingEffectiveness(marketingData, timeframe) {
    if (!marketingData) return null;
    
    const roi = ((marketingData.revenue - marketingData.spend) / marketingData.spend) * 100;
    const cac = marketingData.spend / marketingData.newCustomers;
    
    return {
      id: 'marketing-effectiveness',
      type: 'marketing',
      title: 'Marketing Effectiveness Analysis',
      description: `Marketing ROI is ${roi.toFixed(1)}% with customer acquisition cost of $${cac.toFixed(0)}`,
      impact: roi < 200 ? 'high' : roi < 400 ? 'medium' : 'low',
      trend: roi > 300 ? 'positive' : 'neutral',
      value: roi,
      recommendation: roi < 200 ? 'Review marketing channels and optimize spend allocation' : 'Scale successful marketing campaigns',
      confidence: 0.75,
      timestamp: Date.now()
    };
  }

  analyzeProductPerformance(productData, timeframe) {
    if (!productData) return null;
    
    const topProduct = productData.reduce((max, p) => p.revenue > max.revenue ? p : max, productData[0]);
    const totalRevenue = productData.reduce((sum, p) => sum + p.revenue, 0);
    const topProductShare = (topProduct.revenue / totalRevenue) * 100;
    
    return {
      id: 'product-performance',
      type: 'product',
      title: 'Product Performance Analysis',
      description: `${topProduct.name} is the top performer with ${topProductShare.toFixed(1)}% of total revenue`,
      impact: topProductShare > 50 ? 'high' : 'medium',
      trend: 'neutral',
      value: topProductShare,
      recommendation: topProductShare > 50 ? 'Diversify product portfolio to reduce dependency' : 'Continue monitoring product performance',
      confidence: 0.88,
      timestamp: Date.now()
    };
  }

  // Generate predictive forecasts
  async generateForecasts(data, horizon = 90) {
    const forecasts = {};
    
    // Sales forecast
    forecasts.sales = await this.models.salesForecasting.predict(data.sales, horizon);
    
    // Revenue forecast
    forecasts.revenue = await this.models.salesForecasting.predict(data.revenue, horizon);
    
    // Customer growth forecast
    forecasts.customers = await this.models.customerSegmentation.predictGrowth(data.customers, horizon);
    
    return forecasts;
  }

  // Generate recommendations
  generateRecommendations(insights, data) {
    const recommendations = [];
    
    insights.forEach(insight => {
      switch (insight.type) {
        case 'revenue':
          if (insight.trend === 'negative') {
            recommendations.push({
              id: 'revenue-optimization',
              title: 'Revenue Optimization',
              description: 'Implement dynamic pricing and upselling strategies',
              priority: 'high',
              impact: 'high',
              effort: 'medium',
              category: 'revenue',
              actions: [
                'Review pricing strategy',
                'Implement upselling programs',
                'Optimize product mix',
                'Improve customer retention'
              ]
            });
          }
          break;
          
        case 'customer':
          if (insight.value > 15) {
            recommendations.push({
              id: 'churn-reduction',
              title: 'Customer Churn Reduction',
              description: 'Implement proactive customer success programs',
              priority: 'high',
              impact: 'high',
              effort: 'high',
              category: 'customer',
              actions: [
                'Implement early warning system',
                'Create customer success team',
                'Develop retention campaigns',
                'Improve customer onboarding'
              ]
            });
          }
          break;
          
        case 'sales':
          if (insight.value < 20) {
            recommendations.push({
              id: 'sales-optimization',
              title: 'Sales Process Optimization',
              description: 'Improve lead qualification and sales training',
              priority: 'medium',
              impact: 'high',
              effort: 'medium',
              category: 'sales',
              actions: [
                'Implement lead scoring',
                'Provide sales training',
                'Optimize sales funnel',
                'Improve CRM processes'
              ]
            });
          }
          break;
          
        case 'marketing':
          if (insight.value < 200) {
            recommendations.push({
              id: 'marketing-optimization',
              title: 'Marketing ROI Optimization',
              description: 'Optimize marketing spend allocation and channels',
              priority: 'medium',
              impact: 'medium',
              effort: 'low',
              category: 'marketing',
              actions: [
                'Analyze channel performance',
                'Reallocate marketing budget',
                'Improve targeting',
                'Test new channels'
              ]
            });
          }
          break;
      }
    });
    
    this.recommendations = recommendations;
    return recommendations;
  }
}

// Predictive Models
class SalesForecastingModel {
  async predict(data, horizon) {
    // Simplified linear regression for demo
    if (!data || data.length < 3) return [];
    
    const trend = this.calculateTrend(data);
    const seasonality = this.calculateSeasonality(data);
    
    const forecast = [];
    const lastValue = data[data.length - 1].value;
    const lastDate = new Date(data[data.length - 1].date);
    
    for (let i = 1; i <= horizon; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      const trendValue = lastValue + (trend * i);
      const seasonalAdjustment = seasonality[i % seasonality.length] || 1;
      const predictedValue = trendValue * seasonalAdjustment;
      
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        value: Math.max(0, predictedValue),
        confidence: Math.max(0.3, 0.9 - (i / horizon) * 0.6)
      });
    }
    
    return forecast;
  }
  
  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + (i * d.value), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
  
  calculateSeasonality(data) {
    // Simplified seasonal adjustment
    const seasonalFactors = [1.0, 0.95, 1.05, 1.1, 1.0, 0.9, 0.85, 0.9, 1.05, 1.1, 1.15, 1.2];
    return seasonalFactors;
  }
}

class CustomerSegmentationModel {
  async segment(customers) {
    // RFM Analysis simulation
    const segments = {
      champions: [],
      loyalCustomers: [],
      potentialLoyalists: [],
      newCustomers: [],
      promisers: [],
      needsAttention: [],
      aboutToSleep: [],
      atRisk: [],
      cannotLoseThem: [],
      hibernating: [],
      lost: []
    };
    
    customers.forEach(customer => {
      const rfmScore = this.calculateRFMScore(customer);
      const segment = this.assignSegment(rfmScore);
      segments[segment].push(customer);
    });
    
    return segments;
  }
  
  calculateRFMScore(customer) {
    // Simplified RFM scoring
    const recency = Math.min(5, Math.max(1, 6 - Math.floor(customer.daysSinceLastPurchase / 30)));
    const frequency = Math.min(5, Math.max(1, Math.floor(customer.totalOrders / 2)));
    const monetary = Math.min(5, Math.max(1, Math.floor(customer.totalSpent / 1000)));
    
    return { recency, frequency, monetary };
  }
  
  assignSegment(rfmScore) {
    const { recency, frequency, monetary } = rfmScore;
    const total = recency + frequency + monetary;
    
    if (total >= 13) return 'champions';
    if (total >= 11) return 'loyalCustomers';
    if (total >= 9) return 'potentialLoyalists';
    if (recency >= 4 && total >= 7) return 'newCustomers';
    if (total >= 7) return 'promisers';
    if (total >= 5) return 'needsAttention';
    if (recency <= 2 && total >= 4) return 'aboutToSleep';
    if (monetary >= 3 && total >= 4) return 'cannotLoseThem';
    if (total >= 3) return 'hibernating';
    return 'lost';
  }
  
  async predictGrowth(customers, horizon) {
    const currentCount = customers.length;
    const growthRate = 0.05; // 5% monthly growth
    
    const forecast = [];
    for (let i = 1; i <= horizon; i++) {
      const predictedCount = Math.floor(currentCount * Math.pow(1 + growthRate, i / 30));
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: predictedCount,
        confidence: Math.max(0.4, 0.9 - (i / horizon) * 0.5)
      });
    }
    
    return forecast;
  }
}

class ChurnPredictionModel {
  async predict(customers) {
    return customers.map(customer => ({
      customerId: customer.id,
      churnProbability: this.calculateChurnProbability(customer),
      riskLevel: this.getRiskLevel(customer),
      factors: this.getChurnFactors(customer)
    }));
  }
  
  calculateChurnProbability(customer) {
    let score = 0;
    
    // Days since last purchase
    if (customer.daysSinceLastPurchase > 90) score += 0.3;
    else if (customer.daysSinceLastPurchase > 60) score += 0.2;
    else if (customer.daysSinceLastPurchase > 30) score += 0.1;
    
    // Support tickets
    if (customer.supportTickets > 5) score += 0.2;
    else if (customer.supportTickets > 2) score += 0.1;
    
    // Engagement score
    if (customer.engagementScore < 30) score += 0.3;
    else if (customer.engagementScore < 50) score += 0.2;
    
    // Payment issues
    if (customer.paymentIssues > 0) score += 0.2;
    
    return Math.min(1, score);
  }
  
  getRiskLevel(customer) {
    const probability = this.calculateChurnProbability(customer);
    if (probability > 0.7) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  }
  
  getChurnFactors(customer) {
    const factors = [];
    
    if (customer.daysSinceLastPurchase > 60) {
      factors.push('Long time since last purchase');
    }
    if (customer.supportTickets > 3) {
      factors.push('High number of support tickets');
    }
    if (customer.engagementScore < 40) {
      factors.push('Low engagement score');
    }
    if (customer.paymentIssues > 0) {
      factors.push('Payment issues');
    }
    
    return factors;
  }
}

class LeadScoringModel {
  async score(leads) {
    return leads.map(lead => ({
      leadId: lead.id,
      score: this.calculateLeadScore(lead),
      grade: this.getLeadGrade(lead),
      factors: this.getScoringFactors(lead)
    }));
  }
  
  calculateLeadScore(lead) {
    let score = 0;
    
    // Demographic scoring
    if (lead.jobTitle && lead.jobTitle.toLowerCase().includes('manager')) score += 20;
    if (lead.jobTitle && lead.jobTitle.toLowerCase().includes('director')) score += 30;
    if (lead.jobTitle && lead.jobTitle.toLowerCase().includes('vp')) score += 40;
    if (lead.jobTitle && lead.jobTitle.toLowerCase().includes('ceo')) score += 50;
    
    // Company size
    if (lead.companySize > 1000) score += 30;
    else if (lead.companySize > 100) score += 20;
    else if (lead.companySize > 10) score += 10;
    
    // Behavioral scoring
    if (lead.websiteVisits > 10) score += 20;
    if (lead.emailOpens > 5) score += 15;
    if (lead.contentDownloads > 3) score += 25;
    if (lead.demoRequested) score += 40;
    
    //