import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Users,
  Building2,
  TrendingUp,
  Sparkles,
  CheckSquare,
  FileText,
  Mail,
  Phone,
  Calendar,
  Settings,
  BarChart3,
  Package,
  Command
} from "lucide-react";
import { createPageUrl } from "@/utils";

const QUICK_ACTIONS = [
  { id: 'new-lead', label: 'Create New Lead', icon: Sparkles, action: 'create', entity: 'Lead', category: 'Create' },
  { id: 'new-contact', label: 'Create New Contact', icon: Users, action: 'create', entity: 'Contact', category: 'Create' },
  { id: 'new-account', label: 'Create New Account', icon: Building2, action: 'create', entity: 'Account', category: 'Create' },
  { id: 'new-deal', label: 'Create New Deal', icon: TrendingUp, action: 'create', entity: 'Deal', category: 'Create' },
  { id: 'new-task', label: 'Create New Task', icon: CheckSquare, action: 'create', entity: 'Task', category: 'Create' },
  { id: 'new-quote', label: 'Create New Quote', icon: FileText, action: 'create', entity: 'Quote', category: 'Create' },
  { id: 'send-email', label: 'Send Email', icon: Mail, action: 'email', category: 'Actions' },
  { id: 'schedule-meeting', label: 'Schedule Meeting', icon: Calendar, action: 'meeting', category: 'Actions' },
  { id: 'make-call', label: 'Make Call', icon: Phone, action: 'call', category: 'Actions' },
];

const NAVIGATION = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: BarChart3, page: 'Dashboard', category: 'Navigate' },
  { id: 'nav-leads', label: 'Leads', icon: Sparkles, page: 'Leads', category: 'Navigate' },
  { id: 'nav-contacts', label: 'Contacts', icon: Users, page: 'Contacts', category: 'Navigate' },
  { id: 'nav-accounts', label: 'Accounts', icon: Building2, page: 'Accounts', category: 'Navigate' },
  { id: 'nav-deals', label: 'Deals', icon: TrendingUp, page: 'Deals', category: 'Navigate' },
  { id: 'nav-tasks', label: 'Tasks', icon: CheckSquare, page: 'Tasks', category: 'Navigate' },
  { id: 'nav-products', label: 'Products', icon: Package, page: 'Products', category: 'Navigate' },
  { id: 'nav-quotes', label: 'Quotes', icon: FileText, page: 'Quotes', category: 'Navigate' },
  { id: 'nav-reports', label: 'Reports', icon: BarChart3, page: 'Reports', category: 'Navigate' },
  { id: 'nav-settings', label: 'Settings', icon: Settings, page: 'Settings', category: 'Navigate' },
];

export default function CommandPalette({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 20),
    enabled: open,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 20),
    enabled: open,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list('-created_date', 20),
    enabled: open,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-created_date', 20),
    enabled: open,
  });

  // Build search results
  const searchResults = [];

  // Add quick actions
  QUICK_ACTIONS.forEach(action => {
    if (action.label.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery) {
      searchResults.push({ ...action, type: 'action' });
    }
  });

  // Add navigation
  NAVIGATION.forEach(nav => {
    if (nav.label.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery) {
      searchResults.push({ ...nav, type: 'navigation' });
    }
  });

  // Add records
  if (searchQuery) {
    leads.forEach(lead => {
      const name = `${lead.first_name} ${lead.last_name}`;
      if (name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchResults.push({
          id: `lead-${lead.id}`,
          label: name,
          sublabel: lead.email,
          icon: Sparkles,
          type: 'record',
          entity: 'Lead',
          recordId: lead.id,
          category: 'Leads'
        });
      }
    });

    contacts.forEach(contact => {
      const name = `${contact.first_name} ${contact.last_name}`;
      if (name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.email?.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchResults.push({
          id: `contact-${contact.id}`,
          label: name,
          sublabel: contact.email,
          icon: Users,
          type: 'record',
          entity: 'Contact',
          recordId: contact.id,
          category: 'Contacts'
        });
      }
    });

    accounts.forEach(account => {
      if (account.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchResults.push({
          id: `account-${account.id}`,
          label: account.company_name,
          sublabel: account.industry,
          icon: Building2,
          type: 'record',
          entity: 'Account',
          recordId: account.id,
          category: 'Accounts'
        });
      }
    });

    deals.forEach(deal => {
      if (deal.deal_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
        searchResults.push({
          id: `deal-${deal.id}`,
          label: deal.deal_name,
          sublabel: `$${(deal.amount / 1000).toFixed(0)}K - ${deal.stage}`,
          icon: TrendingUp,
          type: 'record',
          entity: 'Deal',
          recordId: deal.id,
          category: 'Deals'
        });
      }
    });
  }

  // Group by category
  const grouped = searchResults.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Flatten for keyboard navigation
  const flatResults = searchResults.slice(0, 10);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, flatResults]);

  const handleSelect = (item) => {
    if (item.type === 'navigation') {
      window.location.href = createPageUrl(item.page);
    } else if (item.type === 'record') {
      window.location.href = createPageUrl(`${item.entity}Details`) + '?id=' + item.recordId;
    } else if (item.type === 'action') {
      if (item.action === 'create') {
        window.location.href = createPageUrl(item.entity + 's');
      }
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-4 py-3">
          <Command className="w-5 h-5 text-gray-400 mr-3" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="border-none focus-visible:ring-0 text-base"
            autoFocus
          />
          <kbd className="ml-auto hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="py-12 text-center">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No results found</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                  {category}
                </div>
                <div className="space-y-1">
                  {items.slice(0, 5).map((item, index) => {
                    const Icon = item.icon;
                    const globalIndex = flatResults.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border border-indigo-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isSelected ? 'text-indigo-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isSelected ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {item.label}
                          </p>
                          {item.sublabel && (
                            <p className="text-xs text-gray-500 truncate">{item.sublabel}</p>
                          )}
                        </div>
                        {item.type === 'action' && (
                          <Badge variant="outline" className="text-xs">
                            {item.action}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t px-4 py-2 flex items-center justify-between bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border">↵</kbd> Select
            </span>
          </div>
          <span>{flatResults.length} results</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}