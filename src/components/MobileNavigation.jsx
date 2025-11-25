import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  Sparkles,
  CheckSquare,
  Activity,
  FileText,
  Megaphone,
  ShoppingCart,
  Settings,
  User as UserIcon,
  BarChart3,
  Search as SearchIcon,
  Command,
  Menu,
  X,
  Home,
  Phone,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SwipeNavigation, TouchButton, LongPress } from "@/components/TouchInteractions";

const primaryNavItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    shortTitle: "Home"
  },
  {
    title: "Leads",
    url: createPageUrl("Leads"),
    icon: Sparkles,
    shortTitle: "Leads"
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
    shortTitle: "Contacts"
  },
  {
    title: "Deals",
    url: createPageUrl("Deals"),
    icon: TrendingUp,
    shortTitle: "Deals"
  },
  {
    title: "More",
    url: "#",
    icon: Menu,
    shortTitle: "More"
  }
];

const allNavItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Leads",
    url: createPageUrl("Leads"),
    icon: Sparkles,
  },
  {
    title: "Contacts",
    url: createPageUrl("Contacts"),
    icon: Users,
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: Building2,
  },
  {
    title: "Deals",
    url: createPageUrl("Deals"),
    icon: TrendingUp,
  },
  {
    title: "Forecasting",
    url: createPageUrl("Forecasting"),
    icon: BarChart3,
  },
  {
    title: "Sales Orders",
    url: createPageUrl("SalesOrders"),
    icon: ShoppingCart,
  },
  {
    title: "Quotes",
    url: createPageUrl("Quotes"),
    icon: FileText,
  },
  {
    title: "Campaigns",
    url: createPageUrl("Campaigns"),
    icon: Megaphone,
  },
  {
    title: "Activities",
    url: createPageUrl("Activities"),
    icon: Activity,
  },
  {
    title: "Tasks",
    url: createPageUrl("Tasks"),
    icon: CheckSquare,
  },
];

