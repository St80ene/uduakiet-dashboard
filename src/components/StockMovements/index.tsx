import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Search,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { IDataTableColumn } from '@/interfaces/data_table';
import { type IStockMovement } from '@/interfaces/stock_movements.interface';
import type { StockMovementsResponse } from '@/types';

import useDebouncedValue from '@/hooks/debounceHook';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import {
  StockMovementDirection,
  StockMovementType,
} from '@/enum/stock_movement.enum';
import { getAllStockMovements } from '@/services/stock_movements.service.api';
import { CalculateTotalValue, formatExactDateTime } from '@/common/utils';

interface IStockMovementRow extends IStockMovement {
  product_name?: string;
}

export const StockMovementsPage: React.FC = () => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Pagination state
  // ---------------------------------------------------------------------------

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // ---------------------------------------------------------------------------
  // Search & sort state
  // ---------------------------------------------------------------------------

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    data: stockMovementsData,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    refetch,
  } = useQuery<StockMovementsResponse>({
    queryKey: [
      'stock_movements',
      {
        page,
        limit,
        search: debouncedSearch,
        order: sortOrder,
      },
    ],

    queryFn: () =>
      getAllStockMovements({
        page,
        limit,
        search: debouncedSearch,
        order: sortOrder,
      }),

    placeholderData: (previousData) => previousData,
  });

  const stock_movements = stockMovementsData?.stock_movements ?? [];

  // ---------------------------------------------------------------------------
  // Pagination handlers
  // ---------------------------------------------------------------------------

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Search handler
  // ---------------------------------------------------------------------------

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Sort handlers
  // ---------------------------------------------------------------------------

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    setPage(1);
  };

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  const handleExport = () => {
    /*
     * There is currently no export endpoint in stockMovementService.
     *
     * Available endpoints are:
     * - GET all movements
     * - GET movement by ID
     * - GET movements by stock
     * - GET movements by product
     * - POST movement
     * - POST bulk movements
     *
     * Keep this handler ready for the export endpoint.
     */
    console.info('Stock movement export requested');
  };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: IDataTableColumn<IStockMovementRow>[] = [
    {
      key: 'type',
      header: 'Type',
      width: '14%',
      truncate: true,
      getTitle: (item) =>
        item.type
          ?.replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase()) ?? '—',
      render: (item) => {
        const type = item.type;

        const isInbound =
          type === StockMovementType.RETURN_IN ||
          type === StockMovementType.RECEIPT;

        const isOutbound =
          type === StockMovementType.RETURN_OUT ||
          type === StockMovementType.SALE;

        const label =
          type
            ?.replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase()) || '—';

        return (
          <span
            className={`inline-flex max-w-full items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
              isInbound
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : isOutbound
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {isInbound && <ArrowDownLeft size={10} className="shrink-0" />}

            {isOutbound && <ArrowUpRight size={10} className="shrink-0" />}

            {!isInbound && !isOutbound && (
              <ArrowLeftRight size={10} className="shrink-0" />
            )}

            <span className="truncate">{label}</span>
          </span>
        );
      },
    },

    {
      key: 'product_name',
      header: 'Product',
      width: '18%',
      truncate: true,
      getTitle: (item) => item.stock?.product?.name ?? '—',
      render: (item) => (
        <span className="font-semibold text-slate-800">
          {item.stock?.product?.name ?? '—'}
        </span>
      ),
    },

    {
      key: 'reason',
      header: 'Reason',
      width: '18%',
      truncate: true,
      getTitle: (item) => item.reason?.trim() || '—',
      render: (item) => (
        <span className="text-slate-500">{item.reason?.trim() || '—'}</span>
      ),
    },

    {
      key: 'quantity',
      header: 'Quantity',
      width: '10%',
      render: (item) => {
        const quantity = Math.abs(Number(item.quantity ?? 0));

        const isInbound = item.direction === StockMovementDirection.IN;

        const isOutbound = item.direction === StockMovementDirection.OUT;

        const displayQuantity =
          quantity === 0
            ? '0'
            : isInbound
              ? `+${quantity}`
              : isOutbound
                ? `-${quantity}`
                : `${quantity}`;

        return (
          <span
            className={`whitespace-nowrap font-bold ${
              isInbound
                ? 'text-emerald-600'
                : isOutbound
                  ? 'text-rose-600'
                  : 'text-slate-500'
            }`}
          >
            {displayQuantity}
          </span>
        );
      },
    },

    {
      key: 'unit_cost_price',
      header: 'Unit Cost',
      width: '12%',
      render: (item) => (
        <span className="whitespace-nowrap">
          ₦
          {Number(item.unit_cost_price ?? 0).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },

    {
      key: 'unit_selling_price',
      header: 'Unit Selling',
      width: '12%',
      render: (item) => (
        <span className="whitespace-nowrap">
          ₦
          {Number(item.unit_selling_price ?? 0).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },

    {
      key: 'total_value',
      header: 'Total Value',
      width: '14%',
      truncate: true,
      getTitle: ({ quantity, unit_cost_price }) =>
        CalculateTotalValue(quantity ?? 0, unit_cost_price ?? 0),

      render: ({ quantity, unit_cost_price }) => {
        return (
          <span className="whitespace-nowrap font-semibold text-slate-700">
            ₦
            {CalculateTotalValue(quantity ?? 0, unit_cost_price ?? 0).replace(
              '₦ ',
              '',
            )}
          </span>
        );
      },
    },

    {
      key: 'created_at',
      header: 'Date',
      width: '14%',
      truncate: true,
      getTitle: ({ created_at }) =>
        created_at ? formatExactDateTime(created_at) : '—',
      render: ({ created_at }) => {
        const formattedDate = created_at
          ? formatExactDateTime(created_at)
          : '—';

        return (
          <span
            className="whitespace-nowrap text-slate-400"
            title={formattedDate}
          >
            {formattedDate}
          </span>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return <LoadingScreen label="Fetching stock movement records..." />;
  }

  // ---------------------------------------------------------------------------
  // Error state
  // ---------------------------------------------------------------------------

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load stock movements"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading stock movement records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="text-sky-600" size={24} />
            Stock Movements
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Audit trail of all inbound deliveries, outbound dispatches, and
            inventory adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="
              flex items-center gap-1.5 rounded-lg
              border border-slate-200 bg-white
              px-3 py-1.5 text-xs font-semibold
              text-slate-700 hover:bg-slate-50
              shadow-2xs transition-colors
            "
          >
            <Download size={14} />
            Export Log
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Data Table */}
      {/* ------------------------------------------------------------------ */}

      <DataTable<IStockMovementRow>
        records={stock_movements as IStockMovementRow[]}
        columns={columns}
        meta={stockMovementsData?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IStockMovementRow) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <ArrowLeftRight className="w-7 h-7 text-slate-400" />,
          title: 'No stock movements found',
          description:
            'There are no stock movement records matching your current search.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* ------------------------------------------------------------ */}
            {/* Search */}
            {/* ------------------------------------------------------------ */}

            <div className="relative w-full sm:w-80">
              <label htmlFor="stock-movement-search" className="sr-only">
                Search Stock Movements
              </label>

              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              <input
                id="stock-movement-search"
                type="search"
                placeholder="Search stock movements..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="
                  w-full pl-9 pr-3 py-1.5
                  text-xs font-normal text-slate-800
                  placeholder:text-slate-400
                  bg-slate-50/50 border border-slate-200
                  rounded-lg outline-none
                  focus:bg-white focus:ring-2
                  focus:ring-slate-300
                  focus:border-slate-300
                  transition-all
                "
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Sort */}
            {/* ------------------------------------------------------------ */}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sort by:
                </span>

                <select
                  aria-label="Select sort field"
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="
                    bg-transparent text-xs
                    text-slate-700 font-medium
                    outline-none cursor-pointer pr-1
                  "
                >
                  <option value="created_at">Date Created</option>
                  <option value="updated_at">Date Updated</option>
                  <option value="quantity">Quantity</option>
                  <option value="type">Movement Type</option>
                </select>

                <button
                  type="button"
                  onClick={toggleSortOrder}
                  aria-label={`Sort direction ${sortOrder}`}
                  className="
                    p-1 hover:bg-slate-200/60
                    rounded text-slate-600
                    transition-colors cursor-pointer
                  "
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default StockMovementsPage;
