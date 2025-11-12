import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Mail,
  Phone,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Filter,
  ArrowRight,
  Bot,
  Workflow
} from 'lucide-react';
import { useDeals, useLeads, useTasks, useContacts } from '@/hooks/useBusinessLogic';

const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState(new Set());
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [workflowStats, setWorkflowStats] = useState({});

  const { deals, refreshDeals } = useDeals();
  const { leads, refreshLeads } = useLeads();
  const { tasks, refreshTasks } = useTasks();
  const { contacts, refreshContacts } = useContacts();

  // Predefined workflow templates
  const workflowTemplates = useMemo(() => [
    {
      id: 'lead-nurturing',
      name: 'Lead Nurturing Sequence',
      description: 'Automatically nurture leads based on their engagement level',
      category: 'Lead Management',
      triggers: ['lead_created', 'lead_score_changed', 'email_opened'],
      actions: ['send_email', 'create_task', 'update_lead_status', 'assign_to_rep'],
      icon: Target,
      color: 'blue'
    },
    {
      id: 'deal-progression',
      name: 'Deal Progression Automation',
      description: 'Move deals through pipeline stages automatically',
      category: 'Deal Management',
      triggers: ['deal_created', 'activity_completed', 'proposal_sent'],
      actions: ['update_deal_stage', 'create_follow_up_task', 'send_notification'],
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'task-assignment',
      name: 'Smart Task Assignment',
      description: 'Automatically assign tasks based on workload and expertise',
      category: 'Task Management',
      triggers: ['task_created', 'deal_stage_changed', 'lead_qualified'],
      actions: ['assign_task', 'set_priority', 'create_reminder'],
      icon: Users,
      color: 'purple'
    },
    {
      id: 'follow-up-reminder',
      name: 'Follow-up Reminder System',
      description: 'Create automatic follow-up reminders for important activities',
      category: 'Communication',
      triggers: ['meeting_scheduled', 'proposal_sent', 'no_activity_7_days'],
      actions: ['create_task', 'send_email_reminder', 'schedule_call'],
      icon: Clock,
      color: 'orange'
    }
  ], []);

  // Initialize workflows with templates
  useEffect(() => {
    const initialWorkflows = workflowTemplates.map(template => ({
      ...template,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      isActive: false,
      createdAt: new Date(),
      executionCount: Math.floor(Math.random() * 50),
      successRate: 85 + Math.random() * 15,
      conditions: [],
      actionConfig: {}
    }));
    
    setWorkflows(initialWorkflows);
    
    // Generate mock execution history
    const mockHistory = [];
    for (let i = 0; i < 20; i++) {
      mockHistory.push({
        id: `execution_${i}`,
        workflowId: initialWorkflows[Math.floor(Math.random() * initialWorkflows.length)].id,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        executedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 5000) + 500,
        triggeredBy: ['lead_created', 'deal_updated', 'task_completed'][Math.floor(Math.random() * 3)],
        actionsExecuted: Math.floor(Math.random() * 5) + 1
      });
    }
    setExecutionHistory(mockHistory.sort((a, b) => b.executedAt - a.executedAt));
  }, [workflowTemplates]);

  // Calculate workflow statistics
  useEffect(() => {
    const stats = workflows.reduce((acc, workflow) => {
      const executions = executionHistory.filter(h => h.workflowId === workflow.id);
      const successfulExecutions = executions.filter(h => h.status === 'success');
      
      acc[workflow.id] = {
        totalExecutions: executions.length,
        successfulExecutions: successfulExecutions.length,
        successRate: executions.length > 0 ? (successfulExecutions.length / executions.length) * 100 : 0,
        avgDuration: executions.length > 0 ? executions.reduce((sum, e) => sum + e.duration, 0) / executions.length : 0,
        lastExecution: executions.length > 0 ? executions[0].executedAt : null
      };
      
      return acc;
    }, {});
    
    setWorkflowStats(stats);
  }, [workflows, executionHistory]);

  const toggleWorkflow = useCallback((workflowId) => {
    setActiveWorkflows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workflowId)) {
        newSet.delete(workflowId);
      } else {
        newSet.add(workflowId);
      }
      return newSet;
    });

    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  }, []);

  const createWorkflow = useCallback((template) => {
    const newWorkflow = {
      ...template,
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      isActive: false,
      createdAt: new Date(),
      executionCount: 0,
      successRate: 100,
      conditions: [],
      actionConfig: {}
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setIsCreating(false);
  }, []);

  const deleteWorkflow = useCallback((workflowId) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    setActiveWorkflows(prev => {
      const newSet = new Set(prev);
      newSet.delete(workflowId);
      return newSet;
    });
    if (selectedWorkflow?.id === workflowId) {
      setSelectedWorkflow(null);
    }
  }, [selectedWorkflow]);

  const WorkflowCard = ({ workflow }) => {
    const stats = workflowStats[workflow.id] || {};
    const IconComponent = workflow.icon;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
      >
        <Card className={`transition-all duration-200 ${
          workflow.isActive ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${workflow.color}-100`}>
                  <IconComponent className={`h-5 w-5 text-${workflow.color}-600`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription className="text-sm">{workflow.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Switch
                  checked={workflow.isActive}
                  onCheckedChange={() => toggleWorkflow(workflow.id)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">{stats.successRate?.toFixed(1) || 0}%</span>
              </div>
              
              <Progress value={stats.successRate || 0} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Executions</span>
                  <p className="font-medium">{stats.totalExecutions || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Duration</span>
                  <p className="font-medium">{stats.avgDuration ? `${(stats.avgDuration / 1000).toFixed(1)}s` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Badge variant="outline" className="text-xs">
                  {workflow.category}
                </Badge>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkflow(workflow);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkflow(workflow.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const ExecutionHistoryItem = ({ execution }) => {
    const workflow = workflows.find(w => w.id === execution.workflowId);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-3 bg-white rounded-lg border"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            execution.status === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {execution.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{workflow?.name || 'Unknown Workflow'}</p>
            <p className="text-xs text-gray-500">
              Triggered by {execution.triggeredBy} • {execution.actionsExecuted} actions
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium">
            {(execution.duration / 1000).toFixed(1)}s
          </p>
          <p className="text-xs text-gray-500">
            {execution.executedAt.toLocaleTimeString()}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Workflow className="h-6 w-6 text-blue-600" />
            <span>Workflow Automation</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Automate your CRM processes with intelligent workflows
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold">{activeWorkflows.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold">{executionHistory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">
                  {executionHistory.length > 0 
                    ? ((executionHistory.filter(h => h.status === 'success').length / executionHistory.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {executionHistory.length > 0 
                    ? (executionHistory.reduce((sum, e) => sum + e.duration, 0) / executionHistory.length / 1000).toFixed(1)
                    : 0}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Track workflow execution history and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {executionHistory.slice(0, 10).map((execution) => (
                    <ExecutionHistoryItem key={execution.id} execution={execution} />
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                        <IconComponent className={`h-5 w-5 text-${template.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.triggers.slice(0, 3).map((trigger) => (
                            <Badge key={trigger} variant="outline" className="text-xs">
                              {trigger.replace('_', ' ')}
                            </Badge>
                          ))}
                          {template.triggers.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.triggers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Actions:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.actions.slice(0, 3).map((action) => (
                            <Badge key={action} variant="secondary" className="text-xs">
                              {action.replace('_', ' ')}
                            </Badge>
                          ))}
                          {template.actions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.actions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => createWorkflow(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Workflow Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Choose a Template</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {workflowTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => createWorkflow(template)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${template.color}-100`}>
                          <IconComponent className={`h-4 w-4 text-${template.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.category}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowAutomation;