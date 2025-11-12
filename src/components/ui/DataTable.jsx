// Modern Data Table Component with Advanced Features
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FixedSizeList as List } from 'react-window';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Checkbox } from './Checkbox';
import { Badge } from './Badge';
import { Tooltip } from './Tooltip';
import { DropdownMenu } from './DropdownMenu';
import { useVirtualization } from '@/hooks/performance/useVirtualization';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/utils/cn';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableVirtualization = false,
  enableColumnVisibility = true,
  enableRowSelection = false,
  enableExport = true,
  enableSearch = true,
  pageSize = 50,
  virtualRowHeight = 50,
  className = '',
  onRowClick = null,
  onRowSelect = null,
  onExport = null,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data available',
  tableId = 'data-table',
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useLocalStorage(
    `${tableId}-column-visibility`,
    {}
  );
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);
  const tableContainerRef = useRef(null);

  // Enhanced columns with default configurations
  const enhancedColumns = useMemo(() => {
    return columns.map(column => ({
      enableSorting: enableSorting,
      enableColumnFilter: enableFiltering,
      ...column,
      header: ({ column }) => {
        const originalHeader = typeof column.columnDef.header === 'function' 
          ? column.columnDef.header({ column })
          : column.columnDef.header;

        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {originalHeader}
            </span>
            {column.getCanSort() && (
              <div className="flex flex-col">
                <ChevronUpIcon 
                  className={cn(
                    "h-3 w-3 cursor-pointer transition-colors",
                    column.getIsSorted() === 'asc' 
                      ? "text-blue-600" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => column.toggleSorting(false)}
                />
                <ChevronDownIcon 
                  className={cn(
                    "h-3 w-3 cursor-pointer transition-colors -mt-1",
                    column.getIsSorted() === 'desc' 
                      ? "text-blue-600" 
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => column.toggleSorting(true)}
                />
              </div>
            )}
          </div>
        );
      },
    }));
  }, [columns, enableSorting, enableFiltering]);

  // Add row selection column if enabled
  const finalColumns = useMemo(() => {
    if (!enableRowSelection) return enhancedColumns;

    return [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 50,
      },
      ...enhancedColumns,
    ];
  }, [enhancedColumns, enableRowSelection]);

  // Table instance
  const table = useReactTable({
    data,
    columns: finalColumns,
    state: {
      globalFilter: debouncedGlobalFilter,
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: enableRowSelection,
    enableMultiRowSelection: enableRowSelection,
  });

  // Virtualization setup
  const { virtualItems, totalSize, scrollElementRef } = useVirtualization({
    count: table.getRowModel().rows.length,
    size: virtualRowHeight,
    enabled: enableVirtualization,
  });

  // Handle row click
  const handleRowClick = useCallback((row) => {
    if (onRowClick) {
      onRowClick(row.original, row.index);
    }
  }, [onRowClick]);

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);
      const allRows = table.getRowModel().rows.map(row => row.original);
      onExport(selectedRows.length > 0 ? selectedRows : allRows);
    }
  }, [onExport, table]);

  // Column visibility controls
  const ColumnVisibilityDropdown = () => (
    <DropdownMenu
      trigger={
        <Button variant="outline" size="sm">
          <EyeIcon className="h-4 w-4 mr-2" />
          Columns
        </Button>
      }
    >
      <div className="p-2 space-y-2 min-w-48">
        {table.getAllLeafColumns().map(column => (
          <div key={column.id} className="flex items-center space-x-2">
            <Checkbox
              checked={column.getIsVisible()}
              onChange={column.getToggleVisibilityHandler()}
            />
            <span className="text-sm">
              {typeof column.columnDef.header === 'string' 
                ? column.columnDef.header 
                : column.id}
            </span>
          </div>
        ))}
      </div>
    </DropdownMenu>
  );

  // Render table row
  const TableRow = ({ row, style = null }) => (
    <tr
      style={style}
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
        onRowClick && "cursor-pointer",
        row.getIsSelected() && "bg-blue-50 dark:bg-blue-900/20"
      )}
      onClick={() => handleRowClick(row)}
    >
      {row.getVisibleCells().map(cell => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );

  // Virtualized table body
  const VirtualizedTableBody = () => (
    <div
      ref={scrollElementRef}
      className="overflow-auto"
      style={{ height: '400px' }}
    >
      <div style={{ height: totalSize, position: 'relative' }}>
        {virtualItems.map(virtualRow => {
          const row = table.getRowModel().rows[virtualRow.index];
          return (
            <TableRow
              key={row.id}
              row={row}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );

  // Regular table body
  const RegularTableBody = () => (
    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
      {table.getRowModel().rows.map(row => (
        <TableRow key={row.id} row={row} />
      ))}
    </tbody>
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-2">
          Error loading data
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {error.message || 'An unexpected error occurred'}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {enableSearch && (
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          
          {enableRowSelection && (
            <Badge variant="secondary">
              {table.getSelectedRowModel().rows.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {enableColumnVisibility && <ColumnVisibilityDropdown />}
          
          {enableExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg overflow-hidden">
        <div ref={tableContainerRef} className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            {enableVirtualization ? <VirtualizedTableBody /> : <RegularTableBody />}
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-2">
              {emptyMessage}
            </div>
            {debouncedGlobalFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGlobalFilter('')}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {enablePagination && !enableVirtualization && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: table.getPageCount() }, (_, i) => i)
                .filter(page => {
                  const current = table.getState().pagination.pageIndex;
                  return page === 0 || page === table.getPageCount() - 1 || 
                         Math.abs(page - current) <= 2;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                      <Button
                        variant={table.getState().pagination.pageIndex === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => table.setPageIndex(page)}
                      >
                        {page + 1}
                      </Button>
                    </React.Fragment>
                  );
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;