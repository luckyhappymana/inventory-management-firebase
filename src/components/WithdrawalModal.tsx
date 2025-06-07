import React, { useState, useEffect, useRef } from 'react';
import type { WithdrawalRecord, InventoryItem } from '../types/inventory';
import { generateId } from '../utils/helpers';
import { getNextTwelveMonths } from '../utils/dateUtils';
import { toHalfWidthUpperCase } from '../utils/stringUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: WithdrawalRecord) => void;
  onNewItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'createdAt' | 'withdrawalRecords'>) => InventoryItem;
  items: InventoryItem[];
}

export function WithdrawalModal({ isOpen, onClose, onSubmit, onNewItem, items }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [correctionNumber, setCorrectionNumber] = useState('');
  const [monthlyQuantities, setMonthlyQuantities] = useState<string[]>(Array(12).fill(''));
  const [withdrawalQuantity, setWithdrawalQuantity] = useState('');
  const [unit, setUnit] = useState('個');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const months = getNextTwelveMonths();

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => {
        if (codeInputRef.current) {
          codeInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  const handleCodeChange = (newCode: string) => {
    const formattedCode = toHalfWidthUpperCase(newCode);
    setCode(formattedCode);
    
    const existingItem = items.find(item => item.code === formattedCode);
    if (existingItem) {
      setName(existingItem.name);
      setCorrectionNumber(existingItem.correctionNumber || '');
      setUnit(existingItem.unit);
      setSelectedItem(existingItem);
    } else {
      setSelectedItem(null);
    }
  };

  const validateInputs = () => {
    if (!code.trim()) {
      throw new Error('品番を入力してください');
    }
    if (!name.trim()) {
      throw new Error('品名を入力してください');
    }

    const parsedWithdrawalQuantity = parseInt(withdrawalQuantity);
    if (isNaN(parsedWithdrawalQuantity) || parsedWithdrawalQuantity < 0) {
      throw new Error('抜き数量は0以上の数値を入力してください');
    }

    const quantities = monthlyQuantities.map(qty => parseInt(qty) || 0);
    const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);
    
    if (totalQuantity === 0) {
      throw new Error('月別数量を少なくとも1つ入力してください');
    }

    if (note.length > 100) {
      throw new Error('備考は100文字以内で入力してください');
    }

    return {
      parsedWithdrawalQuantity,
      totalQuantity,
      quantities
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { parsedWithdrawalQuantity, totalQuantity, quantities } = validateInputs();

      // Format monthly quantities for display
      const monthlyDetails = months
        .map((month, index) => quantities[index] > 0 ? `${month}月:${quantities[index]}` : '')
        .filter(Boolean)
        .join(' ');

      // Create final note with monthly details and additional notes
      const finalNote = [
        monthlyDetails,
        note.trim()
      ].filter(Boolean).join('\n');

      if (!selectedItem) {
        await onNewItem({
          code,
          name,
          correctionNumber,
          quantity: 0,
          unit,
          storageLocation: '',
          note: ''
        });
      }

      const record: WithdrawalRecord = {
        id: generateId(),
        code,
        name,
        date: new Date().toISOString(),
        reason: '10ヶ月予定数',
        quantity: totalQuantity,
        withdrawalQuantity: parsedWithdrawalQuantity,
        note: finalNote,
        unit
      };

      await onSubmit(record);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting withdrawal record:', error);
      setError(error instanceof Error ? error.message : '登録中にエラーが発生しました');
    }
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setCorrectionNumber('');
    setMonthlyQuantities(Array(12).fill(''));
    setWithdrawalQuantity('');
    setUnit('個');
    setNote('');
    setError(null);
    setSelectedItem(null);
  };

  if (!isOpen) return null;

  const totalMonthlyQuantity = monthlyQuantities.reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">新規抜き予定登録</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品番 <span className="text-red-500">*</span>
              </label>
              <input
                ref={codeInputRef}
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(toHalfWidthUpperCase(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                訂正
              </label>
              <input
                type="text"
                value={correctionNumber}
                onChange={(e) => setCorrectionNumber(toHalfWidthUpperCase(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                抜き数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={withdrawalQuantity}
                onChange={(e) => setWithdrawalQuantity(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                単位 <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="個">個</option>
                <option value="箱">箱</option>
                <option value="本">本</option>
                <option value="kg">kg</option>
                <option value="セット">セット</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月別数量 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-10 gap-2">
              {months.map((month, index) => (
                <div key={month}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{month}月</label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyQuantities[index]}
                    onChange={(e) => {
                      const newQuantities = [...monthlyQuantities];
                      newQuantities[index] = e.target.value;
                      setMonthlyQuantities(newQuantities);
                    }}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm">
              <span className="font-medium">合計: </span>
              <span className={totalMonthlyQuantity === 0 ? 'text-red-600' : 'text-gray-900'}>
                {totalMonthlyQuantity} {unit}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              備考 <span className="text-xs text-gray-500">(100文字以内)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              className={`block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                note.length > 100 ? 'border-red-300' : 'border-gray-300'
              }`}
              style={{ textTransform: 'uppercase' }}
            />
            <div className="mt-1 text-sm text-gray-500">
              {note.length}/100文字
            </div>
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
              disabled={totalMonthlyQuantity === 0}
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}