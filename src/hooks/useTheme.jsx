import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Default theme configurations
const defaultThemes = {
  light: {
    name: 'Light',
    colors: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      card: 'hsl(0 0% 100%)',
      'card-foreground': 'hsl(222.2 84% 4.9%)',
      popover: 'hsl(0 0% 100%)',
      'popover-foreground': 'hsl(222.2 84% 4.9%)',
      primary: 'hsl(221.2 83.2% 53.3%)',
      'primary-foreground': 'hsl(210 40% 98%)',
      secondary: 'hsl(210 40% 96%)',
      'secondary-foreground': 'hsl(222.2 84% 4.9%)',
      muted: 'hsl(210 40% 96%)',
      'muted-foreground': 'hsl(215.4 16.3% 46.9%)',
      accent: 'hsl(210 40% 96%)',
      'accent-foreground': 'hsl(222.2 84% 4.9%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      'destructive-foreground': 'hsl(210 40% 98%)',
      border: 'hsl(214.3 31.8% 91.4%)',
      input: 'hsl(214.3 31.8% 91.4%)',
      ring: 'hsl(221.2 83.2% 53.3%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    }
  },
  dark: {
    name: 'Dark',
    colors: {
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      card: 'hsl(222.2 84% 4.9%)',
      'card-foreground': 'hsl(210 40% 98%)',
      popover: 'hsl(222.2 84% 4.9%)',
      'popover-foreground': 'hsl(210 40% 98%)',
      primary: 'hsl(217.2 91.2% 59.8%)',
      'primary-foreground': 'hsl(222.2 84% 4.9%)',
      secondary: 'hsl(217.2 32.6% 17.5%)',
      'secondary-foreground': 'hsl(210 40% 98%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      'muted-foreground': 'hsl(215 20.2% 65.1%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      'accent-foreground': 'hsl(210 40% 98%)',
      destructive: 'hsl(0 62.8% 30.6%)',
      'destructive-foreground': 'hsl(210 40% 98%)',
      border: 'hsl(217.2 32.6% 17.5%)',
      input: 'hsl(217.2 32.6% 17.5%)',
      ring: 'hsl(224.3 76.3% 94.1%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      default: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    }
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      background: 'hsl(210 100% 97%)',
      foreground: 'hsl(210 100% 15%)',
      card: 'hsl(210 100% 97%)',
      'card-foreground': 'hsl(210 100% 15%)',
      popover: 'hsl(210 100% 97%)',
      'popover-foreground': 'hsl(210 100% 15%)',
      primary: 'hsl(210 100% 50%)',
      'primary-foreground': 'hsl(0 0% 100%)',
      secondary: 'hsl(210 100% 95%)',
      'secondary-foreground': 'hsl(210 100% 15%)',
      muted: 'hsl(210 100% 95%)',
      'muted-foreground': 'hsl(210 50% 40%)',
      accent: 'hsl(210 100% 95%)',
      'accent-foreground': 'hsl(210 100% 15%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      'destructive-foreground': 'hsl(210 40% 98%)',
      border: 'hsl(210 100% 90%)',
      input: 'hsl(210 100% 90%)',
      ring: 'hsl(210 100% 50%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(59 130 246 / 0.1)',
      default: '0 1px 3px 0 rgb(59 130 246 / 0.2), 0 1px 2px -1px rgb(59 130 246 / 0.2)',
      md: '0 4px 6px -1px rgb(59 130 246 / 0.2), 0 2px 4px -2px rgb(59 130 246 / 0.2)',
      lg: '0 10px 15px -3px rgb(59 130 246 / 0.2), 0 4px 6px -4px rgb(59 130 246 / 0.2)',
      xl: '0 20px 25px -5px rgb(59 130 246 / 0.2), 0 8px 10px -6px rgb(59 130 246 / 0.2)',
    }
  },
  green: {
    name: 'Forest Green',
    colors: {
      background: 'hsl(120 60% 97%)',
      foreground: 'hsl(120 60% 15%)',
      card: 'hsl(120 60% 97%)',
      'card-foreground': 'hsl(120 60% 15%)',
      popover: 'hsl(120 60% 97%)',
      'popover-foreground': 'hsl(120 60% 15%)',
      primary: 'hsl(120 60% 40%)',
      'primary-foreground': 'hsl(0 0% 100%)',
      secondary: 'hsl(120 60% 95%)',
      'secondary-foreground': 'hsl(120 60% 15%)',
      muted: 'hsl(120 60% 95%)',
      'muted-foreground': 'hsl(120 30% 40%)',
      accent: 'hsl(120 60% 95%)',
      'accent-foreground': 'hsl(120 60% 15%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      'destructive-foreground': 'hsl(210 40% 98%)',
      border: 'hsl(120 60% 90%)',
      input: 'hsl(120 60% 90%)',
      ring: 'hsl(120 60% 40%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(34 197 94 / 0.1)',
      default: '0 1px 3px 0 rgb(34 197 94 / 0.2), 0 1px 2px -1px rgb(34 197 94 / 0.2)',
      md: '0 4px 6px -1px rgb(34 197 94 / 0.2), 0 2px 4px -2px rgb(34 197 94 / 0.2)',
      lg: '0 10px 15px -3px rgb(34 197 94 / 0.2), 0 4px 6px -4px rgb(34 197 94 / 0.2)',
      xl: '0 20px 25px -5px rgb(34 197 94 / 0.2), 0 8px 10px -6px rgb(34 197 94 / 0.2)',
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      background: 'hsl(270 100% 98%)',
      foreground: 'hsl(270 100% 15%)',
      card: 'hsl(270 100% 98%)',
      'card-foreground': 'hsl(270 100% 15%)',
      popover: 'hsl(270 100% 98%)',
      'popover-foreground': 'hsl(270 100% 15%)',
      primary: 'hsl(270 100% 60%)',
      'primary-foreground': 'hsl(0 0% 100%)',
      secondary: 'hsl(270 100% 96%)',
      'secondary-foreground': 'hsl(270 100% 15%)',
      muted: 'hsl(270 100% 96%)',
      'muted-foreground': 'hsl(270 50% 40%)',
      accent: 'hsl(270 100% 96%)',
      'accent-foreground': 'hsl(270 100% 15%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      'destructive-foreground': 'hsl(210 40% 98%)',
      border: 'hsl(270 100% 92%)',
      input: 'hsl(270 100% 92%)',
      ring: 'hsl(270 100% 60%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(147 51 234 / 0.1)',
      default: '0 1px 3px 0 rgb(147 51 234 / 0.2), 0 1px 2px -1px rgb(147 51 234 / 0.2)',
      md: '0 4px 6px -1px rgb(147 51 234 / 0.2), 0 2px 4px -2px rgb(147 51 234 / 0.2)',
      lg: '0 10px 15px -3px rgb(147 51 234 / 0.2), 0 4px 6px -4px rgb(147 51 234 / 0.2)',
      xl: '0 20px 25px -5px rgb(147 51 234 / 0.2), 0 8px 10px -6px rgb(147 51 234 / 0.2)',
    }
  }
};

// Theme Context
const ThemeContext = createContext({
  theme: 'light',
  themes: defaultThemes,
  setTheme: () => {},
  customThemes: {},
  addCustomTheme: () => {},
  removeCustomTheme: () => {},
  currentThemeConfig: defaultThemes.light,
  isDark: false,
  toggleTheme: () => {},
  systemTheme: 'light',
  followSystem: false,
  setFollowSystem: () => {},
});

// Theme Provider Component
export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'crm-theme',
  enableSystem = true,
  customThemes = {}
}) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [followSystem, setFollowSystemState] = useState(false);
  const [systemTheme, setSystemTheme] = useState('light');
  const [userCustomThemes, setUserCustomThemes] = useState(customThemes);

  // Detect system theme
  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem]);

  // Load theme from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { theme: storedTheme, followSystem: storedFollowSystem, customThemes: storedCustomThemes } = JSON.parse(stored);
        if (storedTheme) setThemeState(storedTheme);
        if (typeof storedFollowSystem === 'boolean') setFollowSystemState(storedFollowSystem);
        if (storedCustomThemes) setUserCustomThemes(storedCustomThemes);
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }, [storageKey]);

  // Save theme to storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        theme,
        followSystem,
        customThemes: userCustomThemes
      }));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }, [theme, followSystem, userCustomThemes, storageKey]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = followSystem ? systemTheme : theme;
    const allThemes = { ...defaultThemes, ...userCustomThemes };
    const themeConfig = allThemes[effectiveTheme] || defaultThemes.light;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    Object.keys(allThemes).forEach(themeName => {
      root.classList.remove(`theme-${themeName}`);
    });

    // Add new theme class
    root.classList.add(effectiveTheme === 'dark' ? 'dark' : 'light');
    root.classList.add(`theme-${effectiveTheme}`);

    // Apply CSS custom properties
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });

    // Apply shadow variables
    if (themeConfig.shadows) {
      Object.entries(themeConfig.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    }

    // Apply theme-specific styles
    root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
  }, [theme, followSystem, systemTheme, userCustomThemes]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    setFollowSystemState(false);
  }, []);

  const setFollowSystem = useCallback((follow) => {
    setFollowSystemState(follow);
  }, []);

  const toggleTheme = useCallback(() => {
    const effectiveTheme = followSystem ? systemTheme : theme;
    const newTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, followSystem, systemTheme, setTheme]);

  const addCustomTheme = useCallback((name, themeConfig) => {
    setUserCustomThemes(prev => ({
      ...prev,
      [name]: themeConfig
    }));
  }, []);

  const removeCustomTheme = useCallback((name) => {
    setUserCustomThemes(prev => {
      const { [name]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const effectiveTheme = followSystem ? systemTheme : theme;
  const allThemes = { ...defaultThemes, ...userCustomThemes };
  const currentThemeConfig = allThemes[effectiveTheme] || defaultThemes.light;
  const isDark = effectiveTheme === 'dark';

  const value = {
    theme: effectiveTheme,
    themes: allThemes,
    setTheme,
    customThemes: userCustomThemes,
    addCustomTheme,
    removeCustomTheme,
    currentThemeConfig,
    isDark,
    toggleTheme,
    systemTheme,
    followSystem,
    setFollowSystem,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for theme-aware animations
export function useThemeTransition() {
  const { isDark, currentThemeConfig } = useTheme();
  
  return {
    isDark,
    colors: currentThemeConfig.colors,
    shadows: currentThemeConfig.shadows,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  };
}

// Hook for responsive theme values
export function useThemeValue(lightValue, darkValue) {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
}

// Utility function to create theme-aware styles
export function createThemeStyles(styles) {
  return (theme) => {
    if (typeof styles === 'function') {
      return styles(theme);
    }
    return styles;
  };
}

// Theme color utilities
export function getThemeColor(colorName) {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(`--${colorName}`).trim();
}

export function setThemeColor(colorName, value) {
  const root = document.documentElement;
  root.style.setProperty(`--${colorName}`, value);
}

// Theme validation
export function validateTheme(themeConfig) {
  const requiredColors = [
    'background', 'foreground', 'primary', 'primary-foreground',
    'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
    'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
    'border', 'input', 'ring'
  ];

  const missingColors = requiredColors.filter(color => !themeConfig.colors?.[color]);
  
  if (missingColors.length > 0) {
    throw new Error(`Theme is missing required colors: ${missingColors.join(', ')}`);
  }

  return true;
}

// Export theme presets for easy customization
export { defaultThemes };

export default useTheme;