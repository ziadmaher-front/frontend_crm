import React, { Suspense } from "react";
import { EnhancedAppProvider, AppInitializer, EnhancedErrorBoundary } from "./contexts/EnhancedAppContext";
import { AppProvider } from "./contexts/AppContext";
import { EnhancedLoadingSpinner } from "./components/ui/EnhancedLoading";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Lazy load components for better performance
const Pages = React.lazy(() => import("./pages/index"));
const ThemeProvider = React.lazy(() => import("./hooks/useTheme").then(module => ({ default: module.ThemeProvider })));

// Import AccessibilityProvider and SkipLink directly (not lazy loaded) to avoid hook issues
import { AccessibilityProvider, SkipLink } from "./components/AccessibilityEnhancer";

function App() {
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
                  <div className="min-h-screen bg-background">
                    <Pages />
                  </div>
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
