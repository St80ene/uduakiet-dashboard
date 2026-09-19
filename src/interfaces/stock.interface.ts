import type { IBusiness } from './business.interface';
import type { IProduct } from './products';
import type { IStore } from './store.interface';

export interface IStock {
  id: string;

  product_id: string;
  business_id: string;
  store_id: string;

  current_quantity: number;

  product?: IProduct;
  business?: IBusiness;
  store?: IStore;

  created_at: Date;
  updated_at: Date;
}
