import type { InventoryItem } from '../types/inventory';

export function getNextSequenceNumber(items: InventoryItem[]): number {
  if (items.length === 0) return 1;
  
  // Convert existing codes to numbers and find the maximum
  const numbers = items.map(item => {
    const num = parseInt(item.code, 10);
    return isNaN(num) ? 0 : num;
  });
  
  return Math.max(...numbers) + 1;
}