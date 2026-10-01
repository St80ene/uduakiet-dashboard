import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Store as StoreIcon,
  Info,
} from 'lucide-react';
import type { IStock } from '@/interfaces/stock.interface';
import { formatExactDateTime } from '@/common/utils';

interface StockMetadataCardProps {
  stock: IStock;
  className?: string;
}

export const StockMetadataCard: React.FC<StockMetadataCardProps> = ({
  stock,
  className = '',
}) => {
  const storeName = stock.store?.name || 'Main Store Branch';
  const businessName =
    stock.business?.legal_name ||
    stock.business?.display_name ||
    'Organization';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    >
      {/* Card Header - Clean & Simple */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-wide">
            Location & Activity Summary
          </h3>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Active Stock Record
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-6">
        {/* Location & Business Overview */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Where This Item Lives
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store Location */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-2xs">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block font-medium">
                  Store Branch
                </span>
                <p className="text-base font-bold text-slate-800">
                  {storeName || 'Main Store Branch'}
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Assigned physical inventory location
                </p>
              </div>
            </div>

            {/* Business Organization */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-100 bg-slate-50/40">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-purple-600 shadow-2xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block font-medium">
                  Business Entity
                </span>
                <p className="text-base font-bold text-slate-800">
                  {businessName}
                </p>
                <p className="text-xs text-slate-500 pt-0.5">
                  Parent business tracking this stock
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Timeline Activity (Plain English) */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            Record Activity
          </h4>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">
                  Record Created
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {formatExactDateTime(stock.created_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">
                  Last Updated / Counted
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {formatExactDateTime(stock.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
