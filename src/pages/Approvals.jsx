import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  TrendingUp,
  ShoppingCart,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { useApiErrorHandler } from '@/hooks/useErrorHandler';

export default function Approvals() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState("");
  const { handleApiError } = useApiErrorHandler();

  React.useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const queryClient = useQueryClient();

  const { data: approvalRequests = [] } = useQuery({
    queryKey: ['approvalRequests'],
    queryFn: () => base44.entities.ApprovalRequest.list('-submitted_date'),
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, action, comments }) => {
      const request = approvalRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      const newHistory = [
        ...request.approval_history,
        {
          step: request.current_step,
          approver: currentUser?.name || 'Current User',
          action: action,
          comments: comments,
          timestamp: new Date().toISOString(),
        }
      ];

      const updates = {
        approval_history: newHistory,
        status: action === 'Approved' ? 'Approved' : 'Rejected',
      };

      if (action === 'Approved' && request.current_step < 3) {
        updates.current_step = request.current_step + 1;
        updates.status = 'Pending';
      } else if (action === 'Approved') {
        updates.completed_date = new Date().toISOString();
      }

      await base44.entities.ApprovalRequest.update(requestId, updates);
      
      // Update the original entity status
      if (request.entity_type === 'Quote') {
        await base44.entities.Quote.update(request.entity_id, {
          approval_status: action === 'Approved' ? 'Approved' : 'Rejected',
          status: action === 'Approved' ? 'Approved' : 'Rejected',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDialog(false);
      setComments("");
      toast.success("Request processed");
    },
    onError: (error) => {
      handleApiError(error, 'approval-process');
    }
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      action: 'Approved',
      comments: comments,
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      action: 'Rejected',
      comments: comments,
    });
  };

  const pendingRequests = approvalRequests.filter(r => r.status === 'Pending');
  const approvedRequests = approvalRequests.filter(r => r.status === 'Approved');
  const rejectedRequests = approvalRequests.filter(r => r.status === 'Rejected');

  const getEntityIcon = (type) => {
    switch(type) {
      case 'Quote': return FileText;
      case 'Deal': return TrendingUp;
      case 'PurchaseOrder': return ShoppingCart;
      default: return FileText;
    }
  };

  const statusColors = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  };

  const ApprovalCard = ({ request }) => {
    const Icon = getEntityIcon(request.entity_type);
    
    return (
      <Card 
        className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer"
        onClick={() => {
          setSelectedRequest(request);
          setShowDialog(true);
        }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{request.entity_name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {request.entity_type} • Submitted by {request.submitter_email}
                </p>
                {request.amount > 0 && (
                  <p className="text-xl font-bold text-emerald-600 mt-2">
                    ${request.amount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Submitted {format(new Date(request.submitted_date), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
            <Badge className={`${statusColors[request.status]} border`}>
              {request.status}
            </Badge>
          </div>

          {request.approval_history?.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Recent Activity:</p>
              <div className="space-y-1">
                {request.approval_history.slice(-2).map((entry, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    • {entry.action} by {entry.approver_name} - {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="w-8 h-8 text-indigo-500" />
          Approvals
        </h1>
        <p className="text-gray-600 mt-1">Review and approve pending requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Pending</p>
                <p className="text-3xl font-bold text-white">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Approved</p>
                <p className="text-3xl font-bold text-white">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-500 to-red-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Rejected</p>
                <p className="text-3xl font-bold text-white">{rejectedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(request => (
              <ApprovalCard key={request.id} request={request} />
            ))
          ) : (
            <Card className="border-none shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">All caught up!</h3>
                <p className="text-gray-400 mt-1">No pending approvals</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.map(request => (
            <ApprovalCard key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.map(request => (
            <ApprovalCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Request Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Type:</p>
                    <p className="font-medium">{selectedRequest.entity_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Name:</p>
                    <p className="font-medium">{selectedRequest.entity_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted by:</p>
                    <p className="font-medium">{selectedRequest.submitter_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount:</p>
                    <p className="font-medium text-emerald-600 text-lg">
                      ${selectedRequest.amount?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRequest.approval_history?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Approval History</h4>
                  <div className="space-y-2">
                    {selectedRequest.approval_history.map((entry, idx) => (
                      <div key={idx} className="border-l-2 border-indigo-500 pl-3 py-1">
                        <p className="text-sm font-medium">{entry.action} by {entry.approver_name}</p>
                        <p className="text-xs text-gray-600">{entry.comments}</p>
                        <p className="text-xs text-gray-400">{format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'Pending' && (
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    placeholder="Add your comments..."
                  />
                </div>
              )}
            </div>
          )}

          {selectedRequest?.status === 'Pending' && (
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                onClick={handleApprove}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}