import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  ReceiptText,
  TrendingUp,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { ISupplier } from '@/interfaces/supplier';
import type { IPurchaseOrder } from '@/interfaces/purchase_order.interface';

function ProductRelationships({
  assignedSupplier,
  isChangingSupplier,
  setIsChangingSupplier,
  selectedSupplierId,
  setSelectedSupplierId,
  isLoadingSuppliers,
  assignOrUpdateSupplierMutation,
  suppliers,
  handleAssignSupplier,
  purchase_orders,
}: {
  assignedSupplier: ISupplier | null;
  isChangingSupplier: boolean;
  setIsChangingSupplier: (isChanging: boolean) => void;
  selectedSupplierId: string;
  setSelectedSupplierId: (supplierId: string) => void;
  isLoadingSuppliers: boolean;
  assignOrUpdateSupplierMutation: {
    isPending: boolean;
  };
  suppliers: ISupplier[];
  handleAssignSupplier: () => void;
  purchase_orders: IPurchaseOrder[]; // Replace 'any' with the appropriate type for purchase orders
}) {
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
          Manage the supplier for this product and track procurement history.
        </p>
      </div>

      {/* Main Grid: Supplier Details & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Supplier Card */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-900">
                Assigned Supplier
              </h4>
            </div>
            {assignedSupplier && !isChangingSupplier && (
              <button
                type="button"
                onClick={() => setIsChangingSupplier(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                Change Supplier
              </button>
            )}
          </div>

          <div className="p-6 flex-1 flex flex-col justify-center">
            {assignedSupplier && !isChangingSupplier ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 font-bold">
                    {assignedSupplier.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-900 truncate">
                      {assignedSupplier.name}
                    </h5>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {assignedSupplier.email || 'No email provided'}
                    </p>
                    {assignedSupplier.phone_number && (
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {assignedSupplier.phone_number}
                      </p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                  Active Source
                </span>
              </div>
            ) : (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {assignedSupplier
                      ? 'Select New Supplier'
                      : 'Assign Supplier Vendor'}
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    disabled={
                      isLoadingSuppliers ||
                      assignOrUpdateSupplierMutation.isPending
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Choose a supplier from list...</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} {sup.email ? `(${sup.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {isChangingSupplier && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSupplier(false);
                        setSelectedSupplierId('');
                      }}
                      className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAssignSupplier}
                    disabled={
                      !selectedSupplierId ||
                      assignOrUpdateSupplierMutation.isPending
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {assignOrUpdateSupplierMutation.isPending
                      ? 'Saving...'
                      : assignedSupplier
                        ? 'Update Supplier'
                        : 'Link Supplier'}
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
                <p className="text-xs font-semibold text-slate-800">Coverage</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {assignedSupplier
                    ? '1 active primary supplier.'
                    : 'No supplier linked yet.'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <TrendingUp className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Cost Trend
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No purchase history recorded.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <TriangleAlert className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Supply Risk
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Evaluation pending history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Procurement History Section */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Recent Purchases
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent procurement transactions for this product
            </p>
          </div>
          {purchase_orders?.length ? (
            <button
              type="button"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              View procurement history
            </button>
          ) : null}{' '}
        </div>

        {purchase_orders?.length ? (
          <div className="divide-y divide-slate-100">
            {purchase_orders
              .slice(0, 5)
              .map((purchase: IPurchaseOrder) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between px-6 py-3.5 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {purchase.supplier_name || 'Unknown supplier'}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {purchase.items?.[0]?.quantity_requested
                        ? purchase.items[0].quantity_requested.toLocaleString()
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Unit Cost
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {purchase.items?.[0]?.estimated_unit_cost
                        ? `₦${Number(purchase.items[0].estimated_unit_cost).toLocaleString()}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <span className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {purchase.status || 'Recorded'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <ReceiptText className="w-8 h-8 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium">No purchase history found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ProductRelationships;
