import type {
  ProductStatus,
  UomBaseName,
  UomDisplayName,
  UomType,
} from '../enum/product';
import type { IAuditLog } from './auditlog';
import type { IBusiness } from './business.interface';
import type { ICategory } from './category.interface';
import type { IPurchaseOrder } from './purchase_order.interface';
import type { IStock } from './stock.interface';
import type { IPaginationMeta } from '.';
import type { ICloudinaryImage } from './cloudImage';
import type { Dispatch, SetStateAction } from 'react';
import type { ISupplier } from './supplier';

// Interface definitions for incoming query configuration parameters
export interface IGetAllProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  category?: string;
  search?: string;
  status?: ProductStatus;
}

export interface IProductAuditLogsResponse<T = IAuditLog> {
  auditLogs: T[];
  meta: IPaginationMeta;
}

export interface ICreateProductFormData {
  name: string;
  description: string;
  category_id: string;
  cost_price: string;
  selling_price: string;
  uom_type: UomType;
  uom_base_name: UomBaseName;
  uom_display_name: UomDisplayName;
  images: File[];
}

export interface IAddProductModalProps {
  isSubmitting: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onSubmit: (formData: FormData) => void | Promise<void>;
}

export interface IProductTableProps {
  products: IProduct[];
  meta?: IPaginationMeta;
  isPlaceholderData?: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onSelectProduct?: (product: IProduct) => void;
}
export interface IProductsWithMeta {
  products: IProduct[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
export class IProductStatusUpdateDto {
  status!: ProductStatus;
}

export interface IProduct {
  id: string;
  name: string;
  description?: string | null;
  images: ICloudinaryImage[];
  cost_price: number;
  selling_price: number;
  uom_type: UomType;
  uom_base_name: UomBaseName;
  uom_display_name: UomDisplayName;
  status: ProductStatus;
  stocks: IStock[];
  category_id: string | null;
  business_id: string;
  category?: ICategory | null;
  suppliers?: ISupplier[];
  purchase_orders?: IPurchaseOrder[];
  business: IBusiness;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
