import { useMemo } from 'react';
import type { InventoryItem, InventoryFilters } from '../types/inventory';

export function useInventorySearch(items: InventoryItem[], filters: InventoryFilters) {
  return useMemo(() => {
    let filteredItems = [...items];

    // テキスト検索
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredItems = filteredItems.filter(
        item =>
          item.code.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.note.toLowerCase().includes(searchLower)
      );
    }

    // 単位フィルター
    if (filters.unit) {
      filteredItems = filteredItems.filter(item => item.unit === filters.unit);
    }

    // 在庫状況フィルター
    if (filters.stockStatus) {
      filteredItems = filteredItems.filter(item => {
        switch (filters.stockStatus) {
          case 'low':
            return item.quantity > 0 && item.quantity <= 10;
          case 'out':
            return item.quantity === 0;
          case 'sufficient':
            return item.quantity > 10;
          default:
            return true;
        }
      });
    }

    // 並び替え
    if (filters.sortBy) {
      filteredItems.sort((a, b) => {
        switch (filters.sortBy) {
          case 'code':
            return a.code.localeCompare(b.code);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'quantity':
            return b.quantity - a.quantity;
          case 'updated':
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          default:
            return 0;
        }
      });
    }

    return filteredItems;
  }, [items, filters]);
}