import React, { useState, useEffect } from 'react';
import { AlertTriangle, Archive, Clock, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BackupMetadata, BackupSchedule } from '../lib/backup';
import { createBackup, restoreBackup } from '../lib/backup';
import { formatDate } from '../utils/dateFormatter';

interface Props {
  onBackupComplete?: () => void;
  onRestoreComplete?: () => void;
}

export function BackupManager({ onBackupComplete, onRestoreComplete }: Props) {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<BackupSchedule>({
    frequency: 'daily',
    lastBackup: '',
    enabled: true
  });
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data.map(b => b.metadata));
    } catch (error) {
      console.error('Failed to load backups:', error);
      setError('バックアップの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const metadata = await createBackup();
      await loadBackups(); // Reload the backups list
      onBackupComplete?.();
    } catch (error) {
      console.error('Backup failed:', error);
      setError('バックアップの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!window.confirm('このバックアップから復元してもよろしいですか？現在のデータは新しいバックアップとして保存されます。')) {
      return;
    }

    try {
      setIsRestoring(true);
      setError(null);
      await restoreBackup(backupId);
      onRestoreComplete?.();
    } catch (error) {
      console.error('Restore failed:', error);
      setError('復元に失敗しました');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleScheduleChange = (newSchedule: Partial<BackupSchedule>) => {
    setSchedule(prev => ({ ...prev, ...newSchedule }));
  };

  if (isLoading && backups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Archive className="h-6 w-6 mr-2" />
          バックアップ管理
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={schedule.frequency}
            onChange={(e) => handleScheduleChange({ frequency: e.target.value as BackupSchedule['frequency'] })}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="daily">日次</option>
            <option value="weekly">週次</option>
            <option value="monthly">月次</option>
          </select>
          <button
            onClick={handleCreateBackup}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            新規バックアップ
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">抜き予定数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {backups.map((backup) => (
              <tr key={backup.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(backup.timestamp)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {backup.itemCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {backup.transactionCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {backup.withdrawalCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    disabled={isRestoring}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                  >
                    復元
                  </button>
                </td>
              </tr>
            ))}
            {backups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  バックアップがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}