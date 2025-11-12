/**
 * Responsive Design Utilities
 * Provides comprehensive tools for creating mobile-friendly, adaptive layouts
 */

import { useState, useEffect, useCallback } from 'react';

// Breakpoint definitions (matching Tailwind CSS)
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// Media query utilities
export const mediaQueries = {
  xs: `(min-width: ${breakpoints.xs}px)`,
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  
  // Max width queries
  'max-xs': `(max-width: ${breakpoints.sm - 1}px)`,
  'max-sm': `(max-width: ${breakpoints.md - 1}px)`,
  'max-md': `(max-width: ${breakpoints.lg - 1}px)`,
  'max-lg': `(max-width: ${breakpoints.xl - 1}px)`,
  'max-xl': `(max-width: ${breakpoints['2xl'] - 1}px)`,
  
  // Range queries
  'sm-md': `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`,
  'md-lg': `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.xl - 1}px)`,
  'lg-xl': `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints['2xl'] - 1}px)`
};

// Hook for responsive breakpoint detection
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('lg');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      // Determine current breakpoint
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    handleResize(); // Set initial values
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  const isSmallScreen = breakpoint === 'xs' || breakpoint === 'sm' || breakpoint === 'md';

  return {
    breakpoint,
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    width: windowSize.width,
    height: windowSize.height
  };
}

// Hook for media query matching
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// Responsive grid utilities
export const responsiveGrid = {
  // Auto-fit grid with minimum column width
  autoFit: (minWidth = '250px', gap = '1rem') => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
    gap
  }),

  // Auto-fill grid with minimum column width
  autoFill: (minWidth = '250px', gap = '1rem') => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}, 1fr))`,
    gap
  }),

  // Responsive columns based on breakpoints
  responsive: (columns = { xs: 1, sm: 2, md: 3, lg: 4 }, gap = '1rem') => {
    const breakpointEntries = Object.entries(columns).sort(
      ([a], [b]) => breakpoints[a] - breakpoints[b]
    );

    let styles = {
      display: 'grid',
      gap
    };

    breakpointEntries.forEach(([bp, cols]) => {
      if (bp === 'xs') {
        styles.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      } else {
        styles[`@media ${mediaQueries[bp]}`] = {
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        };
      }
    });

    return styles;
  }
};

// Responsive typography utilities
export const responsiveText = {
  // Fluid typography that scales with viewport
  fluid: (minSize = 14, maxSize = 24, minVw = 320, maxVw = 1200) => ({
    fontSize: `clamp(${minSize}px, ${minSize}px + (${maxSize} - ${minSize}) * ((100vw - ${minVw}px) / (${maxVw} - ${minVw})), ${maxSize}px)`
  }),

  // Responsive font sizes
  responsive: (sizes = { xs: '14px', sm: '16px', md: '18px', lg: '20px' }) => {
    const breakpointEntries = Object.entries(sizes).sort(
      ([a], [b]) => breakpoints[a] - breakpoints[b]
    );

    let styles = {};

    breakpointEntries.forEach(([bp, size]) => {
      if (bp === 'xs') {
        styles.fontSize = size;
      } else {
        styles[`@media ${mediaQueries[bp]}`] = {
          fontSize: size
        };
      }
    });

    return styles;
  }
};

// Responsive spacing utilities
export const responsiveSpacing = {
  // Responsive padding
  padding: (spaces = { xs: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem' }) => {
    const breakpointEntries = Object.entries(spaces).sort(
      ([a], [b]) => breakpoints[a] - breakpoints[b]
    );

    let styles = {};

    breakpointEntries.forEach(([bp, space]) => {
      if (bp === 'xs') {
        styles.padding = space;
      } else {
        styles[`@media ${mediaQueries[bp]}`] = {
          padding: space
        };
      }
    });

    return styles;
  },

  // Responsive margin
  margin: (spaces = { xs: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem' }) => {
    const breakpointEntries = Object.entries(spaces).sort(
      ([a], [b]) => breakpoints[a] - breakpoints[b]
    );

    let styles = {};

    breakpointEntries.forEach(([bp, space]) => {
      if (bp === 'xs') {
        styles.margin = space;
      } else {
        styles[`@media ${mediaQueries[bp]}`] = {
          margin: space
        };
      }
    });

    return styles;
  }
};

// Responsive component utilities
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = '1200px', 
  padding = { xs: '1rem', sm: '1.5rem', md: '2rem' },
  className = '' 
}) => {
  const { isSmallScreen } = useBreakpoint();

  const containerStyles = {
    width: '100%',
    maxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
    ...responsiveSpacing.padding(padding)
  };

  return (
    <div style={containerStyles} className={className}>
      {children}
    </div>
  );
};

// Responsive image component
export const ResponsiveImage = ({ 
  src, 
  alt, 
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  className = '',
  loading = 'lazy',
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      loading={loading}
      className={`w-full h-auto ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
      {...props}
    />
  );
};

