import type { InventoryItem, InventoryTransaction } from '../types/inventory';

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  TRANSACTIONS: 'inventory_transactions',
} as const;

export function saveItems(items: InventoryItem[]): void {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
}

export function saveTransactions(transactions: InventoryTransaction[]): void {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

export function loadItems(): InventoryItem[] {
  const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return items ? JSON.parse(items) : [];
}

export function loadTransactions(): InventoryTransaction[] {
  const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return transactions ? JSON.parse(transactions) : [];
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
}