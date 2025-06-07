import { STORAGE_KEYS } from './config';
import type { InventoryItem, InventoryTransaction } from '../types/inventory';

class StorageManager {
  private static instance: StorageManager;

  private constructor() {
    // Private constructor to enforce singleton
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  saveItems(items: InventoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving items:', error);
      this.handleStorageError();
    }
  }

  saveTransactions(transactions: InventoryTransaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
      this.handleStorageError();
    }
  }

  loadItems(): InventoryItem[] {
    try {
      const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error loading items:', error);
      return [];
    }
  }

  loadTransactions(): InventoryTransaction[] {
    try {
      const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ITEMS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  private handleStorageError(): void {
    // Handle storage quota exceeded or other storage errors
    const oldTransactions = this.loadTransactions();
    if (oldTransactions.length > 1000) {
      // Keep only the last 1000 transactions if storage is full
      this.saveTransactions(oldTransactions.slice(-1000));
    }
  }
}

export const storageManager = StorageManager.getInstance();