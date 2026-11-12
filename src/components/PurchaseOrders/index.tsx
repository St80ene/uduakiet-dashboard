import React, { useState, type ReactNode } from 'react';
import {
  ShoppingCart,
  Plus,
  Truck,
  Search,
  ArrowUpDown,
  ArrowLeftRight,
  Eye,
  Edit2,
  CheckCircle2,
  Send,
  Ban,
  Trash2,
  ThumbsDown,
  PackageCheck,
  Loader2,
} from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

import {
  type ICreatePurchaseOrderFormData,
  type IPurchaseOrder,
} from '@/interfaces/purchase_order.interface';

import type { IDataTableColumn } from '@/interfaces/data_table';

import useDebouncedValue from '@/hooks/debounceHook';

import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  submitPurchaseOrderForApproval,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  markPurchaseOrderAsSent,
  cancelPurchaseOrder,
  removeDraftPurchaseOrder,
} from '@/services/purchase_orders.service.api';

import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';

import AddPurchaseOrderModal from './AddPurchaseOrderModal';
import UpdatePurchaseOrderModal from './UpdatePurchaseOrderModal';

import {
  formatCurrency,
  formatRelativeTime,
  getStatusBadge,
} from '@/common/utils';

import { PurchaseOrderStatus } from '@/enum/purchase_order.enum';
import { getAllProducts } from '@/services/products.service.api';

type WorkflowAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'send'
  | 'cancel'
  | 'delete';

interface WorkflowPayload {
  action: WorkflowAction;
  order: IPurchaseOrder;
  reason?: string | undefined;
  supplierCancellationConfirmed?: boolean;
}

