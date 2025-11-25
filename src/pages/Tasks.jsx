import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  CheckSquare,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function Tasks() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [showTaskDetailsDialog, setShowTaskDetailsDialog] = useState(false);
  const [localError, setLocalError] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    status: "",
    priority: "",
    notes: "",
  });
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "not started",
    notes: "",
    links: [],
  });

  const queryClient = useQueryClient();
  
  // Get ownerId from auth store if available
  const getOwnerId = () => {
    if (user?.id) {
      return user.id;
    }
    // Try to get from localStorage
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const storedUser = parsed?.state?.user;
        if (storedUser?.id) {
          return storedUser.id;
        }
      }
    } catch (e) {
      console.warn('Could not get user from localStorage:', e);
    }
    return null;
  };

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list(1, 100), // page 1, limit 100
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      console.log('Creating task with data:', data);
      return base44.entities.Task.create(data);
    },
    onSuccess: (data) => {
      console.log('Task created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowDialog(false);
      resetForm();
      setLocalError(""); // Clear errors on success
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      const errorMessage = error.message || 'Failed to create task. Please try again.';
      setLocalError(errorMessage);
      console.error('Full error object:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('Updating task:', id, data);
      return base44.entities.Task.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowDialog(false);
      setEditingTask(null);
      resetForm();
      setLocalError(""); // Clear errors on success
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      setLocalError(error.message || 'Failed to update task. Please try again.');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updateFields }) => {
      console.log('Bulk updating tasks:', ids, updateFields);
      return base44.entities.Task.bulkUpdate(ids, updateFields);
    },
    onSuccess: (result) => {
      console.log('Bulk update result:', result);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowBulkUpdateDialog(false);
      setSelectedTasks([]);
      setBulkUpdateData({ status: "", priority: "", notes: "" });
      toast({
        title: "Success",
        description: `Updated ${result.updatedCount || selectedTasks.length} task(s) successfully`,
      });
    },
    onError: (error) => {
      console.error('Error bulk updating tasks:', error);
      setLocalError(error.message || 'Failed to bulk update tasks. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => {
      console.log('Bulk deleting tasks:', ids);
      return base44.entities.Task.bulkDelete(ids);
    },
    onSuccess: (result) => {
      console.log('Bulk delete result:', result);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTasks([]);
      toast({
        title: "Success",
        description: `Deleted ${result.deletedCount || selectedTasks.length} task(s) successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tasks",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      subject: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      status: "not started",
      notes: "",
      links: [],
    });
    setLocalError(""); // Clear errors when resetting form
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(""); // Clear any previous errors
    
    // Validate required fields
    if (!formData.subject || !formData.subject.trim()) {
      setLocalError("Subject is required");
      return;
    }
    
    // Get ownerId and add it to form data
    const ownerId = getOwnerId();
    if (!ownerId) {
      setLocalError("Unable to determine your user ID. Please ensure you are logged in and try refreshing the page.");
      console.error('No ownerId found. User from store:', user);
      return;
    }
    
    const taskData = {
      ...formData,
      ownerId: ownerId,
    };
    
    console.log('Submitting task form:', taskData);
    
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: taskData });
    } else {
      createMutation.mutate(taskData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      subject: task.subject || task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status || "not started",
      notes: task.notes || "",
      links: task.links || [],
    });
    setShowDialog(true);
  };

  const handleStatusToggle = async (task) => {
    // Convert frontend status to backend format
    const currentStatus = task.status === 'Completed' ? 'completed' : 
                         task.status === 'Not Started' ? 'not started' :
                         task.status === 'In Progress' ? 'in progress' :
                         task.status === 'Deferred' ? 'deferred' : task.status;
    const newStatus = currentStatus === 'completed' ? 'not started' : 'completed';
    await updateMutation.mutateAsync({ 
      id: task.id, 
      data: { status: newStatus } 
    });
  };

  // Helper to normalize status for comparison
  const normalizeStatus = (status) => {
    if (!status) return '';
    const statusMap = {
      'Not Started': 'not started',
      'In Progress': 'in progress',
      'Completed': 'completed',
      'Deferred': 'deferred',
    };
    return statusMap[status] || status.toLowerCase();
  };

  const filteredTasks = tasks.filter(task => {
    const taskTitle = task.subject || task.title || '';
    const matchesSearch = 
      taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const taskStatus = normalizeStatus(task.status);
    const filterStatusNormalized = filterStatus === "all" ? "all" : normalizeStatus(filterStatus);
    const matchesStatus = filterStatusNormalized === "all" || taskStatus === filterStatusNormalized;
    
    return matchesSearch && matchesStatus;
  });

  const priorityColors = {
    'Low': 'bg-blue-100 text-blue-800 border-blue-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Urgent': 'bg-red-100 text-red-800 border-red-200',
  };

  const statusIcons = {
    'Not Started': Circle,
    'In Progress': Clock,
    'Completed': CheckCircle2,
    'Deferred': AlertCircle,
    'not started': Circle,
    'in progress': Clock,
    'completed': CheckCircle2,
    'deferred': AlertCircle,
  };

  // Helper to get display status
  const getDisplayStatus = (status) => {
    if (!status) return 'Not Started';
    const statusMap = {
      'not started': 'Not Started',
      'in progress': 'In Progress',
      'completed': 'Completed',
      'deferred': 'Deferred',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getTasksByStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return filteredTasks.filter(t => normalizeStatus(t.status) === normalizedStatus);
  };

  // Selection handlers
  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleBulkUpdate = () => {
    if (selectedTasks.length === 0) {
      setLocalError("Please select at least one task to update");
      return;
    }

    const updateFields = {};
    if (bulkUpdateData.status) {
      updateFields.status = bulkUpdateData.status;
    }
    if (bulkUpdateData.priority) {
      updateFields.priority = bulkUpdateData.priority;
    }
    if (bulkUpdateData.notes) {
      updateFields.notes = bulkUpdateData.notes;
    }

    if (Object.keys(updateFields).length === 0) {
      setLocalError("Please select at least one field to update");
      return;
    }

    bulkUpdateMutation.mutate({ ids: selectedTasks, updateFields });
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) {
      setLocalError("Please select at least one task to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} task(s)?`)) {
      bulkDeleteMutation.mutate(selectedTasks);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <CheckSquare className="w-8 h-8" />
            Tasks
          </h1>
          <p className="crm-page-subtitle">Organize and track your to-do items</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            resetForm();
            setShowDialog(true);
          }}
          className="crm-btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold">{getTasksByStatus('not started').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{getTasksByStatus('in progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{getTasksByStatus('completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Deferred</p>
                <p className="text-2xl font-bold">{getTasksByStatus('deferred').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="crm-toolbar">
        <div className="crm-toolbar-left">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="crm-input pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="crm-select w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="deferred">Deferred</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <Checkbox
              checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">Select all</span>
          </div>
        )}
        {filteredTasks.map((task) => {
          const displayStatus = getDisplayStatus(task.status);
          const StatusIcon = statusIcons[task.status] || statusIcons[displayStatus] || Circle;
          const normalizedStatus = normalizeStatus(task.status);
          const isCompleted = normalizedStatus === 'completed';
          const dueDate = task.dueDate || task.due_date;
          const isOverdue = dueDate && new Date(dueDate) < new Date() && !isCompleted;
          const isSelected = selectedTasks.includes(task.id);

          return (
            <Card 
              key={task.id} 
              className={`border-none shadow-md hover:shadow-lg transition-all group cursor-pointer ${
                isCompleted ? 'bg-gray-50' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                setViewingTask(task);
                setShowTaskDetailsDialog(true);
              }}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectTask(task.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={() => handleStatusToggle(task)}
                      className="flex-shrink-0 mt-1"
                    >
                      <StatusIcon 
                        className={`w-6 h-6 transition-colors ${
                          isCompleted 
                            ? 'text-green-600 fill-green-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${
                          isCompleted ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.subject || task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(task);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this task?")) {
                              deleteMutation.mutate(task.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={`${priorityColors[task.priority]} border`}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {displayStatus}
                      </Badge>
                      {dueDate && (
                        <Badge 
                          variant="outline" 
                          className={isOverdue ? 'border-red-300 text-red-700' : ''}
                        >
                          Due: {format(new Date(dueDate), 'MMM d, yyyy')}
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge className="bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No tasks found</h3>
            <p className="text-gray-400 mt-1">Create your first task to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
                placeholder="Task subject/title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
                placeholder="Additional notes"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-pink-600 to-rose-600">
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Tasks</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleBulkUpdate(); }} className="space-y-4">
            {localError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{localError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label>Update Status (optional)</Label>
              <Select 
                value={bulkUpdateData.status} 
                onValueChange={(value) => setBulkUpdateData({...bulkUpdateData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not started">Not Started</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Update Priority (optional)</Label>
              <Select 
                value={bulkUpdateData.priority} 
                onValueChange={(value) => setBulkUpdateData({...bulkUpdateData, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Update Notes (optional)</Label>
              <Textarea
                value={bulkUpdateData.notes}
                onChange={(e) => setBulkUpdateData({...bulkUpdateData, notes: e.target.value})}
                placeholder="Add notes..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkUpdateMutation.isPending}>
                {bulkUpdateMutation.isPending ? "Updating..." : `Update ${selectedTasks.length} Task(s)`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}