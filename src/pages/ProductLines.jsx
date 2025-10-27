import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Briefcase,
  Edit,
  User
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

export default function ProductLines() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingProductLine, setEditingProductLine] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    is_active: true,
    target_revenue: 0,
    manager_email: "",
  });

  const queryClient = useQueryClient();

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list('-created_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProductLine.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLines'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProductLine.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productLines'] });
      setShowDialog(false);
      setEditingProductLine(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      code: "",
      is_active: true,
      target_revenue: 0,
      manager_email: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProductLine) {
      updateMutation.mutate({ id: editingProductLine.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (pl) => {
    setEditingProductLine(pl);
    setFormData({
      name: pl.name || "",
      description: pl.description || "",
      code: pl.code || "",
      is_active: pl.is_active !== undefined ? pl.is_active : true,
      target_revenue: pl.target_revenue || 0,
      manager_email: pl.manager_email || "",
    });
    setShowDialog(true);
  };

  const getManagerName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Product Lines
          </h1>
          <p className="text-gray-500 mt-1">Organize your business by product lines and assign teams</p>
        </div>
        <Button 
          onClick={() => {
            setEditingProductLine(null);
            resetForm();
            setShowDialog(true);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product Line
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productLines.map((pl) => (
          <Card key={pl.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{pl.name}</CardTitle>
                  {pl.code && (
                    <p className="text-sm text-gray-500 mt-1">Code: {pl.code}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(pl)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                {pl.is_active ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pl.description && (
                <p className="text-sm text-gray-600">{pl.description}</p>
              )}
              {pl.manager_email && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">Manager: {getManagerName(pl.manager_email)}</span>
                </div>
              )}
              {pl.target_revenue > 0 && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Target Revenue</span>
                    <span className="text-sm font-semibold text-green-600">
                      ${pl.target_revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {productLines.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No product lines yet</h3>
            <p className="text-gray-400 mt-1">Create your first product line</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProductLine ? 'Edit Product Line' : 'Add New Product Line'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., PL-001"
              />
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

            <div className="space-y-2">
              <Label htmlFor="manager_email">Product Line Manager</Label>
              <Select 
                value={formData.manager_email} 
                onValueChange={(value) => setFormData({...formData, manager_email: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_revenue">Target Revenue ($)</Label>
              <Input
                id="target_revenue"
                type="number"
                value={formData.target_revenue}
                onChange={(e) => setFormData({...formData, target_revenue: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active Product Line</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                {editingProductLine ? 'Update' : 'Create'} Product Line
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}