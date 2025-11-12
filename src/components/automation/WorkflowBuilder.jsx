import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CogIcon,
  BoltIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  Squares2X2Icon,
  CodeBracketIcon,
  EyeIcon,
  ShareIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../hooks/useNotifications';

// Workflow node types and their configurations
const NODE_TYPES = {
  trigger: {
    category: 'Triggers',
    items: [
      { id: 'lead_created', name: 'New Lead', icon: UserIcon, color: 'green' },
      { id: 'deal_updated', name: 'Deal Updated', icon: FunnelIcon, color: 'blue' },
      { id: 'email_received', name: 'Email Received', icon: EnvelopeIcon, color: 'purple' },
      { id: 'time_based', name: 'Time-based', icon: ClockIcon, color: 'orange' },
      { id: 'form_submitted', name: 'Form Submitted', icon: DocumentTextIcon, color: 'indigo' }
    ]
  },
  condition: {
    category: 'Conditions',
    items: [
      { id: 'if_condition', name: 'If/Then', icon: ArrowRightIcon, color: 'yellow' },
      { id: 'field_value', name: 'Field Value', icon: TagIcon, color: 'red' },
      { id: 'date_condition', name: 'Date Condition', icon: CalendarIcon, color: 'pink' },
      { id: 'score_condition', name: 'Score Condition', icon: ChartBarIcon, color: 'teal' }
    ]
  },
  action: {
    category: 'Actions',
    items: [
      { id: 'send_email', name: 'Send Email', icon: EnvelopeIcon, color: 'blue' },
      { id: 'create_task', name: 'Create Task', icon: CheckCircleIcon, color: 'green' },
      { id: 'update_field', name: 'Update Field', icon: TagIcon, color: 'purple' },
      { id: 'assign_user', name: 'Assign User', icon: UserIcon, color: 'orange' },
      { id: 'schedule_call', name: 'Schedule Call', icon: PhoneIcon, color: 'red' },
      { id: 'add_to_sequence', name: 'Add to Sequence', icon: ArrowDownIcon, color: 'indigo' },
      { id: 'webhook', name: 'Webhook', icon: CodeBracketIcon, color: 'gray' }
    ]
  }
};

// Draggable Node Component
const DraggableNode = ({ nodeType, onDragStart }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'node',
    item: { type: nodeType.id, nodeType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    pink: 'bg-pink-50 border-pink-200 text-pink-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-lg border-2 border-dashed cursor-move transition-all ${
        colorClasses[nodeType.color]
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onDragStart={() => onDragStart(nodeType)}
    >
      <div className="flex items-center space-x-2">
        <nodeType.icon className="h-5 w-5" />
        <span className="text-sm font-medium">{nodeType.name}</span>
      </div>
    </motion.div>
  );
};

