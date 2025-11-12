import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  SparklesIcon,
  ClockIcon,
  BookmarkIcon,
  TagIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  LightBulbIcon,
  BoltIcon,
  FireIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  Bars3Icon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Advanced Search Engine with AI capabilities
class AdvancedSearchEngine {
  constructor() {
    this.searchHistory = [];
    this.savedSearches = [];
    this.searchSuggestions = [];
    this.semanticIndex = new Map();
    this.searchFilters = new Map();
    this.searchResults = [];
    this.searchAnalytics = {
      totalSearches: 0,
      popularQueries: [],
      searchTrends: [],
      avgResponseTime: 0,
      successRate: 0
    };
    this.aiModel = null;
    this.vectorStore = new Map();
    this.synonyms = new Map();
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    this.initializeAI();
    this.loadSearchData();
  }

  // Initialize AI capabilities
  async initializeAI() {
    try {
      // Initialize semantic search capabilities
      this.buildSemanticIndex();
      this.loadSynonyms();
      this.initializeVectorStore();
    } catch (error) {
      console.error('AI initialization error:', error);
    }
  }

  // Build semantic index for better search understanding
  buildSemanticIndex() {
    const semanticMappings = {
      // Customer related
      'customer': ['client', 'user', 'account', 'contact', 'lead', 'prospect'],
      'sales': ['revenue', 'income', 'earnings', 'profit', 'deal', 'transaction'],
      'contact': ['reach', 'communicate', 'call', 'email', 'message', 'touch'],
      'meeting': ['appointment', 'call', 'conference', 'discussion', 'session'],
      'task': ['todo', 'action', 'assignment', 'work', 'job', 'activity'],
      'opportunity': ['deal', 'prospect', 'lead', 'chance', 'potential'],
      'product': ['item', 'service', 'offering', 'solution', 'goods'],
      'company': ['business', 'organization', 'firm', 'corporation', 'enterprise'],
      'project': ['initiative', 'campaign', 'program', 'effort', 'venture'],
      'report': ['analysis', 'summary', 'overview', 'dashboard', 'metrics']
    };

    for (const [key, synonyms] of Object.entries(semanticMappings)) {
      this.semanticIndex.set(key, new Set(synonyms));
      synonyms.forEach(synonym => {
        if (!this.semanticIndex.has(synonym)) {
          this.semanticIndex.set(synonym, new Set());
        }
        this.semanticIndex.get(synonym).add(key);
      });
    }
  }

  // Load synonyms for query expansion
  loadSynonyms() {
    const synonymGroups = [
      ['big', 'large', 'huge', 'massive', 'enormous'],
      ['small', 'tiny', 'little', 'mini', 'compact'],
      ['fast', 'quick', 'rapid', 'speedy', 'swift'],
      ['slow', 'sluggish', 'gradual', 'delayed'],
      ['good', 'excellent', 'great', 'outstanding', 'superb'],
      ['bad', 'poor', 'terrible', 'awful', 'horrible'],
      ['new', 'recent', 'latest', 'fresh', 'current'],
      ['old', 'ancient', 'vintage', 'legacy', 'outdated']
    ];

    synonymGroups.forEach(group => {
      group.forEach(word => {
        this.synonyms.set(word, new Set(group.filter(w => w !== word)));
      });
    });
  }

  // Initialize vector store for semantic similarity
  initializeVectorStore() {
    // This would typically use a proper vector database
    // For demo purposes, we'll use a simple implementation
    this.vectorStore = new Map();
  }

  // Perform advanced search with AI enhancements
  async search(query, filters = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      // Preprocess query
      const processedQuery = this.preprocessQuery(query);
      
      // Generate search suggestions
      const suggestions = await this.generateSuggestions(processedQuery);
      
      // Expand query with synonyms and semantic terms
      const expandedQuery = this.expandQuery(processedQuery);
      
      // Apply filters
      const filteredResults = await this.applyFilters(expandedQuery, filters);
      
      // Rank results using AI scoring
      const rankedResults = this.rankResults(filteredResults, processedQuery);
      
      // Update search analytics
      const responseTime = Date.now() - startTime;
      this.updateAnalytics(query, rankedResults.length, responseTime);
      
      // Save to search history
      this.addToHistory(query, filters, rankedResults.length);
      
      return {
        query: processedQuery,
        expandedQuery,
        results: rankedResults,
        suggestions,
        totalResults: rankedResults.length,
        responseTime,
        filters: filters
      };
      
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Preprocess search query
  preprocessQuery(query) {
    if (!query) return '';
    
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => !this.stopWords.has(word))
      .join(' ');
  }

