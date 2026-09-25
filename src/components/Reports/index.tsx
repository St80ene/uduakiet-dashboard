import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Store,
  Download,
  AlertTriangle,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';
import type { IDataTableColumn } from '@/interfaces/data_table';
import type { IPaginationMeta } from '@/interfaces';
import DataTable from '@/common/DataTable';

// --- Types & Models ---
export interface IStorePerformanceMetric {
  id: string;
  store_code: string;
  store_name: string;
  region: 'Northeast' | 'Midwest' | 'West' | 'South';
  total_revenue: number;
  cogs: number;
  gross_profit: number;
  margin_percentage: number;
  inventory_turnover_rate: number; // Annualized
  shrinkage_loss: number; // Loss from damage/theft/spoilage
  active_sku_count: number;
  stockout_rate_pct: number;
}

export interface CategoryRevenueBreakdown {
  category: string;
  revenue: number;
  margin: number;
  contribution_pct: number;
}

// --- Mock Multi-Store Data ---
const mockStoreMetrics: IStorePerformanceMetric[] = [
  {
    id: 'str-001',
    store_code: 'BOS-01',
    store_name: 'Downtown Flagship (Boston)',
    region: 'Northeast',
    total_revenue: 482500.0,
    cogs: 284675.0,
    gross_profit: 197825.0,
    margin_percentage: 41.0,
    inventory_turnover_rate: 8.4,
    shrinkage_loss: 2450.0,
    active_sku_count: 3420,
    stockout_rate_pct: 1.2,
  },
  {
    id: 'str-002',
    store_code: 'NYC-04',
    store_name: 'Midtown Hub (New York)',
    region: 'Northeast',
    total_revenue: 695100.0,
    cogs: 424011.0,
    gross_profit: 271089.0,
    margin_percentage: 39.0,
    inventory_turnover_rate: 11.2,
    shrinkage_loss: 5820.0,
    active_sku_count: 4100,
    stockout_rate_pct: 2.8,
  },
  {
    id: 'str-003',
    store_code: 'CHI-02',
    store_name: 'Lincoln Park Outlet (Chicago)',
    region: 'Midwest',
    total_revenue: 310400.0,
    cogs: 195552.0,
    gross_profit: 114848.0,
    margin_percentage: 37.0,
    inventory_turnover_rate: 6.8,
    shrinkage_loss: 1890.0,
    active_sku_count: 2890,
    stockout_rate_pct: 0.9,
  },
  {
    id: 'str-004',
    store_code: 'LAX-01',
    store_name: 'Santa Monica Express (Los Angeles)',
    region: 'West',
    total_revenue: 524000.0,
    cogs: 303920.0,
    gross_profit: 220080.0,
    margin_percentage: 42.0,
    inventory_turnover_rate: 9.6,
    shrinkage_loss: 3100.0,
    active_sku_count: 3150,
    stockout_rate_pct: 1.8,
  },
];

const mockCategoryBreakdown: CategoryRevenueBreakdown[] = [
  {
    category: 'Beverages & Coffee',
    revenue: 682000.0,
    margin: 52.4,
    contribution_pct: 33.9,
  },
  {
    category: 'POS Hardware & Peripherals',
    revenue: 512000.0,
    margin: 28.5,
    contribution_pct: 25.4,
  },
  {
    category: 'Packaging & Supplies',
    revenue: 428000.0,
    margin: 38.2,
    contribution_pct: 21.2,
  },
  {
    category: 'Cleaning & Sanitation',
    revenue: 390000.0,
    margin: 44.1,
    contribution_pct: 19.5,
  },
];

