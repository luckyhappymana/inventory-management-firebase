import React from 'react';
import { Filter, Edit2, Trash2 } from 'lucide-react';
import type { InventoryTransaction } from '../types/inventory';
import { TransactionEditModal } from './TransactionEditModal';
import { TransactionFilters } from './TransactionFilters';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { SearchBar } from './SearchBar';
import { formatDate } from '../utils/dateFormatter';

interface Props {
  transactions: InventoryTransaction[];
  onEdit: (transactionId: string, updates: { quantity: number; note?: string }) => void;
  onDelete: (transactionId: string) => void;
}

export function TransactionHistory({ transactions, onEdit, onDelete }: Props) {
  const {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredTransactions
  } = useTransactionFilters(transactions);
  const [editingTransaction, setEditingTransaction] = React.useState<InventoryTransaction | null>(null);

  const handleDelete = (transaction: InventoryTransaction) => {
    if (window.confirm(`この${transaction.type}記録を削除してもよろしいですか？在庫数も調整されます。`)) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">入出庫履歴</h2>
            <SearchBar
              value={filters.searchText || ''}
              onChange={(value) => setFilters({ ...filters, searchText: value })}
              placeholder="品番、品名、訂正、備考で検索..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            詳細フィルター
          </button>
        </div>

        {showFilters && (
          <div className="mt-4">
            <TransactionFilters
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">種類</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品番</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂正</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === '入庫' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.itemCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.itemName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.correctionNumber || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{transaction.note || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900"
                      title="編集"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="text-red-600 hover:text-red-900"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={(updates) => {
            onEdit(editingTransaction.id, updates);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
}