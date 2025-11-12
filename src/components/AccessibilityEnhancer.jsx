import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  useMemo 
} from 'react';
import useEnhancedStore from '../store/enhancedStore';

// Accessibility Context
const AccessibilityContext = createContext();

// Accessibility preferences and settings
const defaultA11ySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderOptimized: false,
  keyboardNavigation: true,
  focusVisible: true,
  announcements: true,
  colorBlindFriendly: false
};

// ARIA live region types
export const LiveRegionTypes = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off'
};

// Focus management utilities
export const FocusManager = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to previous element
  restoreFocus: (previousElement) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  },

  // Get next focusable element
  getNextFocusable: (currentElement, direction = 'forward') => {
    const focusableElements = Array.from(document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));

    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (direction === 'forward') {
      return focusableElements[currentIndex + 1] || focusableElements[0];
    } else {
      return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
    }
  }
};

// Screen reader utilities
export const ScreenReaderUtils = {
  // Announce message to screen readers
  announce: (message, priority = LiveRegionTypes.POLITE) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Create accessible description
  createDescription: (id, text) => {
    let description = document.getElementById(id);
    if (!description) {
      description = document.createElement('div');
      description.id = id;
      description.className = 'sr-only';
      document.body.appendChild(description);
    }
    description.textContent = text;
    return id;
  },

  // Generate unique IDs for ARIA attributes
  generateId: (prefix = 'a11y') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Keyboard navigation hook
export const useKeyboardNavigation = (options = {}) => {
  const {
    onEscape,
    onEnter,
    onArrowKeys,
    onTab,
    trapFocus = false,
    restoreFocus = true
  } = options;

  const elementRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Store previous focus
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement;
    }

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          if (onEscape) {
            onEscape(e);
            if (restoreFocus && previousFocusRef.current) {
              FocusManager.restoreFocus(previousFocusRef.current);
            }
          }
          break;
        
        case 'Enter':
          if (onEnter) onEnter(e);
          break;
        
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          if (onArrowKeys) onArrowKeys(e);
          break;
        
        case 'Tab':
          if (onTab) onTab(e);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Setup focus trap if needed
    let cleanupFocusTrap;
    if (trapFocus) {
      cleanupFocusTrap = FocusManager.trapFocus(element);
    }

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      if (cleanupFocusTrap) cleanupFocusTrap();
    };
  }, [onEscape, onEnter, onArrowKeys, onTab, trapFocus, restoreFocus]);

  return elementRef;
};

// ARIA live region hook
export const useLiveRegion = (type = LiveRegionTypes.POLITE) => {
  const [message, setMessage] = useState('');
  const regionRef = useRef(null);

  const announce = useCallback((newMessage) => {
    setMessage(newMessage);
    
    // Clear message after announcement
    setTimeout(() => {
      setMessage('');
    }, 100);
  }, []);

  return {
    regionRef,
    announce,
    liveRegionProps: {
      'aria-live': type,
      'aria-atomic': 'true',
      className: 'sr-only',
      children: message
    }
  };
};

// Accessibility settings hook
export const useAccessibilitySettings = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilitySettings must be used within AccessibilityProvider');
  }
  return context;
};

// Color contrast utilities
export const ColorContrastUtils = {
  // Calculate relative luminance
  getRelativeLuminance: (color) => {
    const rgb = ColorContrastUtils.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const l1 = ColorContrastUtils.getRelativeLuminance(color1);
    const l2 = ColorContrastUtils.getRelativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAGStandards: (color1, color2, level = 'AA', size = 'normal') => {
    const ratio = ColorContrastUtils.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  }
};

// Accessibility Provider Component
export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage or use defaults
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultA11ySettings, ...JSON.parse(saved) } : defaultA11ySettings;
  });

  // Update setting without store dependency initially
  const updateSetting = useCallback((key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      
      // Try to add notification if store is available
      try {
        const storeState = useEnhancedStore.getState();
        if (storeState && storeState.actions && storeState.actions.addNotification) {
          storeState.actions.addNotification({
            type: 'info',
            title: 'Accessibility Setting Updated',
            message: `${key} has been ${value ? 'enabled' : 'disabled'}`,
            duration: 3000
          });
        }
      } catch (error) {
        // Store not available yet, continue without notification
        console.debug('Store not available for accessibility notification:', error);
      }
      
      return newSettings;
    });
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Color blind friendly
    if (settings.colorBlindFriendly) {
      root.classList.add('color-blind-friendly');
    } else {
      root.classList.remove('color-blind-friendly');
    }
  }, [settings]);

  // Detect user preferences
  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !localStorage.getItem('accessibility-settings')) {
      updateSetting('reducedMotion', true);
    }

    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches && !localStorage.getItem('accessibility-settings')) {
      updateSetting('highContrast', true);
    }
  }, [updateSetting]);

  const value = useMemo(() => ({
    settings,
    updateSetting,
    announce: ScreenReaderUtils.announce,
    ColorContrastUtils,
    FocusManager
  }), [settings, updateSetting]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Global live region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="global-announcements"
      />
    </AccessibilityContext.Provider>
  );
};

// Accessibility testing utilities
export const AccessibilityTester = {
  // Check for missing alt text
  checkMissingAltText: () => {
    const images = document.querySelectorAll('img:not([alt])');
    return Array.from(images).map(img => ({
      element: img,
      issue: 'Missing alt attribute',
      severity: 'high'
    }));
  },

  // Check for missing form labels
  checkMissingLabels: () => {
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    return Array.from(inputs).filter(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      return !label;
    }).map(input => ({
      element: input,
      issue: 'Missing form label',
      severity: 'high'
    }));
  },

  // Check color contrast
  checkColorContrast: () => {
    const issues = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const ratio = ColorContrastUtils.getContrastRatio(color, backgroundColor);
        if (ratio < 4.5) {
          issues.push({
            element,
            issue: `Low color contrast ratio: ${ratio.toFixed(2)}`,
            severity: 'medium'
          });
        }
      }
    });
    
    return issues;
  },

  // Run all accessibility checks
  runAllChecks: () => {
    return [
      ...AccessibilityTester.checkMissingAltText(),
      ...AccessibilityTester.checkMissingLabels(),
      ...AccessibilityTester.checkColorContrast()
    ];
  }
};

// Higher-order component for accessibility enhancement
export const withAccessibility = (Component, options = {}) => {
  const AccessibleComponent = (props) => {
    const { settings } = useAccessibilitySettings();
    
    return (
      <Component
        {...props}
        accessibilitySettings={settings}
        {...options}
      />
    );
  };
  
  AccessibleComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;
  return AccessibleComponent;
};

// Skip link component
export const SkipLink = ({ href = "#main-content", children = "Skip to main content" }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
  >
    {children}
  </a>
);

export default {
  AccessibilityProvider,
  useAccessibilitySettings,
  useKeyboardNavigation,
  useLiveRegion,
  FocusManager,
  ScreenReaderUtils,
  ColorContrastUtils,
  AccessibilityTester,
  withAccessibility,
  SkipLink,
  LiveRegionTypes
};