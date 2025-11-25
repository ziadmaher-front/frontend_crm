
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
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/loading-states";
import PhoneInput from "@/components/PhoneInput";

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile_phone: "",
    accountId: "", // UUID linking to Account, not account_name string
    department: "",
    territory: "",
    assistant_name: "",
    currency_code: "",
    mailing_street: "",
    mailing_city: "",
    mailing_state: "",
    mailing_zip: "",
    mailing_country: "",
    ownerId: "", // UUID for owner
  });

  const queryClient = useQueryClient();

  const { data: serializationSettings = [] } = useQuery({
    queryKey: ['serializationSettings'],
    queryFn: () => base44.entities.EntitySerializationSettings.list(),
  });

  const [currentUser, setCurrentUser] = useState(null);

  // Load view preference
  useEffect(() => {
    base44.auth.me()
      .then(user => {
        if (!user) {
          // Silently handle missing user data - no need to warn as it's expected
          // This is normal if the /auth/me endpoint returns 404
          return;
        }
        setCurrentUser(user);
        if (user?.ui_preferences?.contacts_view) {
          setView(user.ui_preferences.contacts_view);
        }
      })
      .catch(error => {
        // Silently handle errors - 404 is expected if endpoint doesn't exist
        // Only log if it's not a 404 error
        if (!error.message?.includes('404') && !error.message?.includes('not found')) {
          console.warn('Failed to fetch user data:', error);
        }
        // Don't crash the app if auth/me fails
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
      title: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      mobile_phone: "",
      accountId: "",
      department: "",
      territory: "",
      assistant_name: "",
      currency_code: "",
      mailing_street: "",
      mailing_city: "",
      mailing_state: "",
      mailing_zip: "",
      mailing_country: "",
      ownerId: "",
    });
    setEditingContact(null);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert empty strings to undefined for accountId and ownerId
    const submitData = {
      ...formData,
      accountId: formData.accountId || undefined,
      ownerId: formData.ownerId || undefined,
    };
    
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      title: contact.title || "",
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      mobile_phone: contact.mobile_phone || contact.mobile || "",
      accountId: contact.accountId || contact.account_id || contact.account?.id || "",
      department: contact.department || "",
      territory: contact.territory || "",
      assistant_name: contact.assistant_name || contact.assistant || "",
      currency_code: contact.currency_code || contact.currency || "",
      mailing_street: contact.mailing_street || contact.address || contact.street || "",
      mailing_city: contact.mailing_city || contact.city || "",
      mailing_state: contact.mailing_state || contact.state || "",
      mailing_zip: contact.mailing_zip || contact.zip || contact.postal_code || "",
      mailing_country: contact.mailing_country || contact.country || "",
      ownerId: contact.ownerId || contact.owner_id || contact.owner?.id || "",
    });
    setShowDialog(true);
  };

  const handleViewDetails = (contact) => {
    navigate(`/contacts/${contact.id}`);
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
    setFilterAccount("all");
    setFilterOwner("all");
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
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Select
                value={formData.title || ""}
                onValueChange={(value) => setFormData({...formData, title: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select title (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Mrs">Mrs</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                  <SelectItem value="Prof">Prof</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <AccessibleFormField
                label="First Name"
                required={true}
              >
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </AccessibleFormField>
              <AccessibleFormField
                label="Last Name"
                required={true}
              >
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </AccessibleFormField>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <AccessibleFormField
                label="Email"
                required={true}
              >
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </AccessibleFormField>
              <PhoneInput
                label="Mobile Phone"
                value={formData.mobile_phone}
                onChange={(value) => setFormData({...formData, mobile_phone: value})}
                required={true}
                placeholder="Enter mobile phone number"
                id="mobile_phone"
                name="mobile_phone"
              />
            </div>

            <div className="space-y-2">
              <PhoneInput
                label="Phone (Secondary)"
                value={formData.phone}
                onChange={(value) => setFormData({...formData, phone: value})}
                required={false}
                placeholder="Enter secondary phone number"
                id="phone"
                name="phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Account (Optional)</Label>
              <Select
                value={formData.accountId || ""}
                onValueChange={(value) => {
                  if (value !== "__none__") {
                    setFormData({...formData, accountId: value});
                  } else {
                    setFormData({...formData, accountId: ""});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name || account.company_name || 'Unnamed Account'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner (Optional)</Label>
              <Select
                value={formData.ownerId || ""}
                onValueChange={(value) => {
                  if (value !== "__none__") {
                    setFormData({...formData, ownerId: value});
                  } else {
                    setFormData({...formData, ownerId: ""});
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={usersLoading ? "Loading users..." : "Select owner..."} />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <SelectItem value="__loading__" disabled>Loading users...</SelectItem>
                  ) : usersError ? (
                    <SelectItem value="__error__" disabled>Error loading users</SelectItem>
                  ) : Array.isArray(users) && users.length > 0 ? (
                    <>
                      <SelectItem value="__none__">None</SelectItem>
                      {users
                        .filter(user => user?.id)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email || user.id || "Unknown User"}
                            {user.email ? ` (${user.email})` : ''}
                          </SelectItem>
                        ))}
                    </>
                  ) : (
                    <SelectItem value="__disabled__" disabled>No users available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department || ""}
                  onValueChange={(value) => setFormData({...formData, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CEO">CEO</SelectItem>
                    <SelectItem value="CTO">CTO</SelectItem>
                    <SelectItem value="CFO">CFO</SelectItem>
                    <SelectItem value="CMO">CMO</SelectItem>
                    <SelectItem value="CHRO">CHRO</SelectItem>
                    <SelectItem value="CIO">CIO</SelectItem>
                    <SelectItem value="CRO">CRO</SelectItem>
                    <SelectItem value="CSO">CSO</SelectItem>
                    <SelectItem value="CPO">CPO</SelectItem>
                    <SelectItem value="CSO">CSO</SelectItem>
                    <SelectItem value="CSO">CSO</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Research & Development">Research & Development</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Business Development">Business Development</SelectItem>
                    <SelectItem value="Product Management">Product Management</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="territory">Territory</Label>
                <Input
                  id="territory"
                  value={formData.territory}
                  onChange={(e) => setFormData({...formData, territory: e.target.value})}
                  placeholder="Enter territory"
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="assistant_name">Assistant Name</Label>
                <Input
                  id="assistant_name"
                  value={formData.assistant_name}
                  onChange={(e) => setFormData({...formData, assistant_name: e.target.value})}
                  placeholder="Enter assistant name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency_code">Currency Code</Label>
                <Input
                  id="currency_code"
                  value={formData.currency_code}
                  onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
                  placeholder="e.g., USD, EUR"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mailing_street">Mailing Street</Label>
              <Input
                id="mailing_street"
                value={formData.mailing_street}
                onChange={(e) => setFormData({...formData, mailing_street: e.target.value})}
                placeholder="Enter street address"
              />
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="mailing_city">Mailing City</Label>
                <Input
                  id="mailing_city"
                  value={formData.mailing_city}
                  onChange={(e) => setFormData({...formData, mailing_city: e.target.value})}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_state">Mailing State</Label>
                <Input
                  id="mailing_state"
                  value={formData.mailing_state}
                  onChange={(e) => setFormData({...formData, mailing_state: e.target.value})}
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isMobile ? 'grid-cols-1' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="mailing_zip">Mailing Zip</Label>
                <Input
                  id="mailing_zip"
                  value={formData.mailing_zip}
                  onChange={(e) => setFormData({...formData, mailing_zip: e.target.value})}
                  placeholder="Enter zip code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailing_country">Mailing Country</Label>
                <Input
                  id="mailing_country"
                  value={formData.mailing_country}
                  onChange={(e) => setFormData({...formData, mailing_country: e.target.value})}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
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
