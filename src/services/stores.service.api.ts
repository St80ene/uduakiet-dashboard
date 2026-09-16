import type { ApiResponse, BasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type { IStore } from '@/interfaces/store.interface';
import type { StoresResponse } from '@/types';

const STORES_RESOURCE = '/stores';

export const storeService = {
  getAllStores: async (
    params: BasePaginationParams = {},
  ): Promise<StoresResponse> => {
    const response = await apiClient.get(STORES_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  getStoreByID: async (storeId: string): Promise<ApiResponse<IStore>> => {
    const response = await apiClient.get<ApiResponse<IStore>>(
      `${STORES_RESOURCE}/${storeId}`,
    );

    return response.data;
  },

  createStore: async (storeData: FormData): Promise<ApiResponse<IStore>> => {
    const response = await apiClient.post<ApiResponse<IStore>>(
      STORES_RESOURCE,
      storeData,
    );

    return response.data;
  },

  updateStore: async (
    storeId: string,
    storeData: FormData,
  ): Promise<ApiResponse<IStore>> => {
    const response = await apiClient.patch<ApiResponse<IStore>>(
      `${STORES_RESOURCE}/${storeId}`,
      storeData,
    );

    return response.data;
  },

  removeStore: async (storeId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${STORES_RESOURCE}/${storeId}`,
    );

    return response.data;
  },
};

export const {
  getAllStores,
  getStoreByID,
  createStore,
  updateStore,
  removeStore,
} = storeService;
