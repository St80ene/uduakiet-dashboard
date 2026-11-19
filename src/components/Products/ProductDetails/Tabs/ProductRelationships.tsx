import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Plus,
  ReceiptText,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';

import type { ISupplier } from '@/interfaces/supplier';
import type { IProductSource } from '@/interfaces/product_source.interface';
import type { IPaginationMeta } from '@/interfaces';
import { getAllSuppliers } from '@/services/suppliers.service.api';
import {
  createProductSource,
  getProductPurchaseHistory,
  updateProductSource,
} from '@/services/product_source.service.api';

interface IProductPurchaseHistoryItem {
  purchase_order_id: string;
  po_number: string;
  status: string;
  supplier_name: string | null;
  store_name: string | null;
  quantity_requested: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  purchased_at: string;
}

interface IProductPurchaseHistory {
  history: IProductPurchaseHistoryItem[];
  meta: IPaginationMeta;
}

interface ProductRelationshipsProps {
  productId: string;
  linkedSuppliers: IProductSource[];
}

function formatCurrency(value: number): string {
  return `₦${Number(value || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string): string {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusStyles(status: string): string {
  switch (status?.toUpperCase()) {
    case 'RECEIVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'SENT_TO_SUPPLIER':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'PENDING':
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'DRAFT':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function formatStatus(status: string): string {
  if (!status) return 'Unknown';

  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ProductRelationships({
  productId,
  linkedSuppliers,
}: ProductRelationshipsProps) {
  const queryClient = useQueryClient();

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [isChangingSupplier, setIsChangingSupplier] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Fetch suppliers
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () =>
      getAllSuppliers({
        page: 1,
        limit: 100,
      }),
  });

  const suppliers = suppliersData?.suppliers ?? [];

  // Fetch product purchase history
  const {
    data: purchaseHistoryResponse,
    isLoading: isLoadingPurchaseHistory,
    isError: isPurchaseHistoryError,
    error: purchaseHistoryError,
  } = useQuery({
    queryKey: ['product_purchase_history', productId, historyPage],
    queryFn: () =>
      getProductPurchaseHistory(productId, {
        page: historyPage,
        limit: 10,
        order: 'DESC',
        sortBy: 'created_at',
      }),
    enabled: Boolean(productId),
    placeholderData: (previousData) => previousData,
  });

  // Your API response is expected to be:
  // { message, data: { history, meta } }
  const purchaseHistory: IProductPurchaseHistory | undefined =
    purchaseHistoryResponse?.data;

  const history = purchaseHistory?.history ?? [];
  const meta = purchaseHistory?.meta;

  // Filter out suppliers already linked to this product
  const linkedSupplierIds = new Set(
    linkedSuppliers.map((item) => item.supplier_id),
  );

  const availableSuppliers = suppliers.filter(
    (supplier: ISupplier) => !linkedSupplierIds.has(supplier.id),
  );

  const primarySupplier = linkedSuppliers.find((item) => item.is_primary);

  // Assign a supplier to this product
  const assignSupplierMutation = useMutation({
    mutationFn: async (supplierId: string) => {
      return createProductSource({
        product_id: productId,
        supplier_id: supplierId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['product', productId],
      });

      setSelectedSupplierId('');
      setIsChangingSupplier(false);
    },
  });

  // Update an existing supplier relationship
  const updateSupplierMutation = useMutation({
    mutationFn: async ({
      sourceId,
      supplierId,
    }: {
      sourceId: string;
      supplierId: string;
    }) => {
      return updateProductSource(sourceId, {
        product_id: productId,
        supplier_id: supplierId,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['product', productId],
      });

      setSelectedSupplierId('');
      setIsChangingSupplier(false);
    },
  });

  const isSavingSupplier =
    assignSupplierMutation.isPending || updateSupplierMutation.isPending;

  const handleAssignSupplier = () => {
    if (!selectedSupplierId) return;

    assignSupplierMutation.mutate(selectedSupplierId);
  };

  return (
    <motion.div
      key="relationships"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Supply & Procurement
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage suppliers for this product and track procurement history.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linked Suppliers */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Linked Suppliers
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {linkedSuppliers.length}{' '}
                  {linkedSuppliers.length === 1 ? 'supplier' : 'suppliers'}{' '}
                  linked to this product
                </p>
              </div>
            </div>

            {linkedSuppliers.length > 0 && !isChangingSupplier && (
              <button
                type="button"
                onClick={() => setIsChangingSupplier(true)}
                disabled={isLoadingSuppliers || availableSuppliers.length === 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Supplier
              </button>
            )}
          </div>

          <div className="p-6 space-y-4 flex-1">
            {linkedSuppliers.length === 0 && (
              <div className="py-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-slate-400" />
                </div>
                <h5 className="text-sm font-semibold text-slate-800">
                  No suppliers linked yet
                </h5>
                <p className="text-xs text-slate-500 mt-1">
                  Link a supplier to start tracking sourcing costs and supplier
                  information for this product.
                </p>
              </div>
            )}

            {linkedSuppliers.map((linkedSupplier) => {
              const supplier = linkedSupplier.supplier;

              return (
                <div
                  key={linkedSupplier.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
                        {supplier?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-slate-900 truncate">
                          {supplier?.name || 'Unknown supplier'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {supplier?.email || 'No email provided'}
                        </p>
                        {supplier?.phone_number && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {supplier.phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    {linkedSupplier.is_primary && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        Primary Supplier
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Cost Price
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {formatCurrency(Number(linkedSupplier.cost_price || 0))}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Supplier SKU
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {linkedSupplier.supplier_sku || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Lead Time
                      </p>
                      <p className="text-sm font-semibold text-slate-700 mt-1">
                        {linkedSupplier.estimated_lead_time_days != null
                          ? `${linkedSupplier.estimated_lead_time_days} days`
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {(isChangingSupplier || linkedSuppliers.length === 0) && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
                <div>
                  <h5 className="text-sm font-semibold text-slate-900">
                    Add a Supplier
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Select an existing supplier from your supplier directory.
                  </p>
                </div>

                {isLoadingSuppliers ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading suppliers...
                  </div>
                ) : availableSuppliers.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Select Supplier
                    </label>
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                      disabled={isSavingSupplier}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Choose a supplier...</option>
                      {availableSuppliers.map((supplier: ISupplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                          {supplier.email ? ` (${supplier.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center">
                    <p className="text-xs font-medium text-slate-700">
                      No available suppliers
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {suppliers.length > 0
                        ? 'All existing suppliers are already linked to this product.'
                        : 'No suppliers found. Create a supplier first.'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  {linkedSuppliers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSupplier(false);
                        setSelectedSupplierId('');
                      }}
                      disabled={isSavingSupplier}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAssignSupplier}
                    disabled={
                      !selectedSupplierId ||
                      isSavingSupplier ||
                      isLoadingSuppliers
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSavingSupplier ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Add Supplier
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Supply Insights */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 bg-slate-50/50">
            <h4 className="text-sm font-semibold text-slate-900">
              Supply Insights
            </h4>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Users className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Supplier Coverage
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {linkedSuppliers.length > 0
                    ? `${linkedSuppliers.length} supplier(s) available for this product.`
                    : 'No supplier linked yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Primary Supplier
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {primarySupplier?.supplier?.name || 'Not assigned'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <TriangleAlert className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Sourcing Options
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {linkedSuppliers.length > 1
                    ? 'Multiple sourcing options available.'
                    : linkedSuppliers.length === 1
                      ? 'Only one sourcing option available.'
                      : 'Add suppliers to improve sourcing flexibility.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-900">
                Purchase History
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track purchase orders and quantities procured for this product.
            </p>
          </div>

          {meta && (
            <span className="text-xs font-medium text-slate-500">
              {meta.totalItems} {meta.totalItems === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>

        {isLoadingPurchaseHistory && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 mt-3">
              Loading purchase history...
            </p>
          </div>
        )}

        {isPurchaseHistoryError && !isLoadingPurchaseHistory && (
          <div className="py-10 px-6 text-center">
            <TriangleAlert className="w-6 h-6 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">
              Unable to load purchase history
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {purchaseHistoryError instanceof Error
                ? purchaseHistoryError.message
                : 'Something went wrong while retrieving purchase history.'}
            </p>
          </div>
        )}

        {!isLoadingPurchaseHistory &&
          !isPurchaseHistoryError &&
          history.length === 0 && (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <h5 className="text-sm font-semibold text-slate-800">
                No purchase history found
              </h5>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Purchase orders containing this product will appear here once
                they are created.
              </p>
            </div>
          )}

        {!isLoadingPurchaseHistory && history.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/70 border-b border-slate-100">
                  <tr>
                    {[
                      'Purchase Order',
                      'Supplier / Store',
                      'Ordered',
                      'Received',
                      'Unit Cost',
                      'Total Cost',
                      'Status',
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {history.map((purchase) => (
                    <tr
                      key={purchase.purchase_order_id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-900">
                          {purchase.po_number}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(purchase.purchased_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs font-medium text-slate-800">
                          {purchase.supplier_name || 'Unknown supplier'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {purchase.store_name || 'No store specified'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        {purchase.quantity_requested.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                        {purchase.quantity_received.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 text-xs font-medium text-slate-700">
                        {formatCurrency(purchase.unit_cost)}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-slate-900">
                        {formatCurrency(purchase.total_cost)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${getStatusStyles(purchase.status)}`}
                        >
                          {formatStatus(purchase.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile and Tablet Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {history.map((purchase) => (
                <div
                  key={purchase.purchase_order_id}
                  className="p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {purchase.po_number}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {purchase.supplier_name || 'Unknown supplier'}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(purchase.purchased_at)}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap ${getStatusStyles(purchase.status)}`}
                    >
                      {formatStatus(purchase.status)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Store:</span>{' '}
                    {purchase.store_name || 'No store specified'}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                        Ordered
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {purchase.quantity_requested.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                        Received
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {purchase.quantity_received.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                        Unit Cost
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {formatCurrency(purchase.unit_cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                        Total Cost
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {formatCurrency(purchase.total_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 px-5 sm:px-6 py-4">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-semibold text-slate-700">
                    {(meta.currentPage - 1) * meta.itemsPerPage + 1}
                  </span>
                  {' - '}
                  <span className="font-semibold text-slate-700">
                    {Math.min(
                      meta.currentPage * meta.itemsPerPage,
                      meta.totalItems,
                    )}
                  </span>
                  {' of '}
                  <span className="font-semibold text-slate-700">
                    {meta.totalItems}
                  </span>{' '}
                  records
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!meta.hasPreviousPage}
                    onClick={() => setHistoryPage((page) => page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>

                  <span className="text-xs text-slate-500 px-1">
                    {meta.currentPage} / {meta.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!meta.hasNextPage}
                    onClick={() => setHistoryPage((page) => page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
