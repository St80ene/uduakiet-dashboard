import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  Calendar,
  User,
  Boxes,
  DollarSign,
  FileText,
} from 'lucide-react';

import LoadingScreen from '@/common/Error/LoadingScreen';
import { ErrorPage } from '@/common/Error/ErrorPage';
import DataTable from '@/common/DataTable';
import type { IDataTableColumn } from '@/interfaces/data_table';
import type { IPurchaseOrderItem } from '@/interfaces/purchase_order.interface';
import {
  formatCurrency,
  formatRelativeTime,
  getStatusBadge,
} from '@/common/utils';
import { getPurchaseOrderByID } from '@/services/purchase_orders.service.api';

export const PurchaseOrderDetailPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  // Fetch single purchase order by ID
  const {
    data: purchase_order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['purchase_order', poId],
    queryFn: () => getPurchaseOrderByID(poId as string),
    enabled: Boolean(poId),
  });

  if (isLoading) {
    return <LoadingScreen label="Loading purchase order details..." />;
  }

  if (isError || !purchase_order) {
    return (
      <ErrorPage
        title="Purchase Order Not Found"
        message={
          error instanceof Error
            ? error.message
            : 'The requested purchase order could not be found or has been removed.'
        }
        onNavigateHome={() => navigate('/purchase-orders')}
      />
    );
  }

  // Line items table columns
  const itemColumns: IDataTableColumn<IPurchaseOrderItem>[] = [
    {
      key: 'product_name',
      header: 'Product',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="font-semibold text-slate-800">
            {item.product?.name ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'quantity_requested',
      header: 'Qty Requested',
      render: (item) => (
        <span className="font-medium text-slate-700">
          {item.quantity_requested}
        </span>
      ),
    },
    {
      key: 'quantity_received',
      header: 'Qty Received',
      render: (item) => (
        <span className="font-medium text-emerald-600">
          {item.quantity_received ?? 0}
        </span>
      ),
    },
    {
      key: 'estimated_unit_cost',
      header: 'Unit Cost',
      render: (item) => formatCurrency(item.estimated_unit_cost),
    },
    {
      key: 'total_cost',
      header: 'Total Cost',
      render: (item) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(item.total_cost)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 min-h-screen bg-slate-50/50">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => navigate('/purchase-orders')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Purchase Orders
        </button>

        <span
          className={`rounded border px-2.5 py-1 text-xs font-bold ${getStatusBadge(
            purchase_order.status,
          )}`}
        >
          {purchase_order.status}
        </span>
      </div>

      {/* Header Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-sky-600" size={24} />
              <h1 className="text-xl font-bold font-mono text-slate-900">
                {purchase_order.po_number}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Detailed procurement record and line item breakdown.
            </p>
          </div>

          <div className="text-right sm:text-left bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Est. Total Cost
            </span>
            <span className="text-lg font-bold text-slate-900 flex items-center gap-0.5">
              <DollarSign size={16} className="text-emerald-600" />
              {Number(purchase_order.total_estimated_cost || 0).toLocaleString(
                'en-NG',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Truck size={16} />
            </div>
            <div>
              <span className="text-slate-400 block">Supplier</span>
              <span className="font-semibold text-slate-800">
                {purchase_order.supplier?.name ??
                  purchase_order.supplier_name ??
                  '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-slate-400 block">Created Date</span>
              <span className="font-semibold text-slate-800">
                {formatRelativeTime(new Date(purchase_order.created_at))}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <User size={16} />
            </div>
            <div>
              <span className="text-slate-400 block">Created By</span>
              <span className="font-semibold text-slate-800">
                {purchase_order.created_by?.first_name ||
                purchase_order.created_by?.last_name
                  ? `${purchase_order.created_by?.first_name ?? ''} ${purchase_order.created_by?.last_name ?? ''}`.trim()
                  : 'System User'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText size={16} />
            </div>
            <div>
              <span className="text-slate-400 block">Approved By</span>
              <span className="font-semibold text-slate-800">
                {purchase_order.approved_by?.first_name ||
                purchase_order.approved_by?.last_name
                  ? `${purchase_order.approved_by?.first_name ?? ''} ${purchase_order.approved_by?.last_name ?? ''}`.trim()
                  : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Boxes size={14} className="text-sky-600" /> Order Line Items (
          {purchase_order.items?.length || 0})
        </h3>

        <DataTable<IPurchaseOrderItem>
          records={purchase_order.items ?? []}
          columns={itemColumns}
          getRowKey={(record: IPurchaseOrderItem) => record.id}
          emptyState={{
            icon: <Boxes className="w-7 h-7 text-slate-400" />,
            title: 'No line items found for this purchase order.',
            description:
              'This purchase order does not contain any product items.',
          }}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderDetailPage;