  // Expand query with synonyms and semantic terms
  expandQuery(query) {
    const words = query.split(' ');
    const expandedTerms = new Set(words);
    
    words.forEach(word => {
      // Add synonyms
      const synonyms = this.synonyms.get(word);
      if (synonyms) {
        synonyms.forEach(synonym => expandedTerms.add(synonym));
      }
      
      // Add semantic terms
      const semanticTerms = this.semanticIndex.get(word);
      if (semanticTerms) {
        semanticTerms.forEach(term => expandedTerms.add(term));
      }
    });
    
    return Array.from(expandedTerms).join(' ');
  }

  // Generate AI-powered search suggestions
  async generateSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    
    // Historical suggestions
    const historicalSuggestions = this.searchHistory
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(item => ({
        type: 'history',
        text: item.query,
        icon: ClockIcon,
        count: item.resultCount
      }));
    
    suggestions.push(...historicalSuggestions);
    
    // Semantic suggestions
    const semanticSuggestions = this.generateSemanticSuggestions(query);
    suggestions.push(...semanticSuggestions);
    
    // Popular suggestions
    const popularSuggestions = this.searchAnalytics.popularQueries
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(item => ({
        type: 'popular',
        text: item.query,
        icon: FireIcon,
        count: item.count
      }));
    
    suggestions.push(...popularSuggestions);
    
    // Auto-complete suggestions
    const autoCompleteSuggestions = this.generateAutoComplete(query);
    suggestions.push(...autoCompleteSuggestions);
    
