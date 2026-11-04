import type { PurchaseOrderStatus } from '@/enum/purchase_order.enum';
import React, { useState } from 'react';

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  total_estimated_cost: number;
  status: PurchaseOrderStatus;
}

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-001',
    po_number: 'PO-2026-001',
    supplier_name: 'Global Packaging Ltd.',
    total_estimated_cost: 1250.5,
    status: 'DRAFT',
  },
  {
    id: 'po-002',
    po_number: 'PO-2026-002',
    supplier_name: 'Prime Retail Supplies',
    total_estimated_cost: 840.0,
    status: 'APPROVED',
  },
  {
    id: 'po-003',
    po_number: 'PO-2026-003',
    supplier_name: 'Industrial Distribution Co.',
    total_estimated_cost: 2340.75,
    status: 'RECEIVED',
  },
];

export const Orders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    initialPurchaseOrders,
  );

  const approveOrder = (orderId: string) => {
    setPurchaseOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'APPROVED' } : order,
      ),
    );
  };

  const receiveOrder = (orderId: string) => {
    setPurchaseOrders((previousOrders) =>
      previousOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'RECEIVED' } : order,
      ),
    );
  };

  const getStatusAction = (po: PurchaseOrder) => {
    switch (po.status) {
      case 'DRAFT':
        return (
          <button
            type="button"
            onClick={() => approveOrder(po.id)}
            className="cursor-pointer text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs px-3 py-1.5 rounded-lg transition-all"
          >
            Authorize Pipeline
          </button>
        );

      case 'APPROVED':
        return (
          <button
            type="button"
            onClick={() => receiveOrder(po.id)}
            className="cursor-pointer text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-3 py-1.5 rounded-lg transition-all"
          >
            Log Dock Receipt
          </button>
        );

      case 'RECEIVED':
        return (
          <span className="text-xs text-slate-400 font-medium italic">
            Settled & Verified
          </span>
        );

      case 'CANCELLED':
        return (
          <span className="text-xs text-rose-500 font-medium italic">
            Cancelled
          </span>
        );

      default:
        return null;
    }
  };

  const getStatusClassName = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-50 border-slate-200 text-slate-500';

      case 'APPROVED':
        return 'bg-blue-50 border-blue-200 text-blue-700';

      case 'RECEIVED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';

      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Procurement Pipelines
        </h2>

        <p className="text-sm text-slate-500 mt-0.5">
          Authorization and validation logs for commercial inventory inflow.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Supplier Profile</th>
                <th className="px-6 py-4">Financial Comm.</th>
                <th className="px-6 py-4">Pipeline Phase</th>
                <th className="px-6 py-4 text-right">Corporate Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr
                  key={po.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs text-blue-600 font-semibold">
                    {po.po_number}
                  </td>

                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {po.supplier_name}
                  </td>

                  <td className="px-6 py-4 text-slate-900 font-semibold">
                    $
                    {po.total_estimated_cost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 font-semibold rounded border ${getStatusClassName(
                        po.status,
                      )}`}
                    >
                      {po.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {getStatusAction(po)}
                  </td>
                </tr>
              ))}

              {purchaseOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
