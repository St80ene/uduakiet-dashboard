import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Store as StoreIcon,
  Edit,
  Layers,
  Eye,
} from 'lucide-react';

import type {
  IStock,
  ICreateStockPayload,
  IUpdateStockPayload,
} from '@/interfaces/stock.interface';
import type { StocksResponse } from '@/types';
import useDebouncedValue from '@/hooks/debounceHook';

import {
  adjustStock,
  createStock,
  getAllStocks,
} from '@/services/stocks.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import { StocksHeader } from './StocksHeader';
import { CreateStockModal } from './CreateStockModal';
import { UpdateStockModal } from './UpdateStockModal';

export const StocksPage = () => {
  const navigate = useNavigate();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search & sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStockForUpdate, setSelectedStockForUpdate] =
    useState<IStock | null>(null);

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);
  const queryClient = useQueryClient();

  // Fetch stocks query
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

  // Create stock mutation hook
  const {
    mutate: createStockMutation,
    isPending: isCreating,
    error: createError,
  } = useMutation({
    mutationFn: (payload: ICreateStockPayload) => createStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsCreateModalOpen(false);
    },
  });

  // Update stock mutation hook
  const {
    mutate: updateStockMutation,
    isPending: isUpdating,
    error: updateError,
  } = useMutation({
    mutationFn: (payload: IUpdateStockPayload) => adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setSelectedStockForUpdate(null);
    },
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
        width: '25%',
        render: (stock: IStock) => (
          <div
            onClick={() => navigate(`/stocks/${stock.id}`)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {stock.product?.images?.[0]?.url ? (
              <img
                src={stock.product.images[0].url}
                alt={stock.product.name}
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200 group-hover:border-blue-400 transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Package className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
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
      {
        key: 'actions',
        header: 'Actions',
        width: '15%',
        render: (stock: IStock) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/stocks/${stock.id}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="View Stock Details"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              View
            </button>
            <button
              onClick={() => setSelectedStockForUpdate(stock)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              title="Update Stock Count"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              Edit
            </button>
          </div>
        ),
      },
    ],
    [navigate],
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
      <StocksHeader
        totalStocks={totalStocks}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedSort={selectedSort}
        onSortChange={(val) => {
          setSelectedSort(val);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onToggleSortOrder={toggleSortOrder}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Stock DataTable */}
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
      />

      {/* Create Stock Modal */}
      {isCreateModalOpen && (
        <CreateStockModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(payload) => createStockMutation(payload)}
          isPending={isCreating}
          error={createError}
        />
      )}

      {/* Update Stock Modal */}
      {selectedStockForUpdate && (
        <UpdateStockModal
          stock={selectedStockForUpdate}
          onClose={() => setSelectedStockForUpdate(null)}
          onSubmit={(payload) => updateStockMutation(payload)}
          isPending={isUpdating}
          error={updateError}
        />
      )}
    </div>
  );
};

export default StocksPage;