    return suggestions.slice(0, 8);
  }

  // Generate semantic suggestions
  generateSemanticSuggestions(query) {
    const suggestions = [];
    const words = query.split(' ');
    
    words.forEach(word => {
      const semanticTerms = this.semanticIndex.get(word);
      if (semanticTerms) {
        semanticTerms.forEach(term => {
          if (term !== word) {
            suggestions.push({
              type: 'semantic',
              text: query.replace(word, term),
              icon: SparklesIcon,
              reason: `Similar to "${word}"`
            });
          }
        });
      }
    });
    
    return suggestions.slice(0, 3);
  }

  // Generate auto-complete suggestions
  generateAutoComplete(query) {
    const commonCompletions = [
      'customers in',
      'sales from',
      'meetings with',
      'tasks for',
      'opportunities in',
      'reports about',
      'contacts from',
      'deals closed',
      'revenue by',
      'performance of'
    ];
    
    return commonCompletions
      .filter(completion => completion.startsWith(query.toLowerCase()))
      .slice(0, 3)
      .map(completion => ({
        type: 'autocomplete',
        text: completion,
        icon: LightBulbIcon
      }));
  }

  // Apply search filters
  async applyFilters(query, filters) {
    // This would integrate with your actual data source
    // For demo purposes, we'll return mock data
    const mockResults = this.generateMockResults(query, filters);
    
    let filteredResults = [...mockResults];
    
    // Apply date filters
    if (filters.dateRange) {
      filteredResults = filteredResults.filter(result => {
        const resultDate = new Date(result.date);
        return resultDate >= filters.dateRange.start && resultDate <= filters.dateRange.end;
      });
    }
    
    // Apply type filters
    if (filters.types && filters.types.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.types.includes(result.type)
      );
    }
    
    // Apply status filters
    if (filters.status && filters.status.length > 0) {
      filteredResults = filteredResults.filter(result => 
        filters.status.includes(result.status)
      );
    }
    
    // Apply value range filters
    if (filters.valueRange) {
      filteredResults = filteredResults.filter(result => 
        result.value >= filters.valueRange.min && result.value <= filters.valueRange.max
      );
    }
    
    return filteredResults;
  }

  // Generate mock results for demo
  generateMockResults(query, filters) {
    const types = ['customer', 'deal', 'task', 'meeting', 'contact', 'opportunity', 'report'];
    const statuses = ['active', 'completed', 'pending', 'cancelled', 'in-progress'];
    const results = [];
    
    for (let i = 0; i < 50; i++) {
      results.push({
        id: `result_${i}`,
        title: `${query} Result ${i + 1}`,
        description: `This is a search result for "${query}" with relevant information.`,
        type: types[Math.floor(Math.random() * types.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        value: Math.floor(Math.random() * 10000),
        relevanceScore: Math.random(),
        tags: ['tag1', 'tag2', 'tag3'].slice(0, Math.floor(Math.random() * 3) + 1),
        author: `User ${Math.floor(Math.random() * 10) + 1}`,
        url: `/item/${i}`
      });
    }
    
    return results;
  }

  // Rank results using AI scoring
  rankResults(results, query) {
    const queryWords = query.split(' ');
    
    return results
      .map(result => {
        let score = result.relevanceScore || 0;
        
        // Title relevance
        const titleWords = result.title.toLowerCase().split(' ');
        const titleMatches = queryWords.filter(word => 
          titleWords.some(titleWord => titleWord.includes(word))
        ).length;
        score += (titleMatches / queryWords.length) * 0.4;
        
        // Description relevance
        const descWords = result.description.toLowerCase().split(' ');
        const descMatches = queryWords.filter(word => 
          descWords.some(descWord => descWord.includes(word))
        ).length;
        score += (descMatches / queryWords.length) * 0.3;
        
        // Recency boost
        const daysSinceCreated = (Date.now() - new Date(result.date).getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, (30 - daysSinceCreated) / 30) * 0.2;
        
        // Status boost
        if (result.status === 'active') score += 0.1;
        
        return { ...result, searchScore: score };
      })
      .sort((a, b) => b.searchScore - a.searchScore);
  }

  // Update search analytics
  updateAnalytics(query, resultCount, responseTime) {
    this.searchAnalytics.totalSearches++;
    this.searchAnalytics.avgResponseTime = 
      (this.searchAnalytics.avgResponseTime + responseTime) / 2;
    
    // Update popular queries
    const existingQuery = this.searchAnalytics.popularQueries.find(q => q.query === query);
    if (existingQuery) {
      existingQuery.count++;
    } else {
      this.searchAnalytics.popularQueries.push({ query, count: 1 });
    }
    
    // Sort popular queries
    this.searchAnalytics.popularQueries.sort((a, b) => b.count - a.count);
    this.searchAnalytics.popularQueries = this.searchAnalytics.popularQueries.slice(0, 10);
    
    // Update success rate
    if (resultCount > 0) {
      this.searchAnalytics.successRate = 
        (this.searchAnalytics.successRate + 1) / 2;
    }
  }

  // Add search to history
  addToHistory(query, filters, resultCount) {
    this.searchHistory.unshift({
      id: Math.random().toString(36).substr(2, 9),
      query,
      filters,
      resultCount,
      timestamp: new Date()
    });
    
    // Keep only last 50 searches
    this.searchHistory = this.searchHistory.slice(0, 50);
  }

  // Save search for later
  saveSearch(query, filters, name) {
    const savedSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || query,
      query,
      filters,
      createdAt: new Date(),
      lastUsed: new Date()
    };
    
    this.savedSearches.push(savedSearch);
    return savedSearch;
  }

  // Load saved search
  loadSavedSearch(searchId) {
    const savedSearch = this.savedSearches.find(s => s.id === searchId);
    if (savedSearch) {
      savedSearch.lastUsed = new Date();
      return savedSearch;
    }
    return null;
  }

  // Get search analytics
  getAnalytics() {
    return {
      ...this.searchAnalytics,
      historyCount: this.searchHistory.length,
      savedSearchCount: this.savedSearches.length
    };
  }

  // Load search data from storage
  loadSearchData() {
    try {
      const stored = localStorage.getItem('search_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.searchHistory = data.history || [];
        this.savedSearches = data.saved || [];
        this.searchAnalytics = { ...this.searchAnalytics, ...data.analytics };
      }
    } catch (error) {
      console.warn('Failed to load search data:', error);
    }
  }

  // Save search data to storage
  saveSearchData() {
    try {
      const data = {
        history: this.searchHistory,
        saved: this.savedSearches,
        analytics: this.searchAnalytics
      };
      localStorage.setItem('search_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save search data:', error);
    }
  }
}

