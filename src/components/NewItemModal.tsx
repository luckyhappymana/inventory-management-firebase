import React, { useState, useEffect, useRef } from 'react';
import type { InventoryItem } from '../types/inventory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt' | 'withdrawalRecords'>) => void;
  items: InventoryItem[]; // Add items prop
}

export function NewItemModal({ isOpen, onClose, onSubmit, items }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [correctionNumber, setCorrectionNumber] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('個');
  const [storageLocation, setStorageLocation] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isOpen]);

  const validateCode = (inputCode: string) => {
    const isDuplicate = items.some(item => item.code === inputCode);
    if (isDuplicate) {
      setError('この品番は既に登録されています');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    validateCode(newCode);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validateCode(code)) {
        return;
      }

      onSubmit({ 
        code,
        name, 
        correctionNumber, 
        quantity, 
        unit, 
        storageLocation, 
        note,
      });
      // Reset form
      setCode('');
      setName('');
      setCorrectionNumber('');
      setQuantity(0);
      setUnit('個');
      setStorageLocation('');
      setNote('');
      setError(null);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登録中にエラーが発生しました。');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">新規商品登録</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">品番</label>
            <input
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={handleCodeChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
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
            <label className="block text-sm font-medium text-gray-700">初期在庫数</label>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!error}
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}