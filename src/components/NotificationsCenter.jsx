import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  TrendingUp,
  Users,
  CheckSquare,
  Mail,
  AlertCircle,
  Zap,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

export default function NotificationsCenter() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date', 10),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 10),
  });

  // Generate notifications from data
  useEffect(() => {
    if (!currentUser) return;

    const generated = [];

    // Deal stage changes
    deals.filter(d => d.stage === 'Closed Won').slice(0, 3).forEach(deal => {
      generated.push({
        id: `deal-won-${deal.id}`,
        type: 'deal',
        priority: 'high',
        icon: TrendingUp,
        color: 'text-green-600',
        bg: 'bg-green-50',
        title: 'Deal Won! 🎉',
        message: `${deal.deal_name} closed for $${(deal.amount / 1000).toFixed(0)}K`,
        timestamp: deal.updated_date || deal.created_date,
        read: false,
        actionUrl: createPageUrl('Deals'),
        actionLabel: 'View Deal'
      });
    });

    // New lead assignments
    leads.filter(l => l.assigned_users?.includes(currentUser.email)).slice(0, 3).forEach(lead => {
      generated.push({
        id: `lead-assigned-${lead.id}`,
        type: 'lead',
        priority: 'medium',
        icon: Users,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        title: 'New Lead Assigned',
        message: `${lead.first_name} ${lead.last_name} - ${lead.company}`,
        timestamp: lead.created_date,
        read: false,
        actionUrl: createPageUrl('LeadDetails') + '?id=' + lead.id,
        actionLabel: 'View Lead'
      });
    });

    // Overdue tasks
    const today = new Date();
    tasks.filter(t => 
      t.status !== 'Completed' && 
      t.assigned_to === currentUser?.email &&
      new Date(t.due_date) < today
    ).slice(0, 3).forEach(task => {
      generated.push({
        id: `task-overdue-${task.id}`,
        type: 'task',
        priority: 'urgent',
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        title: 'Task Overdue',
        message: task.title,
        timestamp: task.due_date,
        read: false,
        actionUrl: createPageUrl('Tasks'),
        actionLabel: 'View Task'
      });
    });

    // Tasks due today
    tasks.filter(t => 
      t.status !== 'Completed' && 
      t.assigned_to === currentUser?.email &&
      new Date(t.due_date).toDateString() === today.toDateString()
    ).slice(0, 2).forEach(task => {
      generated.push({
        id: `task-due-${task.id}`,
        type: 'task',
        priority: 'medium',
        icon: CheckSquare,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        title: 'Task Due Today',
        message: task.title,
        timestamp: task.due_date,
        read: false,
        actionUrl: createPageUrl('Tasks'),
        actionLabel: 'View Task'
      });
    });

    // Sort by timestamp (newest first)
    generated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setNotifications(generated);
    setUnreadCount(generated.filter(n => !n.read).length);
  }, [deals, tasks, leads, currentUser]);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notif = notifications.find(n => n.id === notificationId);
      return notif && !notif.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-xs">
              Urgent ({urgentNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <div className="max-h-[400px] overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCheck className="w-12 h-12 mx-auto text-green-300 mb-3" />
                  <p className="text-sm text-gray-500">No unread notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="urgent" className="mt-0">
            <div className="max-h-[400px] overflow-y-auto">
              {urgentNotifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Zap className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No urgent notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {urgentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const Icon = notification.icon;

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-all cursor-pointer group ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
      onClick={() => {
        if (!notification.read) onMarkAsRead(notification.id);
        if (notification.actionUrl) window.location.href = notification.actionUrl;
      }}
    >
      <div className="flex gap-3">
        <div className={`p-2 rounded-lg ${notification.bg} h-fit`}>
          <Icon className={`w-4 h-4 ${notification.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}