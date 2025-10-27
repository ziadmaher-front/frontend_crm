import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  Search,
  CheckCircle,
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
import { toast } from "sonner";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_name: "",
    document_type: "Other",
    related_to_type: "",
    related_to_id: "",
    description: "",
    folder: "",
    access_level: "Team",
    expiry_date: "",
  });

  const queryClient = useQueryClient();

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list(),
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowDialog(false);
      resetForm();
      toast.success("Document uploaded successfully");
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success("Document deleted");
    },
  });

  const resetForm = () => {
    setFormData({
      document_name: "",
      document_type: "Other",
      related_to_type: "",
      related_to_id: "",
      description: "",
      folder: "",
      access_level: "Team",
      expiry_date: "",
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      createDocumentMutation.mutate({
        ...formData,
        file_url: file_url,
        file_size: file.size,
        file_type: file.type,
        status: "Draft",
        document_name: formData.document_name || file.name
      });
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.document_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || doc.document_type === filterType;
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
    'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
    'Approved': 'bg-green-100 text-green-700 border-green-200',
    'Signed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Expired': 'bg-red-100 text-red-700 border-red-200',
    'Archived': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const typeIcons = {
    'Contract': '📄',
    'Proposal': '📋',
    'NDA': '🔒',
    'Invoice': '🧾',
    'Quote': '💰',
    'Presentation': '📊',
    'Report': '📈',
    'Other': '📁',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-500" />
            Documents
          </h1>
          <p className="text-gray-600 mt-1">Centralized document management & storage</p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Documents</p>
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Signed</p>
            <p className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.is_signed).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold text-amber-600">
              {documents.filter(d => {
                if (!d.expiry_date) return false;
                const daysUntilExpiry = Math.ceil((new Date(d.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Under Review</p>
            <p className="text-2xl font-bold text-blue-600">
              {documents.filter(d => d.status === 'Under Review').length}
            </p>
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
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
                <SelectItem value="NDA">NDA</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Quote">Quote</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Signed">Signed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => {
          const isExpiringSoon = doc.expiry_date && 
            Math.ceil((new Date(doc.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) <= 30;

          return (
            <Card key={doc.id} className="border-none shadow-lg hover:shadow-xl transition-all group">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-4xl">{typeIcons[doc.document_type]}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {doc.document_name}
                      </CardTitle>
                      {doc.folder && (
                        <p className="text-xs text-gray-500 mt-1">📁 {doc.folder}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Badge className={statusColors[doc.status]}>
                    {doc.status}
                  </Badge>
                  {doc.is_signed && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Signed
                    </Badge>
                  )}
                  {isExpiringSoon && (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {doc.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                )}
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{doc.document_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-medium">{doc.version}</span>
                  </div>
                  {doc.expiry_date && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="font-medium">{format(new Date(doc.expiry_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium">{format(new Date(doc.created_date), 'MMM d, yyyy')}</span>
                  </div>
                  {doc.download_count > 0 && (
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span className="font-medium">{doc.download_count}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(doc.file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      window.open(doc.file_url, '_blank');
                      // Increment download count
                      base44.entities.Document.update(doc.id, {
                        download_count: (doc.download_count || 0) + 1
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        deleteDocumentMutation.mutate(doc.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No documents found</h3>
            <p className="text-gray-400 mt-1">Upload your first document to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document_name">Document Name</Label>
              <Input
                id="document_name"
                value={formData.document_name}
                onChange={(e) => setFormData({...formData, document_name: e.target.value})}
                placeholder="Leave empty to use filename"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Select 
                  value={formData.document_type} 
                  onValueChange={(value) => setFormData({...formData, document_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="NDA">NDA</SelectItem>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="access_level">Access Level</Label>
                <Select 
                  value={formData.access_level} 
                  onValueChange={(value) => setFormData({...formData, access_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="related_to_type">Related To</Label>
                <Select 
                  value={formData.related_to_type} 
                  onValueChange={(value) => setFormData({...formData, related_to_type: value, related_to_id: ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="Deal">Deal</SelectItem>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="related_to_id">Select Record</Label>
                <Select 
                  value={formData.related_to_id} 
                  onValueChange={(value) => setFormData({...formData, related_to_id: value})}
                  disabled={!formData.related_to_type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.related_to_type === 'Account' && accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.company_name}
                      </SelectItem>
                    ))}
                    {formData.related_to_type === 'Deal' && deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.deal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="folder">Folder</Label>
                <Input
                  id="folder"
                  value={formData.folder}
                  onChange={(e) => setFormData({...formData, folder: e.target.value})}
                  placeholder="e.g., Contracts/Q1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                placeholder="Document description..."
              />
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">
                {uploading ? 'Uploading...' : 'Click to select file'}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('doc-file-upload').click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                id="doc-file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}