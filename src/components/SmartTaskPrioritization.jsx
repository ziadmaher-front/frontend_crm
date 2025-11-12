import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Brain,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  DollarSign,
  Zap,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Star,
  Flag,
  Timer,
  Users,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';

const SmartTaskPrioritization = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [sortBy, setSortBy] = useState('priority_score');
  const [filterBy, setFilterBy] = useState('all');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    type: '',
    contact: '',
    deal_value: '',
    deadline: '',
    estimated_duration: '',
    dependencies: []
  });

  // Mock task data with AI priority scoring
  const mockTasks = [
    {
      id: 1,
      title: 'Follow up with TechCorp - Final Decision',
      description: 'Sarah Johnson mentioned they need to make a decision by Friday. High-value deal.',
      type: 'call',
      contact: 'Sarah Johnson - TechCorp',
      deal_value: 125000,
      deadline: '2024-01-18',
      estimated_duration: 30,
      status: 'pending',
      priority_score: 95,
      ai_insights: {
        urgency: 'high',
        importance: 'high',
        success_probability: 0.78,
        revenue_impact: 'high',
        time_sensitivity: 'critical',
        factors: [
          'High deal value ($125k)',
          'Decision deadline approaching',
          'Previous positive engagement',
          'Key decision maker identified'
        ],
        recommendations: [
          'Call before 2 PM (optimal time based on contact history)',
          'Prepare ROI calculator and case studies',
          'Have pricing flexibility ready'
        ]
      },
      created_at: '2024-01-15',
      assigned_to: 'John Smith',
      tags: ['high-value', 'decision-pending', 'hot-lead']
    },
    {
      id: 2,
      title: 'Send proposal to Global Solutions',
      description: 'Michael Chen requested detailed proposal after demo. Competitive situation.',
      type: 'email',
      contact: 'Michael Chen - Global Solutions',
      deal_value: 85000,
      deadline: '2024-01-19',
      estimated_duration: 45,
      status: 'pending',
      priority_score: 88,
      ai_insights: {
        urgency: 'high',
        importance: 'high',
        success_probability: 0.65,
        revenue_impact: 'medium-high',
        time_sensitivity: 'high',
        factors: [
          'Competitive situation detected',
          'Recent demo had positive feedback',
          'Budget confirmed',
          'Decision timeline is Q1'
        ],
        recommendations: [
          'Include competitive differentiation',
          'Highlight unique value propositions',
          'Offer limited-time incentive'
        ]
      },
      created_at: '2024-01-14',
      assigned_to: 'Jane Doe',
      tags: ['proposal', 'competitive', 'medium-value']
    },
    {
      id: 3,
      title: 'Quarterly business review with Acme Corp',
      description: 'Scheduled QBR to discuss expansion opportunities and renewal.',
      type: 'meeting',
      contact: 'David Wilson - Acme Corp',
      deal_value: 200000,
      deadline: '2024-01-22',
      estimated_duration: 60,
      status: 'scheduled',
      priority_score: 82,
      ai_insights: {
        urgency: 'medium',
        importance: 'high',
        success_probability: 0.85,
        revenue_impact: 'high',
        time_sensitivity: 'medium',
        factors: [
          'Existing customer with expansion potential',
          'Renewal coming up in Q2',
          'Strong relationship established',
          'Previous QBRs led to upsells'
        ],
        recommendations: [
          'Prepare expansion proposal',
          'Review usage analytics',
          'Identify new use cases'
        ]
      },
      created_at: '2024-01-12',
      assigned_to: 'John Smith',
      tags: ['existing-customer', 'expansion', 'qbr']
    },
    {
      id: 4,
      title: 'Cold outreach to StartupXYZ',
      description: 'New lead from website form. Early-stage startup, budget unknown.',
      type: 'call',
      contact: 'Lisa Park - StartupXYZ',
      deal_value: 15000,
      deadline: '2024-01-25',
      estimated_duration: 20,
      status: 'pending',
      priority_score: 45,
      ai_insights: {
        urgency: 'low',
        importance: 'medium',
        success_probability: 0.35,
        revenue_impact: 'low',
        time_sensitivity: 'low',
        factors: [
          'Early-stage startup (higher risk)',
          'Small deal size',
          'No previous engagement',
          'Budget not confirmed'
        ],
        recommendations: [
          'Qualify budget and timeline first',
          'Focus on pain points discovery',
          'Keep initial call short and focused'
        ]
      },
      created_at: '2024-01-16',
      assigned_to: 'Jane Doe',
      tags: ['cold-lead', 'startup', 'qualification-needed']
    },
    {
      id: 5,
      title: 'Contract negotiation with Enterprise Inc',
      description: 'Legal review completed. Need to address final terms and close.',
      type: 'meeting',
      contact: 'Robert Taylor - Enterprise Inc',
      deal_value: 350000,
      deadline: '2024-01-20',
      estimated_duration: 90,
      status: 'in_progress',
      priority_score: 92,
      ai_insights: {
        urgency: 'high',
        importance: 'high',
        success_probability: 0.88,
        revenue_impact: 'very_high',
        time_sensitivity: 'high',
        factors: [
          'Largest deal in pipeline',
          'Legal review completed',
          'Strong buying signals',
          'End of quarter timing'
        ],
        recommendations: [
          'Prepare for final negotiation',
          'Have executive sponsor available',
          'Review contract terms thoroughly'
        ]
      },
      created_at: '2024-01-10',
      assigned_to: 'John Smith',
      tags: ['enterprise', 'negotiation', 'high-value', 'closing']
    }
  ];

  const taskTypeIcons = {
    call: <Phone className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Users className="h-4 w-4" />,
    follow_up: <RotateCcw className="h-4 w-4" />,
    proposal: <FileText className="h-4 w-4" />,
    demo: <Play className="h-4 w-4" />
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  const statusColors = {
    pending: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    scheduled: 'bg-purple-500',
    completed: 'bg-green-500',
    cancelled: 'bg-red-500'
  };

  useEffect(() => {
    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter(task => {
        switch (filterBy) {
          case 'high_priority':
            return task.priority_score >= 80;
          case 'medium_priority':
            return task.priority_score >= 50 && task.priority_score < 80;
          case 'low_priority':
            return task.priority_score < 50;
          case 'overdue':
            return new Date(task.deadline) < new Date();
          case 'today':
            return new Date(task.deadline).toDateString() === new Date().toDateString();
          case 'this_week':
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return new Date(task.deadline) <= weekFromNow;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority_score':
          return b.priority_score - a.priority_score;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'deal_value':
          return b.deal_value - a.deal_value;
        case 'success_probability':
          return b.ai_insights.success_probability - a.ai_insights.success_probability;
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, filterBy, sortBy]);

  const getPriorityLevel = (score) => {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  };

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Timer className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateTask = () => {
    const newTask = {
      id: Date.now(),
      ...taskForm,
      status: 'pending',
      priority_score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
      ai_insights: {
        urgency: 'medium',
        importance: 'medium',
        success_probability: 0.5,
        revenue_impact: 'medium',
        time_sensitivity: 'medium',
        factors: ['New task - AI analysis pending'],
        recommendations: ['Complete task details for better AI insights']
      },
      created_at: new Date().toISOString().split('T')[0],
      assigned_to: 'Current User',
      tags: []
    };
    setTasks([...tasks, newTask]);
    setIsCreating(false);
    setTaskForm({
      title: '',
      description: '',
      type: '',
      contact: '',
      deal_value: '',
      deadline: '',
      estimated_duration: '',
      dependencies: []
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Task Prioritization</h1>
          <p className="text-muted-foreground">
            AI-powered task scoring and intelligent scheduling
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority_score">Priority Score</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="deal_value">Deal Value</SelectItem>
              <SelectItem value="success_probability">Success Probability</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="high_priority">High Priority</SelectItem>
              <SelectItem value="medium_priority">Medium Priority</SelectItem>
              <SelectItem value="low_priority">Low Priority</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task and let AI determine its priority
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    placeholder="Describe the task details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Task Type</Label>
                    <Select value={taskForm.type} onValueChange={(value) => setTaskForm({...taskForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="demo">Demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      value={taskForm.contact}
                      onChange={(e) => setTaskForm({...taskForm, contact: e.target.value})}
                      placeholder="Contact name and company"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deal_value">Deal Value ($)</Label>
                    <Input
                      id="deal_value"
                      type="number"
                      value={taskForm.deal_value}
                      onChange={(e) => setTaskForm({...taskForm, deal_value: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration">Duration (min)</Label>
                    <Input
                      id="estimated_duration"
                      type="number"
                      value={taskForm.estimated_duration}
                      onChange={(e) => setTaskForm({...taskForm, estimated_duration: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTask}>
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Priority Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredTasks.filter(t => t.priority_score >= 80).length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredTasks.filter(t => t.priority_score >= 50 && t.priority_score < 80).length}
            </div>
            <div className="text-sm text-muted-foreground">Medium Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredTasks.filter(t => t.priority_score < 50).length}
            </div>
            <div className="text-sm text-muted-foreground">Low Priority</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${filteredTasks.reduce((sum, t) => sum + t.deal_value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Pipeline</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {taskTypeIcons[task.type]}
                    <div className={`w-3 h-3 rounded-full ${statusColors[task.status]}`}></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getPriorityColor(task.priority_score)} border-current`} variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          {task.priority_score}
                        </Badge>
                        {getUrgencyIcon(task.ai_insights.urgency)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{task.contact}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>${task.deal_value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{task.deadline}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{task.estimated_duration}min</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {task.status === 'pending' && (
                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">AI Insights</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">
                      {Math.round(task.ai_insights.success_probability * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success Probability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold capitalize">
                      {task.ai_insights.urgency}
                    </div>
                    <div className="text-xs text-muted-foreground">Urgency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold capitalize">
                      {task.ai_insights.importance}
                    </div>
                    <div className="text-xs text-muted-foreground">Importance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold capitalize">
                      {task.ai_insights.revenue_impact.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue Impact</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Key Factors</h4>
                    <ul className="space-y-1">
                      {task.ai_insights.factors.map((factor, index) => (
                        <li key={index} className="text-xs flex items-start space-x-2">
                          <Target className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">AI Recommendations</h4>
                    <ul className="space-y-1">
                      {task.ai_insights.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs flex items-start space-x-2">
                          <Zap className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  <span className="text-sm font-medium">Tags:</span>
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task to see AI-powered prioritization in action
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartTaskPrioritization;