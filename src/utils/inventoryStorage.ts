
import { InventoryItem, InventoryItemInput } from './inventoryTypes';

// Get all inventory items
export const getInventoryItems = (): InventoryItem[] => {
  const inventoryJson = localStorage.getItem('laundryInventory');
  if (!inventoryJson) {
    // Initialize with default items if no inventory exists
    const defaultItems: InventoryItem[] = [
      { id: '1', name: 'Skip', quantity: 10, minQuantity: 2, unit: 'kg', lastUpdated: new Date() },
      { id: '2', name: 'Vinagre', quantity: 5, minQuantity: 1, unit: 'L', lastUpdated: new Date() },
      { id: '3', name: 'Bolsas camiseta', quantity: 100, minQuantity: 20, unit: 'unidades', lastUpdated: new Date() },
      { id: '4', name: 'Bolsas acolchado', quantity: 50, minQuantity: 10, unit: 'unidades', lastUpdated: new Date() },
      { id: '5', name: 'Perfumina', quantity: 3, minQuantity: 1, unit: 'L', lastUpdated: new Date() },
      { id: '6', name: 'Desengrasante', quantity: 2, minQuantity: 1, unit: 'L', lastUpdated: new Date() },
      { id: '7', name: 'Bactericida', quantity: 2, minQuantity: 1, unit: 'L', lastUpdated: new Date() },
      { id: '8', name: 'Bolitas', quantity: 20, minQuantity: 5, unit: 'unidades', lastUpdated: new Date() },
      { id: '9', name: 'Quita sangre', quantity: 1, minQuantity: 1, unit: 'L', lastUpdated: new Date() },
      { id: '10', name: 'Quitamanchas', quantity: 2, minQuantity: 1, unit: 'L', lastUpdated: new Date() }
    ];
    
    localStorage.setItem('laundryInventory', JSON.stringify(defaultItems));
    return defaultItems;
  }
  
  return JSON.parse(inventoryJson).map((item: any) => ({
    ...item,
    lastUpdated: new Date(item.lastUpdated)
  }));
};

// Add a new inventory item
export const addInventoryItem = (item: InventoryItemInput): InventoryItem => {
  const inventory = getInventoryItems();
  
  const newItem: InventoryItem = {
    ...item,
    id: Date.now().toString(),
    lastUpdated: new Date()
  };
  
  inventory.push(newItem);
  localStorage.setItem('laundryInventory', JSON.stringify(inventory));
  
  return newItem;
};

// Update an existing inventory item
export const updateInventoryItem = (item: InventoryItem): InventoryItem => {
  const inventory = getInventoryItems();
  const index = inventory.findIndex(i => i.id === item.id);
  
  if (index === -1) {
    throw new Error('Item not found');
  }
  
  const updatedItem = {
    ...item,
    lastUpdated: new Date()
  };
  
  inventory[index] = updatedItem;
  localStorage.setItem('laundryInventory', JSON.stringify(inventory));
  
  return updatedItem;
};

// Delete an inventory item
export const deleteInventoryItem = (id: string): void => {
  const inventory = getInventoryItems();
  const filteredInventory = inventory.filter(item => item.id !== id);
  
  localStorage.setItem('laundryInventory', JSON.stringify(filteredInventory));
};

// Check for low inventory items
export const getLowInventoryItems = (): InventoryItem[] => {
  const inventory = getInventoryItems();
  return inventory.filter(item => item.quantity <= item.minQuantity);
};
