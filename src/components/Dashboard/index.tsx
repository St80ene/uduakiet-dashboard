import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingDown,
  AlertTriangle,
  Clock,
  Truck,
  ClipboardCheck,
  Warehouse,
  Boxes,
  ArrowUpRight,
  CalendarDays,
  CircleAlert,
  Wallet,
  PackageCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '@/services/dashboard.service';
import MetricCard from './MetricCard';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import { formatMinorCurrency, formatNumber } from '@/common/utils';
import type {
  DashboardCardData,
  DashboardMetrics,
} from '@/interfaces/dashboard.interface';
import SectionHeading from './SectionHeading';

// Inventory value and estimated procurement cost are assumed
// to be returned in minor currency units (e.g. kobo for NGN).

const getCard = (
  cards: DashboardCardData[] | undefined,
  id: string,
): DashboardCardData | undefined => {
  return cards?.find((card) => card.id === id);
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

// ============================================================
// MAIN DASHBOARD
// ============================================================

export const Dashboard: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery<DashboardMetrics>({
    queryKey: ['dashboard_metrics'],
    queryFn: getDashboardMetrics,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : 'Something went wrong while retrieving dashboard metrics.'
        }
      />
    );
  }

  if (!data) {
    return <EmptyState message="No dashboard data is currently available." />;
  }

  // ----------------------------------------------------------
  // INVENTORY METRICS
  // ----------------------------------------------------------

  const inventoryCards = data.inventory?.cards ?? [];

  const products = getCard(inventoryCards, 'products');
  const totalStock = getCard(inventoryCards, 'stock');
  const lowStock = getCard(inventoryCards, 'low-stock');
  const outOfStock = getCard(inventoryCards, 'out-of-stock');

  // ----------------------------------------------------------
  // PROCUREMENT METRICS
  // ----------------------------------------------------------

  const procurementCards = data.procurement?.cards ?? [];

  const pendingApproval = getCard(procurementCards, 'pending_approval');

  const approvedOrders = getCard(procurementCards, 'approved');

  const sentToSupplier = getCard(procurementCards, 'sent');

  const receivedOrders = getCard(procurementCards, 'received');

  const estimatedCost = getCard(procurementCards, 'estimated_cost');

  // ----------------------------------------------------------
  // WAREHOUSE METRICS
  // ----------------------------------------------------------

  const warehouseCards = data.warehouse?.cards ?? [];

  const warehouseTotalStock = getCard(warehouseCards, 'total-stock');

  const warehouseLowStock = getCard(warehouseCards, 'low-stock');

  const warehouseOutOfStock = getCard(warehouseCards, 'out-of-stock');

  const inventoryValue = getCard(warehouseCards, 'inventory-value');

  const stockByUnit = data.warehouse?.stock_by_unit ?? [];

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="space-y-8 p-4 md:p-6 animate-[fadeIn_0.2s_ease-out]">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-sky-600" size={24} />
            Executive Operations Overview
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Monitor inventory health, procurement activities and warehouse
            operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2 w-fit">
          <CalendarDays size={15} className="text-sky-600" />

          <span>
            {new Intl.DateTimeFormat('en-NG', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }).format(new Date())}
          </span>
        </div>
      </div>

      {/* =====================================================
          INVENTORY HEALTH
      ===================================================== */}

      <section className="space-y-4">
        <SectionHeading
          title={data.inventory?.title ?? 'Inventory Health'}
          description="Understand current stock availability and identify products requiring replenishment."
          icon={<Package size={17} className="text-sky-600" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title={products?.title ?? 'Products'}
            value={formatNumber(products?.value)}
            description="Products available for inventory operations"
            icon={<Package size={19} />}
          />

          <MetricCard
            title={totalStock?.title ?? 'Total Stock'}
            value={formatNumber(totalStock?.value)}
            description="Current aggregate stock quantity"
            icon={<Boxes size={19} />}
            iconClassName="text-emerald-600 bg-emerald-50"
            valueClassName="text-emerald-700"
          />

          <MetricCard
            title={lowStock?.title ?? 'Low Stock'}
            value={formatNumber(lowStock?.value)}
            description={lowStock?.subtitle ?? 'Products below reorder level'}
            icon={<TrendingDown size={19} />}
            iconClassName="text-amber-600 bg-amber-50"
            valueClassName="text-amber-600"
          />

          <MetricCard
            title={outOfStock?.title ?? 'Out of Stock'}
            value={formatNumber(outOfStock?.value)}
            description="Products with no available stock"
            icon={<AlertTriangle size={19} />}
            iconClassName="text-rose-600 bg-rose-50"
            valueClassName="text-rose-600"
          />
        </div>

        {lowStock?.action && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CircleAlert size={18} className="text-amber-700 mt-0.5" />

              <div>
                <h3 className="text-sm font-bold text-amber-800">
                  Inventory replenishment required
                </h3>

                <p className="text-xs text-amber-700 mt-1">
                  {formatNumber(lowStock.value)} products are below their
                  reorder level.
                </p>
              </div>
            </div>

            <a
              href={lowStock.action.url}
              className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-amber-800 bg-white border border-amber-200 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors"
            >
              {lowStock.action.label}
              <ArrowUpRight size={14} />
            </a>
          </div>
        )}
      </section>

      {/* =====================================================
          PROCUREMENT PIPELINE
      ===================================================== */}

      <section className="space-y-4">
        <SectionHeading
          title={data.procurement?.title ?? 'Procurement Pipeline'}
          description="Monitor purchase order approvals, supplier deliveries and procurement commitments."
          icon={<ShoppingCart size={17} className="text-sky-600" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <MetricCard
            title={pendingApproval?.title ?? 'Pending Approval'}
            value={formatNumber(pendingApproval?.value)}
            description="Orders awaiting managerial approval"
            icon={<Clock size={19} />}
            iconClassName="text-amber-600 bg-amber-50"
            valueClassName="text-amber-600"
          />

          <MetricCard
            title={approvedOrders?.title ?? 'Approved Orders'}
            value={formatNumber(approvedOrders?.value)}
            description="Orders approved for procurement"
            icon={<ClipboardCheck size={19} />}
            iconClassName="text-emerald-600 bg-emerald-50"
            valueClassName="text-emerald-700"
          />

          <MetricCard
            title={sentToSupplier?.title ?? 'Sent to Supplier'}
            value={formatNumber(sentToSupplier?.value)}
            description="Orders dispatched to suppliers"
            icon={<Truck size={19} />}
            iconClassName="text-sky-600 bg-sky-50"
          />

          <MetricCard
            title={receivedOrders?.title ?? 'Received'}
            value={formatNumber(receivedOrders?.value)}
            description="Purchase orders received"
            icon={<PackageCheck size={19} />}
            iconClassName="text-emerald-600 bg-emerald-50"
            valueClassName="text-emerald-700"
          />

          <MetricCard
            title={estimatedCost?.title ?? 'Estimated Procurement Cost'}
            value={formatMinorCurrency(estimatedCost?.value)}
            description="Estimated value of procurement"
            icon={<Wallet size={19} />}
            iconClassName="text-violet-600 bg-violet-50"
            valueClassName="text-violet-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock size={17} />

              <h3 className="text-sm font-bold">Approval Required</h3>
            </div>

            <p className="text-2xl font-bold text-amber-800 mt-3">
              {formatNumber(pendingApproval?.value)}
            </p>

            <p className="text-xs text-amber-700 mt-1">
              Purchase orders waiting for managerial review and approval.
            </p>
          </div>

          <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-sky-800">
              <Truck size={17} />

              <h3 className="text-sm font-bold">Supplier Deliveries</h3>
            </div>

            <p className="text-2xl font-bold text-sky-800 mt-3">
              {formatNumber(sentToSupplier?.value)}
            </p>

            <p className="text-xs text-sky-700 mt-1">
              Purchase orders currently sent to suppliers.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WAREHOUSE OPERATIONS
      ===================================================== */}

      <section className="space-y-4">
        <SectionHeading
          title={data.warehouse?.title ?? 'Warehouse Operations'}
          description="Monitor current stock levels, inventory valuation and physical quantities across units of measurement."
          icon={<Warehouse size={17} className="text-sky-600" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title={warehouseTotalStock?.title ?? 'Total Stock'}
            value={formatNumber(warehouseTotalStock?.value)}
            description="Current aggregate stock quantity"
            icon={<Boxes size={19} />}
            iconClassName="text-emerald-600 bg-emerald-50"
            valueClassName="text-emerald-700"
          />

          <MetricCard
            title={warehouseLowStock?.title ?? 'Low Stock'}
            value={formatNumber(warehouseLowStock?.value)}
            description="Stock balances below reorder level"
            icon={<TrendingDown size={19} />}
            iconClassName="text-amber-600 bg-amber-50"
            valueClassName="text-amber-600"
          />

          <MetricCard
            title={warehouseOutOfStock?.title ?? 'Out of Stock'}
            value={formatNumber(warehouseOutOfStock?.value)}
            description="Stock balances with zero quantity"
            icon={<AlertTriangle size={19} />}
            iconClassName="text-rose-600 bg-rose-50"
            valueClassName="text-rose-600"
          />

          <MetricCard
            title={inventoryValue?.title ?? 'Inventory Value'}
            value={formatMinorCurrency(inventoryValue?.value)}
            description="Current value of available inventory"
            icon={<Wallet size={19} />}
            iconClassName="text-violet-600 bg-violet-50"
            valueClassName="text-violet-700"
          />
        </div>

        {/* STOCK BY UNIT */}

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Boxes size={16} className="text-sky-600" />
                Physical Stock Overview
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Aggregate physical stock grouped by unit of measurement.
              </p>
            </div>
          </div>

          {stockByUnit.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stockByUnit.map((item) => (
                <div
                  key={item.unit}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.unit}
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {formatNumber(item.quantity)}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Total physical quantity
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No stock quantities are available by unit." />
          )}
        </div>
      </section>

      {/* FOOTER */}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <p className="text-[10px] text-slate-400">
          Udua Kiet · Executive Operations Dashboard
        </p>

        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live dashboard data
        </span>
      </div>
    </div>
  );
};

export default Dashboard;
