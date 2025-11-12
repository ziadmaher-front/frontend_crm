import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Sparkles, 
  Users, 
  Building2, 
  TrendingUp,
  Clock,
  FileText,
  Package,
  Activity as ActivityIcon,
  Filter,
  Calendar,
  DollarSign,
  Star
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ENTITY_CONFIG = {
  Lead: { 
    icon: Sparkles, 
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
    searchFields: ["first_name", "last_name", "email", "company", "serial_number"],
    displayName: (item) => `${item.first_name} ${item.last_name}`,
    subtitle: (item) => item.company,
    detailPage: "LeadDetails"
  },
  Contact: { 
    icon: Users, 
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    searchFields: ["first_name", "last_name", "email", "job_title", "serial_number"],
    displayName: (item) => `${item.first_name} ${item.last_name}`,
    subtitle: (item) => item.job_title,
    detailPage: "ContactDetails"
  },
  Account: { 
    icon: Building2, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-100",
    searchFields: ["company_name", "industry", "email", "serial_number"],
    displayName: (item) => item.company_name,
    subtitle: (item) => item.industry,
    detailPage: "AccountDetails"
  },
  Deal: { 
    icon: TrendingUp, 
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    searchFields: ["deal_name", "stage"],
    displayName: (item) => item.deal_name,
    subtitle: (item) => `${item.stage} - $${item.amount?.toLocaleString() || 0}`,
    detailPage: "Deals"
  },
  Task: { 
    icon: ActivityIcon, 
    color: "text-amber-500",
    bgColor: "bg-amber-100",
    searchFields: ["title", "status"],
    displayName: (item) => item.title,
    subtitle: (item) => item.status,
    detailPage: "Tasks"
  },
  Quote: { 
    icon: FileText, 
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    searchFields: ["quote_name", "quote_number"],
    displayName: (item) => item.quote_name,
    subtitle: (item) => item.quote_number,
    detailPage: "Quotes"
  },
  Product: { 
    icon: Package, 
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    searchFields: ["product_name", "product_code"],
    displayName: (item) => item.product_name,
    subtitle: (item) => item.product_code,
    detailPage: "Products"
  },
};

