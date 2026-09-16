import type { ApiResponse } from '@/interfaces';

import apiClient from './api';
import type {
  BusinessFormData,
  IBusiness,
} from '@/interfaces/business.interface';

const BUSINESSES_RESOURCE = '/businesses';

export const businessService = {
  getBusinessByID: async (
    businessId: string,
  ): Promise<ApiResponse<IBusiness>> => {
    const response = await apiClient.get<ApiResponse<IBusiness>>(
      `${BUSINESSES_RESOURCE}/${businessId}`,
    );

    return response.data;
  },

  createBusiness: async (
    businessData: BusinessFormData,
  ): Promise<ApiResponse<IBusiness>> => {
    const response = await apiClient.post<ApiResponse<IBusiness>>(
      BUSINESSES_RESOURCE,
      businessData,
    );

    return response.data;
  },

  updateBusiness: async (
    businessId: string,
    businessData: BusinessFormData,
  ): Promise<ApiResponse<IBusiness>> => {
    const response = await apiClient.patch<ApiResponse<IBusiness>>(
      `${BUSINESSES_RESOURCE}/${businessId}`,
      businessData,
    );

    return response.data;
  },
};

export const { getBusinessByID, createBusiness, updateBusiness } =
  businessService;
