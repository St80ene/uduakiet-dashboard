import type { IBasePaginationParams } from '@/interfaces';
import apiClient from './api';
import { PURCHASE_ORDERS_RESOURCE } from './purchase_orders.service.api';

const PRODUCT_SOURCE_RESOURCE = '/product-sources';

export const productSourceService = {
  /**
   * Get all product sources.
   */
  getAllProductSources: async (params: IBasePaginationParams = {}) => {
    const response = await apiClient.get(PRODUCT_SOURCE_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  createProductSource: async (productSourceData: {
    product_id: string;
    supplier_id: string;
  }) => {
    const response = await apiClient.post(
      PRODUCT_SOURCE_RESOURCE,
      productSourceData,
    );

    return response.data;
  },

  updateProductSource: async (
    productSourceId: string,
    productSourceData: {
      product_id: string;
      supplier_id: string;
    },
  ) => {
    const response = await apiClient.patch(
      `${PRODUCT_SOURCE_RESOURCE}/${productSourceId}`,
      productSourceData,
    );

    return response.data;
  },

  getProductPurchaseHistory: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      order?: 'ASC' | 'DESC';
      sortBy?: string;
    },
  ) => {
    const response = await apiClient.get(
      `${PURCHASE_ORDERS_RESOURCE}/products/${productId}/history`,
      { params },
    );

    return response.data;
  },
};

export const {
  getAllProductSources,
  getProductPurchaseHistory,
  createProductSource,
  updateProductSource,
} = productSourceService;
