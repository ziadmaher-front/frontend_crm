
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
  Users,
  Smartphone,
  Linkedin,
  Eye,
  LayoutGrid, // New import
  List,       // New import
  Table,      // New import
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

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("grid"); // New state for view
  const [showDialog, setShowDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
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

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date'),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
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
      return base44.entities.Contact.create({
        ...data,
        serial_number: serialNumber
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['serializationSettings'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setShowDialog(false);
      setEditingContact(null);
      resetForm();
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

  const filteredContacts = contacts.filter(contact =>
    contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-500" />
            Contacts
          </h1>
          <p className="text-gray-600 mt-1">Manage your business contacts and relationships</p>
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
              setEditingContact(null);
              resetForm();
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Contact
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search contacts by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <BulkOperations
        entityName="Contact"
        records={filteredContacts}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['contacts'] })}
      >
        {({ selectedRecords, isSelected, handleSelectRecord }) => (
          <>
            {view === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                      isSelected(contact.id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => handleViewDetails(contact)}
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
                  </Card>
                ))}
              </div>
            )}

            {view === "list" && (
              <div className="space-y-2">
                {filteredContacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className={`border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      isSelected(contact.id) ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => handleViewDetails(contact)}
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredContacts.map((contact) => (
                          <tr
                            key={contact.id}
                            className={`hover:bg-gray-50 cursor-pointer ${
                              isSelected(contact.id) ? 'bg-purple-50' : ''
                            }`}
                            onClick={() => handleViewDetails(contact)}
                          >
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected(contact.id)}
                                onChange={() => handleSelectRecord(contact.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-purple-600 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {contact.serial_number || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                                </div>
                                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                              {getAccountName(contact.account_id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.job_title || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contact.phone || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                </CardContent>
              </Card>
            )}
          </>
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
              <Label htmlFor="account_id">Account *</Label>
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
              {accounts.length === 0 && (
                <p className="text-xs text-orange-600">No accounts found. Please create an account first.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>

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
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                />
              </div>
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
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-3">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
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
  );
}
