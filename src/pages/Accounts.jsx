
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Edit,
  Globe,
  Users,
  Eye,
  LayoutGrid,
  List,
  Table,
  Filter,
  MapPin,
  MoreHorizontal,
  ChevronDown,
  Settings,
  Download,
  Upload,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  X,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import AssignmentManager from "../components/AssignmentManager";
import BulkOperations from "../components/BulkOperations";
import { SwipeToDelete, TouchCard, PullToRefresh } from "@/components/TouchInteractions";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import PhoneInput from "@/components/PhoneInput";

export default function Accounts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [territoryFilter, setTerritoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("table");
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(100);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(true);
  const [accountToDelete, setAccountToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    // Required fields
    name: "",
    accountNumber: "",
    billing_street: "",
    billing_city: "",
    // Optional fields
    website: "",
    phone: "",
    billing_state: "",
    billing_zip: "",
    billing_country: "",
    shipping_street: "",
    shipping_city: "",
    shipping_state: "",
    shipping_zip: "",
    shipping_country: "",
    userIds: [], // Array of user UUIDs
    parentAccountId: "",
  });

  const queryClient = useQueryClient();

  const { data: serializationSettings = [] } = useQuery({
    queryKey: ['serializationSettings'],
    queryFn: () => base44.entities.EntitySerializationSettings.list(),
  });

  const [currentUser, setCurrentUser] = useState(null);

  // Load view preference
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.ui_preferences?.accounts_view) {
        setView(user.ui_preferences.accounts_view);
      }
    });
  }, []);

  // Save view preference
  const handleViewChange = async (newView) => {
    setView(newView);
    if (currentUser) {
      const updatedPreferences = {
        ...currentUser.ui_preferences,
        accounts_view: newView
      };
      await base44.auth.updateMe({ ui_preferences: updatedPreferences });
    }
  };

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list('-created_date'),
  });

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['accountCreationFormUsers'],
    queryFn: async () => {
      try {
        const usersList = await base44.entities.User.getAccountCreationFormUsers();
        console.log('Account creation form users fetched:', usersList.length, 'users');
        if (usersList.length > 0) {
          console.log('First user sample:', usersList[0]);
        }
        return usersList;
      } catch (error) {
        console.error('Error fetching account creation form users:', error);
        return []; // Return empty array on error
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  const generateSerialNumber = async () => {
    if (!serializationSettings || !currentUser) return null;

    const setting = serializationSettings.find(s =>
      s.entity_type === 'Account' &&
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
      // Remove serial_number but keep ownerId for account creation
      const { serial_number, ...accountData } = data;
      console.log('Creating account with data:', accountData);
      return base44.entities.Account.create(accountData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowDialog(false);
      setEditingAccount(null);
      resetForm();
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setAccountToDelete(null);
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting account:', error);
      setAccountToDelete(null);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (account) => {
    setAccountToDelete(account);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteMutation.mutate(accountToDelete.id);
    }
  };

  const resetForm = () => {
    setFormData({
      // Required fields
      name: "",
      accountNumber: "",
      billing_street: "",
      billing_city: "",
      // Optional fields
      website: "",
      phone: "",
      billing_state: "",
      billing_zip: "",
      billing_country: "",
      shipping_street: "",
      shipping_city: "",
      shipping_state: "",
      shipping_zip: "",
      shipping_country: "",
      userIds: [],
      parentAccountId: "",
    });
    setEditingAccount(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.billing_street || !formData.billing_city) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Billing Street, Billing City)",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission matching backend API format
    const submitData = {
      name: formData.name,
      accountNumber: formData.accountNumber || undefined, // Will be auto-generated if not provided
      phone: formData.phone || undefined,
      website: formData.website || undefined,
      billing_street: formData.billing_street,
      billing_city: formData.billing_city,
      billing_state: formData.billing_state || undefined,
      billing_zip: formData.billing_zip || undefined,
      billing_country: formData.billing_country || undefined,
      shipping_street: formData.shipping_street || undefined,
      shipping_city: formData.shipping_city || undefined,
      shipping_state: formData.shipping_state || undefined,
      shipping_zip: formData.shipping_zip || undefined,
      shipping_country: formData.shipping_country || undefined,
      userIds: Array.isArray(formData.userIds) && formData.userIds.length > 0 ? formData.userIds : undefined,
      parentAccountId: formData.parentAccountId === "__none__" || formData.parentAccountId === "" || !formData.parentAccountId ? undefined : formData.parentAccountId,
    };

    // Only include website if it's a valid URL
    if (submitData.website && submitData.website.trim()) {
      // Ensure website starts with http:// or https://
      let websiteUrl = submitData.website.trim();
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      submitData.website = websiteUrl;
    }

    // Remove undefined and empty fields (but keep userIds array if it has items)
    Object.keys(submitData).forEach(key => {
      if (key === 'userIds') {
        // Keep userIds only if it's a non-empty array
        if (!Array.isArray(submitData[key]) || submitData[key].length === 0) {
          delete submitData[key];
        }
      } else if (submitData[key] === undefined || submitData[key] === "" || submitData[key] === null) {
        delete submitData[key];
      }
    });

    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    
    // Extract userIds from account - could be an array or single ownerId
    let userIds = [];
    if (Array.isArray(account.userIds)) {
      userIds = account.userIds;
    } else if (account.userIds) {
      userIds = [account.userIds];
    } else if (account.ownerId || account.owner_id || account.owner?.id) {
      // Fallback: if there's an ownerId, include it in userIds
      userIds = [account.ownerId || account.owner_id || account.owner.id];
    }
    
    setFormData({
      // Required fields
      name: account.name || account.company_name || "",
      accountNumber: account.accountNumber || account.account_number || "",
      billing_street: account.billing_street || account.billing_address || "",
      billing_city: account.billing_city || "",
      // Optional fields
      website: account.website || "",
      phone: account.phone || "",
      billing_state: account.billing_state || account.billingState || "",
      billing_zip: account.billing_zip || account.billingZip || account.billing_zip_code || "",
      billing_country: account.billing_country || account.billingCountry || "",
      shipping_street: account.shipping_street || account.shipping_address || account.shippingAddress || "",
      shipping_city: account.shipping_city || account.shippingCity || "",
      shipping_state: account.shipping_state || account.shippingState || "",
      shipping_zip: account.shipping_zip || account.shippingZip || account.shipping_zip_code || "",
      shipping_country: account.shipping_country || account.shippingCountry || "",
      userIds: userIds,
      parentAccountId: account.parentAccountId || account.parent_account_id || account.parentAccount?.id || "",
    });
    setShowDialog(true);
  };

  const copyBillingToShipping = () => {
    setFormData({
      ...formData,
      shipping_street: formData.billing_street,
      shipping_city: formData.billing_city,
      shipping_state: formData.billing_state,
      shipping_zip: formData.billing_zip,
      shipping_country: formData.billing_country,
    });
  };

  const copyShippingToBilling = () => {
    setFormData({
      ...formData,
      billing_street: formData.shipping_street,
      billing_city: formData.shipping_city,
      billing_state: formData.shipping_state,
      billing_zip: formData.shipping_zip,
      billing_country: formData.shipping_country,
    });
  };

  const handleViewDetails = (account) => {
    navigate(`/accounts/${account.id}`);
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProductLineName = (id) => {
    const pl = productLines.find(p => p.id === id);
    return pl?.name || id;
  };

  const filteredAccounts = accounts.filter(account => {
    const accountName = account.name || account.company_name || '';
    const matchesSearch =
      accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.website?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Note: account_type and account_status may not exist in new backend
    const matchesType = filterType === "all" || account.account_type === filterType;
    const matchesStatus = statusFilter === "all" || account.account_status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const totalRecords = filteredAccounts.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedAccounts.length === paginatedAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(paginatedAccounts.map(account => account.id));
    }
  };

  const handleSelectAccount = (accountId) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const typeColors = {
    'Customer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Prospect': 'bg-blue-100 text-blue-700 border-blue-200',
    'Partner': 'bg-purple-100 text-purple-700 border-purple-200',
    'Competitor': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const statusColors = {
    'Active': 'bg-green-100 text-green-700 border-green-200',
    'Inactive': 'bg-red-100 text-red-700 border-red-200',
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Filters */}
      {showFilters && (
        <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">System Defined Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Touched Records</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Untouched Records</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Recent Action</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Related Records Action</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Scoring Rules</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Locked</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Cadences</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter By Fields</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">Account Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Competitor">Competitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs text-gray-600">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Professional CRM Header */}
        <div className="crm-page-header bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600"
              >
                <Filter className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="crm-page-title">
                  <Building2 className="w-8 h-8 text-blue-500" />
                  Accounts
                </h1>
                <p className="crm-page-subtitle">Manage your business accounts and relationships</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                Map View
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Bulk Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Create Account button clicked');
                  try {
                    setEditingAccount(null);
                    resetForm();
                    console.log('Form reset, opening dialog');
                    setShowDialog(true);
                    console.log('Dialog state set to true');
                  } catch (error) {
                    console.error('Error opening dialog:', error);
                    toast({
                      title: "Error",
                      description: "Failed to open form. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="crm-btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          </div>

          {/* Professional CRM Toolbar */}
          <div className="crm-toolbar">
            <div className="crm-toolbar-left">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={territoryFilter} onValueChange={setTerritoryFilter}>
                  <SelectTrigger className="crm-select w-40">
                    <SelectValue placeholder="All Territories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Territories</SelectItem>
                    <SelectItem value="north">North Territory</SelectItem>
                    <SelectItem value="south">South Territory</SelectItem>
                    <SelectItem value="east">East Territory</SelectItem>
                    <SelectItem value="west">West Territory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="crm-select w-40">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="Customer">Customers</SelectItem>
                  <SelectItem value="Prospect">Prospects</SelectItem>
                  <SelectItem value="Partner">Partners</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="crm-input pl-10 w-80"
                />
              </div>
            </div>
          </div>

          {/* Records Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Total Records: {totalRecords}</span>
              <span>•</span>
              <span>Sort By: Account Number (Asc)</span>
              <span>•</span>
              <span>Unsort</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{recordsPerPage} Records Per Page</span>
              <Select value={recordsPerPage.toString()} onValueChange={(value) => setRecordsPerPage(Number(value))}>
                <SelectTrigger className="w-16 h-7">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Professional CRM Table */}
        <div className="crm-card flex-1 overflow-auto">
          <table className="crm-table">
            <thead className="crm-table-header sticky top-0">
              <tr>
                <th className="crm-table-cell w-12">
                  <Checkbox
                    checked={selectedAccounts.length === paginatedAccounts.length && paginatedAccounts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="crm-table-cell">Account Number</th>
                <th className="crm-table-cell">Account Name</th>
                <th className="crm-table-cell">Phone</th>
                <th className="crm-table-cell">Website</th>
                <th className="crm-table-cell">Account Owner</th>
                <th className="crm-table-cell">Parent Account</th>
                <th className="crm-table-cell">Last Activity Time</th>
                <th className="crm-table-cell w-12"></th>
              </tr>
            </thead>
            <tbody className="crm-table-body">
              {paginatedAccounts.map((account, index) => (
                <tr 
                  key={account.id} 
                  className={`crm-table-row ${
                    selectedAccounts.includes(account.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleViewDetails(account)}
                >
                  <td className="crm-table-cell">
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => handleSelectAccount(account.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="crm-table-cell text-blue-600 font-medium">
                    {account.accountNumber || account.account_number || account.serial_number || `ACC-${String(index + 1).padStart(3, '0')}`}
                  </td>
                  <td className="crm-table-cell">
                    <div className="flex items-center gap-2">
                      <div className="crm-avatar bg-gradient-to-br from-blue-500 to-purple-500">
                        {(account.name || account.company_name)?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{account.name || account.company_name}</div>
                        {account.website && (
                          <div className="text-xs text-gray-500">{account.website}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="crm-table-cell text-gray-600">{account.phone || '-'}</td>
                  <td className="crm-table-cell">
                    {account.website ? (
                      <a 
                        href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {account.website}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="crm-table-cell text-gray-600">
                    {(() => {
                      // Check for userIds array first (new format)
                      const userIds = account.userIds || account.user_ids || [];
                      if (Array.isArray(userIds) && userIds.length > 0) {
                        const userNames = userIds
                          .map(userId => {
                            const user = users.find(u => u.id === userId);
                            return user ? (user.name || user.full_name || user.email) : null;
                          })
                          .filter(Boolean);
                        return userNames.length > 0 ? userNames.join(', ') : '-';
                      }
                      // Fallback to ownerId (old format)
                      const ownerId = account.ownerId || account.owner_id || account.owner?.id;
                      if (ownerId) {
                        const owner = users.find(u => u.id === ownerId);
                        return owner ? (owner.name || owner.full_name || owner.email) : '-';
                      }
                      return account.assigned_users?.[0] ? getUserName(account.assigned_users[0]) : '-';
                    })()}
                  </td>
                  <td className="crm-table-cell text-gray-600">
                    {(() => {
                      const parentId = account.parentAccountId || account.parent_account_id || account.parentAccount?.id;
                      if (parentId) {
                        const parent = accounts.find(a => a.id === parentId);
                        return parent ? (parent.name || parent.company_name) : '-';
                      }
                      return '-';
                    })()}
                  </td>
                  <td className="crm-table-cell text-gray-600">
                    {account.updatedAt ? new Date(account.updatedAt).toLocaleDateString() : 
                     account.updated_date ? new Date(account.updated_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="crm-table-cell">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(account)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(account)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(account);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} - {Math.min(endIndex, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Required Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter account name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber || ""}
                  onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://example.com or example.com"
              />
              <p className="text-xs text-gray-500">Enter a valid URL (http:// or https:// will be added automatically if missing)</p>
            </div>

            <div className="space-y-2">
              <PhoneInput
                label="Phone"
                value={formData.phone}
                onChange={(value) => setFormData({...formData, phone: value})}
                required={false}
                placeholder="Enter phone number"
                id="phone"
                name="phone"
                useEgyptianAreaCodes={true}
              />
            </div>

            {/* Assigned Users - Multi-select */}
            <div className="space-y-2">
              <Label htmlFor="userIds">Assigned Users (Optional)</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {usersLoading ? (
                  <div className="text-sm text-gray-500">Loading users...</div>
                ) : usersError ? (
                  <div className="text-sm text-red-500">Error loading users</div>
                ) : Array.isArray(users) && users.length > 0 ? (
                  users
                    .filter(user => user?.id)
                    .map((user) => {
                      const isSelected = formData.userIds.includes(user.id);
                      return (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`user-${user.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  userIds: [...formData.userIds, user.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  userIds: formData.userIds.filter(id => id !== user.id)
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor={`user-${user.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {user.name || user.full_name || user.email || user.id || "Unknown User"}
                            {user.email && user.name !== user.email ? ` (${user.email})` : ''}
                          </Label>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-sm text-gray-500">No users available</div>
                )}
              </div>
              {formData.userIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.userIds.map((userId) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                        {user?.name || user?.full_name || user?.email || userId}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              userIds: formData.userIds.filter(id => id !== userId)
                            });
                          }}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Billing Address Section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Billing Address</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="billing_street">Billing Street *</Label>
                  <Input
                    id="billing_street"
                    value={formData.billing_street || ""}
                    onChange={(e) => setFormData({...formData, billing_street: e.target.value})}
                    placeholder="Enter street address"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_city">Billing City *</Label>
                    <Input
                      id="billing_city"
                      value={formData.billing_city || ""}
                      onChange={(e) => setFormData({...formData, billing_city: e.target.value})}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_state">Billing State</Label>
                    <Input
                      id="billing_state"
                      value={formData.billing_state || ""}
                      onChange={(e) => setFormData({...formData, billing_state: e.target.value})}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing_zip">Billing ZIP</Label>
                    <Input
                      id="billing_zip"
                      value={formData.billing_zip || ""}
                      onChange={(e) => setFormData({...formData, billing_zip: e.target.value})}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_country">Billing Country</Label>
                    <Input
                      id="billing_country"
                      value={formData.billing_country || ""}
                      onChange={(e) => setFormData({...formData, billing_country: e.target.value})}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Shipping Address</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyBillingToShipping}
                >
                  Copy from Billing
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="shipping_street">Shipping Street</Label>
                  <Input
                    id="shipping_street"
                    value={formData.shipping_street || ""}
                    onChange={(e) => setFormData({...formData, shipping_street: e.target.value})}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_city">Shipping City</Label>
                    <Input
                      id="shipping_city"
                      value={formData.shipping_city || ""}
                      onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_state">Shipping State</Label>
                    <Input
                      id="shipping_state"
                      value={formData.shipping_state || ""}
                      onChange={(e) => setFormData({...formData, shipping_state: e.target.value})}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping_zip">Shipping ZIP</Label>
                    <Input
                      id="shipping_zip"
                      value={formData.shipping_zip || ""}
                      onChange={(e) => setFormData({...formData, shipping_zip: e.target.value})}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping_country">Shipping Country</Label>
                    <Input
                      id="shipping_country"
                      value={formData.shipping_country || ""}
                      onChange={(e) => setFormData({...formData, shipping_country: e.target.value})}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Account */}
            <div className="space-y-2">
              <Label htmlFor="parentAccountId">Parent Account</Label>
              <Select 
                value={formData.parentAccountId || "__none__"} 
                onValueChange={(value) => {
                  if (value === "__none__") {
                    setFormData({...formData, parentAccountId: null});
                  } else if (value && value !== "__disabled__") {
                    setFormData({...formData, parentAccountId: value});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent account (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {Array.isArray(accounts) && accounts.length > 0 ? (
                    accounts
                      .filter(a => a?.id && a.id !== editingAccount?.id)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name || account.company_name || account.id}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="__disabled__" disabled>No accounts available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the account "{accountToDelete?.name || accountToDelete?.company_name}"? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setAccountToDelete(null)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}