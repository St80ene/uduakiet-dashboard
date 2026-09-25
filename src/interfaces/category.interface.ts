import type { IBusiness } from './business.interface';
import type { IProduct } from './products';

export const CATEGORY_SORT_FIELD_NAMES = [
  'name',
  'createdAt',
  'updatedAt',
] as const;

export type CategorySortField = (typeof CATEGORY_SORT_FIELD_NAMES)[number];

export interface ICategory {
  id: string;

  name: string;
  description?: string;

  business_id: string;

  // Relationships
  business?: IBusiness;
  products?: IProduct[];

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface IGetCategoryColumnsProps {
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

export interface CategoryFormData {
  name: string;
  description: string;
}
