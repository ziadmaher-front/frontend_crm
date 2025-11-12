import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, options = {}) => {
    const {
      showToast = true,
      logError = true,
      customMessage = null
    } = options;

    setError(error);

    if (logError) {
      console.error('Error handled:', error);
    }

    if (showToast) {
      let message = customMessage;
      
      if (!message) {
        if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error?.message) {
          message = error.message;
        } else if (typeof error === 'string') {
          message = error;
        } else {
          message = 'An unexpected error occurred';
        }
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }

    return error;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(async (asyncFunction, options = {}) => {
    const {
      loadingMessage = null,
      successMessage = null,
      errorOptions = {}
    } = options;

    try {
      setIsLoading(true);
      setError(null);

      if (loadingMessage) {
        toast({
          title: 'Loading',
          description: loadingMessage,
        });
      }

      const result = await asyncFunction();

      if (successMessage) {
        toast({
          title: 'Success',
          description: successMessage,
          variant: 'default',
        });
      }

      return result;
    } catch (error) {
      handleError(error, errorOptions);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const withErrorHandling = useCallback((asyncFunction, errorOptions = {}) => {
    return async (...args) => {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        handleError(error, errorOptions);
        throw error;
      }
    };
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync,
    withErrorHandling
  };
};

// API-specific error handler hook
export const useApiErrorHandler = () => {
  const { handleError } = useErrorHandler();

  const handleApiError = useCallback((error, options = {}) => {
    const apiOptions = {
      showToast: true,
      logError: true,
      ...options
    };

    // Handle specific API error cases
    if (error?.response?.status === 401) {
      apiOptions.customMessage = 'Authentication required. Please log in again.';
    } else if (error?.response?.status === 403) {
      apiOptions.customMessage = 'You do not have permission to perform this action.';
    } else if (error?.response?.status === 404) {
      apiOptions.customMessage = 'The requested resource was not found.';
    } else if (error?.response?.status >= 500) {
      apiOptions.customMessage = 'Server error. Please try again later.';
    }

    return handleError(error, apiOptions);
  }, [handleError]);

  return {
    handleApiError
  };
};