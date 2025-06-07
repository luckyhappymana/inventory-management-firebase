import React, { useState } from 'react';
import type { InventoryItem } from '../types/inventory';

interface Props {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemId: string, updates: Partial<InventoryItem>) => void;
}

export function EditItemModal({ item, isOpen, onClose, onSubmit }: Props) {
  const [code, setCode] = useState(item.code);
  const [name, setName] = useState(item.name);
  const [correctionNumber, setCorrectionNumber] = useState(item.correctionNumber || '');
  const [unit, setUnit] = useState(item.unit);
  const [storageLocation, setStorageLocation] = useState(item.storageLocation || '');
  const [note, setNote] = useState(item.note || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(item.id, {
      code,
      name,
      correctionNumber,
      unit,
      storageLocation,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">商品情報の編集</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">品番</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">品名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">訂正</label>
            <input
              type="text"
              value={correctionNumber}
              onChange={(e) => setCorrectionNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="任意"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">単位</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="個">個</option>
              <option value="箱">箱</option>
              <option value="本">本</option>
              <option value="kg">kg</option>
              <option value="セット">セット</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">保管場所</label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="任意"
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