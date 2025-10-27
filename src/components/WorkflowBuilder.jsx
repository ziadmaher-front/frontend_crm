import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Zap
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
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'Deal Approval Workflow',
      description: 'Multi-stage approval process for high-value deals',
      status: 'draft',
      trigger: 'Deal Value > $10,000',
      steps: 3,
      lastModified: '2024-01-14'
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
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
                  <span>{workflow.trigger}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Steps:</span>
                  <span>{workflow.steps}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Modified:</span>
                  <span>{workflow.lastModified}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex gap-2">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Workflow Builder - Lead Qualification Process</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 h-full">
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
                </div>
                <Badge variant="outline">Draft</Badge>
              </div>
              
              <WorkflowCanvas />
              
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
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowBuilder;