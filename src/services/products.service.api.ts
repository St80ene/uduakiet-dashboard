import type { AuditLog, ProductAuditLogsResponse } from '@/interfaces/auditlog';
import type { ApiResponse, GetAllProductsParams } from '../interfaces/products';
import apiClient from './api';
import type { Product, ProductsResponse } from '@/types';

const PRODUCTS_RESOURCE = '/products';

export const productService = {
  /**
   * Retrieves a paginated collection of products belonging to the
   * authenticated user's business.
   *
   * Supports searching, status filtering, sorting, and pagination.
   */
  getAllProducts: async (
    params: GetAllProductsParams = {},
  ): Promise<ProductsResponse> => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'created_at',
      order = 'DESC',
    } = params;

    const response = await apiClient.get<ApiResponse<ProductsResponse>>(
      PRODUCTS_RESOURCE,
      {
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(status && { status }),
          ...(sortBy && { sortBy }),
          order,
        },
      },
    );

    return response.data.data;
  },

  /**
   * Retrieves a single product by its UUID.
   *
   * The backend also returns the product's category and stock relationships.
   */
  getProductByID: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(
      `${PRODUCTS_RESOURCE}/${productId}`,
    );

    return response.data.data;
  },

  /**
   * Retrieves paginated audit logs for a specific product.
   *
   * @param productId - UUID of the product.
   * @param params - Product pagination, search, status, and sorting parameters.
   * @returns Paginated audit logs associated with the product.
   */
  getProductAuditLogs: async (
    productId: string,
    params: GetAllProductsParams = {},
  ): Promise<ProductAuditLogsResponse<AuditLog>> => {
    const response = await apiClient.get<
      ApiResponse<ProductAuditLogsResponse<AuditLog>>
    >(`${PRODUCTS_RESOURCE}/${productId}/audit-logs`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.order && { order: params.order }),
      },
    });

    return response.data.data;
  },

  /**
   * Retrieves inventory health metrics for the authenticated user's business.
   *
   * These metrics are used by the dashboard to display the current state
   * of the product inventory.
   */
  getInventoryHealth: async () => {
    const response = await apiClient.get(
      `${PRODUCTS_RESOURCE}/inventory-health`,
    );

    return response.data.data;
  },

  /**
   * Creates a new product.
   *
   * Product images must be appended to the FormData using the `images`
   * field name. The backend accepts up to 5 images.
   *
   * @param productData - Multipart form data containing product details
   * and optional product images.
   */
  createProduct: async (productData: FormData): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>(
      PRODUCTS_RESOURCE,
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.data;
  },

  /**
   * Updates an existing product.
   *
   * Product images must be appended to the FormData using the `images`
   * field name. The backend accepts up to 5 images.
   *
   * @param productId - UUID of the product to update.
   * @param productData - Multipart form data containing the fields to update
   * and optional product images.
   */
  updateProduct: async (
    productId: string,
    productData: FormData,
  ): Promise<Product> => {
    const response = await apiClient.patch<ApiResponse<Product>>(
      `${PRODUCTS_RESOURCE}/${productId}`,
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.data;
  },

  /**
   * Soft-deletes a product.
   *
   * @param productId - UUID of the product to remove.
   */
  removeProduct: async (productId: string): Promise<null> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `${PRODUCTS_RESOURCE}/${productId}`,
    );

    return response.data.data;
  },
};

// Backwards-compatible named exports.
export const {
  getAllProducts,
  getProductByID,
  getProductAuditLogs,
  getInventoryHealth,
  createProduct,
  updateProduct,
  removeProduct,
} = productService;
