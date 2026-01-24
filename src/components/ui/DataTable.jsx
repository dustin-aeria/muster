import React, { useState, useMemo, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Check,
  Minus,
  Loader2,
  ArrowUpDown,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react';

/**
 * Batch 115: DataTable Component
 *
 * Advanced data table components with sorting, filtering, pagination.
 *
 * Exports:
 * - DataTable: Full-featured data table
 * - DataTableHeader: Table header with sorting
 * - DataTableRow: Table row with selection
 * - DataTableCell: Table cell
 * - DataTablePagination: Pagination controls
 * - DataTableToolbar: Toolbar with search/filter
 * - DataTableColumnToggle: Column visibility toggle
 * - DataTableEmpty: Empty state
 * - DataTableLoading: Loading state
 */

// ============================================================================
// DATA TABLE CONTEXT
// ============================================================================
const DataTableContext = React.createContext({});

export const useDataTable = () => React.useContext(DataTableContext);

// ============================================================================
// DATA TABLE - Full-featured data table
// ============================================================================
export function DataTable({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = true,
  sortColumn,
  sortDirection,
  onSort,
  paginated = false,
  pageSize = 10,
  currentPage = 1,
  totalItems,
  onPageChange,
  onPageSizeChange,
  stickyHeader = false,
  striped = false,
  bordered = false,
  compact = false,
  hoverable = true,
  emptyMessage = 'No data available',
  className,
  ...props
}) {
  const [internalSort, setInternalSort] = useState({ column: sortColumn, direction: sortDirection || 'asc' });
  const [internalPage, setInternalPage] = useState(currentPage);
  const [internalSelection, setInternalSelection] = useState(selectedRows);

  // Use controlled or internal state
  const activeSort = sortColumn !== undefined ? { column: sortColumn, direction: sortDirection } : internalSort;
  const activePage = currentPage !== undefined ? currentPage : internalPage;
  const activeSelection = selectedRows !== undefined ? selectedRows : internalSelection;

  // Sort data
  const sortedData = useMemo(() => {
    if (!activeSort.column || !sortable) return data;

    return [...data].sort((a, b) => {
      const aVal = a[activeSort.column];
      const bVal = b[activeSort.column];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return activeSort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, activeSort, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (activePage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, activePage, pageSize]);

  const totalPages = Math.ceil((totalItems || data.length) / pageSize);

  // Handlers
  const handleSort = (column) => {
    if (!sortable) return;

    const newDirection =
      activeSort.column === column && activeSort.direction === 'asc' ? 'desc' : 'asc';

    if (onSort) {
      onSort(column, newDirection);
    } else {
      setInternalSort({ column, direction: newDirection });
    }
  };

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const handleSelectAll = () => {
    const allIds = paginatedData.map((row, i) => row.id || i);
    const allSelected = allIds.every((id) => activeSelection.includes(id));

    const newSelection = allSelected
      ? activeSelection.filter((id) => !allIds.includes(id))
      : [...new Set([...activeSelection, ...allIds])];

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelection(newSelection);
    }
  };

  const handleSelectRow = (rowId) => {
    const newSelection = activeSelection.includes(rowId)
      ? activeSelection.filter((id) => id !== rowId)
      : [...activeSelection, rowId];

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelection(newSelection);
    }
  };

  const allSelected = paginatedData.length > 0 &&
    paginatedData.every((row, i) => activeSelection.includes(row.id || i));
  const someSelected = paginatedData.some((row, i) => activeSelection.includes(row.id || i));

  return (
    <DataTableContext.Provider
      value={{
        columns,
        sortable,
        activeSort,
        handleSort,
        selectable,
        activeSelection,
        handleSelectRow,
        compact,
      }}
    >
      <div className={cn('w-full', className)} {...props}>
        <div className={cn(
          'overflow-auto rounded-lg border border-gray-200 dark:border-gray-700',
          bordered && 'border'
        )}>
          <table className="w-full border-collapse">
            <thead className={cn(
              'bg-gray-50 dark:bg-gray-800',
              stickyHeader && 'sticky top-0 z-10'
            )}>
              <tr>
                {selectable && (
                  <th className={cn(
                    'w-12 px-4 text-left',
                    compact ? 'py-2' : 'py-3'
                  )}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <DataTableHeaderCell
                    key={column.key}
                    column={column}
                    compact={compact}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12"
                  >
                    <DataTableLoading />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="py-12"
                  >
                    <DataTableEmpty message={emptyMessage} />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const rowId = row.id || rowIndex;
                  const isSelected = activeSelection.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      className={cn(
                        'border-t border-gray-200 dark:border-gray-700',
                        striped && rowIndex % 2 === 1 && 'bg-gray-50 dark:bg-gray-800/50',
                        hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      {selectable && (
                        <td className={cn('px-4', compact ? 'py-2' : 'py-3')}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectRow(rowId)}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-4 text-sm text-gray-900 dark:text-white',
                            compact ? 'py-2' : 'py-3',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render
                            ? column.render(row[column.key], row, rowIndex)
                            : row[column.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {paginated && !loading && paginatedData.length > 0 && (
          <DataTablePagination
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems || data.length}
            onPageChange={handlePageChange}
            onPageSizeChange={onPageSizeChange}
            className="mt-4"
          />
        )}
      </div>
    </DataTableContext.Provider>
  );
}

// ============================================================================
// DATA TABLE HEADER CELL
// ============================================================================
function DataTableHeaderCell({ column, compact }) {
  const { sortable, activeSort, handleSort } = useDataTable();
  const isSortable = sortable && column.sortable !== false;
  const isSorted = activeSort.column === column.key;

  return (
    <th
      className={cn(
        'px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider',
        compact ? 'py-2' : 'py-3',
        isSortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700',
        column.align === 'center' && 'text-center',
        column.align === 'right' && 'text-right',
        column.width && `w-[${column.width}]`
      )}
      onClick={() => isSortable && handleSort(column.key)}
    >
      <div className={cn(
        'flex items-center gap-2',
        column.align === 'center' && 'justify-center',
        column.align === 'right' && 'justify-end'
      )}>
        {column.header || column.key}
        {isSortable && (
          <span className="text-gray-400">
            {isSorted ? (
              activeSort.direction === 'asc' ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )
            ) : (
              <ChevronsUpDown className="w-4 h-4" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

// ============================================================================
// CHECKBOX - Internal checkbox component
// ============================================================================
function Checkbox({ checked, indeterminate, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={onChange}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
        checked || indeterminate
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
      )}
    >
      {checked && <Check className="w-3 h-3" />}
      {indeterminate && !checked && <Minus className="w-3 h-3" />}
    </button>
  );
}

// ============================================================================
// DATA TABLE PAGINATION
// ============================================================================
export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  ...props
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">
          {startItem}-{endItem} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange?.(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange?.(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// DATA TABLE TOOLBAR
// ============================================================================
export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  onExport,
  selectedCount = 0,
  onBulkAction,
  bulkActions = [],
  children,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {onSearchChange && (
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {filters}
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} selected
            </span>
            {bulkActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onBulkAction?.(action.key)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  action.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          >
            <Download className="w-5 h-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DATA TABLE COLUMN TOGGLE
// ============================================================================
export function DataTableColumnToggle({
  columns,
  visibleColumns,
  onToggle,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
      >
        <Eye className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                Toggle columns
              </p>
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => onToggle(column.key)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {column.header || column.key}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// DATA TABLE EMPTY
// ============================================================================
export function DataTableEmpty({
  message = 'No data available',
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn('text-center py-8', className)}
      {...props}
    >
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ============================================================================
// DATA TABLE LOADING
// ============================================================================
export function DataTableLoading({
  message = 'Loading data...',
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 py-8', className)}
      {...props}
    >
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      <span className="text-gray-500 dark:text-gray-400">{message}</span>
    </div>
  );
}

// ============================================================================
// DATA TABLE SKELETON
// ============================================================================
export function DataTableSkeleton({
  columns = 5,
  rows = 5,
  className,
  ...props
}) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700', className)} {...props}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-700">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div
                    className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
                    style={{ width: `${60 + Math.random() * 40}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// SIMPLE TABLE - Basic table without advanced features
// ============================================================================
export function SimpleTable({
  columns,
  data,
  className,
  ...props
}) {
  return (
    <div className={cn('overflow-auto rounded-lg border border-gray-200 dark:border-gray-700', className)} {...props}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase"
              >
                {col.header || col.key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  {col.render ? col.render(row[col.key], row, i) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