export const ReportsPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<string>('Q3-2026');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered store dataset
  const filteredStores = mockStoreMetrics.filter((store) =>
    selectedRegion === 'ALL' ? true : store.region === selectedRegion,
  );

  // Consolidated Chain Metrics
  const totalChainRevenue = filteredStores.reduce(
    (acc, s) => acc + s.total_revenue,
    0,
  );
  const totalChainGrossProfit = filteredStores.reduce(
    (acc, s) => acc + s.gross_profit,
    0,
  );
  const avgChainMargin = totalChainRevenue
    ? (totalChainGrossProfit / totalChainRevenue) * 100
    : 0;
  const totalShrinkage = filteredStores.reduce(
    (acc, s) => acc + s.shrinkage_loss,
    0,
  );
  const avgTurnoverRate = (
    filteredStores.reduce((acc, s) => acc + s.inventory_turnover_rate, 0) /
    (filteredStores.length || 1)
  ).toFixed(1);

  const paginationMeta: IPaginationMeta = {
    currentPage,
    itemCount: filteredStores.length,
    itemsPerPage: pageSize,
    totalItems: filteredStores.length,
    totalPages: Math.ceil(filteredStores.length / pageSize) || 1,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage * pageSize < filteredStores.length,
  };

  const columns: IDataTableColumn<IStorePerformanceMetric>[] = [
    {
      key: 'store_name',
      header: 'Store / Location',
      render: (store) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <Building2 size={13} className="text-slate-400" />
            {store.store_name}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            CODE: {store.store_code} • {store.region} Region
          </div>
        </div>
      ),
    },
    {
      key: 'total_revenue',
      header: 'Revenue',
      render: (store) => (
        <span className="font-bold text-slate-900">
          $
          {store.total_revenue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: 'gross_profit',
      header: 'Gross Profit (GM%)',
      render: (store) => (
        <div>
          <div className="font-medium text-slate-800">
            $
            {store.gross_profit.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600">
            {store.margin_percentage.toFixed(1)}% margin
          </div>
        </div>
      ),
    },
    {
      key: 'inventory_turnover_rate',
      header: 'Turnover Rate',
      render: (store) => (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
          <RotateCcw size={11} className="text-slate-500" />
          {store.inventory_turnover_rate}x / yr
        </span>
      ),
    },
    {
      key: 'shrinkage_loss',
      header: 'Shrinkage & Spoilage',
      render: (store) => (
        <span className="font-semibold text-rose-600">
          -$
          {store.shrinkage_loss.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: 'stockout_rate_pct',
      header: 'Stockout Rate',
      render: (store) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
            store.stockout_rate_pct > 2.0
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {store.stockout_rate_pct}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Header & Global Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-sky-600" size={24} />
            Chain Operations & Executive Financials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated multi-store revenue performance, gross margin
            breakdowns, and inventory turnover efficiency.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-medium"
            >
              <option value="Q3-2026">Q3 2026 (Current)</option>
              <option value="Q2-2026">Q2 2026</option>
              <option value="YTD-2026">Year to Date (2026)</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent outline-none cursor-pointer font-medium"
            >
              <option value="ALL">All Regions</option>
              <option value="Northeast">Northeast Region</option>
              <option value="Midwest">Midwest Region</option>
              <option value="West">West Region</option>
            </select>
          </div>

          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer transition-colors">
            <Download size={14} />
            Export Executive PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Chain Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Gross Chain Revenue
            </span>
            <DollarSign size={16} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            $
            {totalChainRevenue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
            <ArrowUpRight size={13} />
            <span>+14.2% vs previous quarter</span>
          </div>
        </div>

        {/* Gross Margin % */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Gross Profit Margin
            </span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {avgChainMargin.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-2">
            <span>
              Profit: $
              {totalChainGrossProfit.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        {/* Inventory Turnover Rate */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Avg Inventory Turnover
            </span>
            <RotateCcw size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {avgTurnoverRate}x
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-2">
            <ArrowUpRight size={13} />
            <span>Optimal velocity target (&gt;8.0x)</span>
          </div>
        </div>

        {/* Shrinkage & Loss */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Total Shrinkage / Loss
            </span>
            <AlertTriangle size={16} className="text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">
            $
            {totalShrinkage.toLocaleString('en-US', {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-2">
            <ArrowDownRight size={13} />
            <span>0.65% of total gross revenue</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Multi-Store Comparison Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Store size={16} className="text-sky-600" />
            Store Location Performance Matrix
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredStores.length} active locations
          </span>
        </div>

        <DataTable<IStorePerformanceMetric>
          records={filteredStores}
          columns={columns}
          meta={paginationMeta}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          getRowKey={(record: IStorePerformanceMetric) => record.id}
        />
      </div>

      {/* Bottom Section: Category Breakdown Analysis */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers size={16} className="text-sky-600" />
            Product Category Revenue & Margin Share
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Quarterly Aggregation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCategoryBreakdown.map((item) => (
            <div
              key={item.category}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate">
                  {item.category}
                </span>
                <span className="font-bold text-sky-600">
                  {item.contribution_pct}%
                </span>
              </div>

              {/* Visual Share Bar */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${item.contribution_pct * 2.5}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Rev: ${item.revenue.toLocaleString()}</span>
                <span className="text-emerald-600 font-medium">
                  {item.margin}% GM
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
