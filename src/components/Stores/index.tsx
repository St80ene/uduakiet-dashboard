import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Store as StoreIcon,
  Trash2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import type { IStore } from '@/interfaces/store.interface';
import type { StoresResponse } from '@/types';
import { storeService } from '@/services/stores.service.api';
import useDebouncedValue from '@/hooks/debounceHook';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

const StoresPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<StoresResponse>({
      queryKey: [
        'stores',
        {
          page,
          limit,
          search: debouncedSearch,
          sortBy: selectedSort,
          sortOrder,
        },
      ],
      queryFn: () =>
        storeService.getAllStores({
          page,
          limit,
          search: debouncedSearch,
          order: sortOrder,
        }),
      placeholderData: (previousData) => previousData,
    });

  const stores = data?.stores ?? [];

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

  const handleSortChange = useCallback(
    (sortBy: string) => {
      if (selectedSort === sortBy) {
        setSortOrder((current) => (current === 'ASC' ? 'DESC' : 'ASC'));
        return;
      }

      setSelectedSort(sortBy);
      setSortOrder('ASC');
    },
    [selectedSort],
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Store',
        sortable: true,
        onSort: () => handleSortChange('name'),
        render: (store: IStore) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <StoreIcon className="h-5 w-5 text-primary" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium text-gray-900 dark:text-white">
                {store.name}
              </p>

              <p className="text-xs text-gray-500">{store.code}</p>
            </div>
          </div>
        ),
      },

      {
        key: 'address',
        header: 'Location',
        sortable: true,
        onSort: () => handleSortChange('address'),
        render: (store: IStore) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />

            <span className="max-w-[220px] truncate text-sm text-gray-600 dark:text-gray-300">
              {store.address || 'No address'}
            </span>
          </div>
        ),
      },

      {
        key: 'business_id',
        header: 'Business',
        render: (store: IStore) => (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />

            <span className="text-sm text-gray-600 dark:text-gray-300">
              {store.business_id}
            </span>
          </div>
        ),
      },

      {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        onSort: () => handleSortChange('created_at'),
        render: (store: IStore) => (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {store.created_at
              ? new Date(store.created_at).toLocaleDateString()
              : '—'}
          </span>
        ),
      },

      {
        key: 'actions',
        header: 'Actions',
        render: (store: IStore) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View store"
              onClick={() => navigate(`/stores/${store.id}`)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Edit store"
              onClick={() => navigate(`/stores/${store.id}/edit`)}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </button>

            <button
              type="button"
              title="Delete store"
              onClick={() => {
                // Add delete confirmation/modal here.
              }}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, handleSortChange],
  );

  if (isLoading) {
    return <LoadingScreen label="Fetching stores..." />;
  }

  if (isError) {
    return (
      <ErrorPage
        title="Failed to load stores"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading store records.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <StoreIcon className="h-6 w-6 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Stores
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your business store locations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/stores/create')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Store
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search stores..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable<IStore>
        records={stores}
        columns={columns}
        meta={data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IStore) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default StoresPage;
