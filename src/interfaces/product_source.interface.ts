import type { PaginationMeta } from '.';

export interface ISupplierRef {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface IProductRef {
  id: string;
  name: string;
  sku?: string;
}

export interface IProductSource {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier?: ISupplierRef;
  product?: IProductRef;
  created_at: string;
}

export interface ProductSourcesResponse {
  product_sources: IProductSource[];
  meta: PaginationMeta;
}

export interface ProductSourceFormData {
  product_id: string;
  supplier_id: string;
}
