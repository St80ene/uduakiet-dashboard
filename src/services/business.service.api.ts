import type { IApiResponse } from '@/interfaces';
import apiClient from './api';
import type { IBusiness } from '@/interfaces/business.interface';

const BUSINESSES_RESOURCE = '/businesses';

export const businessService = {
  getBusinessByID: async (businessId: string) => {
    const response = await apiClient.get(
      `${BUSINESSES_RESOURCE}/${businessId}`,
    );

    return response.data.data;
  },

  createBusiness: async (businessData: FormData) => {
    const response = await apiClient.post<IApiResponse<IBusiness>>(
      BUSINESSES_RESOURCE,
      businessData,
    );

    return response.data;
  },

  updateBusiness: async (
    businessId: string,
    businessData: Partial<IBusiness>,
  ) => {
    const response = await apiClient.patch(
      `${BUSINESSES_RESOURCE}/${businessId}`,
      businessData,
    );

    return response.data;
  },
};

export const { getBusinessByID, createBusiness, updateBusiness } =
  businessService;
