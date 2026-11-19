import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Activity,
  Calendar,
  TrendingUp,
} from 'lucide-react';

import type { IDataTableColumn } from '@/interfaces/data_table';
import type { IPaginationMeta } from '@/interfaces';
import DataTable from '@/common/DataTable';

import { getDashboardMetrics } from '@/services/dashboard.service';
import {
  getInventoryOverview,
  getStockAttentionReport,
  getStockMovementReport,
  getPurchaseOrderOverview,
  getInventoryTrends,
  getProcurementTrends,
} from '@/services/report.service';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface IApiMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface IDashboardCard {
  id: string;
  title: string;
  value: number | string | null;
  severity?: 'success' | 'warning' | 'danger';
  subtitle?: string;
  action?: {
    label: string;
    url: string;
  };
}

interface IDashboardSection {
  title: string;
  cards: IDashboardCard[];
}

interface IDashboardMetrics {
  inventory: IDashboardSection;
  procurement: IDashboardSection;
  warehouse: IDashboardSection & {
    stock_by_unit?: {
      unit: string;
      quantity: number;
    }[];
  };
}

interface IInventoryProduct {
  product_id: string;
  product_name: string;
  sku: string;
  category_id: string | null;
  current_quantity: number;
  reorder_point: number;
  stock_status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK' | string;
}

interface IStockAttentionProduct {
  product_id: string;
  product_name: string;
  sku: string;
  current_quantity: number;
  reorder_point: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK' | string;
}

interface IStockAttentionSummary {
  total: number;
  low_stock: number;
  out_of_stock: number;
}

interface IStockMovement {
  movement_id: string;
  type: string;
  direction: 'INFLOW' | 'OUTFLOW' | string;
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  reason: string | null;
  created_at: string;
  product_id: string;
  product_name: string;
  sku: string;
  store_id: string | null;
  store_name: string | null;
}

interface IStockMovementSummary {
  total_movements: number;
  total_in: number;
  total_out: number;
}

interface IPurchaseOrder {
  purchase_order_id: string;
  po_number: string;
  status: string;
  total_estimated_cost: string | number;
  created_at: string;
  supplier_id: string | null;
  supplier_name: string | null;
  store_id: string | null;
  store_name: string | null;
  items_count: number;
}

interface IPurchaseOrderSummary {
  total_orders: number;
  pending_approval: number;
  outstanding_orders: number;
  status_distribution: Record<string, number>;
}

interface IInventoryTrend {
  period: string;
  stock_in: number;
  stock_out: number;
  movement_count: number;
}

interface IProcurementTrend {
  period: string;
  order_count: number;
  estimated_procurement_value: string | number;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const PAGE_SIZE = 20;

const formatNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—';

  const number = Number(value);

  if (!Number.isFinite(number)) return '—';

  return number.toLocaleString('en-NG');
};

const formatDate = (value: string) => {
  if (!value) return '—';

  const date = new Date(value.replace(' ', 'T'));

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—';

  const amount = Number(value);

  if (!Number.isFinite(amount)) return '—';

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(amount);
};

