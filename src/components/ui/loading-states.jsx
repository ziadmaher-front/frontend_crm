import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Table Loading Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Card Loading Skeleton
export function CardSkeleton({ showHeader = true, showFooter = false }) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        {showFooter && (
          <div className="flex justify-between pt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// List Item Loading Skeleton
export function ListItemSkeleton({ showAvatar = true, lines = 2 }) {
  return (
    <div className="flex items-center space-x-4 p-4">
      {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
      <div className="space-y-2 flex-1">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === 0 ? 'w-3/4' : 'w-1/2'}`} 
          />
        ))}
      </div>
    </div>
  );
}

// Dashboard Stats Loading Skeleton
export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Form Loading Skeleton
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Chart Loading Skeleton
export function ChartSkeleton({ height = "h-64" }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className={`${height} flex items-end justify-between space-x-2`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`w-full ${
                i % 3 === 0 ? 'h-3/4' : i % 2 === 0 ? 'h-1/2' : 'h-full'
              }`} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Page Loading Skeleton
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={8} columns={5} />
        </div>
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton showHeader={false} />
        </div>
      </div>
    </div>
  );
}