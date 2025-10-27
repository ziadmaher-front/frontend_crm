import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertCircle
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

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "Medium",
    status: "Not Started",
  });

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowDialog(false);
      setEditingTask(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: "",
      priority: "Medium",
      status: "Not Started",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      due_date: task.due_date || "",
      priority: task.priority || "Medium",
      status: task.status || "Not Started",
    });
    setShowDialog(true);
  };

  const handleStatusToggle = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    await updateMutation.mutateAsync({ 
      id: task.id, 
      data: { ...task, status: newStatus } 
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    
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
  };

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-pink-500" />
            Tasks
          </h1>
          <p className="text-gray-500 mt-1">Organize and track your to-do items</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg"
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
                <p className="text-2xl font-bold">{getTasksByStatus('Not Started').length}</p>
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
                <p className="text-2xl font-bold">{getTasksByStatus('In Progress').length}</p>
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
                <p className="text-2xl font-bold">{getTasksByStatus('Completed').length}</p>
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
                <p className="text-2xl font-bold">{getTasksByStatus('Deferred').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Deferred">Deferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const StatusIcon = statusIcons[task.status];
          const isCompleted = task.status === 'Completed';
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

          return (
            <Card 
              key={task.id} 
              className={`border-none shadow-md hover:shadow-lg transition-all group ${
                isCompleted ? 'bg-gray-50' : ''
              }`}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
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
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${
                          isCompleted ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(task)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge className={`${priorityColors[task.priority]} border`}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">
                        {task.status}
                      </Badge>
                      {task.due_date && (
                        <Badge 
                          variant="outline" 
                          className={isOverdue ? 'border-red-300 text-red-700' : ''}
                        >
                          Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
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
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
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
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Deferred">Deferred</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}