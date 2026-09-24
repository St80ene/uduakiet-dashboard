import type { ProductsResponse } from '@/types';
import apiClient from './api';
import type { IGetAllProductsParams } from '@/interfaces/products';

const PRODUCTS_RESOURCE = '/products';

export const productService = {
  /**
   * Retrieves a paginated collection of products belonging to the
   * authenticated user's business.
   *
   * Supports searching, status filtering, sorting, and pagination.
   */
  getAllProducts: async (
    params: IGetAllProductsParams = {},
  ): Promise<ProductsResponse> => {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'created_at',
      order = 'DESC',
    } = params;

    const response = await apiClient.get(PRODUCTS_RESOURCE, {
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(sortBy && { sortBy }),
        order,
      },
    });

    return response.data.data;
  },

  /**
   * Retrieves a single product by its UUID.
   *
   * The backend also returns the product's category and stock relationships.
   */
  getProductByID: async (productId: string) => {
    const response = await apiClient.get(`${PRODUCTS_RESOURCE}/${productId}`);

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
    params: IGetAllProductsParams = {},
  ) => {
    const response = await apiClient.get(
      `${PRODUCTS_RESOURCE}/${productId}/audit-logs`,
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.search && { search: params.search }),
          ...(params.status && { status: params.status }),
          ...(params.sortBy && { sortBy: params.sortBy }),
          ...(params.order && { order: params.order }),
        },
      },
    );

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
  createProduct: async (productData: FormData) => {
    const response = await apiClient.post(PRODUCTS_RESOURCE, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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
  updateProduct: async (productId: string, productData: FormData) => {
    const response = await apiClient.patch(
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
  removeProduct: async (productId: string) => {
    const response = await apiClient.delete(
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
