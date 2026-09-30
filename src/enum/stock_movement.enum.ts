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
  IN = 'INFLOW',
  OUT = 'OUTFLOW',
}
