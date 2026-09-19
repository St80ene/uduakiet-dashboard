import { useMemo, useState } from 'react';
import { Truck, Plus, Search, Mail, Edit2, Trash2 } from 'lucide-react';

import type { ISupplier } from '@/interfaces/supplier';
import DataTable from '@/common/DataTable';

export const SuppliersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [suppliers] = useState<ISupplier[]>([
    {
      id: 'sup_1',
      name: 'Global Freight & Logistics Ltd',
      email: 'orders@globalfreight.com',
      created_at: new Date('2024-01-10'),
      updated_at: new Date('2024-03-01'),
      productSourcesCount: 14,
      purchaseOrdersCount: 5,
    },
    {
      id: 'sup_2',
      name: 'Acme Component Distributors',
      email: 'supply@acmedist.com',
      created_at: new Date('2024-02-18'),
      updated_at: new Date('2024-03-05'),
      productSourcesCount: 28,
      purchaseOrdersCount: 12,
    },
  ]);

  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query),
    );
  }, [searchQuery, suppliers]);

  const columns = [
    {
      key: 'name',
      header: 'Supplier Name',
      width: '35%',
      render: (supplier: ISupplier) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Truck className="h-4 w-4" />
          </div>

          <div>
            <div className="line-clamp-1 font-semibold text-slate-800">
              {supplier.name}
            </div>

            <span className="text-xs text-slate-400">ID: {supplier.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact Email',
      width: '30%',
      render: (supplier: ISupplier) => (
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          <span>{supplier.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'purchaseOrdersCount',
      header: 'Purchase Orders',
      width: '20%',
      render: (supplier: ISupplier) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {supplier.purchaseOrdersCount ?? 0} Orders
        </span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      width: '15%',
      cellClassName: 'text-right',
      render: (supplier: ISupplier) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`Edit ${supplier.name}`}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Edit2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label={`Delete ${supplier.name}`}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Suppliers
          </h1>

          <p className="mt-0.5 text-sm text-slate-500">
            Manage vendors and product procurement channels.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Supplier
        </button>
      </div>

      <DataTable<ISupplier>
        records={filteredSuppliers}
        columns={columns}
        getRowKey={(record: ISupplier) => record.id}
        emptyState={{
          icon: <Truck className="h-7 w-7" />,
          title: 'No suppliers registered',
          description:
            'Add your first supplier to link products and issue purchase orders.',
        }}
        header={
          <div className="flex items-center justify-between border-b border-slate-200/60 bg-white p-4">
            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                placeholder="Search suppliers by name or email..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