export default function GlobalSearch({ open, onOpenChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all entities
  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-updated_date', 20),
    enabled: open,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-updated_date', 20),
    enabled: open,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.list('-updated_date', 20),
    enabled: open,
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: () => base44.entities.Deal.list('-updated_date', 20),
    enabled: open,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list('-updated_date', 20),
    enabled: open,
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-updated_date', 20),
    enabled: open,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-updated_date', 20),
    enabled: open,
  });

  // Load recent items from localStorage
  useEffect(() => {
    if (open) {
      const recent = JSON.parse(localStorage.getItem('recentItems') || '[]');
      setRecentItems(recent.slice(0, 5));
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Search across all entities
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results = [];

    const searchInEntity = (items, entityType) => {
      // Filter by entity type if selected
      if (selectedEntityType !== "all" && selectedEntityType !== entityType) return;
      
      const config = ENTITY_CONFIG[entityType];
      if (!config) return;

      items.forEach(item => {
        const matches = config.searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        });

        if (matches) {
          // Calculate relevance score
          let relevanceScore = 0;
          config.searchFields.forEach(field => {
            const value = item[field];
            if (value && String(value).toLowerCase().includes(query)) {
              const fieldValue = String(value).toLowerCase();
              if (fieldValue.startsWith(query)) relevanceScore += 3;
              else if (fieldValue.includes(query)) relevanceScore += 1;
            }
          });

          results.push({
            ...item,
            entityType,
            config,
            relevanceScore,
          });
        }
      });
    };

    searchInEntity(leads, 'Lead');
    searchInEntity(contacts, 'Contact');
    searchInEntity(accounts, 'Account');
    searchInEntity(deals, 'Deal');
    searchInEntity(tasks, 'Task');
    searchInEntity(quotes, 'Quote');
    searchInEntity(products, 'Product');

    // Sort results based on selected sort option
    results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'name':
          const nameA = a.config.displayName(a).toLowerCase();
          const nameB = b.config.displayName(b).toLowerCase();
          return nameA.localeCompare(nameB);
        case 'type':
          return a.entityType.localeCompare(b.entityType);
        case 'recent':
          const dateA = new Date(a.updated_date || a.created_date || 0);
          const dateB = new Date(b.updated_date || b.created_date || 0);
          return dateB - dateA;
        default:
          return b.relevanceScore - a.relevanceScore;
      }
    });

    return results.slice(0, 12);
  }, [searchQuery, leads, contacts, accounts, deals, tasks, quotes, products, selectedEntityType, sortBy]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleItemClick(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, searchResults, selectedIndex]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleItemClick = (item) => {
    // Save to recent items
    const recent = JSON.parse(localStorage.getItem('recentItems') || '[]');
    const newRecent = [
      { 
        id: item.id, 
        entityType: item.entityType, 
        name: item.config.displayName(item),
        subtitle: item.config.subtitle(item)
      },
      ...recent.filter(r => !(r.id === item.id && r.entityType === item.entityType))
    ].slice(0, 10);
    localStorage.setItem('recentItems', JSON.stringify(newRecent));

    // Navigate to detail page
    const detailPage = item.config.detailPage;
    let url = createPageUrl(detailPage);
    if (detailPage.includes('Details')) {
      url += `?id=${item.id}`;
    }
    window.location.href = url;
    onOpenChange(false);
  };

  const handleRecentItemClick = (recentItem) => {
    const config = ENTITY_CONFIG[recentItem.entityType];
    if (!config) return;

    let url = createPageUrl(config.detailPage);
    if (config.detailPage.includes('Details')) {
      url += `?id=${recentItem.id}`;
    }
    window.location.href = url;
    onOpenChange(false);
  };

  const ResultItem = ({ item, isSelected }) => {
    const Icon = item.config.icon;
    const relevanceStars = Math.min(Math.floor(item.relevanceScore / 2), 3);
    
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
          isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleItemClick(item)}
      >
        <div className={`p-2 rounded-lg ${item.config.bgColor}`}>
          <Icon className={`w-5 h-5 ${item.config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">
              {item.config.displayName(item)}
            </p>
            {relevanceStars > 0 && (
              <div className="flex">
                {[...Array(relevanceStars)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {item.config.subtitle(item)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {item.entityType}
          </Badge>
          {item.updated_date && (
            <span className="text-xs text-gray-400">
              {new Date(item.updated_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 top-[20%]">
        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search leads, contacts, accounts, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex gap-3 pt-3 border-t">
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Lead">Leads</SelectItem>
                  <SelectItem value="Contact">Contacts</SelectItem>
                  <SelectItem value="Account">Accounts</SelectItem>
                  <SelectItem value="Deal">Deals</SelectItem>
                  <SelectItem value="Task">Tasks</SelectItem>
                  <SelectItem value="Quote">Quotes</SelectItem>
                  <SelectItem value="Product">Products</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery.trim() === '' && recentItems.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 uppercase font-semibold">
                <Clock className="w-4 h-4" />
                Recent
              </div>
              <div className="space-y-1">
                {recentItems.map((item) => {
                  const config = ENTITY_CONFIG[item.entityType];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div
                      key={`${item.entityType}-${item.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                      onClick={() => handleRecentItemClick(item)}
                    >
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.entityType}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {searchQuery.trim() !== '' && searchResults.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          )}

          {searchQuery.trim() !== '' && searchResults.length > 0 && (
            <div className="p-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-3">
                {searchResults.length} Results
              </div>
              <div className="space-y-1">
                {searchResults.map((item, index) => (
                  <ResultItem
                    key={`${item.entityType}-${item.id}`}
                    item={item}
                    isSelected={index === selectedIndex}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}