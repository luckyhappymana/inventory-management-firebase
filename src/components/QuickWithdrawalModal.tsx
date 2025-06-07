import React, { useState, useEffect, useRef } from 'react';
import type { WithdrawalRecord } from '../types/inventory';
import { generateId } from '../utils/helpers';
import { getNextTwelveMonths } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  itemCode: string;
  itemName: string;
  onClose: () => void;
  onSubmit: (record: WithdrawalRecord) => void;
}

export function QuickWithdrawalModal({ isOpen, itemCode, itemName, onClose, onSubmit }: Props) {
  const [monthlyQuantities, setMonthlyQuantities] = useState<string[]>(Array(12).fill(''));
  const [withdrawalQuantity, setWithdrawalQuantity] = useState('');
  const [note, setNote] = useState('');
  const withdrawalQuantityInputRef = useRef<HTMLInputElement>(null);

  const months = getNextTwelveMonths();

  useEffect(() => {
    if (isOpen) {
      setMonthlyQuantities(Array(12).fill(''));
      setWithdrawalQuantity('');
      setNote('');
      setTimeout(() => {
        if (withdrawalQuantityInputRef.current) {
          withdrawalQuantityInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantities = monthlyQuantities.map(qty => parseInt(qty) || 0);
    const totalQuantity = quantities.reduce((sum, qty) => sum + qty, 0);

    // 月別数量が入力されている場合のみ月別詳細を含める
    let monthlyDetails = '';
    if (totalQuantity > 0) {
      monthlyDetails = months
        .map((month, index) => quantities[index] > 0 ? `${month}月:${quantities[index]}` : '')
        .filter(Boolean)
        .join(' ');
    }

    const record: WithdrawalRecord = {
      id: generateId(),
      code: itemCode,
      name: itemName,
      date: new Date().toISOString(),
      reason: '10ヶ月予定数',
      quantity: totalQuantity,
      withdrawalQuantity: parseInt(withdrawalQuantity) || 0,
      note: monthlyDetails ? `${monthlyDetails}${note ? `\n備考: ${note}` : ''}` : note
    };

    onSubmit(record);
    setMonthlyQuantities(Array(12).fill(''));
    setWithdrawalQuantity('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <h2 className="text-xl font-semibold mb-6">抜き予定登録</h2>
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">品番</div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
                {itemCode}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">品名</div>
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'monospace' }}>
                {itemName}
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">抜き数量</label>
            <input
              ref={withdrawalQuantityInputRef}
              type="text"
              value={withdrawalQuantity}
              onChange={(e) => setWithdrawalQuantity(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="grid grid-cols-10 gap-4 mb-4">
            {months.map((month, index) => (
              <div key={month}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{month}月</label>
                <input
                  type="text"
                  value={monthlyQuantities[index]}
                  onChange={(e) => {
                    const newQuantities = [...monthlyQuantities];
                    newQuantities[index] = e.target.value;
                    setMonthlyQuantities(newQuantities);
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              style={{ textTransform: 'uppercase' }}
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
              登録
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}