import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Target,
  Users,
  Calendar,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  ArrowRight,
  BarChart3,
  Lightbulb,
  Timer,
  Star,
  MessageSquare,
  DollarSign,
  UserCheck,
  Workflow
} from 'lucide-react';

const AutomatedTaskCreation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: '',
    conditions: [],
    actions: [],
    priority: 'medium',
    enabled: true
  });

  // Sample automation rules
  const [automationRules, setAutomationRules] = useState([
    {
      id: 1,
      name: 'New Lead Follow-up',
      description: 'Automatically create follow-up tasks for new leads',
      trigger: 'lead_created',
      conditions: [
        { field: 'lead_source', operator: 'equals', value: 'website' },
        { field: 'lead_score', operator: 'greater_than', value: 50 }
      ],
      actions: [
        { type: 'create_task', title: 'Initial contact call', due_hours: 2, assignee: 'auto' },
        { type: 'create_task', title: 'Send welcome email', due_hours: 1, assignee: 'auto' },
        { type: 'create_task', title: 'Add to nurture sequence', due_hours: 24, assignee: 'marketing' }
      ],
      priority: 'high',
      enabled: true,
      created: '2024-01-15',
      lastTriggered: '2024-01-20 14:30',
      triggerCount: 45,
      successRate: 92
    },
    {
      id: 2,
      name: 'Deal Stage Progression',
      description: 'Create tasks when deals move to specific stages',
      trigger: 'deal_stage_changed',
      conditions: [
        { field: 'new_stage', operator: 'equals', value: 'proposal' },
        { field: 'deal_value', operator: 'greater_than', value: 10000 }
      ],
      actions: [
        { type: 'create_task', title: 'Prepare detailed proposal', due_hours: 48, assignee: 'sales_rep' },
        { type: 'create_task', title: 'Schedule proposal presentation', due_hours: 72, assignee: 'sales_rep' },
        { type: 'create_task', title: 'Send proposal follow-up', due_hours: 168, assignee: 'sales_rep' }
      ],
      priority: 'high',
      enabled: true,
      created: '2024-01-10',
      lastTriggered: '2024-01-20 11:15',
      triggerCount: 23,
      successRate: 87
    },
    {
      id: 3,
      name: 'Customer Interaction Response',
      description: 'Create tasks based on customer communication patterns',
      trigger: 'customer_interaction',
      conditions: [
        { field: 'interaction_type', operator: 'equals', value: 'email' },
        { field: 'sentiment', operator: 'equals', value: 'negative' }
      ],
      actions: [
        { type: 'create_task', title: 'Urgent: Address customer concern', due_hours: 4, assignee: 'account_manager' },
        { type: 'create_task', title: 'Schedule customer call', due_hours: 8, assignee: 'account_manager' },
        { type: 'notify_manager', message: 'Negative customer feedback received' }
      ],
      priority: 'urgent',
      enabled: true,
      created: '2024-01-12',
      lastTriggered: '2024-01-20 16:45',
      triggerCount: 12,
      successRate: 95
    },
    {
      id: 4,
      name: 'Deal Stagnation Alert',
      description: 'Create tasks for deals that haven\'t progressed',
      trigger: 'deal_stagnant',
      conditions: [
        { field: 'days_in_stage', operator: 'greater_than', value: 14 },
        { field: 'deal_stage', operator: 'not_equals', value: 'closed_won' }
      ],
      actions: [
        { type: 'create_task', title: 'Review stagnant deal', due_hours: 24, assignee: 'sales_rep' },
        { type: 'create_task', title: 'Contact decision maker', due_hours: 48, assignee: 'sales_rep' },
        { type: 'create_task', title: 'Update deal strategy', due_hours: 72, assignee: 'sales_manager' }
      ],
      priority: 'medium',
      enabled: true,
      created: '2024-01-08',
      lastTriggered: '2024-01-19 09:30',
      triggerCount: 18,
      successRate: 78
    },
    {
      id: 5,
      name: 'Contract Renewal Reminder',
      description: 'Create renewal tasks before contract expiration',
      trigger: 'contract_expiring',
      conditions: [
        { field: 'days_to_expiry', operator: 'equals', value: 90 },
        { field: 'contract_value', operator: 'greater_than', value: 5000 }
      ],
      actions: [
        { type: 'create_task', title: 'Initiate renewal discussion', due_hours: 168, assignee: 'account_manager' },
        { type: 'create_task', title: 'Prepare renewal proposal', due_hours: 336, assignee: 'account_manager' },
        { type: 'create_task', title: 'Schedule renewal meeting', due_hours: 504, assignee: 'account_manager' }
      ],
      priority: 'medium',
      enabled: true,
      created: '2024-01-05',
      lastTriggered: '2024-01-18 10:00',
      triggerCount: 8,
      successRate: 100
    }
  ]);

  // Sample created tasks
  const [createdTasks, setCreatedTasks] = useState([
    {
      id: 1,
      title: 'Initial contact call',
      description: 'Call new lead from website form submission',
      priority: 'high',
      status: 'pending',
      assignee: 'John Smith',
      dueDate: '2024-01-21 16:30',
      createdBy: 'New Lead Follow-up',
      relatedTo: 'Lead #1234 - Acme Corp',
      estimatedTime: '30 minutes',
      tags: ['lead', 'call', 'urgent']
    },
    {
      id: 2,
      title: 'Prepare detailed proposal',
      description: 'Create comprehensive proposal for high-value deal',
      priority: 'high',
      status: 'in_progress',
      assignee: 'Sarah Johnson',
      dueDate: '2024-01-22 17:00',
      createdBy: 'Deal Stage Progression',
      relatedTo: 'Deal #5678 - TechStart Inc',
      estimatedTime: '4 hours',
      tags: ['proposal', 'deal', 'high-value']
    },
    {
      id: 3,
      title: 'Address customer concern',
      description: 'Urgent response needed for negative feedback',
      priority: 'urgent',
      status: 'completed',
      assignee: 'Mike Wilson',
      dueDate: '2024-01-20 20:45',
      createdBy: 'Customer Interaction Response',
      relatedTo: 'Customer #9012 - Global Solutions',
      estimatedTime: '1 hour',
      tags: ['customer', 'urgent', 'support']
    },
    {
      id: 4,
      title: 'Review stagnant deal',
      description: 'Analyze why deal hasn\'t progressed in 2 weeks',
      priority: 'medium',
      status: 'pending',
      assignee: 'David Brown',
      dueDate: '2024-01-21 12:00',
      createdBy: 'Deal Stagnation Alert',
      relatedTo: 'Deal #3456 - Enterprise Corp',
      estimatedTime: '2 hours',
      tags: ['deal', 'analysis', 'stagnant']
    },
    {
      id: 5,
      title: 'Send welcome email',
      description: 'Send personalized welcome email to new lead',
      priority: 'medium',
      status: 'completed',
      assignee: 'Marketing Team',
      dueDate: '2024-01-20 15:30',
      createdBy: 'New Lead Follow-up',
      relatedTo: 'Lead #1234 - Acme Corp',
      estimatedTime: '15 minutes',
      tags: ['email', 'welcome', 'lead']
    }
  ]);

  // Sample automation analytics
  const automationAnalytics = {
    totalRules: automationRules.length,
    activeRules: automationRules.filter(rule => rule.enabled).length,
    totalTasksCreated: 156,
    tasksCreatedToday: 12,
    averageSuccessRate: 88,
    timesSaved: '24 hours',
    topPerformingRule: 'New Lead Follow-up',
    recentActivity: [
      { time: '2 minutes ago', action: 'Created task: Initial contact call', rule: 'New Lead Follow-up' },
      { time: '15 minutes ago', action: 'Created task: Schedule proposal presentation', rule: 'Deal Stage Progression' },
      { time: '1 hour ago', action: 'Created task: Address customer concern', rule: 'Customer Interaction Response' },
      { time: '2 hours ago', action: 'Created task: Review stagnant deal', rule: 'Deal Stagnation Alert' },
      { time: '3 hours ago', action: 'Created task: Initiate renewal discussion', rule: 'Contract Renewal Reminder' }
    ]
  };

  // Available triggers
  const availableTriggers = [
    { value: 'lead_created', label: 'New Lead Created', icon: Users },
    { value: 'deal_stage_changed', label: 'Deal Stage Changed', icon: TrendingUp },
    { value: 'customer_interaction', label: 'Customer Interaction', icon: MessageSquare },
    { value: 'deal_stagnant', label: 'Deal Stagnant', icon: Clock },
    { value: 'contract_expiring', label: 'Contract Expiring', icon: Calendar },
    { value: 'task_overdue', label: 'Task Overdue', icon: AlertTriangle },
    { value: 'email_received', label: 'Email Received', icon: Mail },
    { value: 'meeting_scheduled', label: 'Meeting Scheduled', icon: Calendar },
    { value: 'payment_received', label: 'Payment Received', icon: DollarSign },
    { value: 'support_ticket', label: 'Support Ticket Created', icon: FileText }
  ];

  // Available actions
  const availableActions = [
    { value: 'create_task', label: 'Create Task', icon: Plus },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'schedule_meeting', label: 'Schedule Meeting', icon: Calendar },
    { value: 'notify_manager', label: 'Notify Manager', icon: Bell },
    { value: 'update_field', label: 'Update Field', icon: Edit },
    { value: 'add_tag', label: 'Add Tag', icon: Tag },
    { value: 'create_note', label: 'Create Note', icon: FileText },
    { value: 'assign_user', label: 'Assign User', icon: UserCheck }
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update analytics or trigger new automations
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRuleToggle = (ruleId) => {
    setAutomationRules(rules => 
      rules.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleCreateRule = () => {
    if (newRule.name && newRule.trigger) {
      const rule = {
        ...newRule,
        id: Date.now(),
        created: new Date().toISOString().split('T')[0],
        lastTriggered: null,
        triggerCount: 0,
        successRate: 0
      };
      setAutomationRules([...automationRules, rule]);
      setNewRule({
        name: '',
        trigger: '',
        conditions: [],
        actions: [],
        priority: 'medium',
        enabled: true
      });
      setIsCreatingRule(false);
    }
  };

  const handleDeleteRule = (ruleId) => {
    setAutomationRules(rules => rules.filter(rule => rule.id !== ruleId));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="h-8 w-8 mr-3 text-blue-600" />
            Automated Task Creation
          </h1>
          <p className="text-muted-foreground mt-2">
            Intelligent task automation based on deal stages and customer interactions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="automation-toggle">Automation</Label>
            <Switch
              id="automation-toggle"
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
            <Badge variant={automationEnabled ? 'default' : 'secondary'}>
              {automationEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <Button onClick={() => setIsCreatingRule(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{automationAnalytics.totalRules}</p>
                <p className="text-sm text-muted-foreground">Total Rules</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{automationAnalytics.activeRules}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{automationAnalytics.totalTasksCreated}</p>
                <p className="text-sm text-muted-foreground">Tasks Created</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">{automationAnalytics.averageSuccessRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="tasks">Created Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Automation Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {automationAnalytics.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">Rule: {activity.rule}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Top Performing Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules
                    .sort((a, b) => b.successRate - a.successRate)
                    .slice(0, 5)
                    .map((rule, index) => (
                      <div key={rule.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{rule.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {rule.triggerCount} triggers
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={rule.successRate} className="w-16" />
                          <span className="text-sm font-medium">{rule.successRate}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{automationAnalytics.tasksCreatedToday}</p>
                  <p className="text-sm text-muted-foreground">Tasks Created Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{automationAnalytics.timesSaved}</p>
                  <p className="text-sm text-muted-foreground">Time Saved This Week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{automationAnalytics.averageSuccessRate}%</p>
                  <p className="text-sm text-muted-foreground">Average Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{automationAnalytics.topPerformingRule}</p>
                  <p className="text-sm text-muted-foreground">Top Performing Rule</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id} className={`border-l-4 ${
                rule.priority === 'urgent' ? 'border-l-red-500' : 
                rule.priority === 'high' ? 'border-l-orange-500' : 
                rule.priority === 'medium' ? 'border-l-blue-500' : 'border-l-green-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      {rule.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(rule.priority)}>
                        {rule.priority}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rule Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{rule.triggerCount}</p>
                      <p className="text-xs text-muted-foreground">Triggers</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{rule.successRate}%</p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">{rule.actions.length}</p>
                      <p className="text-xs text-muted-foreground">Actions</p>
                    </div>
                  </div>

                  {/* Trigger Info */}
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm font-medium mb-1">Trigger:</p>
                    <p className="text-sm">{availableTriggers.find(t => t.value === rule.trigger)?.label}</p>
                  </div>

                  {/* Actions Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">Actions:</p>
                    <div className="space-y-1">
                      {rule.actions.slice(0, 2).map((action, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <ArrowRight className="h-3 w-3 mr-2 text-blue-500" />
                          {action.title || action.type}
                        </div>
                      ))}
                      {rule.actions.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{rule.actions.length - 2} more actions
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rule Controls */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleRuleToggle(rule.id)}
                      />
                      <span className="text-sm">
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Last Triggered */}
                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground">
                      Last triggered: {rule.lastTriggered}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Created Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-4">
            {createdTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'overdue' ? 'bg-red-500' : 'bg-orange-500'
                        }`}></div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Assignee: {task.assignee}</span>
                        <span>Due: {task.dueDate}</span>
                        <span>Est. Time: {task.estimatedTime}</span>
                        <span>Created by: {task.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-muted-foreground">Related to:</span>
                        <Badge variant="outline" className="text-xs">
                          {task.relatedTo}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      {task.status !== 'completed' && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Rule Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Rule Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{rule.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {rule.triggerCount} triggers
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={rule.successRate} className="flex-1" />
                        <span className="text-sm font-medium w-12">{rule.successRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Task Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['completed', 'in_progress', 'pending', 'overdue'].map((status) => {
                    const count = createdTasks.filter(task => task.status === status).length;
                    const percentage = (count / createdTasks.length) * 100;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} tasks
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm font-medium w-12">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-800">Optimization Opportunity</h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your "Deal Stagnation Alert" rule has a 78% success rate. Consider adding more specific conditions to improve targeting.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">Performance Highlight</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    Your automation has saved an estimated 24 hours this week by creating 156 tasks automatically.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Timer className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">Timing Analysis</h4>
                  </div>
                  <p className="text-sm text-orange-700">
                    Most tasks are created between 9-11 AM. Consider adjusting due times for better workload distribution.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-800">Team Impact</h4>
                  </div>
                  <p className="text-sm text-purple-700">
                    Sales team productivity increased by 15% since implementing automated task creation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Automation Settings
              </CardTitle>
              <CardDescription>
                Configure global automation preferences and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Global Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Global Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enable-automation">Enable Automation</Label>
                    <Switch id="enable-automation" checked={automationEnabled} onCheckedChange={setAutomationEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="smart-scheduling">Smart Task Scheduling</Label>
                    <Switch id="smart-scheduling" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="duplicate-prevention">Duplicate Task Prevention</Label>
                    <Switch id="duplicate-prevention" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-assignment">Intelligent Auto-Assignment</Label>
                    <Switch id="auto-assignment" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rule-notifications">Rule Trigger Notifications</Label>
                    <Switch id="rule-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="failure-alerts">Automation Failure Alerts</Label>
                    <Switch id="failure-alerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily-summary">Daily Summary Reports</Label>
                    <Switch id="daily-summary" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performance-insights">Performance Insights</Label>
                    <Switch id="performance-insights" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-tasks-per-rule">Max Tasks per Rule (per day)</Label>
                    <Input id="max-tasks-per-rule" type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retry-attempts">Retry Attempts on Failure</Label>
                    <Input id="retry-attempts" type="number" defaultValue="3" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="execution-delay">Execution Delay (seconds)</Label>
                    <Input id="execution-delay" type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cleanup-period">Task Cleanup Period (days)</Label>
                    <Input id="cleanup-period" type="number" defaultValue="90" />
                  </div>
                </div>
              </div>

              {/* Save Settings */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create New Rule Modal */}
      {isCreatingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Automation Rule</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsCreatingRule(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Enter rule name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rule-description">Description</Label>
                <Textarea
                  id="rule-description"
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  placeholder="Describe what this rule does"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-trigger">Trigger</Label>
                <Select value={newRule.trigger} onValueChange={(value) => setNewRule({...newRule, trigger: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTriggers.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        {trigger.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-priority">Priority</Label>
                <Select value={newRule.priority} onValueChange={(value) => setNewRule({...newRule, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rule-enabled"
                  checked={newRule.enabled}
                  onCheckedChange={(checked) => setNewRule({...newRule, enabled: checked})}
                />
                <Label htmlFor="rule-enabled">Enable rule immediately</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule}>
                  Create Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomatedTaskCreation;