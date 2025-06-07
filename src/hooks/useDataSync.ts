import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { InventoryItem, InventoryTransaction } from '../types/inventory';
import { storageManager } from '../storage/storageManager';

export function useDataSync() {
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // 自動的に同期を試みる
      syncData(true).catch(console.error);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncData = async (force = false) => {
    if (!isOnline) {
      console.log('オフライン状態です。ローカルデータを使用します。');
      return;
    }

    if (isSyncing && !force) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      // Try to sync with Supabase
      const [itemsResponse, transactionsResponse, withdrawalResponse] = await Promise.allSettled([
        supabase.from('items').select('*').order('updated_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawal_records').select('*').order('created_at', { ascending: false })
      ]);

      // Handle responses individually
      const errors: string[] = [];

      // Process items
      if (itemsResponse.status === 'fulfilled' && !itemsResponse.value.error) {
        const formattedItems = itemsResponse.value.data.map(item => ({
          id: item.id,
          code: item.code,
          name: item.name,
          correctionNumber: item.correction_number,
          quantity: item.quantity,
          unit: item.unit,
          storageLocation: item.storage_location,
          note: item.note,
          lastUpdated: item.updated_at,
          createdAt: item.created_at,
          withdrawalRecords: []
        }));
        storageManager.saveItems(formattedItems);
      } else if (itemsResponse.status === 'rejected' || itemsResponse.value.error) {
        errors.push('商品データの同期に失敗しました');
      }

      // Process transactions
      if (transactionsResponse.status === 'fulfilled' && !transactionsResponse.value.error) {
        const formattedTransactions = transactionsResponse.value.data.map(transaction => ({
          id: transaction.id,
          itemId: transaction.item_id,
          itemCode: transaction.item_code,
          itemName: transaction.item_name,
          correctionNumber: transaction.correction_number,
          type: transaction.type as '入庫' | '出庫',
          quantity: transaction.quantity,
          date: transaction.created_at,
          note: transaction.note
        }));
        storageManager.saveTransactions(formattedTransactions);
      } else if (transactionsResponse.status === 'rejected' || transactionsResponse.value.error) {
        errors.push('取引履歴の同期に失敗しました');
      }

      // Process withdrawal records
      if (withdrawalResponse.status === 'fulfilled' && !withdrawalResponse.value.error) {
        const withdrawalsByItem = withdrawalResponse.value.data.reduce((acc: { [key: string]: any[] }, record) => {
          if (!acc[record.item_id]) {
            acc[record.item_id] = [];
          }
          acc[record.item_id].push({
            id: record.id,
            code: record.item_code,
            name: record.item_name,
            date: record.created_at,
            reason: '10ヶ月予定数',
            quantity: record.total_quantity,
            withdrawalQuantity: record.withdrawal_quantity,
            note: record.note
          });
          return acc;
        }, {});

        if (itemsResponse.status === 'fulfilled' && !itemsResponse.value.error) {
          const updatedItems = itemsResponse.value.data.map(item => ({
            ...item,
            withdrawalRecords: withdrawalsByItem[item.id] || []
          }));
          storageManager.saveItems(updatedItems);
        }
      } else if (withdrawalResponse.status === 'rejected' || withdrawalResponse.value.error) {
        errors.push('抜き記録の同期に失敗しました');
      }

      if (errors.length > 0) {
        setSyncError(errors.join('\n'));
        throw new Error(errors.join('\n'));
      }

      setLastSyncTime(Date.now());
      setRetryCount(0);

      // Dispatch event with all updated data
      window.dispatchEvent(new CustomEvent('inventory-data-updated'));

    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'データの同期中にエラーが発生しました';
      setSyncError(errorMessage);

      // Implement retry logic
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => syncData(true), RETRY_DELAY);
      } else {
        console.log('同期の再試行回数が上限に達しました。ローカルデータを使用します。');
      }

      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    lastSyncTime,
    syncError,
    isSyncing,
    isOnline,
    forceSync: () => syncData(true)
  };
}