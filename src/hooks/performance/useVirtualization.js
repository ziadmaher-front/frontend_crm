// Advanced Virtualization Hook for Performance Optimization
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useResizeObserver } from '../useResizeObserver';
import { useDebounce } from '../useDebounce';

export const useVirtualization = ({
  count = 0,
  size = 50,
  overscan = 5,
  enabled = true,
  horizontal = false,
  dynamic = false,
  estimateSize = null,
  getItemKey = null,
  scrollingDelay = 150,
  containerHeight = null,
  containerWidth = null,
}) => {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [containerSize, setContainerSize] = useState(0);
  const [itemSizes, setItemSizes] = useState(new Map());
  
  const scrollElementRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const measurementCache = useRef(new Map());
  const observerRef = useRef(null);

  // Debounced scroll state
  const debouncedIsScrolling = useDebounce(isScrolling, scrollingDelay);

  // Measure container size
  const containerRef = useCallback((node) => {
    if (node) {
      scrollElementRef.current = node;
      const size = horizontal ? node.clientWidth : node.clientHeight;
      setContainerSize(size);
      
      // Set up resize observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      observerRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newSize = horizontal 
            ? entry.contentRect.width 
            : entry.contentRect.height;
          setContainerSize(newSize);
        }
      });
      
      observerRef.current.observe(node);
    }
  }, [horizontal]);

  // Get item size (static or dynamic)
  const getItemSize = useCallback((index) => {
    if (dynamic && estimateSize) {
      const cached = measurementCache.current.get(index);
      if (cached !== undefined) return cached;
      
      const estimated = estimateSize(index);
      measurementCache.current.set(index, estimated);
      return estimated;
    }
    
    if (itemSizes.has(index)) {
      return itemSizes.get(index);
    }
    
    return size;
  }, [dynamic, estimateSize, itemSizes, size]);

  // Calculate total size
  const totalSize = useMemo(() => {
    if (!enabled || count === 0) return 0;
    
    if (dynamic) {
      let total = 0;
      for (let i = 0; i < count; i++) {
        total += getItemSize(i);
      }
      return total;
    }
    
    return count * size;
  }, [enabled, count, dynamic, getItemSize, size]);

  // Calculate visible range
  const range = useMemo(() => {
    if (!enabled || count === 0 || containerSize === 0) {
      return {
        start: 0,
        end: 0,
        offsetStart: 0,
        offsetEnd: 0,
      };
    }

    let start = 0;
    let end = 0;
    let offsetStart = 0;
    let offsetEnd = 0;

    if (dynamic) {
      // Dynamic sizing calculation
      let currentOffset = 0;
      let startFound = false;
      
      for (let i = 0; i < count; i++) {
        const itemSize = getItemSize(i);
        
        if (!startFound && currentOffset + itemSize > scrollOffset) {
          start = Math.max(0, i - overscan);
          offsetStart = currentOffset - (i - start) * (size || 50); // Fallback for offset calculation
          startFound = true;
        }
        
        if (startFound && currentOffset > scrollOffset + containerSize) {
          end = Math.min(count - 1, i + overscan);
          offsetEnd = currentOffset;
          break;
        }
        
        currentOffset += itemSize;
      }
      
      if (!startFound) {
        start = Math.max(0, count - overscan);
        offsetStart = totalSize - (count - start) * (size || 50);
      }
      
      if (end === 0) {
        end = Math.min(count - 1, start + Math.ceil(containerSize / (size || 50)) + overscan);
        offsetEnd = totalSize;
      }
    } else {
      // Static sizing calculation
      start = Math.max(0, Math.floor(scrollOffset / size) - overscan);
      end = Math.min(
        count - 1,
        Math.ceil((scrollOffset + containerSize) / size) + overscan
      );
      offsetStart = start * size;
      offsetEnd = Math.min(totalSize, (end + 1) * size);
    }

    return { start, end, offsetStart, offsetEnd };
  }, [
    enabled,
    count,
    containerSize,
    scrollOffset,
    overscan,
    dynamic,
    getItemSize,
    size,
    totalSize,
  ]);

  // Generate virtual items
  const virtualItems = useMemo(() => {
    if (!enabled) {
      return Array.from({ length: count }, (_, index) => ({
        index,
        start: index * size,
        size: getItemSize(index),
        end: (index + 1) * size,
        key: getItemKey ? getItemKey(index) : index,
      }));
    }

    const items = [];
    let offset = range.offsetStart;

    for (let i = range.start; i <= range.end; i++) {
      const itemSize = getItemSize(i);
      items.push({
        index: i,
        start: offset,
        size: itemSize,
        end: offset + itemSize,
        key: getItemKey ? getItemKey(i) : i,
      });
      offset += itemSize;
    }

    return items;
  }, [enabled, count, size, range, getItemSize, getItemKey]);

  // Handle scroll
  const handleScroll = useCallback((event) => {
    if (!enabled) return;

    const offset = horizontal 
      ? event.currentTarget.scrollLeft 
      : event.currentTarget.scrollTop;
    
    setScrollOffset(offset);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set new timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollingDelay);
  }, [enabled, horizontal, scrollingDelay]);

  // Scroll to item
  const scrollToItem = useCallback((index, align = 'auto') => {
    if (!scrollElementRef.current || !enabled) return;

    let offset = 0;
    
    if (dynamic) {
      for (let i = 0; i < index; i++) {
        offset += getItemSize(i);
      }
    } else {
      offset = index * size;
    }

    const itemSize = getItemSize(index);
    
    let scrollTo = offset;
    
    switch (align) {
      case 'start':
        scrollTo = offset;
        break;
      case 'end':
        scrollTo = offset + itemSize - containerSize;
        break;
      case 'center':
        scrollTo = offset + itemSize / 2 - containerSize / 2;
        break;
      case 'auto':
      default:
        const currentScroll = scrollOffset;
        const currentEnd = currentScroll + containerSize;
        
        if (offset < currentScroll) {
          scrollTo = offset;
        } else if (offset + itemSize > currentEnd) {
          scrollTo = offset + itemSize - containerSize;
        } else {
          return; // Already visible
        }
        break;
    }

    scrollTo = Math.max(0, Math.min(scrollTo, totalSize - containerSize));

    if (horizontal) {
      scrollElementRef.current.scrollLeft = scrollTo;
    } else {
      scrollElementRef.current.scrollTop = scrollTo;
    }
  }, [
    enabled,
    dynamic,
    getItemSize,
    size,
    containerSize,
    scrollOffset,
    totalSize,
    horizontal,
  ]);

  // Measure item size (for dynamic sizing)
  const measureItem = useCallback((index, element) => {
    if (!dynamic || !element) return;

    const measuredSize = horizontal 
      ? element.offsetWidth 
      : element.offsetHeight;
    
    const currentSize = itemSizes.get(index);
    
    if (currentSize !== measuredSize) {
      setItemSizes(prev => new Map(prev).set(index, measuredSize));
      measurementCache.current.set(index, measuredSize);
    }
  }, [dynamic, horizontal, itemSizes]);

  // Get item props for rendering
  const getItemProps = useCallback((item) => ({
    key: item.key,
    'data-index': item.index,
    style: {
      position: 'absolute',
      [horizontal ? 'left' : 'top']: item.start,
      [horizontal ? 'width' : 'height']: item.size,
      [horizontal ? 'height' : 'width']: '100%',
    },
    ref: dynamic ? (el) => measureItem(item.index, el) : undefined,
  }), [horizontal, dynamic, measureItem]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Reset measurements when count changes
  useEffect(() => {
    if (dynamic) {
      setItemSizes(new Map());
      measurementCache.current.clear();
    }
  }, [count, dynamic]);

  return {
    virtualItems,
    totalSize,
    scrollElementRef: containerRef,
    scrollToItem,
    getItemProps,
    measureItem,
    isScrolling: debouncedIsScrolling,
    scrollOffset,
    containerSize,
    range,
    
    // Event handlers
    onScroll: handleScroll,
    
    // Utilities
    getItemSize,
    enabled,
  };
};

export default useVirtualization;