// Search Input Component with AI suggestions
const SearchInput = ({ onSearch, onSuggestionSelect, suggestions, loading }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search customers, deals, tasks, and more..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => setShowSuggestions(query.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-12 h-12 text-lg"
          />
          {loading && (
            <ArrowPathIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
          )}
          {query && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* AI Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <suggestion.icon className="h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.text}</div>
                  {suggestion.reason && (
                    <div className="text-xs text-gray-500">{suggestion.reason}</div>
                  )}
                </div>
                {suggestion.count && (
                  <Badge variant="secondary" className="text-xs">
                    {suggestion.count}
                  </Badge>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Advanced Filters Component
const AdvancedFilters = ({ filters, onFiltersChange, onReset }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Filters</span>
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary">{Object.keys(filters).length}</Badge>
          )}
        </Button>
        
        {Object.keys(filters).length > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear All
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Content Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Content Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['customer', 'deal', 'task', 'meeting', 'contact', 'opportunity'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.types?.includes(type) || false}
                          onCheckedChange={(checked) => {
                            const currentTypes = filters.types || [];
                            const newTypes = checked
                              ? [...currentTypes, type]
                              : currentTypes.filter(t => t !== type);
                            handleFilterChange('types', newTypes);
                          }}
                        />
                        <Label htmlFor={type} className="text-sm capitalize">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['active', 'completed', 'pending', 'cancelled'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={status}
                          checked={filters.status?.includes(status) || false}
                          onCheckedChange={(checked) => {
                            const currentStatus = filters.status || [];
                            const newStatus = checked
                              ? [...currentStatus, status]
                              : currentStatus.filter(s => s !== status);
                            handleFilterChange('status', newStatus);
                          }}
                        />
                        <Label htmlFor={status} className="text-sm capitalize">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">From</Label>
                      <Input
                        type="date"
                        value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                        onChange={(e) => {
                          const start = e.target.value ? new Date(e.target.value) : null;
                          handleFilterChange('dateRange', {
                            ...filters.dateRange,
                            start
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">To</Label>
                      <Input
                        type="date"
                        value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                        onChange={(e) => {
                          const end = e.target.value ? new Date(e.target.value) : null;
                          handleFilterChange('dateRange', {
                            ...filters.dateRange,
                            end
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Value Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Value Range</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.valueRange?.min || 0, filters.valueRange?.max || 10000]}
                      onValueChange={([min, max]) => {
                        handleFilterChange('valueRange', { min, max });
                      }}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${filters.valueRange?.min || 0}</span>
                      <span>${filters.valueRange?.max || 10000}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Search Results Component
const SearchResults = ({ results, loading, query, viewMode, onViewModeChange }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Searching...</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">
          {query ? `No results for "${query}"` : 'Try adjusting your search or filters'}
        </p>
      </div>
    );
  }

  const getTypeIcon = (type) => {
    const icons = {
      customer: UserIcon,
      deal: CurrencyDollarIcon,
      task: CheckCircleIcon,
      meeting: CalendarIcon,
      contact: PhoneIcon,
      opportunity: ArrowTrendingUpIcon,
      report: DocumentTextIcon
    };
    return icons[type] || DocumentTextIcon;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      'in-progress': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {results.length} results found
          {query && ` for "${query}"`}
        </p>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <ListBulletIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {results.map((result, index) => {
          const TypeIcon = getTypeIcon(result.type);
          
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TypeIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h3>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {result.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="capitalize">{result.type}</span>
                          <span>${result.value.toLocaleString()}</span>
                          <span>{result.date.toLocaleDateString()}</span>
                        </div>
                        
                        {result.searchScore && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-3 w-3" />
                            <span>{Math.round(result.searchScore * 100)}%</span>
                          </div>
                        )}
                      </div>
                      
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Main Advanced Search Component
const AdvancedSearch = () => {
  const [engine] = useState(() => new AdvancedSearchEngine());
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchStats, setSearchStats] = useState(null);
  const { addNotification } = useNotifications();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery, searchFilters) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const searchResult = await engine.search(searchQuery, searchFilters);
        setResults(searchResult.results);
        setSearchStats({
          totalResults: searchResult.totalResults,
          responseTime: searchResult.responseTime,
          expandedQuery: searchResult.expandedQuery
        });
        
        // Generate suggestions for next search
        const newSuggestions = await engine.generateSuggestions(searchQuery);
        setSuggestions(newSuggestions);
        
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Search Error',
          message: 'Failed to perform search. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    }, 300),
    [engine, addNotification]
  );

  // Handle search
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery, filters);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    handleSearch(suggestion.text);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    if (query) {
      debouncedSearch(query, newFilters);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    if (query) {
      debouncedSearch(query, {});
    }
  };

  // Generate suggestions on query change
  useEffect(() => {
    if (query.length > 1) {
      engine.generateSuggestions(query).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, engine]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Search</h1>
          <p className="text-gray-600">
            AI-powered search with semantic understanding and smart suggestions
          </p>
        </div>
        
        {searchStats && (
          <div className="text-right text-sm text-gray-500">
            <div>{searchStats.totalResults} results</div>
            <div>{searchStats.responseTime}ms</div>
          </div>
        )}
      </div>

      {/* Search Input */}
      <SearchInput
        onSearch={handleSearch}
        onSuggestionSelect={handleSuggestionSelect}
        suggestions={suggestions}
        loading={loading}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Search Results */}
      <SearchResults
        results={results}
        loading={loading}
        query={query}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  );
};

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default AdvancedSearch;
export { AdvancedSearchEngine };