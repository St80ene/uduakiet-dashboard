import React from 'react';
import { DollarSign, Tag, AlertCircle, TrendingUp } from 'lucide-react';
import type { IStock } from '@/interfaces/stock.interface';

interface StockContextDetailsProps {
  stock: IStock;
}

export const StockContextDetails: React.FC<StockContextDetailsProps> = ({
  stock,
}) => {
  // Safe calculations for display
  const unitPrice = stock.product?.selling_price || 0;
  const totalValue = stock.current_quantity * unitPrice;
  const lowStockThreshold = stock.product?.default_reorder_point || 10;
  const isLowStock = stock.current_quantity <= lowStockThreshold;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-600" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-wide">
            Stock Value & Pricing
          </h3>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          Active Pricing
        </span>
      </div>

      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Total Stock Worth Card */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                Total Stock Worth
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              ₦ {totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600">
              Based on {stock.current_quantity.toLocaleString()} units available
              at ₦ {unitPrice.toLocaleString()} per unit
            </p>
          </div>

          {/* Pricing & Reorder Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <span className="text-xs text-slate-500 block font-medium">
                Price Per Unit
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                ₦ {unitPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60">
              <span className="text-xs text-slate-500 block font-medium">
                Reorder Alert Level
              </span>
              <span className="text-base font-bold text-slate-900 mt-1 block">
                {lowStockThreshold} units
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Note */}
        <div
          className={`border rounded-xl p-3.5 text-xs leading-relaxed flex items-start gap-2.5 ${
            isLowStock
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : 'bg-blue-50/60 border-blue-100 text-blue-900'
          }`}
        >
          {isLowStock ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <DollarSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-semibold block mb-0.5">
              {isLowStock ? 'Restock Warning' : 'Healthy Inventory Status'}
            </span>
            {isLowStock
              ? 'This item has dropped below your preferred reorder level. Consider restocking soon to avoid running out.'
              : 'Your stock levels are healthy and well-positioned to meet current customer demand.'}
          </div>
        </div>
      </div>
    </div>
  );
};
