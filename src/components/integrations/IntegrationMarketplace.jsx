import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Star, 
  Download, 
  CheckCircle, 
  Settings,
  Zap,
  Globe,
  Shield,
  Workflow,
  Database,
  Mail,
  Calendar,
  MessageSquare,
  Phone,
  CreditCard,
  BarChart3,
  Users,
  FileText,
  Cloud,
  Smartphone,
  Video,
  Headphones,
  ShoppingCart,
  Truck,
  Building,
  Briefcase,
  Target,
  TrendingUp,
  Lock,
  Key,
  Plug,
  Link,
  ArrowRight,
  ExternalLink,
  Plus,
  Minus,
  Eye,
  Code,
  Palette,
  Layers
} from "lucide-react";
import { cn } from '@/lib/utils';

// Integration Categories
const categories = [
  { id: 'all', label: 'All Integrations', icon: Globe, count: 150 },
  { id: 'communication', label: 'Communication', icon: MessageSquare, count: 25 },
  { id: 'marketing', label: 'Marketing', icon: Target, count: 30 },
  { id: 'sales', label: 'Sales', icon: TrendingUp, count: 20 },
  { id: 'productivity', label: 'Productivity', icon: Briefcase, count: 35 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, count: 15 },
  { id: 'finance', label: 'Finance', icon: CreditCard, count: 12 },
  { id: 'support', label: 'Support', icon: Headphones, count: 13 }
];

// Sample integrations data
const integrations = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'communication',
    logo: '🔔',
    rating: 4.8,
    installs: '50K+',
    price: 'Free',
    features: ['Real-time notifications', 'Team channels', 'File sharing', 'Bot integration'],
    status: 'available',
    verified: true,
    trending: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Inbound marketing, sales, and service platform',
    category: 'marketing',
    logo: '🧡',
    rating: 4.7,
    installs: '100K+',
    price: 'Premium',
    features: ['Lead tracking', 'Email marketing', 'Sales pipeline', 'Analytics'],
    status: 'connected',
    verified: true,
    trending: false
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'World\'s #1 CRM platform',
    category: 'sales',
    logo: '☁️',
    rating: 4.6,
    installs: '200K+',
    price: 'Enterprise',
    features: ['Contact management', 'Opportunity tracking', 'Forecasting', 'Reports'],
    status: 'available',
    verified: true,
    trending: false
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email integration for seamless communication',
    category: 'communication',
    logo: '📧',
    rating: 4.9,
    installs: '1M+',
    price: 'Free',
    features: ['Email sync', 'Contact import', 'Calendar integration', 'Templates'],
    status: 'connected',
    verified: true,
    trending: true
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing and webinar platform',
    category: 'communication',
    logo: '📹',
    rating: 4.5,
    installs: '75K+',
    price: 'Freemium',
    features: ['Video meetings', 'Screen sharing', 'Recording', 'Webinars'],
    status: 'available',
    verified: true,
    trending: true
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Online payment processing platform',
    category: 'finance',
    logo: '💳',
    rating: 4.8,
    installs: '80K+',
    price: 'Pay per use',
    features: ['Payment processing', 'Subscription billing', 'Invoice management', 'Analytics'],
    status: 'available',
    verified: true,
    trending: false
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    category: 'marketing',
    logo: '🐵',
    rating: 4.4,
    installs: '60K+',
    price: 'Freemium',
    features: ['Email campaigns', 'Automation', 'Audience segmentation', 'Analytics'],
    status: 'available',
    verified: true,
    trending: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation platform',
    category: 'productivity',
    logo: '⚡',
    rating: 4.7,
    installs: '120K+',
    price: 'Freemium',
    features: ['Workflow automation', '3000+ app connections', 'Triggers & actions', 'Multi-step zaps'],
    status: 'available',
    verified: true,
    trending: true
  }
];

