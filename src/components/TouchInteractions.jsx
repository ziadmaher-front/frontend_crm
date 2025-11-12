import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, Trash2, Archive, Star } from "lucide-react";

// Swipe-to-delete component
export function SwipeToDelete({
  children,
  onDelete,
  onArchive,
  deleteThreshold = 100,
  className
}) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      setTranslateX(Math.max(deltaX, -150));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (translateX < -deleteThreshold) {
      // Trigger delete action
      onDelete?.();
    } else if (translateX < -50) {
      // Show action buttons
      setTranslateX(-120);
    } else {
      // Snap back
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    setTranslateX(-300);
    setTimeout(() => onDelete?.(), 200);
  };

  const handleArchive = () => {
    setTranslateX(0);
    onArchive?.();
  };

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {/* Action buttons */}
      <div className="absolute right-0 top-0 h-full flex items-center bg-red-500 text-white">
        <button
          onClick={handleArchive}
          className="h-full px-4 bg-yellow-500 hover:bg-yellow-600 transition-colors touch-manipulation"
          aria-label="Archive item"
        >
          <Archive className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="h-full px-4 bg-red-500 hover:bg-red-600 transition-colors touch-manipulation"
          aria-label="Delete item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out bg-white"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Pull-to-refresh component
export function PullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || containerRef.current?.scrollTop > 0) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 0) {
      e.preventDefault();
      setPullDistance(Math.min(deltaY * 0.5, 120));
    }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);
    
    if (pullDistance > refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const refreshProgress = Math.min(pullDistance / refreshThreshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-50 transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          transform: `translateY(-${Math.max(0, pullDistance - 60)}px)`
        }}
      >
        {pullDistance > 20 && (
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                isRefreshing && "animate-spin",
                refreshProgress >= 1 && !isRefreshing && "rotate-180"
              )}
            />
            <span className="text-sm font-medium">
              {isRefreshing
                ? "Refreshing..."
                : refreshProgress >= 1
                ? "Release to refresh"
                : "Pull to refresh"
              }
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Touch-friendly button with haptic feedback simulation
export function TouchButton({
  children,
  onClick,
  variant = "default",
  size = "md",
  disabled = false,
  className,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef(null);

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true);
      // Simulate haptic feedback with a subtle vibration
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const variants = {
    default: "bg-indigo-600 text-white active:bg-indigo-700",
    outline: "border border-gray-300 bg-white text-gray-700 active:bg-gray-50",
    ghost: "text-gray-700 active:bg-gray-100",
    destructive: "bg-red-600 text-white active:bg-red-700"
  };

  const sizes = {
    sm: "h-10 px-4 text-sm min-w-[44px]", // Minimum 44px for touch targets
    md: "h-12 px-6 text-base min-w-[44px]",
    lg: "h-14 px-8 text-lg min-w-[44px]"
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 touch-manipulation",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
        "disabled:opacity-50 disabled:pointer-events-none",
        "transform active:scale-95",
        variants[variant],
        sizes[size],
        isPressed && "scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Swipe navigation for tabs or carousels
export function SwipeNavigation({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className
}) {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // If vertical movement is greater than horizontal, don't handle swipe
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setIsSwiping(false);
      return;
    }

    // Prevent default to avoid scrolling
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    if (!isSwiping) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    setIsSwiping(false);
  };

  return (
    <div
      className={cn("touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Long press component
export function LongPress({
  children,
  onLongPress,
  delay = 500,
  className
}) {
  const [isPressed, setIsPressed] = useState(false);
  const timeoutRef = useRef(null);

  const handleTouchStart = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress?.();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, delay);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "touch-manipulation transition-transform duration-150",
        isPressed && "scale-95",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Touch-friendly card with press states
export function TouchCard({
  children,
  onClick,
  onTap, // Support both onClick and onTap for backward compatibility
  onLongPress,
  className,
  ...props
}) {
  const handleClick = onClick || onTap;
  
  return (
    <LongPress onLongPress={onLongPress}>
      <div
        onClick={handleClick}
        className={cn(
          "w-full h-auto p-0 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer",
          "focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none",
          "transition-all duration-150 touch-manipulation transform active:scale-95",
          className
        )}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick?.();
          }
        }}
        {...props}
      >
        <div className="p-4 w-full text-left">
          {children}
        </div>
      </div>
    </LongPress>
  );
}