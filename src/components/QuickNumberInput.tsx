import React, { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  itemCode?: string;
  itemName?: string;
  onClose: () => void;
  onSubmit: (value: number) => void;
  maxValue?: number;
}

export function QuickNumberInput({ isOpen, title, itemCode, itemName, onClose, onSubmit, maxValue }: Props) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseInt(value, 10);
    if (numValue > 0 && (!maxValue || numValue <= maxValue) && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await onSubmit(numValue);
        setValue('');
        onClose();
      } catch (error) {
        console.error('Error submitting value:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        {(itemCode || itemName) && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {itemCode && (
              <div className="mb-2">
                <span className="text-sm text-gray-500">品番:</span>
                <span className="ml-2 text-lg font-mono font-semibold">{itemCode}</span>
              </div>
            )}
            {itemName && (
              <div>
                <span className="text-sm text-gray-500">品名:</span>
                <span className="ml-2 text-lg font-medium">{itemName}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">数量</label>
            <input
              ref={inputRef}
              type="number"
              min="1"
              max={maxValue}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="block w-full text-3xl text-center py-4 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              autoComplete="off"
              disabled={isSubmitting}
            />
            {maxValue && (
              <p className="mt-1 text-sm text-gray-500 text-right">
                最大: {maxValue}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!value || parseInt(value, 10) <= 0 || (maxValue && parseInt(value, 10) > maxValue) || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '処理中...' : '確定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}