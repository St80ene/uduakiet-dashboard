import type { BasePaginationParams } from '@/interfaces';

import apiClient from './api';

const STOCK_RESOURCE = '/stocks';

export const stockService = {
  /**
   * Get paginated current stock balances.
   */
  getAllStocks: async (params: BasePaginationParams = {}) => {
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

    return response.data;
  },
};

export const { getAllStocks, getStockByID } = stockService;
