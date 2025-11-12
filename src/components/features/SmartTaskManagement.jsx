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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Filter, 
  Plus, 
  Search,
  SortAsc,
  SortDesc,
  Target,
  Zap,
  Brain,
  Users,
  TrendingUp,
  Star,
  Flag,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useTasks, useContacts, useDeals, useLeads } from '@/hooks/useBusinessLogic';

const SmartTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [viewMode, setViewMode] = useState('list'); // list, kanban, calendar
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  const { tasks: businessTasks, refreshTasks } = useTasks();
  const { contacts } = useContacts();
  const { deals } = useDeals();
  const { leads } = useLeads();

  // Enhanced task data with AI insights
  useEffect(() => {
    const enhancedTasks = businessTasks.map(task => ({
      ...task,
      aiPriority: calculateAIPriority(task),
      estimatedDuration: estimateTaskDuration(task),
      suggestedAssignee: suggestAssignee(task),
      relatedEntities: findRelatedEntities(task),
      smartTags: generateSmartTags(task),
      riskLevel: assessTaskRisk(task),
      completionProbability: predictCompletionProbability(task)
    }));
    
    setTasks(enhancedTasks);
  }, [businessTasks, contacts, deals, leads]);

  // AI-powered task priority calculation
  const calculateAIPriority = useCallback((task) => {
    let score = 0;
    
    // Base priority
    const priorityScores = { high: 100, medium: 60, low: 30 };
    score += priorityScores[task.priority] || 30;
    
    // Due date urgency
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 1) score += 50;
      else if (daysUntilDue <= 3) score += 30;
      else if (daysUntilDue <= 7) score += 15;
    }
    
    // Related entity importance
    if (task.dealId) {
      const relatedDeal = deals.find(d => d.id === task.dealId);
      if (relatedDeal?.value > 50000) score += 25;
      if (relatedDeal?.stage === 'negotiation') score += 20;
    }
    
    // Task type importance
    const importantTypes = ['follow_up', 'proposal', 'demo', 'closing'];
    if (importantTypes.includes(task.type)) score += 20;
    
    return Math.min(score, 200);
  }, [deals]);

  // Estimate task duration based on type and complexity
  const estimateTaskDuration = useCallback((task) => {
    const baseDurations = {
      call: 30,
      email: 15,
      meeting: 60,
      demo: 90,
      proposal: 120,
      follow_up: 20,
      research: 45,
      admin: 30
    };
    
    let duration = baseDurations[task.type] || 30;
    
    // Adjust based on description length (complexity indicator)
    if (task.description?.length > 200) duration *= 1.5;
    if (task.description?.length > 500) duration *= 2;
    
    return Math.round(duration);
  }, []);

  // Suggest best assignee based on workload and expertise
  const suggestAssignee = useCallback((task) => {
    if (!contacts.length) return null;
    
    // Simple logic - in real app, this would consider workload, expertise, etc.
    const availableReps = contacts.filter(c => c.type === 'employee' || c.role?.includes('sales'));
    if (availableReps.length === 0) return null;
    
    // For demo, randomly assign but prefer less loaded reps
    return availableReps[Math.floor(Math.random() * availableReps.length)];
  }, [contacts]);

  // Find related CRM entities
  const findRelatedEntities = useCallback((task) => {
    const related = {
      deals: [],
      leads: [],
      contacts: []
    };
    
    if (task.dealId) {
      const deal = deals.find(d => d.id === task.dealId);
      if (deal) related.deals.push(deal);
    }
    
    if (task.leadId) {
      const lead = leads.find(l => l.id === task.leadId);
      if (lead) related.leads.push(lead);
    }
    
    if (task.contactId) {
      const contact = contacts.find(c => c.id === task.contactId);
      if (contact) related.contacts.push(contact);
    }
    
    return related;
  }, [deals, leads, contacts]);

  // Generate smart tags based on task content
  const generateSmartTags = useCallback((task) => {
    const tags = [];
    
    if (task.description) {
      const desc = task.description.toLowerCase();
      if (desc.includes('urgent') || desc.includes('asap')) tags.push('urgent');
      if (desc.includes('follow up') || desc.includes('follow-up')) tags.push('follow-up');
      if (desc.includes('demo') || desc.includes('presentation')) tags.push('demo');
      if (desc.includes('proposal') || desc.includes('quote')) tags.push('proposal');
      if (desc.includes('contract') || desc.includes('agreement')) tags.push('contract');
    }
    
    // Add tags based on related entities
    if (task.dealId) tags.push('deal-related');
    if (task.leadId) tags.push('lead-related');
    
    return tags;
  }, []);

  // Assess task risk level
  const assessTaskRisk = useCallback((task) => {
    let riskScore = 0;
    
    // Overdue tasks are high risk
    if (task.dueDate && new Date(task.dueDate) < new Date()) riskScore += 50;
    
    // High-value deal tasks are risky if delayed
    if (task.dealId) {
      const deal = deals.find(d => d.id === task.dealId);
      if (deal?.value > 100000) riskScore += 30;
    }
    
    // Tasks without assignee are risky
    if (!task.assignedTo) riskScore += 20;
    
    // Long overdue tasks
    if (task.dueDate) {
      const daysOverdue = Math.ceil((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 7) riskScore += 40;
    }
    
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }, [deals]);

  // Predict completion probability
  const predictCompletionProbability = useCallback((task) => {
    let probability = 70; // Base probability
    
    // Adjust based on due date
    if (task.dueDate) {
      const daysUntilDue = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue > 7) probability += 20;
      else if (daysUntilDue < 1) probability -= 30;
    }
    
    // Adjust based on assignee
    if (task.assignedTo) probability += 15;
    
    // Adjust based on priority
    if (task.priority === 'high') probability += 10;
    else if (task.priority === 'low') probability -= 10;
    
    return Math.max(10, Math.min(95, probability));
  }, []);

  // Filter and sort tasks
  useEffect(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!task.title?.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Status filter
      if (!showCompleted && task.status === 'completed') return false;
      
      // Category filter
      if (filterBy !== 'all') {
        if (filterBy === 'overdue') {
          return task.dueDate && new Date(task.dueDate) < new Date();
        }
        if (filterBy === 'high-priority') {
          return task.priority === 'high' || task.aiPriority > 80;
        }
        if (filterBy === 'unassigned') {
          return !task.assignedTo;
        }
        if (filterBy === 'due-today') {
          const today = new Date().toDateString();
          return task.dueDate && new Date(task.dueDate).toDateString() === today;
        }
      }
      
      return true;
    });
    
    // Sort tasks
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'priority':
          aVal = a.aiPriority || 0;
          bVal = b.aiPriority || 0;
          break;
        case 'dueDate':
          aVal = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bVal = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'title':
          aVal = a.title || '';
          bVal = b.title || '';
          break;
        case 'status':
          aVal = a.status || '';
          bVal = b.status || '';
          break;
        default:
          aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredTasks(filtered);
  }, [tasks, searchQuery, showCompleted, filterBy, sortBy, sortOrder]);

  // Generate smart suggestions
  useEffect(() => {
    const suggestions = [];
    
    // Overdue tasks suggestion
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'overdue',
        title: `${overdueTasks.length} Overdue Tasks`,
        description: 'You have tasks that are past their due date',
        action: 'View Overdue',
        priority: 'high',
        count: overdueTasks.length
      });
    }
    
    // High-value deal tasks
    const highValueTasks = tasks.filter(t => {
      if (!t.dealId) return false;
      const deal = deals.find(d => d.id === t.dealId);
      return deal && deal.value > 50000 && t.status !== 'completed';
    });
    if (highValueTasks.length > 0) {
      suggestions.push({
        type: 'high-value',
        title: `${highValueTasks.length} High-Value Deal Tasks`,
        description: 'Tasks related to deals worth over $50K',
        action: 'Prioritize',
        priority: 'medium',
        count: highValueTasks.length
      });
    }
    
    // Unassigned tasks
    const unassignedTasks = tasks.filter(t => !t.assignedTo && t.status !== 'completed');
    if (unassignedTasks.length > 0) {
      suggestions.push({
        type: 'unassigned',
        title: `${unassignedTasks.length} Unassigned Tasks`,
        description: 'Tasks that need to be assigned to team members',
        action: 'Assign',
        priority: 'medium',
        count: unassignedTasks.length
      });
    }
    
    setSmartSuggestions(suggestions);
  }, [tasks, deals]);

  const toggleTaskSelection = useCallback((taskId) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const toggleTaskStatus = useCallback((taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  }, []);

  const getPriorityColor = (priority, aiPriority) => {
    if (aiPriority > 80) return 'red';
    if (priority === 'high' || aiPriority > 60) return 'orange';
    if (priority === 'medium' || aiPriority > 40) return 'yellow';
    return 'green';
  };

  const TaskCard = ({ task }) => {
    const priorityColor = getPriorityColor(task.priority, task.aiPriority);
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.01 }}
        className={`p-4 bg-white rounded-lg border transition-all duration-200 ${
          selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
        } ${task.status === 'completed' ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={selectedTasks.has(task.id)}
              onCheckedChange={() => toggleTaskSelection(task.id)}
            />
            <div className="flex-1">
              <h3 className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={priorityColor === 'red' ? 'destructive' : 'secondary'}>
              AI: {task.aiPriority}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleTaskStatus(task.id)}
            >
              {task.status === 'completed' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {task.dueDate && (
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                <Clock className="h-4 w-4" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {task.estimatedDuration && (
              <div className="flex items-center space-x-1 text-gray-600">
                <Target className="h-4 w-4" />
                <span>{task.estimatedDuration}m</span>
              </div>
            )}
            
            {task.assignedTo && (
              <div className="flex items-center space-x-1 text-gray-600">
                <User className="h-4 w-4" />
                <span>{task.assignedTo}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {task.riskLevel === 'high' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
            
            <div className="flex space-x-1">
              {task.smartTags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {task.completionProbability && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Completion Probability</span>
              <span>{task.completionProbability}%</span>
            </div>
            <Progress value={task.completionProbability} className="h-1" />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Smart Task Management</span>
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered task prioritization and management
          </p>
        </div>
        
        <Button onClick={() => setIsCreatingTask(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartSuggestions.map((suggestion, index) => (
            <Alert key={index} className={`${
              suggestion.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <Zap className={`h-4 w-4 ${
                suggestion.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{suggestion.title}</p>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFilterBy(suggestion.type)}
                  >
                    {suggestion.action}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="due-today">Due Today</SelectItem>
              <SelectItem value="high-priority">High Priority</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">AI Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={showCompleted}
              onCheckedChange={setShowCompleted}
            />
            <Label>Show Completed</Label>
          </div>
          
          {selectedTasks.size > 0 && (
            <Badge variant="secondary">
              {selectedTasks.size} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your filters or search query'
                : 'Create your first task to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status !== 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartTaskManagement;