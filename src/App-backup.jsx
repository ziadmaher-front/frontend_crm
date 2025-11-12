import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import ErrorBoundary from "@/components/ErrorBoundary"
import { ThemeProvider } from "@/hooks/useTheme.jsx"
import { AppProvider } from "@/contexts/AppContext"
import { AccessibilityProvider, SkipLink } from "@/components/AccessibilityEnhancer"
import { NotificationSystem } from "@/components/NotificationSystem"
import MobileOptimizer from "@/components/optimization/MobileOptimizer"
import { usePerformanceMonitor } from "@/components/optimization/PerformanceMonitor"
import { useBreakpoints } from "@/hooks/useMediaQuery"
import { Suspense, lazy } from 'react'

// Lazy load performance monitor for better initial load
const PerformanceMonitor = lazy(() => import("@/components/optimization/PerformanceMonitor"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const performanceData = usePerformanceMonitor()
  const { isMobile } = useBreakpoints()

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <AccessibilityProvider>
              <SkipLink />
              <div className="min-h-screen bg-background">
                <Pages />
                <Toaster />
                <NotificationSystem />
                
                {/* Mobile optimization */}
                {isMobile && <MobileOptimizer />}
                
                {/* Performance monitoring in development */}
                {process.env.NODE_ENV === 'development' && (
                  <Suspense fallback={<div>Loading performance monitor...</div>}>
                    <PerformanceMonitor data={performanceData} />
                  </Suspense>
                )}
              </div>
            </AccessibilityProvider>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App