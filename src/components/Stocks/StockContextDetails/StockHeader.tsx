import React, { useState } from 'react';
import {
  Package,
  ArrowLeft,
  RefreshCw,
  SendHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { IStock } from '@/interfaces/stock.interface';
import { UserRole } from '@/enum/role';
import { copyToClipboard } from '@/common/utils';

interface StockHeaderProps {
  stock: IStock;
  userRole: UserRole;
  onAdjustStock: () => void;
  onTransferStock: () => void;
  onBack: () => void;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  stock,
  userRole,
  onAdjustStock,
  onTransferStock,
  onBack,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = async () => {
    const success = await copyToClipboard(stock.id);
    if (success) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Determine stock health badge style
  const getStockStatus = (qty: number) => {
    if (qty === 0) {
      return {
        label: 'Out of Stock',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }
    if (qty < 10) {
      return {
        label: 'Low Stock',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Optimal Stock',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  };

  const status = getStockStatus(stock.current_quantity);
  const StatusIcon = status.icon;

  const productName = stock.product?.name || 'Unnamed Product';
  const productSku = `SKU-${stock.product_id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Navigation and Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </button>

        {/* Action Toolbar based on role */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAdjustStock}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Adjust Count
          </button>

          {(userRole === UserRole.ADMIN || userRole === UserRole.STOREMAN) && (
            <button
              onClick={onTransferStock}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
            >
              <SendHorizontal className="w-4 h-4" />
              Transfer Stock
            </button>
          )}
        </div>
      </div>

      {/* Product Title & Quantity Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                {productName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
            </div>

            {/* Sub-line with SKU and quick-copy Stock ID */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {productSku}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>
                  Stock ID:{' '}
                  <span className="font-mono text-slate-600">
                    {stock.id.slice(0, 8)}...
                  </span>
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                  title="Copy full stock ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 pt-0.5">
              Managed under{' '}
              <span className="font-medium text-slate-700">
                {stock.store?.name || 'Assigned Store Location'}
              </span>
            </p>
          </div>
        </div>

        {/* Current Quantity Highlight Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-5 py-3 flex items-center gap-4 shrink-0">
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Current Quantity
            </span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {stock.current_quantity.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-500">units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
