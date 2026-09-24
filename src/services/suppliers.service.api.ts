import type { IApiResponse, IBasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type { SuppliersResponse } from '@/types';
import type { ISupplier } from '@/interfaces/supplier';

const SUPPLIERS_RESOURCE = '/suppliers';

export const supplierService = {
  getAllSuppliers: async (
    params: IBasePaginationParams = {},
  ): Promise<SuppliersResponse> => {
    const response = await apiClient.get(SUPPLIERS_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  getSupplierByID: async (
    supplierId: string,
  ): Promise<IApiResponse<ISupplier>> => {
    const response = await apiClient.get<IApiResponse<ISupplier>>(
      `${SUPPLIERS_RESOURCE}/${supplierId}`,
    );

    return response.data;
  },

  createSupplier: async (
    supplierData: FormData,
  ): Promise<IApiResponse<ISupplier>> => {
    const response = await apiClient.post<IApiResponse<ISupplier>>(
      SUPPLIERS_RESOURCE,
      supplierData,
    );

    return response.data;
  },

  updateSupplier: async (
    supplierId: string,
    supplierData: FormData,
  ): Promise<IApiResponse<ISupplier>> => {
    const response = await apiClient.patch<IApiResponse<ISupplier>>(
      `${SUPPLIERS_RESOURCE}/${supplierId}`,
      supplierData,
    );

    return response.data;
  },

  removeSupplier: async (supplierId: string) => {
    const response = await apiClient.delete<IApiResponse<null>>(
      `${SUPPLIERS_RESOURCE}/${supplierId}`,
    );

    return response.data;
  },
};

export const {
  getAllSuppliers,
  getSupplierByID,
  createSupplier,
  updateSupplier,
  removeSupplier,
} = supplierService;
