import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { IDataTableColumn } from '@/interfaces/data_table';
import {
  type IStockMovement,
  type StockMovementFormData,
} from '@/interfaces/stock_movements.interface';
import type { StockMovementsResponse } from '@/types';

import useDebouncedValue from '@/hooks/debounceHook';
import { stockMovementService } from '@/services/stock_movements.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import { StockMovementType } from '@/enum/stock_movement.enum';

interface IStockMovementRow extends IStockMovement {
  product_name?: string;
}

export const StockMovementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Pagination state
  // ---------------------------------------------------------------------------

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<StockMovementsResponse>({
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
        stockMovementService.getAllStockMovements({
          page,
          limit,
          search: debouncedSearch,
          order: sortOrder,
        }),

      placeholderData: (previousData) => previousData,
    });

  // ---------------------------------------------------------------------------
  // Create movement mutation
  // ---------------------------------------------------------------------------
  //
  // The actual Record Movement modal/form can be plugged into this mutation.
  // ---------------------------------------------------------------------------

  const createMovementMutation = useMutation({
    mutationFn: (payload: StockMovementFormData) =>
      stockMovementService.createMovement(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['stock_movements'],
      });
    },
  });

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
  // Record movement
  // ---------------------------------------------------------------------------

  const handleRecordMovement = () => {
    /*
     * Open your RecordMovementModal here.
     *
     * Example:
     *
     * setIsMovementModalOpen(true);
     */
    console.info('Record movement requested');
  };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------

  const columns: IDataTableColumn<IStockMovementRow>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (item) => {
        const type = item.type;

        const isInbound =
          type === StockMovementType.RETURN_IN ||
          type === StockMovementType.RECEIPT;

        const isOutbound =
          type === StockMovementType.RETURN_OUT ||
          type === StockMovementType.SALE;

        return (
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${
              isInbound
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : isOutbound
                  ? 'bg-sky-50 border-sky-200 text-sky-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            {isInbound && <ArrowDownLeft size={10} />}
            {isOutbound && <ArrowUpRight size={10} />}
            {!isInbound && !isOutbound && <ArrowLeftRight size={10} />}

            {type}
          </span>
        );
      },
    },

    {
      key: 'product_name',
      header: 'Product',
      render: (item) => (
        <span className="font-semibold text-slate-800">
          {item.product_name ?? '—'}
        </span>
      ),
    },

    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span className="text-slate-500">{item.reason || '—'}</span>
      ),
    },

    {
      key: 'quantity',
      header: 'Quantity',
      render: (item) => {
        /*
         * If your IStockMovement has `direction`, use it to determine
         * whether the quantity should be displayed as + or -.
         *
         * This supports the current quantity representation as well.
         */
        const quantity = Number(item.quantity ?? 0);

        return (
          <span
            className={`font-bold ${
              quantity > 0
                ? 'text-emerald-600'
                : quantity < 0
                  ? 'text-rose-600'
                  : 'text-slate-500'
            }`}
          >
            {quantity > 0 ? `+${quantity}` : quantity}
          </span>
        );
      },
    },

    {
      key: 'unit_cost_price',
      header: 'Unit Cost',
      render: (item) =>
        `₦${Number(item.unit_cost_price ?? 0).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },

    {
      key: 'unit_selling_price',
      header: 'Unit Selling',
      render: (item) =>
        `₦${Number(item.unit_selling_price ?? 0).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
    },

    {
      key: 'total_value',
      header: 'Total Value',
      render: (item) => {
        const quantity = Math.abs(Number(item.quantity ?? 0));
        const unitCost = Number(item.unit_cost_price ?? 0);

        return (
          <span className="font-semibold text-slate-700">
            ₦
            {(quantity * unitCost).toLocaleString('en-NG', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        );
      },
    },

    {
      key: 'created_at',
      header: 'Date',
      render: (item) => (
        <span className="text-slate-400">
          {item.created_at
            ? new Date(item.created_at).toLocaleString('en-NG', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'}
        </span>
      ),
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

          <button
            type="button"
            onClick={handleRecordMovement}
            disabled={createMovementMutation.isPending}
            className="
              flex items-center gap-1.5 rounded-lg
              bg-sky-600 px-3 py-1.5 text-xs
              font-semibold text-white
              hover:bg-sky-500
              disabled:opacity-50
              disabled:cursor-not-allowed
              shadow-2xs transition-colors
            "
          >
            <Plus size={14} />
            Record Movement
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Data Table */}
      {/* ------------------------------------------------------------------ */}

      <DataTable<IStockMovementRow>
        records={(data?.stock_movements ?? []) as IStockMovementRow[]}
        columns={columns}
        meta={data?.meta}
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
