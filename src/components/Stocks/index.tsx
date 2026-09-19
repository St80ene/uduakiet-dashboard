import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Layers,
  Search,
  ArrowUpDown,
  Filter,
  Package,
  AlertTriangle,
  Store as StoreIcon,
} from 'lucide-react';

import type { IStock } from '@/interfaces/stock.interface';
import type { StocksResponse } from '@/types';
import useDebouncedValue from '@/hooks/debounceHook';

import { getAllStocks } from '@/services/stocks.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

export const StocksPage = () => {
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<StocksResponse>({
      queryKey: [
        'stocks',
        {
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          order: sortOrder,
        },
      ],

      queryFn: () =>
        getAllStocks({
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          order: sortOrder,
        }),

      placeholderData: (previousData) => previousData,
    });

  const stocks = data?.stocks ?? [];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setLimit(newSize);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  const columns = useMemo(
    () => [
      {
        key: 'product',
        header: 'Product',
        width: '30%',
        render: (stock: IStock) => (
          <div className="flex items-center gap-3">
            {stock.product?.images?.[0]?.url ? (
              <img
                src={stock.product.images[0].url}
                alt={stock.product.name}
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4" />
              </div>
            )}

            <div className="min-w-0">
              <div className="font-semibold text-slate-800 line-clamp-1">
                {stock.product?.name || stock.product_id}
              </div>
            </div>
          </div>
        ),
      },

      {
        key: 'store',
        header: 'Store',
        width: '20%',
        render: (stock: IStock) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <StoreIcon className="w-3.5 h-3.5 text-slate-400" />

            <span>{stock.store?.name || stock.store_id}</span>
          </div>
        ),
      },

      {
        key: 'quantity',
        header: 'Current Stock',
        width: '15%',
        render: (stock: IStock) => (
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-800">
              {stock.current_quantity}
            </span>

            {stock.product?.uom_display_name && (
              <span className="text-xs text-slate-400">
                {stock.product.uom_display_name}
              </span>
            )}
          </div>
        ),
      },

      {
        key: 'status',
        header: 'Status',
        width: '15%',
        render: (stock: IStock) => {
          const quantity = Number(stock.current_quantity ?? 0);

          if (quantity <= 0) {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                <AlertTriangle className="w-3 h-3" />
                Out of Stock
              </span>
            );
          }

          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              In Stock
            </span>
          );
        },
      },

      {
        key: 'updated_at',
        header: 'Last Updated',
        width: '15%',
        render: (stock: IStock) => (
          <span className="text-xs text-slate-500">
            {new Date(stock.updated_at).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return <LoadingScreen label="Fetching inventory..." />;
  }

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load inventory"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading stock records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => window.history.back()}
      />
    );
  }

  const totalStocks = data?.meta?.totalItems ?? stocks.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Inventory
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Monitor current stock balances across your stores.
        </p>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Stock Records
          </p>

          <p className="text-xl font-bold text-slate-900 mt-1">{totalStocks}</p>
        </div>
      </div>

      {/* Stock table */}
      <DataTable<IStock>
        records={stocks}
        columns={columns}
        meta={data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IStock) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <Layers className="w-7 h-7 text-slate-400" />,
          title: 'No stock records found',
          description:
            'Current inventory balances will appear here when stock is available.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <label htmlFor="stock-search" className="sr-only">
                Search inventory
              </label>

              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              <input
                id="stock-search"
                type="search"
                placeholder="Search product or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="
                  w-full pl-9 pr-3 py-1.5 text-xs font-normal
                  text-slate-800 placeholder:text-slate-400
                  bg-slate-50/50 border border-slate-200
                  rounded-lg outline-none focus:bg-white
                  focus:ring-2 focus:ring-slate-300
                  focus:border-slate-300 transition-all
                "
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sort by:
                </span>

                <select
                  aria-label="Select sort field"
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setPage(1);
                  }}
                  className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="updated_at">Last Updated</option>
                  <option value="created_at">Date Created</option>
                  <option value="quantity">Quantity</option>
                  <option value="reorder_level">Reorder Level</option>
                </select>

                <button
                  type="button"
                  onClick={toggleSortOrder}
                  aria-label={`Sort direction ${sortOrder}`}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors cursor-pointer"
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

export default StocksPage;
