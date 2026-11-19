import apiClient from './api';

export const REPORTS_RESOURCE = '/reports';

/**
 * Query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface InventoryReportQuery extends PaginationQuery {
  category_id?: string;
  store_id?: string;
}

export interface StockMovementReportQuery extends PaginationQuery {
  product_id?: string;
  store_id?: string;
  movement_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface PurchaseOrderReportQuery extends PaginationQuery {
  status?: string;
  supplier_id?: string;
  overdue?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface AnalyticsQuery {
  start_date?: string;
  end_date?: string;
  interval?: 'day' | 'week' | 'month';
}

/**
 * Dashboard
 */
export interface DashboardReportResponse {
  inventory: unknown;
  procurement: unknown;
}

/**
 * Reports service
 */
export const reportsService = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get(`${REPORTS_RESOURCE}/dashboard`);

    return response.data.data;
  },

  getInventoryOverview: async (params?: InventoryReportQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/inventory/overview`,
      { params },
    );

    return response.data.data;
  },

  getStockAttentionReport: async (params?: InventoryReportQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/inventory/stock-attention`,
      { params },
    );

    return response.data.data;
  },

  getStockMovementReport: async (params?: StockMovementReportQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/inventory/stock-movements`,
      { params },
    );

    return response.data.data;
  },

  getPurchaseOrderOverview: async (params?: PurchaseOrderReportQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/procurement/overview`,
      { params },
    );

    return response.data.data;
  },

  getInventoryTrends: async (params?: AnalyticsQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/analytics/inventory-trends`,
      { params },
    );

    return response.data.data;
  },

  getProcurementTrends: async (params?: AnalyticsQuery) => {
    const response = await apiClient.get(
      `${REPORTS_RESOURCE}/analytics/procurement-trends`,
      { params },
    );

    return response.data.data;
  },
};

export const {
  getDashboardMetrics,
  getInventoryOverview,
  getStockAttentionReport,
  getStockMovementReport,
  getPurchaseOrderOverview,
  getInventoryTrends,
  getProcurementTrends,
} = reportsService;
