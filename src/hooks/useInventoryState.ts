import { useState, useEffect } from 'react';
import type { InventoryItem, InventoryTransaction } from '../types/inventory';
import { supabase } from '../lib/supabase';
import { useLocalAuth } from './useLocalAuth';
import { storageManager } from '../storage/storageManager';

export function useInventoryState() {
  const [items, setItems] = useState<InventoryItem[]>(() => storageManager.loadItems());
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => storageManager.loadTransactions());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const { isAuthenticated } = useLocalAuth();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always load from local storage first for immediate response
      const localItems = storageManager.loadItems();
      const localTransactions = storageManager.loadTransactions();
      
      setItems(localItems);
      setTransactions(localTransactions);

      // If online, try to sync with Supabase
      if (isOnline) {
        try {
          const { data: itemsData, error: itemsError } = await supabase
            .from('items')
            .select('*')
            .order('updated_at', { ascending: false });

          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .order('created_at', { ascending: false });

          const { data: withdrawalRecordsData, error: withdrawalRecordsError } = await supabase
            .from('withdrawal_records')
            .select('*')
            .order('created_at', { ascending: false });

          if (!itemsError && !transactionsError && !withdrawalRecordsError && 
              itemsData && transactionsData && withdrawalRecordsData) {
            
            // Process withdrawal records by item
            const withdrawalsByItem = withdrawalRecordsData.reduce((acc: { [key: string]: any[] }, record) => {
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
                note: record.note,
                unit: record.unit
              });
              return acc;
            }, {});

            // Format items with their withdrawal records
            const formattedItems = itemsData.map(item => ({
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
              withdrawalRecords: withdrawalsByItem[item.id] || []
            }));

            const formattedTransactions = transactionsData.map(transaction => ({
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

            // Update local storage and state with remote data
            storageManager.saveItems(formattedItems);
            storageManager.saveTransactions(formattedTransactions);
            setItems(formattedItems);
            setTransactions(formattedTransactions);
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
          // Continue with local data if sync fails
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'データの読み込み中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    setItems: async (newItems: InventoryItem[]) => {
      storageManager.saveItems(newItems);
      setItems(newItems);
      await loadData(); // Immediately reload data after update
    },
    transactions,
    setTransactions: async (newTransactions: InventoryTransaction[]) => {
      storageManager.saveTransactions(newTransactions);
      setTransactions(newTransactions);
      await loadData(); // Immediately reload data after update
    },
    isLoading,
    error,
    isOnline,
    refreshData: loadData // Export the loadData function as refreshData
  };
}