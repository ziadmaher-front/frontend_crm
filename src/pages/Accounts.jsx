
import React, { useState, useEffect } from "react";
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
import { createPageUrl } from "@/utils";

export default function Accounts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("grid");
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
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

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch =
      account.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || account.account_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const typeColors = {
    'Customer': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Prospect': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Partner': 'bg-purple-100 text-purple-700 border-purple-200',
    'Competitor': 'bg-gray-100 text-gray-700 border-gray-200',
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
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-8 h-8 text-emerald-500" />
            Accounts
          </h1>
          <p className="text-gray-600 mt-1">Manage your company accounts and organizations</p>
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
          <Button
            onClick={() => {
              setEditingAccount(null);
              resetForm();
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Account
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search accounts by name, industry, or serial number..."
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
                <SelectItem value="Customer">Customer</SelectItem>
                <SelectItem value="Prospect">Prospect</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Competitor">Competitor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <BulkOperations
        entityName="Account"
        records={filteredAccounts}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['accounts'] })}
      >
        {({ selectedRecords, isSelected, handleSelectRecord }) => (
          <>
            {view === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                      isSelected(account.id) ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => handleViewDetails(account)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected(account.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectRecord(account.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-3 w-4 h-4 text-emerald-600 rounded"
                          />
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {account.company_name?.[0]}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight">
                              {account.company_name}
                            </CardTitle>
                            {account.serial_number && (
                              <Badge variant="outline" className="mt-1 text-xs font-mono">
                                {account.serial_number}
                              </Badge>
                            )}
                            {account.industry && (
                              <p className="text-sm text-gray-500 mt-1">{account.industry}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(account);
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
                              handleViewDetails(account);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge className={`${typeColors[account.account_type]} border`}>
                          {account.account_type}
                        </Badge>
                        {account.account_status === 'Active' && (
                          <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                            Active
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {account.website && (
                        <a
                          href={account.website.startsWith('http') ? account.website : `https://${account.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4" />
                          <span className="truncate">Visit Website</span>
                        </a>
                      )}
                      {account.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{account.email}</span>
                        </div>
                      )}
                      {account.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{account.phone}</span>
                        </div>
                      )}
                      {account.employee_count && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{account.employee_count} employees</span>
                        </div>
                      )}

                      {(account.assigned_users?.length > 0 || account.product_lines?.length > 0) && (
                        <div className="pt-2 border-t space-y-2">
                          {account.assigned_users?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Assigned To:</p>
                              <div className="flex flex-wrap gap-1">
                                {account.assigned_users.slice(0, 2).map((email) => (
                                  <Badge key={email} className="text-xs bg-gray-100 text-gray-700">
                                    {getUserName(email).split(' ')[0]}
                                  </Badge>
                                ))}
                                {account.assigned_users.length > 2 && (
                                  <Badge className="text-xs bg-gray-100 text-gray-700">
                                    +{account.assigned_users.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {account.product_lines?.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Product Lines:</p>
                              <div className="flex flex-wrap gap-1">
                                {account.product_lines.slice(0, 2).map((id) => (
                                  <Badge key={id} className="bg-indigo-100 text-indigo-700 text-xs border-indigo-200">
                                    {getProductLineName(id)}
                                  </Badge>
                                ))}
                                {account.product_lines.length > 2 && (
                                  <Badge className="bg-indigo-100 text-indigo-700 text-xs border-indigo-200">
                                    +{account.product_lines.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {account.annual_revenue > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">Annual Revenue</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            ${account.annual_revenue.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {view === "list" && (
              <div className="space-y-2">
                {filteredAccounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      isSelected(account.id) ? 'ring-2 ring-emerald-500' : ''
                    }`}
                    onClick={() => handleViewDetails(account)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected(account.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRecord(account.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {account.company_name?.[0]}
                            </div>
                            <div>
                              <p className="font-semibold">{account.company_name}</p>
                              {account.serial_number && (
                                <p className="text-xs text-gray-500 font-mono">{account.serial_number}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{account.industry}</p>
                            <p className="text-xs text-gray-500">{account.employee_count}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">{account.email || '-'}</p>
                            <p className="text-xs text-gray-500">{account.phone || '-'}</p>
                          </div>
                          <div>
                            <Badge className={`${typeColors[account.account_type]}`}>
                              {account.account_type}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            {account.annual_revenue > 0 && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-emerald-600">
                                  ${(account.annual_revenue / 1000).toFixed(0)}K
                                </p>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(account);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(account);
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
              <Card className="border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedRecords.length === filteredAccounts.length && filteredAccounts.length > 0}
                              onChange={() => {
                                if (selectedRecords.length === filteredAccounts.length) {
                                  selectedRecords.forEach(id => handleSelectRecord(id));
                                } else {
                                  filteredAccounts.filter(a => !isSelected(a.id)).forEach(a => handleSelectRecord(a.id));
                                }
                              }}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAccounts.map((account) => (
                          <tr
                            key={account.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              isSelected(account.id) ? 'bg-emerald-50' : ''
                            }`}
                            onClick={() => handleViewDetails(account)}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected(account.id)}
                                onChange={() => handleSelectRecord(account.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {account.serial_number || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                  {account.company_name?.[0]}
                                </div>
                                <p className="font-medium">{account.company_name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.industry}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${typeColors[account.account_type]}`}>
                                {account.account_type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.email || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.phone || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                              {account.annual_revenue > 0 ? `$${account.annual_revenue.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(account);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(account);
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
                </CardContent>
              </Card>
            )}
          </>
        )}
      </BulkOperations>

      {filteredAccounts.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No accounts found</h3>
            <p className="text-gray-400 mt-1">Start by adding your first account</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_count">Employee Count</Label>
                <Select value={formData.employee_count} onValueChange={(value) => setFormData({...formData, employee_count: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="annual_revenue">Annual Revenue ($)</Label>
                <Input
                  id="annual_revenue"
                  type="number"
                  value={formData.annual_revenue}
                  onChange={(e) => setFormData({...formData, annual_revenue: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Billing Address</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyBillingToShipping}
                  className="text-xs"
                >
                  Copy to Shipping →
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="billing_address">Street Address</Label>
                  <Input
                    id="billing_address"
                    value={formData.billing_address}
                    onChange={(e) => setFormData({...formData, billing_address: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_city">City</Label>
                  <Input
                    id="billing_city"
                    value={formData.billing_city}
                    onChange={(e) => setFormData({...formData, billing_city: e.target.value})}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="billing_country">Country</Label>
                  <Input
                    id="billing_country"
                    value={formData.billing_country}
                    onChange={(e) => setFormData({...formData, billing_country: e.target.value})}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyShippingToBilling}
                  className="text-xs"
                >
                  ← Copy to Billing
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-3">
                  <Label htmlFor="shipping_address">Street Address</Label>
                  <Input
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_city">City</Label>
                  <Input
                    id="shipping_city"
                    value={formData.shipping_city}
                    onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="shipping_country">Country</Label>
                  <Input
                    id="shipping_country"
                    value={formData.shipping_country}
                    onChange={(e) => setFormData({...formData, shipping_country: e.target.value})}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="account_type">Account Type</Label>
                <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Competitor">Competitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_status">Status</Label>
                <Select value={formData.account_status} onValueChange={(value) => setFormData({...formData, account_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                {editingAccount ? 'Update' : 'Create'} Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
