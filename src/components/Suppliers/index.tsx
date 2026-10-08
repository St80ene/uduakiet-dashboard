import { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ISupplier } from '@/interfaces/supplier';
import type { IDataTableColumn } from '@/interfaces/data_table';
import DataTable from '@/common/DataTable';
import { CreateSupplierModal } from './CreateSupplierModal';
import { UpdateSupplierModal } from './UpdateSupplierModal';
import { useDeleteSupplier, useGetSuppliers } from '@/hooks/useSuppliers.hook';
import useDebouncedValue from '@/hooks/debounceHook';

export const SuppliersPage = () => {
  // ---------------------------------------------------------------------------
  // Pagination State
  // ---------------------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');

  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------
  const {
    data: suppliersData,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useGetSuppliers({
    page,
    limit,
    search: debouncedSearch,
    order: sortOrder.toLowerCase() as 'ASC' | 'DESC',
  });

  // ---------------------------------------------------------------------------
  // Search & Sort State
  // ---------------------------------------------------------------------------
  const [selectedSort, setSelectedSort] = useState('created_at');

  const suppliers: ISupplier[] = suppliersData?.suppliers || [];

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(
    null,
  );

  // NEW: State for tracking supplier targeted for deletion modal
  // const [supplierToDelete, setSupplierToDelete] = useState<ISupplier | null>(
  //   null,
  // );

  const deleteMutation = useDeleteSupplier();

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

  // const confirmDelete = () => {
  //   if (!supplierToDelete) return;

  //   deleteMutation.mutate(supplierToDelete.id, {
  //     onSuccess: () => {
  //       setSupplierToDelete(null); // Close modal on success
  //     },
  //   });
  // };

  // ---------------------------------------------------------------------------
  // Columns
  // ---------------------------------------------------------------------------
  const columns: IDataTableColumn<ISupplier>[] = [
    {
      key: 'name',
      header: 'Supplier Name',
      render: (supplier: ISupplier) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <Link
              to={`/suppliers/${supplier.id}`}
              className="line-clamp-1 font-semibold text-slate-800 hover:text-indigo-600 transition-colors"
            >
              {supplier.name}
            </Link>
            <span className="text-xs text-slate-400">ID: {supplier.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (supplier: ISupplier) => (
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700">
              {supplier.phone_number}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{supplier.email || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'purchaseOrdersCount',
      header: 'Purchase Orders',
      render: (supplier: ISupplier) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {supplier.purchaseOrdersCount ?? 0} Orders
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      cellClassName: 'text-right',
      render: (supplier: ISupplier) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setEditingSupplier(supplier)}
            aria-label={`Edit ${supplier.name}`}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            // onClick={() => setSupplierToDelete(supplier)} // Opens the delete modal
            disabled={deleteMutation.isPending}
            aria-label={`Delete ${supplier.name}`}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 flex flex-col items-center gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h2 className="text-lg font-semibold">Failed to load suppliers</h2>
          <p className="text-sm">
            {(error as Error)?.message || 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Product Suppliers
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage vendors and product procurement channels. Your Supply Chain.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      {/* Data Table */}
      <DataTable<ISupplier>
        records={suppliers}
        columns={columns}
        meta={suppliersData?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: ISupplier) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <Truck className="h-7 w-7 text-slate-400" />,
          title: 'No suppliers registered',
          description:
            'Add your first supplier to link products and issue purchase orders.',
        }}
        header={
          <div className="p-4 border-b border-slate-200/60 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search by name, phone or email..."
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-slate-300"
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
                  <option value="created_at">Date Created</option>
                  <option value="name">Supplier Name</option>
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

      {/* --------------------------------------------------------------------------- */}
      {/* Delete Confirmation Modal Overlay                                          */}
      {/* --------------------------------------------------------------------------- */}
      {/* {supplierToDelete && (
        <DeleteSupplierModal
          supplier={supplierToDelete}
          onClose={() => setSupplierToDelete(null)}
        />
      )} */}

      {/* Modals */}
      {isCreateOpen && (
        <CreateSupplierModal onClose={() => setIsCreateOpen(false)} />
      )}

      {editingSupplier && (
        <UpdateSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}
    </div>
  );
};

export default SuppliersPage;
