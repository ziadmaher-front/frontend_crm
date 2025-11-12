import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useMemoizedCallback, useMemoizedValue } from '@/utils/performanceOptimizer.js';

/**
 * Mobile-optimized container with touch gestures and responsive behavior
 */
const MobileOptimizer = ({
  children,
  enableSwipeGestures = true,
  enablePullToRefresh = false,
  onSwipeLeft = null,
  onSwipeRight = null,
  onSwipeUp = null,
  onSwipeDown = null,
  onPullToRefresh = null,
  swipeThreshold = 50,
  className = '',
  ...props
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px) and (min-width: 769px)');
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const opacity = useTransform(y, [0, 100], [1, 0.8]);
  const scale = useTransform(y, [0, 100], [1, 0.95]);

  // Handle pan gesture
  const handlePan = useMemoizedCallback((event, info) => {
    if (!enableSwipeGestures) return;

    const { offset, velocity } = info;
    
    // Update motion values
    x.set(offset.x);
    y.set(offset.y);
  }, [enableSwipeGestures, x, y]);

  // Handle pan end
  const handlePanEnd = useMemoizedCallback((event, info) => {
    if (!enableSwipeGestures) return;

    const { offset, velocity } = info;
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);

    // Reset position
    x.set(0);
    y.set(0);

    // Determine swipe direction and trigger callbacks
    if (absOffsetX > swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight(info);
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft(info);
      }
    }

    if (absOffsetY > swipeThreshold || Math.abs(velocity.y) > 500) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown(info);
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp(info);
      }
    }

    // Handle pull to refresh
    if (enablePullToRefresh && offset.y > 100 && onPullToRefresh && !isRefreshing) {
      setIsRefreshing(true);
      onPullToRefresh().finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [
    enableSwipeGestures,
    swipeThreshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enablePullToRefresh,
    onPullToRefresh,
    isRefreshing,
    x,
    y
  ]);

  // Touch event handlers for additional touch support
  const handleTouchStart = useMemoizedCallback((e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useMemoizedCallback((e) => {
    if (!enableSwipeGestures) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > swipeThreshold || absY > swipeThreshold) {
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight({ offset: { x: deltaX, y: deltaY } });
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft({ offset: { x: deltaX, y: deltaY } });
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown({ offset: { x: deltaX, y: deltaY } });
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp({ offset: { x: deltaX, y: deltaY } });
        }
      }
    }
  }, [enableSwipeGestures, touchStart, swipeThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  // Responsive classes
  const responsiveClasses = useMemoizedValue(() => {
    const classes = [];
    
    if (isMobile) {
      classes.push('mobile-optimized');
    }
    
    if (isTablet) {
      classes.push('tablet-optimized');
    }
    
    return classes.join(' ');
  }, [isMobile, isTablet]);

  return (
    <motion.div
      ref={containerRef}
      className={`mobile-optimizer ${responsiveClasses} ${className}`}
      style={{
        x: enableSwipeGestures ? x : 0,
        y: enableSwipeGestures ? y : 0,
        opacity: enablePullToRefresh ? opacity : 1,
        scale: enablePullToRefresh ? scale : 1,
      }}
      drag={enableSwipeGestures}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: isRefreshing ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-background border rounded-full p-2 shadow-lg">
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  );
};

/**
 * Hook for responsive breakpoints
 */
export const useResponsiveBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px) and (min-width: 641px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1440px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'
  };
};

/**
 * Hook for touch gestures
 */
export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = threshold;

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchEndHandler = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd: onTouchEndHandler
  };
};

/**
 * Responsive grid component
 */
export const ResponsiveGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 4,
  className = '',
  ...props 
}) => {
  const { breakpoint } = useResponsiveBreakpoints();
  
  const gridCols = useMemoizedValue(() => {
    return cols[breakpoint] || cols.desktop || 3;
  }, [cols, breakpoint]);

  const gridClasses = useMemoizedValue(() => {
    return `grid grid-cols-${gridCols} gap-${gap} ${className}`;
  }, [gridCols, gap, className]);

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Mobile-optimized modal
 */
export const MobileModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  fullScreen = false,
  className = '',
  ...props 
}) => {
  const { isMobile } = useResponsiveBreakpoints();
  
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ 
          opacity: 0, 
          scale: isMobile ? 1 : 0.95,
          y: isMobile ? '100%' : 0 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0 
        }}
        exit={{ 
          opacity: 0, 
          scale: isMobile ? 1 : 0.95,
          y: isMobile ? '100%' : 0 
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          ${isMobile || fullScreen 
            ? 'fixed inset-0 rounded-none' 
            : 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full mx-4 rounded-lg'
          }
          bg-background border shadow-lg ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              ×
            </button>
          </div>
        )}
        <div className={isMobile || fullScreen ? 'flex-1 overflow-auto' : ''}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileOptimizer;