import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, X, Check, AlertCircle, Info } from 'lucide-react';

// Accessible Modal Component
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'md' 
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleTabTrap = (e) => {
      if (!isOpen || e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabTrap);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabTrap);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className={cn(
          'bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-auto',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close modal"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible Dropdown Component
export const AccessibleDropdown = ({ 
  trigger, 
  children, 
  className,
  align = 'left' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        ref={triggerRef}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]',
            alignClasses[align],
            className
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Accessible Form Field Component
export const AccessibleFormField = ({ 
  label, 
  error, 
  hint, 
  required, 
  children, 
  className 
}) => {
  const fieldId = useRef(`field-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = useRef(`error-${fieldId.current}`);
  const hintId = useRef(`hint-${fieldId.current}`);

  const describedBy = [
    error ? errorId.current : null,
    hint ? hintId.current : null,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId.current} className="flex items-center">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      
      {hint && (
        <p id={hintId.current} className="text-sm text-muted-foreground flex items-center">
          <Info className="h-4 w-4 mr-1" />
          {hint}
        </p>
      )}
      
      <div>
        {React.cloneElement(children, {
          id: fieldId.current,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : 'false',
        })}
      </div>
      
      {error && (
        <p 
          id={errorId.current} 
          className="text-sm text-red-600 flex items-center"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible Tabs Component
export const AccessibleTabs = ({ tabs, defaultTab, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabListRef = useRef(null);

  const handleKeyDown = useCallback((e, tabId) => {
    const tabElements = Array.from(tabListRef.current?.children || []);
    const currentIndex = tabElements.findIndex(el => el.getAttribute('data-tab-id') === tabId);
    
    let nextIndex;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabElements.length;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex === 0 ? tabElements.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabElements.length - 1;
        break;
      default:
        return;
    }
    
    const nextTab = tabElements[nextIndex];
    const nextTabId = nextTab?.getAttribute('data-tab-id');
    if (nextTabId) {
      setActiveTab(nextTabId);
      nextTab.focus();
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={tabListRef}
        className="flex border-b border-gray-200"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          className={cn(
            'mt-4',
            activeTab === tab.id ? 'block' : 'hidden'
          )}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

// Accessible Accordion Component
export const AccessibleAccordion = ({ items, allowMultiple = false, className }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = useCallback((itemId) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [allowMultiple]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        
        return (
          <Card key={item.id}>
            <CardHeader className="p-0">
              <button
                className={cn(
                  'w-full px-6 py-4 text-left flex items-center justify-between',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                  'hover:bg-gray-50 transition-colors'
                )}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`content-${item.id}`}
              >
                <CardTitle className="text-base">{item.title}</CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </CardHeader>
            
            {isOpen && (
              <CardContent id={`content-${item.id}`} className="pt-0">
                {item.content}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// Accessible Toast Notification
export const AccessibleToast = ({ 
  message, 
  type = 'info', 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const toastRef = useRef(null);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  useEffect(() => {
    // Announce to screen readers
    toastRef.current?.focus();
  }, []);

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: Check,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div
      ref={toastRef}
      className={cn(
        'fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg max-w-md',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        typeStyles[type]
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
    >
      <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-3 h-6 w-6 p-0 hover:bg-transparent"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Skip Link Component for keyboard navigation
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
        'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
    >
      {children}
    </a>
  );
};

// Screen Reader Only Text Component
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

export default {
  AccessibleModal,
  AccessibleDropdown,
  AccessibleFormField,
  AccessibleTabs,
  AccessibleAccordion,
  AccessibleToast,
  SkipLink,
  ScreenReaderOnly,
};