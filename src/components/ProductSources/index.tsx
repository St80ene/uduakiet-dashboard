import React, { useState } from 'react';
import {
  Boxes,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  Truck,
  Edit2,
  X,
  Loader2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { DataTableColumn } from '@/interfaces/data_table';
import type {
  IProductSource,
  ProductSourcesResponse,
} from '@/interfaces/product_source.interface';

import useDebouncedValue from '@/hooks/debounceHook';
import { productSourceService } from '@/services/product_source.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

interface ProductSourceRow extends IProductSource {
  product_name?: string;
  supplier_name?: string;
}

export const ProductSources: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Pagination State
  // ---------------------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // ---------------------------------------------------------------------------
  // Search & Sort State
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IProductSource | null>(
    null,
  );
  const [productIdInput, setProductIdInput] = useState('');
  const [supplierIdInput, setSupplierIdInput] = useState('');

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------
  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useQuery<ProductSourcesResponse>({
      queryKey: [
        'product_sources',
        {
          page,
          limit,
          search: debouncedSearch,
          order: sortOrder,
        },
      ],
      queryFn: () =>
        productSourceService.getAllProductSources({
          page,
          limit,
          search: debouncedSearch,
          order: sortOrder,
        }),
      placeholderData: (previousData) => previousData,
    });

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (formData: FormData) =>
      productSourceService.createProductSource(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_sources'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      productSourceService.updateProductSource(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_sources'] });
      closeModal();
    },
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePageChange = (newPage: number) => setPage(newPage);

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
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setEditingSource(null);
    setProductIdInput('');
    setSupplierIdInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (source: IProductSource) => {
    setEditingSource(source);
    setProductIdInput(source.product_id || '');
    setSupplierIdInput(source.supplier_id || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
    setProductIdInput('');
    setSupplierIdInput('');
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('product_id', productIdInput);
    formData.append('supplier_id', supplierIdInput);

    if (editingSource) {
      updateMutation.mutate({ id: editingSource.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleExport = () => {
    console.info('Product source mapping export requested');
  };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: DataTableColumn<ProductSourceRow>[] = [
    {
      key: 'product_name',
      header: 'Product',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-cyan-500 shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800">
              {item.product?.name ?? item.product_name ?? '—'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {item.product_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier Source',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-sky-500 shrink-0" />
          <div className="flex flex-col">
            <span className="font-medium text-slate-700">
              {item.supplier?.name ?? item.supplier_name ?? '—'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {item.supplier_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Linked Date',
      render: (item) => (
        <span className="text-slate-500 text-xs">
          {item.created_at
            ? new Date(item.created_at).toLocaleString('en-NG', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <button
          type="button"
          onClick={() => handleOpenEditModal(item)}
          className="p-1 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
          title="Edit Product Source"
        >
          <Edit2 size={14} />
        </button>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingScreen label="Fetching product source linkages..." />;
  }

  // ---------------------------------------------------------------------------
  // Error State
  // ---------------------------------------------------------------------------
  if (isError) {
    return (
      <ErrorPage
        title="Failed to load product sources"
        message={
          error instanceof Error
            ? error.message
            : 'An error occurred while loading product source mappings.'
        }
        onRetry={() => refetch()}
        onNavigateHome={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="text-cyan-600" size={24} />
            Product Sources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage procurement provenance mapping linking catalog items to
            registered primary suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download size={14} />
            Export Mapping
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-2xs"
          >
            <Plus size={14} />
            Map Source
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable<ProductSourceRow>
        records={(data?.product_sources ?? []) as ProductSourceRow[]}
        columns={columns}
        meta={data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: ProductSourceRow) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <Boxes className="w-7 h-7 text-slate-400" />,
          title: 'No product source mappings found',
          description:
            'There are no product supplier mappings matching your search criteria.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search product sources..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
                <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Sort by:
                </span>
                <select
                  value={selectedSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
                >
                  <option value="created_at">Date Linked</option>
                  <option value="product_id">Product ID</option>
                  <option value="supplier_id">Supplier ID</option>
                </select>

                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Boxes size={16} className="text-cyan-600" />
                {editingSource
                  ? 'Edit Product Source'
                  : 'Link New Product Source'}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 rounded p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. prd_9f8e7d..."
                  value={productIdInput}
                  onChange={(e) => setProductIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sup_1a2b3c..."
                  value={supplierIdInput}
                  onChange={(e) => setSupplierIdInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  <span>{editingSource ? 'Save Changes' : 'Create Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSources;
