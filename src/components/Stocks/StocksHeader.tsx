import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';

interface StocksHeaderProps {
  totalStocks: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedSort: string;
  onSortChange: (value: string) => void;
  sortOrder: 'ASC' | 'DESC';
  onToggleSortOrder: () => void;
  onOpenCreateModal: () => void;
}

export const StocksHeader = ({
  totalStocks,
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  sortOrder,
  onToggleSortOrder,
  onOpenCreateModal,
}: StocksHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stocks Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor current stock balances across your stores.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Initialize Stock
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Stock Records
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalStocks}</p>
        </div>
      </div>

      {/* Search & Filter Bar Toolbar */}
      <div className="p-4 border border-slate-200/60 bg-white rounded-xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <label htmlFor="stock-search" className="sr-only">
            Search inventory
          </label>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="stock-search"
            type="search"
            placeholder="Search product or SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full pl-9 pr-3 py-1.5 text-xs font-normal
              text-slate-800 placeholder:text-slate-400
              bg-slate-50/50 border border-slate-200
              rounded-lg outline-none focus:bg-white
              focus:ring-2 focus:ring-slate-300
              focus:border-slate-300 transition-all
            "
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-lg p-1">
            <span className="text-xs text-slate-500 pl-2 font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Sort by:
            </span>
            <select
              aria-label="Select sort field"
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-medium outline-none cursor-pointer pr-1"
            >
              <option value="updated_at">Last Updated</option>
              <option value="created_at">Date Created</option>
              <option value="quantity">Quantity</option>
              <option value="reorder_level">Reorder Level</option>
            </select>
            <button
              type="button"
              onClick={onToggleSortOrder}
              aria-label={`Sort direction ${sortOrder}`}
              className="p-1 hover:bg-slate-200/60 rounded text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
