
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Package,
  Edit,
  DollarSign,
  BarChart3,
  AlertCircle,
  Briefcase
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
import BulkOperations from "../components/BulkOperations";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: "",
    product_code: "",
    description: "",
    category: "",
    product_line_id: "",
    manufacturer_id: "", // Changed from manufacturer to manufacturer_id
    unit_price: 0,
    cost_price: 0,
    currency: "USD",
    unit_of_measure: "unit",
    stock_quantity: 0,
    reorder_level: 0,
    is_active: true,
    tax_applicable: true,
  });

  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => base44.entities.Manufacturer.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDialog(false);
      setEditingProduct(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      product_name: "",
      product_code: "",
      description: "",
      category: "",
      product_line_id: "",
      manufacturer_id: "", // Changed from manufacturer to manufacturer_id
      unit_price: 0,
      cost_price: 0,
      currency: "USD",
      unit_of_measure: "unit",
      stock_quantity: 0,
      reorder_level: 0,
      is_active: true,
      tax_applicable: true,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name || "",
      product_code: product.product_code || "",
      description: product.description || "",
      category: product.category || "",
      product_line_id: product.product_line_id || "",
      manufacturer_id: product.manufacturer_id || "", // Changed from manufacturer to manufacturer_id
      unit_price: product.unit_price || 0,
      cost_price: product.cost_price || 0,
      currency: product.currency || "USD",
      unit_of_measure: product.unit_of_measure || "unit",
      stock_quantity: product.stock_quantity || 0,
      reorder_level: product.reorder_level || 0,
      is_active: product.is_active !== undefined ? product.is_active : true,
      tax_applicable: product.tax_applicable !== undefined ? product.tax_applicable : true,
    });
    setShowDialog(true);
  };

  const filteredProducts = products.filter(product =>
    product.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProductLineName = (id) => {
    const pl = productLines.find(p => p.id === id);
    return pl?.name || null;
  };

  const getManufacturerName = (id) => {
    const manufacturer = manufacturers.find(m => m.id === id);
    return manufacturer?.company_name || null;
  };

  const totalValue = products.reduce((sum, p) => sum + ((p.unit_price || 0) * (p.stock_quantity || 0)), 0);
  const lowStockItems = products.filter(p => (p.stock_quantity || 0) <= (p.reorder_level || 0)).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Package className="w-8 h-8 text-teal-500" />
            Product Catalog
          </h1>
          <p className="text-gray-500 mt-1">Manage your products and inventory</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-500 bg-opacity-20">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-20">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500 bg-opacity-20">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Alert</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
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
              placeholder="Search products by name, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <BulkOperations
        entityName="Product"
        records={filteredProducts}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
      >
        {({ selectedRecords, isSelected, handleSelectRecord }) => (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isLowStock = (product.stock_quantity || 0) <= (product.reorder_level || 0);
              const margin = product.unit_price && product.cost_price
                ? ((product.unit_price - product.cost_price) / product.unit_price * 100).toFixed(1)
                : 0;

              return (
                <Card
                  key={product.id}
                  className={`border-none shadow-lg hover:shadow-xl transition-all duration-300 group ${
                    isSelected(product.id) ? 'ring-2 ring-teal-500' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected(product.id)}
                          onChange={() => handleSelectRecord(product.id)}
                          className="mt-3 w-4 h-4 text-teal-600 rounded"
                        />
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                          {product.product_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {product.product_name}
                          </CardTitle>
                          {product.product_code && (
                            <p className="text-sm text-gray-500 mt-1">SKU: {product.product_code}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                      {product.product_line_id && getProductLineName(product.product_line_id) && (
                        <Badge className="bg-indigo-100 text-indigo-800">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {getProductLineName(product.product_line_id)}
                        </Badge>
                      )}
                      {product.manufacturer_id && getManufacturerName(product.manufacturer_id) && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {getManufacturerName(product.manufacturer_id)}
                        </Badge>
                      )}
                      {!product.is_active && (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                      {isLowStock && (
                        <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Unit Price</p>
                        <p className="text-lg font-bold text-green-600">
                          ${product.unit_price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">In Stock</p>
                        <p className="text-lg font-bold">
                          {product.stock_quantity || 0} {product.unit_of_measure || 'units'}
                        </p>
                      </div>
                    </div>
                    {margin > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Profit Margin</span>
                          <span className="text-sm font-semibold text-blue-600">{margin}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </BulkOperations>


      {filteredProducts.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No products found</h3>
            <p className="text-gray-400 mt-1">Start building your product catalog</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name *</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_code">Product Code/SKU</Label>
                <Input
                  id="product_code"
                  value={formData.product_code}
                  onChange={(e) => setFormData({...formData, product_code: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_line_id">Product Line</Label>
                <Select
                  value={formData.product_line_id}
                  onValueChange={(value) => setFormData({...formData, product_line_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product line..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productLines.map((pl) => (
                      <SelectItem key={pl.id} value={pl.id}>
                        {pl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer_id">Manufacturer</Label>
              <Select
                value={formData.manufacturer_id}
                onValueChange={(value) => setFormData({...formData, manufacturer_id: value})}
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
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder_level">Reorder Level</Label>
                <Input
                  id="reorder_level"
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({...formData, reorder_level: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unit</Label>
                <Input
                  id="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({...formData, unit_of_measure: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="tax_applicable"
                  checked={formData.tax_applicable}
                  onCheckedChange={(checked) => setFormData({...formData, tax_applicable: checked})}
                />
                <Label htmlFor="tax_applicable">Tax Applicable</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600">
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
