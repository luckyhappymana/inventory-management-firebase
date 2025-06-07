import { Dispatch, SetStateAction } from 'react';
import type { InventoryItem, InventoryTransaction, WithdrawalRecord } from '../types/inventory';
import { generateId } from '../utils/helpers';
import { supabase } from '../lib/supabase';

export function useInventoryOperations(
  items: InventoryItem[],
  setItems: (items: InventoryItem[]) => Promise<void>,
  transactions: InventoryTransaction[],
  setTransactions: (transactions: InventoryTransaction[]) => Promise<void>
) {
  const handleTransaction = async (itemId: string, type: '入庫' | '出庫', quantity: number, note?: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        throw new Error('商品が見つかりません。');
      }

      if (type === '出庫' && item.quantity < quantity) {
        throw new Error('在庫数が不足しています。');
      }

      const newQuantity = type === '入庫' 
        ? item.quantity + quantity 
        : item.quantity - quantity;

      const now = new Date().toISOString();
      const transaction: InventoryTransaction = {
        id: generateId(),
        itemId,
        itemCode: item.code,
        itemName: item.name,
        correctionNumber: item.correctionNumber,
        type,
        quantity,
        date: now,
        note,
      };

      // Update item quantity in database
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          quantity: newQuantity, 
          updated_at: now 
        })
        .eq('id', itemId);

      if (updateError) {
        throw updateError;
      }

      // Insert transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          item_id: transaction.itemId,
          item_code: transaction.itemCode,
          item_name: transaction.itemName,
          correction_number: transaction.correctionNumber,
          type: transaction.type,
          quantity: transaction.quantity,
          note: transaction.note,
          created_at: now
        });

      if (transactionError) {
        // Rollback item quantity if transaction insert fails
        await supabase
          .from('items')
          .update({ 
            quantity: item.quantity, 
            updated_at: item.lastUpdated 
          })
          .eq('id', itemId);
        throw transactionError;
      }

      // Update local state
      const updatedItems = items.map(i =>
        i.id === itemId
          ? { ...i, quantity: newQuantity, lastUpdated: now }
          : i
      );
      const updatedTransactions = [transaction, ...transactions];

      await setItems(updatedItems);
      await setTransactions(updatedTransactions);

    } catch (error) {
      console.error('Error handling transaction:', error);
      throw error;
    }
  };

  const addItem = async (newItem: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt' | 'withdrawalRecords'>) => {
    try {
      const isDuplicate = items.some(item => item.code === newItem.code);
      if (isDuplicate) {
        throw new Error('この品番は既に登録されています。');
      }

      const now = new Date().toISOString();
      const item: InventoryItem = {
        ...newItem,
        id: generateId(),
        lastUpdated: now,
        createdAt: now,
        withdrawalRecords: []
      };

      const { error } = await supabase
        .from('items')
        .insert({
          id: item.id,
          code: item.code,
          name: item.name,
          correction_number: item.correctionNumber,
          quantity: item.quantity,
          unit: item.unit,
          storage_location: item.storageLocation,
          note: item.note,
          created_at: now,
          updated_at: now
        });

      if (error) throw error;

      const updatedItems = [...items, item];
      await setItems(updatedItems);
      
      return item;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const editItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      if (updates.code) {
        const isDuplicate = items.some(item => 
          item.code === updates.code && item.id !== itemId
        );
        if (isDuplicate) {
          throw new Error('この品番は既に使用されています。');
        }
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('items')
        .update({
          code: updates.code,
          name: updates.name,
          correction_number: updates.correctionNumber,
          quantity: updates.quantity,
          unit: updates.unit,
          storage_location: updates.storageLocation,
          note: updates.note,
          updated_at: now
        })
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = items.map(item =>
        item.id === itemId
          ? { ...item, ...updates, lastUpdated: now }
          : item
      );
      await setItems(updatedItems);
    } catch (error) {
      console.error('Error editing item:', error);
      throw error;
    }
  };

  const handleWithdrawalRecord = async (itemId: string, record: WithdrawalRecord) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        throw new Error('商品が見つかりません。');
      }

      const now = new Date().toISOString();

      // Validate record data
      if (!record.withdrawalQuantity || record.withdrawalQuantity < 0) {
        throw new Error('抜き数量は0以上の数値を入力してください');
      }

      if (!record.quantity || record.quantity < 0) {
        throw new Error('月別数量の合計は0以上の数値である必要があります');
      }

      // Insert withdrawal record with all fields
      const { error } = await supabase
        .from('withdrawal_records')
        .insert({
          id: record.id,
          item_id: itemId,
          item_code: record.code,
          item_name: record.name,
          withdrawal_quantity: record.withdrawalQuantity,
          total_quantity: record.quantity,
          note: record.note,
          unit: record.unit || '個',
          created_at: now
        });

      if (error) throw error;

      // Update local state
      const updatedItems = items.map(i => {
        if (i.id === itemId) {
          const updatedRecords = [...(i.withdrawalRecords || []), { ...record, date: now }];
          return {
            ...i,
            withdrawalRecords: updatedRecords,
            lastUpdated: now
          };
        }
        return i;
      });

      await setItems(updatedItems);
      return true;
    } catch (error) {
      console.error('Error in handleWithdrawalRecord:', error);
      throw error;
    }
  };

  const deleteWithdrawalRecord = async (itemId: string, recordId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            withdrawalRecords: (item.withdrawalRecords || []).filter(r => r.id !== recordId),
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      });

      await setItems(updatedItems);
    } catch (error) {
      console.error('Error deleting withdrawal record:', error);
      throw error;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = items.filter(item => item.id !== itemId);
      await setItems(updatedItems);

      const updatedTransactions = transactions.filter(t => t.itemId !== itemId);
      await setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  return {
    addItem,
    editItem,
    handleTransaction,
    editTransaction: async () => {}, // Placeholder for now
    deleteTransaction: async () => {}, // Placeholder for now
    handleWithdrawalRecord,
    deleteWithdrawalRecord,
    deleteItem
  };
}