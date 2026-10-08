import type { IBasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type { IUpdateStockPayload } from '@/interfaces/stock.interface';

const STOCK_RESOURCE = '/stocks';

export const stockService = {
  /**
   * Get paginated current stock balances.
   */
  getAllStocks: async (params: IBasePaginationParams = {}) => {
    const response = await apiClient.get(STOCK_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  /**
   * Get a single current stock balance.
   */
  getStockByID: async (stockId: string) => {
    const response = await apiClient.get(`${STOCK_RESOURCE}/${stockId}`);

    return response.data.data;
  },

  adjustStock: async (stockData: IUpdateStockPayload) => {
    const response = await apiClient.patch(
      `${STOCK_RESOURCE}/adjustment`,
      stockData,
    );

    return response.data;
  },
};

export const { getAllStocks, getStockByID, adjustStock } = stockService;
