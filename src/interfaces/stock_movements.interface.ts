import type { IBusiness } from './business.interface';
import type { IStock } from './stock.interface';
import type { IUser } from './user.interface';

export enum StockMovementType {
  RECEIPT = 'RECEIPT',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
  REVERSAL = 'REVERSAL',
}

export enum StockMovementDirection {
  IN = 'IN',
  OUT = 'OUT',
}

export enum StockMovementReferenceType {
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  STOCK_ADJUSTMENT = 'STOCK_ADJUSTMENT',
  STOCK_TRANSFER = 'STOCK_TRANSFER',
  SALE = 'SALE',
  STOCK_MOVEMENT = 'STOCK_MOVEMENT',
}

export interface IStockMovement {
  id: string;

  // References
  stock_id: string;
  business_id: string;
  created_by_id: string | null;

  // Movement details
  type: StockMovementType;
  direction: StockMovementDirection;
  quantity: number;

  // Stock balance snapshots
  quantity_before: number;
  quantity_after: number;

  // Price snapshots
  unit_cost_price: number;
  unit_selling_price: number | null;

  // Explanation
  reason: string | null;

  // Reference to the originating business operation
  reference_type: StockMovementReferenceType | null;
  reference_id: string | null;

  // Relationships
  stock?: IStock;
  business?: IBusiness;
  created_by?: IUser | null;

  // Timestamp
  created_at: Date;
}

/**
 * Data required to create a stock movement.
 *
 * quantity_before and quantity_after are intentionally excluded
 * because they should be calculated by the backend from the
 * current stock balance.
 */
export interface StockMovementFormData {
  stock_id: string;

  type: StockMovementType;
  direction: StockMovementDirection;
  quantity: number;

  unit_cost_price: number;
  unit_selling_price?: number | null;

  reason?: string | null;

  reference_type?: StockMovementReferenceType | null;
  reference_id?: string | null;
}