const getTableMeta = (meta?: IApiMeta): IPaginationMeta => ({
  currentPage: meta?.currentPage ?? 1,
  itemsPerPage: PAGE_SIZE,
  totalItems: meta?.totalItems ?? 0,
  totalPages: meta?.totalPages ?? 1,
  hasPreviousPage: meta?.hasPreviousPage ?? false,
  hasNextPage: meta?.hasNextPage ?? false,
});

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'HEALTHY':
    case 'APPROVED':
    case 'RECEIVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'LOW_STOCK':
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'PARTIALLY_RECEIVED':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    case 'OUT_OF_STOCK':
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';

    case 'SENT_TO_SUPPLIER':
      return 'bg-sky-50 text-sky-700 border-sky-200';

    case 'DRAFT':
      return 'bg-slate-100 text-slate-700 border-slate-200';

    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold ${getStatusStyles(
      status,
    )}`}
  >
    {status.replace(/_/g, ' ')}
  </span>
);

const LoadingMessage = () => (
  <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
    <RefreshCw size={15} className="animate-spin" />
    Loading report...
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
    {message}
  </div>
);

const EmptyMessage = ({ message }: { message: string }) => (
  <div className="py-8 text-center text-sm text-slate-400">{message}</div>
);

// -----------------------------------------------------------------------------
// Reusable UI
// -----------------------------------------------------------------------------

const SectionHeading = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
}) => (
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
      <Icon size={18} />
    </div>

    <div>
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  </div>
);

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  severity = 'default',
}: {
  title: string;
  value: number | string | null;
  subtitle?: string;
  icon: React.ElementType;
  severity?: 'success' | 'warning' | 'danger' | 'default';
}) => {
  const iconStyles = {
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    default: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <div className={`rounded-lg p-2 ${iconStyles[severity]}`}>
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value === null ? '—' : formatNumber(value)}
      </p>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  severity = 'default',
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  severity?: 'success' | 'warning' | 'danger' | 'default';
}) => (
  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
    <div>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">
        {formatNumber(value)}
      </p>
    </div>

    <div
      className={`rounded-lg p-2 ${
        severity === 'danger'
          ? 'bg-rose-50 text-rose-600'
          : severity === 'warning'
            ? 'bg-amber-50 text-amber-600'
            : severity === 'success'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-sky-50 text-sky-600'
      }`}
    >
      <Icon size={18} />
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Reports Page
// -----------------------------------------------------------------------------

export const ReportsPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<IDashboardMetrics | null>(null);

  const [inventory, setInventory] = useState<IInventoryProduct[]>([]);
  const [inventoryMeta, setInventoryMeta] = useState<IApiMeta>();

  const [stockAttention, setStockAttention] = useState<
    IStockAttentionProduct[]
  >([]);
  const [stockAttentionSummary, setStockAttentionSummary] =
    useState<IStockAttentionSummary | null>(null);
  const [stockAttentionMeta, setStockAttentionMeta] = useState<IApiMeta>();

  const [movements, setMovements] = useState<IStockMovement[]>([]);
  const [movementSummary, setMovementSummary] =
    useState<IStockMovementSummary | null>(null);
  const [movementMeta, setMovementMeta] = useState<IApiMeta>();

  const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrder[]>([]);
  const [purchaseOrderSummary, setPurchaseOrderSummary] =
    useState<IPurchaseOrderSummary | null>(null);
  const [purchaseOrderMeta, setPurchaseOrderMeta] = useState<IApiMeta>();

  const [inventoryTrends, setInventoryTrends] = useState<IInventoryTrend[]>([]);
  const [procurementTrends, setProcurementTrends] = useState<
    IProcurementTrend[]
  >([]);

  const [inventoryPage, setInventoryPage] = useState(1);
  const [attentionPage, setAttentionPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [purchaseOrderPage, setPurchaseOrderPage] = useState(1);

  const [interval, setInterval] = useState<'day' | 'week' | 'month'>('month');

  const [loading, setLoading] = useState({
    dashboard: true,
    inventory: true,
    attention: true,
    movements: true,
    purchaseOrders: true,
    inventoryTrends: true,
    procurementTrends: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const setLoadingState = (key: string, value: boolean) => {
    setLoading((previous) => ({ ...previous, [key]: value }));
  };

  const setError = (key: string, error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unable to load this report.';

    setErrors((previous) => ({ ...previous, [key]: message }));
  };

  // Dashboard metrics
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadingState('dashboard', true);

      try {
        const response = await getDashboardMetrics();
        setDashboard(response);
      } catch (error) {
        setError('dashboard', error);
      } finally {
        setLoadingState('dashboard', false);
      }
    };

    fetchDashboard();
  }, []);

  // Inventory overview
  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingState('inventory', true);

      try {
        const response = await getInventoryOverview({
          page: inventoryPage,
          limit: PAGE_SIZE,
        });

        setInventory(response.products ?? []);
        setInventoryMeta(response.meta);
      } catch (error) {
        setError('inventory', error);
      } finally {
        setLoadingState('inventory', false);
      }
    };

    fetchInventory();
  }, [inventoryPage]);

  // Stock attention
  useEffect(() => {
    const fetchStockAttention = async () => {
      setLoadingState('attention', true);

      try {
        const response = await getStockAttentionReport({
          page: attentionPage,
          limit: PAGE_SIZE,
        });

        setStockAttention(response.products ?? []);
        setStockAttentionSummary(response.summary ?? null);
        setStockAttentionMeta(response.meta);
      } catch (error) {
        setError('attention', error);
      } finally {
        setLoadingState('attention', false);
      }
    };

    fetchStockAttention();
  }, [attentionPage]);

  // Stock movements
  useEffect(() => {
    const fetchMovements = async () => {
      setLoadingState('movements', true);

      try {
        const response = await getStockMovementReport({
          page: movementPage,
          limit: PAGE_SIZE,
        });

        setMovements(response.movements ?? []);
        setMovementSummary(response.summary ?? null);
        setMovementMeta(response.meta);
      } catch (error) {
        setError('movements', error);
      } finally {
        setLoadingState('movements', false);
      }
    };

    fetchMovements();
  }, [movementPage]);

  // Purchase order overview
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      setLoadingState('purchaseOrders', true);

      try {
        const response = await getPurchaseOrderOverview({
          page: purchaseOrderPage,
          limit: PAGE_SIZE,
        });

        setPurchaseOrders(response.orders ?? []);
        setPurchaseOrderSummary(response.summary ?? null);
        setPurchaseOrderMeta(response.meta);
      } catch (error) {
        setError('purchaseOrders', error);
      } finally {
        setLoadingState('purchaseOrders', false);
      }
    };

    fetchPurchaseOrders();
  }, [purchaseOrderPage]);

  // Inventory trends
  useEffect(() => {
    const fetchInventoryTrends = async () => {
      setLoadingState('inventoryTrends', true);

      try {
        const response = await getInventoryTrends({ interval });
        setInventoryTrends(response.trends ?? []);
      } catch (error) {
        setError('inventoryTrends', error);
      } finally {
        setLoadingState('inventoryTrends', false);
      }
    };

    fetchInventoryTrends();
  }, [interval]);

  // Procurement trends
  useEffect(() => {
    const fetchProcurementTrends = async () => {
      setLoadingState('procurementTrends', true);

      try {
        const response = await getProcurementTrends({ interval });
        setProcurementTrends(response.trends ?? []);
      } catch (error) {
        setError('procurementTrends', error);
      } finally {
        setLoadingState('procurementTrends', false);
      }
    };

    fetchProcurementTrends();
  }, [interval]);

  // ---------------------------------------------------------------------------
  // Table columns
  // ---------------------------------------------------------------------------

  const inventoryColumns: IDataTableColumn<IInventoryProduct>[] = [
    {
      key: 'product_name',
      header: 'Product',
      render: (product) => (
        <div>
          <p className="font-semibold text-slate-800">{product.product_name}</p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {product.sku}
          </p>
        </div>
      ),
    },
    {
      key: 'current_quantity',
      header: 'Current Stock',
      render: (product) => (
        <span className="font-semibold text-slate-800">
          {formatNumber(product.current_quantity)}
        </span>
      ),
    },
    {
      key: 'reorder_point',
      header: 'Reorder Point',
      render: (product) => formatNumber(product.reorder_point),
    },
    {
      key: 'stock_status',
      header: 'Stock Status',
      render: (product) => <StatusBadge status={product.stock_status} />,
    },
  ];

  const attentionColumns: IDataTableColumn<IStockAttentionProduct>[] = [
    {
      key: 'product_name',
      header: 'Product',
      render: (product) => (
        <div>
          <p className="font-semibold text-slate-800">{product.product_name}</p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {product.sku}
          </p>
        </div>
      ),
    },
    {
      key: 'current_quantity',
      header: 'Current Stock',
      render: (product) => (
        <span className="font-semibold text-slate-800">
          {formatNumber(product.current_quantity)}
        </span>
      ),
    },
    {
      key: 'reorder_point',
      header: 'Reorder Point',
      render: (product) => formatNumber(product.reorder_point),
    },
    {
      key: 'status',
      header: 'Attention Status',
      render: (product) => <StatusBadge status={product.status} />,
    },
  ];

  const movementColumns: IDataTableColumn<IStockMovement>[] = [
    {
      key: 'product_name',
      header: 'Product',
      render: (movement) => (
        <div>
          <p className="font-semibold text-slate-800">
            {movement.product_name}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {movement.sku}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Movement Type',
      render: (movement) => (
        <span className="text-xs font-medium text-slate-700">
          {movement.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (movement) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            movement.direction === 'INFLOW'
              ? 'text-emerald-600'
              : 'text-rose-600'
          }`}
        >
          {movement.direction === 'INFLOW' ? (
            <ArrowDownToLine size={13} />
          ) : (
            <ArrowUpFromLine size={13} />
          )}
          {movement.direction}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (movement) => (
        <span className="font-semibold text-slate-800">
          {formatNumber(movement.quantity)}
        </span>
      ),
    },
    {
      key: 'quantity_after',
      header: 'Balance After',
      render: (movement) => formatNumber(movement.quantity_after),
    },
    {
      key: 'store_name',
      header: 'Store',
      render: (movement) => (
        <span className="text-xs text-slate-600">
          {movement.store_name ?? '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (movement) => (
        <span className="whitespace-nowrap text-xs text-slate-500">
          {formatDate(movement.created_at)}
        </span>
      ),
    },
  ];

  const purchaseOrderColumns: IDataTableColumn<IPurchaseOrder>[] = [
    {
      key: 'po_number',
      header: 'Purchase Order',
      render: (order) => (
        <span className="font-semibold text-slate-800">{order.po_number}</span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      render: (order) => (
        <span className="text-xs text-slate-700">
          {order.supplier_name ?? '—'}
        </span>
      ),
    },
    {
      key: 'store_name',
      header: 'Store',
      render: (order) => (
        <span className="text-xs text-slate-700">
          {order.store_name ?? '—'}
        </span>
      ),
    },
    {
      key: 'items_count',
      header: 'Items',
      render: (order) => formatNumber(order.items_count),
    },
    {
      key: 'total_estimated_cost',
      header: 'Estimated Cost',
      render: (order) => (
        <span className="whitespace-nowrap font-semibold text-slate-800">
          {formatCurrency(order.total_estimated_cost)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (order) => (
        <span className="whitespace-nowrap text-xs text-slate-500">
          {formatDate(order.created_at)}
        </span>
      ),
    },
  ];

  // ---------------------------------------------------------------------------
  // Trend helpers
  // ---------------------------------------------------------------------------

  const maxMovementValue = Math.max(
    1,
    ...inventoryTrends.flatMap((item) => [
      Number(item.stock_in),
      Number(item.stock_out),
    ]),
  );

  const maxOrderCount = Math.max(
    1,
    ...procurementTrends.map((item) => Number(item.order_count)),
  );

  const procurementStatusDistribution =
    purchaseOrderSummary?.status_distribution ?? {};

  const procurementStatuses = Object.entries(
    procurementStatusDistribution,
  ).sort((a, b) => b[1] - a[1]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="animate-[fadeIn_0.2s_ease-out] space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <BarChart3 className="text-sky-600" size={23} />
            Inventory & Procurement Reports
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Monitor inventory health, stock movements and purchase order
            activity across your business.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
          <Calendar size={14} className="text-slate-400" />

          <select
            value={interval}
            onChange={(event) =>
              setInterval(event.target.value as 'day' | 'week' | 'month')
            }
            className="cursor-pointer bg-transparent outline-none"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>

      {/* Dashboard Snapshot */}
      <section className="space-y-4">
        <SectionHeading
          title="Business Snapshot"
          description="A quick overview of your current inventory and procurement position."
          icon={Activity}
        />

        {loading.dashboard ? (
          <LoadingMessage />
        ) : errors.dashboard ? (
          <ErrorMessage message={errors.dashboard} />
        ) : dashboard ? (
          <>
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Inventory Health
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {dashboard.inventory.cards.map((card) => (
                  <MetricCard
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    severity={card.severity}
                    icon={
                      card.id === 'products'
                        ? Package
                        : card.id === 'stock'
                          ? Boxes
                          : card.id === 'low-stock'
                            ? AlertTriangle
                            : XCircle
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Procurement Pipeline
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {dashboard.procurement.cards.map((card) => (
                  <MetricCard
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    severity={card.severity}
                    icon={
                      card.id === 'pending_approval'
                        ? Clock
                        : card.id === 'approved'
                          ? CheckCircle2
                          : card.id === 'sent'
                            ? Truck
                            : card.id === 'received'
                              ? Package
                              : ClipboardList
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Warehouse Operations
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {dashboard.warehouse.cards.map((card) => (
                  <MetricCard
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    subtitle={card.subtitle}
                    severity={card.severity}
                    icon={
                      card.id === 'total-stock'
                        ? Boxes
                        : card.id === 'low-stock'
                          ? AlertTriangle
                          : card.id === 'out-of-stock'
                            ? XCircle
                            : Package
                    }
                  />
                ))}
              </div>

              {dashboard.warehouse.stock_by_unit &&
                dashboard.warehouse.stock_by_unit.length > 0 && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold text-slate-600">
                      Stock quantity by unit
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {dashboard.warehouse.stock_by_unit.map((item) => (
                        <div
                          key={item.unit}
                          className="rounded-lg bg-slate-50 px-4 py-3"
                        >
                          <p className="text-lg font-bold text-slate-900">
                            {formatNumber(item.quantity)}
                          </p>
                          <p className="text-xs text-slate-500">{item.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </>
        ) : (
          <EmptyMessage message="No dashboard data available." />
        )}
      </section>

      {/* Inventory Overview */}
      <section className="space-y-4">
        <SectionHeading
          title="Inventory Overview"
          description="Review product quantities against their reorder points."
          icon={Package}
        />

        {loading.inventory ? (
          <LoadingMessage />
        ) : errors.inventory ? (
          <ErrorMessage message={errors.inventory} />
        ) : inventory.length > 0 ? (
          <DataTable<IInventoryProduct>
            records={inventory}
            columns={inventoryColumns}
            meta={getTableMeta(inventoryMeta)}
            onPageChange={setInventoryPage}
            getRowKey={(record) => record.product_id}
          />
        ) : (
          <EmptyMessage message="No inventory records found." />
        )}
      </section>

      {/* Stock Attention */}
      <section className="space-y-4">
        <SectionHeading
          title="Stock Requiring Attention"
          description="Products that have reached or fallen below their reorder levels."
          icon={AlertTriangle}
        />

        {stockAttentionSummary && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard
              title="Products Requiring Attention"
              value={stockAttentionSummary.total}
              icon={Package}
            />

            <SummaryCard
              title="Low Stock"
              value={stockAttentionSummary.low_stock}
              icon={AlertTriangle}
              severity="warning"
            />

            <SummaryCard
              title="Out of Stock"
              value={stockAttentionSummary.out_of_stock}
              icon={XCircle}
              severity="danger"
            />
          </div>
        )}

        {loading.attention ? (
          <LoadingMessage />
        ) : errors.attention ? (
          <ErrorMessage message={errors.attention} />
        ) : stockAttention.length > 0 ? (
          <DataTable<IStockAttentionProduct>
            records={stockAttention}
            columns={attentionColumns}
            meta={getTableMeta(stockAttentionMeta)}
            onPageChange={setAttentionPage}
            getRowKey={(record) => record.product_id}
          />
        ) : (
          <EmptyMessage message="No stock attention records found." />
        )}
      </section>

      {/* Stock Movements */}
      <section className="space-y-4">
        <SectionHeading
          title="Stock Movement History"
          description="Track stock inflows, outflows and the resulting stock balances."
          icon={RefreshCw}
        />

        {movementSummary && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard
              title="Total Movements"
              value={movementSummary.total_movements}
              icon={Activity}
            />

            <SummaryCard
              title="Stock In"
              value={movementSummary.total_in}
              icon={ArrowDownToLine}
              severity="success"
            />

            <SummaryCard
              title="Stock Out"
              value={movementSummary.total_out}
              icon={ArrowUpFromLine}
              severity="danger"
            />
          </div>
        )}

        {loading.movements ? (
          <LoadingMessage />
        ) : errors.movements ? (
          <ErrorMessage message={errors.movements} />
        ) : movements.length > 0 ? (
          <DataTable<IStockMovement>
            records={movements}
            columns={movementColumns}
            meta={getTableMeta(movementMeta)}
            onPageChange={setMovementPage}
            getRowKey={(record) => record.movement_id}
          />
        ) : (
          <EmptyMessage message="No stock movements found." />
        )}
      </section>

      {/* Purchase Order Overview */}
      <section className="space-y-4">
        <SectionHeading
          title="Procurement Overview"
          description="Monitor purchase orders, approvals and supplier fulfilment progress."
          icon={ClipboardList}
        />

        {purchaseOrderSummary && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SummaryCard
                title="Total Purchase Orders"
                value={purchaseOrderSummary.total_orders}
                icon={ClipboardList}
              />

              <SummaryCard
                title="Pending Approval"
                value={purchaseOrderSummary.pending_approval}
                icon={Clock}
                severity="warning"
              />

              <SummaryCard
                title="Outstanding Orders"
                value={purchaseOrderSummary.outstanding_orders}
                icon={Truck}
                severity="default"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-600">
                Purchase Order Status Distribution
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {procurementStatuses.map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <StatusBadge status={status} />
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {formatNumber(count)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {loading.purchaseOrders ? (
          <LoadingMessage />
        ) : errors.purchaseOrders ? (
          <ErrorMessage message={errors.purchaseOrders} />
        ) : purchaseOrders.length > 0 ? (
          <DataTable<IPurchaseOrder>
            records={purchaseOrders}
            columns={purchaseOrderColumns}
            meta={getTableMeta(purchaseOrderMeta)}
            onPageChange={setPurchaseOrderPage}
            getRowKey={(record) => record.purchase_order_id}
          />
        ) : (
          <EmptyMessage message="No purchase orders found." />
        )}
      </section>

      {/* Inventory Trends */}
      <section className="space-y-4">
        <SectionHeading
          title="Inventory Movement Trends"
          description="Compare stock entering and leaving your inventory over time."
          icon={TrendingUp}
        />

        {loading.inventoryTrends ? (
          <LoadingMessage />
        ) : errors.inventoryTrends ? (
          <ErrorMessage message={errors.inventoryTrends} />
        ) : inventoryTrends.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Stock In
              </span>

              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
                Stock Out
              </span>
            </div>

            <div className="space-y-5">
              {inventoryTrends.map((trend) => (
                <div key={trend.period} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      {trend.period}
                    </span>

                    <span className="text-[11px] text-slate-500">
                      {formatNumber(trend.movement_count)} movements
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-[10px] text-slate-500">
                        In
                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${
                              (Number(trend.stock_in) / maxMovementValue) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <span className="w-12 text-right text-xs font-semibold text-slate-700">
                        {formatNumber(trend.stock_in)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-12 text-[10px] text-slate-500">
                        Out
                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{
                            width: `${
                              (Number(trend.stock_out) / maxMovementValue) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <span className="w-12 text-right text-xs font-semibold text-slate-700">
                        {formatNumber(trend.stock_out)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyMessage message="No inventory trend data available." />
        )}
      </section>

      {/* Procurement Trends */}
      <section className="space-y-4">
        <SectionHeading
          title="Procurement Trends"
          description="Review purchase order activity and estimated procurement value."
          icon={TrendingUp}
        />

        {loading.procurementTrends ? (
          <LoadingMessage />
        ) : errors.procurementTrends ? (
          <ErrorMessage message={errors.procurementTrends} />
        ) : procurementTrends.length > 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="space-y-5">
              {procurementTrends.map((trend) => {
                const orderWidth =
                  (Number(trend.order_count) / maxOrderCount) * 100;

                return (
                  <div key={trend.period} className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700">
                        {trend.period}
                      </span>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {formatNumber(trend.order_count)} orders
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Estimated value:{' '}
                          {formatCurrency(trend.estimated_procurement_value)}
                        </p>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-600"
                        style={{ width: `${orderWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyMessage message="No procurement trend data available." />
        )}
      </section>
    </div>
  );
};

export default ReportsPage;
