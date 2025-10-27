
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Edit,
  LayoutList,
  LayoutGrid,
  User,
  Briefcase,
  Building2,
  Users as UsersIcon,
  Table as TableIcon
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

const STAGES = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const CURRENCIES = ["USD", "EGP", "AED", "SAR"];
const CURRENCY_SYMBOLS = {
  USD: "$",
  EGP: "E£",
  AED: "د.إ",
  SAR: "﷼"
};

// Helper function to generate URLs based on page name
// This is a placeholder; in a real app, this would typically come from a routing library or global config.
const createPageUrl = (pageName) => {
  switch (pageName) {
    case 'DealsKanban':
      return '/deals/kanban'; // Assuming /deals/kanban is the path for the Kanban view
    default:
      return '/';
  }
};

export default function Deals() {
  const [view, setView] = useState("kanban");
  const [showDialog, setShowDialog] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    deal_name: "",
    account_id: "",
    contact_id: "",
    lead_id: "",
    owner_email: "",
    product_line_id: "",
    amount: 0,
    currency: "USD",
    stage: "Prospecting",
    probability: 50,
    expected_close_date: "",
    lead_source: "Website",
    deal_type: "New Business",
    next_step: "",
    description: "",
  });

  const queryClient = useQueryClient();

  // Load view preference and current user
  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      if (user?.ui_preferences?.deals_view) {
        setView(user.ui_preferences.deals_view);
      }
    }).catch(() => {});
  }, []);

  // Save view preference
  const handleViewChange = async (newView) => {
    setView(newView);
    if (currentUser) {
      const updatedPreferences = {
        ...currentUser.ui_preferences,
        deals_view: newView
      };
      // Optimistically update currentUser state to reflect new preferences immediately
      // This is optional but can improve perceived responsiveness.
      // The backend call ensures persistence.
      setCurrentUser(prevUser => ({
        ...prevUser,
        ui_preferences: updatedPreferences
      }));

      try {
        await base44.auth.updateMe({ ui_preferences: updatedPreferences });
      } catch (error) {
        console.error("Failed to save view preference:", error);
        // Optionally revert UI if update failed, or show error message
        // For simplicity, we're not reverting here as it's a minor preference.
      }
    }
  };

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date'),
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

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: productLines = [] } = useQuery({
    queryKey: ['productLines'],
    queryFn: () => base44.entities.ProductLine.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deal.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setShowDialog(false);
      setEditingDeal(null);
      resetForm();
    },
  });

  const resetForm = () => {
    const defaultCurrency = currentUser?.default_currency || "USD";
    const defaultProductLine = currentUser?.product_line_id || "";

    setFormData({
      deal_name: "",
      account_id: "",
      contact_id: "",
      lead_id: "",
      owner_email: currentUser?.email || "",
      product_line_id: defaultProductLine,
      amount: 0,
      currency: defaultCurrency,
      stage: "Prospecting",
      probability: 50,
      expected_close_date: "",
      lead_source: "Website",
      deal_type: "New Business",
      next_step: "",
      description: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      deal_name: deal.deal_name || "",
      account_id: deal.account_id || "",
      contact_id: deal.contact_id || "",
      lead_id: deal.lead_id || "",
      owner_email: deal.owner_email || "",
      product_line_id: deal.product_line_id || "",
      amount: deal.amount || 0,
      currency: deal.currency || "USD",
      stage: deal.stage || "Prospecting",
      probability: deal.probability || 50,
      // Preserve date formatting for input type="date"
      expected_close_date: deal.expected_close_date ? format(new Date(deal.expected_close_date), 'yyyy-MM-dd') : "",
      lead_source: deal.lead_source || "Website",
      deal_type: deal.deal_type || "New Business",
      next_step: deal.next_step || "",
      description: deal.description || "",
    });
    setShowDialog(true);
  };

  const handleStageChange = async (dealId, newStage) => {
    const deal = deals.find((d) => d.id === dealId);
    if (deal) {
      await updateMutation.mutateAsync({
        id: dealId,
        data: { ...deal, stage: newStage }
      });
    }
  };

  const handleOwnerChange = (email) => {
    const owner = users.find(u => u.email === email);
    setFormData({
      ...formData,
      owner_email: email,
      product_line_id: owner?.product_line_id || formData.product_line_id,
      currency: owner?.default_currency || formData.currency,
    });
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.company_name || "No Account";
  };

  const getContactName = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  };

  const getLeadName = (leadId) => {
    const lead = leads.find((l) => l.id === leadId);
    return lead ? `${lead.first_name} ${lead.last_name}` : null;
  };

  const getUserName = (email) => {
    const user = users.find((u) => u.email === email);
    return user?.full_name || email;
  };

  const getProductLineName = (id) => {
    const pl = productLines.find((p) => p.id === id);
    return pl?.name || null;
  };

  // Filter contacts by selected account
  const filteredContacts = formData.account_id
    ? contacts.filter(c => c.account_id === formData.account_id)
    : contacts;

  // Filter leads by selected account
  const filteredLeads = formData.account_id
    ? leads.filter(l => l.account_id === formData.account_id)
    : leads;

  const totalDealsValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  const openDeals = deals.filter(d => !['Closed Won', 'Closed Lost'].includes(d.stage));
  const wonDeals = deals.filter(d => d.stage === 'Closed Won');
  const wonDealsValue = wonDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

  const stageColors = {
    'Prospecting': 'from-indigo-400 to-indigo-600',
    'Qualification': 'from-purple-400 to-purple-600',
    'Proposal': 'from-blue-400 to-blue-600',
    'Negotiation': 'from-amber-400 to-amber-600',
    'Closed Won': 'from-emerald-400 to-emerald-600',
    'Closed Lost': 'from-gray-400 to-gray-600',
  };

  const DealCard = ({ deal, isSelected, handleSelectRecord }) => (
    <Card className={`mb-3 border-none shadow-md hover:shadow-lg transition-all cursor-pointer group ${
      isSelected ? 'ring-2 ring-indigo-500' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-start gap-2 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectRecord(deal.id)}
              className="mt-0.5 w-4 h-4 text-indigo-600 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <h4 className="font-semibold text-sm flex-1">{deal.deal_name}</h4>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(deal);
            }}
          >
            <Edit className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mb-2">{getAccountName(deal.account_id)}</p>
        {deal.contact_id && getContactName(deal.contact_id) && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <UsersIcon className="w-3 h-3" />
            {getContactName(deal.contact_id)}
          </div>
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-green-600">
            {CURRENCY_SYMBOLS[deal.currency || 'USD']}{deal.amount?.toLocaleString() || 0}
          </span>
          {deal.probability && (
            <Badge variant="secondary" className="text-xs">
              {deal.probability}%
            </Badge>
          )}
        </div>
        {deal.owner_email && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <User className="w-3 h-3" />
            {getUserName(deal.owner_email)}
          </div>
        )}
        {deal.product_line_id && getProductLineName(deal.product_line_id) && (
          <Badge className="bg-indigo-100 text-indigo-800 text-xs mb-2">
            <Briefcase className="w-3 h-3 mr-1" />
            {getProductLineName(deal.product_line_id)}
          </Badge>
        )}
        {deal.expected_close_date && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <Calendar className="w-3 h-3" />
            {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
            Deals Pipeline
          </h1>
          <p className="text-gray-600 mt-1">Track and manage sales opportunities</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.href = createPageUrl('DealsKanban')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban View
          </Button>
          <Button
            onClick={() => {
              setEditingDeal(null);
              resetForm();
              setShowDialog(true);
            }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Total Pipeline</p>
                <p className="text-3xl font-bold text-white">${totalDealsValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Won Deals</p>
                <p className="text-3xl font-bold text-white">${wonDealsValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Open Deals</p>
                <p className="text-3xl font-bold text-white">{openDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {view === "kanban" && (
        <BulkOperations
          entityName="Deal"
          records={deals}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['deals'] })}
        >
          {({ selectedRecords, isSelected, handleSelectRecord }) => (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {STAGES.map((stage) => {
                  const stageDeals = deals.filter((d) => d.stage === stage);
                  const stageValue = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

                  return (
                    <div key={stage} className="w-80 flex-shrink-0">
                      <Card className={`border-none shadow-lg bg-gradient-to-br ${stageColors[stage]} text-white`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold flex justify-between items-center">
                            <span>{stage}</span>
                            <Badge variant="secondary" className="bg-white/20 text-white border-none">
                              {stageDeals.length}
                            </Badge>
                          </CardTitle>
                          <p className="text-xs opacity-90">${stageValue.toLocaleString()}</p>
                        </CardHeader>
                      </Card>
                      <div className="mt-4 space-y-2">
                        {stageDeals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            isSelected={isSelected(deal.id)}
                            handleSelectRecord={handleSelectRecord}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </BulkOperations>
      )}

      {view === "list" && (
        <BulkOperations
          entityName="Deal"
          records={deals}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['deals'] })}
        >
          {({ selectedRecords, isSelected, handleSelectRecord }) => (
            <div className="space-y-2">
              {deals.map((deal) => (
                <Card key={deal.id} className={`border-none shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  isSelected(deal.id) ? 'ring-2 ring-indigo-500' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected(deal.id)}
                        onChange={() => handleSelectRecord(deal.id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      {/* Changed to simplified grid-cols-6 from responsive grid-cols */}
                      <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                        {/* Deal Name & Account */}
                        <div>
                          <p className="font-semibold">{deal.deal_name}</p>
                          <p className="text-xs text-gray-500">{getAccountName(deal.account_id)}</p>
                        </div>
                        {/* Owner */}
                        <div>
                          <p className="text-sm text-gray-600">{getUserName(deal.owner_email)}</p>
                        </div>
                        {/* Amount */}
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {CURRENCY_SYMBOLS[deal.currency || 'USD']}{deal.amount?.toLocaleString() || 0}
                          </p>
                        </div>
                        {/* Stage */}
                        <div>
                          <Select
                            value={deal.stage}
                            onValueChange={(value) => handleStageChange(deal.id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map((stage) => (
                                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Probability */}
                        <div>
                          <Badge variant="secondary">{deal.probability}%</Badge>
                        </div>
                        {/* Actions */}
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(deal)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </BulkOperations>
      )}

      {view === "table" && (
        <BulkOperations
          entityName="Deal"
          records={deals}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['deals'] })}
        >
          {({ selectedRecords, isSelected, handleSelectRecord }) => (
            <Card className="border-none shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedRecords.length === deals.length && deals.length > 0}
                            onChange={() => {
                              if (selectedRecords.length === deals.length) {
                                // If all are selected, deselect all.
                                selectedRecords.forEach(id => handleSelectRecord(id));
                              } else {
                                // Select all unselected deals.
                                deals.filter(d => !isSelected(d.id)).forEach(d => handleSelectRecord(d.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                        {/* Restored Probability column header */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probability</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Close Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deals.map((deal) => (
                        <tr key={deal.id} className={`hover:bg-gray-50 ${isSelected(deal.id) ? 'bg-indigo-50' : ''}`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected(deal.id)}
                              onChange={() => handleSelectRecord(deal.id)}
                              className="w-4 h-4 text-indigo-600 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{deal.deal_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {getAccountName(deal.account_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {getUserName(deal.owner_email)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                            {CURRENCY_SYMBOLS[deal.currency || 'USD']}{deal.amount?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={deal.stage}
                              onValueChange={(value) => handleStageChange(deal.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STAGES.map((stage) => (
                                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          {/* Restored Probability column data */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{deal.probability}%</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(deal)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </BulkOperations>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deal_name">Deal Name *</Label>
              <Input
                id="deal_name"
                value={formData.deal_name}
                onChange={(e) => setFormData({...formData, deal_name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_email">Deal Owner *</Label>
              <Select
                value={formData.owner_email}
                onValueChange={handleOwnerChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.email} value={user.email}>
                      {user.full_name} - {user.territory || 'No Territory'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Account</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) => setFormData({...formData, account_id: value, contact_id: "", lead_id: ""})}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_id">Contact</Label>
                <Select
                  value={formData.contact_id}
                  onValueChange={(value) => setFormData({...formData, contact_id: value})}
                  disabled={!formData.account_id}
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
              <div className="space-y-2">
                <Label htmlFor="lead_id">Lead (Optional)</Label>
                <Select
                  value={formData.lead_id}
                  onValueChange={(value) => setFormData({...formData, lead_id: value})}
                  disabled={!formData.account_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.first_name} {lead.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_line_id">Product Line (Auto-configured)</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency (Auto-configured)</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({...formData, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr} ({CURRENCY_SYMBOLS[curr]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select value={formData.stage} onValueChange={(value) => setFormData({...formData, stage: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%): {formData.probability}</Label>
                <input
                  type="range"
                  id="probability"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_close_date">Expected Close Date</Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deal_type">Deal Type</Label>
                <Select value={formData.deal_type} onValueChange={(value) => setFormData({...formData, deal_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Business">New Business</SelectItem>
                    <SelectItem value="Existing Business">Existing Business</SelectItem>
                    <SelectItem value="Renewal">Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead_source">Lead Source</Label>
              <Select value={formData.lead_source} onValueChange={(value) => setFormData({...formData, lead_source: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_step">Next Step</Label>
              <Input
                id="next_step"
                value={formData.next_step}
                onChange={(e) => setFormData({...formData, next_step: e.target.value})}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                {editingDeal ? 'Update' : 'Create'} Deal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
