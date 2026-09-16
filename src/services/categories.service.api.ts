import type { ApiResponse, BasePaginationParams } from '@/interfaces';

import apiClient from './api';
import type {
  CategoryFormData,
  ICategory,
} from '@/interfaces/category.interface';
import type { CategoriesResponse } from '@/types';

const CATEGORIES_RESOURCE = '/categories';

export const categoryService = {
  getAllCategories: async (
    params: BasePaginationParams = {},
  ): Promise<CategoriesResponse> => {
    const response = await apiClient.get(CATEGORIES_RESOURCE, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  getCategoryByID: async (
    categoryId: string,
  ): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.get<ApiResponse<ICategory>>(
      `${CATEGORIES_RESOURCE}/${categoryId}`,
    );

    return response.data;
  },

  createCategory: async (
    categoryData: CategoryFormData,
  ): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.post<ApiResponse<ICategory>>(
      CATEGORIES_RESOURCE,
      categoryData,
    );

    return response.data;
  },

  updateCategory: async (
    categoryId: string,
    categoryData: CategoryFormData,
  ): Promise<ApiResponse<ICategory>> => {
    const response = await apiClient.patch<ApiResponse<ICategory>>(
      `${CATEGORIES_RESOURCE}/${categoryId}`,
      categoryData,
    );

    return response.data;
  },

  removeCategory: async (categoryId: string) => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${CATEGORIES_RESOURCE}/${categoryId}`,
    );

    return response.data;
  },
};

export const {
  getAllCategories,
  getCategoryByID,
  createCategory,
  updateCategory,
  removeCategory,
} = categoryService;
