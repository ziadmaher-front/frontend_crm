import { useCallback, useEffect } from 'react';
import { useApp, actions } from '@/contexts/AppContext';
import { useNotifications } from '@/components/NotificationSystem';

// Error types and their configurations
const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error classification function
const classifyError = (error) => {
  if (!error) return { type: ErrorTypes.UNKNOWN, severity: ErrorSeverity.LOW };

  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.response?.status;

  // Network errors
  if (error.name === 'NetworkError' || message.includes('network') || message.includes('fetch')) {
    return { type: ErrorTypes.NETWORK, severity: ErrorSeverity.HIGH };
  }

  // HTTP status-based classification
  if (status) {
    if (status === 401) {
      return { type: ErrorTypes.AUTHENTICATION, severity: ErrorSeverity.HIGH };
    }
    if (status === 403) {
      return { type: ErrorTypes.AUTHORIZATION, severity: ErrorSeverity.MEDIUM };
    }
    if (status >= 400 && status < 500) {
      return { type: ErrorTypes.CLIENT, severity: ErrorSeverity.MEDIUM };
    }
    if (status >= 500) {
      return { type: ErrorTypes.SERVER, severity: ErrorSeverity.HIGH };
    }
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return { type: ErrorTypes.VALIDATION, severity: ErrorSeverity.LOW };
  }

  return { type: ErrorTypes.UNKNOWN, severity: ErrorSeverity.MEDIUM };
};

// Error recovery strategies
const getRecoveryStrategy = (errorType, context = {}) => {
  const strategies = {
    [ErrorTypes.NETWORK]: {
      canRetry: true,
      retryDelay: 2000,
      maxRetries: 3,
      message: 'Network connection issue. Please check your internet connection.',
      action: { label: 'Retry', callback: context.retry }
    },
    [ErrorTypes.AUTHENTICATION]: {
      canRetry: false,
      message: 'Authentication required. Please log in again.',
      action: { label: 'Login', callback: context.redirectToLogin }
    },
    [ErrorTypes.AUTHORIZATION]: {
      canRetry: false,
      message: 'You don\'t have permission to perform this action.',
      action: { label: 'Contact Support', callback: context.contactSupport }
    },
    [ErrorTypes.VALIDATION]: {
      canRetry: false,
      message: 'Please check your input and try again.',
      showDetails: true
    },
    [ErrorTypes.SERVER]: {
      canRetry: true,
      retryDelay: 5000,
      maxRetries: 2,
      message: 'Server error occurred. Our team has been notified.',
      action: { label: 'Retry', callback: context.retry }
    },
    [ErrorTypes.CLIENT]: {
      canRetry: true,
      retryDelay: 1000,
      maxRetries: 1,
      message: 'Request failed. Please try again.',
      action: { label: 'Retry', callback: context.retry }
    },
    [ErrorTypes.UNKNOWN]: {
      canRetry: true,
      retryDelay: 2000,
      maxRetries: 1,
      message: 'An unexpected error occurred.',
      action: { label: 'Retry', callback: context.retry }
    }
  };

  return strategies[errorType] || strategies[ErrorTypes.UNKNOWN];
};

