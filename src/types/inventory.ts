import React from 'react';

export interface WithdrawalRecord {
  id: string;
  code: string;
  name: string;
  date: string;
  reason: string;
  quantity: number;
  withdrawalQuantity: number;
  note?: string;
  unit: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  correctionNumber?: string;
  quantity: number;
  unit: string;
  storageLocation?: string;
  note?: string;
  lastUpdated: string;
  createdAt: string;
  withdrawalRecords: WithdrawalRecord[];
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  correctionNumber?: string;
  type: '入庫' | '出庫';
  quantity: number;
  date: string;
  storageLocation?: string;
  note?: string;
}

export interface InventoryFilters {
  searchText?: string;
  unit?: string;
  stockStatus?: 'low' | 'out' | 'sufficient';
  storageLocation?: string;
  sortBy?: 'code' | 'name' | 'quantity' | 'updated' | 'correctionNumber' | 'storageLocation';
}

export interface TransactionFilters {
  type?: '入庫' | '出庫';
  itemCode?: string;
  startDate?: string;
  endDate?: string;
  searchText?: string;
  sortBy?: 'date-asc' | 'date-desc' | 'code' | 'quantity-asc' | 'quantity-desc';
}