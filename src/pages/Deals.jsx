import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DealService } from "@/services/dealService";
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
  LayoutGrid,
  Users as UsersIcon,
  Search,
  Filter,
  BarChart3,
  Target,
  Trash2,
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
import BulkOperations from "../components/BulkOperations";
import { PageSkeleton } from "@/components/ui/loading-states";
import { createPageUrl } from "@/utils";

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const CURRENCIES = ["USD", "EGP", "AED", "SAR"];
const CURRENCY_SYMBOLS = {
  USD: "$",
  EGP: "E£",
  AED: "د.إ",
  SAR: "﷼"
};

// Use shared utility for building page URLs

export default function Deals() {
  const [view, setView] = useState("kanban");
  const [showDialog, setShowDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [formData, setFormData] = useState({
    deal_name: "",
    account_id: "",
    contact_id: "",
    lead_id: "",
    owner_email: "",
    product_line_id: "",
    amount: 0,
    currency: "USD",
    stage: "Prospecting",
    probability: 50,
    expected_close_date: "",
    lead_source: "Website",
    deal_type: "New Business",
    next_step: "",
    description: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Load view preference and current user
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.ui_preferences?.deals_view) {
        setView(user.ui_preferences.deals_view);
      }
    }).catch(() => {});
  }, []);

  // Enhanced queries using DealService
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', { searchTerm, filterStage, filterOwner, sortBy, sortOrder }],
    queryFn: async () => {
      const filters = {
        stage: filterStage || undefined,
        owner_email: filterOwner || undefined,
        sortBy,
        sortOrder
      };
      
      if (searchTerm) {
        return await DealService.searchDeals(searchTerm, filters);
      } else {
        return await DealService.getDeals(filters);
      }
    },
  });

  // Pipeline data for analytics
  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ['pipeline-data'],
    queryFn: () => DealService.getPipelineData(),
    enabled: showAnalytics,
  });

  // Deal analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['deal-analytics'],
    queryFn: () => DealService.getDealAnalytics('month'),
    enabled: showAnalytics,
  });

  // Forecast data
  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['deal-forecast'],
    queryFn: () => DealService.getForecast('quarter'),
    enabled: showForecast,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.accounts.getAll(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.contacts.getAll(),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.leads.getAll(),
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['product-lines'],
    queryFn: () => base44.entities.product_lines.getAll(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.users.getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => DealService.createDeal(data),
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-data'] });
      queryClient.invalidateQueries({ queryKey: ['deal-analytics'] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: `Deal "${newDeal.deal_name}" created successfully`,
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
    mutationFn: ({ id, data }) => DealService.updateDeal(id, data),
    onSuccess: (updatedDeal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineData'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowDialog(false);
      setEditingDeal(null);
      resetForm();
      toast({
        title: "Success",
        description: `Deal "${updatedDeal.deal_name}" updated successfully`,
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
    mutationFn: (dealId) => DealService.deleteDeal(dealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineData'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
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
    const defaultCurrency = currentUser?.default_currency || "USD";
    const defaultProductLine = currentUser?.product_line_id || "";

    setFormData({
      deal_name: "",
      account_id: "",
      contact_id: "",
      lead_id: "",
      owner_email: currentUser?.email || "",
      product_line_id: defaultProductLine,
      amount: 0,
      currency: defaultCurrency,
      stage: "Prospecting",
      probability: 50,
      expected_close_date: "",
      lead_source: "Website",
      deal_type: "New Business",
      next_step: "",
      description: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      deal_name: deal.deal_name || "",
      account_id: deal.account_id || "",
      contact_id: deal.contact_id || "",
      lead_id: deal.lead_id || "",
      owner_email: deal.owner_email || "",
      product_line_id: deal.product_line_id || "",
      amount: deal.amount || 0,
      currency: deal.currency || "USD",
      stage: deal.stage || "Prospecting",
      probability: deal.probability || 50,
      expected_close_date: deal.expected_close_date ? format(new Date(deal.expected_close_date), 'yyyy-MM-dd') : "",
      lead_source: deal.lead_source || "Website",
      deal_type: deal.deal_type || "New Business",
      next_step: deal.next_step || "",
      description: deal.description || "",
    });
    setShowDialog(true);
  };

  const handleStageChange = async (dealId, newStage) => {
    const deal = deals.find((d) => d.id === dealId);
    if (deal) {
      updateMutation.mutate({ 
        id: dealId, 
        data: { ...deal, stage: newStage }
      });
    }
  };

  const handleDelete = (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      deleteMutation.mutate(dealId);
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = !searchTerm || 
      deal.deal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === "all" || deal.stage === filterStage;
    const matchesOwner = filterOwner === "all" || deal.owner_email === filterOwner;
    
    return matchesSearch && matchesStage && matchesOwner;
  });

  const groupedDeals = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredDeals.filter((deal) => deal.stage === stage);
    return acc;
  }, {});

  const totalValue = filteredDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const avgDealSize = filteredDeals.length > 0 ? totalValue / filteredDeals.length : 0;
  const conversionRate = filteredDeals.length > 0 ? 
    (filteredDeals.filter(d => d.stage === "Closed Won").length / filteredDeals.length) * 100 : 0;

  if (dealsLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showAnalytics ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={showForecast ? "default" : "outline"}
            size="sm"
            onClick={() => setShowForecast(!showForecast)}
          >
            <Target className="h-4 w-4 mr-2" />
            Forecast
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectValue placeholder="Filter by owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.email}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDeals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {CURRENCY_SYMBOLS.USD}{totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {CURRENCY_SYMBOLS.USD}{avgDealSize.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban View */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <Card key={stage} className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {stage}
                <Badge variant="secondary">{groupedDeals[stage]?.length || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedDeals[stage]?.map((deal) => (
                <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">{deal.deal_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {deal.account_name || 'No Account'}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">
                        {CURRENCY_SYMBOLS[deal.currency || 'USD']}{(deal.amount || 0).toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(deal)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(deal.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {deal.probability}% • {deal.owner_name || deal.owner_email}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDeal ? "Edit Deal" : "Create New Deal"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deal_name">Deal Name *</Label>
                <Input
                  id="deal_name"
                  value={formData.deal_name}
                  onChange={(e) => setFormData({ ...formData, deal_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
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
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingDeal ? "Update Deal" : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
