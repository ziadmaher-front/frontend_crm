import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Mail,
  UserPlus,
  Tag,
  Archive,
  Download,
  Copy,
  CheckSquare,
  XSquare,
  MessageSquare,
  PhoneCall,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import SendEmailDialog from "./SendEmailDialog";

export default function BulkOperations({ entityName, records, onRefresh, children }) {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [updateField, setUpdateField] = useState("");
  const [updateValue, setUpdateValue] = useState("");
  const [tags, setTags] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");

  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities[entityName].delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName.toLowerCase() + 's'] });
      toast.success(`${selectedRecords.length} ${entityName.toLowerCase()}(s) deleted`);
      setSelectedRecords([]);
      onRefresh?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ ids, data }) => {
      await Promise.all(ids.map(id => base44.entities[entityName].update(id, data)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName.toLowerCase() + 's'] });
      toast.success(`${selectedRecords.length} ${entityName.toLowerCase()}(s) updated`);
      setSelectedRecords([]);
      setShowAssignDialog(false);
      setShowUpdateDialog(false);
      setShowTagDialog(false);
      onRefresh?.();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (tasksData) => {
      await Promise.all(tasksData.map(task => base44.entities.Task.create(task)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`${selectedRecords.length} task(s) created`);
      setShowTaskDialog(false);
      setTaskTitle("");
      setTaskDueDate("");
    },
  });

  const handleSelectRecord = (id) => {
    setSelectedRecords(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedRecords.includes(id);

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(r => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedRecords.length} ${entityName.toLowerCase()}(s)?`)) {
      deleteMutation.mutate(selectedRecords);
    }
  };

  const handleBulkAssign = () => {
    if (!assignEmail) {
      toast.error("Please select a user");
      return;
    }
    updateMutation.mutate({
      ids: selectedRecords,
      data: { assigned_users: [assignEmail] }
    });
  };

  const handleBulkUpdate = () => {
    if (!updateField || !updateValue) {
      toast.error("Please fill in all fields");
      return;
    }
    updateMutation.mutate({
      ids: selectedRecords,
      data: { [updateField]: updateValue }
    });
  };

  const handleBulkTag = () => {
    if (!tags) {
      toast.error("Please enter tags");
      return;
    }
    const tagArray = tags.split(',').map(t => t.trim());
    updateMutation.mutate({
      ids: selectedRecords,
      data: { tags: tagArray }
    });
  };

  const handleBulkCreateTasks = () => {
    if (!taskTitle || !taskDueDate) {
      toast.error("Please fill in task details");
      return;
    }

    const tasksData = selectedRecords.map(id => {
      const record = records.find(r => r.id === id);
      return {
        title: taskTitle,
        due_date: taskDueDate,
        priority: taskPriority,
        status: "Not Started",
        related_to_type: entityName,
        related_to_id: id,
        description: `Follow up with ${record?.first_name || record?.company_name || record?.deal_name || ''}`
      };
    });

    createTaskMutation.mutate(tasksData);
  };

  const handleExport = () => {
    const selectedData = records.filter(r => selectedRecords.includes(r.id));
    const csv = [
      Object.keys(selectedData[0]).join(','),
      ...selectedData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityName.toLowerCase()}-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export completed");
  };

  const getUpdatableFields = () => {
    switch(entityName) {
      case 'Lead':
        return ['status', 'lead_source', 'lead_score'];
      case 'Contact':
        return ['department', 'job_title'];
      case 'Account':
        return ['account_type', 'account_status', 'industry'];
      case 'Deal':
        return ['stage', 'probability', 'deal_type'];
      case 'Task':
        return ['status', 'priority'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      {selectedRecords.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between sticky top-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600 text-white">
              {selectedRecords.length} selected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedRecords([])}
            >
              <XSquare className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Select All ({records.length})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignDialog(true)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Assign
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTaskDialog(true)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Create Tasks
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4 mr-1" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowUpdateDialog(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Field
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTagDialog(true)}>
                  <Tag className="w-4 h-4 mr-2" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(selectedRecords.join('\n'));
                  toast.success("IDs copied to clipboard");
                }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy IDs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleBulkDelete}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {children({ selectedRecords, isSelected, handleSelectRecord, handleSelectAll })}

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to User</DialogTitle>
            <DialogDescription>
              Assign {selectedRecords.length} selected {entityName.toLowerCase()}(s) to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={assignEmail} onValueChange={setAssignEmail}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Field Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Field</DialogTitle>
            <DialogDescription>
              Update a field for {selectedRecords.length} selected {entityName.toLowerCase()}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Field to Update</Label>
              <Select value={updateField} onValueChange={setUpdateField}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose field..." />
                </SelectTrigger>
                <SelectContent>
                  {getUpdatableFields().map((field) => (
                    <SelectItem key={field} value={field}>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>New Value</Label>
              <Input
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
                placeholder="Enter new value..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tags</DialogTitle>
            <DialogDescription>
              Add tags to {selectedRecords.length} selected {entityName.toLowerCase()}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="vip, hot-lead, follow-up..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkTag}>Add Tags</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tasks Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Follow-up Tasks</DialogTitle>
            <DialogDescription>
              Create a task for each of the {selectedRecords.length} selected {entityName.toLowerCase()}(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Follow up with customer..."
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreateTasks}>Create Tasks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      {showEmailDialog && (
        <SendEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          recipient={{
            email: records.find(r => selectedRecords.includes(r.id))?.email,
            first_name: "Multiple",
            last_name: "Recipients"
          }}
          relatedTo={null}
        />
      )}
    </div>
  );
}