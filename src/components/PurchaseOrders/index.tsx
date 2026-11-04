import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  Search,
  ArrowUpDown,
  ArrowLeftRight,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type ICreatePurchaseOrderFormData,
  type IPurchaseOrder,
} from '@/interfaces/purchase_order.interface';
import type { IDataTableColumn } from '@/interfaces/data_table';

import useDebouncedValue from '@/hooks/debounceHook';
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
} from '@/services/purchase_orders.service.api';
import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import {
  formatCurrency,
  formatRelativeTime,
  getStatusBadge,
} from '@/common/utils';
export const PurchaseOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

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

  // TanStack Mutation for creating the purchase order with error handling
  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (data: ICreatePurchaseOrderFormData) => {
      setIsSubmitting(true);
      return await createPurchaseOrder(data);
    },
    onSuccess: (response) => {
      toast.success(
        response?.message || 'Purchase order created successfully.',
      );
      queryClient.invalidateQueries({
        queryKey: ['purchase_orders_list'],
      });
      setIsSubmitting(false);
    },
    onError: (error: AxiosError<{ message: string | string[] }>) => {
      // Extract backend error message if available from Axios response
      const errorMessage = (error as AxiosError<{ message: string | string[] }>)
        ?.response?.data?.message;
      toast.error(errorMessage);
      setIsSubmitting(false);
      return Promise.reject(error); // Rethrow the error to propagate it to the caller
    },
  });

  if (isLoading && !purchaseOrdersData) {
    return <LoadingScreen />;
  }

  if (isError || !purchaseOrdersData) {
    return <ErrorPage message="Failed to load purchase orders" />;
  }

  const orders = purchaseOrdersData.purchase_orders ?? [];

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

  const poColumns: IDataTableColumn<IPurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'PO Number',
      render: ({ po_number }) => (
        <span className="font-mono font-bold text-sky-600">{po_number}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: ({ supplier_name }) => (
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
          <Truck size={13} className="text-slate-400" />
          {supplier_name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: ({ status }) => (
        <span
          className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
            status,
          )}`}
        >
          {status}
        </span>
      ),
    },
    {
      key: 'total_estimated_cost',
      header: 'Est. Total Cost',
      render: ({ total_estimated_cost }) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(total_estimated_cost)}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Items',
      render: ({ items_count }) => `${items_count ?? 0} item(s)`, // Updated to use backend items_count
    },
    {
      key: 'created_at',
      header: 'Created Date',
      render: ({ created_at }) => (
        <span className="text-slate-500">
          {formatRelativeTime(new Date(created_at))}
        </span>
      ),
    },
  ];

  const toggleModal = () => setModal(!modal);

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ShoppingCart className="text-sky-600" size={24} />
            Supply Purchase Orders
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage procurement requests, item line specifications, and supplier
            fulfillment statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleModal} // onclick event to open the create modal
          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-sky-500"
        >
          <Plus size={14} />
          Create Purchase Order
        </button>
      </div>
      {modal && (
        <AddPurchaseOrderModal
          isSubmitting={isSubmitting}
          setIsModalOpen={setModal}
          onSubmit={async (data) => {
            console.log('Form data submitted:', data);
            await createPurchaseOrderMutation.mutateAsync(data);
          }}
        />
      )}

      {/* Purchase Orders Table */}
      <DataTable<IPurchaseOrder>
        records={orders}
        columns={poColumns}
        meta={purchaseOrdersData.meta}
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
      {/* {selectedOrder && (
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
      )} */}
    </div>
  );
};

export default PurchaseOrdersPage;
