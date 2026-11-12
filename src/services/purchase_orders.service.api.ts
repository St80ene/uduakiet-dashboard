import type { IApiResponse, IBasePaginationParams } from '@/interfaces';
import type {
  ICreatePurchaseOrderFormData,
  IPurchaseOrder,
  IUpdatePurchaseOrderFormData,
} from '@/interfaces/purchase_order.interface';
import apiClient from './api';
import type { IPurchaseOrdersResponse } from '@/types';

const PURCHASE_ORDERS_RESOURCE = '/purchase-orders';

interface IReasonPayload {
  reason: string | undefined;
}

interface ICancelPurchaseOrderPayload extends IReasonPayload {
  supplier_cancellation_confirmed?: boolean;
}

interface IReceivePurchaseOrderItem {
  item_id: string;
  quantity_received: number;
}

interface IReceivePurchaseOrderPayload {
  items: IReceivePurchaseOrderItem[];
}

export const purchaseOrderService = {
  getAllPurchaseOrders: async (params: IBasePaginationParams = {}) => {
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

    return response.data.data;
  },

  getPurchaseOrderByID: async (
    purchaseOrderId: string,
  ): Promise<IPurchaseOrder> => {
    const response = await apiClient.get(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
    );

    return response.data.data;
  },

  createPurchaseOrder: async (
    purchaseOrderData: ICreatePurchaseOrderFormData,
  ) => {
    const response = await apiClient.post<IApiResponse<IPurchaseOrder>>(
      PURCHASE_ORDERS_RESOURCE,
      purchaseOrderData,
    );

    return response.data;
  },

  updatePurchaseOrder: async (
    purchaseOrderId: string,
    purchaseOrderData: IUpdatePurchaseOrderFormData,
  ): Promise<IApiResponse<IPurchaseOrder>> => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
      purchaseOrderData,
    );

    return response.data;
  },

  // SENT_TO_SUPPLIER -> RECEIVED
  receivePurchaseOrder: async (
    purchaseOrderId: string,
    payload: IReceivePurchaseOrderPayload,
  ) => {
    const response = await apiClient.post(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/receive`,
      payload,
    );

    return response.data;
  },

  // Only DRAFT purchase orders can be removed.
  removeDraftPurchaseOrder: async (purchaseOrderId: string) => {
    const response = await apiClient.delete(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}`,
    );

    return response.data;
  },
  // DRAFT -> PENDING_APPROVAL
  submitPurchaseOrderForApproval: async (purchaseOrderId: string) => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/submit-for-approval`,
    );

    return response.data;
  },

  // PENDING_APPROVAL -> APPROVED
  approvePurchaseOrder: async (purchaseOrderId: string) => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/approve`,
    );

    return response.data;
  },

  // APPROVED -> SENT_TO_SUPPLIER
  markPurchaseOrderAsSent: async (purchaseOrderId: string) => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/mark-as-sent-to-supplier`,
    );

    return response.data;
  },

  // PENDING_APPROVAL -> DRAFT
  rejectPurchaseOrder: async (
    purchaseOrderId: string,
    payload: IReasonPayload,
  ) => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/reject`,
      payload,
    );

    return response.data;
  },

  // DRAFT / PENDING_APPROVAL / APPROVED / SENT_TO_SUPPLIER -> CANCELLED
  cancelPurchaseOrder: async (
    purchaseOrderId: string,
    payload: ICancelPurchaseOrderPayload,
  ) => {
    const response = await apiClient.patch(
      `${PURCHASE_ORDERS_RESOURCE}/${purchaseOrderId}/cancel`,
      payload,
    );

    return response.data;
  },
};

export const {
  getAllPurchaseOrders,
  getPurchaseOrderByID,
  createPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrderForApproval,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  markPurchaseOrderAsSent,
  cancelPurchaseOrder,
  receivePurchaseOrder,
  removeDraftPurchaseOrder,
} = purchaseOrderService;
