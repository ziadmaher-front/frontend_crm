import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { 
  Workflow, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Settings, 
  Copy,
  Save,
  Download,
  Upload,
  Zap,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Users,
  Target,
  Filter,
  ArrowRight,
  ArrowDown,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Timer,
  Database,
  Send,
  Bell,
  FileText,
  BarChart3,
  Repeat,
  MousePointer,
  Eye,
  Edit3
} from 'lucide-react';
import { AnimatedCard, StaggerContainer } from '@/components/MicroInteractions';
import WorkflowService from '@/services/workflowService';

const WorkflowAutomation = () => {
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [workflowNodes, setWorkflowNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    category: 'Sales',
    triggerType: '',
    isActive: false
  });
  
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch workflows from backend
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: WorkflowService.getWorkflows,
  });

  // Fetch workflow analytics
  const { data: analytics = {} } = useQuery({
    queryKey: ['workflow-analytics'],
    queryFn: WorkflowService.getAnalytics
  });

  // Mutations for workflow operations
  const createWorkflowMutation = useMutation({
    mutationFn: WorkflowService.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast({
        title: "Success",
        description: "Workflow created successfully",
      });
      setShowSaveDialog(false);
      resetWorkflowBuilder();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: ({ id, data }) => WorkflowService.updateWorkflow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast({
        title: "Success",
        description: "Workflow updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workflow",
        variant: "destructive",
      });
    },
  });

  const deleteWorkflowMutation = useMutation({
    mutationFn: WorkflowService.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries(['workflows']);
      toast({
        title: "Success",
        description: "Workflow deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete workflow",
        variant: "destructive",
      });
    },
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: ({ id, contextData }) => WorkflowService.executeWorkflow(id, contextData),
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: `Workflow executed ${result.success ? 'successfully' : 'with errors'}`,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute workflow",
        variant: "destructive",
      });
    },
  });

  // Business Logic Functions
  const createNewWorkflow = () => {
    setIsBuilding(true);
    setActiveWorkflow(null);
    setWorkflowNodes([]);
    setConnections([]);
    setWorkflowForm({
      name: '',
      description: '',
      category: 'Sales',
      triggerType: '',
      isActive: false
    });
  };

  const resetWorkflowBuilder = () => {
    setIsBuilding(false);
    setActiveWorkflow(null);
    setWorkflowNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setWorkflowForm({
      name: '',
      description: '',
      category: 'Sales',
      triggerType: '',
      isActive: false
    });
  };

  const saveWorkflow = () => {
    const validation = WorkflowService.validateWorkflow({
      ...workflowForm,
      nodes: workflowNodes,
      connections: connections,
      actions: workflowNodes.filter(node => node.type === 'action')
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const workflowData = {
      name: workflowForm.name,
      description: workflowForm.description,
      category: workflowForm.category,
      triggerType: workflowForm.triggerType,
      isActive: workflowForm.isActive,
      nodes: workflowNodes,
      connections: connections,
      actions: workflowNodes.filter(node => node.type === 'action').map(node => ({
        type: node.actionType || 'send_email',
        config: node.config || {},
        critical: node.critical || false
      })),
      triggerConditions: workflowNodes.find(node => node.type === 'trigger')?.config || {}
    };

    if (activeWorkflow) {
      updateWorkflowMutation.mutate({ id: activeWorkflow.id, data: workflowData });
    } else {
      createWorkflowMutation.mutate(workflowData);
    }
  };

  const loadWorkflow = (workflow) => {
    setActiveWorkflow(workflow);
    setIsBuilding(true);
    setWorkflowNodes(workflow.nodes || []);
    setConnections(workflow.connections || []);
    setWorkflowForm({
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      triggerType: workflow.trigger_type,
      isActive: workflow.is_active
    });
  };

  const loadTemplate = (template) => {
    setIsBuilding(true);
    setActiveWorkflow(null);
    setWorkflowNodes(template.nodes);
    setConnections([]);
    setWorkflowForm({
      name: template.name,
      description: template.description,
      category: template.category,
      triggerType: 'manual',
      isActive: false
    });
  };

  const executeWorkflow = (workflow) => {
    executeWorkflowMutation.mutate({
      id: workflow.id,
      contextData: {
        userId: 'current-user-id', // This should come from auth context
        entityType: 'manual',
        entityId: null
      }
    });
  };

  const deleteWorkflow = (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflowMutation.mutate(workflowId);
    }
  };

  const toggleWorkflowStatus = (workflow) => {
    updateWorkflowMutation.mutate({
      id: workflow.id,
      data: {
        ...workflow,
        isActive: !workflow.is_active
      }
    });
  };

  const addNodeToCanvas = (nodeType) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      name: nodeTypes[nodeType].options[0],
      x: 200 + workflowNodes.length * 50,
      y: 100 + workflowNodes.length * 50,
      config: {}
    };
    
    setWorkflowNodes([...workflowNodes, newNode]);
  };

  const updateNode = (nodeId, updates) => {
    setWorkflowNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  };

  const deleteNode = (nodeId) => {
    setWorkflowNodes(nodes => nodes.filter(node => node.id !== nodeId));
    setConnections(conns => conns.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
  };
  const workflowTemplates = [
    {
      id: 'lead-nurturing',
      name: 'Lead Nurturing Campaign',
      description: 'Automatically nurture leads based on their behavior and engagement',
      category: 'Marketing',
      nodes: [
        { id: 'trigger-1', type: 'trigger', name: 'New Lead Created', x: 100, y: 100 },
        { id: 'condition-1', type: 'condition', name: 'Lead Score > 50', x: 300, y: 100 },
        { id: 'action-1', type: 'action', name: 'Send Welcome Email', x: 500, y: 50 },
        { id: 'action-2', type: 'action', name: 'Assign to Sales Rep', x: 500, y: 150 }
      ]
    },
    {
      id: 'deal-follow-up',
      name: 'Deal Follow-up Automation',
      description: 'Automatically follow up on deals based on stage and timeline',
      category: 'Sales',
      nodes: [
        { id: 'trigger-1', type: 'trigger', name: 'Deal Stage Changed', x: 100, y: 100 },
        { id: 'delay-1', type: 'delay', name: 'Wait 3 Days', x: 300, y: 100 },
        { id: 'action-1', type: 'action', name: 'Send Follow-up Email', x: 500, y: 100 }
      ]
    },
    {
      id: 'task-automation',
      name: 'Task Creation & Assignment',
      description: 'Automatically create and assign tasks based on deal activities',
      category: 'Productivity',
      nodes: [
        { id: 'trigger-1', type: 'trigger', name: 'Meeting Scheduled', x: 100, y: 100 },
        { id: 'action-1', type: 'action', name: 'Create Follow-up Task', x: 300, y: 100 },
        { id: 'action-2', type: 'action', name: 'Set Reminder', x: 500, y: 100 }
      ]
    }
  ];

  // Node Types Configuration
  const nodeTypes = {
    trigger: {
      icon: Zap,
      color: 'bg-green-500',
      options: [
        'New Lead Created',
        'Deal Stage Changed',
        'Email Opened',
        'Form Submitted',
        'Meeting Scheduled',
        'Task Completed',
        'Contact Updated'
      ]
    },
    condition: {
      icon: GitBranch,
      color: 'bg-blue-500',
      options: [
        'Lead Score',
        'Deal Value',
        'Contact Property',
        'Time Since Last Contact',
        'Email Engagement',
        'Website Activity',
        'Custom Field Value'
      ]
    },
    action: {
      icon: Play,
      color: 'bg-purple-500',
      options: [
        'Send Email',
        'Create Task',
        'Update Contact',
        'Assign to User',
        'Add to List',
        'Send SMS',
        'Create Deal',
        'Schedule Meeting',
        'Add Note',
        'Update Deal Stage'
      ]
    },
    delay: {
      icon: Timer,
      color: 'bg-orange-500',
      options: [
        '1 Hour',
        '1 Day',
        '3 Days',
        '1 Week',
        '2 Weeks',
        '1 Month',
        'Custom Duration'
      ]
    },
    integration: {
      icon: Database,
      color: 'bg-indigo-500',
      options: [
        'Slack Notification',
        'Zapier Webhook',
        'Google Sheets Update',
        'Salesforce Sync',
        'HubSpot Integration',
        'Mailchimp Add Contact',
        'Calendar Event'
      ]
    }
  };

  // Connect nodes
  const connectNodes = (fromId, toId) => {
    const newConnection = {
      id: `${fromId}-${toId}`,
      from: fromId,
      to: toId
    };
    setConnections(prev => [...prev, newConnection]);
  };

  // Node Component
  const WorkflowNode = ({ node, isSelected, onClick, onDelete }) => {
    const NodeIcon = nodeTypes[node.type]?.icon || Settings;
    const nodeColor = nodeTypes[node.type]?.color || 'bg-gray-500';

    return (
      <div
        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ left: node.x, top: node.y }}
        onClick={() => onClick(node)}
      >
        <div className={`p-3 rounded-lg shadow-lg bg-white border-2 ${
          isSelected ? 'border-blue-500' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1 rounded ${nodeColor}`}>
              <NodeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">{node.type}</span>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 ml-auto"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-xs text-gray-600 max-w-32 truncate">
            {node.name}
          </div>
        </div>
      </div>
    );
  };

  // Node Configuration Panel
  const NodeConfigPanel = ({ node, onUpdate }) => {
    if (!node) return null;

    const nodeConfig = nodeTypes[node.type];
    
    return (
      <Card className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <nodeConfig.icon className="w-5 h-5" />
            Configure {node.type}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={node.name}
              onChange={(e) => onUpdate(node.id, { name: e.target.value })}
              placeholder="Enter node name"
            />
          </div>

          {node.type === 'trigger' && (
            <div>
              <label className="text-sm font-medium">Trigger Event</label>
              <Select
                value={node.config.event}
                onValueChange={(value) => onUpdate(node.id, { 
                  config: { ...node.config, event: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {nodeConfig.options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {node.type === 'condition' && (
            <>
              <div>
                <label className="text-sm font-medium">Condition Type</label>
                <Select
                  value={node.config.conditionType}
                  onValueChange={(value) => onUpdate(node.id, { 
                    config: { ...node.config, conditionType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeConfig.options.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Operator</label>
                <Select
                  value={node.config.operator}
                  onValueChange={(value) => onUpdate(node.id, { 
                    config: { ...node.config, operator: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="greater_than">Greater Than</SelectItem>
                    <SelectItem value="less_than">Less Than</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Value</label>
                <Input
                  value={node.config.value || ''}
                  onChange={(e) => onUpdate(node.id, { 
                    config: { ...node.config, value: e.target.value }
                  })}
                  placeholder="Enter value"
                />
              </div>
            </>
          )}

          {node.type === 'action' && (
            <>
              <div>
                <label className="text-sm font-medium">Action Type</label>
                <Select
                  value={node.config.actionType}
                  onValueChange={(value) => onUpdate(node.id, { 
                    config: { ...node.config, actionType: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeConfig.options.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {node.config.actionType === 'Send Email' && (
                <>
                  <div>
                    <label className="text-sm font-medium">Email Template</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome Email</SelectItem>
                        <SelectItem value="follow-up">Follow-up Email</SelectItem>
                        <SelectItem value="reminder">Reminder Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Email subject" />
                  </div>
                </>
              )}
            </>
          )}

          {node.type === 'delay' && (
            <div>
              <label className="text-sm font-medium">Delay Duration</label>
              <Select
                value={node.config.duration}
                onValueChange={(value) => onUpdate(node.id, { 
                  config: { ...node.config, duration: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {nodeConfig.options.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Workflow List Item
  const WorkflowListItem = ({ workflow, onEdit, onExecute, onDelete, onToggleStatus }) => (
    <AnimatedCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
            <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
              {workflow.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Workflow className="w-3 h-3" />
              {workflow.nodes?.length || 0} nodes
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Modified {workflow.updated_at ? new Date(workflow.updated_at).toLocaleDateString() : 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {workflow.execution_count || 0} executions
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={workflow.is_active}
            onCheckedChange={onToggleStatus}
            size="sm"
          />
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={onExecute}
            disabled={!workflow.is_active}
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AnimatedCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Workflow className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
            <p className="text-gray-600">Create and manage automated workflows</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={createNewWorkflow}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
          {isBuilding && (
            <Button onClick={saveWorkflow}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
        </div>
      </div>

      {isBuilding ? (
        /* Workflow Builder */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Palette */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(nodeTypes).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addNode(type)}
                  >
                    <config.icon className="w-4 h-4 mr-2" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Node Configuration */}
            {selectedNode && (
              <NodeConfigPanel 
                node={selectedNode} 
                onUpdate={updateNode}
              />
            )}
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Workflow Canvas</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsBuilding(false)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View List
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={canvasRef}
                  className="relative w-full h-full bg-gray-50 overflow-hidden"
                  style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                >
                  {/* Render Nodes */}
                  {workflowNodes.map(node => (
                    <WorkflowNode
                      key={node.id}
                      node={node}
                      isSelected={selectedNode?.id === node.id}
                      onClick={setSelectedNode}
                      onDelete={deleteNode}
                    />
                  ))}

                  {/* Render Connections */}
                  <svg className="absolute inset-0 pointer-events-none">
                    {connections.map(connection => {
                      const fromNode = workflowNodes.find(n => n.id === connection.from);
                      const toNode = workflowNodes.find(n => n.id === connection.to);
                      if (!fromNode || !toNode) return null;

                      return (
                        <line
                          key={connection.id}
                          x1={fromNode.x}
                          y1={fromNode.y}
                          x2={toNode.x}
                          y2={toNode.y}
                          stroke="#6b7280"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      );
                    })}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="#6b7280"
                        />
                      </marker>
                    </defs>
                  </svg>

                  {/* Empty State */}
                  {workflowNodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                        <p className="text-gray-600 mb-4">Add nodes from the palette to create your automation</p>
                        <Button onClick={() => addNode('trigger')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Trigger
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Workflow List */
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            {workflows.length > 0 ? (
              workflows.map(workflow => (
                <WorkflowListItem
                  key={workflow.id}
                  workflow={workflow}
                  onEdit={() => loadWorkflow(workflow.id)}
                  onExecute={() => executeWorkflow(workflow.id)}
                  onDelete={() => deleteWorkflow(workflow.id)}
                  onToggleStatus={() => toggleWorkflowStatus(workflow.id)}
                />
              ))
            ) : (
              <AnimatedCard className="p-8 text-center">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Workflows Yet</h3>
                <p className="text-gray-600 mb-4">Create your first workflow to automate your sales processes</p>
                <Button onClick={createNewWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </AnimatedCard>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflowTemplates.map(template => (
                <AnimatedCard key={template.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <Workflow className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.nodes.length} nodes
                    </span>
                    <Button size="sm" onClick={() => loadTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.activeWorkflows || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.executionsToday || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Play className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.successRate || '0%'}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default WorkflowAutomation;