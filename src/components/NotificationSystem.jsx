import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp, actions, selectors } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Notification types and their configurations
const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    iconClassName: 'text-green-600 dark:text-green-400'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    iconClassName: 'text-red-600 dark:text-red-400'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    iconClassName: 'text-yellow-600 dark:text-yellow-400'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    iconClassName: 'text-blue-600 dark:text-blue-400'
  }
};

// Individual notification component
const NotificationItem = ({ notification, onRemove }) => {
  const config = notificationConfig[notification.type] || notificationConfig.info;
  const Icon = config.icon;

  // Auto-remove notification after duration
  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  const handleAction = useCallback(() => {
    if (notification.action?.callback) {
      notification.action.callback();
    }
    onRemove(notification.id);
  }, [notification, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'max-w-md w-full pointer-events-auto',
        config.className
      )}
    >
      {/* Icon */}
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-1">
            {notification.title}
          </h4>
        )}
        <p className="text-sm opacity-90">
          {notification.message}
        </p>
        
        {/* Action button */}
        {notification.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction}
            className="mt-2 h-auto p-1 text-xs hover:bg-black/10 dark:hover:bg-white/10"
          >
            {notification.action.label}
          </Button>
        )}
      </div>
      
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(notification.id)}
        className="h-auto p-1 opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </Button>
      
      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (notification.duration || 5000) / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      callback: PropTypes.func.isRequired
    })
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

// Main notification system component
export const NotificationSystem = () => {
  const { state, dispatch } = useApp();
  const notifications = selectors.getNotifications(state);

  const removeNotification = useCallback((id) => {
    dispatch(actions.removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(actions.setNotifications([]));
  }, [dispatch]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </AnimatePresence>
      
      {/* Clear all button when there are multiple notifications */}
      {notifications.length > 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="pointer-events-auto"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllNotifications}
            className="w-full bg-background/80 backdrop-blur-sm"
          >
            Clear All ({notifications.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Hook for easy notification management
export const useNotifications = () => {
  const { dispatch } = useApp();

  const addNotification = useCallback((notification) => {
    dispatch(actions.addNotification({
      type: 'info',
      duration: 5000,
      ...notification,
      id: notification.id || Date.now() + Math.random()
    }));
  }, [dispatch]);

  const removeNotification = useCallback((id) => {
    dispatch(actions.removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(actions.setNotifications([]));
  }, [dispatch]);

  // Convenience methods for different notification types
  const success = useCallback((message, options = {}) => {
    addNotification({
      type: 'success',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    addNotification({
      type: 'error',
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    addNotification({
      type: 'warning',
      message,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    addNotification({
      type: 'info',
      message,
      ...options
    });
  }, [addNotification]);

  // Promise-based notifications for async operations
  const promise = useCallback(async (promise, messages = {}) => {
    const loadingId = Date.now();
    
    // Show loading notification
    if (messages.loading) {
      addNotification({
        id: loadingId,
        type: 'info',
        message: messages.loading,
        duration: 0 // Don't auto-remove
      });
    }

    try {
      const result = await promise;
      
      // Remove loading notification
      if (messages.loading) {
        removeNotification(loadingId);
      }
      
      // Show success notification
      if (messages.success) {
        success(messages.success);
      }
      
      return result;
    } catch (error) {
      // Remove loading notification
      if (messages.loading) {
        removeNotification(loadingId);
      }
      
      // Show error notification
      const errorMessage = messages.error || error.message || 'An error occurred';
      error(errorMessage);
      
      throw error;
    }
  }, [addNotification, removeNotification, success, error]);

  return {
    add: addNotification,
    remove: removeNotification,
    clear: clearAllNotifications,
    success,
    error,
    warning,
    info,
    promise
  };
};

// Higher-order component for automatic error notifications
export const withNotifications = (Component) => {
  const WrappedComponent = (props) => {
    const notifications = useNotifications();
    
    return (
      <Component
        {...props}
        notifications={notifications}
      />
    );
  };
  
  WrappedComponent.displayName = `withNotifications(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default NotificationSystem;