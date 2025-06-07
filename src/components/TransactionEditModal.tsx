import React, { useState } from 'react';
import type { InventoryTransaction } from '../types/inventory';

interface Props {
  transaction: InventoryTransaction;
  onClose: () => void;
  onSubmit: (updates: { quantity: number; note?: string }) => void;
}

export function TransactionEditModal({ transaction, onClose, onSubmit }: Props) {
  const [quantity, setQuantity] = useState(transaction.quantity);
  const [note, setNote] = useState(transaction.note || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ quantity, note });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">取引記録の編集</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              商品: {transaction.itemName}
              <br />
              種類: {transaction.type}
              <br />
              日時: {transaction.date}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">数量</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">備考</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}