// Responsive video component
export const ResponsiveVideo = ({ 
  src, 
  poster, 
  aspectRatio = '16/9',
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`relative w-full ${className}`}
      style={{ aspectRatio }}
    >
      <video
        src={src}
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        {...props}
      />
    </div>
  );
};

// Responsive navigation utilities
export const useResponsiveNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Auto-close menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMobile, isMenuOpen]);

  return {
    isMenuOpen,
    toggleMenu,
    closeMenu,
    isMobile
  };
};

// Responsive table utilities
export const ResponsiveTable = ({ 
  data, 
  columns, 
  mobileBreakpoint = 'md',
  className = '' 
}) => {
  const { breakpoint } = useBreakpoint();
  const isMobileView = breakpoints[breakpoint] < breakpoints[mobileBreakpoint];

  if (isMobileView) {
    // Card-based layout for mobile
    return (
      <div className={`space-y-4 ${className}`}>
        {data.map((row, index) => (
          <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between py-2 border-b last:border-b-0">
                <span className="font-medium text-gray-600">{column.header}</span>
                <span className="text-gray-900">{row[column.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Standard table layout for desktop
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Responsive chart container
export const ResponsiveChartContainer = ({ 
  children, 
  height = { xs: 250, sm: 300, md: 350, lg: 400 },
  className = '' 
}) => {
  const { breakpoint } = useBreakpoint();
  const currentHeight = height[breakpoint] || height.lg || 400;

  return (
    <div 
      className={`w-full ${className}`}
      style={{ height: `${currentHeight}px` }}
    >
      {children}
    </div>
  );
};

// Touch-friendly utilities for mobile
export const touchUtilities = {
  // Minimum touch target size (44px recommended)
  touchTarget: {
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Touch-friendly spacing
  touchSpacing: {
    padding: '12px',
    margin: '8px'
  },

  // Swipe gesture detection
  useSwipeGesture: (onSwipeLeft, onSwipeRight, threshold = 50) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const onTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > threshold;
      const isRightSwipe = distance < -threshold;

      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    };

    return {
      onTouchStart,
      onTouchMove,
      onTouchEnd
    };
  }
};

// Responsive utility classes generator
export const generateResponsiveClasses = (property, values) => {
  const classes = [];
  
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'xs') {
      classes.push(`${property}-${value}`);
    } else {
      classes.push(`${breakpoint}:${property}-${value}`);
    }
  });
  
  return classes.join(' ');
};

// Device detection utilities
export const deviceDetection = {
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  isIOS: () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid: () => {
    return /Android/.test(navigator.userAgent);
  },

  isMobile: () => {
    return /Mobi|Android/i.test(navigator.userAgent);
  },

  isTablet: () => {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
  },

  getDeviceType: () => {
    if (deviceDetection.isTablet()) return 'tablet';
    if (deviceDetection.isMobile()) return 'mobile';
    return 'desktop';
  }
};

export default {
  breakpoints,
  mediaQueries,
  useBreakpoint,
  useMediaQuery,
  responsiveGrid,
  responsiveText,
  responsiveSpacing,
  ResponsiveContainer,
  ResponsiveImage,
  ResponsiveVideo,
  useResponsiveNavigation,
  ResponsiveTable,
  ResponsiveChartContainer,
  touchUtilities,
  generateResponsiveClasses,
  deviceDetection
};