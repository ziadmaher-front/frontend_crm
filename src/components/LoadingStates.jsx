import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Basic spinner component
export const Spinner = ({ size = 'default', className, ...props }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn('animate-spin', sizeClasses[size], className)} 
      {...props}
      aria-label="Loading"
    />
  );
};

// Loading overlay for full page
export const LoadingOverlay = ({ message = 'Loading...', className }) => (
  <div className={cn(
    'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
    className
  )}>
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="xl" />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {message}
      </p>
    </div>
  </div>
);

// Inline loading state
export const InlineLoader = ({ message, size = 'default', className }) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <Spinner size={size} />
    {message && (
      <span className="text-sm text-muted-foreground" aria-live="polite">
        {message}
      </span>
    )}
  </div>
);

// Button loading state
export const ButtonLoader = ({ size = 'sm', className }) => (
  <Spinner size={size} className={cn('mr-2', className)} />
);

// Card skeleton for lists
export const CardSkeleton = ({ className }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </CardContent>
  </Card>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Stats cards */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Charts */}
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = ({ fields = 5, className }) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

// Loading state with retry
export const LoadingWithRetry = ({ 
  message = 'Loading...', 
  onRetry, 
  showRetry = false,
  className 
}) => (
  <div className={cn('flex flex-col items-center space-y-4 p-8', className)}>
    <Spinner size="lg" />
    <p className="text-sm text-muted-foreground text-center" aria-live="polite">
      {message}
    </p>
    {showRetry && onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 text-sm text-primary hover:underline"
        aria-label="Retry loading"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry</span>
      </button>
    )}
  </div>
);

// Progress loading
export const ProgressLoader = ({ 
  progress = 0, 
  message = 'Loading...', 
  className 
}) => (
  <div className={cn('flex flex-col items-center space-y-4 p-8', className)}>
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>{message}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  </div>
);

export default {
  Spinner,
  LoadingOverlay,
  InlineLoader,
  ButtonLoader,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  LoadingWithRetry,
  ProgressLoader
};