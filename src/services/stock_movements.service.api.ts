import type { IApiResponse, IBasePaginationParams } from '@/interfaces';
import apiClient from './api';

import type { StockMovementsResponse } from '@/types';
import type {
  IStockMovement,
  StockMovementFormData,
} from '@/interfaces/stock_movements.interface';

const STOCK_MOVEMENTS_RESOURCE = '/stock-movements';

export const stockMovementService = {
  getAllStockMovements: async (
    params: IBasePaginationParams = {},
  ): Promise<StockMovementsResponse> => {
    const response = await apiClient.get(STOCK_MOVEMENTS_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  getStockMovementByID: async (
    movementId: string,
  ): Promise<IApiResponse<IStockMovement>> => {
    const response = await apiClient.get<IApiResponse<IStockMovement>>(
      `${STOCK_MOVEMENTS_RESOURCE}/${movementId}`,
    );

    return response.data;
  },

  getMovementsByStock: async (
    stockId: string,
  ): Promise<IApiResponse<IStockMovement[]>> => {
    const response = await apiClient.get<IApiResponse<IStockMovement[]>>(
      `${STOCK_MOVEMENTS_RESOURCE}/stock/${stockId}`,
    );

    return response.data;
  },

  getMovementsByProduct: async (
    productId: string,
  ): Promise<IApiResponse<IStockMovement[]>> => {
    const response = await apiClient.get<IApiResponse<IStockMovement[]>>(
      `${STOCK_MOVEMENTS_RESOURCE}/product/${productId}`,
    );

    return response.data;
  },

  createMovement: async (
    movementData: StockMovementFormData,
  ): Promise<IApiResponse<IStockMovement>> => {
    const response = await apiClient.post<IApiResponse<IStockMovement>>(
      `${STOCK_MOVEMENTS_RESOURCE}/movement`,
      movementData,
    );

    return response.data;
  },

  bulkCreateMovements: async (
    movementData: StockMovementFormData[],
  ): Promise<IApiResponse<IStockMovement[]>> => {
    const response = await apiClient.post<IApiResponse<IStockMovement[]>>(
      `${STOCK_MOVEMENTS_RESOURCE}/movement/bulk`,
      movementData,
    );

    return response.data;
  },
};

export const {
  getAllStockMovements,
  getStockMovementByID,
  getMovementsByStock,
  getMovementsByProduct,
  createMovement,
  bulkCreateMovements,
} = stockMovementService;
