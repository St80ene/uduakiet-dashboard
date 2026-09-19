import type { FC } from 'react';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';

import type {
  DataTableEmptyStateProps,
  DataTablePaginationProps,
  DataTableProps,
} from '@/interfaces/data_table';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 7, 10, 25, 50, 100];

const DataTable = <T,>({
  records,
  columns,
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onSelectRecord,
  isPlaceholderData = false,
  isLoading = false,
  emptyState,
  getRowKey,
  getRowClassName,
  header,
  horizontalScroll = true,
}: DataTableProps<T>) => {
  const startItem =
    meta && meta.totalItems > 0
      ? (meta.currentPage - 1) * meta.itemsPerPage + 1
      : 0;

  const endItem = meta
    ? Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)
    : 0;

  const resolvedEmptyState = {
    icon: <PackageSearch className="w-7 h-7" />,
    title: 'No records found',
    description:
      'We couldn’t find any records matching your criteria. Try adjusting your search or filters.',
    ...emptyState,
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
      {header}

      <div
        className={`
          ${horizontalScroll ? 'overflow-x-auto' : 'overflow-hidden'}
          transition-opacity duration-200
          ${
            isPlaceholderData ? 'opacity-50 pointer-events-none' : 'opacity-100'
          }
        `}
      >
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead>
            <tr className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/60 select-none">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 ${column.headerClassName ?? ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <DataTableLoadingState columnCount={columns.length} />
            ) : records.length === 0 ? (
              <DataTableEmptyState
                columnCount={columns.length}
                icon={resolvedEmptyState.icon}
                title={resolvedEmptyState.title}
                description={resolvedEmptyState.description}
              />
            ) : (
              records.map((record, index) => (
                <tr
                  key={getRowKey?.(record, index) ?? index}
                  onClick={() => onSelectRecord?.(record)}
                  className={`
                    hover:bg-slate-50/80
                    transition-colors
                    group
                    ${onSelectRecord ? 'cursor-pointer' : ''}
                    ${getRowClassName?.(record) ?? ''}
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${column.cellClassName ?? ''}`}
                    >
                      {column.render(record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <DataTablePagination
          meta={meta}
          startItem={startItem}
          endItem={endItem}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
};

const DataTableEmptyState: FC<DataTableEmptyStateProps> = ({
  columnCount,
  icon,
  title,
  description,
}) => {
  return (
    <tr>
      <td colSpan={columnCount} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200/60">
            {icon}
          </div>

          <h3 className="text-base font-semibold text-slate-800 mb-1">
            {title}
          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
      </td>
    </tr>
  );
};

const DataTableLoadingState = ({ columnCount }: { columnCount: number }) => {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columnCount }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-4">
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

const DataTablePagination: FC<DataTablePaginationProps> = ({
  meta,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 bg-slate-50/50 border-t border-slate-200/60 select-none">
      {/* Summary + page size */}
      <div className="flex items-center gap-4">
        <div className="text-xs text-slate-500 whitespace-nowrap">
          Showing{' '}
          <span className="font-medium text-slate-700">{startItem}</span>
          {' – '}
          <span className="font-medium text-slate-700">{endItem}</span>
          {' of '}
          <span className="font-medium text-slate-700">
            {meta.totalItems}
          </span>{' '}
          items
        </div>

        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-2">
            <label
              htmlFor="data-table-page-size"
              className="text-xs text-slate-500 whitespace-nowrap"
            >
              Rows per page
            </label>

            <select
              id="data-table-page-size"
              value={meta.itemsPerPage}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="
                h-8
                px-2
                text-xs
                font-medium
                text-slate-700
                bg-white
                border border-slate-200
                rounded-lg
                shadow-2xs
                outline-none
                cursor-pointer
                focus:ring-2
                focus:ring-slate-300
                focus:border-slate-300
              "
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(meta.currentPage - 1)}
          disabled={!meta.hasPreviousPage}
          className="
            inline-flex items-center gap-1
            px-3 py-1.5
            text-xs font-medium
            text-slate-600
            bg-white
            border border-slate-200
            rounded-lg
            shadow-2xs
            hover:bg-slate-50
            disabled:opacity-50
            disabled:hover:bg-white
            disabled:cursor-not-allowed
            transition-colors
            cursor-pointer
          "
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>

        <div className="text-xs text-slate-600 font-medium px-2 whitespace-nowrap">
          Page {meta.currentPage} of {meta.totalPages}
        </div>

        <button
          type="button"
          onClick={() => onPageChange?.(meta.currentPage + 1)}
          disabled={!meta.hasNextPage}
          className="
            inline-flex items-center gap-1
            px-3 py-1.5
            text-xs font-medium
            text-slate-600
            bg-white
            border border-slate-200
            rounded-lg
            shadow-2xs
            hover:bg-slate-50
            disabled:opacity-50
            disabled:hover:bg-white
            disabled:cursor-not-allowed
            transition-colors
            cursor-pointer
          "
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default DataTable;
