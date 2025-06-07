import React from 'react';
import type { TransactionFilters } from '../types/inventory';

interface Props {
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
}

export function TransactionFilters({ filters, onFilterChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">取引種類</label>
        <select
          value={filters.type || ''}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value as '入庫' | '出庫' | undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">全ての種類</option>
          <option value="入庫">入庫</option>
          <option value="出庫">出庫</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">品番</label>
        <input
          type="text"
          value={filters.itemCode || ''}
          onChange={(e) => onFilterChange({ ...filters, itemCode: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="品番で検索..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="md:col-span-2 lg:col-span-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
        <select
          value={filters.sortBy || ''}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value || undefined })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">デフォルト（日時降順）</option>
          <option value="date-asc">日時（古い順）</option>
          <option value="date-desc">日時（新しい順）</option>
          <option value="code">品番</option>
          <option value="quantity-asc">数量（少ない順）</option>
          <option value="quantity-desc">数量（多い順）</option>
        </select>
      </div>
    </div>
  );
}