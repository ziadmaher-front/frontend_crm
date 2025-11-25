import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Brain, 
  Zap, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  User, 
  DollarSign, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Settings, 
  Filter, 
  Search, 
  X, 
  Eye, 
  EyeOff, 
  Star, 
  Flag, 
  Bookmark, 
  Archive, 
  Trash2, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Shield, 
  AlertCircle, 
  Lightbulb, 
  Users, 
  Building, 
  FileText, 
  Link, 
  ExternalLink, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe, 
  Wifi, 
  WifiOff, 
  Database, 
  Server, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  Power, 
  PowerOff 
} from 'lucide-react';

export default function IntelligentNotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    smartPrioritization: true,
    contextualFiltering: true,
    soundEnabled: true,
    desktopNotifications: true,
    emailDigest: true,
    quietHours: { enabled: true, start: '18:00', end: '09:00' },
    priorities: {
      critical: true,
      high: true,
      medium: true,
      low: false
    },
    categories: {
      deals: true,
      leads: true,
      tasks: true,
      meetings: true,
      system: true,
      security: false
    }
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState({});
  const [notificationStats, setNotificationStats] = useState({});

  const audioRef = useRef(null);

  useEffect(() => {
    generateNotifications();
    generateAIInsights();
    calculateStats();
    
    // Disabled automatic notification generation
    // Notifications will only appear when triggered by user actions or real events
    // const interval = setInterval(() => {
    //   if (settings.enabled && Math.random() > 0.7) {
    //     addNewNotification();
    //   }
    // }, 10000);

    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings.smartPrioritization) {
      prioritizeNotifications();
    }
  }, [notifications, settings.smartPrioritization]);

  const generateNotifications = () => {
    const sampleNotifications = [
      {
        id: 1,
        type: 'deal',
        priority: 'critical',
        title: 'High-value deal at risk',
        message: 'TechCorp deal ($250K) hasn\'t been updated in 5 days. Probability dropped to 60%.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionable: true,
        context: {
          dealId: 'D001',
          dealValue: 250000,
          probability: 60,
          daysStale: 5,
          assignee: 'John Smith'
        },
        aiScore: 95,
        suggestedActions: [
          'Schedule follow-up call',
          'Send proposal update',
          'Review competitor analysis'
        ]
      },
      {
        id: 2,
        type: 'lead',
        priority: 'high',
        title: 'Hot lead requires immediate attention',
        message: 'Sarah Johnson from InnovateTech visited pricing page 5 times today.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionable: true,
        context: {
          leadId: 'L045',
          leadScore: 92,
          visits: 5,
          lastActivity: 'pricing_page',
          source: 'website'
        },
        aiScore: 88,
        suggestedActions: [
          'Send personalized email',
          'Schedule demo call',
          'Assign to senior rep'
        ]
      },
      {
        id: 3,
        type: 'task',
        priority: 'medium',
        title: 'Follow-up tasks overdue',
        message: '3 follow-up tasks are overdue. Average delay: 2.5 days.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: true,
        actionable: true,
        context: {
          overdueCount: 3,
          averageDelay: 2.5,
          totalTasks: 15
        },
        aiScore: 72,
        suggestedActions: [
          'Reschedule tasks',
          'Delegate to team',
          'Update priorities'
        ]
      },
      {
        id: 4,
        type: 'meeting',
        priority: 'high',
        title: 'Meeting preparation needed',
        message: 'Demo with CloudFirst Systems in 2 hours. No preparation notes found.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        read: false,
        actionable: true,
        context: {
          meetingId: 'M123',
          company: 'CloudFirst Systems',
          timeUntil: 120,
          preparationStatus: 'incomplete'
        },
        aiScore: 85,
        suggestedActions: [
          'Review company profile',
          'Prepare demo script',
          'Check technical setup'
        ]
      },
      {
        id: 5,
        type: 'system',
        priority: 'low',
        title: 'Weekly performance report ready',
        message: 'Your weekly performance report is available for review.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: true,
        actionable: false,
        context: {
          reportType: 'weekly_performance',
          period: 'Week 12, 2024'
        },
        aiScore: 45,
        suggestedActions: []
      },
      {
        id: 6,
        type: 'security',
        priority: 'critical',
        title: 'Unusual login activity detected',
        message: 'Login from new device in different location. Please verify.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        actionable: true,
        context: {
          location: 'New York, NY',
          device: 'iPhone 15',
          ipAddress: '192.168.1.100'
        },
        aiScore: 98,
        suggestedActions: [
          'Verify login',
          'Change password',
          'Enable 2FA'
        ]
      }
    ];

    setNotifications(sampleNotifications);
  };

  const addNewNotification = () => {
    const newNotifications = [
      {
        type: 'lead',
        priority: 'high',
        title: 'New qualified lead',
        message: 'Michael Chen from DataDriven Analytics just submitted a demo request.',
        context: { leadScore: 85, source: 'website' },
        aiScore: 82
      },
      {
        type: 'deal',
        priority: 'medium',
        title: 'Deal stage updated',
        message: 'RetailMax deal moved to negotiation stage.',
        context: { dealValue: 150000, stage: 'negotiation' },
        aiScore: 68
      },
      {
        type: 'task',
        priority: 'low',
        title: 'Task completed',
        message: 'Follow-up email sent to prospect.',
        context: { taskType: 'follow_up' },
        aiScore: 35
      }
    ];

    const randomNotification = newNotifications[Math.floor(Math.random() * newNotifications.length)];
    const notification = {
      ...randomNotification,
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      actionable: randomNotification.type !== 'task',
      suggestedActions: randomNotification.type === 'lead' ? 
        ['Send welcome email', 'Schedule call'] : 
        randomNotification.type === 'deal' ? 
        ['Review proposal', 'Update timeline'] : 
        []
    };

    setNotifications(prev => [notification, ...prev]);
    
    if (settings.soundEnabled) {
      playNotificationSound();
    }
    
    if (settings.desktopNotifications && 'Notification' in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  };

  const generateAIInsights = () => {
    const insights = {
      patterns: [
        'Deal notifications are 40% more likely to be actionable on Tuesdays',
        'Lead notifications with scores >80 have 85% follow-up rate',
        'Security alerts require immediate attention 95% of the time'
      ],
      recommendations: [
        'Enable quiet hours during lunch (12-1 PM) to reduce interruptions',
        'Increase lead notification threshold to 85 to reduce noise',
        'Auto-assign high-priority deal notifications to senior reps'
      ],
      efficiency: {
        responseTime: '4.2 minutes',
        actionRate: '78%',
        falsePositives: '12%'
      }
    };

    setAiInsights(insights);
  };

  const calculateStats = () => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      critical: notifications.filter(n => n.priority === 'critical').length,
      actionable: notifications.filter(n => n.actionable).length,
      todayCount: notifications.filter(n => 
        new Date(n.timestamp).toDateString() === new Date().toDateString()
      ).length
    };

    setNotificationStats(stats);
  };

  const prioritizeNotifications = () => {
    setNotifications(prev => [...prev].sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.priority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Secondary sort by AI score
      return (b.aiScore || 0) - (a.aiScore || 0);
    }));
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const executeAction = async (notificationId, action) => {
    setIsProcessing(true);
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mark as read and update
    markAsRead(notificationId);
    setIsProcessing(false);
    
    // Show success feedback
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      addNewNotification({
        type: 'system',
        priority: 'low',
        title: 'Action completed',
        message: `${action} executed successfully for ${notification.title}`,
        actionable: false
      });
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      deal: DollarSign,
      lead: User,
      task: CheckCircle,
      meeting: Calendar,
      system: Settings,
      security: Shield
    };
    return icons[type] || Bell;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-blue-600 bg-blue-50 border-blue-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority] || colors.low;
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || colors.low;
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by category
    if (filter !== 'all' && notification.type !== filter) return false;
    
    // Filter by settings
    if (!settings.categories[notification.type]) return false;
    if (!settings.priorities[notification.priority]) return false;
    
    // Filter by search term
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Intelligent Notifications
          </h2>
          <p className="text-gray-600">AI-powered priority-based alert system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Eye className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Notifications */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{notificationStats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{notificationStats.unread}</div>
                    <div className="text-sm text-gray-600">Unread</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold">{notificationStats.critical}</div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{notificationStats.actionable}</div>
                    <div className="text-sm text-gray-600">Actionable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deal">Deals</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="task">Tasks</SelectItem>
                      <SelectItem value="meeting">Meetings</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const NotificationIcon = getNotificationIcon(notification.type);
              
              return (
                <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                        <NotificationIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm">{notification.title}</h3>
                          <Badge className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          {notification.aiScore && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {notification.aiScore}% AI
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                        
                        {notification.context && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <div className="text-xs text-gray-600 space-y-1">
                              {Object.entries(notification.context).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {notification.suggestedActions && notification.suggestedActions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {notification.suggestedActions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                onClick={() => executeAction(notification.id, action)}
                                disabled={isProcessing}
                                className="text-xs"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <Zap className="h-3 w-3 mr-1" />
                                )}
                                {action}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Patterns</h4>
                <div className="space-y-2">
                  {aiInsights.patterns?.map((pattern, index) => (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-blue-50 rounded">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {aiInsights.recommendations?.map((rec, index) => (
                    <div key={index} className="text-xs text-gray-600 p-2 bg-green-50 rounded">
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Efficiency Metrics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Avg Response:</span>
                    <span className="font-medium">{aiInsights.efficiency?.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Action Rate:</span>
                    <span className="font-medium">{aiInsights.efficiency?.actionRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>False Positives:</span>
                    <span className="font-medium">{aiInsights.efficiency?.falsePositives}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Prioritization</span>
                <Switch
                  checked={settings.smartPrioritization}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, smartPrioritization: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Sound Alerts</span>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEnabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Desktop Notifications</span>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, desktopNotifications: checked }))
                  }
                />
              </div>
              
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Priority Filters</h4>
                <div className="space-y-2">
                  {Object.entries(settings.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{priority}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            priorities: { ...prev.priorities, [priority]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Category Filters</h4>
                <div className="space-y-2">
                  {Object.entries(settings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-xs capitalize">{category}</span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({
                            ...prev,
                            categories: { ...prev.categories, [category]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>
    </div>
  );
}