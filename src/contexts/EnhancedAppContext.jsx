import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import useEnhancedStore from '../store/enhancedStore';
import { generateMockData } from '../data/mockData';
import minimalAISystemBootstrap from '../services/aiSystemBootstrapMinimal';

// Create enhanced context
const EnhancedAppContext = createContext(null);

// Enhanced App Provider Component
export const EnhancedAppProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  
  // Create QueryClient instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  // Initialize mock data on app start
  useEffect(() => {
    const initializeData = async () => {
      // Ensure actions reference is visible to catch/finally blocks
      let finalActions;
      try {
        // Wait a bit to ensure store is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const store = useEnhancedStore.getState();
        const { actions } = store || {};
        
        // Ensure actions exist before using them
        finalActions = actions;
        if (!finalActions) {
          console.warn('Store actions not available, retrying...');
          // Retry after a longer delay
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryStore = useEnhancedStore.getState();
          finalActions = retryStore?.actions;
          if (!finalActions) {
            throw new Error('Store actions not available after retry');
          }
        }
        
        // Safely set loading state
        if (finalActions && typeof finalActions.setLoading === 'function') {
          finalActions.setLoading('app', true);
        }
        
        // Initialize AI System Bootstrap
          console.log('Initializing minimal AI System...');
          await minimalAISystemBootstrap.initialize();
          console.log('Minimal AI System initialized successfully');
        
        // Generate and set mock data
        const mockData = generateMockData();
        
        // Initialize all entity types
        Object.entries(mockData).forEach(([entityType, data]) => {
          if (finalActions && typeof finalActions.setData === 'function') {
            finalActions.setData(entityType, data);
          }
        });

        // Set initial AI configurations (with safety checks)
        if (finalActions && typeof finalActions.updateAIConfig === 'function') {
          finalActions.updateAIConfig('leadScoring', {
            enabled: true,
            weights: {
              engagement: 0.3,
              demographics: 0.2,
              behavior: 0.25,
              source: 0.15,
              timing: 0.1,
            },
          });

          finalActions.updateAIConfig('dealInsights', {
            enabled: true,
            riskThreshold: 0.7,
            opportunityThreshold: 0.8,
          });

          finalActions.updateAIConfig('conversationalAI', {
            enabled: true,
            sentimentAnalysis: true,
            intentRecognition: true,
            autoResponses: false,
          });
        }

        // Set connection status
        if (finalActions && typeof finalActions.setConnectionStatus === 'function') {
          finalActions.setConnectionStatus(true);
        }

        // Add welcome notification
        if (finalActions && typeof finalActions.addNotification === 'function') {
          finalActions.addNotification({
            type: 'success',
            title: 'Welcome to Sales Pro CRM',
            message: 'Your enhanced CRM system is ready with AI-powered features.',
          });
        }

        setIsInitialized(true);

      } catch (err) {
        console.error('Failed to initialize app:', err);
        try {
          // Use finalActions if available, otherwise fall back to direct store access
          if (finalActions && typeof finalActions.setError === 'function') {
            finalActions.setError('app', err?.message || err?.toString() || 'Initialization failed');
          }
          if (finalActions && typeof finalActions.addNotification === 'function') {
            finalActions.addNotification({
              type: 'error',
              title: 'Initialization Error',
              message: 'Failed to initialize the application. Please refresh the page.',
            });
          }
        } catch (storeError) {
          console.error('Store error during error handling:', storeError);
        }
        // Safely set error state
        setError(err?.message || err?.toString() || 'Initialization failed');
      } finally {
        try {
          // Use finalActions if available for cleanup
          if (finalActions && typeof finalActions.setLoading === 'function') {
            finalActions.setLoading('app', false);
          }
        } catch (finalError) {
          console.error('Store error during cleanup:', finalError);
        }
      }
    };

    initializeData();
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update some data to simulate real-time changes
      if (Math.random() < 0.05) { // 5% chance every 10 seconds
        const store = useEnhancedStore.getState() || {};
        const updateTypes = [
          () => {
            // Update a random lead status
            const leads = store?.data?.leads || [];
            if (leads.length > 0) {
              const randomLead = leads[Math.floor(Math.random() * leads.length)];
              const statuses = ['New', 'Contacted', 'Qualified', 'Converted'];
              const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
              store?.actions?.updateItem && store.actions.updateItem('leads', randomLead.id, { 
                status: newStatus,
                updatedAt: new Date().toISOString(),
              });
            }
          },
          () => {
            // Update a random deal stage
            const deals = store?.data?.deals || [];
            if (deals.length > 0) {
              const randomDeal = deals[Math.floor(Math.random() * deals.length)];
              const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
              const newStage = stages[Math.floor(Math.random() * stages.length)];
              store?.actions?.updateItem && store.actions.updateItem('deals', randomDeal.id, { 
                stage: newStage,
                updatedAt: new Date().toISOString(),
              });
            }
          },
        ];

        const randomUpdate = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        randomUpdate();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Context value
  const contextValue = {
    queryClient,
    // Utility functions
    isInitialized,
    hasError: !!error,
    error,
  };

  return (
    <EnhancedAppContext.Provider value={contextValue}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </EnhancedAppContext.Provider>
  );
};

// Internal helper to safely access context (not exported to keep Fast Refresh boundary)
const useEnhancedAppInternal = () => {
  const context = useContext(EnhancedAppContext);
  if (!context) {
    // During initialization the provider may not be mounted yet; return a safe fallback
    return { isInitialized: false, hasError: false, error: null };
  }
  return context;
};

// Loading component for app initialization
export const AppInitializer = ({ children }) => {
  const { isInitialized, hasError, error } = useEnhancedAppInternal();

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Application Error
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            {error?.message || error?.toString() || 'An unexpected error occurred while initializing the application.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Initializing Sales Pro CRM
          </h3>
          <p className="text-sm text-gray-600">
            Setting up your enhanced CRM experience with AI-powered features...
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Note: performance monitoring utilities live in dedicated hooks under src/hooks/performance

// Error boundary for enhanced error handling
export class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Enhanced App Error:', error, errorInfo);
    
    // In a real app, you would send this to an error reporting service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              The application encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedAppProvider;
