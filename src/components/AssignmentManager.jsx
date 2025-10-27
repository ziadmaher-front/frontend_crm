import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  X, 
  Plus,
  Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AssignmentManager({ 
  assignedUsers = [], 
  productLines = [], 
  allUsers = [], 
  allProductLines = [],
  onUpdate 
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(assignedUsers);
  const [selectedProductLines, setSelectedProductLines] = useState(productLines);
  const [newUser, setNewUser] = useState("");
  const [newProductLine, setNewProductLine] = useState("");

  const handleAddUser = () => {
    if (newUser && !selectedUsers.includes(newUser)) {
      setSelectedUsers([...selectedUsers, newUser]);
      setNewUser("");
    }
  };

  const handleRemoveUser = (email) => {
    setSelectedUsers(selectedUsers.filter(u => u !== email));
  };

  const handleAddProductLine = () => {
    if (newProductLine && !selectedProductLines.includes(newProductLine)) {
      setSelectedProductLines([...selectedProductLines, newProductLine]);
      setNewProductLine("");
    }
  };

  const handleRemoveProductLine = (id) => {
    setSelectedProductLines(selectedProductLines.filter(p => p !== id));
  };

  const handleSave = () => {
    onUpdate({
      assigned_users: selectedUsers,
      product_lines: selectedProductLines
    });
    setShowDialog(false);
  };

  const handleOpen = () => {
    setSelectedUsers(assignedUsers);
    setSelectedProductLines(productLines);
    setShowDialog(true);
  };

  const getUserName = (email) => {
    const user = allUsers.find(u => u.email === email);
    return user?.full_name || email;
  };

  const getProductLineName = (id) => {
    const pl = allProductLines.find(p => p.id === id);
    return pl?.name || id;
  };

  return (
    <>
      <div className="space-y-3">
        {(assignedUsers.length > 0 || productLines.length > 0) && (
          <div className="flex flex-col gap-2">
            {assignedUsers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To:</p>
                <div className="flex flex-wrap gap-1">
                  {assignedUsers.map((email) => (
                    <Badge key={email} variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {getUserName(email)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {productLines.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Product Lines:</p>
                <div className="flex flex-wrap gap-1">
                  {productLines.map((id) => (
                    <Badge key={id} className="bg-indigo-100 text-indigo-800 text-xs">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {getProductLineName(id)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleOpen}
          className="w-full"
        >
          <Users className="w-4 h-4 mr-2" />
          Manage Assignments
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Assignments & Product Lines</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Assign Users */}
            <div className="space-y-3">
              <Label>Assigned Users</Label>
              <div className="flex gap-2">
                <Select value={newUser} onValueChange={setNewUser}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers
                      .filter(u => !selectedUsers.includes(u.email))
                      .map((user) => (
                        <SelectItem key={user.email} value={user.email}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={handleAddUser}
                  disabled={!newUser}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {getUserName(email)}
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(email)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Assign Product Lines */}
            <div className="space-y-3">
              <Label>Product Lines</Label>
              <div className="flex gap-2">
                <Select value={newProductLine} onValueChange={setNewProductLine}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product line..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allProductLines
                      .filter(pl => !selectedProductLines.includes(pl.id))
                      .map((pl) => (
                        <SelectItem key={pl.id} value={pl.id}>
                          {pl.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  onClick={handleAddProductLine}
                  disabled={!newProductLine}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProductLines.map((id) => (
                  <Badge key={id} className="bg-indigo-100 text-indigo-800 flex items-center gap-1">
                    {getProductLineName(id)}
                    <button
                      type="button"
                      onClick={() => handleRemoveProductLine(id)}
                      className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Assignments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}