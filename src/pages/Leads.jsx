
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import leadService from "@/services/leadService";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Edit,
  Star,
  ArrowRight,
  Eye,
  LayoutGrid,
  List,
  Table,
  Users,
  Filter,
  BarChart3,
  Target,
  Trash2,
  SortAsc,
  SortDesc,
  Zap,
  TrendingUp,
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
import AssignmentManager from "../components/AssignmentManager";
import BulkOperations from "../components/BulkOperations";
import { AccessibleFormField } from '@/components/AccessibilityEnhancements';
import { createPageUrl } from '@/utils';
import { getSavedViews, saveView, deleteView } from "@/store/savedViews";

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [filterAssignedUser, setFilterAssignedUser] = useState("all");
  const [filterScoreRange, setFilterScoreRange] = useState(null);
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [view, setView] = useState("grid"); // New state for view
  const [showDialog, setShowDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showQualificationDialog, setShowQualificationDialog] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);
  const [qualifyingLead, setQualifyingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    job_title: "",
    company: "",
    email: "",
    phone: "",
    lead_source: "Website",
    status: "New",
    lead_score: 0,
    assigned_users: [],
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [savedViews, setSavedViews] = useState(getSavedViews('leads'));
  const [selectedSavedView, setSelectedSavedView] = useState(null);

  const handleSaveCurrentView = () => {
    const name = prompt("Name this view");
    if (!name) return;
    const viewDef = {
      name,
      searchQuery,
      status: filterStatus,
      source: filterSource,
      assignedUser: filterAssignedUser,
      scoreRange: filterScoreRange,
      sortBy,
      sortOrder
    };
    saveView('leads', viewDef);
    setSavedViews(getSavedViews('leads'));
    setSelectedSavedView(name);
  };

  const applySavedView = (name) => {
    setSelectedSavedView(name);
    const def = savedViews.find(v => v.name === name);
    if (!def) return;
    setSearchQuery(def.searchQuery ?? "");
    setFilterStatus(def.status ?? 'all');
    setFilterSource(def.source ?? 'all');
    setFilterAssignedUser(def.assignedUser ?? 'all');
    setFilterScoreRange(def.scoreRange ?? null);
    setSortBy(def.sortBy ?? 'created_date');
    setSortOrder(def.sortOrder ?? 'desc');
  };

  // Load view preference from User entity
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.ui_preferences?.leads_view) {
        setView(user.ui_preferences.leads_view);
      }
    });
  }, []);

  // Save view preference
  const handleViewChange = async (newView) => {
    setView(newView);
    if (currentUser) {
      const updatedPreferences = {
        ...currentUser.ui_preferences,
        leads_view: newView
      };
      await base44.auth.updateMe({ ui_preferences: updatedPreferences });
    }
  };

  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', searchQuery, filterStatus, filterSource, filterAssignedUser, filterScoreRange, sortBy, sortOrder],
    queryFn: async () => {
      const options = {
        searchQuery,
        status: filterStatus !== 'all' ? filterStatus : null,
        source: filterSource !== 'all' ? filterSource : null,
        assignedUser: filterAssignedUser !== 'all' ? filterAssignedUser : null,
        scoreRange: filterScoreRange,
        sortBy: sortOrder === 'desc' ? `-${sortBy}` : sortBy
      };
      
      const result = await leadService.getAllLeads(options);
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['lead-analytics'],
    queryFn: async () => {
      const result = await leadService.getLeadAnalytics();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.error);
    },
    enabled: showAnalytics,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: serializationSettings = [] } = useQuery({
    queryKey: ['serializationSettings'],
    queryFn: () => base44.entities.EntitySerializationSettings.list(),
  });

  const generateSerialNumber = async () => {
    const setting = serializationSettings.find(s =>
      s.entity_type === 'Lead' &&
      s.organization_id === currentUser?.primary_organization_id &&
      s.is_active
    );

    if (!setting || !setting.blueprint || setting.blueprint.length === 0) return null;

    const year = new Date().getFullYear();
    const yearShort = String(year).slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const counter = String(setting.counter).padStart(setting.counter_padding || 4, '0');

    let serialNumber = '';
    setting.blueprint.forEach(component => {
      switch(component.component_type) {
        case 'prefix':
          serialNumber += component.value || 'XX';
          break;
        case 'year':
          serialNumber += year;
          break;
        case 'year_short':
          serialNumber += yearShort;
          break;
        case 'month':
          serialNumber += month;
          break;
        case 'counter':
          serialNumber += counter;
          break;
        case 'separator':
          serialNumber += component.value || '-';
          break;
        case 'custom':
          serialNumber += component.value || '';
          break;
      }
    });

    await base44.entities.EntitySerializationSettings.update(setting.id, {
      counter: setting.counter + 1
    });

    return serialNumber;
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await leadService.createLead(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['serializationSettings'] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Lead created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await leadService.updateLead(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowDialog(false);
      setShowConvertDialog(false);
      setEditingLead(null);
      setConvertingLead(null);
      resetForm();
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await leadService.deleteLead(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const qualifyMutation = useMutation({
    mutationFn: async ({ leadId, qualificationData }) => {
      const result = await leadService.qualifyLead(leadId, qualificationData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setShowQualificationDialog(false);
      setQualifyingLead(null);
      toast({
        title: "Success",
        description: "Lead qualified successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async ({ leadData, dealData }) => {
      await base44.entities.Deal.create(dealData);
      await base44.entities.Lead.update(leadData.id, { ...leadData, status: 'Converted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowConvertDialog(false);
      setConvertingLead(null);
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      job_title: "",
      company: "",
      email: "",
      phone: "",
      lead_source: "Website",
      status: "New",
      lead_score: 0,
      assigned_users: [],
      notes: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingLead) {
      updateMutation.mutate({ id: editingLead.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      first_name: lead.first_name || "",
      last_name: lead.last_name || "",
      job_title: lead.job_title || "",
      company: lead.company || "",
      email: lead.email || "",
      phone: lead.phone || "",
      lead_source: lead.lead_source || "Website",
      status: lead.status || "New",
      lead_score: lead.lead_score || 0,
      assigned_users: lead.assigned_users || [],
      notes: lead.notes || "",
    });
    setShowDialog(true);
  };



  const handleConvertToDeal = (accountId) => {
    if (!convertingLead || !accountId) return;

    const dealData = {
      deal_name: `Deal - ${convertingLead.company}`,
      account_id: accountId,
      stage: "Prospecting",
      probability: 10,
      amount: 0,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_users: convertingLead.assigned_users || [],
    };

    createDealMutation.mutate({
      leadData: convertingLead,
      dealData: dealData,
    });
  };

  const handleViewDetails = (lead) => {
    window.location.href = createPageUrl('LeadDetails') + '?id=' + lead.id;
  };

  const handleDelete = (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(leadId);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(value);
        break;
      case 'source':
        setFilterSource(value);
        break;
      case 'assignedUser':
        setFilterAssignedUser(value);
        break;
      case 'scoreRange':
        setFilterScoreRange(value);
        break;
      default:
        break;
    }
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterSource('all');
    setFilterAssignedUser('all');
    setFilterScoreRange([0, 100]);
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const handleQualifyLead = (lead) => {
    setQualifyingLead(lead);
    setShowQualificationDialog(true);
  };

  const handleQualificationSubmit = (qualificationData) => {
    if (qualifyingLead) {
      qualifyMutation.mutate({
        leadId: qualifyingLead.id,
        qualificationData
      });
    }
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const statusColors = {
    'New': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Contacted': 'bg-purple-100 text-purple-700 border-purple-200',
    'Qualified': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Unqualified': 'bg-gray-100 text-gray-700 border-gray-200',
    'Converted': 'bg-amber-100 text-amber-700 border-amber-200',
  };

  const totalLeads = leads?.length || 0;
  const qualifiedLeads = leads?.filter(l => l.status === 'Qualified').length || 0;
  const convertedLeads = leads?.filter(l => l.status === 'Converted').length || 0;
  const avgLeadScore = leads?.length > 0
    ? Math.round(leads.reduce((sum, lead) => sum + (lead.lead_score || 0), 0) / leads.length)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Professional CRM Header */}
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">
            <Star className="w-8 h-8 text-indigo-500" />
            Leads
          </h1>
          <p className="crm-page-subtitle">Capture and nurture potential customers</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("grid")}
              className={view === "grid" ? "bg-white shadow-sm" : ""}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("list")}
              className={view === "list" ? "bg-white shadow-sm" : ""}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("table")}
              className={view === "table" ? "bg-white shadow-sm" : ""}
            >
              <Table className="w-4 h-4" />
            </Button>
          </div>
          {/* Saved Views controls */}
          <div className="flex items-center gap-2">
            <Select value={selectedSavedView ?? ''} onValueChange={applySavedView}>
              <SelectTrigger className="crm-select w-56">
                <SelectValue placeholder="Saved Views" />
              </SelectTrigger>
              <SelectContent>
                {savedViews.length === 0 ? (
                  <SelectItem value="" disabled>No saved views</SelectItem>
                ) : savedViews.map(v => (
                  <SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleSaveCurrentView}>
              Save View
            </Button>
          </div>
          <Button
            variant={showAnalytics ? "default" : "outline"}
            size="sm"
            onClick={toggleAnalytics}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Button
            onClick={() => {
              setEditingLead(null);
              resetForm();
              setShowDialog(true);
            }}
            className="crm-btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Total Leads</p>
                <p className="text-3xl font-bold text-white">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Qualified</p>
                <p className="text-3xl font-bold text-white">{qualifiedLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Converted</p>
                <p className="text-3xl font-bold text-white">{convertedLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Avg Score</p>
                <p className="text-3xl font-bold text-white">{avgLeadScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional CRM Toolbar */}
      <div className="crm-toolbar">
        <div className="crm-toolbar-left">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search leads by name, company, email or serial number..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="crm-input pl-10 w-80"
            />
          </div>
          <Select value={filterStatus} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="crm-select w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Unqualified">Unqualified</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={(value) => handleFilterChange('source', value)}>
            <SelectTrigger className="crm-select w-48">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Email Campaign">Email Campaign</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
              <SelectItem value="Trade Show">Trade Show</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterAssignedUser} onValueChange={(value) => handleFilterChange('assignedUser', value)}>
            <SelectTrigger className="crm-select w-48">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.email}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
        <div className="crm-toolbar-right">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Button
              variant={sortBy === 'name' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('name')}
              className="flex items-center gap-1"
            >
              Name
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant={sortBy === 'created_at' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('created_at')}
              className="flex items-center gap-1"
            >
              Date
              {sortBy === 'created_at' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
            <Button
              variant={sortBy === 'lead_score' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('lead_score')}
              className="flex items-center gap-1"
            >
              Score
              {sortBy === 'lead_score' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Lead Velocity</p>
                  <p className="text-3xl font-bold text-white">{analytics.leadVelocity}</p>
                  <p className="text-xs text-white/60">leads/day</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white">{analytics.conversionMetrics.rate}%</p>
                  <p className="text-xs text-white/60">qualified to converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Avg Score</p>
                  <p className="text-3xl font-bold text-white">{analytics.averageScore}</p>
                  <p className="text-xs text-white/60">out of 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Top Source</p>
                  <p className="text-lg font-bold text-white">{analytics.topSource?.source || 'N/A'}</p>
                  <p className="text-xs text-white/60">{analytics.topSource?.count || 0} leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <BulkOperations
        entityName="Lead"
        records={leads || []}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
      >
        {({ selectedRecords, isSelected, handleSelectRecord }) => (
          <>
            {view === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(leads || []).map((lead) => (
                  <Card
                    key={lead.id}
                    className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                      isSelected(lead.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => handleViewDetails(lead)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected(lead.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRecord(lead.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">
                                {lead.first_name} {lead.last_name}
                              </CardTitle>
                              {lead.lead_score >= 70 && (
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            {lead.serial_number && (
                              <Badge variant="outline" className="mt-1 text-xs font-mono bg-gray-50 text-gray-600 border-gray-200">
                                {lead.serial_number}
                              </Badge>
                            )}
                            {lead.job_title && (
                              <p className="text-sm text-gray-500 mt-1">{lead.job_title}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(lead);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQualifyLead(lead);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(lead.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(lead);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className={`${statusColors[lead.status]} border mt-2 w-fit`}>
                        {lead.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lead.company && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{lead.company}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}

                      {lead.assigned_users?.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">Assigned To:</p>
                          <div className="flex flex-wrap gap-1">
                            {lead.assigned_users.slice(0, 2).map((email) => (
                              <Badge key={email} variant="secondary" className="text-xs">
                                {getUserName(email).split(' ')[0]}
                              </Badge>
                            ))}
                            {lead.assigned_users.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{lead.assigned_users.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {lead.lead_score > 0 && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Lead Score</span>
                            <span className="font-semibold text-sm">{lead.lead_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${lead.lead_score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === "list" && (
              <div className="space-y-2">
                {(leads || []).map((lead) => (
                  <Card
                    key={lead.id}
                    className={`border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      isSelected(lead.id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={() => handleViewDetails(lead)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected(lead.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRecord(lead.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                              {lead.first_name?.[0]}{lead.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{lead.first_name} {lead.last_name}</p>
                              {lead.serial_number && (
                                <p className="text-xs text-gray-500 font-mono">{lead.serial_number}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{lead.company}</p>
                            <p className="text-xs text-gray-500">{lead.job_title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                            <p className="text-xs text-gray-500">{lead.phone}</p>
                          </div>
                          <div>
                            <Badge className={`${statusColors[lead.status]}`}>
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <div className="text-right">
                              <p className="text-sm font-semibold">{lead.lead_score}/100</p>
                              <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
                                  style={{ width: `${lead.lead_score}%` }}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(lead);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(lead);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === "table" && (
              <div className="crm-card">
                <div className="overflow-x-auto">
                  <table className="crm-table">
                    <thead className="crm-table-header">
                      <tr>
                        <th className="crm-table-cell">
                          <input
                            type="checkbox"
                            checked={selectedRecords.length === (leads?.length || 0) && (leads?.length || 0) > 0}
                            onChange={() => {
                              if (selectedRecords.length === (leads?.length || 0)) {
                                // Deselect all
                                selectedRecords.forEach(id => handleSelectRecord(id));
                              } else {
                                // Select all non-selected
                                (leads || []).filter(l => !isSelected(l.id)).forEach(l => handleSelectRecord(l.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        </th>
                        <th className="crm-table-cell">Serial #</th>
                        <th className="crm-table-cell">Name</th>
                        <th className="crm-table-cell">Company</th>
                        <th className="crm-table-cell">Email</th>
                        <th className="crm-table-cell">Phone</th>
                        <th className="crm-table-cell">Status</th>
                        <th className="crm-table-cell">Score</th>
                        <th className="crm-table-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="crm-table-body">
                      {(leads || []).map((lead) => (
                        <tr
                          key={lead.id}
                          className={`crm-table-row ${
                            isSelected(lead.id) ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => handleViewDetails(lead)}
                        >
                          <td className="crm-table-cell">
                            <input
                              type="checkbox"
                              checked={isSelected(lead.id)}
                              onChange={() => handleSelectRecord(lead.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                          </td>
                          <td className="crm-table-cell font-mono text-gray-600">
                            {lead.serial_number || '-'}
                          </td>
                          <td className="crm-table-cell">
                            <div className="flex items-center gap-2">
                              <div className="crm-avatar">
                                {lead.first_name?.[0]}{lead.last_name?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                                {lead.lead_score >= 70 && <Star className="w-3 h-3 text-amber-500 fill-amber-500 inline ml-1" />}
                              </div>
                            </div>
                          </td>
                          <td className="crm-table-cell text-gray-600">{lead.company}</td>
                          <td className="crm-table-cell text-gray-600">{lead.email}</td>
                          <td className="crm-table-cell text-gray-600">{lead.phone || '-'}</td>
                          <td className="crm-table-cell">
                            <Badge className={`${statusColors[lead.status]}`}>
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="crm-table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{lead.lead_score}</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                                  style={{ width: `${lead.lead_score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="crm-table-cell">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(lead);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(lead);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </BulkOperations>

      {(!leads || leads.length === 0) && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No leads found</h3>
            <p className="text-gray-400 mt-1">Start capturing your first leads</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AccessibleFormField
                label="First Name"
                required={true}
              >
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="Last Name"
                required={true}
              >
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </AccessibleFormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead_source">Lead Source</Label>
                <Select value={formData.lead_source} onValueChange={(value) => setFormData({...formData, lead_source: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    <SelectItem value="Trade Show">Trade Show</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Unqualified">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_score">Lead Score (0-100)</Label>
              <input
                type="range"
                id="lead_score"
                min="0"
                max="100"
                value={formData.lead_score}
                onChange={(e) => setFormData({...formData, lead_score: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span className="font-semibold text-gray-700">{formData.lead_score}</span>
                <span>100</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assignments</Label>
              <AssignmentManager
                assignedUsers={formData.assigned_users}
                productLines={[]}
                allUsers={users}
                allProductLines={[]}
                onUpdate={(assignments) => setFormData({
                  ...formData,
                  assigned_users: assignments.assigned_users,
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {editingLead ? 'Update' : 'Create'} Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert Lead to Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select an account to convert this lead into a deal opportunity
            </p>
            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select onValueChange={handleConvertToDeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                  <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
