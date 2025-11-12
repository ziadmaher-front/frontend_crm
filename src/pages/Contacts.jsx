
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessibleButton } from "@/components/AccessibilityEnhancements";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import contactService from "@/services/contactService";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Building2,
  Edit,
  Users,
  Smartphone,
  Linkedin,
  Eye,
  LayoutGrid, // New import
  List,       // New import
  Table,      // New import
  Filter,
  BarChart3,
  Target,
  Trash2,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { CardSkeleton } from "@/components/LoadingStates";
import { SwipeToDelete, TouchCard, PullToRefresh } from "@/components/TouchInteractions";
import { AccessibleFormField } from '@/components/AccessibilityEnhancements';
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
import { createPageUrl } from "@/utils";
import { PageSkeleton } from "@/components/ui/loading-states";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("grid"); // New state for view
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sortBy, setSortBy] = useState("created_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    account_id: "",
    phone: "",
    mobile: "",
    job_title: "",
    department: "",
    linkedin_url: "",
    address: "",
    city: "",
    country: "",
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
      if (user?.ui_preferences?.contacts_view) {
        setView(user.ui_preferences.contacts_view);
      }
    });
  }, []);

  // Save view preference
  const handleViewChange = async (newView) => {
    setView(newView);
    if (currentUser) {
      const updatedPreferences = {
        ...currentUser.ui_preferences,
        contacts_view: newView
      };
      // Optimistically update currentUser state for immediate reflection
      setCurrentUser(prevUser => ({
        ...prevUser,
        ui_preferences: updatedPreferences
      }));
      try {
        await base44.auth.updateMe({ ui_preferences: updatedPreferences });
      } catch (error) {
        console.error("Failed to save view preference:", error);
        // Optionally, revert view state or show an error message
      }
    }
  };

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts', searchQuery, filterAccount, filterOwner, filterJobTitle, filterDepartment, filterCountry, sortBy, sortOrder],
    queryFn: () => contactService.getAllContacts({
      searchTerm: searchQuery,
      filterAccount,
      filterOwner,
      filterJobTitle,
      filterDepartment,
      filterCountry,
      sortBy,
      sortOrder
    }),
    select: (data) => data.success ? data.data : []
  });

  // Analytics query
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['contactAnalytics'],
    queryFn: () => contactService.getContactAnalytics(),
    enabled: showAnalytics,
    select: (data) => data.success ? data.data : null
  });

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['contacts'] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: productLines = [], isLoading: productLinesLoading } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  // Combined loading state
  const isLoading = contactsLoading || accountsLoading || usersLoading || productLinesLoading;

  const generateSerialNumber = async () => {
    const setting = serializationSettings.find(s =>
      s.entity_type === 'Contact' &&
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
          serialNumber += component.value || '';
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
      const serialNumber = await generateSerialNumber();
      const result = await contactService.createContact({
        ...data,
        serial_number: serialNumber
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contactAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['serializationSettings'] });
      setShowDialog(false);
      resetForm();
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contactAnalytics'] });
      setShowDialog(false);
      setEditingContact(null);
      resetForm();
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contactAnalytics'] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      account_id: "",
      phone: "",
      mobile: "",
      job_title: "",
      department: "",
      linkedin_url: "",
      address: "",
      city: "",
      country: "",
      notes: "",
      assigned_users: [],
      product_lines: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      account_id: contact.account_id || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      job_title: contact.job_title || "",
      department: contact.department || "",
      linkedin_url: contact.linkedin_url || "",
      address: contact.address || "",
      city: contact.city || "",
      country: contact.country || "",
      notes: contact.notes || "",
      assigned_users: contact.assigned_users || [],
      product_lines: contact.product_lines || [],
    });
    setShowDialog(true);
  };

  const handleViewDetails = (contact) => {
    window.location.href = createPageUrl('ContactDetails') + '?id=' + contact.id;
  };

  // New handler functions for enhanced functionality
  const handleDelete = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      deleteMutation.mutate(contactId);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'account':
        setFilterAccount(value);
        break;
      case 'owner':
        setFilterOwner(value);
        break;
      case 'jobTitle':
        setFilterJobTitle(value);
        break;
      case 'department':
        setFilterDepartment(value);
        break;
      case 'country':
        setFilterCountry(value);
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
    setSearchQuery("");
    setFilterAccount("");
    setFilterOwner("");
    setFilterJobTitle("");
    setFilterDepartment("");
    setFilterCountry("");
    setSortBy("created_date");
    setSortOrder("desc");
  };

  const filteredContacts = contacts;

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.company_name || null;
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProductLineName = (id) => {
    const pl = productLines.find(p => p.id === id);
    return pl?.name || id;
  };

  return (
    <>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className={`p-4 lg:p-8 space-y-4 lg:space-y-6 ${isMobile ? 'pb-20' : ''}`}>
          {/* Professional CRM Header */}
          <div className="crm-page-header">
            <div>
              <h1 className="crm-page-title">
                <Users className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-purple-500`} />
                Contacts
          </h1>
          <p className="crm-page-subtitle">Manage your business contacts and relationships</p>
        </div>
        <div className={`flex gap-3 ${isMobile ? 'w-full flex-col' : ''}`}>
          <div className={`flex gap-1 bg-gray-100 rounded-lg p-1 ${isMobile ? 'w-full' : ''}`}>
            <AccessibleButton
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("grid")}
              className={`${view === "grid" ? "bg-white shadow-sm" : ""} ${isMobile ? 'flex-1' : ''}`}
              ariaLabel="Switch to grid view"
            >
              <LayoutGrid className="w-4 h-4" />
              {isMobile && <span className="ml-2">Grid</span>}
            </AccessibleButton>
            <AccessibleButton
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("list")}
              className={`${view === "list" ? "bg-white shadow-sm" : ""} ${isMobile ? 'flex-1' : ''}`}
              ariaLabel="Switch to list view"
            >
              <List className="w-4 h-4" />
              {isMobile && <span className="ml-2">List</span>}
            </AccessibleButton>
            <AccessibleButton
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("table")}
              className={`${view === "table" ? "bg-white shadow-sm" : ""} ${isMobile ? 'flex-1' : ''}`}
              ariaLabel="Switch to table view"
            >
              <Table className="w-4 h-4" />
              {isMobile && <span className="ml-2">Table</span>}
            </AccessibleButton>
          </div>
          <Button
            variant={showAnalytics ? "default" : "outline"}
            size="sm"
            onClick={toggleAnalytics}
            className={isMobile ? 'w-full' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <AccessibleButton
            onClick={() => {
              setEditingContact(null);
              resetForm();
              setShowDialog(true);
            }}
            className={`crm-btn-primary ${isMobile ? 'w-full' : ''}`}
            ariaLabel="Add new contact"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Contact
          </AccessibleButton>
        </div>
      </div>

      {/* Professional CRM Toolbar */}
      <div className="crm-toolbar">
        <div className="crm-toolbar-left">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search contacts by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="crm-input pl-10 w-80"
            />
          </div>
          <Select value={filterAccount} onValueChange={(value) => handleFilterChange('account', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOwner} onValueChange={(value) => handleFilterChange('owner', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-2"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
        <div className="crm-toolbar-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange('first_name')}
          >
            Name
            {sortBy === 'first_name' && (
              sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange('created_date')}
          >
            Date
            {sortBy === 'created_date' && (
              sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.totalContacts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Email Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.engagementMetrics.emailCoverage}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Phone Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.engagementMetrics.phoneCoverage}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Account Association</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{analytics.engagementMetrics.accountAssociation}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <BulkOperations
        entityName="Contact"
        records={filteredContacts}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['contacts'] })}
      >
        {({ selectedRecords, isSelected, handleSelectRecord }) => (
          <PullToRefresh onRefresh={handleRefresh} isRefreshing={isRefreshing}>
            {isLoading ? (
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                {view === "grid" && (
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                    {filteredContacts.map((contact) => (
                      <SwipeToDelete
                        key={contact.id}
                        onDelete={() => console.log('Delete contact:', contact.id)}
                        onArchive={() => console.log('Archive contact:', contact.id)}
                      >
                        <TouchCard
                          onLongPress={() => handleEdit(contact)}
                          onClick={() => handleViewDetails(contact)}
                          className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                            isSelected(contact.id) ? 'ring-2 ring-purple-500' : ''
                          }`}
                        >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected(contact.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRecord(contact.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 w-4 h-4 text-purple-600 rounded"
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {contact.first_name} {contact.last_name}
                            </CardTitle>
                            {contact.serial_number && (
                              <Badge variant="outline" className="mt-1 text-xs font-mono">
                                {contact.serial_number}
                              </Badge>
                            )}
                            {contact.job_title && (
                              <p className="text-sm text-gray-500 mt-1">{contact.job_title}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(contact);
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
                              handleViewDetails(contact);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(contact.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {contact.account_id && getAccountName(contact.account_id) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700 font-medium">{getAccountName(contact.account_id)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.mobile && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <span>{contact.mobile}</span>
                        </div>
                      )}
                      {contact.linkedin_url && (
                        <a
                          href={contact.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}

                      {(contact.assigned_users?.length > 0 || contact.product_lines?.length > 0) && (
                        <div className="pt-2 border-t space-y-2">
                          {contact.assigned_users?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Assigned To:</p>
                              <div className="flex flex-wrap gap-1">
                                {contact.assigned_users.slice(0, 2).map((email) => (
                                  <Badge key={email} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                    {getUserName(email).split(' ')[0]}
                                  </Badge>
                                ))}
                                {contact.assigned_users.length > 2 && (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                    +{contact.assigned_users.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {contact.product_lines?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Product Lines:</p>
                              <div className="flex flex-wrap gap-1">
                                {contact.product_lines.slice(0, 2).map((id) => (
                                  <Badge key={id} className="bg-indigo-100 text-indigo-700 text-xs border-indigo-200">
                                    {getProductLineName(id)}
                                  </Badge>
                                ))}
                                {contact.product_lines.length > 2 && (
                                  <Badge className="bg-indigo-100 text-indigo-700 text-xs border-indigo-200">
                                    +{contact.product_lines.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {contact.tags && contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {contact.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </TouchCard>
                </SwipeToDelete>
              ))}
            </div>
          )}

          {view === "list" && (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <SwipeToDelete
                  key={contact.id}
                  onDelete={() => console.log('Delete contact:', contact.id)}
                  onArchive={() => console.log('Archive contact:', contact.id)}
                >
                  <TouchCard
                    onLongPress={() => handleEdit(contact)}
                    onClick={() => handleViewDetails(contact)}
                    className={`border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      isSelected(contact.id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected(contact.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRecord(contact.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                              {contact.first_name?.[0]}{contact.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{contact.first_name} {contact.last_name}</p>
                              {contact.serial_number && (
                                <p className="text-xs text-gray-500 font-mono">{contact.serial_number}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">{getAccountName(contact.account_id)}</p>
                            <p className="text-xs text-gray-500">{contact.job_title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{contact.email}</p>
                            <p className="text-xs text-gray-500">{contact.phone}</p>
                          </div>
                          <div>
                            {contact.product_lines?.length > 0 && (
                              <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                {contact.product_lines.length} Product Lines
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(contact);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(contact);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TouchCard>
                </SwipeToDelete>
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
                          checked={selectedRecords.length === filteredContacts.length && filteredContacts.length > 0}
                          onChange={() => {
                            if (selectedRecords.length === filteredContacts.length) {
                              selectedRecords.forEach(id => handleSelectRecord(id)); // Deselect all
                            } else {
                              filteredContacts.filter(c => !isSelected(c.id)).forEach(c => handleSelectRecord(c.id)); // Select all unselected
                            }
                          }}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                      </th>
                      <th className="crm-table-cell">Serial #</th>
                      <th className="crm-table-cell">Name</th>
                      <th className="crm-table-cell">Account</th>
                      <th className="crm-table-cell">Job Title</th>
                      <th className="crm-table-cell">Email</th>
                      <th className="crm-table-cell">Phone</th>
                      <th className="crm-table-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="crm-table-body">
                    {filteredContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className={`crm-table-row ${
                          isSelected(contact.id) ? 'selected' : ''
                        }`}
                        onClick={() => handleViewDetails(contact)}
                      >
                        <td className="crm-table-cell">
                          <input
                            type="checkbox"
                            checked={isSelected(contact.id)}
                            onChange={() => handleSelectRecord(contact.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                        </td>
                        <td className="crm-table-cell font-mono text-gray-600">
                          {contact.serial_number || '-'}
                        </td>
                        <td className="crm-table-cell">
                          <div className="flex items-center gap-2">
                            <div className="crm-avatar bg-gradient-to-br from-purple-500 to-pink-500">
                              {contact.first_name?.[0]}{contact.last_name?.[0]}
                            </div>
                            <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          </div>
                        </td>
                        <td className="crm-table-cell font-medium">
                          {getAccountName(contact.account_id)}
                        </td>
                        <td className="crm-table-cell text-gray-600">{contact.job_title || '-'}</td>
                        <td className="crm-table-cell text-gray-600">{contact.email}</td>
                        <td className="crm-table-cell text-gray-600">{contact.phone || '-'}</td>
                        <td className="crm-table-cell">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(contact);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(contact);
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
          </PullToRefresh>
        )}
      </BulkOperations>

      {filteredContacts.length === 0 && !isLoading && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No contacts found</h3>
            <p className="text-gray-400 mt-1">Start by adding your first contact</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AccessibleFormField
              label="Account"
              description="Select the account this contact belongs to"
              required={true}
            >
              <Select
                value={formData.account_id}
                onValueChange={(value) => setFormData({...formData, account_id: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an account..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AccessibleFormField>
            {accounts.length === 0 && (
              <p className="text-xs text-orange-600" role="alert">No accounts found. Please create an account first.</p>
            )}

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
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

            <AccessibleFormField
              label="Email"
              description="Primary email address for this contact"
              required={true}
            >
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </AccessibleFormField>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <AccessibleFormField
                label="Phone"
                description="Primary phone number"
              >
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="Mobile"
                description="Mobile phone number"
              >
                <Input
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
              </AccessibleFormField>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <AccessibleFormField
                label="Job Title"
                description="Contact's position or role"
              >
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="Department"
                description="Department or division"
              >
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </AccessibleFormField>
            </div>

            <AccessibleFormField
              label="LinkedIn URL"
              description="Professional LinkedIn profile URL"
            >
              <Input
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/..."
              />
            </AccessibleFormField>

            <div className="grid grid-cols-3 gap-4">
              <AccessibleFormField
                label="Address"
                description="Street address"
                className="col-span-3"
              >
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="City"
                description="City or town"
              >
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="Country"
                description="Country or region"
                className="col-span-2"
              >
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </AccessibleFormField>
            </div>

            <div className="space-y-2">
              <Label>Assignments & Product Lines</Label>
              <AssignmentManager
                assignedUsers={formData.assigned_users}
                productLines={formData.product_lines}
                allUsers={users}
                allProductLines={productLines}
                onUpdate={(assignments) => setFormData({
                  ...formData,
                  assigned_users: assignments.assigned_users,
                  product_lines: assignments.product_lines,
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
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={accounts.length === 0}
              >
                {editingContact ? 'Update' : 'Create'} Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        </div>
      )}
    </>
  );
}
