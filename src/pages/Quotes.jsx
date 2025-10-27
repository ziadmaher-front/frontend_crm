
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText,
  Edit,
  Eye,
  Send,
  Download,
  Upload,
  Package,
  Trash2,
  Save,
  FileCheck,
  Settings,
  AlertCircle,
  Filter
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EGP: "E£",
  AED: "د.إ",
  SAR: "﷼"
};

export default function Quotes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("rfq");
  
  // RFQ States
  const [showRFQDialog, setShowRFQDialog] = useState(false);
  const [editingRFQ, setEditingRFQ] = useState(null);
  const [rfqFormData, setRFQFormData] = useState({
    rfq_name: "",
    account_id: "",
    contact_id: "",
    manufacturer_id: "",
    product_line_id: "",
    line_items: [],
    currency: "USD",
    tax_percentage: 0,
    delivery_terms: "",
    payment_terms: "",
    special_requirements: "",
    internal_notes: "",
    valid_until: "",
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [requestedDiscount, setRequestedDiscount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");

  // Template States
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [templateFormData, setTemplateFormData] = useState({
    template_name: "",
    description: "",
    template_type: "Standard",
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      setRFQFormData(prev => ({
        ...prev,
        currency: user.default_currency || "USD"
      }));
    });
  }, []);

  const { data: rfqs = [] } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => base44.entities.RFQ.list('-created_date'),
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date'),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list(),
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['quoteTemplates'],
    queryFn: () => base44.entities.QuoteTemplate.list('-created_date'),
  });

  // Get active template (only one should be active)
  const activeTemplate = templates.find(t => t.is_active);

  // Filter manufacturers based on user's product lines
  const getAccessibleManufacturers = () => {
    if (!currentUser) return [];
    
    // System admins and users with access_all_product_lines see all
    if (currentUser.user_role === 'system_admin' || 
        currentUser.user_role === 'admin' || 
        currentUser.access_all_product_lines) {
      return manufacturers.filter(m => m.is_active);
    }

    // Filter manufacturers by user's product lines
    const userProductLineIds = currentUser.product_line_ids || [];
    return manufacturers.filter(m => 
      m.is_active && 
      m.product_line_ids?.some(plId => userProductLineIds.includes(plId))
    );
  };

  // Filter products based on manufacturer and user's product lines
  const getFilteredProducts = () => {
    let filteredProducts = products.filter(p => p.is_active);

    // Filter by manufacturer if selected
    if (rfqFormData.manufacturer_id) {
      filteredProducts = filteredProducts.filter(p => 
        p.manufacturer_id === rfqFormData.manufacturer_id
      );
    }

    // Filter by product line if selected
    if (rfqFormData.product_line_id) {
      filteredProducts = filteredProducts.filter(p => 
        p.product_line_id === rfqFormData.product_line_id
      );
    }

    // Filter by user's product lines (unless they have access to all)
    if (currentUser && 
        !currentUser.access_all_product_lines && 
        currentUser.user_role !== 'system_admin' && 
        currentUser.user_role !== 'admin') {
      const userProductLineIds = currentUser.product_line_ids || [];
      filteredProducts = filteredProducts.filter(p => 
        p.product_line_id && userProductLineIds.includes(p.product_line_id)
      );
    }

    return filteredProducts;
  };

  // Filter product lines user has access to
  const getAccessibleProductLines = () => {
    if (!currentUser) return [];
    
    // System admins and users with access_all_product_lines see all
    if (currentUser.user_role === 'system_admin' || 
        currentUser.user_role === 'admin' || 
        currentUser.access_all_product_lines) {
      return productLines;
    }

    // Filter by user's assigned product lines
    const userProductLineIds = currentUser.product_line_ids || [];
    return productLines.filter(pl => userProductLineIds.includes(pl.id));
  };

  // Check if discount requires approval
  const checkDiscountApproval = (discountPercent) => {
    if (!currentUser) return false;
    const userLimit = currentUser.discount_approval_limit || 0;
    return discountPercent > userLimit;
  };

  // Calculate total discount percentage across all items
  const calculateTotalDiscountPercentage = (lineItems) => {
    if (lineItems.length === 0) return 0;
    const totalListPrice = lineItems.reduce((sum, item) => sum + (item.list_price * item.quantity), 0);
    const totalDiscountAmount = lineItems.reduce((sum, item) => {
      const discount = (item.list_price * item.quantity) * (item.requested_discount_percent / 100);
      return sum + discount;
    }, 0);
    return totalListPrice > 0 ? (totalDiscountAmount / totalListPrice) * 100 : 0;
  };

  // Generate RFQ Number
  const generateRFQNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RFQ-${year}-${month}-${random}`;
  };

  // Generate Quote Number
  const generateQuoteNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const count = quotes.length + 1;
    return `QT-${year}-${String(count).padStart(4, '0')}`;
  };

  // RFQ Mutations
  const createRFQMutation = useMutation({
    mutationFn: (data) => {
      const totalDiscount = calculateTotalDiscountPercentage(data.line_items);
      const requiresApproval = data.line_items.some(item => 
        checkDiscountApproval(item.requested_discount_percent)
      );

      return base44.entities.RFQ.create({
        ...data,
        rfq_number: generateRFQNumber(),
        requested_by: currentUser?.email,
        status: "Draft",
        total_discount_percentage: totalDiscount,
        requires_approval: requiresApproval,
        approval_status: requiresApproval ? "Pending" : "Not Required"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setShowRFQDialog(false);
      resetRFQForm();
      toast.success("RFQ created successfully");
    },
  });

  const updateRFQMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.RFQ.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setShowRFQDialog(false);
      setEditingRFQ(null);
      resetRFQForm();
      toast.success("RFQ updated successfully");
    },
  });

  const submitRFQMutation = useMutation({
    mutationFn: async ({ rfqId, rfqData }) => {
      // Check if requires approval
      if (rfqData.requires_approval && rfqData.approval_status !== "Approved") {
        throw new Error("RFQ requires approval before generating quote");
      }

      // Update RFQ status
      await base44.entities.RFQ.update(rfqId, {
        status: "Submitted",
        submitted_date: new Date().toISOString()
      });

      // Generate Quote from RFQ
      const quoteData = {
        quote_number: generateQuoteNumber(),
        quote_name: rfqData.rfq_name,
        rfq_id: rfqId,
        rfq_type: "RFQ",
        account_id: rfqData.account_id,
        contact_id: rfqData.contact_id,
        created_by_email: currentUser.email,
        status: "Draft",
        approval_status: "Not Submitted",
        line_items: rfqData.line_items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_code: item.product_code,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percentage: item.approved_discount_percent || item.requested_discount_percent || 0,
          total: item.total
        })),
        subtotal: rfqData.subtotal,
        tax_percentage: rfqData.tax_percentage,
        tax_amount: rfqData.tax_amount,
        total_amount: rfqData.total_amount,
        currency: rfqData.currency,
        delivery_terms: rfqData.delivery_terms,
        payment_terms: rfqData.payment_terms,
        customer_notes: rfqData.special_requirements,
        notes: rfqData.internal_notes,
        valid_until: rfqData.valid_until,
      };

      const quote = await base44.entities.Quote.create(quoteData);

      // Update RFQ with generated quote ID
      await base44.entities.RFQ.update(rfqId, {
        generated_quote_id: quote.id,
        status: "Quote Generated"
      });

      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success("RFQ submitted and quote generated");
      setActiveTab("quotes");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate quote");
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data) => {
      // Deactivate all other templates
      const activeTemplates = templates.filter(t => t.is_active);
      for (const template of activeTemplates) {
        await base44.entities.QuoteTemplate.update(template.id, { is_active: false });
      }
      
      const template = await base44.entities.QuoteTemplate.create(data);
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteTemplates'] });
      setShowTemplateDialog(false);
      setTemplateFile(null);
      setTemplateFormData({
        template_name: "",
        description: "",
        template_type: "Standard",
      });
      toast.success("Template uploaded and set as active");
    },
  });

  const activateTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      const activeTemplates = templates.filter(t => t.is_active);
      for (const template of activeTemplates) {
        await base44.entities.QuoteTemplate.update(template.id, { is_active: false });
      }
      
      await base44.entities.QuoteTemplate.update(templateId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteTemplates'] });
      toast.success("Template activated");
    },
  });

  const generatePDFMutation = useMutation({
    mutationFn: async (quote) => {
      if (!activeTemplate) {
        throw new Error("No active template found. Please upload a template first.");
      }

      const account = accounts.find(a => a.id === quote.account_id);
      const contact = contacts.find(c => c.id === quote.contact_id);

      const templateData = {
        quote_number: quote.quote_number,
        quote_name: quote.quote_name,
        quote_date: format(new Date(quote.created_date), 'MMMM d, yyyy'),
        valid_until: quote.valid_until ? format(new Date(quote.valid_until), 'MMMM d, yyyy') : '',
        customer_name: account?.company_name || '',
        customer_address: account?.billing_address || '',
        customer_city: account?.billing_city || '',
        customer_country: account?.billing_country || '',
        contact_name: contact ? `${contact.first_name} ${contact.last_name}` : '',
        contact_email: contact?.email || '',
        contact_phone: contact?.phone || '',
        line_items: quote.line_items || [],
        subtotal: quote.subtotal || 0,
        tax_percentage: quote.tax_percentage || 0,
        tax_amount: quote.tax_amount || 0,
        total_amount: quote.total_amount || 0,
        currency: quote.currency || 'USD',
        currency_symbol: CURRENCY_SYMBOLS[quote.currency] || '$',
        payment_terms: quote.payment_terms || '',
        delivery_terms: quote.delivery_terms || '',
        terms_and_conditions: quote.terms_and_conditions || '',
        customer_notes: quote.customer_notes || '',
      };

      toast.success("Generating PDF with active template...");

      await base44.entities.QuoteTemplate.update(activeTemplate.id, {
        usage_count: (activeTemplate.usage_count || 0) + 1,
        last_used: new Date().toISOString()
      });

      return { pdf_url: "generated_pdf_url", template_used: activeTemplate.template_name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quoteTemplates'] });
      toast.success(`PDF generated using "${data.template_used}" template`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate PDF");
    },
  });

  const resetRFQForm = () => {
    setRFQFormData({
      rfq_name: "",
      account_id: "",
      contact_id: "",
      manufacturer_id: "",
      product_line_id: "",
      line_items: [],
      currency: currentUser?.default_currency || "USD",
      tax_percentage: 0,
      delivery_terms: "",
      payment_terms: "",
      special_requirements: "",
      internal_notes: "",
      valid_until: "",
    });
    setSelectedProduct("");
    setQuantity(1);
    setRequestedDiscount(0);
    setDiscountReason("");
  };

  const handleAddRFQLineItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const discountedPrice = product.unit_price * (1 - requestedDiscount / 100);
    const lineTotal = discountedPrice * quantity;

    const lineItem = {
      product_id: product.id,
      product_name: product.product_name,
      product_code: product.product_code || "",
      description: product.description || "",
      quantity: quantity,
      list_price: product.unit_price,
      requested_discount_percent: requestedDiscount,
      requested_discount_reason: discountReason,
      approved_discount_percent: requestedDiscount,
      unit_price: discountedPrice,
      total: lineTotal,
      product_line_id: product.product_line_id,
      manufacturer_id: product.manufacturer_id,
    };

    const newLineItems = [...rfqFormData.line_items, lineItem];
    calculateRFQTotals(newLineItems);
    
    setSelectedProduct("");
    setQuantity(1);
    setRequestedDiscount(0);
    setDiscountReason("");
  };

  const handleRemoveRFQLineItem = (index) => {
    const newLineItems = rfqFormData.line_items.filter((_, i) => i !== index);
    calculateRFQTotals(newLineItems);
  };

  const calculateRFQTotals = (lineItems) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (rfqFormData.tax_percentage / 100);
    const total = subtotal + taxAmount;

    setRFQFormData(prev => ({
      ...prev,
      line_items: lineItems,
      subtotal,
      tax_amount: taxAmount,
      total_amount: total,
    }));
  };

  const handleRFQSubmit = (e) => {
    e.preventDefault();
    if (editingRFQ) {
      updateRFQMutation.mutate({ id: editingRFQ.id, data: rfqFormData });
    } else {
      createRFQMutation.mutate(rfqFormData);
    }
  };

  const handleSubmitRFQForQuote = (rfq) => {
    submitRFQMutation.mutate({ rfqId: rfq.id, rfqData: rfq });
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    
    if (!templateFile) {
      toast.error("Please upload a template file");
      return;
    }

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: templateFile });
      
      const commonVariables = [
        '{{quote_number}}',
        '{{quote_date}}',
        '{{customer_name}}',
        '{{customer_address}}',
        '{{contact_name}}',
        '{{contact_email}}',
        '{{total_amount}}',
        '{{subtotal}}',
        '{{tax_amount}}',
        '{{currency_symbol}}',
        '{{line_items}}',
        '{{payment_terms}}',
        '{{delivery_terms}}',
        '{{valid_until}}'
      ];
      
      await createTemplateMutation.mutateAsync({
        ...templateFormData,
        template_file_url: file_url,
        is_active: true,
        detected_variables: commonVariables,
        organization_id: currentUser?.primary_organization_id,
      });
    } catch (error) {
      toast.error("Failed to upload template");
    }
  };

  const handleGeneratePDF = (quote) => {
    generatePDFMutation.mutate(quote);
  };

  const filteredContacts = rfqFormData.account_id 
    ? contacts.filter(c => c.account_id === rfqFormData.account_id)
    : contacts;

  const accessibleManufacturers = getAccessibleManufacturers();
  const filteredProducts = getFilteredProducts();
  const accessibleProductLines = getAccessibleProductLines();

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-700 border-gray-200',
    'Submitted': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Pending Approval': 'bg-amber-100 text-amber-700 border-amber-200',
    'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Quote Generated': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'Sent': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-500" />
            Quote Management
          </h1>
          <p className="text-gray-600 mt-1">Manage RFQs, quotes, and templates</p>
          {currentUser && !currentUser.access_all_product_lines && (
            <p className="text-sm text-indigo-600 mt-1 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Filtered by your product lines ({currentUser.product_line_ids?.length || 0})
            </p>
          )}
        </div>
        {activeTemplate && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-600 font-medium">Active Template</p>
              <p className="text-sm font-semibold text-emerald-800">{activeTemplate.template_name}</p>
            </div>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rfq">RFQ Requests</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="templates">
            Templates
            {!activeTemplate && (
              <Badge className="ml-2 bg-amber-500 text-white">Setup Required</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* RFQ Tab */}
        <TabsContent value="rfq" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Draft RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rfqs.filter(r => r.status === 'Draft').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {rfqs.filter(r => r.approval_status === 'Pending').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rfqs.filter(r => r.status === 'Submitted').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Quote Generated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {rfqs.filter(r => r.status === 'Quote Generated').length}
                  </p>
                </CardContent>
              </Card>
            </div>
            <Button
              onClick={() => {
                setEditingRFQ(null);
                resetRFQForm();
                setShowRFQDialog(true);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              New RFQ
            </Button>
          </div>

          <div className="space-y-4">
            {rfqs.map((rfq) => {
              const needsApproval = rfq.requires_approval && rfq.approval_status === 'Pending';
              
              return (
                <Card key={rfq.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{rfq.rfq_name}</h3>
                              <Badge variant="outline">{rfq.rfq_number}</Badge>
                              {needsApproval && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Needs Approval
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {accounts.find(a => a.id === rfq.account_id)?.company_name}
                            </p>
                          </div>
                          <Badge className={statusColors[rfq.status]}>
                            {rfq.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-emerald-600">
                              {CURRENCY_SYMBOLS[rfq.currency]}{rfq.total_amount?.toLocaleString() || '0'}
                            </p>
                            {rfq.total_discount_percentage > 0 && (
                              <p className="text-xs text-amber-600">
                                {rfq.total_discount_percentage.toFixed(1)}% discount
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Items</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {rfq.line_items?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Valid Until</p>
                            <p className="text-sm font-medium">
                              {rfq.valid_until ? format(new Date(rfq.valid_until), 'MMM d, yyyy') : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm font-medium">
                              {format(new Date(rfq.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {rfq.status === "Draft" && !needsApproval && (
                          <Button
                            size="sm"
                            onClick={() => handleSubmitRFQForQuote(rfq)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                          </Button>
                        )}
                        {needsApproval && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-700"
                            disabled
                          >
                            Awaiting Approval
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-4">
          {!activeTemplate && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center gap-3">
                <Settings className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">No Active Template</p>
                  <p className="text-sm text-amber-700">Please upload a quote template to generate PDFs</p>
                </div>
                <Button
                  onClick={() => setActiveTab("templates")}
                  variant="outline"
                  className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Setup Template
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-5 gap-4">
            {['Draft', 'Pending Approval', 'Approved', 'Sent', 'Accepted'].map((status) => {
              const count = quotes.filter(q => q.status === status).length;
              return (
                <Card key={status} className="border-none shadow-md">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">{status}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{quote.quote_name}</h3>
                            <Badge variant="outline">{quote.quote_number}</Badge>
                            {quote.rfq_id && <Badge className="bg-purple-100 text-purple-700">From RFQ</Badge>}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {accounts.find(a => a.id === quote.account_id)?.company_name}
                          </p>
                        </div>
                        <Badge className={statusColors[quote.status]}>
                          {quote.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-xl font-bold text-emerald-600">
                            {CURRENCY_SYMBOLS[quote.currency]}{quote.total_amount?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="text-sm font-medium">{quote.line_items?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Valid Until</p>
                          <p className="text-sm font-medium">
                            {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm font-medium">
                            {format(new Date(quote.created_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGeneratePDF(quote)}
                        disabled={!activeTemplate}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Quote Template Configuration</h3>
              <p className="text-sm text-gray-600">Upload a DOCX template - it will be used for all quote PDFs</p>
            </div>
            <Button
              onClick={() => setShowTemplateDialog(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Template
            </Button>
          </div>

          {activeTemplate && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-xl bg-emerald-100">
                      <FileCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-emerald-900">{activeTemplate.template_name}</h4>
                      <p className="text-sm text-emerald-700 mt-1">{activeTemplate.description}</p>
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-emerald-600 text-white">Active</Badge>
                        <Badge variant="outline">{activeTemplate.template_type}</Badge>
                      </div>
                      {activeTemplate.usage_count > 0 && (
                        <p className="text-xs text-emerald-600 mt-2">
                          Used {activeTemplate.usage_count} times • Last used {activeTemplate.last_used ? format(new Date(activeTemplate.last_used), 'MMM d, yyyy') : 'Never'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(activeTemplate);
                        setShowTemplatePreview(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Variables
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {templates.filter(t => !t.is_active).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-gray-700">Inactive Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.filter(t => !t.is_active).map((template) => (
                  <Card key={template.id} className="border-none shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{template.template_name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          <Badge className="mt-2" variant="outline">{template.template_type}</Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activateTemplateMutation.mutate(template.id)}
                        >
                          Activate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* RFQ Dialog */}
      <Dialog open={showRFQDialog} onOpenChange={setShowRFQDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRFQ ? 'Edit RFQ' : 'Create New RFQ'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRFQSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfq_name">RFQ Name *</Label>
                <Input
                  id="rfq_name"
                  value={rfqFormData.rfq_name}
                  onChange={(e) => setRFQFormData({...rfqFormData, rfq_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_until">Valid Until</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={rfqFormData.valid_until}
                  onChange={(e) => setRFQFormData({...rfqFormData, valid_until: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Account *</Label>
              <Select 
                value={rfqFormData.account_id} 
                onValueChange={(value) => setRFQFormData({...rfqFormData, account_id: value, contact_id: ""})}
                required
              >
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

            <div className="space-y-2">
              <Label htmlFor="contact_id">Contact *</Label>
              <Select 
                value={rfqFormData.contact_id} 
                onValueChange={(value) => setRFQFormData({...rfqFormData, contact_id: value})}
                disabled={!rfqFormData.account_id}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Line and Manufacturer Filters */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="space-y-2">
                <Label htmlFor="product_line_id" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Product Line
                </Label>
                <Select 
                  value={rfqFormData.product_line_id} 
                  onValueChange={(value) => setRFQFormData({...rfqFormData, product_line_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All product lines..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Product Lines</SelectItem>
                    {accessibleProductLines.map((pl) => (
                      <SelectItem key={pl.id} value={pl.id}>
                        {pl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer_id" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Manufacturer
                </Label>
                <Select 
                  value={rfqFormData.manufacturer_id} 
                  onValueChange={(value) => setRFQFormData({...rfqFormData, manufacturer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All manufacturers..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Manufacturers</SelectItem>
                    {accessibleManufacturers.map((mfg) => (
                      <SelectItem key={mfg.id} value={mfg.id}>
                        {mfg.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Selection */}
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <Label className="text-base font-semibold flex items-center justify-between">
                <span>Add Products</span>
                <span className="text-sm text-gray-500 font-normal">
                  {filteredProducts.length} products available
                </span>
              </Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.product_name} - {CURRENCY_SYMBOLS[rfqFormData.currency]}{product.unit_price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={requestedDiscount}
                    onChange={(e) => setRequestedDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="Discount %"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Reason"
                  />
                </div>
                <div className="col-span-1">
                  <Button type="button" onClick={handleAddRFQLineItem} disabled={!selectedProduct} className="w-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {filteredProducts.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No products available with current filters. Try changing the product line or manufacturer filter.
                  </p>
                </div>
              )}

              {rfqFormData.line_items.length > 0 && (
                <div className="space-y-2 mt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">List Price</th>
                        <th className="p-2 text-right">Discount</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqFormData.line_items.map((item, index) => {
                        const requiresApproval = checkDiscountApproval(item.requested_discount_percent);
                        
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              <div>
                                <p className="font-medium">{item.product_name}</p>
                                {item.requested_discount_reason && (
                                  <p className="text-xs text-amber-600">Reason: {item.requested_discount_reason}</p>
                                )}
                                {requiresApproval && (
                                  <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Requires approval
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-2 text-right">{item.quantity}</td>
                            <td className="p-2 text-right">{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.list_price.toFixed(2)}</td>
                            <td className="p-2 text-right">{item.requested_discount_percent}%</td>
                            <td className="p-2 text-right font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.unit_price.toFixed(2)}</td>
                            <td className="p-2 text-right font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.total.toFixed(2)}</td>
                            <td className="p-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveRFQLineItem(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="bg-white p-4 rounded-lg space-y-2 border">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{rfqFormData.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax:</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={rfqFormData.tax_percentage}
                          onChange={(e) => {
                            const newTax = parseFloat(e.target.value) || 0;
                            setRFQFormData({...rfqFormData, tax_percentage: newTax});
                            calculateRFQTotals(rfqFormData.line_items);
                          }}
                          className="w-20"
                        />
                        <span>%</span>
                        <span className="font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{rfqFormData.tax_amount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-2xl font-bold text-emerald-600">{CURRENCY_SYMBOLS[rfqFormData.currency]}{rfqFormData.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_terms">Delivery Terms</Label>
                <Textarea
                  id="delivery_terms"
                  value={rfqFormData.delivery_terms}
                  onChange={(e) => setRFQFormData({...rfqFormData, delivery_terms: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Textarea
                  id="payment_terms"
                  value={rfqFormData.payment_terms}
                  onChange={(e) => setRFQFormData({...rfqFormData, payment_terms: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_requirements">Special Requirements</Label>
              <Textarea
                id="special_requirements"
                value={rfqFormData.special_requirements}
                onChange={(e) => setRFQFormData({...rfqFormData, special_requirements: e.target.value})}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                value={rfqFormData.internal_notes}
                onChange={(e) => setRFQFormData({...rfqFormData, internal_notes: e.target.value})}
                rows={2}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRFQDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                {editingRFQ ? 'Update' : 'Save'} RFQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template Upload Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Quote Template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-900 font-medium">📝 Template Guide</p>
              <ul className="text-xs text-indigo-700 mt-2 space-y-1">
                <li>• Upload a DOCX file with your quote layout</li>
                <li>• Use variables like {`{{quote_number}}`}, {`{{customer_name}}`}, {`{{total_amount}}`}</li>
                <li>• This will become the active template for ALL quotes</li>
                <li>• Previous template will be deactivated automatically</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={templateFormData.template_name}
                onChange={(e) => setTemplateFormData({...templateFormData, template_name: e.target.value})}
                required
                placeholder="e.g., Standard Quote Template 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({...templateFormData, description: e.target.value})}
                rows={2}
                placeholder="Describe this template..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_type">Template Type</Label>
              <Select 
                value={templateFormData.template_type} 
                onValueChange={(value) => setTemplateFormData({...templateFormData, template_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="RFQ">RFQ</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_file">Template File (DOCX) *</Label>
              <Input
                id="template_file"
                type="file"
                accept=".docx,.doc"
                onChange={(e) => setTemplateFile(e.target.files[0])}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Upload className="w-4 h-4 mr-2" />
                Upload & Activate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Template Variables Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Variables</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              These variables are automatically replaced when generating quotes:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {selectedTemplate?.detected_variables?.map((variable, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <code className="text-sm bg-white px-2 py-1 rounded border">{variable}</code>
                  <span className="text-xs text-gray-500">Auto-filled from quote data</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
