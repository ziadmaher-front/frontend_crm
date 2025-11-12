import { useState, useEffect } from 'react';
import useEnhancedStore from '../store/enhancedStore';

/**
 * Custom hook to check if the enhanced store is ready for use
 * This prevents React hook errors when components try to access the store before initialization
 * 
 * @returns {Object} - { isReady: boolean, store: object|null, error: string|null }
 */
export const useStoreReady = () => {
  const [isReady, setIsReady] = useState(false);
  const [store, setStore] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const checkStoreReadiness = () => {
      try {
        // Try to get the store state
        const storeState = useEnhancedStore.getState();
        
        // Check if store has essential properties
        if (storeState && 
            storeState.actions && 
            typeof storeState.actions.addNotification === 'function' &&
            typeof storeState.actions.setData === 'function') {
          
          if (mounted) {
            setStore(storeState);
            setIsReady(true);
            setError(null);
          }
          return true;
        }
        return false;
      } catch (err) {
        if (mounted) {
          setError(`Store not ready: ${err.message}`);
          setIsReady(false);
        }
        return false;
      }
    };

    // Initial check
    if (!checkStoreReadiness()) {
      // If not ready, set up polling with exponential backoff
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollStore = () => {
        if (!mounted || attempts >= maxAttempts) {
          if (mounted && attempts >= maxAttempts) {
            setError('Store initialization timeout - max attempts reached');
          }
          return;
        }
        
        attempts++;
        
        if (!checkStoreReadiness()) {
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, etc.
          const delay = Math.min(100 * Math.pow(2, attempts - 1), 2000);
          setTimeout(pollStore, delay);
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollStore, 50);
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, store, error };
};

/**
 * Higher-order component that wraps components requiring store access
 * Renders a loading state until the store is ready
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Enhanced component with store readiness check
 */
export const withStoreReady = (WrappedComponent, options = {}) => {
  const {
    LoadingComponent = () => <div className="flex items-center justify-center p-4">Loading...</div>,
    ErrorComponent = ({ error }) => (
      <div className="flex items-center justify-center p-4 text-red-600">
        <span>Store Error: {error}</span>
      </div>
    ),
    timeout = 10000 // 10 seconds
  } = options;

  return function StoreReadyWrapper(props) {
    const { isReady, store, error } = useStoreReady();
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        if (!isReady) {
          setTimedOut(true);
        }
      }, timeout);

      return () => clearTimeout(timer);
    }, [isReady, timeout]);

    if (error || timedOut) {
      return <ErrorComponent error={error || 'Store initialization timeout'} />;
    }

    if (!isReady) {
      return <LoadingComponent />;
    }

    return <WrappedComponent {...props} store={store} />;
  };
};

/**
 * Safe store accessor that returns null if store is not ready
 * Use this for optional store access where you want to gracefully handle unavailability
 * 
 * @returns {Object|null} - Store state or null if not ready
 */
export const getStoreIfReady = () => {
  try {
    const storeState = useEnhancedStore.getState();
    
    if (storeState && 
        storeState.actions && 
        typeof storeState.actions.addNotification === 'function') {
      return storeState;
    }
    
    return null;
  } catch (error) {
    console.debug('Store not ready:', error);
    return null;
  }
};

export default useStoreReady;