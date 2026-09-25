import type { IApiResponse, IBasePaginationParams } from '@/interfaces';
import type { IPurchaseOrder } from '@/interfaces/purchase_order.interface';
import apiClient from './api';
import type { IPurchaseOrdersResponse } from '@/types';

const PURCHASE_ORDERS_RESOURCE = '/purchase-orders';

export const purchaseOrderService = {
  getAllPurchaseOrders: async (
    params: IBasePaginationParams = {},
  ): Promise<IApiResponse<IPurchaseOrdersResponse>> => {
    const response = await apiClient.get<IApiResponse<IPurchaseOrdersResponse>>(
      PURCHASE_ORDERS_RESOURCE,
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.order && { order: params.order }),
        },
      },
    );

    return response.data;
  },

  getPurchaseOrderByID: async (
    purchaseOrderId: string,
  ): Promise<IApiResponse<IPurchaseOrdersResponse>> => {
    const response = await apiClient.get<IApiResponse<IPurchaseOrdersResponse>>(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
    );

    return response.data;
  },

  createPurchaseOrder: async (
    purchaseOrderData: FormData,
  ): Promise<IApiResponse<IPurchaseOrdersResponse>> => {
    const response = await apiClient.post<
      IApiResponse<IPurchaseOrdersResponse>
    >(PURCHASE_ORDERS_RESOURCE, purchaseOrderData);

    return response.data;
  },

  updatePurchaseOrder: async (
    purchaseOrderId: string,
    purchaseOrderData: FormData,
  ): Promise<IApiResponse<IPurchaseOrder>> => {
    const response = await apiClient.patch<IApiResponse<IPurchaseOrder>>(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
      purchaseOrderData,
    );

    return response.data;
  },

  removePurchaseOrder: async (purchaseOrderId: string) => {
    const response = await apiClient.delete<IApiResponse<null>>(
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
