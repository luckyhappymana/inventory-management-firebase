import { useState, useMemo } from 'react';
import type { InventoryItem, InventoryFilters } from '../types/inventory';
import { parseSearchQuery, matchesSearchCriteria } from '../utils/searchUtils';

export function useInventoryFilters(items: InventoryItem[]) {
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filters.searchText) {
      const searchQuery = parseSearchQuery(filters.searchText);
      result = result.filter(
        item =>
          matchesSearchCriteria(item.code, searchQuery) ||
          matchesSearchCriteria(item.name, searchQuery) ||
          matchesSearchCriteria(item.correctionNumber || '', searchQuery) ||
          matchesSearchCriteria(item.note || '', searchQuery)
      );
    }

    if (filters.unit) {
      result = result.filter(item => item.unit === filters.unit);
    }

    if (filters.stockStatus) {
      result = result.filter(item => {
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

    // Keep original order if no sort is specified
    if (!filters.sortBy) {
      return result;
    }

    // Apply sorting only if explicitly requested
    return [...result].sort((a, b) => {
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
  }, [items, filters]);

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredItems,
    isSearching: !!filters.searchText
  };
}