
import { useState, useEffect } from "react";
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

export default function Accounts() {
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
  const [sortField, setSortField] = useState("company_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(true);
  
  const [formData, setFormData] = useState({
    company_name: "",
    website: "",
    industry: "Technology",
    employee_count: "11-50",
    annual_revenue: 0,
    phone: "",
    email: "",
    billing_address: "",
    billing_city: "",
    billing_country: "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "",
    account_type: "Prospect",
    account_status: "Active",
    notes: "",
    assigned_users: [],
    product_lines: [],
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

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
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
      const serialNumber = (currentUser && serializationSettings.length > 0)
                           ? await generateSerialNumber()
                           : null;

      return base44.entities.Account.create({
        ...data,
        serial_number: serialNumber
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['serializationSettings'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Account.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setShowDialog(false);
      setEditingAccount(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Account.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      website: "",
      industry: "Technology",
      employee_count: "11-50",
      annual_revenue: 0,
      phone: "",
      email: "",
      billing_address: "",
      billing_city: "",
      billing_country: "",
      shipping_address: "",
      shipping_city: "",
      shipping_country: "",
      account_type: "Prospect",
      account_status: "Active",
      notes: "",
      assigned_users: [],
      product_lines: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      company_name: account.company_name || "",
      website: account.website || "",
      industry: account.industry || "Technology",
      employee_count: account.employee_count || "11-50",
      annual_revenue: account.annual_revenue || 0,
      phone: account.phone || "",
      email: account.email || "",
      billing_address: account.billing_address || "",
      billing_city: account.billing_city || "",
      billing_country: account.billing_country || "",
      shipping_address: account.shipping_address || "",
      shipping_city: account.shipping_city || "",
      shipping_country: account.shipping_country || "",
      account_type: account.account_type || "Prospect",
      account_status: account.account_status || "Active",
      notes: account.notes || "",
      assigned_users: account.assigned_users || [],
      product_lines: account.product_lines || [],
    });
    setShowDialog(true);
  };

  const copyBillingToShipping = () => {
    setFormData({
      ...formData,
      shipping_address: formData.billing_address,
      shipping_city: formData.billing_city,
      shipping_country: formData.billing_country,
    });
  };

  const copyShippingToBilling = () => {
    setFormData({
      ...formData,
      billing_address: formData.shipping_address,
      billing_city: formData.shipping_city,
      billing_country: formData.shipping_country,
    });
  };

  const handleViewDetails = (account) => {
    window.location.href = createPageUrl('AccountDetails') + '?id=' + account.id;
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
    const matchesSearch =
      account.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
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
                onClick={() => {
                  setEditingAccount(null);
                  resetForm();
                  setShowDialog(true);
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
                    {account.serial_number || `ACC-${String(index + 1).padStart(3, '0')}`}
                  </td>
                  <td className="crm-table-cell">
                    <div className="flex items-center gap-2">
                      <div className="crm-avatar bg-gradient-to-br from-blue-500 to-purple-500">
                        {account.company_name?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{account.company_name}</div>
                        {account.industry && (
                          <div className="text-xs text-gray-500">{account.industry}</div>
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
                    {account.assigned_users?.[0] ? getUserName(account.assigned_users[0]) : 'Ahmed Ashour'}
                  </td>
                  <td className="crm-table-cell text-gray-600">-</td>
                  <td className="crm-table-cell text-gray-600">
                    {account.updated_date ? new Date(account.updated_date).toLocaleDateString() : '10/09/24'}
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
                          onClick={() => deleteMutation.mutate(account.id)}
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

      {/* Dialog remains the same */}
      {/* ... existing dialog code ... */}
    </div>
  );
}