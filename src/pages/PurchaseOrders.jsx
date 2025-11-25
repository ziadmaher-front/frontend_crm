import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ShoppingCart,
  Edit,
  Factory,
  Calendar,
  DollarSign,
  Package,
  Trash2
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

const CURRENCY_SYMBOLS = {
  USD: "$",
  EGP: "E£",
  AED: "د.إ",
  SAR: "﷼"
};

export default function PurchaseOrders() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingPO, setEditingPO] = useState(null);
  const [formData, setFormData] = useState({
    po_number: `PO-${Date.now()}`,
    manufacturer_id: "",
    status: "Draft",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: "",
    line_items: [],
    subtotal: 0,
    tax_amount: 0,
    shipping_cost: 0,
    total_amount: 0,
    currency: "USD",
    payment_terms: "",
    notes: "",
  });
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const queryClient = useQueryClient();

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => base44.entities.PurchaseOrder.list('-created_date'),
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PurchaseOrder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PurchaseOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setShowDialog(false);
      setEditingPO(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      po_number: `SO-${Date.now()}`,
      manufacturer_id: "",
      status: "Draft",
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: "",
      line_items: [],
      subtotal: 0,
      tax_amount: 0,
      shipping_cost: 0,
      total_amount: 0,
      currency: "USD",
      payment_terms: "",
      notes: "",
    });
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPO) {
      updateMutation.mutate({ id: editingPO.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (po) => {
    setEditingPO(po);
    setFormData({
      po_number: po.po_number || "",
      manufacturer_id: po.manufacturer_id || "",
      status: po.status || "Draft",
      order_date: po.order_date || "",
      expected_delivery_date: po.expected_delivery_date || "",
      line_items: po.line_items || [],
      subtotal: po.subtotal || 0,
      tax_amount: po.tax_amount || 0,
      shipping_cost: po.shipping_cost || 0,
      total_amount: po.total_amount || 0,
      currency: po.currency || "USD",
      payment_terms: po.payment_terms || "",
      notes: po.notes || "",
    });
    setShowDialog(true);
  };

  const handleManufacturerChange = (manufacturerId) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    setFormData({
      ...formData,
      manufacturer_id: manufacturerId,
      currency: manufacturer?.currency || "USD",
      payment_terms: manufacturer?.payment_terms || "",
      expected_delivery_date: manufacturer?.delivery_lead_time_days 
        ? new Date(Date.now() + manufacturer.delivery_lead_time_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : "",
    });
  };

  const handleAddLineItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const lineItem = {
      product_id: product.id,
      product_name: product.product_name,
      quantity: quantity,
      unit_price: product.cost_price || product.unit_price,
      total: (product.cost_price || product.unit_price) * quantity,
    };

    const newLineItems = [...formData.line_items, lineItem];
    const newSubtotal = newLineItems.reduce((sum, item) => sum + item.total, 0);
    const newTaxAmount = newSubtotal * 0.1; // 10% tax
    const newTotal = newSubtotal + newTaxAmount + formData.shipping_cost;

    setFormData({
      ...formData,
      line_items: newLineItems,
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotal,
    });

    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveLineItem = (index) => {
    const newLineItems = formData.line_items.filter((_, i) => i !== index);
    const newSubtotal = newLineItems.reduce((sum, item) => sum + item.total, 0);
    const newTaxAmount = newSubtotal * 0.1;
    const newTotal = newSubtotal + newTaxAmount + formData.shipping_cost;

    setFormData({
      ...formData,
      line_items: newLineItems,
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotal,
    });
  };

  const getManufacturerName = (id) => {
    const manufacturer = manufacturers.find(m => m.id === id);
    return manufacturer?.company_name || "Unknown";
  };

  // Filter products by selected manufacturer
  const filteredProducts = formData.manufacturer_id
    ? products.filter(p => p.manufacturer_id === formData.manufacturer_id)
    : products;

  const statusColors = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Sent': 'bg-blue-100 text-blue-800',
    'Confirmed': 'bg-purple-100 text-purple-800',
    'Partially Received': 'bg-yellow-100 text-yellow-800',
    'Received': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0);
  const pendingPOs = purchaseOrders.filter(po => !['Received', 'Cancelled'].includes(po.status)).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-blue-500" />
            Sales Orders
          </h1>
          <p className="text-gray-500 mt-1">Manage orders to manufacturers</p>
        </div>
        <Button 
          onClick={() => {
            setEditingPO(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create PO
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500 bg-opacity-20">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total PO Value</p>
                <p className="text-2xl font-bold">${totalPOValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500 bg-opacity-20">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingPOs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-20">
                <Factory className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Manufacturers</p>
                <p className="text-2xl font-bold">{manufacturers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BulkOperations 
        entityName="PurchaseOrder" 
        records={purchaseOrders}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })}
      >
        {({ isSelected, handleSelectRecord }) => (
          <div className="space-y-4">
            {purchaseOrders.map((po) => (
              <Card 
                key={po.id} 
                className={`border-none shadow-lg hover:shadow-xl transition-all group ${
                  isSelected(po.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected(po.id)}
                        onChange={() => handleSelectRecord(po.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{po.po_number}</h3>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <Factory className="w-4 h-4" />
                              {getManufacturerName(po.manufacturer_id)}
                            </p>
                          </div>
                          <Badge className={statusColors[po.status]}>
                            {po.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Order Date</p>
                            <p className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(po.order_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {po.expected_delivery_date && (
                            <div>
                              <p className="text-xs text-gray-500">Expected Delivery</p>
                              <p className="text-sm font-medium">
                                {format(new Date(po.expected_delivery_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {CURRENCY_SYMBOLS[po.currency || 'USD']}{po.total_amount?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>

                        {po.line_items?.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-500 mb-2">Items ({po.line_items.length})</p>
                            <div className="space-y-1">
                              {po.line_items.slice(0, 3).map((item, idx) => (
                                <p key={idx} className="text-sm text-gray-600">
                                  • {item.product_name} - Qty: {item.quantity}
                                </p>
                              ))}
                              {po.line_items.length > 3 && (
                                <p className="text-xs text-gray-500">+{po.line_items.length - 3} more items</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(po)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </BulkOperations>

      {purchaseOrders.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No sales orders yet</h3>
            <p className="text-gray-400 mt-1">Create your first sales order</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPO ? 'Edit Sales Order' : 'Create Sales Order'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="po_number">Sales Order Number *</Label>
                <Input
                  id="po_number"
                  value={formData.po_number}
                  onChange={(e) => setFormData({...formData, po_number: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Partially Received">Partially Received</SelectItem>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer_id">Manufacturer *</Label>
              <Select 
                value={formData.manufacturer_id} 
                onValueChange={handleManufacturerChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer..." />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.filter(m => m.is_active).map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_date">Order Date *</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected Delivery</Label>
                <Input
                  id="expected_delivery_date"
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EGP">EGP</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <Label>Line Items</Label>
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name} - ${product.cost_price || product.unit_price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-24"
                  placeholder="Qty"
                />
                <Button type="button" onClick={handleAddLineItem} disabled={!selectedProduct}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.line_items.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.line_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {item.product_name} x {item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">${item.total.toFixed(2)}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLineItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="shipping_cost">Shipping Cost</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  step="0.01"
                  value={formData.shipping_cost}
                  onChange={(e) => {
                    const shipping = parseFloat(e.target.value) || 0;
                    setFormData({
                      ...formData,
                      shipping_cost: shipping,
                      total_amount: formData.subtotal + formData.tax_amount + shipping,
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Subtotal:</p>
                <p className="font-semibold">${formData.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tax (10%):</p>
                <p className="font-semibold">${formData.tax_amount.toFixed(2)}</p>
              </div>
              <div className="col-span-2 border-t pt-2">
                <p className="text-sm text-gray-600">Total Amount:</p>
                <p className="text-2xl font-bold text-green-600">${formData.total_amount.toFixed(2)}</p>
              </div>
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
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {editingPO ? 'Update' : 'Create'} PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}