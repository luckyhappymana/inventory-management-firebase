import React, { useState } from 'react';
import { useInventory } from './useInventory';
import { QuickNumberInput } from '../components/QuickNumberInput';
import { NewItemModal } from '../components/NewItemModal';
import { EditItemModal } from '../components/EditItemModal';
import { QuickWithdrawalModal } from '../components/QuickWithdrawalModal';
import { WithdrawalModal } from '../components/WithdrawalModal';
import type { InventoryItem, WithdrawalRecord } from '../types/inventory';

export function useInventoryManagement() {
  const {
    items,
    transactions,
    handleTransaction,
    addItem,
    editItem,
    editTransaction,
    deleteTransaction,
    handleWithdrawalRecord,
    deleteWithdrawalRecord,
    deleteItem,
    refreshData
  } = useInventory();

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'入庫' | '出庫'>('入庫');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [withdrawalItem, setWithdrawalItem] = useState<InventoryItem | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (type: 'newItem' | 'transaction' | 'edit' | 'withdrawal') => {
    setError(null);
    switch (type) {
      case 'newItem':
        setIsNewItemModalOpen(true);
        break;
      case 'transaction':
        setIsTransactionModalOpen(true);
        break;
      case 'withdrawal':
        setIsWithdrawalModalOpen(true);
        break;
    }
  };

  const handleStockIn = (id: string) => {
    setSelectedItemId(id);
    setTransactionType('入庫');
    openModal('transaction');
  };

  const handleStockOut = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setSelectedItemId(id);
      setTransactionType('出庫');
      openModal('transaction');
    }
  };

  const handleTransactionSubmit = async (quantity: number) => {
    try {
      setError(null);
      if (selectedItemId) {
        await handleTransaction(selectedItemId, transactionType, quantity);
        setIsTransactionModalOpen(false);
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setError(error instanceof Error ? error.message : '取引の登録中にエラーが発生しました');
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
  };

  const handleEditSubmit = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      setError(null);
      await editItem(itemId, updates);
      setEditingItem(null);
    } catch (error) {
      console.error('Error editing item:', error);
      setError(error instanceof Error ? error.message : '商品の更新中にエラーが発生しました');
    }
  };

  const handleWithdrawalClick = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setWithdrawalItem(item);
    }
  };

  const handleNewItemFromWithdrawal = async (newItem: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt' | 'withdrawalRecords'>) => {
    try {
      setError(null);
      return await addItem({
        ...newItem,
        quantity: 0,
        unit: '個',
        storageLocation: '',
        note: ''
      });
    } catch (error) {
      console.error('Error creating new item:', error);
      throw error;
    }
  };

  const handleWithdrawalSubmit = async (record: WithdrawalRecord) => {
    try {
      setError(null);

      // Find existing item or create new one
      let targetItem = items.find(item => item.code === record.code);
      if (!targetItem) {
        targetItem = await handleNewItemFromWithdrawal({
          code: record.code,
          name: record.name,
          quantity: 0,
          unit: '個',
          correctionNumber: '',
          storageLocation: '',
          note: ''
        });
      }

      // Save withdrawal record
      await handleWithdrawalRecord(targetItem.id, record);
      
      // Close modal and reset state
      setWithdrawalItem(null);
      setIsWithdrawalModalOpen(false);
    } catch (error) {
      console.error('Error handling withdrawal submission:', error);
      setError(error instanceof Error ? error.message : '登録中にエラーが発生しました');
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setError(null);
      await deleteItem(itemId);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error instanceof Error ? error.message : '商品の削除中にエラーが発生しました');
    }
  };

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) : null;

  const modalComponents = (
    <>
      <QuickNumberInput
        isOpen={isTransactionModalOpen}
        title={transactionType}
        itemCode={selectedItem?.code}
        itemName={selectedItem?.name}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        maxValue={transactionType === '出庫' ? selectedItem?.quantity : undefined}
      />

      <NewItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        onSubmit={addItem}
        items={items}
      />

      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {withdrawalItem && (
        <QuickWithdrawalModal
          isOpen={true}
          itemCode={withdrawalItem.code}
          itemName={withdrawalItem.name}
          onClose={() => setWithdrawalItem(null)}
          onSubmit={handleWithdrawalSubmit}
        />
      )}

      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawalSubmit}
        onNewItem={handleNewItemFromWithdrawal}
        items={items}
      />
    </>
  );

  return {
    items,
    transactions,
    error,
    modals: modalComponents,
    handlers: {
      openModal,
      handleStockIn,
      handleStockOut,
      handleEditItem,
      editTransaction,
      deleteTransaction,
      handleWithdrawalRecord,
      handleWithdrawalClick,
      deleteWithdrawalRecord,
      handleNewItemFromWithdrawal,
      handleWithdrawalSubmit,
      handleDeleteItem
    },
    refreshData
  };
}