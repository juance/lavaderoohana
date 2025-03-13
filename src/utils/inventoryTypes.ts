
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastUpdated: Date;
}

export type InventoryItemInput = Omit<InventoryItem, 'id' | 'lastUpdated'>;