// Integration Card Component
const IntegrationCard = ({ integration, onConnect, onDisconnect, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = () => {
    if (integration.status === 'connected') {
      onDisconnect(integration.id);
    } else {
      onConnect(integration.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {integration.trending && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-orange-500 text-white">
              🔥 Trending
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{integration.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                {integration.verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{integration.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {integration.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {integration.installs}
                </div>
                <Badge variant="outline" className="text-xs">
                  {integration.price}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4"
              >
                <h4 className="font-semibold text-sm mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {integration.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAction}
              className={cn(
                "flex-1",
                integration.status === 'connected' 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-blue-500 hover:bg-blue-600"
              )}
            >
              {integration.status === 'connected' ? (
                <>
                  <Minus className="w-4 h-4 mr-2" />
                  Disconnect
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minus className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onViewDetails(integration)}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Integration Details Modal
const IntegrationDetailsModal = ({ integration, isOpen, onClose, onConnect }) => {
  if (!isOpen || !integration) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-6xl">{integration.logo}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{integration.name}</h2>
                {integration.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-gray-600 mb-4">{integration.description}</p>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {integration.rating} rating
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {integration.installs} installs
                </div>
                <Badge variant="outline">
                  {integration.price}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Features & Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {integration.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Setup Instructions</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Authorize Connection</p>
                    <p className="text-sm text-gray-600">Grant permission to access your {integration.name} account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Configure Settings</p>
                    <p className="text-sm text-gray-600">Customize sync preferences and data mapping</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Test Connection</p>
                    <p className="text-sm text-gray-600">Verify the integration is working correctly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button 
              onClick={() => {
                onConnect(integration.id);
                onClose();
              }}
              className="flex-1"
              disabled={integration.status === 'connected'}
            >
              {integration.status === 'connected' ? 'Already Connected' : 'Connect Now'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Connected Integrations Panel
const ConnectedIntegrations = ({ connectedIntegrations, onDisconnect, onConfigure }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="w-5 h-5" />
          Connected Integrations ({connectedIntegrations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connectedIntegrations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No integrations connected yet</p>
            <p className="text-sm">Browse the marketplace to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connectedIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{integration.logo}</div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-gray-600">Connected & syncing</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onConfigure(integration.id)}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDisconnect(integration.id)}>
                    <Link className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const IntegrationMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [connectedIds, setConnectedIds] = useState(['hubspot', 'gmail']);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedIntegrations = integrations.filter(integration => 
    connectedIds.includes(integration.id)
  );

  const handleConnect = (integrationId) => {
    setConnectedIds(prev => [...prev, integrationId]);
  };

  const handleDisconnect = (integrationId) => {
    setConnectedIds(prev => prev.filter(id => id !== integrationId));
  };

  const handleViewDetails = (integration) => {
    setSelectedIntegration(integration);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Integration Marketplace
          </h1>
          <p className="text-gray-600 mt-1">Connect your favorite tools and automate workflows</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">
            {connectedIntegrations.length} Connected
          </Badge>
          <Button variant="outline">
            <Code className="w-4 h-4 mr-2" />
            API Docs
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <category.icon className="w-4 h-4" />
            {category.label}
            <Badge variant="secondary" className="ml-1 text-xs">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <ConnectedIntegrations
          connectedIntegrations={connectedIntegrations}
          onDisconnect={handleDisconnect}
          onConfigure={(id) => console.log('Configure:', id)}
        />
      )}

      {/* Integration Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {selectedCategory === 'all' ? 'All Integrations' : 
             categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <p className="text-sm text-gray-600">
            {filteredIntegrations.length} integrations found
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <IntegrationCard
                integration={{
                  ...integration,
                  status: connectedIds.includes(integration.id) ? 'connected' : 'available'
                }}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onViewDetails={handleViewDetails}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Integration Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <IntegrationDetailsModal
            integration={selectedIntegration}
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            onConnect={handleConnect}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrationMarketplace;