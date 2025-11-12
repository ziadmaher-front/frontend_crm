import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoizedCallback, useMemoizedValue } from '@/utils/performanceOptimizer.js';

/**
 * Virtual scrolling component for efficient rendering of large lists
 */
const VirtualScrollList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  renderItem,
  getItemKey = (item, index) => index,
  buffer = 5,
  className = '',
  loadingComponent = null,
  emptyComponent = null,
  onScroll = null,
  enableAnimation = true,
  estimatedItemHeight = null,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Calculate visible range with memoization
  const visibleRange = useMemoizedValue(() => {
    const actualItemHeight = estimatedItemHeight || itemHeight;
    const visibleCount = Math.ceil(containerHeight / actualItemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / actualItemHeight) - buffer);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + buffer * 2);
    
    return { startIndex, endIndex, visibleCount };
  }, [scrollTop, itemHeight, containerHeight, buffer, items.length, estimatedItemHeight]);

  // Calculate total height
  const totalHeight = useMemoizedValue(() => {
    return items.length * (estimatedItemHeight || itemHeight);
  }, [items.length, itemHeight, estimatedItemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemoizedValue(() => {
    return visibleRange.startIndex * (estimatedItemHeight || itemHeight);
  }, [visibleRange.startIndex, itemHeight, estimatedItemHeight]);

  // Get visible items
  const visibleItems = useMemoizedValue(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll with throttling
  const handleScroll = useMemoizedCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    // Call external scroll handler
    if (onScroll) {
      onScroll(event, {
        scrollTop: newScrollTop,
        visibleRange,
        isScrolling: true
      });
    }
  }, [onScroll, visibleRange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Default loading component
  const DefaultLoadingComponent = () => (
    <div className="space-y-2 p-4">
      {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, index) => (
        <Skeleton key={index} className="w-full" style={{ height: itemHeight - 8 }} />
      ))}
    </div>
  );

  // Default empty component
  const DefaultEmptyComponent = () => (
    <div 
      className="flex items-center justify-center text-muted-foreground"
      style={{ height: containerHeight }}
    >
      <div className="text-center">
        <p className="text-sm">No items to display</p>
      </div>
    </div>
  );

  // Render loading state
  if (!items || items.length === 0) {
    if (loadingComponent) {
      return loadingComponent;
    }
    return emptyComponent || <DefaultEmptyComponent />;
  }

  return (
    <div className={`virtual-scroll-container ${className}`} {...props}>
      <ScrollArea 
        className="w-full" 
        style={{ height: containerHeight }}
        onScrollCapture={handleScroll}
        ref={scrollElementRef}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => {
                const actualIndex = visibleRange.startIndex + index;
                const key = getItemKey(item, actualIndex);
                
                const itemContent = renderItem(item, actualIndex, {
                  isScrolling,
                  isVisible: true,
                  style: { height: estimatedItemHeight || itemHeight }
                });

                if (enableAnimation) {
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        duration: 0.2,
                        delay: index * 0.02 
                      }}
                      style={{ 
                        height: estimatedItemHeight || itemHeight,
                        minHeight: estimatedItemHeight || itemHeight
                      }}
                    >
                      {itemContent}
                    </motion.div>
                  );
                }

                return (
                  <div
                    key={key}
                    style={{ 
                      height: estimatedItemHeight || itemHeight,
                      minHeight: estimatedItemHeight || itemHeight
                    }}
                  >
                    {itemContent}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </ScrollArea>
      
      {/* Scroll indicator */}
      {isScrolling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground border"
        >
          {visibleRange.startIndex + 1}-{Math.min(visibleRange.endIndex + 1, items.length)} of {items.length}
        </motion.div>
      )}
    </div>
  );
};

/**
 * Hook for virtual scrolling with dynamic item heights
 */
export const useVirtualScroll = ({
  items,
  containerHeight,
  estimateItemHeight,
  getItemHeight,
  buffer = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState(new Map());
  const [totalHeight, setTotalHeight] = useState(0);

  // Calculate positions and heights
  const itemPositions = useMemo(() => {
    const positions = [];
    let currentPosition = 0;

    items.forEach((item, index) => {
      positions[index] = currentPosition;
      const height = itemHeights.get(index) || estimateItemHeight(item, index);
      currentPosition += height;
    });

    setTotalHeight(currentPosition);
    return positions;
  }, [items, itemHeights, estimateItemHeight]);

  // Find visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Binary search for start index
    let left = 0;
    let right = items.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (itemPositions[mid] < scrollTop) {
        startIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    for (let i = startIndex; i < items.length; i++) {
      if (itemPositions[i] > viewportBottom) {
        endIndex = i - 1;
        break;
      }
    }

    // Apply buffer
    startIndex = Math.max(0, startIndex - buffer);
    endIndex = Math.min(items.length - 1, endIndex + buffer);

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemPositions, items.length, buffer]);

  // Update item height
  const updateItemHeight = useCallback((index, height) => {
    setItemHeights(prev => {
      const newHeights = new Map(prev);
      newHeights.set(index, height);
      return newHeights;
    });
  }, []);

  return {
    scrollTop,
    setScrollTop,
    visibleRange,
    totalHeight,
    itemPositions,
    updateItemHeight
  };
};

/**
 * Higher-order component for adding virtual scrolling to any list component
 */
export const withVirtualScrolling = (ListComponent, options = {}) => {
  return (props) => (
    <VirtualScrollList {...options} {...props}>
      <ListComponent {...props} />
    </VirtualScrollList>
  );
};

export default VirtualScrollList;