import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Filter,
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Timer,
  Users,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  FileText,
  Database,
  Code,
  GitBranch,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Search,
  Info,
  HelpCircle,
  Lightbulb,
  Brain,
  Cpu,
  Network
} from 'lucide-react';

const AdvancedWorkflowAutomation = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample workflow data
  const workflows = [
    {
      id: 1,
      name: 'Lead Qualification Process',
      description: 'Automatically qualify and route leads based on criteria',
      status: 'active',
      trigger: 'New Lead Created',
      lastRun: '2 minutes ago',
      executions: 1247,
      successRate: 94.2,
      avgExecutionTime: '1.3s',
      created: '2024-01-15',
      category: 'Lead Management',
      complexity: 'medium',
      steps: [
        { id: 1, type: 'trigger', name: 'New Lead Created', icon: Users },
        { id: 2, type: 'condition', name: 'Check Lead Score', icon: Filter },
        { id: 3, type: 'action', name: 'Assign to Sales Rep', icon: Users },
        { id: 4, type: 'action', name: 'Send Welcome Email', icon: Mail },
        { id: 5, type: 'delay', name: 'Wait 24 Hours', icon: Clock },
        { id: 6, type: 'action', name: 'Schedule Follow-up', icon: Calendar }
      ],
      conditions: [
        { field: 'lead_score', operator: '>', value: 70 },
        { field: 'company_size', operator: '>=', value: 50 }
      ],
      actions: [
        { type: 'assign_user', user: 'John Smith' },
        { type: 'send_email', template: 'welcome_email' },
        { type: 'create_task', title: 'Follow up with lead' }
      ]
    },
    {
      id: 2,
      name: 'Deal Stage Progression',
      description: 'Automate actions when deals move through pipeline stages',
      status: 'active',
      trigger: 'Deal Stage Changed',
      lastRun: '15 minutes ago',
      executions: 892,
      successRate: 98.1,
      avgExecutionTime: '0.8s',
      created: '2024-01-10',
      category: 'Sales Pipeline',
      complexity: 'high',
      steps: [
        { id: 1, type: 'trigger', name: 'Deal Stage Changed', icon: Target },
        { id: 2, type: 'condition', name: 'Check Stage Type', icon: Filter },
        { id: 3, type: 'branch', name: 'Branch by Stage', icon: GitBranch },
        { id: 4, type: 'action', name: 'Update CRM Fields', icon: Database },
        { id: 5, type: 'action', name: 'Notify Team', icon: MessageSquare }
      ]
    },
    {
      id: 3,
      name: 'Customer Onboarding',
      description: 'Comprehensive onboarding sequence for new customers',
      status: 'paused',
      trigger: 'Deal Won',
      lastRun: '2 hours ago',
      executions: 156,
      successRate: 91.7,
      avgExecutionTime: '2.1s',
      created: '2024-01-08',
      category: 'Customer Success',
      complexity: 'high',
      steps: [
        { id: 1, type: 'trigger', name: 'Deal Won', icon: CheckCircle },
        { id: 2, type: 'action', name: 'Create Customer Record', icon: Users },
        { id: 3, type: 'action', name: 'Send Welcome Package', icon: Mail },
        { id: 4, type: 'delay', name: 'Wait 1 Day', icon: Clock },
        { id: 5, type: 'action', name: 'Schedule Kickoff Call', icon: Phone }
      ]
    },
    {
      id: 4,
      name: 'Support Ticket Escalation',
      description: 'Escalate high-priority tickets to senior support staff',
      status: 'active',
      trigger: 'Ticket Priority High',
      lastRun: '5 minutes ago',
      executions: 234,
      successRate: 96.8,
      avgExecutionTime: '0.5s',
      created: '2024-01-20',
      category: 'Customer Support',
      complexity: 'low',
      steps: [
        { id: 1, type: 'trigger', name: 'High Priority Ticket', icon: AlertTriangle },
        { id: 2, type: 'condition', name: 'Check Response Time', icon: Timer },
        { id: 3, type: 'action', name: 'Escalate to Manager', icon: Users },
        { id: 4, type: 'action', name: 'Send Urgent Alert', icon: Mail }
      ]
    }
  ];

  // Workflow templates
  const workflowTemplates = [
    {
      id: 1,
      name: 'Lead Nurturing Campaign',
      description: 'Multi-touch email sequence for lead nurturing',
      category: 'Marketing',
      complexity: 'medium',
      estimatedSetupTime: '15 minutes',
      triggers: ['New Lead', 'Lead Score Change'],
      actions: ['Send Email', 'Update CRM', 'Create Task']
    },
    {
      id: 2,
      name: 'Abandoned Cart Recovery',
      description: 'Re-engage customers who abandoned their cart',
      category: 'E-commerce',
      complexity: 'low',
      estimatedSetupTime: '10 minutes',
      triggers: ['Cart Abandoned'],
      actions: ['Send Email', 'Create Discount', 'Schedule Follow-up']
    },
    {
      id: 3,
      name: 'Contract Renewal Reminder',
      description: 'Automated reminders for upcoming contract renewals',
      category: 'Account Management',
      complexity: 'medium',
      estimatedSetupTime: '20 minutes',
      triggers: ['Contract Expiry Date'],
      actions: ['Send Notification', 'Create Task', 'Schedule Meeting']
    }
  ];

  // Available triggers
  const availableTriggers = [
    { id: 'lead_created', name: 'New Lead Created', category: 'Leads', icon: Users },
    { id: 'deal_stage_changed', name: 'Deal Stage Changed', category: 'Deals', icon: Target },
    { id: 'deal_won', name: 'Deal Won', category: 'Deals', icon: CheckCircle },
    { id: 'deal_lost', name: 'Deal Lost', category: 'Deals', icon: XCircle },
    { id: 'contact_updated', name: 'Contact Updated', category: 'Contacts', icon: Users },
    { id: 'email_opened', name: 'Email Opened', category: 'Email', icon: Mail },
    { id: 'email_clicked', name: 'Email Link Clicked', category: 'Email', icon: Mail },
    { id: 'form_submitted', name: 'Form Submitted', category: 'Forms', icon: FileText },
    { id: 'task_completed', name: 'Task Completed', category: 'Tasks', icon: CheckCircle },
    { id: 'meeting_scheduled', name: 'Meeting Scheduled', category: 'Calendar', icon: Calendar }
  ];

  // Available actions
  const availableActions = [
    { id: 'send_email', name: 'Send Email', category: 'Communication', icon: Mail },
    { id: 'send_sms', name: 'Send SMS', category: 'Communication', icon: MessageSquare },
    { id: 'create_task', name: 'Create Task', category: 'Tasks', icon: CheckCircle },
    { id: 'assign_user', name: 'Assign to User', category: 'Assignment', icon: Users },
    { id: 'update_field', name: 'Update Field', category: 'Data', icon: Database },
    { id: 'add_tag', name: 'Add Tag', category: 'Organization', icon: Target },
    { id: 'create_deal', name: 'Create Deal', category: 'Sales', icon: Target },
    { id: 'schedule_meeting', name: 'Schedule Meeting', category: 'Calendar', icon: Calendar },
    { id: 'webhook', name: 'Send Webhook', category: 'Integration', icon: Code },
    { id: 'delay', name: 'Add Delay', category: 'Flow Control', icon: Clock }
  ];

  // Workflow analytics
  const workflowAnalytics = {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter(w => w.status === 'active').length,
    totalExecutions: workflows.reduce((sum, w) => sum + w.executions, 0),
    avgSuccessRate: workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length,
    executionsToday: 1247,
    executionsThisWeek: 8934,
    timeSaved: '127 hours',
    errorRate: 2.3
  };

  // Recent executions
  const recentExecutions = [
    {
      id: 1,
      workflowName: 'Lead Qualification Process',
      trigger: 'New Lead: Acme Corp',
      status: 'completed',
      duration: '1.2s',
      timestamp: '2 minutes ago',
      steps: 6,
      completedSteps: 6
    },
    {
      id: 2,
      workflowName: 'Deal Stage Progression',
      trigger: 'Deal moved to Proposal',
      status: 'completed',
      duration: '0.8s',
      timestamp: '5 minutes ago',
      steps: 4,
      completedSteps: 4
    },
    {
      id: 3,
      workflowName: 'Support Ticket Escalation',
      trigger: 'High Priority Ticket #1234',
      status: 'failed',
      duration: '0.3s',
      timestamp: '8 minutes ago',
      steps: 3,
      completedSteps: 2,
      error: 'Email delivery failed'
    },
    {
      id: 4,
      workflowName: 'Customer Onboarding',
      trigger: 'Deal Won: TechStart Inc',
      status: 'running',
      duration: '45s',
      timestamp: '12 minutes ago',
      steps: 5,
      completedSteps: 3
    }
  ];

  const handleWorkflowAction = (workflowId, action) => {
    console.log(`${action} workflow ${workflowId}`);
  };

  const handleCreateWorkflow = (template = null) => {
    setIsBuilderOpen(true);
    if (template) {
      console.log('Creating workflow from template:', template);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || workflow.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'paused': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const WorkflowCard = ({ workflow }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{workflow.name}</h3>
              <Badge className={getStatusColor(workflow.status)}>
                {workflow.status}
              </Badge>
              <Badge variant="outline" className={getComplexityColor(workflow.complexity)}>
                {workflow.complexity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Category: {workflow.category}</span>
              <span>•</span>
              <span>Created: {workflow.created}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Executions</div>
            <div className="font-semibold">{workflow.executions.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Success Rate</div>
            <div className="font-semibold text-green-600">{workflow.successRate}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Avg Time</div>
            <div className="font-semibold">{workflow.avgExecutionTime}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Last Run</div>
            <div className="font-semibold">{workflow.lastRun}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="h-4 w-4" />
            <span>Trigger: {workflow.trigger}</span>
          </div>
          <div className="flex gap-2">
            {workflow.status === 'active' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWorkflowAction(workflow.id, 'pause')}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => handleWorkflowAction(workflow.id, 'activate')}
              >
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Clone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ title, value, change, icon: Icon, trend, color = "blue" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 text-${color}-500`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
          <p className="text-gray-600">Build intelligent workflows with conditional logic and triggers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => handleCreateWorkflow()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Workflows"
          value={workflowAnalytics.activeWorkflows}
          change="+2 this week"
          icon={Workflow}
          trend="up"
        />
        <MetricCard
          title="Total Executions"
          value={workflowAnalytics.totalExecutions.toLocaleString()}
          change="+12.5%"
          icon={Activity}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Success Rate"
          value={`${workflowAnalytics.avgSuccessRate.toFixed(1)}%`}
          change="+1.2%"
          icon={CheckCircle}
          trend="up"
          color="green"
        />
        <MetricCard
          title="Time Saved"
          value={workflowAnalytics.timeSaved}
          change="+8 hours"
          icon={Clock}
          trend="up"
          color="purple"
        />
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredWorkflows.map(workflow => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>

          {filteredWorkflows.length === 0 && (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-4">Create your first workflow to automate your processes</p>
              <Button onClick={() => handleCreateWorkflow()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Workflow Templates</h3>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflowTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{template.category}</Badge>
                      <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-4">
                      Setup time: {template.estimatedSetupTime}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Triggers</div>
                      <div className="flex flex-wrap gap-1">
                        {template.triggers.map((trigger, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Actions</div>
                      <div className="flex flex-wrap gap-1">
                        {template.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCreateWorkflow(template)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Executions</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          execution.status === 'completed' ? 'bg-green-100 text-green-600' :
                          execution.status === 'failed' ? 'bg-red-100 text-red-600' :
                          execution.status === 'running' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {execution.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                           execution.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                           execution.status === 'running' ? <RefreshCw className="h-4 w-4 animate-spin" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{execution.workflowName}</div>
                          <div className="text-sm text-gray-600">{execution.trigger}</div>
                          {execution.error && (
                            <div className="text-sm text-red-600">{execution.error}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div>
                            <Progress 
                              value={(execution.completedSteps / execution.steps) * 100} 
                              className="w-20 h-2"
                            />
                            <div className="text-xs mt-1">
                              {execution.completedSteps}/{execution.steps} steps
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{execution.duration}</div>
                            <div className="text-xs">{execution.timestamp}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Executions Today"
              value={workflowAnalytics.executionsToday.toLocaleString()}
              change="+15.3%"
              icon={Activity}
              trend="up"
            />
            <MetricCard
              title="This Week"
              value={workflowAnalytics.executionsThisWeek.toLocaleString()}
              change="+8.7%"
              icon={BarChart3}
              trend="up"
            />
            <MetricCard
              title="Error Rate"
              value={`${workflowAnalytics.errorRate}%`}
              change="-0.5%"
              icon={AlertTriangle}
              trend="up"
              color="red"
            />
            <MetricCard
              title="Avg Response Time"
              value="1.2s"
              change="-0.3s"
              icon={Timer}
              trend="up"
              color="green"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.slice(0, 5).map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-gray-600">{workflow.executions} executions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{workflow.successRate}%</div>
                        <div className="text-sm text-gray-600">success rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Lead Management', 'Sales Pipeline', 'Customer Success', 'Customer Support'].map((category, index) => {
                    const count = workflows.filter(w => w.category === category).length;
                    const percentage = (count / workflows.length) * 100;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{count} workflows</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Visual Workflow Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Triggers Panel */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Triggers
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {availableTriggers.map((trigger) => (
                        <div 
                          key={trigger.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <trigger.icon className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="font-medium text-sm">{trigger.name}</div>
                              <div className="text-xs text-gray-600">{trigger.category}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Actions Panel */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Actions
                  </h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {availableActions.map((action) => (
                        <div 
                          key={action.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <action.icon className="h-4 w-4 text-green-500" />
                            <div>
                              <div className="font-medium text-sm">{action.name}</div>
                              <div className="text-xs text-gray-600">{action.category}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Canvas Preview */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Workflow Canvas
                  </h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Workflow className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Drag triggers and actions here</p>
                      <p className="text-xs">to build your workflow</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                  <Button variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Tips
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save Workflow
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedWorkflow.name}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedWorkflow(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Workflow Steps</h4>
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                          {index + 1}
                        </div>
                        <step.icon className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{step.type}</div>
                        </div>
                        {index < selectedWorkflow.steps.length - 1 && (
                          <ArrowDown className="h-4 w-4 text-gray-400 ml-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.conditions?.map((condition, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          {condition.field} {condition.operator} {condition.value}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.actions?.map((action, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          {action.type}: {action.user || action.template || action.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdvancedWorkflowAutomation;