import React, { useState } from 'react';
import { StockMetadataCard } from './StockMetadataCard';
import { StockMovementHistory } from './StockMovementHistory';
import type { IStock } from '@/interfaces/stock.interface';
import { StockContextDetails } from './StockContext';

export const StockDetailTabs: React.FC<{ stock: IStock }> = ({ stock }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>(
    'overview',
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Stock History ({stock.movements?.length || 0})
        </button>
      </div>

      {/* Conditional Rendering */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <StockContextDetails stock={stock} />
          <StockMetadataCard stock={stock} />
        </div>
      ) : (
        <StockMovementHistory movements={stock.movements} />
      )}
    </div>
  );
};
