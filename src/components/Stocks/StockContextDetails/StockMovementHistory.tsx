// src/components/stock/StockMovementHistory.tsx
import React from 'react';
import { History, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import { StockMovementDirection } from '@/enum/stock_movement.enum';
import type { IStockMovement } from '@/interfaces/stock_movements.interface';

interface StockMovementHistoryProps {
  movements?: IStockMovement[];
}

export const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({
  movements = [],
}) => {
  // Format timestamps nicely for everyday reading
  const formatDate = (date: Date | string) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-wide">
            Recent Stock Activity
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {movements.length} recorded{' '}
          {movements.length === 1 ? 'change' : 'changes'}
        </span>
      </div>

      {/* Activity List */}
      <div className="p-6 flex-1 flex flex-col">
        {movements.length === 0 ? (
          <div className="my-auto text-center py-8 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No activity recorded yet
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              When you restock, make sales, or adjust counts, the history will
              show up right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
            {movements.map((movement) => {
              const isInbound =
                movement.direction === StockMovementDirection.IN;
              const isOutbound =
                movement.direction === StockMovementDirection.OUT;

              return (
                <div
                  key={movement.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon based on direction */}
                    <div
                      className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                        isInbound
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : isOutbound
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-blue-50 border-blue-100 text-blue-600'
                      }`}
                    >
                      {isInbound && <ArrowDownLeft className="w-4 h-4" />}
                      {isOutbound && <ArrowUpRight className="w-4 h-4" />}
                      {!isInbound && !isOutbound && (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {isInbound
                            ? 'Stock Added'
                            : isOutbound
                              ? 'Stock Removed'
                              : 'Stock Adjusted'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {formatDate(movement.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        {movement.reason ||
                          (isInbound
                            ? 'New goods received into inventory'
                            : 'Inventory movement recorded')}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Badge & Balance Change */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-black block ${
                        isInbound
                          ? 'text-emerald-600'
                          : isOutbound
                            ? 'text-rose-600'
                            : 'text-blue-600'
                      }`}
                    >
                      {isInbound ? '+' : isOutbound ? '-' : ''}
                      {movement.quantity.toLocaleString()}
                    </span>

                    {/* Quantity transition state with directional indicators */}
                    <span className="text-[11px] text-slate-400 font-medium inline-flex items-center gap-1 justify-end pt-0.5">
                      <span>{movement.quantity_before.toLocaleString()}</span>
                      {isInbound ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-500 shrink-0 rotate-180" />
                      ) : isOutbound ? (
                        <ArrowUpRight className="w-3 h-3 text-rose-500 shrink-0 rotate-90" />
                      ) : (
                        <RefreshCw className="w-3 h-3 text-blue-500 shrink-0" />
                      )}
                      <span>{movement.quantity_after.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
