import React, { memo, useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Memoized contact card component
export const ContactCard = memo(({ contact, onEdit, onDelete, onView }) => {
  const initials = useMemo(() => {
    return `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase();
  }, [contact.firstName, contact.lastName]);

  const fullName = useMemo(() => {
    return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
  }, [contact.firstName, contact.lastName]);

  const handleEdit = useCallback(() => {
    onEdit?.(contact);
  }, [onEdit, contact]);

  const handleDelete = useCallback(() => {
    onDelete?.(contact);
  }, [onDelete, contact]);

  const handleView = useCallback(() => {
    onView?.(contact);
  }, [onView, contact]);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={contact.avatar} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{fullName}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {contact.title} {contact.company && `at ${contact.company}`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
          {contact.phone && (
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
              {contact.status}
            </Badge>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ContactCard.displayName = 'ContactCard';

// Memoized deal card component
export const DealCard = memo(({ deal, onEdit, onDelete, onView }) => {
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(deal.amount || 0);
  }, [deal.amount]);

  const stageColor = useMemo(() => {
    const colors = {
      prospecting: 'bg-blue-100 text-blue-800',
      qualification: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      'closed_won': 'bg-green-100 text-green-800',
      'closed_lost': 'bg-red-100 text-red-800',
    };
    return colors[deal.stage] || 'bg-gray-100 text-gray-800';
  }, [deal.stage]);

  const probabilityColor = useMemo(() => {
    if (deal.probability >= 80) return 'text-green-600';
    if (deal.probability >= 50) return 'text-yellow-600';
    if (deal.probability >= 25) return 'text-orange-600';
    return 'text-red-600';
  }, [deal.probability]);

  const handleEdit = useCallback(() => {
    onEdit?.(deal);
  }, [onEdit, deal]);

  const handleDelete = useCallback(() => {
    onDelete?.(deal);
  }, [onDelete, deal]);

  const handleView = useCallback(() => {
    onView?.(deal);
  }, [onView, deal]);

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleView}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base truncate">{deal.name}</CardTitle>
          <Badge className={cn('text-xs', stageColor)}>
            {deal.stage?.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{formattedAmount}</span>
            <span className={cn('text-sm font-medium', probabilityColor)}>
              {deal.probability}%
            </span>
          </div>
          {deal.closeDate && (
            <p className="text-sm text-muted-foreground">
              Close Date: {new Date(deal.closeDate).toLocaleDateString()}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(); }}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DealCard.displayName = 'DealCard';

// Memoized list component with virtualization support
export const VirtualizedList = memo(({ 
  items, 
  renderItem, 
  itemHeight = 80, 
  containerHeight = 400,
  className 
}) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, scrollTop, itemHeight, containerHeight]);

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return (
    <div
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={item.id || index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Memoized search and filter component
export const SearchAndFilter = memo(({ 
  searchValue, 
  onSearchChange, 
  filters, 
  onFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  className 
}) => {
  const handleSearchChange = useCallback((e) => {
    onSearchChange?.(e.target.value);
  }, [onSearchChange]);

  const handleFilterChange = useCallback((filterKey, value) => {
    onFilterChange?.(filterKey, value);
  }, [onFilterChange]);

  const handleSortChange = useCallback((field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange?.(field, newOrder);
  }, [sortBy, sortOrder, onSortChange]);

  return (
    <div className={cn('flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4', className)}>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {filters && (
        <div className="flex space-x-2">
          {Object.entries(filters).map(([key, options]) => (
            <select
              key={key}
              onChange={(e) => handleFilterChange(key, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All {key}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
});

SearchAndFilter.displayName = 'SearchAndFilter';

// Memoized stats card component
export const StatsCard = memo(({ title, value, change, icon: Icon, trend, className }) => {
  const trendColor = useMemo(() => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  }, [trend]);

  const formattedValue = useMemo(() => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    return value;
  }, [value]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{formattedValue}</p>
          {change && (
            <p className={cn('text-sm', trendColor)}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="h-8 w-8 text-muted-foreground">
            <Icon className="h-full w-full" />
          </div>
        )}
      </div>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';

// Custom hook for debounced search
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for optimized filtering and sorting
export const useOptimizedData = (data, searchTerm, filters, sortBy, sortOrder) => {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (debouncedSearchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          result = result.filter(item => item[key] === value);
        }
      });
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, debouncedSearchTerm, filters, sortBy, sortOrder]);

  return filteredAndSortedData;
};

export default {
  ContactCard,
  DealCard,
  VirtualizedList,
  SearchAndFilter,
  StatsCard,
  useDebounce,
  useOptimizedData,
};