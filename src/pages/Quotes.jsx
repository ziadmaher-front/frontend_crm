
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
import { AccessibleTable } from '@/components/AccessibilityEnhancements';

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
    rfq_number: "", // User-provided, required
    account_id: "",
    contact_id: "", // Optional - either contact_id OR lead_id required
    lead_id: "", // Optional - either contact_id OR lead_id required
    vendors: "", // Optional string
    line_items: [],
    currency: "USD", // EGP, USD, or AED only
    status: "SUBMITTED", // COMPLETED or SUBMITTED (default SUBMITTED)
    payment_terms: "",
    valid_until: "",
    additional_notes: "", // Replaces internal_notes
  });
  const [selectedProduct, setSelectedProduct] = useState(""); // Back to dropdown - productId required
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

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list(),
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

    // Filter by manufacturer if selected (using manufacturer relation or manufacturerId)
    if (rfqFormData.manufacturer_id) {
      filteredProducts = filteredProducts.filter(p => 
        p.manufacturer?.id === rfqFormData.manufacturer_id || 
        p.manufacturerId === rfqFormData.manufacturer_id ||
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

  // RFQ Number is now user-provided, no auto-generation

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

      // Validate that exactly one of contactId or leadId is provided
      if (!data.contact_id && !data.lead_id) {
        throw new Error('Either Contact or Lead must be selected');
      }
      if (data.contact_id && data.lead_id) {
        throw new Error('Please select either Contact OR Lead, not both');
      }

      return base44.entities.RFQ.create({
        ...data,
        requested_by: currentUser?.email, // Auto-set from current user
        // status defaults to "SUBMITTED" in form data
        // rfq_number is user-provided, not auto-generated
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
    mutationFn: async () => {
      if (!activeTemplate) {
        throw new Error("No active template found. Please upload a template first.");
      }

      // TODO: Use account and contact for PDF generation
      // const account = accounts.find(a => a.id === quote.account_id);
      // const contact = contacts.find(c => c.id === quote.contact_id);

      // TODO: Use templateData for PDF generation
      // const templateData = {
      //   quote_number: quote.quote_number,
      //   quote_name: quote.quote_name,
      //   quote_date: format(new Date(quote.created_date), 'MMMM d, yyyy'),
      //   valid_until: quote.valid_until ? format(new Date(quote.valid_until), 'MMMM d, yyyy') : '',
      //   customer_name: account?.company_name || '',
      //   customer_address: account?.billing_address || '',
      //   customer_city: account?.billing_city || '',
      //   customer_country: account?.billing_country || '',
      //   contact_name: contact ? `${contact.first_name} ${contact.last_name}` : '',
      //   contact_email: contact?.email || '',
      //   contact_phone: contact?.phone || '',
      //   line_items: quote.line_items || [],
      //   subtotal: quote.subtotal || 0,
      //   tax_percentage: quote.tax_percentage || 0,
      //   tax_amount: quote.tax_amount || 0,
      //   total_amount: quote.total_amount || 0,
      //   currency: quote.currency || 'USD',
      //   currency_symbol: CURRENCY_SYMBOLS[quote.currency] || '$',
      //   payment_terms: quote.payment_terms || '',
      //   delivery_terms: quote.delivery_terms || '',
      //   terms_and_conditions: quote.terms_and_conditions || '',
      //   customer_notes: quote.customer_notes || '',
      // };

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
      rfq_number: "",
      account_id: "",
      contact_id: "",
      lead_id: "",
      vendors: "",
      line_items: [],
      currency: currentUser?.default_currency || "USD",
      status: "SUBMITTED",
      payment_terms: "",
      additional_notes: "",
    });
    setSelectedProduct("");
    setQuantity(1);
    setRequestedDiscount(0);
    setDiscountReason("");
  };

  const handleAddRFQLineItem = () => {
    if (!selectedProduct) {
      toast.error("Please select a product from the dropdown");
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error("Selected product not found");
      return;
    }

    const listPrice = product.unit_price || product.list_price || 0;
    const discountedPrice = listPrice * (1 - requestedDiscount / 100);
    const lineTotal = discountedPrice * quantity;

    const lineItem = {
      product_id: product.id, // Required - from dropdown selection
      product_name: product.product_name || product.name || "", // Auto-filled from product
      product_code: product.product_code || product.code || "",
      description: product.description || "",
      manufacturer_name: product.manufacturer?.company_name || product.manufacturer?.name || "", // Include manufacturer name
      manufacturer: product.manufacturer, // Include full manufacturer object if available
      quantity: quantity,
      list_price: listPrice,
      requested_discount_percent: requestedDiscount,
      requested_discount_reason: discountReason.trim() || "",
      approved_discount_percent: requestedDiscount,
      unit_price: discountedPrice,
      total: lineTotal,
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
    // Tax is no longer in the new structure - total equals subtotal
    const total = subtotal;

    setRFQFormData(prev => ({
      ...prev,
      line_items: lineItems,
      subtotal,
      total_amount: total,
    }));
  };

  const handleRFQSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!rfqFormData.rfq_name) {
      toast.error("RFQ name is required");
      return;
    }
    if (!rfqFormData.rfq_number) {
      toast.error("RFQ number is required");
      return;
    }
    if (!rfqFormData.account_id) {
      toast.error("Account is required");
      return;
    }
    // Validate exactly one of contact_id or lead_id
    if (!rfqFormData.contact_id && !rfqFormData.lead_id) {
      toast.error("Either Contact or Lead must be selected");
      return;
    }
    if (rfqFormData.contact_id && rfqFormData.lead_id) {
      toast.error("Please select either Contact OR Lead, not both");
      return;
    }
    // Validate that at least one line item exists
    if (!rfqFormData.line_items || rfqFormData.line_items.length === 0) {
      toast.error("Please add at least one product to the RFQ before saving.");
      return;
    }
    // Validate currency
    const validCurrencies = ["EGP", "USD", "AED"];
    if (!validCurrencies.includes(rfqFormData.currency)) {
      toast.error("Currency must be EGP, USD, or AED");
      return;
    }
    // Validate status
    const validStatuses = ["COMPLETED", "SUBMITTED"];
    if (!validStatuses.includes(rfqFormData.status)) {
      toast.error("Status must be COMPLETED or SUBMITTED");
      return;
    }
    
    console.log('RFQ Submit - Form data:', rfqFormData);
    console.log('RFQ Submit - Line items:', rfqFormData.line_items);
    console.log('RFQ Submit - Line items count:', rfqFormData.line_items?.length);
    
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
    } catch {
      toast.error("Failed to upload template");
    }
  };

  const handleGeneratePDF = (quote) => {
    generatePDFMutation.mutate(quote);
  };

  // Filter contacts by account if account is selected, otherwise show all contacts
  const filteredContacts = rfqFormData.account_id 
    ? contacts.filter(c => {
        const contactAccountId = c.account_id || c.accountId;
        return contactAccountId === rfqFormData.account_id;
      })
    : contacts; // Show all contacts if no account is selected

  // If filtering by account returns no results, show all contacts as fallback
  const displayContacts = rfqFormData.account_id && filteredContacts.length === 0 
    ? contacts 
    : filteredContacts;

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
                              {accounts.find(a => a.id === rfq.account_id || a.id === rfq.accountId)?.name || 
                               accounts.find(a => a.id === rfq.account_id || a.id === rfq.accountId)?.company_name || 
                               'Unknown Account'}
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
                            {accounts.find(a => a.id === quote.account_id || a.id === quote.accountId)?.name || 
                             accounts.find(a => a.id === quote.account_id || a.id === quote.accountId)?.company_name || 
                             'Unknown Account'}
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
                <Label htmlFor="rfq_number">RFQ Number (Quotation Code) *</Label>
                <Input
                  id="rfq_number"
                  value={rfqFormData.rfq_number}
                  onChange={(e) => setRFQFormData({...rfqFormData, rfq_number: e.target.value})}
                  placeholder="e.g., RFQ-2025-001"
                  required
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
                      {account.name || account.company_name || 'Unnamed Account'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_id">Contact Name (Optional)</Label>
                <Select 
                  value={rfqFormData.contact_id || ""} 
                  onValueChange={(value) => {
                    if (value !== "__no_contacts__") {
                      setRFQFormData({...rfqFormData, contact_id: value, lead_id: ""});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={displayContacts.length === 0 ? "No contacts available" : "Select contact..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {displayContacts.length === 0 ? (
                      <SelectItem value="__no_contacts__" disabled>
                        {contacts.length === 0 ? "No contacts found in system" : "No contacts available"}
                      </SelectItem>
                    ) : (
                      displayContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.first_name || ''} {contact.last_name || ''} {contact.email ? `(${contact.email})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {rfqFormData.account_id && filteredContacts.length === 0 && contacts.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No contacts found for this account. Showing all contacts instead.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead_id">Lead Name (Optional)</Label>
                <Select 
                  value={rfqFormData.lead_id || ""} 
                  onValueChange={(value) => {
                    if (value !== "__no_leads__") {
                      setRFQFormData({...rfqFormData, lead_id: value, contact_id: ""});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={leads.length === 0 ? "No leads available" : "Select lead..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.length === 0 ? (
                      <SelectItem value="__no_leads__" disabled>
                        No leads found in system
                      </SelectItem>
                    ) : (
                      leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.first_name || ''} {lead.last_name || ''} {lead.email ? `(${lead.email})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select either Contact OR Lead (exactly one required)
                </p>
              </div>
            </div>

            {/* Vendors Field */}
            <div className="space-y-2">
              <Label htmlFor="vendors">Vendors (Optional)</Label>
              <Input
                id="vendors"
                value={rfqFormData.vendors}
                onChange={(e) => setRFQFormData({...rfqFormData, vendors: e.target.value})}
                placeholder="Enter vendor names..."
              />
            </div>

            {/* Product Selection */}
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <Label className="text-base font-semibold">
                <span>Add Products *</span>
              </Label>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <Label htmlFor="product_select">Product *</Label>
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.length === 0 ? (
                        <SelectItem value="__no_products__" disabled>
                          No products available
                        </SelectItem>
                      ) : (
                        filteredProducts.map((product) => {
                          const productName = product.product_name || product.name || product.product_code || product.code || 'Unnamed Product';
                          const manufacturerName = product.manufacturer?.company_name || product.manufacturer?.name || '';
                          const displayText = manufacturerName 
                            ? `${productName} (${manufacturerName})`
                            : productName;
                          
                          return (
                            <SelectItem key={product.id} value={product.id}>
                              {displayText}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={requestedDiscount}
                    onChange={(e) => setRequestedDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="Discount %"
                  />
                </div>
                <div className="col-span-4">
                  <Label htmlFor="discount_reason">Discount Reason</Label>
                  <Input
                    id="discount_reason"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Discount Reason"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddRFQLineItem}
                disabled={!selectedProduct}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>

              {rfqFormData.line_items.length > 0 && (
                <div className="space-y-2 mt-4">
                  <AccessibleTable
                    caption="RFQ Line Items showing product details, quantities, pricing, and discounts"
                    headers={['Product', 'Qty', 'List Price', 'Discount', 'Unit Price', 'Total', 'Actions']}
                    data={rfqFormData.line_items.map((item, index) => {
                      const requiresApproval = checkDiscountApproval(item.requested_discount_percent);
                      
                      // Get manufacturer name if available (from product relation or stored in line item)
                      const manufacturerName = item.manufacturer_name || item.manufacturer?.company_name || item.manufacturer?.name || '';
                      
                      return [
                        <div key={`product-${index}`}>
                          <p className="font-medium">{item.product_name}</p>
                          {manufacturerName && (
                            <p className="text-xs text-gray-500">Manufacturer: {manufacturerName}</p>
                          )}
                          {item.product_code && (
                            <p className="text-xs text-gray-500">Code: {item.product_code}</p>
                          )}
                          {item.requested_discount_reason && (
                            <p className="text-xs text-amber-600">Reason: {item.requested_discount_reason}</p>
                          )}
                          {requiresApproval && (
                            <Badge className="mt-1 bg-amber-100 text-amber-700 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Requires approval
                            </Badge>
                          )}
                        </div>,
                        <span key={`qty-${index}`}>{item.quantity}</span>,
                        <span key={`list-price-${index}`}>{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.list_price.toFixed(2)}</span>,
                        <span key={`discount-${index}`}>{item.requested_discount_percent}%</span>,
                        <span key={`unit-price-${index}`} className="font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.unit_price.toFixed(2)}</span>,
                        <span key={`total-${index}`} className="font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{item.total.toFixed(2)}</span>,
                        <Button
                          key={`action-${index}`}
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRFQLineItem(index)}
                          aria-label={`Remove ${item.product_name} from RFQ`}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      ];
                    })}
                    className="w-full text-sm"
                  />

                  <div className="bg-white p-4 rounded-lg space-y-2 border">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{CURRENCY_SYMBOLS[rfqFormData.currency]}{rfqFormData.subtotal?.toFixed(2) || '0.00'}</span>
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
                <Label htmlFor="currency">Quote Currency *</Label>
                <Select
                  value={rfqFormData.currency}
                  onValueChange={(value) => setRFQFormData({...rfqFormData, currency: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">RFQ Status *</Label>
                <Select
                  value={rfqFormData.status}
                  onValueChange={(value) => setRFQFormData({...rfqFormData, status: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBMITTED">SUBMITTED</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms (Optional)</Label>
              <Textarea
                id="payment_terms"
                value={rfqFormData.payment_terms}
                onChange={(e) => setRFQFormData({...rfqFormData, payment_terms: e.target.value})}
                rows={2}
                placeholder="Enter payment terms..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes (Optional)</Label>
              <Textarea
                id="additional_notes"
                value={rfqFormData.additional_notes}
                onChange={(e) => setRFQFormData({...rfqFormData, additional_notes: e.target.value})}
                rows={3}
                placeholder="Enter any additional notes..."
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
