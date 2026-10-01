import type {
  StockMovementType,
  StockMovementDirection,
} from '@/enum/stock_movement.enum';
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

// Interfaces for payloads
export interface ICreateStockPayload {
  product_id: string;
  movement_type: StockMovementType;
  direction: StockMovementDirection;
  initial_quantity: number;
  unit_selling_price?: number;
  unit_cost_price?: number;
  reason?: string;
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

export interface ICreateStockModalProps {
  onClose: () => void;
  onSubmit: (data: ICreateStockPayload) => void;
  isPending: boolean;
  error: unknown;
}
