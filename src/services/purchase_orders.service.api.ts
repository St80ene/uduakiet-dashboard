import type { ApiResponse, BasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type { PurchaseOrder, PurchaseOrdersResponse } from '@/types';

const PURCHASE_ORDERS_RESOURCE = '/purchase-orders';

export const purchaseOrderService = {
  getAllPurchaseOrders: async (
    params: BasePaginationParams = {},
  ): Promise<ApiResponse<PurchaseOrdersResponse>> => {
    const response = await apiClient.get<ApiResponse<PurchaseOrdersResponse>>(PURCHASE_ORDERS_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data;
  },

  getPurchaseOrderByID: async (
    purchaseOrderId: string,
  ): Promise<ApiResponse<PurchaseOrdersResponse>> => {
    const response = await apiClient.get<ApiResponse<PurchaseOrdersResponse>>(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
    );

    return response.data;
  },

  createPurchaseOrder: async (
    purchaseOrderData: FormData,
  ): Promise<ApiResponse<PurchaseOrdersResponse>> => {
    const response = await apiClient.post<ApiResponse<PurchaseOrdersResponse>>(
      PURCHASE_ORDERS_RESOURCE,
      purchaseOrderData,
    );

    return response.data;
  },

  updatePurchaseOrder: async (
    purchaseOrderId: string,
    purchaseOrderData: FormData,
  ): Promise<ApiResponse<PurchaseOrder>> => {
    const response = await apiClient.patch<ApiResponse<PurchaseOrder>>(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
      purchaseOrderData,
    );

    return response.data;
  },

  removePurchaseOrder: async (purchaseOrderId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
    );

    return response.data;
  },
};

export const {
  getAllPurchaseOrders,
  getPurchaseOrderByID,
  createPurchaseOrder,
  updatePurchaseOrder,
  removePurchaseOrder,
} = purchaseOrderService;