export function MobileBottomNavigation({ onSearchOpen, onCommandOpen }) {
  const location = useLocation();
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const isActive = (url) => {
    if (url === "#") return false;
    return location.pathname === url;
  };

  const handleMoreClick = () => {
    setShowFullMenu(true);
  };

  // Enhanced gesture handling for menu
  const handleTouchStart = (e) => {
    if (!showFullMenu) return;
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !showFullMenu) return;
    
    currentYRef.current = e.touches[0].clientY;
    const deltaY = currentYRef.current - startYRef.current;
    
    // Only allow downward drag to close
    if (deltaY > 0) {
      setDragOffset(deltaY);
      // Add resistance effect
      const resistance = Math.min(deltaY * 0.7, 200);
      setDragOffset(resistance);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentYRef.current - startYRef.current;
    
    // Close menu if dragged down more than 100px
    if (deltaY > 100) {
      setShowFullMenu(false);
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // Swipe navigation between tabs
  const handleSwipeLeft = () => {
    // Navigate to next page in sequence
    const currentIndex = primaryNavItems.findIndex(item => isActive(item.url));
    const nextIndex = (currentIndex + 1) % (primaryNavItems.length - 1); // Exclude "More"
    const nextItem = primaryNavItems[nextIndex];
    if (nextItem && nextItem.url !== "#") {
      window.location.href = nextItem.url;
    }
  };

  const handleSwipeRight = () => {
    // Navigate to previous page in sequence
    const currentIndex = primaryNavItems.findIndex(item => isActive(item.url));
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : primaryNavItems.length - 2; // Exclude "More"
    const prevItem = primaryNavItems[prevIndex];
    if (prevItem && prevItem.url !== "#") {
      window.location.href = prevItem.url;
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showFullMenu) {
        setShowFullMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFullMenu]);

  return (
    <>
      {/* Bottom Navigation Bar with Swipe Support */}
      <SwipeNavigation 
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden"
      >
        <div className="flex items-center justify-around py-2 px-1">
          {primaryNavItems.map((item) => {
            const active = isActive(item.url);
            
            if (item.title === "More") {
              return (
                <LongPress
                  key={item.title}
                  onLongPress={() => {
                    // Haptic feedback for long press
                    if (navigator.vibrate) {
                      navigator.vibrate(50);
                    }
                  }}
                >
                  <TouchButton
                    onClick={handleMoreClick}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]",
                      "active:scale-95 active:bg-gray-100"
                    )}
                    aria-label="More options"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-xs text-gray-600 mt-1 font-medium">
                      {item.shortTitle}
                    </span>
                  </TouchButton>
                </LongPress>
              );
            }

            return (
              <LongPress
                key={item.title}
                onLongPress={() => {
                  // Haptic feedback for long press
                  if (navigator.vibrate) {
                    navigator.vibrate(30);
                  }
                }}
              >
                <Link
                  to={item.url}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] touch-manipulation",
                    "active:scale-95 transform-gpu",
                    active 
                      ? "text-indigo-600 bg-indigo-50" 
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  )}
                  aria-label={item.title}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    active ? "text-indigo-600" : "text-gray-600"
                  )} />
                  <span className={cn(
                    "text-xs mt-1 font-medium transition-colors",
                    active ? "text-indigo-600" : "text-gray-600"
                  )}>
                    {item.shortTitle}
                  </span>
                  {active && (
                    <div className="absolute -top-1 w-1 h-1 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              </LongPress>
            );
          })}
        </div>
      </SwipeNavigation>

      {/* Full Menu Overlay with Gesture Support */}
      {showFullMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden" 
          onClick={() => setShowFullMenu(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={menuRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${dragOffset}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
              <div className="flex items-center gap-2">
                {isDragging && (
                  <ChevronDown className="w-4 h-4 text-gray-400 animate-bounce" />
                )}
                <TouchButton
                  onClick={() => setShowFullMenu(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </TouchButton>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    onSearchOpen();
                    setShowFullMenu(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <SearchIcon className="w-4 h-4" />
                  Search
                </TouchButton>
                <TouchButton
                  variant="outline"
                  onClick={() => {
                    onCommandOpen();
                    setShowFullMenu(false);
                  }}
                  className="gap-2 justify-start"
                >
                  <Command className="w-4 h-4" />
                  Commands
                </TouchButton>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="overflow-y-auto max-h-[50vh]">
              <div className="p-4 space-y-1">
                {allNavItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <LongPress
                      key={item.title}
                      onLongPress={() => {
                        // Haptic feedback for long press
                        if (navigator.vibrate) {
                          navigator.vibrate(50);
                        }
                        // Could add context menu or quick actions here
                      }}
                      className="block"
                    >
                      <Link
                        to={item.url}
                        onClick={() => setShowFullMenu(false)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 touch-manipulation",
                          "active:scale-[0.98] hover:scale-[1.02]",
                          active 
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200" 
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          active ? "text-indigo-600" : "text-gray-500"
                        )} />
                        <span className="font-medium">{item.title}</span>
                        {active && (
                          <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />
                        )}
                      </Link>
                    </LongPress>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileHeader({ 
  title, 
  user, 
  primaryOrg, 
  onSearchOpen, 
  onCommandOpen, 
  onMenuOpen 
}) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onMenuOpen}
            className="h-8 w-8 p-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </TouchButton>
          
          {primaryOrg?.logo_url ? (
            <img 
              src={primaryOrg.logo_url} 
              alt={primaryOrg.organization_name}
              className="h-8 object-contain"
            />
          ) : (
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
          
          <div>
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[150px]">
              {title}
            </h1>
            {primaryOrg && (
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {primaryOrg.organization_name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onSearchOpen}
            className="h-8 w-8 p-0"
            aria-label="Search"
          >
            <SearchIcon className="w-4 h-4" />
          </TouchButton>
          
          {user?.profile_photo_url ? (
            <img 
              src={user.profile_photo_url} 
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover shadow-md ring-2 ring-indigo-500/20"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.[0] || 'U'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}