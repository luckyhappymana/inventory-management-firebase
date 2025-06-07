import { useState, useEffect } from 'react';
import type { InventoryItem, InventoryTransaction } from '../types/inventory';
import { useInventoryState } from './useInventoryState';
import { useInventoryOperations } from './useInventoryOperations';

export function useInventory() {
  const { items, setItems, transactions, setTransactions, refreshData } = useInventoryState();
  const operations = useInventoryOperations(items, setItems, transactions, setTransactions);

  return {
    items,
    transactions,
    refreshData,
    ...operations
  };
}