// Enhanced error handler hook
export const useEnhancedErrorHandler = (options = {}) => {
  const { dispatch } = useApp();
  const notifications = useNotifications();
  
  const {
    enableAutoRetry = true,
    enableNotifications = true,
    enableLogging = true,
    context = {}
  } = options;

  // Error logging function
  const logError = useCallback((error, errorInfo = {}) => {
    if (!enableLogging) return;

    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.log('Error Info:', errorInfo);
      console.log('Full Log:', errorLog);
      console.groupEnd();
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production' && context.errorTrackingService) {
      context.errorTrackingService.captureException(error, errorLog);
    }
  }, [enableLogging, context]);

  // Auto-retry mechanism
  const createRetryHandler = useCallback((originalFunction, strategy, errorInfo) => {
    let retryCount = 0;
    
    const retryHandler = async (...args) => {
      try {
        return await originalFunction(...args);
      } catch (error) {
        retryCount++;
        
        if (retryCount <= strategy.maxRetries && strategy.canRetry) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, strategy.retryDelay));
          
          // Show retry notification
          if (enableNotifications) {
            notifications.info(`Retrying... (${retryCount}/${strategy.maxRetries})`, {
              duration: 2000
            });
          }
          
          return retryHandler(...args);
        } else {
          // Max retries exceeded, throw the error
          throw error;
        }
      }
    };
    
    return retryHandler;
  }, [enableNotifications, notifications]);

  // Main error handling function
  const handleError = useCallback(async (error, errorInfo = {}) => {
    const { type, severity } = classifyError(error);
    const strategy = getRecoveryStrategy(type, {
      ...context,
      retry: errorInfo.retry
    });

    // Log the error
    logError(error, { ...errorInfo, type, severity, strategy });

    // Update global error state
    const errorKey = errorInfo.key || 'global';
    dispatch(actions.setError(errorKey, {
      error,
      type,
      severity,
      strategy,
      timestamp: Date.now()
    }));

    // Show notification if enabled
    if (enableNotifications) {
      const notificationType = severity === ErrorSeverity.CRITICAL ? 'error' : 
                              severity === ErrorSeverity.HIGH ? 'error' :
                              severity === ErrorSeverity.MEDIUM ? 'warning' : 'info';

      notifications.add({
        type: notificationType,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Error`,
        message: strategy.message,
        duration: severity === ErrorSeverity.CRITICAL ? 0 : 8000, // Critical errors don't auto-dismiss
        action: strategy.action
      });
    }

    // Auto-retry if applicable
    if (enableAutoRetry && strategy.canRetry && errorInfo.retry) {
      const retryHandler = createRetryHandler(errorInfo.retry, strategy, errorInfo);
      
      // Execute retry after delay
      setTimeout(() => {
        retryHandler().catch(retryError => {
          // Handle retry failure
          handleError(retryError, {
            ...errorInfo,
            isRetryFailure: true,
            originalError: error
          });
        });
      }, strategy.retryDelay);
    }

    return { type, severity, strategy };
  }, [dispatch, logError, enableNotifications, enableAutoRetry, notifications, createRetryHandler, context]);

  // Clear error function
  const clearError = useCallback((key = 'global') => {
    dispatch(actions.clearError(key));
  }, [dispatch]);

  // Wrap async functions with error handling
  const withErrorHandling = useCallback((asyncFunction, errorInfo = {}) => {
    return async (...args) => {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        await handleError(error, {
          ...errorInfo,
          retry: () => asyncFunction(...args)
        });
        throw error; // Re-throw to allow caller to handle if needed
      }
    };
  }, [handleError]);

  // Promise wrapper with error handling
  const handlePromise = useCallback(async (promise, errorInfo = {}) => {
    try {
      return await promise;
    } catch (error) {
      await handleError(error, errorInfo);
      throw error;
    }
  }, [handleError]);

  // Batch error handling for multiple operations
  const handleBatchErrors = useCallback(async (operations) => {
    const results = [];
    const errors = [];

    for (const [index, operation] of operations.entries()) {
      try {
        const result = await operation();
        results.push({ index, success: true, data: result });
      } catch (error) {
        const errorResult = await handleError(error, {
          key: `batch.${index}`,
          batchIndex: index,
          batchSize: operations.length
        });
        
        results.push({ index, success: false, error: errorResult });
        errors.push({ index, error: errorResult });
      }
    }

    // Show batch summary notification
    if (enableNotifications && errors.length > 0) {
      const successCount = results.filter(r => r.success).length;
      const errorCount = errors.length;
      
      notifications.warning(
        `Batch operation completed: ${successCount} succeeded, ${errorCount} failed`,
        {
          duration: 6000,
          action: {
            label: 'View Details',
            callback: () => console.log('Batch Results:', results)
          }
        }
      );
    }

    return { results, errors, hasErrors: errors.length > 0 };
  }, [handleError, enableNotifications, notifications]);

  // Global error boundary integration
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      handleError(event.reason, {
        key: 'unhandledRejection',
        source: 'window.unhandledrejection'
      });
    };

    const handleGlobalError = (event) => {
      handleError(event.error, {
        key: 'globalError',
        source: 'window.error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleError]);

  return {
    handleError,
    clearError,
    withErrorHandling,
    handlePromise,
    handleBatchErrors,
    
    // Utility functions
    classifyError,
    getRecoveryStrategy,
    
    // Constants
    ErrorTypes,
    ErrorSeverity
  };
};

// Higher-order component for automatic error handling
export const withEnhancedErrorHandling = (Component, errorHandlerOptions = {}) => {
  const WrappedComponent = (props) => {
    const errorHandler = useEnhancedErrorHandler(errorHandlerOptions);
    
    return (
      <Component
        {...props}
        errorHandler={errorHandler}
      />
    );
  };
  
  WrappedComponent.displayName = `withEnhancedErrorHandling(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Error boundary hook for React error boundaries
export const useErrorBoundary = () => {
  const errorHandler = useEnhancedErrorHandler();
  
  return {
    onError: (error, errorInfo) => {
      errorHandler.handleError(error, {
        key: 'errorBoundary',
        source: 'React Error Boundary',
        componentStack: errorInfo.componentStack
      });
    }
  };
};

export default useEnhancedErrorHandler;