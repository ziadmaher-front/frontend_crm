import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  MessageSquare,
  Heart,
  Share,
  Eye,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Bell,
  Search,
  Filter,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Globe,
  Hash,
  AtSign,
  Send,
  Image,
  Video,
  Link,
  Bookmark,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Mic,
  Camera,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Archive,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Forward,
  Smile,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';
import { AnimatedCard, StaggerContainer } from '@/components/MicroInteractions';

const SocialMediaIntegration = ({ 
  connectedAccounts = [],
  onAccountConnect,
  onPostSchedule,
  onEngagementAction,
  socialSettings = {}
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'linkedin']);
  const [isListening, setIsListening] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState(['CRM', 'sales', 'business']);

  // Social media platforms
  const platforms = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      connected: true,
      followers: 12500,
      engagement: 4.2,
      posts: 156,
      mentions: 89
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0077B5',
      connected: true,
      followers: 8900,
      engagement: 6.8,
      posts: 78,
      mentions: 45
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      connected: false,
      followers: 0,
      engagement: 0,
      posts: 0,
      mentions: 0
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: '#E4405F',
      connected: false,
      followers: 0,
      engagement: 0,
      posts: 0,
      mentions: 0
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: '#FF0000',
      connected: false,
      followers: 0,
      engagement: 0,
      posts: 0,
      mentions: 0
    }
  ];

  // Social listening data
  const listeningData = [
    {
      id: 1,
      platform: 'twitter',
      author: '@techstartup_co',
      content: 'Looking for a reliable CRM solution for our growing team. Any recommendations?',
      timestamp: '2 hours ago',
      sentiment: 'neutral',
      engagement: { likes: 12, shares: 3, comments: 8 },
      keywords: ['CRM', 'team'],
      opportunity: 'high'
    },
    {
      id: 2,
      platform: 'linkedin',
      author: 'Sarah Johnson',
      content: 'Just implemented a new sales process and seeing 30% improvement in conversion rates!',
      timestamp: '4 hours ago',
      sentiment: 'positive',
      engagement: { likes: 45, shares: 12, comments: 18 },
      keywords: ['sales', 'conversion'],
      opportunity: 'medium'
    },
    {
      id: 3,
      platform: 'twitter',
      author: '@business_guru',
      content: 'Struggling with lead management. Current system is too complex and slow.',
      timestamp: '6 hours ago',
      sentiment: 'negative',
      engagement: { likes: 8, shares: 2, comments: 15 },
      keywords: ['lead management', 'system'],
      opportunity: 'high'
    },
    {
      id: 4,
      platform: 'linkedin',
      author: 'Mike Chen',
      content: 'Great webinar on sales automation! Really opened my eyes to new possibilities.',
      timestamp: '8 hours ago',
      sentiment: 'positive',
      engagement: { likes: 67, shares: 23, comments: 31 },
      keywords: ['sales automation', 'webinar'],
      opportunity: 'low'
    }
  ];

  // Engagement metrics
  const engagementMetrics = [
    { period: 'Jan', mentions: 45, engagement: 3.2, reach: 12000 },
    { period: 'Feb', mentions: 52, engagement: 3.8, reach: 15000 },
    { period: 'Mar', mentions: 38, engagement: 2.9, reach: 11000 },
    { period: 'Apr', mentions: 67, engagement: 4.5, reach: 18000 },
    { period: 'May', mentions: 73, engagement: 5.1, reach: 22000 },
    { period: 'Jun', mentions: 89, engagement: 6.2, reach: 28000 }
  ];

  // Scheduled posts
  const scheduledPosts = [
    {
      id: 1,
      content: 'Excited to share our latest CRM features! Check out the new dashboard design.',
      platforms: ['twitter', 'linkedin'],
      scheduledTime: '2024-12-20 10:00',
      status: 'scheduled',
      media: ['image1.jpg']
    },
    {
      id: 2,
      content: 'Join us for our upcoming webinar on sales automation best practices.',
      platforms: ['linkedin', 'facebook'],
      scheduledTime: '2024-12-21 14:30',
      status: 'scheduled',
      media: []
    },
    {
      id: 3,
      content: 'Customer success story: How TechCorp increased their sales by 40% using our CRM.',
      platforms: ['twitter', 'linkedin', 'facebook'],
      scheduledTime: '2024-12-22 09:15',
      status: 'draft',
      media: ['video1.mp4']
    }
  ];

  // Trending topics
  const trendingTopics = [
    { keyword: 'CRM', mentions: 1250, trend: 'up', change: 15 },
    { keyword: 'sales automation', mentions: 890, trend: 'up', change: 23 },
    { keyword: 'lead generation', mentions: 675, trend: 'down', change: -8 },
    { keyword: 'customer success', mentions: 543, trend: 'up', change: 12 },
    { keyword: 'business intelligence', mentions: 432, trend: 'stable', change: 2 },
    { keyword: 'digital transformation', mentions: 321, trend: 'up', change: 18 }
  ];

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOpportunityColor = (opportunity) => {
    switch (opportunity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPlatformIcon = (platformId) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return MessageSquare;
    return platform.icon;
  };

  const PlatformCard = ({ platform, onConnect, onDisconnect }) => {
    const Icon = platform.icon;
    
    return (
      <AnimatedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${platform.color}20` }}
            >
              <Icon 
                className="w-6 h-6"
                style={{ color: platform.color }}
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{platform.name}</h3>
              <p className="text-sm text-gray-600">
                {platform.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={platform.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {platform.connected ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              size="sm"
              variant={platform.connected ? 'outline' : 'default'}
              onClick={() => platform.connected ? onDisconnect(platform.id) : onConnect(platform.id)}
            >
              {platform.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
        
        {platform.connected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Followers</p>
              <p className="font-medium">{platform.followers.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Engagement</p>
              <p className="font-medium">{platform.engagement}%</p>
            </div>
            <div>
              <p className="text-gray-600">Posts</p>
              <p className="font-medium">{platform.posts}</p>
            </div>
            <div>
              <p className="text-gray-600">Mentions</p>
              <p className="font-medium">{platform.mentions}</p>
            </div>
          </div>
        )}
      </AnimatedCard>
    );
  };

  const ListeningCard = ({ item, onEngage, onBookmark, onFlag }) => {
    const Icon = getPlatformIcon(item.platform);
    
    return (
      <AnimatedCard className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">{item.author}</p>
              <p className="text-sm text-gray-600">{item.timestamp}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(item.sentiment)}>
              {item.sentiment}
            </Badge>
            <Badge className={getOpportunityColor(item.opportunity)}>
              {item.opportunity}
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-800 mb-3">{item.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {item.engagement.likes}
            </span>
            <span className="flex items-center gap-1">
              <Share className="w-4 h-4" />
              {item.engagement.shares}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {item.engagement.comments}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onBookmark(item.id)}>
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onFlag(item.id)}>
              <Flag className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={() => onEngage(item.id)}>
              <Reply className="w-4 h-4 mr-1" />
              Engage
            </Button>
          </div>
        </div>
        
        {item.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{keyword}
              </Badge>
            ))}
          </div>
        )}
      </AnimatedCard>
    );
  };

  const ScheduledPostCard = ({ post, onEdit, onDelete, onPublish }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-gray-800 mb-2">{post.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {new Date(post.scheduledTime).toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              {post.platforms.map(platformId => {
                const Icon = getPlatformIcon(platformId);
                return <Icon key={platformId} className="w-4 h-4" />;
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
            {post.status}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => onEdit(post.id)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(post.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
          {post.status === 'draft' && (
            <Button size="sm" onClick={() => onPublish(post.id)}>
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {post.media.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Image className="w-4 h-4" />
          <span>{post.media.length} media file(s)</span>
        </div>
      )}
    </AnimatedCard>
  );

  const TrendingTopicCard = ({ topic }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-900">{topic.keyword}</p>
            <p className="text-sm text-gray-600">{topic.mentions} mentions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {topic.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
          {topic.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
          {topic.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
          <span className={`text-sm font-medium ${
            topic.change > 0 ? 'text-green-600' : 
            topic.change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {topic.change > 0 ? '+' : ''}{topic.change}%
          </span>
        </div>
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Social Media Integration</h2>
            <p className="text-gray-600">Monitor, engage, and manage your social presence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Social Listening</span>
            <Switch checked={isListening} onCheckedChange={setIsListening} />
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Followers</p>
              <p className="text-2xl font-bold text-gray-900">21,400</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">5.2%</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+0.8%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mentions</p>
              <p className="text-2xl font-bold text-gray-900">134</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+23</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <AtSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reach</p>
              <p className="text-2xl font-bold text-gray-900">28K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">+15%</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="listening">Listening</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Platform Connections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Connected Platforms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map(platform => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  onConnect={(id) => console.log('Connect', id)}
                  onDisconnect={(id) => console.log('Disconnect', id)}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="space-y-3">
              {listeningData.slice(0, 3).map(item => (
                <ListeningCard
                  key={item.id}
                  item={item}
                  onEngage={(id) => console.log('Engage', id)}
                  onBookmark={(id) => console.log('Bookmark', id)}
                  onFlag={(id) => console.log('Flag', id)}
                />
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTopics.slice(0, 6).map((topic, index) => (
                <TrendingTopicCard key={index} topic={topic} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="listening" className="space-y-6">
          {/* Listening Controls */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Social Listening</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-600" />
                <Input placeholder="Search mentions..." className="w-64" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Listening Feed */}
          <div className="space-y-4">
            {listeningData.map(item => (
              <ListeningCard
                key={item.id}
                item={item}
                onEngage={(id) => console.log('Engage', id)}
                onBookmark={(id) => console.log('Bookmark', id)}
                onFlag={(id) => console.log('Flag', id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="publishing" className="space-y-6">
          {/* Post Composer */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Post</h3>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-24"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <Link className="w-4 h-4 mr-2" />
                    Link
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="w-4 h-4 mr-2" />
                    Emoji
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-48"
                  />
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Post to:</span>
                {platforms.filter(p => p.connected).map(platform => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant={selectedPlatforms.includes(platform.id) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedPlatforms(prev => 
                          prev.includes(platform.id) 
                            ? prev.filter(id => id !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </AnimatedCard>

          {/* Scheduled Posts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Posts</h3>
            <div className="space-y-3">
              {scheduledPosts.map(post => (
                <ScheduledPostCard
                  key={post.id}
                  post={post}
                  onEdit={(id) => console.log('Edit', id)}
                  onDelete={(id) => console.log('Delete', id)}
                  onPublish={(id) => console.log('Publish', id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Engagement Chart */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="mentions" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="reach" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </AnimatedCard>

          {/* Platform Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Platform Performance</h4>
              <div className="space-y-4">
                {platforms.filter(p => p.connected).map(platform => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{platform.engagement}%</p>
                      <p className="text-sm text-gray-600">engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Top Performing Content</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">CRM automation tips</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span>156 likes</span>
                    <span>23 shares</span>
                    <span>45 comments</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Customer success story</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span>134 likes</span>
                    <span>18 shares</span>
                    <span>32 comments</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Product update announcement</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                    <span>98 likes</span>
                    <span>12 shares</span>
                    <span>28 comments</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Listening Settings */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Listening Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keywords">Keywords to Monitor</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => setSelectedKeywords(prev => prev.filter((_, i) => i !== index))}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add keyword..."
                    className="w-32"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        setSelectedKeywords(prev => [...prev, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Real-time Monitoring</p>
                    <p className="text-sm text-gray-600">Monitor mentions in real-time</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sentiment Analysis</p>
                    <p className="text-sm text-gray-600">Analyze sentiment of mentions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Opportunity Detection</p>
                    <p className="text-sm text-gray-600">Identify sales opportunities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-notifications</p>
                    <p className="text-sm text-gray-600">Get notified of important mentions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Publishing Settings */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-posting</p>
                    <p className="text-sm text-gray-600">Automatically post scheduled content</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cross-platform Posting</p>
                    <p className="text-sm text-gray-600">Post to multiple platforms at once</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Content Optimization</p>
                    <p className="text-sm text-gray-600">Optimize content for each platform</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Engagement Tracking</p>
                    <p className="text-sm text-gray-600">Track post performance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Export Settings */}
          <AnimatedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Reporting</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Analytics
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Mentions
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Scheduled Posts
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Reports
              </Button>
            </div>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaIntegration;