import React, { Suspense, useEffect } from "react";
import { EnhancedAppProvider, AppInitializer, EnhancedErrorBoundary } from "./contexts/EnhancedAppContext";
import { AppProvider } from "./contexts/AppContext";
import { EnhancedLoadingSpinner } from "./components/ui/EnhancedLoading";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { AppRouter } from "./router";
import { useAuthStore } from "./stores";

// Lazy load components for better performance
const ThemeProvider = React.lazy(() => import("./hooks/useTheme").then(module => ({ default: module.ThemeProvider })));

// Import AccessibilityProvider and SkipLink directly (not lazy loaded) to avoid hook issues
import { AccessibilityProvider, SkipLink } from "./components/AccessibilityEnhancer";
import WelcomePopup from "./components/WelcomePopup";

function App() {
  const { init, isAuthenticated, user, token } = useAuthStore();

  // Initialize auth state on mount (only once)
  useEffect(() => {
    // Initialize and validate auth state
    init();
  }, [init]); // Only run once on mount

  return (
    <EnhancedErrorBoundary>
      <EnhancedAppProvider>
        <AppProvider>
          <Suspense 
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <EnhancedLoadingSpinner 
                  size="xl" 
                  variant="sparkle" 
                  message="Initializing Sales Pro CRM..." 
                />
              </div>
            }
          >
            <ThemeProvider>
              <AppInitializer>
                <AccessibilityProvider>
                  <SkipLink />
                  {/* Welcome Popup - shows when site opens */}
                  <WelcomePopup />
                  {/* Use the router with authentication */}
                  <AppRouter />
                  {/* Global toast portal */}
                  <Toaster />
                  {/* Sonner toast portal for components using `toast` from sonner */}
                  <SonnerToaster richColors closeButton />
                </AccessibilityProvider>
              </AppInitializer>
            </ThemeProvider>
          </Suspense>
        </AppProvider>
      </EnhancedAppProvider>
    </EnhancedErrorBoundary>
  );
}

export default App

