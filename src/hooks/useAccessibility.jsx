import { useState, useEffect, useCallback, useRef } from 'react';

// Screen reader announcements
export const useScreenReader = () => {
  const [announcements, setAnnouncements] = useState([]);
  const announcementRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    const id = Date.now();
    const announcement = { id, message, priority };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  const ScreenReaderAnnouncer = () => (
    <div
      ref={announcementRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    >
      {announcements.map(announcement => (
        <div key={announcement.id} aria-live={announcement.priority}>
          {announcement.message}
        </div>
      ))}
    </div>
  );

  return { announce, ScreenReaderAnnouncer };
};

// Focus management
export const useFocusManagement = () => {
  const focusHistoryRef = useRef([]);
  const currentFocusRef = useRef(null);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      focusHistoryRef.current.push(activeElement);
      currentFocusRef.current = activeElement;
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistoryRef.current.pop();
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try {
        lastFocused.focus();
      } catch (error) {
        console.warn('Could not restore focus:', error);
      }
    }
  }, []);

  const trapFocus = useCallback((containerRef) => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

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
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleTabKey);
      }
    };
  }, []);

  return { saveFocus, restoreFocus, trapFocus };
};

// Keyboard navigation
export const useKeyboardNavigation = (items, onSelect) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (!items.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setIsNavigating(true);
        setActiveIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (activeIndex >= 0 && onSelect) {
          e.preventDefault();
          onSelect(items[activeIndex], activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        setIsNavigating(false);
        break;
      default:
        break;
    }
  }, [items, activeIndex, onSelect]);

  const resetNavigation = useCallback(() => {
    setActiveIndex(-1);
    setIsNavigating(false);
  }, []);

  return {
    activeIndex,
    isNavigating,
    handleKeyDown,
    resetNavigation,
    setActiveIndex
  };
};

// High contrast mode detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Color scheme detection
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(darkModeQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => setColorScheme(e.matches ? 'dark' : 'light');
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
};

// ARIA live region management
export const useAriaLiveRegion = () => {
  const [liveRegions, setLiveRegions] = useState({
    polite: '',
    assertive: ''
  });

  const announce = useCallback((message, priority = 'polite') => {
    setLiveRegions(prev => ({
      ...prev,
      [priority]: message
    }));

    // Clear the message after announcement
    setTimeout(() => {
      setLiveRegions(prev => ({
        ...prev,
        [priority]: ''
      }));
    }, 1000);
  }, []);

  const LiveRegions = () => (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegions.polite}
      </div>
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegions.assertive}
      </div>
    </>
  );

  return { announce, LiveRegions };
};

// Skip links functionality
export const useSkipLinks = () => {
  const skipLinksRef = useRef([]);

  const addSkipLink = useCallback((id, label) => {
    skipLinksRef.current.push({ id, label });
  }, []);

  const SkipLinks = () => (
    <div className="skip-links">
      {skipLinksRef.current.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white focus:no-underline"
        >
          {label}
        </a>
      ))}
    </div>
  );

  return { addSkipLink, SkipLinks };
};

// Text scaling support
export const useTextScaling = () => {
  const [textScale, setTextScale] = useState(1);

  useEffect(() => {
    const savedScale = localStorage.getItem('textScale');
    if (savedScale) {
      setTextScale(parseFloat(savedScale));
    }
  }, []);

  const updateTextScale = useCallback((scale) => {
    setTextScale(scale);
    localStorage.setItem('textScale', scale.toString());
    document.documentElement.style.fontSize = `${scale * 16}px`;
  }, []);

  const resetTextScale = useCallback(() => {
    updateTextScale(1);
  }, [updateTextScale]);

  return {
    textScale,
    updateTextScale,
    resetTextScale
  };
};

// Accessibility preferences
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('accessibilityPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }

    // Auto-detect system preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPreferences(prev => ({
      ...prev,
      highContrast: highContrastQuery.matches,
      reducedMotion: reducedMotionQuery.matches
    }));
  }, []);

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('accessibilityPreferences', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    const defaultPrefs = {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    };
    setPreferences(defaultPrefs);
    localStorage.setItem('accessibilityPreferences', JSON.stringify(defaultPrefs));
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences
  };
};