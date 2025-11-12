import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Square, 
  Diamond, 
  Circle, 
  ArrowRight, 
  Settings, 
  Save, 
  Eye,
  Trash2,
  Copy,
  Mail,
  Phone,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Download,
  Upload,
  BarChart3,
  AlertTriangle,
  Pause,
  RotateCcw
} from 'lucide-react';

const WorkflowBuilder = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Lead Qualification Process',
      description: 'Automated lead scoring and assignment workflow',
      status: 'active',
      trigger: 'New Lead Created',
      steps: 5,
      lastModified: '2024-01-15',
      executions: 142,
      successRate: 94.2
    },
    {
      id: 2,
      name: 'Deal Approval Workflow',
      description: 'Multi-stage approval process for high-value deals',
      status: 'draft',
      trigger: 'Deal Value > $10,000',
      steps: 3,
      lastModified: '2024-01-14',
      executions: 0,
      successRate: 0
    },
    {
      id: 3,
      name: 'Customer Onboarding',
      description: 'Automated welcome sequence for new customers',
      status: 'active',
      trigger: 'Deal Closed Won',
      steps: 8,
      lastModified: '2024-01-13',
      executions: 67,
      successRate: 89.6
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  const [draggedNode, setDraggedNode] = useState(null);
  const canvasRef = useRef(null);
  const [workflowNodes, setWorkflowNodes] = useState([
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 100 },
      data: { label: 'Start' }
    },
    {
      id: 'condition1',
      type: 'condition',
      position: { x: 300, y: 100 },
      data: { 
        label: 'Lead Score > 70?',
        condition: 'lead_score > 70'
      }
    },
    {
      id: 'action1',
      type: 'action',
      position: { x: 500, y: 50 },
      data: { 
        label: 'Assign to Sales Rep',
        actionType: 'assign',
        assignTo: 'sales_team'
      }
    },
    {
      id: 'action2',
      type: 'action',
      position: { x: 500, y: 150 },
      data: { 
        label: 'Send to Nurturing',
        actionType: 'email',
        template: 'nurturing_sequence'
      }
    }
  ]);

  const nodeTypes = [
    { type: 'start', icon: Play, label: 'Start', color: 'bg-green-500' },
    { type: 'condition', icon: Diamond, label: 'Condition', color: 'bg-yellow-500' },
    { type: 'action', icon: Square, label: 'Action', color: 'bg-blue-500' },
    { type: 'wait', icon: Clock, label: 'Wait', color: 'bg-purple-500' },
    { type: 'end', icon: CheckCircle, label: 'End', color: 'bg-red-500' }
  ];

  const actionTypes = [
    { value: 'email', label: 'Send Email', icon: Mail },
    { value: 'assign', label: 'Assign Record', icon: User },
    { value: 'create_task', label: 'Create Task', icon: Calendar },
    { value: 'update_field', label: 'Update Field', icon: FileText },
    { value: 'webhook', label: 'Webhook', icon: Zap },
    { value: 'approval', label: 'Request Approval', icon: CheckCircle }
  ];

  const WorkflowNode = ({ node, onEdit, onDelete }) => {
    const nodeType = nodeTypes.find(t => t.type === node.type);
    const Icon = nodeType?.icon || Circle;

    return (
      <div className="relative group">
        <Card className="w-48 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-full ${nodeType?.color} flex items-center justify-center`}>
                <Icon className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium truncate">{node.data.label}</span>
            </div>
            {node.data.condition && (
              <p className="text-xs text-gray-500 truncate">{node.data.condition}</p>
            )}
            {node.data.actionType && (
              <Badge variant="outline" className="text-xs">
                {actionTypes.find(a => a.value === node.data.actionType)?.label}
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => onEdit(node)}>
              <Settings className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => onDelete(node.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const WorkflowCanvas = () => {
    return (
      <div className="relative w-full h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-auto">
        <div className="absolute inset-0 p-4">
          {workflowNodes.map((node) => (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y
              }}
            >
              <WorkflowNode
                node={node}
                onEdit={(node) => console.log('Edit node:', node)}
                onDelete={(id) => setWorkflowNodes(prev => prev.filter(n => n.id !== id))}
              />
            </div>
          ))}
          
          {/* Connection lines */}
          <svg className="absolute inset-0 pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            {/* Example connections */}
            <line x1="196" y1="125" x2="300" y2="125" 
                  stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="396" y1="110" x2="500" y2="75" 
                  stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="396" y1="140" x2="500" y2="175" 
                  stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
          </svg>
        </div>
      </div>
    );
  };

  const NodePalette = () => {
    return (
      <Card className="w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Workflow Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                draggable
              >
                <div className={`w-6 h-6 rounded-full ${nodeType.color} flex items-center justify-center`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm">{nodeType.label}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <p className="text-gray-600">Create and manage automated business processes</p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workflow.name}</CardTitle>
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{workflow.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Trigger:</span>
                  <span className="truncate">{workflow.trigger}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Steps:</span>
                  <span>{workflow.steps}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Executions:</span>
                  <span>{workflow.executions}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Success Rate:</span>
                  <span className={workflow.successRate > 90 ? 'text-green-600' : workflow.successRate > 70 ? 'text-yellow-600' : 'text-red-600'}>
                    {workflow.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Modified:</span>
                  <span>{workflow.lastModified}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => setIsBuilderOpen(true)}>
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-3 w-3 mr-1" />
                  Clone
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Workflow Builder - Lead Qualification Process</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="flex gap-4 h-full mt-4">
              <NodePalette />
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Draft</Badge>
                    <Switch />
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
                
                <WorkflowCanvas />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workflow Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input id="workflow-name" defaultValue="Lead Qualification Process" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trigger">Trigger</Label>
                      <Select defaultValue="new_lead">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new_lead">New Lead Created</SelectItem>
                          <SelectItem value="lead_updated">Lead Updated</SelectItem>
                          <SelectItem value="deal_created">Deal Created</SelectItem>
                          <SelectItem value="contact_updated">Contact Updated</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe what this workflow does..."
                      defaultValue="Automated lead scoring and assignment workflow"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Error Handling</Label>
                      <Select defaultValue="continue">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continue">Continue on Error</SelectItem>
                          <SelectItem value="stop">Stop on Error</SelectItem>
                          <SelectItem value="retry">Retry on Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Max Executions/Day</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Executions</p>
                        <p className="text-2xl font-bold">142</p>
                      </div>
                      <Play className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">94.2%</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Duration</p>
                        <p className="text-2xl font-bold">2.3s</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Errors</p>
                        <p className="text-2xl font-bold text-red-600">8</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: 1, status: 'success', time: '2 minutes ago', duration: '1.8s' },
                      { id: 2, status: 'success', time: '5 minutes ago', duration: '2.1s' },
                      { id: 3, status: 'error', time: '12 minutes ago', duration: '0.5s' },
                      { id: 4, status: 'success', time: '18 minutes ago', duration: '2.3s' },
                    ].map((execution) => (
                      <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {execution.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">Execution #{execution.id}</p>
                            <p className="text-xs text-gray-500">{execution.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{execution.duration}</p>
                          <Badge variant={execution.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                            {execution.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowBuilder;