import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { errorBoundary: true }
      // });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard. Please share this with support.');
      })
      .catch(() => {
        console.error('Failed to copy error report');
      });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state;
      const { fallback: Fallback, showDetails = false } = this.props;

      // If a custom fallback is provided, use it
      if (Fallback) {
        return (
          <Fallback
            error={error}
            errorInfo={errorInfo}
            resetError={this.handleRetry}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We&apos;re sorry, but something unexpected happened. Our team has been notified.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error ID:</strong> {errorId}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    Please include this ID when contacting support.
                  </span>
                </AlertDescription>
              </Alert>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button 
                  variant="outline" 
                  onClick={this.handleReportError}
                  className="flex-1"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Report Error
                </Button>
              </div>

              {/* Error details (development only or when showDetails is true) */}
              {(process.env.NODE_ENV === 'development' || showDetails) && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Technical Details (Click to expand)
                  </summary>
                  <div className="mt-3 p-4 bg-gray-100 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-red-800">Error Message:</h4>
                        <p className="text-sm text-red-700 font-mono bg-red-50 p-2 rounded mt-1">
                          {error.message}
                        </p>
                      </div>
                      
                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-red-800">Stack Trace:</h4>
                          <pre className="text-xs text-red-700 bg-red-50 p-2 rounded mt-1 overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-red-800">Component Stack:</h4>
                          <pre className="text-xs text-red-700 bg-red-50 p-2 rounded mt-1 overflow-auto max-h-40">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              {/* Retry count indicator */}
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Retry attempts: {retryCount}/3
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error reporting
export const useErrorBoundary = () => {
  const throwError = React.useCallback((error, errorInfo) => {
    throw error;
  }, []);
  
  return throwError;
};

// PropTypes definition
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  showDetails: PropTypes.bool,
  enableRetry: PropTypes.bool,
  maxRetries: PropTypes.number,
};

ErrorBoundary.defaultProps = {
  showDetails: process.env.NODE_ENV === 'development',
  enableRetry: true,
  maxRetries: 3,
};

export default ErrorBoundary;