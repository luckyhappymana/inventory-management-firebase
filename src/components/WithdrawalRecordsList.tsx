import React from 'react';
import { Trash2 } from 'lucide-react';
import type { WithdrawalRecord } from '../types/inventory';
import { formatDate } from '../utils/dateFormatter';
import { summarizeWithdrawalRecords } from '../utils/withdrawalUtils';
import { getNextTwelveMonths } from '../utils/dateUtils';

interface Props {
  records: WithdrawalRecord[];
  onClose: () => void;
  onDelete: (recordId: string) => void;
}

export function WithdrawalRecordsList({ records, onClose, onDelete }: Props) {
  if (!records || records.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        抜き予定はありません
      </div>
    );
  }

  const summaries = summarizeWithdrawalRecords(records);
  const orderedMonths = getNextTwelveMonths();

  const handleDelete = (recordId: string) => {
    if (window.confirm('この抜き予定を削除してもよろしいですか？')) {
      onDelete(recordId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">抜き予定一覧</h3>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">登録日</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">抜き数量</th>
            {orderedMonths.map(month => (
              <th key={`header-${month}`} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {month}月
              </th>
            ))}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">合計</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">備考</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {summaries.map((summary, index) => (
            <tr key={`${summary.date}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(summary.date)}
              </td>
              <td className="px-6 py-4 text-center text-sm font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {summary.withdrawalQuantity || 0} {records[index].unit || ''}
                </span>
              </td>
              {orderedMonths.map(month => (
                <td key={`${summary.date}-${month}`} className="px-6 py-4 text-center text-sm font-medium">
                  {summary.monthlyQuantities[month] || '-'}
                </td>
              ))}
              <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                {summary.totalQuantity}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {summary.note || '-'}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => handleDelete(records[index].id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                  title="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}