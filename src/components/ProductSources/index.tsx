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
  CheckCircle2,
  Tag,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import type { IDataTableColumn } from '@/interfaces/data_table';
import type {
  IProductSource,
  ProductSourcesResponse,
} from '@/interfaces/product_source.interface';

import useDebouncedValue from '@/hooks/debounceHook';
import { productSourceService } from '@/services/product_source.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import { productService } from '@/services/products.service.api';
import { supplierService } from '@/services/suppliers.service.api';
import type { IProduct } from '@/interfaces/products';
import type { ISupplier } from '@/interfaces/supplier';

interface ProductSourceRow extends IProductSource {
  product_name?: string;
  supplier_name?: string;
  is_primary?: boolean;
  supplier_sku?: string;
  cost_price?: number;
  estimated_lead_time_days?: number;
}

const initialFormState = {
  product_id: '',
  supplier_id: '',
  supplier_sku: '',
  cost_price: '',
  estimated_lead_time_days: '',
  is_primary: false,
};

export const ProductSources: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // Pagination State
  // ---------------------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // ---------------------------------------------------------------------------
  // Search & Sort State
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [isSubmitting] = useState<boolean>(false);

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Modal & Consolidated Form State
  // ---------------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IProductSource | null>(
    null,
  );
  const [formData, setFormData] = useState(initialFormState);

  // Unified form input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

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

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-list'],
    queryFn: () =>
      productService.getAllProducts({
        page: 1,
        limit: 100,
      }),
  });

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () =>
      supplierService.getAllSuppliers({
        page: 1,
        limit: 100,
      }),
  });

  const suppliers = suppliersData?.suppliers || [];
  const products = productsData?.products || [];

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (payload: {
      product_id: string;
      supplier_id: string;
      supplier_sku?: string;
      cost_price: number;
      estimated_lead_time_days?: number;
      is_primary: boolean;
    }) => productSourceService.createProductSource(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_sources'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        product_id: string;
        supplier_id: string;
        supplier_sku?: string;
        cost_price: number;
        estimated_lead_time_days?: number;
        is_primary: boolean;
      };
    }) => productSourceService.updateProductSource(id, payload),
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
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (source: ProductSourceRow) => {
    setEditingSource(source);
    setFormData({
      product_id: source.product_id || '',
      supplier_id: source.supplier_id || '',
      supplier_sku: source.supplier_sku || '',
      cost_price: source.cost_price?.toString() || '',
      estimated_lead_time_days:
        source.estimated_lead_time_days?.toString() || '',
      is_primary: Boolean(source.is_primary),
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
    setFormData(initialFormState);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      product_id: formData.product_id,
      supplier_id: formData.supplier_id,
      supplier_sku: formData.supplier_sku.trim() || undefined,
      cost_price: Number(formData.cost_price),
      estimated_lead_time_days: formData.estimated_lead_time_days
        ? Number(formData.estimated_lead_time_days)
        : undefined,
      is_primary: formData.is_primary,
    };

    if (editingSource) {
      updateMutation.mutate({
        id: editingSource.id,
        payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  // ---------------------------------------------------------------------------
  // Functional CSV Export Handler
  // ---------------------------------------------------------------------------
  const handleExport = () => {
    const records = (data?.product_sources ?? []) as ProductSourceRow[];
    if (records.length === 0) {
      return;
    }

    const headers = [
      'Product ID',
      'Product Name',
      'Supplier ID',
      'Supplier Name',
      'Supplier SKU',
      'Cost Price',
      'Lead Time (Days)',
      'Is Primary',
      'Linked Date',
    ];

    const rows = records.map((item) => [
      item.product_id || '',
      `"${(item.product?.name ?? item.product_name ?? '').replace(/"/g, '""')}"`,
      item.supplier_id || '',
      `"${(item.supplier?.name ?? item.supplier_name ?? '').replace(/"/g, '""')}"`,
      `"${(item.supplier_sku || '').replace(/"/g, '""')}"`,
      item.cost_price ?? 0,
      item.estimated_lead_time_days ?? '',
      item.is_primary ? 'Yes' : 'No',
      item.created_at ? new Date(item.created_at).toISOString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `product_sources_${new Date().toISOString().split('T')[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: IDataTableColumn<ProductSourceRow>[] = [
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
      header: 'Supplier & SKU',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-sky-500 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">
                {item.supplier?.name ?? item.supplier_name ?? '—'}
              </span>
              {item.is_primary && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
                  <CheckCircle2 size={10} />
                  Primary
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Tag size={10} /> {item.supplier_sku || 'No Supplier SKU'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'cost_price',
      header: 'Cost & Lead Time',
      render: (item) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-800 flex items-center">
            <DollarSign size={12} className="text-emerald-600" />
            {Number(item.cost_price || 0).toLocaleString('en-NG', {
              minimumFractionDigits: 2,
            })}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock size={11} className="text-amber-500" />
            {item.estimated_lead_time_days
              ? `${item.estimated_lead_time_days} days lead time`
              : 'Lead time not set'}
          </span>
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
  // Loading & Error States
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingScreen label="Fetching product source linkages..." />;
  }

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
            registered suppliers with cost structures and primary status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center cursor-pointer gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download size={14} />
            Export Mapping
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center cursor-pointer gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shadow-2xs"
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

      {/* Create/Edit Modal with Consolidated State */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Boxes size={16} className="text-cyan-600" />
                {editingSource
                  ? 'Edit Product Source Mapping'
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
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="product_id"
                  required
                  value={formData.product_id}
                  onChange={handleInputChange}
                  disabled={isLoadingProducts || isSubmitting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select a Product...</option>
                  {products.map((product: IProduct) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  name="supplier_id"
                  required
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  disabled={isLoadingSuppliers || isSubmitting}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select a Supplier...</option>
                  {suppliers.map((supplier: ISupplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Two Column Grid for Cost Price & Supplier SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cost Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    name="cost_price"
                    placeholder="0.00"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier SKU
                  </label>
                  <input
                    type="text"
                    name="supplier_sku"
                    placeholder="e.g. SUP-SKU-123"
                    value={formData.supplier_sku}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Estimated Lead Time Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Lead Time (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  name="estimated_lead_time_days"
                  placeholder="e.g. 5"
                  value={formData.estimated_lead_time_days}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Is Primary Checkbox */}
              <div className="flex items-center gap-2 pt-1 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <input
                  type="checkbox"
                  id="is_primary"
                  name="is_primary"
                  checked={formData.is_primary}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500 cursor-pointer"
                />
                <label
                  htmlFor="is_primary"
                  className="text-xs font-medium text-slate-700 cursor-pointer select-none flex flex-col"
                >
                  <span className="font-semibold text-slate-900">
                    Set as Primary Supplier
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Makes this supplier the default primary source for
                    purchasing.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-1.5 cursor-pointer text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex cursor-pointer items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50"
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
