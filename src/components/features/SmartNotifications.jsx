// Smart Notifications System
// Provides intelligent notifications based on CRM data patterns and user behavior

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Target,
  Zap,
  Filter,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks, useDeals, useLeads, useDashboardAnalytics } from '@/hooks/useBusinessLogic';

const SmartNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enabled: true,
    dealAlerts: true,
    taskReminders: true,
    leadFollowups: true,
    performanceInsights: true,
    soundEnabled: false,
    frequency: 'realtime' // realtime, hourly, daily
  });
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const { overdueTasks, upcomingTasks } = useTasks();
  const { revenueMetrics, pipelineData } = useDeals();
  const { data: leads } = useLeads();
  const { metrics } = useDashboardAnalytics();

  // Notification types and their configurations
  const notificationTypes = {
    urgent: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    success: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    warning: { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    insight: { icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' }
  };

  // Generate smart notifications based on CRM data
  const generateNotifications = useCallback(() => {
    const newNotifications = [];
    const now = new Date();

    // Task-based notifications
    if (settings.taskReminders && overdueTasks?.length > 0) {
      newNotifications.push({
        id: `overdue-tasks-${now.getTime()}`,
        type: 'urgent',
        title: 'Overdue Tasks Alert',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} requiring attention`,
        timestamp: now,
        category: 'tasks',
        actionable: true,
        data: { tasks: overdueTasks }
      });
    }

    if (settings.taskReminders && upcomingTasks?.length > 0) {
      const todayTasks = upcomingTasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate.toDateString() === now.toDateString();
      });

      if (todayTasks.length > 0) {
        newNotifications.push({
          id: `today-tasks-${now.getTime()}`,
          type: 'info',
          title: 'Today\'s Tasks',
          message: `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`,
          timestamp: now,
          category: 'tasks',
          actionable: true,
          data: { tasks: todayTasks }
        });
      }
    }

    // Deal-based notifications
    if (settings.dealAlerts && revenueMetrics) {
      if (revenueMetrics.conversionRate < 20) {
        newNotifications.push({
          id: `low-conversion-${now.getTime()}`,
          type: 'warning',
          title: 'Low Conversion Rate',
          message: `Deal conversion rate is ${revenueMetrics.conversionRate?.toFixed(1)}%. Consider reviewing your sales process.`,
          timestamp: now,
          category: 'deals',
          actionable: true,
          data: { conversionRate: revenueMetrics.conversionRate }
        });
      }

      if (revenueMetrics.totalRevenue > 100000) {
        newNotifications.push({
          id: `revenue-milestone-${now.getTime()}`,
          type: 'success',
          title: 'Revenue Milestone',
          message: `Congratulations! You've reached $${(revenueMetrics.totalRevenue / 1000).toFixed(0)}K in total revenue`,
          timestamp: now,
          category: 'deals',
          actionable: false,
          data: { revenue: revenueMetrics.totalRevenue }
        });
      }
    }

    // Lead-based notifications
    if (settings.leadFollowups && leads?.length > 0) {
      const newLeads = leads.filter(lead => {
        const createdDate = new Date(lead.created_date);
        const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
        return daysDiff < 1 && lead.status === 'New';
      });

      if (newLeads.length > 0) {
        newNotifications.push({
          id: `new-leads-${now.getTime()}`,
          type: 'info',
          title: 'New Leads Received',
          message: `${newLeads.length} new lead${newLeads.length > 1 ? 's' : ''} require${newLeads.length === 1 ? 's' : ''} follow-up`,
          timestamp: now,
          category: 'leads',
          actionable: true,
          data: { leads: newLeads }
        });
      }

      const staleLeads = leads.filter(lead => {
        const createdDate = new Date(lead.created_date);
        const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && lead.status === 'New';
      });

      if (staleLeads.length > 0) {
        newNotifications.push({
          id: `stale-leads-${now.getTime()}`,
          type: 'warning',
          title: 'Stale Leads Alert',
          message: `${staleLeads.length} lead${staleLeads.length > 1 ? 's have' : ' has'} been unattended for over a week`,
          timestamp: now,
          category: 'leads',
          actionable: true,
          data: { leads: staleLeads }
        });
      }
    }

    // Performance insights
    if (settings.performanceInsights && metrics) {
      const totalActivities = metrics.totalContacts + metrics.totalDeals + metrics.totalLeads;
      if (totalActivities > 50) {
        newNotifications.push({
          id: `performance-insight-${now.getTime()}`,
          type: 'insight',
          title: 'Performance Insight',
          message: `Your CRM activity is high with ${totalActivities} total records. Consider using automation tools.`,
          timestamp: now,
          category: 'insights',
          actionable: true,
          data: { totalActivities }
        });
      }
    }

    return newNotifications;
  }, [overdueTasks, upcomingTasks, revenueMetrics, leads, metrics, settings]);

  // Disabled automatic notification updates
  // Notifications will only appear when triggered by user actions or real events
  // useEffect(() => {
  //   if (!settings.enabled) return;

  //   const updateNotifications = () => {
  //     const newNotifications = generateNotifications();
  //     setNotifications(prev => {
  //       // Merge new notifications with existing ones, avoiding duplicates
  //       const existingIds = new Set(prev.map(n => n.id));
  //       const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
  //       return [...prev, ...uniqueNew].slice(-20); // Keep only last 20 notifications
  //     });
  //   };

  //   updateNotifications();

  //   const interval = setInterval(updateNotifications, 
  //     settings.frequency === 'realtime' ? 30000 : // 30 seconds
  //     settings.frequency === 'hourly' ? 3600000 : // 1 hour
  //     86400000 // 1 day
  //   );

  //   return () => clearInterval(interval);
  // }, [generateNotifications, settings.enabled, settings.frequency]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter(n => n.category === filter);
  }, [notifications, filter]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const NotificationItem = ({ notification }) => {
    const { icon: Icon, color, bgColor, borderColor } = notificationTypes[notification.type];

    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className={`p-4 border-l-4 ${borderColor} ${bgColor} rounded-lg mb-3 cursor-pointer transition-all hover:shadow-md`}
        onClick={() => markAsRead(notification.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Icon className={`w-5 h-5 ${color} mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {notification.category}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(notification.id);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border z-50"
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Smart Notifications</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={clearAll}>
                      Clear All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex items-center space-x-2 mt-3">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                      <SelectItem value="deals">Deals</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="insights">Insights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs defaultValue="notifications" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="notifications" className="mt-4">
                    <ScrollArea className="h-96">
                      {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {filteredNotifications.map((notification) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                            />
                          ))}
                        </AnimatePresence>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Enable Notifications</label>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, enabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Deal Alerts</label>
                        <Switch
                          checked={settings.dealAlerts}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, dealAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Task Reminders</label>
                        <Switch
                          checked={settings.taskReminders}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, taskReminders: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Lead Follow-ups</label>
                        <Switch
                          checked={settings.leadFollowups}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, leadFollowups: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Performance Insights</label>
                        <Switch
                          checked={settings.performanceInsights}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, performanceInsights: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Sound Alerts</label>
                        <Switch
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, soundEnabled: checked }))
                          }
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Update Frequency</label>
                        <Select
                          value={settings.frequency}
                          onValueChange={(value) =>
                            setSettings(prev => ({ ...prev, frequency: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartNotifications;