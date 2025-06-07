import React, { useState, useEffect } from 'react';
import { Package, ArrowDownCircle, ArrowUpCircle, Filter, Edit, AlertTriangle, Trash2 } from 'lucide-react';
import type { InventoryItem, InventoryTransaction } from '../types/inventory';
import { SearchBar } from './SearchBar';
import { InventoryFilters } from './InventoryFilters';
import { useInventoryFilters } from '../hooks/useInventoryFilters';
import { formatDate } from '../utils/dateFormatter';
import { WithdrawalRecordsList } from './WithdrawalRecordsList';
import { getTransactionCounts } from '../utils/transactionUtils';

interface Props {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  onStockIn: (id: string) => void;
  onStockOut: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
  onWithdrawal: (itemId: string) => void;
  onDeleteWithdrawal?: (itemId: string, recordId: string) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function InventoryTable({
  items,
  transactions,
  onStockIn,
  onStockOut,
  onEdit,
  onWithdrawal,
  onDeleteWithdrawal,
  onDeleteItem
}: Props) {
  const { filters, setFilters, showFilters, setShowFilters, filteredItems, isSearching } = useInventoryFilters(items);
  const [expandedItems, setExpandedItems] = useState(new Set<string>());

  useEffect(() => {
    if (isSearching) {
      const newExpandedItems = new Set(filteredItems.map(item => item.id));
      setExpandedItems(newExpandedItems);
    } else {
      setExpandedItems(new Set());
    }
  }, [isSearching, filteredItems]);

  const handleItemClick = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set(filteredItems.map(item => item.id));
    setExpandedItems(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedItems(new Set());
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      onDeleteItem?.(itemId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg min-h-[calc(100vh-12rem)] pb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4">
        <div className="w-full sm:w-96">
          <SearchBar
            value={filters.searchText || ''}
            onChange={(value) => setFilters({ ...filters, searchText: value })}
            placeholder="品番、品名、訂正、備考で検索..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExpandAll}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            すべて展開
          </button>
          <button
            onClick={handleCollapseAll}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            すべて折りたたむ
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            詳細フィルター
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="px-4">
          <InventoryFilters filters={filters} onFilterChange={setFilters} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品番</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂正</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">在庫数</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">操作</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保管場所</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引履歴</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">編集</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => {
              const { inCount, outCount } = getTransactionCounts(transactions, item.id);
              const isExpanded = expandedItems.has(item.id);

              return (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-lg font-medium cursor-pointer hover:text-blue-600"
                      onClick={() => handleItemClick(item.id)}
                    >
                      {item.code}
                    </td>
                    <td 
                      className="px-2 py-4 cursor-pointer hover:text-blue-600"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-1 flex-shrink-0" />
                        <span className="text-lg font-medium whitespace-pre-wrap">
                          {item.name.length > 16 
                            ? item.name.match(/.{1,16}/g)?.join('\n') 
                            : item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.correctionNumber || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-lg font-bold ${
                        item.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : item.quantity <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStockIn(item.id);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="入庫"
                        >
                          <ArrowDownCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStockOut(item.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="出庫"
                        >
                          <ArrowUpCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWithdrawal(item.id);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="抜き予定"
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.storageLocation || '-'}</td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      <span className="whitespace-pre-wrap">
                        {item.note && item.note.length > 10
                          ? item.note.match(/.{1,10}/g)?.join('\n')
                          : item.note || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          入庫: {inCount}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          出庫: {outCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="編集"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="削除"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-medium text-gray-400">作成日:</span>
                        <span className="font-mono">{formatDate(item.createdAt).replace(/時.*$/, '')}</span>
                        <span className="text-xs font-medium text-gray-400 mt-2">更新日:</span>
                        <span className="font-mono">{formatDate(item.lastUpdated).replace(/時.*$/, '')}</span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} className="bg-gray-50 p-4">
                        <WithdrawalRecordsList
                          records={item.withdrawalRecords || []}
                          onClose={() => handleItemClick(item.id)}
                          onDelete={(recordId) => onDeleteWithdrawal?.(item.id, recordId)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}