import type { IBusiness } from './business.interface';
import type { IProduct } from './products';
import type { IStore } from './store.interface';
import type { IStockMovement } from './stock_movements.interface';

export interface IStock {
  id: string;

  product_id: string;
  business_id: string;
  store_id: string;

  current_quantity: number;

  product?: IProduct;
  business?: IBusiness;
  store?: IStore;
  movements?: IStockMovement[];

  created_at: Date;
  updated_at: Date;
}

export interface IUpdateStockPayload {
  product_id: string;
  physical_quantity: number;
  reason?: string;
}

export interface ICreateStockProps {
  productId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}