interface ConfirmationToastProps {
  message: string;
  confirmLabel: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationToast: React.FC<ConfirmationToastProps> = ({
  message,
  confirmLabel,
  confirmColor = 'bg-sky-600 hover:bg-sky-500',
  onConfirm,
  onCancel,
}) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-slate-800">{message}</p>

    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={onConfirm}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white cursor-pointer ${confirmColor}`}
      >
        {confirmLabel}
      </button>
    </div>
  </div>
);

interface ReasonToastProps {
  title: string;
  buttonLabel: string;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

const ReasonToast: React.FC<ReasonToastProps> = ({
  title,
  buttonLabel,
  onSubmit,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-800">{title}</p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Enter reason..."
        rows={3}
        className="w-full resize-none rounded-md border border-slate-200 p-2 text-xs text-slate-700 outline-none focus:border-sky-500"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={!reason.trim()}
          onClick={() => onSubmit(reason.trim())}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export const PurchaseOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<IPurchaseOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 350);

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

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

  const { data: productsData } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => getAllProducts({ page: 1, limit: 100 }),
  });

  const products = productsData?.products || [];

  // ---------------------------------------------------------------------------
  // Create purchase order
  // ---------------------------------------------------------------------------

  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (data: ICreatePurchaseOrderFormData) => {
      setIsSubmitting(true);
      return createPurchaseOrder(data);
    },

    onSuccess: (response) => {
      toast.success(
        response?.message || 'Purchase order created successfully.',
      );

      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      setModal(false);
    },

    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const message = error.response?.data?.message;

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message || 'Failed to create purchase order.',
      );
    },

    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // ---------------------------------------------------------------------------
  // Purchase order workflow mutation
  // ---------------------------------------------------------------------------

  const workflowMutation = useMutation({
    mutationFn: async ({
      action,
      order,
      reason,
      supplierCancellationConfirmed,
    }: WorkflowPayload) => {
      switch (action) {
        case 'submit':
          return submitPurchaseOrderForApproval(order.id);

        case 'approve':
          return approvePurchaseOrder(order.id);

        case 'reject':
          return rejectPurchaseOrder(order.id, { reason });

        case 'send':
          return markPurchaseOrderAsSent(order.id);

        case 'cancel':
          return cancelPurchaseOrder(order.id, {
            reason,
            supplier_cancellation_confirmed: supplierCancellationConfirmed,
          });

        case 'delete':
          return removeDraftPurchaseOrder(order.id);
      }
    },

    onSuccess: (response) => {
      toast.success(response?.message || 'Purchase order updated.');

      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_order'] });
    },

    onError: (error: AxiosError<{ message: string | string[] }>) => {
      const message = error.response?.data?.message;

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message || 'Purchase order action failed.',
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Toast helpers
  // ---------------------------------------------------------------------------

  const showConfirmation = (
    message: string,
    confirmLabel: string,
    onConfirm: () => void,
    confirmColor?: string,
  ) => {
    const toastId = toast.info(
      <ConfirmationToast
        message={message}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor}
        onConfirm={() => {
          toast.dismiss(toastId);
          onConfirm();
        }}
        onCancel={() => toast.dismiss(toastId)}
      />,
      {
        autoClose: false,
        closeButton: false,
        draggable: false,
      },
    );
  };

  const showReasonToast = (
    title: string,
    buttonLabel: string,
    onSubmit: (reason: string) => void,
  ) => {
    const toastId = toast.info(
      <ReasonToast
        title={title}
        buttonLabel={buttonLabel}
        onSubmit={(reason) => {
          toast.dismiss(toastId);
          onSubmit(reason);
        }}
        onCancel={() => toast.dismiss(toastId)}
      />,
      {
        autoClose: false,
        closeButton: false,
        draggable: false,
      },
    );
  };

  // ---------------------------------------------------------------------------
  // Workflow action handler
  // ---------------------------------------------------------------------------

  const handleWorkflowAction = (
    action: WorkflowAction,
    order: IPurchaseOrder,
  ) => {
    switch (action) {
      case 'submit':
        showConfirmation(
          'Submit this purchase order for manager approval?',
          'Submit',
          () => workflowMutation.mutate({ action, order }),
        );
        break;

      case 'approve':
        showConfirmation(
          'Are you sure you want to approve this purchase order?',
          'Approve',
          () => workflowMutation.mutate({ action, order }),
          'bg-green-600 hover:bg-green-500',
        );
        break;

      case 'reject':
        showReasonToast(
          'Provide a reason for rejecting this purchase order.',
          'Reject PO',
          (reason) => workflowMutation.mutate({ action, order, reason }),
        );
        break;

      case 'send':
        showConfirmation(
          'Confirm that this purchase order has been sent to the supplier.',
          'Mark as Sent',
          () => workflowMutation.mutate({ action, order }),
        );
        break;

      case 'cancel':
        showReasonToast(
          'Provide a reason for cancelling this purchase order.',
          'Continue',
          (reason) => {
            if (order.status === PurchaseOrderStatus.SENT_TO_SUPPLIER) {
              showConfirmation(
                'Has the supplier confirmed cancellation of this purchase order?',
                'Yes, Confirmed',
                () =>
                  workflowMutation.mutate({
                    action,
                    order,
                    reason,
                    supplierCancellationConfirmed: true,
                  }),
                'bg-red-600 hover:bg-red-500',
              );
            } else {
              showConfirmation(
                'Are you sure you want to cancel this purchase order?',
                'Cancel PO',
                () =>
                  workflowMutation.mutate({
                    action,
                    order,
                    reason,
                  }),
                'bg-red-600 hover:bg-red-500',
              );
            }
          },
        );
        break;

      case 'delete':
        showConfirmation(
          'Are you sure you want to remove this draft purchase order?',
          'Delete Draft',
          () => workflowMutation.mutate({ action, order }),
          'bg-red-600 hover:bg-red-500',
        );
        break;
    }
  };

  // ---------------------------------------------------------------------------
  // Loading and error states
  // ---------------------------------------------------------------------------

  if (isLoading && !purchaseOrdersData) {
    return <LoadingScreen />;
  }

  if (isError || !purchaseOrdersData) {
    return <ErrorPage message="Failed to load purchase orders" />;
  }

  const orders = purchaseOrdersData.purchase_orders ?? [];

  // ---------------------------------------------------------------------------
  // Table handlers
  // ---------------------------------------------------------------------------

  const handlePageChange = (nextPage: number) => setPage(nextPage);

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

  const handleOpenEdit = (order: IPurchaseOrder) => {
    setOrderToEdit(order);
    setEditModal(true);
  };

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

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
      render: ({ items_count }) => `${items_count ?? 0} item(s)`,
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
    {
      key: 'id',
      header: 'Actions',
      render: (order) => {
        const isProcessing =
          workflowMutation.isPending &&
          workflowMutation.variables?.order.id === order.id;

        const actionButton = (
          label: string,
          icon: ReactNode,
          onClick: () => void,
          color: string,
        ) => (
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`rounded p-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
          >
            {isProcessing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              icon
            )}
          </button>
        );

        return (
          <div className="flex flex-wrap items-center gap-1">
            {/* View details */}
            {actionButton(
              'View details',
              <Eye size={14} />,
              () => navigate(`/purchase-orders/${order.id}`),
              'text-slate-500 hover:text-sky-600 hover:bg-sky-50',
            )}

            {/* Draft actions */}
            {order.status === PurchaseOrderStatus.DRAFT && (
              <>
                {actionButton(
                  'Edit draft',
                  <Edit2 size={14} />,
                  () => handleOpenEdit(order),
                  'text-slate-500 hover:text-sky-600 hover:bg-sky-50',
                )}

                {actionButton(
                  'Submit for approval',
                  <CheckCircle2 size={14} />,
                  () => handleWorkflowAction('submit', order),
                  'text-sky-600 hover:bg-sky-50',
                )}

                {actionButton(
                  'Delete draft',
                  <Trash2 size={14} />,
                  () => handleWorkflowAction('delete', order),
                  'text-red-500 hover:bg-red-50',
                )}
              </>
            )}

            {/* Approval actions */}
            {order.status === PurchaseOrderStatus.PENDING_APPROVAL && (
              <>
                {actionButton(
                  'Approve',
                  <CheckCircle2 size={14} />,
                  () => handleWorkflowAction('approve', order),
                  'text-green-600 hover:bg-green-50',
                )}

                {actionButton(
                  'Reject',
                  <ThumbsDown size={14} />,
                  () => handleWorkflowAction('reject', order),
                  'text-red-500 hover:bg-red-50',
                )}
              </>
            )}

            {/* Supplier action */}
            {order.status === PurchaseOrderStatus.APPROVED &&
              actionButton(
                'Mark as sent to supplier',
                <Send size={14} />,
                () => handleWorkflowAction('send', order),
                'text-sky-600 hover:bg-sky-50',
              )}

            {/* Receiving action */}
            {order.status === PurchaseOrderStatus.SENT_TO_SUPPLIER &&
              actionButton(
                'Receive purchase order',
                <PackageCheck size={14} />,
                () => navigate(`/purchase-orders/${order.id}`),
                'text-green-600 hover:bg-green-50',
              )}

            {/* Cancellation action */}
            {[
              PurchaseOrderStatus.DRAFT,
              PurchaseOrderStatus.PENDING_APPROVAL,
              PurchaseOrderStatus.APPROVED,
              PurchaseOrderStatus.SENT_TO_SUPPLIER,
            ].includes(order.status) &&
              actionButton(
                'Cancel purchase order',
                <Ban size={14} />,
                () => handleWorkflowAction('cancel', order),
                'text-red-500 hover:bg-red-50',
              )}
          </div>
        );
      },
    },
  ];

  // ---------------------------------------------------------------------------
  // Page
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6 p-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ShoppingCart className="text-sky-600" size={24} />
            Supply Purchase Orders
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage procurement requests, approvals, and supplier fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal(true)}
          className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-sky-500"
        >
          <Plus size={14} />
          Create Purchase Order
        </button>
      </div>

      {/* Create modal */}
      {modal && (
        <AddPurchaseOrderModal
          isSubmitting={isSubmitting}
          setIsModalOpen={setModal}
          onSubmit={async (data) => {
            await createPurchaseOrderMutation.mutateAsync(data);
          }}
        />
      )}

      {/* Edit modal */}
      {editModal && orderToEdit && (
        <UpdatePurchaseOrderModal
          isOpen={editModal}
          onClose={() => {
            setEditModal(false);
            setOrderToEdit(null);
          }}
          purchaseOrderId={orderToEdit.id}
          products={products}
        />
      )}

      {/* Purchase order table */}
      <DataTable<IPurchaseOrder>
        records={orders}
        columns={poColumns}
        meta={purchaseOrdersData.meta}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        getRowKey={(record: IPurchaseOrder) => record.id}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyState={{
          icon: <ArrowLeftRight className="w-7 h-7 text-slate-400" />,
          title: 'No purchase orders found.',
          description:
            'There are no purchase order records matching your current search.',
        }}
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

            <button
              type="button"
              onClick={toggleSortOrder}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <ArrowUpDown size={14} />
              {sortOrder === 'ASC' ? 'Oldest first' : 'Newest first'}
            </button>
          </div>
        }
      />
    </div>
  );
};

export default PurchaseOrdersPage;
