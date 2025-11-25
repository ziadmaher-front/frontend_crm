import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  Search,
  Filter,
  BarChart3,
  Target,
  Trash2,
  X,
  Building2,
  UserCircle,
  FileText,
  Tag,
  Globe,
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
import { PageSkeleton } from "@/components/ui/loading-states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const DEAL_TYPES = ["New Business", "Existing Business", "Renewal", "Upsell"];
const LEAD_SOURCES = ["Website", "Social Media", "Email Campaign", "Referral", "Cold Call", "Trade Show", "Other"];
const CURRENCIES = ["USD", "EGP", "AED", "SAR", "EUR", "GBP"];
const CURRENCY_SYMBOLS = {
  USD: "$",
  EGP: "E£",
  AED: "د.إ",
  SAR: "﷼",
  EUR: "€",
  GBP: "£"
};

export default function Deals() {
  const [view, setView] = useState("deals");
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null);
  const [showDealDetailsDialog, setShowDealDetailsDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [leadSearchTerm, setLeadSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    ownerId: "",
    leadId: "",
    contactId: "",
    amount: "",
    currency: "USD",
    type: "New Business",
    stage: "Prospecting",
    probability: 50,
    closingDate: "",
    leadSource: "Website",
    description: "",
    campaignSource: "",
    quote: "",
    boxFolderId: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load current user
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.id) {
        setFormData(prev => ({ ...prev, ownerId: user.id }));
      }
    }).catch(() => {});
  }, []);

  // Fetch deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-createdAt'),
  });

  // Fetch deal form options from orchestrator endpoint
  const { data: dealFormOptions, isLoading: dealFormLoading } = useQuery({
    queryKey: ['deal-form-options'],
    queryFn: () => base44.orchestrator.getDealFormOptions(),
    retry: 1,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  // Memoize the form options to prevent unnecessary re-renders
  const { accounts, contacts, leads, users } = useMemo(() => {
    return {
      accounts: dealFormOptions?.accounts || [],
      contacts: dealFormOptions?.contacts || [],
      leads: dealFormOptions?.leads || [],
      users: dealFormOptions?.owners || [],
    };
  }, [dealFormOptions]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: `Deal "${newDeal.name}" created successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deal.update(id, data),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDialog(false);
      setEditingDeal(null);
      resetForm();
      toast({
        title: "Success",
        description: `Deal "${updatedDeal.name}" updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dealId) => base44.entities.Deal.delete(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: "Success",
        description: "Deal deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete deal",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      accountId: "",
      ownerId: currentUser?.id || "",
      leadId: "",
      contactId: "",
      amount: "",
      currency: "USD",
      type: "New Business",
      stage: "Prospecting",
      probability: 50,
      closingDate: "",
      leadSource: "Website",
      description: "",
      campaignSource: "",
      quote: "",
      boxFolderId: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure either leadId or contactId is set (mutually exclusive)
    const submitData = { ...formData };
    if (submitData.leadId && submitData.contactId) {
      // If both are set, prefer leadId
      delete submitData.contactId;
    }
    
    // Store contact fields if contactId is selected
    if (submitData.contactId) {
      const selectedContact = contacts.find(c => c.id === submitData.contactId);
      if (selectedContact) {
        // Store full contact object with all fields for backend reference
        // Backend returns: {id, name} - store all fields
        submitData.contact = {
          id: selectedContact.id,
          name: selectedContact.name,
          first_name: selectedContact.first_name,
          last_name: selectedContact.last_name,
          email: selectedContact.email,
          phone: selectedContact.phone,
          mobile_phone: selectedContact.mobile_phone,
          accountId: selectedContact.accountId || selectedContact.account_id,
          ...selectedContact // Include all other contact fields from backend
        };
      }
    }
    
    // Store lead fields if leadId is selected
    if (submitData.leadId) {
      const selectedLead = leads.find(l => l.id === submitData.leadId);
      if (selectedLead) {
        // Store full lead object with all fields for backend reference
        // Backend returns: {id, name} - store all fields
        submitData.lead = {
          id: selectedLead.id,
          name: selectedLead.name,
          first_name: selectedLead.first_name,
          last_name: selectedLead.last_name,
          email: selectedLead.email,
          phone: selectedLead.phone,
          accountId: selectedLead.accountId || selectedLead.account_id,
          ...selectedLead // Include all other lead fields from backend
        };
      }
    }
    
    // Convert amount to number
    if (submitData.amount) {
      submitData.amount = parseFloat(submitData.amount);
    }
    
    // Convert probability to number
    if (submitData.probability) {
      submitData.probability = parseInt(submitData.probability);
    }

    console.log('Submitting deal data:', submitData);

    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      name: deal.name || "",
      accountId: deal.accountId || deal.account_id || deal.Account?.id || "",
      ownerId: deal.ownerId || deal.owner_id || deal.owner?.id || "",
      leadId: deal.leadId || deal.lead_id || deal.Lead?.id || "",
      contactId: deal.contactId || deal.contact_id || deal.Contact?.id || "",
      amount: deal.amount || "",
      currency: deal.currency || "USD",
      type: deal.type || "New Business",
      stage: deal.stage || "Prospecting",
      probability: deal.probability || 50,
      closingDate: deal.closingDate || deal.closing_date ? format(new Date(deal.closingDate || deal.closing_date), 'yyyy-MM-dd') : "",
      leadSource: deal.leadSource || deal.lead_source || "Website",
      description: deal.description || "",
      campaignSource: deal.campaignSource || deal.campaign_source || "",
      quote: deal.quote || "",
      boxFolderId: deal.boxFolderId || deal.box_folder_id || "",
    });
    setShowDialog(true);
  };

  const handleDelete = (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      deleteMutation.mutate(dealId);
    }
  };

  const handleAccountChange = (accountId) => {
    setFormData({ ...formData, accountId, contactId: "", leadId: "" });
  };

  const handleLeadContactToggle = (type, value) => {
    if (type === "lead") {
      setFormData({ ...formData, leadId: value, contactId: "" });
    } else {
      setFormData({ ...formData, contactId: value, leadId: "" });
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = !searchTerm || 
      deal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.Account?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.Lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.Contact?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === "all" || deal.stage === filterStage;
    const matchesOwner = filterOwner === "all" || deal.ownerId === filterOwner;
    
    return matchesSearch && matchesStage && matchesOwner;
  });

  const groupedDeals = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter((deal) => deal.stage === stage);
    return acc;
  }, {});

  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;
  const wonDeals = filteredDeals.filter(d => d.stage === "Closed Won");
  const conversionRate = filteredDeals.length > 0 ? (wonDeals.length / filteredDeals.length) * 100 : 0;

  // Show all leads and contacts (not filtered by account)
  // Memoize to prevent recalculation on every render
  const filteredContacts = useMemo(() => contacts, [contacts]);
  const filteredLeads = useMemo(() => leads, [leads]);

  // Filter contacts and leads for display
  const displayContacts = useMemo(() => {
    if (!contactSearchTerm) return filteredContacts;
    const search = contactSearchTerm.toLowerCase();
    return filteredContacts.filter(contact => 
      contact.name?.toLowerCase().includes(search) ||
      contact.first_name?.toLowerCase().includes(search) ||
      contact.last_name?.toLowerCase().includes(search) ||
      contact.email?.toLowerCase().includes(search)
    );
  }, [filteredContacts, contactSearchTerm]);

  const displayLeads = useMemo(() => {
    if (!leadSearchTerm) return filteredLeads;
    const search = leadSearchTerm.toLowerCase();
    return filteredLeads.filter(lead => 
      lead.name?.toLowerCase().includes(search) ||
      lead.first_name?.toLowerCase().includes(search) ||
      lead.last_name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search)
    );
  }, [filteredLeads, leadSearchTerm]);

  // Handle clicking on contact/lead to create deal
  const handleContactClick = (contact) => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      contactId: contact.id,
      leadId: "",
    }));
    setShowDialog(true);
  };

  const handleLeadClick = (lead) => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      leadId: lead.id,
      contactId: "",
    }));
    setShowDialog(true);
  };

  if (dealsLoading || dealFormLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in pipeline</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {CURRENCY_SYMBOLS.USD}{totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pipeline value</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {CURRENCY_SYMBOLS.USD}{Math.round(avgDealSize).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average per deal</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">{wonDeals.length} won deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Deals, Contacts, and Leads */}
      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search deals by name, account, contact, or lead..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterOwner} onValueChange={setFilterOwner}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Kanban View */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <Card key={stage} className="min-h-[500px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{stage}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {groupedDeals[stage]?.length || 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 overflow-y-auto max-h-[600px]">
              {groupedDeals[stage]?.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No deals in this stage
                </div>
              ) : (
                groupedDeals[stage]?.map((deal) => (
                  <Card 
                    key={deal.id} 
                    className="p-4 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30"
                    onClick={() => {
                      setViewingDeal(deal);
                      setShowDealDetailsDialog(true);
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1 line-clamp-2">{deal.name}</h4>
                          {deal.Account && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Building2 className="h-3 w-3" />
                              {deal.Account.name}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleEdit(deal); }}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-blue-600">
                          {CURRENCY_SYMBOLS[deal.currency || 'USD']}{(deal.amount || 0).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {deal.probability}%
                        </Badge>
                      </div>
                      
                      {deal.closingDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(deal.closingDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                      
                      {deal.type && (
                        <Badge variant="secondary" className="text-xs">
                          {deal.type}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayContacts.slice(0, 100).map((contact) => (
              <Card
                key={contact.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-purple-500"
                onClick={() => handleContactClick(contact)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        {contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact'}
                      </h4>
                      {contact.email && (
                        <p className="text-xs text-muted-foreground mb-1">{contact.email}</p>
                      )}
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                      )}
                    </div>
                    <UserCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {displayContacts.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No contacts found
              </div>
            )}
            {displayContacts.length > 100 && (
              <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                Showing first 100 of {displayContacts.length} contacts. Use search to find more.
              </div>
            )}
          </div>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={leadSearchTerm}
                  onChange={(e) => setLeadSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayLeads.slice(0, 100).map((lead) => (
              <Card
                key={lead.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-orange-500"
                onClick={() => handleLeadClick(lead)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        {lead.name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead'}
                      </h4>
                      {lead.email && (
                        <p className="text-xs text-muted-foreground mb-1">{lead.email}</p>
                      )}
                      {lead.phone && (
                        <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      )}
                    </div>
                    <UserCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {displayLeads.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No leads found
              </div>
            )}
            {displayLeads.length > 100 && (
              <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                Showing first 100 of {displayLeads.length} leads. Use search to find more.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Deal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingDeal ? "Edit Deal" : "Create New Deal"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Deal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter deal name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountId">Account *</Label>
                  <Select 
                    value={formData.accountId} 
                    onValueChange={handleAccountChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account..." />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name || account.company_name} {account.accountNumber ? `(${account.accountNumber})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerId">Owner *</Label>
                  <Select 
                    value={formData.ownerId} 
                    onValueChange={(value) => setFormData({ ...formData, ownerId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.full_name || user.email} {user.email ? `(${user.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lead or Contact *</Label>
                  <Tabs 
                    value={formData.leadId ? "lead" : formData.contactId ? "contact" : "lead"} 
                    onValueChange={(value) => {
                      if (value === "lead") {
                        setFormData({ ...formData, leadId: "", contactId: "" });
                      } else {
                        setFormData({ ...formData, leadId: "", contactId: "" });
                      }
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="lead">Lead</TabsTrigger>
                      <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>
                    <TabsContent value="lead" className="mt-2">
                      <Select 
                        value={formData.leadId} 
                        onValueChange={(value) => handleLeadContactToggle("lead", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filteredLeads.length === 0 ? "No leads available" : "Select lead..."} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {filteredLeads.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No leads available
                            </div>
                          ) : (
                            filteredLeads.slice(0, 100).map((lead) => (
                              <SelectItem key={lead.id} value={lead.id}>
                                {lead.name || 'Unnamed Lead'}
                              </SelectItem>
                            ))
                          )}
                          {filteredLeads.length > 100 && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                              Showing first 100 of {filteredLeads.length} leads. Use search to find more.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </TabsContent>
                    <TabsContent value="contact" className="mt-2">
                      <Select 
                        value={formData.contactId} 
                        onValueChange={(value) => handleLeadContactToggle("contact", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filteredContacts.length === 0 ? "No contacts available" : "Select contact..."} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto">
                          {filteredContacts.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No contacts available
                            </div>
                          ) : filteredContacts.length > 100 ? (
                            <>
                              {filteredContacts.slice(0, 100).map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.name || 'Unnamed Contact'}
                                </SelectItem>
                              ))}
                              <div className="px-2 py-1.5 text-xs text-muted-foreground border-t">
                                Showing first 100 of {filteredContacts.length} contacts
                              </div>
                            </>
                          ) : (
                            filteredContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.name || 'Unnamed Contact'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Deal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Deal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency} ({CURRENCY_SYMBOLS[currency]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Deal Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stage">Stage</Label>
                  <Select 
                    value={formData.stage} 
                    onValueChange={(value) => setFormData({ ...formData, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="probability">Probability (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingDate">Expected Close Date</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <Select 
                    value={formData.leadSource} 
                    onValueChange={(value) => setFormData({ ...formData, leadSource: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignSource">Campaign Source</Label>
                  <Input
                    id="campaignSource"
                    value={formData.campaignSource}
                    onChange={(e) => setFormData({ ...formData, campaignSource: e.target.value })}
                    placeholder="e.g., Q4 2024 Campaign"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quote">Quote Number</Label>
                  <Input
                    id="quote"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    placeholder="e.g., QT-2024-00123"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="boxFolderId">Box Folder ID</Label>
                  <Input
                    id="boxFolderId"
                    value={formData.boxFolderId}
                    onChange={(e) => setFormData({ ...formData, boxFolderId: e.target.value })}
                    placeholder="e.g., box_folder_12345"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Enter deal description..."
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setShowDialog(false); setEditingDeal(null); resetForm(); }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deal Details Dialog */}
      <Dialog open={showDealDetailsDialog} onOpenChange={setShowDealDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">Deal Details</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDealDetailsDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {viewingDeal && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {viewingDeal.name || viewingDeal.deal_name || 'Unnamed Deal'}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{viewingDeal.stage || 'N/A'}</Badge>
                    {viewingDeal.type && (
                      <Badge variant="secondary">{viewingDeal.type}</Badge>
                    )}
                    {viewingDeal.probability && (
                      <Badge variant="outline">{viewingDeal.probability}% probability</Badge>
                    )}
                  </div>
                </div>
                {viewingDeal.amount && (
                  <div className="text-right">
                    <p className="text-3xl font-bold text-emerald-600">
                      {CURRENCY_SYMBOLS[viewingDeal.currency || 'USD']}{(viewingDeal.amount || 0).toLocaleString()}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDealDetailsDialog(false);
                    handleEdit(viewingDeal);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>

              {/* Deal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Deal Information</h4>
                  
                  {viewingDeal.Account && (
                    <div>
                      <p className="text-sm text-gray-500">Account</p>
                      <p className="text-gray-900">{viewingDeal.Account.name}</p>
                    </div>
                  )}

                  {viewingDeal.Contact && (
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="text-gray-900">
                        {viewingDeal.Contact.name || `${viewingDeal.Contact.first_name || ''} ${viewingDeal.Contact.last_name || ''}`.trim()}
                      </p>
                    </div>
                  )}

                  {viewingDeal.Lead && (
                    <div>
                      <p className="text-sm text-gray-500">Lead</p>
                      <p className="text-gray-900">
                        {viewingDeal.Lead.name || `${viewingDeal.Lead.first_name || ''} ${viewingDeal.Lead.last_name || ''}`.trim()}
                      </p>
                    </div>
                  )}

                  {viewingDeal.leadSource && (
                    <div>
                      <p className="text-sm text-gray-500">Lead Source</p>
                      <p className="text-gray-900">{viewingDeal.leadSource}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Additional Details</h4>
                  
                  {viewingDeal.closingDate && (
                    <div>
                      <p className="text-sm text-gray-500">Expected Close Date</p>
                      <p className="text-gray-900">
                        {format(new Date(viewingDeal.closingDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {viewingDeal.description && (
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{viewingDeal.description}</p>
                    </div>
                  )}

                  {viewingDeal.campaignSource && (
                    <div>
                      <p className="text-sm text-gray-500">Campaign Source</p>
                      <p className="text-gray-900">{viewingDeal.campaignSource}</p>
                    </div>
                  )}

                  {viewingDeal.quote && (
                    <div>
                      <p className="text-sm text-gray-500">Quote Number</p>
                      <p className="text-gray-900">{viewingDeal.quote}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
