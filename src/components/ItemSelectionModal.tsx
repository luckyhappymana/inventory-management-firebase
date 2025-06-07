{`import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import type { InventoryItem } from '../types/inventory';

interface Props {
  isOpen: boolean;
  items: InventoryItem[];
  onClose: () => void;
  onSelect: (itemId: string) => void;
  onNewItem: () => void;
}

export function ItemSelectionModal({ isOpen, items, onClose, onSelect, onNewItem }: Props) {
  const [searchText, setSearchText] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter(item => 
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">商品選択</h2>
          <button
            onClick={onNewItem}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規商品として登録
          </button>
        </div>
        <div className="mb-4 relative">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="品番または品名で検索..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">品番</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">品名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">在庫数</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity}{item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}`}