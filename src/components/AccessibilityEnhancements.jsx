import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// Accessibility context for global settings
const AccessibilityContext = createContext({
  highContrast: false,
  reducedMotion: false,
  fontSize: 'normal',
  screenReader: false,
  toggleHighContrast: () => {},
  toggleReducedMotion: () => {},
  setFontSize: () => {},
  announceToScreenReader: () => {}
});

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [screenReader, setScreenReader] = useState(false);
  const announceRef = useRef(null);

  useEffect(() => {
    // Detect user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Detect screen reader
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') || 
                           window.navigator.userAgent.includes('JAWS') || 
                           window.speechSynthesis;
    setScreenReader(hasScreenReader);

    // Apply CSS custom properties
    document.documentElement.style.setProperty('--reduced-motion', prefersReducedMotion ? '0' : '1');
    document.documentElement.style.setProperty('--high-contrast', prefersHighContrast ? '1' : '0');
  }, []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => {
      const newValue = !prev;
      document.documentElement.style.setProperty('--high-contrast', newValue ? '1' : '0');
      document.body.classList.toggle('high-contrast', newValue);
      return newValue;
    });
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => {
      const newValue = !prev;
      document.documentElement.style.setProperty('--reduced-motion', newValue ? '0' : '1');
      document.body.classList.toggle('reduced-motion', newValue);
      return newValue;
    });
  }, []);

  const handleSetFontSize = useCallback((size) => {
    setFontSize(size);
    const sizeMap = { small: '0.875rem', normal: '1rem', large: '1.125rem', xlarge: '1.25rem' };
    document.documentElement.style.setProperty('--base-font-size', sizeMap[size]);
    document.body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
    document.body.classList.add(`font-${size}`);
  }, []);

  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const value = {
    highContrast,
    reducedMotion,
    fontSize,
    screenReader,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize: handleSetFontSize,
    announceToScreenReader
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      <div 
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);

// Focus trap for modals and dialogs
export function FocusTrap({ children, active = true, className }) {
  const containerRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    firstFocusableRef.current = focusableElements[0];
    lastFocusableRef.current = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstFocusableRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Skip to main content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

// Accessible button with proper ARIA attributes
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  variant = "default",
  size = "md",
  ...props
}) {
  const buttonRef = useRef(null);

  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-indigo-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// Accessible form field with proper labeling
export function AccessibleFormField({
  label,
  children,
  error,
  description,
  required = false,
  className
}) {
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {React.cloneElement(children, {
        id: fieldId,
        'aria-describedby': [
          description ? descriptionId : null,
          error ? errorId : null
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required
      })}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Accessible table with proper headers and navigation
export function AccessibleTable({
  caption,
  headers,
  data,
  onRowClick,
  className
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-gray-200", className)} role="table">
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-gray-50 focus:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              )}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? "button" : undefined}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(row, rowIndex);
                }
              }}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Live region for dynamic content announcements
export function LiveRegion({ children, politeness = "polite", className }) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}

// Accessible progress indicator
export function AccessibleProgress({
  value,
  max = 100,
  label,
  showValue = true,
  className
}) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation(items, onSelect) {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(items[selectedIndex], selectedIndex);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  }, [items, selectedIndex, onSelect]);

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  };
}

// Accessible modal/dialog component
export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'md' 
}) {
  const modalRef = useRef(null);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      announceToScreenReader(`Modal opened: ${title}`, 'assertive');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title, announceToScreenReader]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className={cn(
            "relative bg-white rounded-lg shadow-xl p-6 m-4 w-full",
            sizeClasses[size],
            className
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </FocusTrap>
    </div>
  );
}

// Accessible tooltip component
export function AccessibleTooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 500 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).substr(2, 9)}`);

  const showTooltip = useCallback(() => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  }, [delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  }, [timeoutId]);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? tooltipId.current : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          id={tooltipId.current}
          role="tooltip"
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded shadow-lg",
            "pointer-events-none",
            positionClasses[position]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              position === 'top' && "top-full left-1/2 -translate-x-1/2 -mt-1",
              position === 'bottom' && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
              position === 'left' && "left-full top-1/2 -translate-y-1/2 -ml-1",
              position === 'right' && "right-full top-1/2 -translate-y-1/2 -mr-1"
            )}
          />
        </div>
      )}
    </div>
  );
}

// Accessible notification/alert component
export function AccessibleAlert({ 
  type = 'info', 
  title, 
  children, 
  onDismiss,
  className,
  autoHide = false,
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (title || children) {
      const message = `${title ? title + ': ' : ''}${typeof children === 'string' ? children : 'Alert'}`;
      announceToScreenReader(message, type === 'error' ? 'assertive' : 'polite');
    }
  }, [title, children, type, announceToScreenReader]);

  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, isVisible, onDismiss]);

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconMap = {
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      className={cn(
        "border rounded-md p-4",
        typeStyles[type],
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {iconMap[type]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss();
              }}
              className="inline-flex text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current rounded"
              aria-label="Dismiss alert"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Accessibility toolbar component
export function AccessibilityToolbar({ className }) {
  const { 
    highContrast, 
    reducedMotion, 
    fontSize, 
    toggleHighContrast, 
    toggleReducedMotion, 
    setFontSize 
  } = useAccessibility();

  return (
    <div className={cn("bg-gray-100 border-b p-2", className)}>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-gray-700">Accessibility:</span>
        
        <button
          onClick={toggleHighContrast}
          className={cn(
            "px-3 py-1 rounded border transition-colors",
            highContrast 
              ? "bg-gray-900 text-white border-gray-900" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
          aria-pressed={highContrast}
        >
          High Contrast
        </button>

        <button
          onClick={toggleReducedMotion}
          className={cn(
            "px-3 py-1 rounded border transition-colors",
            reducedMotion 
              ? "bg-gray-900 text-white border-gray-900" 
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          )}
          aria-pressed={reducedMotion}
        >
          Reduce Motion
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="font-size" className="text-gray-700">Font Size:</label>
          <select
            id="font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}