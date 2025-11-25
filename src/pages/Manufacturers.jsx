
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
  Factory,
  Edit,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Users,
  X,
  Eye,
  ShoppingCart,
  UserPlus
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkOperations from "../components/BulkOperations";
import { format } from "date-fns";

const CONTACT_ROLES = ["Sales", "Finance", "Management", "Operations", "Procurement", "Technical Support", "Other"];

export default function Manufacturers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "", // Required - maps to companyName in backend
    product_line_ids: [], // Optional - maps to productLineIds in backend
    is_active: true, // Optional - maps to isActive in backend, default: true
  });
  const [contactFormData, setContactFormData] = useState({
    manufacturer_id: "",
    first_name: "",
    last_name: "",
    role: "Sales",
    email: "",
    phone: "",
    mobile: "",
    job_title: "",
    is_primary: false,
    notes: "",
  });

  const queryClient = useQueryClient();

  const { data: serializationSettings = [] } = useQuery({
    queryKey: ['serializationSettings'],
    queryFn: () => base44.entities.EntitySerializationSettings.list(),
  });

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list('-created_date'),
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  const { data: manufacturerContacts = [] } = useQuery({
    queryKey: ['manufacturerContacts'],
    queryFn: () => base44.entities.ManufacturerContact.list('-created_date'),
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date'),
  });

  const generateSerialNumber = async () => {
    const setting = serializationSettings.find(s =>
      s.entity_type === 'Manufacturer' &&
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
          serialNumber += component.value || ''; // Default to empty string for separator if not provided
          break;
        case 'custom':
          serialNumber += component.value || '';
          break;
        default:
          break;
      }
    });

    await base44.entities.EntitySerializationSettings.update(setting.id, {
      counter: setting.counter + 1
    });

    return serialNumber;
  };

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Backend only accepts: companyName, productLineIds, isActive
      // Serial number is not part of the backend structure
      return base44.entities.Manufacturer.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      queryClient.invalidateQueries({ queryKey: ['serializationSettings'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Manufacturer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      setShowDialog(false);
      setEditingManufacturer(null);
      resetForm();
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => base44.entities.ManufacturerContact.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturerContacts'] });
      setShowContactDialog(false);
      resetContactForm();
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ManufacturerContact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturerContacts'] });
      setShowContactDialog(false);
      setEditingContact(null);
      resetContactForm();
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id) => base44.entities.ManufacturerContact.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturerContacts'] });
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      product_line_ids: [],
      is_active: true,
    });
  };

  const resetContactForm = () => {
    setContactFormData({
      manufacturer_id: selectedManufacturer?.id || "",
      first_name: "",
      last_name: "",
      role: "Sales",
      email: "",
      phone: "",
      mobile: "",
      job_title: "",
      is_primary: false,
      notes: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingManufacturer) {
      updateMutation.mutate({ id: editingManufacturer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactFormData });
    } else {
      createContactMutation.mutate(contactFormData);
    }
  };

  const handleEdit = (manufacturer) => {
    setEditingManufacturer(manufacturer);
    setFormData({
      company_name: manufacturer.company_name || manufacturer.companyName || "",
      product_line_ids: manufacturer.product_line_ids || manufacturer.productLineIds || [],
      is_active: manufacturer.is_active !== undefined ? manufacturer.is_active : (manufacturer.isActive !== undefined ? manufacturer.isActive : true),
    });
    setShowDialog(true);
  };

  const handleViewDetails = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setShowDetailsDialog(true);
  };

  const handleAddContact = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setEditingContact(null);
    resetContactForm();
    setContactFormData({ ...contactFormData, manufacturer_id: manufacturer.id });
    setShowContactDialog(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setContactFormData({
      manufacturer_id: contact.manufacturer_id,
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      role: contact.role || "Sales",
      email: contact.email || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      job_title: contact.job_title || "",
      is_primary: contact.is_primary || false,
      notes: contact.notes || "",
    });
    setShowContactDialog(true);
  };

  const filteredManufacturers = manufacturers.filter(m =>
    m.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductLineName = (id) => {
    if (!id) return null;
    const pl = productLines.find(p => p.id === id);
    return pl?.name || null;
  };

  const getProductLineNames = (manufacturer) => {
    // Check for product_lines relation first (from backend), then fall back to product_line_ids lookup
    if (manufacturer.product_lines && Array.isArray(manufacturer.product_lines)) {
      return manufacturer.product_lines.map(pl => pl.name || pl);
    }
    if (manufacturer.productLines && Array.isArray(manufacturer.productLines)) {
      return manufacturer.productLines.map(pl => pl.name || pl);
    }
    if (manufacturer.product_line_ids && Array.isArray(manufacturer.product_line_ids)) {
      return manufacturer.product_line_ids
        .map(id => getProductLineName(id))
        .filter(Boolean);
    }
    return [];
  };

  const getManufacturerContacts = (manufacturerId) => {
    return manufacturerContacts.filter(c => c.manufacturer_id === manufacturerId);
  };

  const getManufacturerPOs = (manufacturerId) => {
    return purchaseOrders.filter(po => po.manufacturer_id === manufacturerId);
  };

  const handleProductLineToggle = (plId) => {
    if (formData.product_line_ids.includes(plId)) {
      setFormData({
        ...formData,
        product_line_ids: formData.product_line_ids.filter(id => id !== plId)
      });
    } else {
      setFormData({
        ...formData,
        product_line_ids: [...formData.product_line_ids, plId]
      });
    }
  };

  const roleColors = {
    'Sales': 'bg-blue-100 text-blue-800',
    'Finance': 'bg-green-100 text-green-800',
    'Management': 'bg-purple-100 text-purple-800',
    'Operations': 'bg-orange-100 text-orange-800',
    'Procurement': 'bg-indigo-100 text-indigo-800',
    'Technical Support': 'bg-teal-100 text-teal-800',
    'Other': 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Factory className="w-8 h-8 text-orange-500" />
            Manufacturers & Vendors
          </h1>
          <p className="text-gray-500 mt-1">Manage your suppliers and manufacturers</p>
        </div>
        <Button
          onClick={() => {
            setEditingManufacturer(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manufacturer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500 bg-opacity-20">
                <Factory className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Manufacturers</p>
                <p className="text-2xl font-bold">{manufacturers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-20">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Suppliers</p>
                <p className="text-2xl font-bold">{manufacturers.filter(m => m.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 bg-opacity-20">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Contacts</p>
                <p className="text-2xl font-bold">{manufacturerContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search manufacturers by name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <BulkOperations
        entityName="Manufacturer"
        records={filteredManufacturers}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['manufacturers'] })}
      >
        {({ isSelected }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManufacturers.map((manufacturer) => {
              const contacts = getManufacturerContacts(manufacturer.id);
              const pos = getManufacturerPOs(manufacturer.id);

              return (
                <Card
                  key={manufacturer.id}
                  className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
                    isSelected(manufacturer.id) ? 'ring-2 ring-orange-500' : ''
                  }`}
                  onClick={() => handleViewDetails(manufacturer)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {(manufacturer.company_name || manufacturer.companyName)?.[0]}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {manufacturer.company_name || manufacturer.companyName}
                          </CardTitle>
                          {manufacturer.serial_number && (
                            <Badge variant="outline" className="mt-1 text-xs font-mono">
                              {manufacturer.serial_number}
                            </Badge>
                          )}
                          {manufacturer.contact_person && (
                            <p className="text-sm text-gray-500 mt-1">{manufacturer.contact_person}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleViewDetails(manufacturer); }} // Added e.stopPropagation()
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); handleEdit(manufacturer); }} // Added e.stopPropagation()
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {manufacturer.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                      {manufacturer.rating > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                          {manufacturer.rating.toFixed(1)}
                        </Badge>
                      )}
                      {contacts.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Users className="w-3 h-3 mr-1" />
                          {contacts.length} contacts
                        </Badge>
                      )}
                      {pos.length > 0 && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {pos.length} POs
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {manufacturer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{manufacturer.email}</span>
                      </div>
                    )}
                    {manufacturer.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{manufacturer.phone}</span>
                      </div>
                    )}
                    {(manufacturer.city || manufacturer.country) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{[manufacturer.city, manufacturer.country].filter(Boolean).join(', ')}</span>
                      </div>
                    )}

                    {(() => {
                      const productLineNames = getProductLineNames(manufacturer);
                      return productLineNames.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500 mb-1">Product Lines:</p>
                          <div className="flex flex-wrap gap-1">
                            {productLineNames.slice(0, 2).map((name, index) => (
                              <Badge key={index} className="bg-indigo-100 text-indigo-800 text-xs">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {name}
                              </Badge>
                            ))}
                            {productLineNames.length > 2 && (
                              <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                                +{productLineNames.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => { e.stopPropagation(); handleAddContact(manufacturer); }} // Added e.stopPropagation()
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </BulkOperations>

      {filteredManufacturers.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Factory className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No manufacturers found</h3>
            <p className="text-gray-400 mt-1">Start building your supplier network</p>
          </CardContent>
        </Card>
      )}

      {/* Manufacturer Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingManufacturer ? 'Edit Manufacturer' : 'Add New Manufacturer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Product Lines (Optional)</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                {productLines.length === 0 ? (
                  <p className="text-sm text-gray-500">No product lines available. Please create product lines first.</p>
                ) : (
                  productLines.map((pl) => (
                    <div key={pl.id} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        id={`pl-${pl.id}`}
                        checked={formData.product_line_ids.includes(pl.id)}
                        onChange={() => handleProductLineToggle(pl.id)}
                        className="w-4 h-4 text-orange-600 rounded"
                      />
                      <Label htmlFor={`pl-${pl.id}`} className="cursor-pointer">
                        {pl.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active Manufacturer</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-600 to-amber-600">
                {editingManufacturer ? 'Update' : 'Create'} Manufacturer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manufacturer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-6 h-6 text-orange-500" />
              {selectedManufacturer?.company_name || selectedManufacturer?.companyName}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="contacts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="pos">Purchase Orders</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Contact Persons</h3>
                <Button size="sm" onClick={() => handleAddContact(selectedManufacturer)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-3">
                {getManufacturerContacts(selectedManufacturer?.id).map((contact) => (
                  <Card key={contact.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {contact.first_name} {contact.last_name}
                            </h4>
                            {contact.is_primary && (
                              <Badge className="bg-green-100 text-green-800">Primary</Badge>
                            )}
                            <Badge className={roleColors[contact.role]}>
                              {contact.role}
                            </Badge>
                          </div>
                          {contact.job_title && (
                            <p className="text-sm text-gray-600 mb-2">{contact.job_title}</p>
                          )}
                          <div className="space-y-1 text-sm">
                            {contact.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getManufacturerContacts(selectedManufacturer?.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No contacts added yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pos" className="space-y-4">
              <h3 className="text-lg font-semibold">Purchase Order History</h3>
              <div className="space-y-3">
                {getManufacturerPOs(selectedManufacturer?.id).map((po) => (
                  <Card key={po.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{po.po_number}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Order Date: {format(new Date(po.order_date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total: ${po.total_amount?.toLocaleString() || 0}
                          </p>
                        </div>
                        <Badge className={
                          po.status === 'Received' ? 'bg-green-100 text-green-800' :
                          po.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {po.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {getManufacturerPOs(selectedManufacturer?.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No purchase orders yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{selectedManufacturer?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="font-medium">{selectedManufacturer?.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Terms</Label>
                  <p className="font-medium">{selectedManufacturer?.payment_terms}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Currency</Label>
                  <p className="font-medium">{selectedManufacturer?.currency}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Lead Time</Label>
                  <p className="font-medium">{selectedManufacturer?.delivery_lead_time_days} days</p>
                </div>
                <div>
                  <Label className="text-gray-500">Min Order Value</Label>
                  <p className="font-medium">${selectedManufacturer?.minimum_order_value}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500">Address</Label>
                  <p className="font-medium">
                    {[selectedManufacturer?.address, selectedManufacturer?.city, selectedManufacturer?.country]
                      .filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
                {selectedManufacturer?.notes && (
                  <div className="col-span-2">
                    <Label className="text-gray-500">Notes</Label>
                    <p className="font-medium">{selectedManufacturer.notes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Contact Form Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={contactFormData.first_name}
                  onChange={(e) => setContactFormData({...contactFormData, first_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={contactFormData.last_name}
                  onChange={(e) => setContactFormData({...contactFormData, last_name: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={contactFormData.role}
                onValueChange={(value) => setContactFormData({...contactFormData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={contactFormData.job_title}
                onChange={(e) => setContactFormData({...contactFormData, job_title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email *</Label>
              <Input
                id="contact_email"
                type="email"
                value={contactFormData.email}
                onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  value={contactFormData.phone}
                  onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={contactFormData.mobile}
                  onChange={(e) => setContactFormData({...contactFormData, mobile: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_primary"
                checked={contactFormData.is_primary}
                onCheckedChange={(checked) => setContactFormData({...contactFormData, is_primary: checked})}
              />
              <Label htmlFor="is_primary">Primary Contact</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_notes">Notes</Label>
              <Textarea
                id="contact_notes"
                value={contactFormData.notes}
                onChange={(e) => setContactFormData({...contactFormData, notes: e.target.value})}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowContactDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {editingContact ? 'Update' : 'Add'} Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