// Workflow Node Component
const WorkflowNode = ({ node, onSelect, onDelete, onUpdate, isSelected, connections }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nodeData, setNodeData] = useState(node.data || {});

  const nodeType = Object.values(NODE_TYPES)
    .flatMap(category => category.items)
    .find(type => type.id === node.type);

  const colorClasses = {
    green: 'bg-green-100 border-green-300 text-green-800',
    blue: 'bg-blue-100 border-blue-300 text-blue-800',
    purple: 'bg-purple-100 border-purple-300 text-purple-800',
    orange: 'bg-orange-100 border-orange-300 text-orange-800',
    red: 'bg-red-100 border-red-300 text-red-800',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    pink: 'bg-pink-100 border-pink-300 text-pink-800',
    teal: 'bg-teal-100 border-teal-300 text-teal-800',
    indigo: 'bg-indigo-100 border-indigo-300 text-indigo-800',
    gray: 'bg-gray-100 border-gray-300 text-gray-800'
  };

  const handleSave = () => {
    onUpdate(node.id, { ...node, data: nodeData });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
        colorClasses[nodeType?.color || 'gray']
      } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onClick={() => onSelect(node.id)}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        minWidth: '200px'
      }}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {nodeType && <nodeType.icon className="h-5 w-5" />}
          <span className="font-medium">{nodeType?.name || 'Unknown'}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
          >
            <CogIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="p-1 hover:bg-white hover:bg-opacity-50 rounded text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className="text-sm">
        {node.data?.description || 'Click to configure'}
      </div>

      {/* Connection Points */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
      </div>
      
      {node.type !== 'trigger' && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded-full"></div>
        </div>
      )}

      {/* Status Indicator */}
      {node.status && (
        <div className="absolute -top-2 -right-2">
          {node.status === 'running' && (
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          )}
          {node.status === 'error' && (
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          )}
          {node.status === 'completed' && (
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold mb-4">Configure {nodeType?.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={nodeData.description || ''}
                    onChange={(e) => setNodeData({...nodeData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description..."
                  />
                </div>

                {/* Node-specific configuration fields */}
                {node.type === 'send_email' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Template
                      </label>
                      <select
                        value={nodeData.template || ''}
                        onChange={(e) => setNodeData({...nodeData, template: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select template...</option>
                        <option value="welcome">Welcome Email</option>
                        <option value="followup">Follow-up Email</option>
                        <option value="reminder">Reminder Email</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delay (minutes)
                      </label>
                      <input
                        type="number"
                        value={nodeData.delay || 0}
                        onChange={(e) => setNodeData({...nodeData, delay: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </>
                )}

                {node.type === 'if_condition' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <select
                        value={nodeData.field || ''}
                        onChange={(e) => setNodeData({...nodeData, field: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select field...</option>
                        <option value="lead_score">Lead Score</option>
                        <option value="status">Status</option>
                        <option value="source">Source</option>
                        <option value="company_size">Company Size</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <select
                        value={nodeData.condition || ''}
                        onChange={(e) => setNodeData({...nodeData, condition: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select condition...</option>
                        <option value="equals">Equals</option>
                        <option value="greater_than">Greater than</option>
                        <option value="less_than">Less than</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={nodeData.value || ''}
                        onChange={(e) => setNodeData({...nodeData, value: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter value..."
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Canvas Component
const WorkflowCanvas = ({ nodes, connections, onNodeAdd, onNodeUpdate, onNodeDelete, onNodeSelect, selectedNodeId }) => {
  const canvasRef = useRef(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  const [{ isOver }, drop] = useDrop({
    accept: 'node',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      const position = {
        x: offset.x - canvasRect.left - canvasOffset.x,
        y: offset.y - canvasRect.top - canvasOffset.y
      };

      onNodeAdd({
        id: Date.now().toString(),
        type: item.type,
        position,
        data: {}
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  return (
    <div
      ref={(node) => {
        canvasRef.current = node;
        drop(node);
      }}
      className={`relative w-full h-full bg-gray-50 overflow-hidden ${
        isOver ? 'bg-blue-50' : ''
      }`}
      style={{ minHeight: '600px' }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((connection) => {
          const fromNode = nodes.find(n => n.id === connection.from);
          const toNode = nodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;

          const fromX = fromNode.position.x + 200; // Node width
          const fromY = fromNode.position.y + 40; // Half node height
          const toX = toNode.position.x;
          const toY = toNode.position.y + 40;

          return (
            <g key={`${connection.from}-${connection.to}`}>
              <path
                d={`M ${fromX} ${fromY} C ${fromX + 50} ${fromY} ${toX - 50} ${toY} ${toX} ${toY}`}
                stroke="#6B7280"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          );
        })}
        
        {/* Arrow marker definition */}
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
              fill="#6B7280"
            />
          </marker>
        </defs>
      </svg>

      {/* Workflow Nodes */}
      {nodes.map((node) => (
        <WorkflowNode
          key={node.id}
          node={node}
          onSelect={onNodeSelect}
          onDelete={onNodeDelete}
          onUpdate={onNodeUpdate}
          isSelected={selectedNodeId === node.id}
          connections={connections}
        />
      ))}

      {/* Drop Zone Indicator */}
      {isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-50 flex items-center justify-center">
          <div className="text-blue-600 text-lg font-medium">Drop node here</div>
        </div>
      )}
    </div>
  );
};

// Main Workflow Builder Component
const WorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState({
    id: null,
    name: 'New Workflow',
    description: '',
    status: 'draft',
    nodes: [],
    connections: []
  });
  
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { showNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Load existing workflows
  const { data: workflows, isLoading } = useQuery(
    'workflows',
    async () => {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      return response.json();
    }
  );

  // Save workflow mutation
  const saveWorkflowMutation = useMutation(
    async (workflowData) => {
      const response = await fetch('/api/workflows', {
        method: workflow.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData)
      });
      if (!response.ok) throw new Error('Failed to save workflow');
      return response.json();
    },
    {
      onSuccess: (data) => {
        setWorkflow(prev => ({ ...prev, id: data.id }));
        queryClient.invalidateQueries('workflows');
        showNotification('Workflow saved successfully', 'success');
      },
      onError: () => {
        showNotification('Failed to save workflow', 'error');
      }
    }
  );

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation(
    async (workflowId) => {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to execute workflow');
      return response.json();
    },
    {
      onSuccess: () => {
        showNotification('Workflow started successfully', 'success');
        setIsRunning(true);
      },
      onError: () => {
        showNotification('Failed to start workflow', 'error');
      }
    }
  );

  const handleNodeAdd = useCallback((node) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, node]
    }));
  }, []);

  const handleNodeUpdate = useCallback((nodeId, updatedNode) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? updatedNode : node
      )
    }));
  }, []);

  const handleNodeDelete = useCallback((nodeId) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.from !== nodeId && conn.to !== nodeId
      )
    }));
    setSelectedNodeId(null);
  }, []);

  const handleSaveWorkflow = () => {
    if (!workflow.name.trim()) {
      showNotification('Please enter a workflow name', 'error');
      return;
    }
    
    if (workflow.nodes.length === 0) {
      showNotification('Please add at least one node to the workflow', 'error');
      return;
    }

    saveWorkflowMutation.mutate(workflow);
  };

  const handleExecuteWorkflow = () => {
    if (!workflow.id) {
      showNotification('Please save the workflow first', 'error');
      return;
    }

    executeWorkflowMutation.mutate(workflow.id);
  };

  const handleLoadWorkflow = (selectedWorkflow) => {
    setWorkflow(selectedWorkflow);
    setSelectedNodeId(null);
  };

  const handleNewWorkflow = () => {
    setWorkflow({
      id: null,
      name: 'New Workflow',
      description: '',
      status: 'draft',
      nodes: [],
      connections: []
    });
    setSelectedNodeId(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BoltIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Workflow Builder</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Workflow name..."
              />
              
              <select
                value={workflow.id || ''}
                onChange={(e) => {
                  const selectedWorkflow = workflows?.find(w => w.id === e.target.value);
                  if (selectedWorkflow) {
                    handleLoadWorkflow(selectedWorkflow);
                  }
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Load workflow...</option>
                {workflows?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewWorkflow}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowPreview(true)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              title="Preview"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleSaveWorkflow}
              disabled={saveWorkflowMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saveWorkflowMutation.isLoading ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleExecuteWorkflow}
              disabled={!workflow.id || isRunning || executeWorkflowMutation.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <PauseIcon className="h-4 w-4" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4" />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Node Palette */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Workflow Components</h3>
            
            {Object.entries(NODE_TYPES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="mb-6">
                <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.items.map((nodeType) => (
                    <DraggableNode
                      key={nodeType.id}
                      nodeType={nodeType}
                      onDragStart={() => {}}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <WorkflowCanvas
              nodes={workflow.nodes}
              connections={workflow.connections}
              onNodeAdd={handleNodeAdd}
              onNodeUpdate={handleNodeUpdate}
              onNodeDelete={handleNodeDelete}
              onNodeSelect={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
            />
          </div>

          {/* Properties Panel */}
          {selectedNodeId && (
            <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Node Properties</h3>
              
              {/* Node properties would be rendered here based on selected node */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Node ID
                  </label>
                  <input
                    type="text"
                    value={selectedNodeId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                {/* Additional properties based on node type */}
              </div>
            </div>
          )}
        </div>

        {/* Workflow Statistics */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Nodes: {workflow.nodes.length}</span>
              <span>Connections: {workflow.connections.length}</span>
              <span>Status: {workflow.status}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isRunning && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Workflow Running</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Workflow Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Workflow: {workflow.name}</h4>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Flow Steps:</h4>
                    <div className="space-y-2">
                      {workflow.nodes.map((node, index) => {
                        const nodeType = Object.values(NODE_TYPES)
                          .flatMap(category => category.items)
                          .find(type => type.id === node.type);
                        
                        return (
                          <div key={node.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                              {index + 1}
                            </div>
                            {nodeType && <nodeType.icon className="h-5 w-5 text-gray-600" />}
                            <div>
                              <div className="font-medium">{nodeType?.name}</div>
                              <div className="text-sm text-gray-600">{node.data?.description || 'No description'}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilder;