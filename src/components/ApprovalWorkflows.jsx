import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Users, 
  ArrowRight, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  MessageSquare,
  Calendar,
  DollarSign,
  FileText,
  Send,
  History,
  Filter,
  Search
} from 'lucide-react';

const ApprovalWorkflows = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Sample approval requests
  const approvalRequests = [
    {
      id: 1,
      title: 'High-Value Deal Approval',
      type: 'deal',
      requestedBy: {
        name: 'John Smith',
        email: 'john@company.com',
        avatar: null
      },
      amount: 75000,
      description: 'Enterprise deal with ABC Corp requiring executive approval',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      dueDate: '2024-01-17T17:00:00Z',
      currentStep: 1,
      totalSteps: 3,
      workflow: 'High Value Deal Approval',
      approvers: [
        { name: 'Sarah Johnson', role: 'Sales Manager', status: 'approved', date: '2024-01-15T14:30:00Z' },
        { name: 'Mike Chen', role: 'VP Sales', status: 'pending', date: null },
        { name: 'Emma Wilson', role: 'CEO', status: 'pending', date: null }
      ],
      attachments: ['deal_proposal.pdf', 'client_requirements.docx'],
      comments: [
        {
          author: 'Sarah Johnson',
          content: 'Deal looks solid, client has strong financials. Approved.',
          timestamp: '2024-01-15T14:30:00Z',
          action: 'approved'
        }
      ]
    },
    {
      id: 2,
      title: 'Marketing Campaign Budget',
      type: 'budget',
      requestedBy: {
        name: 'Lisa Davis',
        email: 'lisa@company.com',
        avatar: null
      },
      amount: 25000,
      description: 'Q1 digital marketing campaign budget approval',
      status: 'approved',
      priority: 'medium',
      createdAt: '2024-01-14T09:15:00Z',
      dueDate: '2024-01-16T17:00:00Z',
      currentStep: 2,
      totalSteps: 2,
      workflow: 'Budget Approval',
      approvers: [
        { name: 'Tom Wilson', role: 'Marketing Director', status: 'approved', date: '2024-01-14T11:20:00Z' },
        { name: 'Sarah Johnson', role: 'CFO', status: 'approved', date: '2024-01-15T09:45:00Z' }
      ],
      attachments: ['campaign_proposal.pdf'],
      comments: [
        {
          author: 'Tom Wilson',
          content: 'Campaign strategy aligns with our Q1 goals. Approved.',
          timestamp: '2024-01-14T11:20:00Z',
          action: 'approved'
        },
        {
          author: 'Sarah Johnson',
          content: 'Budget allocation looks reasonable. Final approval granted.',
          timestamp: '2024-01-15T09:45:00Z',
          action: 'approved'
        }
      ]
    },
    {
      id: 3,
      title: 'Discount Authorization',
      type: 'discount',
      requestedBy: {
        name: 'Alex Brown',
        email: 'alex@company.com',
        avatar: null
      },
      amount: 5000,
      description: '20% discount for strategic client renewal',
      status: 'rejected',
      priority: 'low',
      createdAt: '2024-01-13T16:45:00Z',
      dueDate: '2024-01-15T17:00:00Z',
      currentStep: 1,
      totalSteps: 2,
      workflow: 'Discount Approval',
      approvers: [
        { name: 'Mike Chen', role: 'Sales Manager', status: 'rejected', date: '2024-01-14T10:15:00Z' },
        { name: 'Sarah Johnson', role: 'VP Sales', status: 'pending', date: null }
      ],
      attachments: ['client_history.pdf'],
      comments: [
        {
          author: 'Mike Chen',
          content: 'Client has not met minimum volume requirements. Discount not justified.',
          timestamp: '2024-01-14T10:15:00Z',
          action: 'rejected'
        }
      ]
    }
  ];

  // Sample workflow templates
  const workflowTemplates = [
    {
      id: 1,
      name: 'High Value Deal Approval',
      description: 'Multi-stage approval for deals over $50,000',
      trigger: 'Deal value > $50,000',
      steps: [
        { order: 1, approver: 'Sales Manager', required: true },
        { order: 2, approver: 'VP Sales', required: true },
        { order: 3, approver: 'CEO', required: true }
      ],
      active: true
    },
    {
      id: 2,
      name: 'Budget Approval',
      description: 'Budget requests over $10,000',
      trigger: 'Budget request > $10,000',
      steps: [
        { order: 1, approver: 'Department Head', required: true },
        { order: 2, approver: 'CFO', required: true }
      ],
      active: true
    },
    {
      id: 3,
      name: 'Discount Authorization',
      description: 'Discounts over 15%',
      trigger: 'Discount > 15%',
      steps: [
        { order: 1, approver: 'Sales Manager', required: true },
        { order: 2, approver: 'VP Sales', required: false }
      ],
      active: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = approvalRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || request.type === filterType;
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    return matchesSearch && matchesFilter && matchesTab;
  });

  const ApprovalRequestCard = ({ request, onClick }) => (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(request.priority)}`} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{request.title}</h3>
              <Badge variant="outline" className="text-xs">
                {request.type}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{request.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {request.requestedBy.name}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${request.amount.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(request.createdAt)}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(request.status)}
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Step {request.currentStep} of {request.totalSteps}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ApprovalDetails = ({ request }) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">{request.title}</h2>
          <p className="text-gray-600 mt-1">{request.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(request.status)}
          <Badge className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Requested By</Label>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={request.requestedBy.avatar} />
              <AvatarFallback className="text-xs">
                {request.requestedBy.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{request.requestedBy.name}</span>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Amount</Label>
          <p className="text-sm font-medium mt-1">${request.amount.toLocaleString()}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Created</Label>
          <p className="text-sm mt-1">{formatDate(request.createdAt)}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Due Date</Label>
          <p className="text-sm mt-1">{formatDate(request.dueDate)}</p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Approval Progress</h3>
        <div className="space-y-3">
          {request.approvers.map((approver, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                approver.status === 'approved' ? 'bg-green-100' :
                approver.status === 'rejected' ? 'bg-red-100' :
                index === request.currentStep - 1 ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                {approver.status === 'approved' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : approver.status === 'rejected' ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : index === request.currentStep - 1 ? (
                  <Clock className="h-4 w-4 text-yellow-600" />
                ) : (
                  <User className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{approver.name}</p>
                    <p className="text-xs text-gray-500">{approver.role}</p>
                  </div>
                  <div className="text-right">
                    {approver.date && (
                      <p className="text-xs text-gray-500">{formatDate(approver.date)}</p>
                    )}
                  </div>
                </div>
              </div>
              {index < request.approvers.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-3">Comments & History</h3>
        <div className="space-y-3">
          {request.comments.map((comment, index) => (
            <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.author.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <Badge variant={comment.action === 'approved' ? 'default' : 'destructive'} className="text-xs">
                    {comment.action}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {request.status === 'pending' && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-medium">Add Comment</h3>
            <Textarea placeholder="Add your comment..." />
            <div className="flex gap-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comment Only
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Approval Workflows</h2>
          <p className="text-gray-600">Manage approval requests and workflows</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deal">Deals</SelectItem>
            <SelectItem value="budget">Budget</SelectItem>
            <SelectItem value="discount">Discount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
            <Badge variant="secondary" className="ml-2">
              {tab === 'all' ? approvalRequests.length : approvalRequests.filter(r => r.status === tab).length}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Requests List */}
        <div className="lg:col-span-1 space-y-4">
          <ScrollArea className="h-96">
            {filteredRequests.map((request) => (
              <div key={request.id} className="mb-4">
                <ApprovalRequestCard
                  request={request}
                  onClick={() => setSelectedRequest(request)}
                />
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Request Details */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card>
              <CardContent className="p-6">
                <ApprovalDetails request={selectedRequest} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No request selected</h3>
                <p className="text-gray-500">Select an approval request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Approval Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter request title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deal">Deal Approval</SelectItem>
                  <SelectItem value="budget">Budget Request</SelectItem>
                  <SelectItem value="discount">Discount Authorization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe the request..." />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalWorkflows;