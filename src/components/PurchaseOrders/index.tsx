import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  Eye,
  Search,
  ArrowUpDown,
  ArrowLeftRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
  PurchaseOrderStatus,
  type IPurchaseOrder,
  type IPurchaseOrderItem,
} from '@/interfaces/purchase_order.interface';
import type { IDataTableColumn } from '@/interfaces/data_table';

import useDebouncedValue from '@/hooks/debounceHook';
import { getAllPurchaseOrders } from '@/services/purchase_orders.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

export const PurchaseOrdersPage: React.FC = () => {
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  const {
    data: purchaseOrdersData,
    isLoading,
    isError,
    isPlaceholderData,
  } = useQuery({
    queryKey: [
      'purchase_orders',
      {
        page,
        limit,
        search: debouncedSearch,
        order: sortOrder,
      },
    ],
    queryFn: () =>
      getAllPurchaseOrders({
        page,
        limit,
        search: debouncedSearch || undefined,
        order: sortOrder,
      }),
    placeholderData: (previousData) => previousData,
  });

  if (isLoading && !purchaseOrdersData) {
    return <LoadingScreen />;
  }

  if (isError || !purchaseOrdersData) {
    return <ErrorPage message="Failed to load purchase orders" />;
  }

  const orders = purchaseOrdersData.data?.purchase_orders ?? [];

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === 'ASC' ? 'DESC' : 'ASC'));
    setPage(1);
  };

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.PENDING_APPROVAL:
      case PurchaseOrderStatus.PENDING:
        return 'bg-amber-50 border-amber-200 text-amber-700';

      case PurchaseOrderStatus.APPROVED:
      case PurchaseOrderStatus.SENT_TO_SUPPLIER:
        return 'bg-sky-50 border-sky-200 text-sky-700';

      case PurchaseOrderStatus.RECEIVED:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';

      default:
        return 'bg-slate-100 border-slate-200 text-slate-600';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const poColumns: IDataTableColumn<IPurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'PO Number',
      render: (po) => (
        <span className="font-mono font-bold text-sky-600">{po.po_number}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (po) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          <Truck size={13} className="text-slate-400" />
          {po.supplier_name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (po) => (
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
            po.status,
          )}`}
        >
          {po.status}
        </span>
      ),
    },
    {
      key: 'total_estimated_cost',
      header: 'Est. Total Cost',
      render: (po) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(po.total_estimated_cost)}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Items',
      render: (po) => `${po.items?.length ?? 0} item(s)`,
    },
    {
      key: 'created_at',
      header: 'Created Date',
      render: (po) => (
        <span className="text-slate-500">
          {formatDate(po.created_at.toString())}
        </span>
      ),
    },
  ];

  const itemColumns: IDataTableColumn<IPurchaseOrderItem>[] = [
    {
      key: 'product_id',
      header: 'Product ID',
      render: (item) => (
        <span className="font-mono text-slate-500">{item.product_id}</span>
      ),
    },
    {
      key: 'product_name',
      header: 'Product Name',
      render: (item) => (
        <span className="text-slate-800">{item.product_name}</span>
      ),
    },
    {
      key: 'quantity_requested',
      header: 'Qty Requested',
      render: (item) => (
        <span className="font-semibold text-slate-900">
          {item.quantity_requested}
        </span>
      ),
    },
    {
      key: 'estimated_unit_cost',
      header: 'Est. Unit Cost',
      render: (item) => (
        <span className="text-slate-700">
          {formatCurrency(item.estimated_unit_cost)}
        </span>
      ),
    },
    {
      key: 'line_total',
      header: 'Line Total',
      render: (item) => (
        <span className="font-semibold text-sky-600">
          {formatCurrency(item.quantity_requested * item.estimated_unit_cost)}
        </span>
      ),
    },
  ];

  const selectedOrder = orders.find(
    (order: IPurchaseOrder) => order.id === selectedPoId,
  );

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ShoppingCart className="text-sky-600" size={24} />
            Purchase Orders
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage procurement requests, item line specifications, and supplier
            fulfillment statuses.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-sky-500"
        >
          <Plus size={14} />
          Create Purchase Order
        </button>
      </div>

      {/* Purchase Orders Table */}
      <DataTable<IPurchaseOrder>
        records={
          purchaseOrdersData.data?.purchase_orders ?? ([] as IPurchaseOrder[])
        }
        columns={poColumns}
        meta={purchaseOrdersData.data?.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IPurchaseOrder) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectRecord={(order: IPurchaseOrder) =>
          setSelectedPoId((current) => (current === order.id ? null : order.id))
        }
        getRowClassName={(record: IPurchaseOrder) =>
          record.id === selectedPoId ? 'bg-sky-50/50' : ''
        }
        emptyState={{
          icon: <ArrowLeftRight className="w-7 h-7 text-slate-400" />,
          title: 'No purchase orders found.',
          description:
            'There are no purchase order records matching your current search.',
        }}
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search purchase orders..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Sort */}
            <button
              type="button"
              onClick={toggleSortOrder}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ArrowUpDown size={14} />
              {sortOrder === 'ASC' ? 'Oldest first' : 'Newest first'}
            </button>
          </div>
        }
      />

      {/* Selected PO Items */}
      {selectedOrder && (
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Eye size={14} className="text-sky-600" />
            Items for {selectedOrder.po_number}
          </h3>

          <DataTable<IPurchaseOrderItem>
            records={selectedOrder.items ?? []}
            columns={itemColumns}
            getRowKey={(record: IPurchaseOrderItem) => record.id}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
