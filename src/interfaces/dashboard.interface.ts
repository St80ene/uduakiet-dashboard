export interface Dashboard {
  title: string;
}

export interface DashboardSection extends Dashboard {
  cards: DashboardCard[];
}

export interface DashboardCard extends Dashboard {
  id: string;

  value: number | string;

  subtitle?: string;

  severity?: 'success' | 'warning' | 'danger' | 'info';

  icon?: string;

  action?: DashboardAction;
}

export interface DashboardAction {
  label: string;
  url: string;
}

// ============================================================
// TYPES
// ============================================================

export type MetricSeverity = 'success' | 'warning' | 'danger';

export interface DashboardCardData {
  id: string;
  title: string;
  value: number | null;
  severity?: MetricSeverity;
  subtitle?: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface DashboardSectionData {
  title: string;
  cards: DashboardCardData[];
}

export interface StockByUnit {
  unit: string;
  quantity: number;
}

export interface DashboardMetrics {
  inventory: DashboardSectionData;
  procurement: DashboardSectionData;
  warehouse: DashboardSectionData & {
    stock_by_unit: StockByUnit[];
  };
}
