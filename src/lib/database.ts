import { supabase } from './supabase';
import type { InventoryItem, InventoryTransaction, WithdrawalRecord } from '../types/inventory';

export async function syncItems(items: InventoryItem[]) {
  const { error } = await supabase
    .from('items')
    .upsert(
      items.map(item => ({
        id: item.id,
        code: item.code,
        name: item.name,
        correction_number: item.correctionNumber,
        quantity: item.quantity,
        unit: item.unit,
        storage_location: item.storageLocation,
        note: item.note
      }))
    );
  
  if (error) throw error;
}

export async function syncTransactions(transactions: InventoryTransaction[]) {
  const { error } = await supabase
    .from('transactions')
    .upsert(
      transactions.map(transaction => ({
        id: transaction.id,
        item_id: transaction.itemId,
        type: transaction.type,
        quantity: transaction.quantity,
        note: transaction.note
      }))
    );
  
  if (error) throw error;
}

export async function syncWithdrawalRecords(itemId: string, records: WithdrawalRecord[]) {
  const { error } = await supabase
    .from('withdrawal_records')
    .upsert(
      records.map(record => ({
        id: record.id,
        item_id: itemId,
        withdrawal_quantity: record.withdrawalQuantity,
        total_quantity: record.quantity,
        monthly_quantities: record.note,
        note: record.note
      }))
    );
  
  if (error) throw error;
}