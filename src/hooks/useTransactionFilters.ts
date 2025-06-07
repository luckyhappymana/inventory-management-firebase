import { useState, useMemo } from 'react';
import type { InventoryTransaction, TransactionFilters } from '../types/inventory';
import { parseSearchQuery, matchesSearchCriteria } from '../utils/searchUtils';

export function useTransactionFilters(transactions: InventoryTransaction[]) {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filters.type) {
      result = result.filter(t => t.type === filters.type);
    }

    if (filters.searchText) {
      const searchQuery = parseSearchQuery(filters.searchText);
      result = result.filter(t => 
        matchesSearchCriteria(t.itemCode, searchQuery) ||
        matchesSearchCriteria(t.itemName, searchQuery) ||
        matchesSearchCriteria(t.correctionNumber || '', searchQuery) ||
        matchesSearchCriteria(t.note || '', searchQuery)
      );
    }

    if (filters.startDate) {
      result = result.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      result = result.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }

    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'date-asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'date-desc':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'code':
            return a.itemCode.localeCompare(b.itemCode);
          case 'quantity-asc':
            return a.quantity - b.quantity;
          case 'quantity-desc':
            return b.quantity - a.quantity;
          default:
            return 0;
        }
      });
    } else {
      // デフォルトは日時の降順
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [transactions, filters]);

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredTransactions,
  };
}