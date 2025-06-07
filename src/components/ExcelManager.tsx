import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { exportToExcel, importFromExcel } from '../utils/excelUtils';
import type { InventoryItem, InventoryTransaction, WithdrawalRecord } from '../types/inventory';

interface Props {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  withdrawalRecords: WithdrawalRecord[];
  onImport: (data: {
    items: InventoryItem[];
    transactions: InventoryTransaction[];
    withdrawalRecords: WithdrawalRecord[];
  }) => Promise<void>;
}

export function ExcelManager({ items, transactions, withdrawalRecords, onImport }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setError(null);
      setIsExporting(true);
      await exportToExcel({
        items,
        transactions,
        withdrawalRecords
      });
    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError('Excelファイル(.xlsx)を選択してください');
      return;
    }

    try {
      setError(null);
      setIsImporting(true);

      const data = await importFromExcel(file);
      await onImport(data);
    } catch (error) {
      console.error('Import failed:', error);
      setError(error instanceof Error ? error.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FileSpreadsheet className="h-6 w-6 mr-2" />
          Excel管理
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'エクスポート中...' : 'エクスポート'}
        </button>

        <label className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer ${
          isImporting ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          {isImporting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {isImporting ? 'インポート中...' : 'インポート'}
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            className="hidden"
            disabled={isImporting}
          />
        </label>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>※ エクスポートしたExcelファイルと同じ形式のファイルのみインポート可能です。</p>
        <p>※ インポート時に既存のデータは上書きされます。</p>
        <p>※ インポート前に必ずバックアップを取ることをお勧めします。</p>
      </div>
    </div>
  );
}