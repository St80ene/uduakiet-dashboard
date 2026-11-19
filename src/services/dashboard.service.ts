import type { DashboardSection } from '@/interfaces/dashboard.interface';
import apiClient from './api';

export const DASHBOARD_RESOURCE = '/dashboard';

interface StockByUnit {
  unit: string;
  quantity: number;
}

type WarehouseDashboardSection = DashboardSection & {
  stock_by_unit: Promise<StockByUnit[]>;
};

export interface DashboardResponse {
  inventory: DashboardSection;
  procurement: DashboardSection;
  warehouse: WarehouseDashboardSection;
}

export const dashboardService = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get(`${DASHBOARD_RESOURCE}`);

    return response.data.data;
  },
};

export const { getDashboardMetrics } = dashboardService;
