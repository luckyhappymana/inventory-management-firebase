import React from 'react';
import type { InventoryFilters } from '../types/inventory';

interface Props {
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
}

export function InventoryFilters({ filters, onFilterChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <select
        value={filters.unit || ''}
        onChange={(e) => onFilterChange({ ...filters, unit: e.target.value || undefined })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">全ての単位</option>
        <option value="個">個</option>
        <option value="箱">箱</option>
        <option value="本">本</option>
        <option value="kg">kg</option>
        <option value="セット">セット</option>
      </select>

      <select
        value={filters.stockStatus || ''}
        onChange={(e) => onFilterChange({ ...filters, stockStatus: e.target.value as any || undefined })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">在庫状況</option>
        <option value="low">在庫少</option>
        <option value="out">在庫切れ</option>
        <option value="sufficient">十分</option>
      </select>

      <select
        value={filters.sortBy || ''}
        onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any || undefined })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">並び替え</option>
        <option value="code">品番</option>
        <option value="name">品名</option>
        <option value="quantity">在庫数</option>
        <option value="updated">更新日時</option>
      </select>
    </div>
  );
}