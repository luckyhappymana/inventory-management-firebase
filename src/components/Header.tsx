import React, { ReactNode } from 'react';
import { Package, Plus, AlertTriangle, History, LogOut, RefreshCw, Wifi, WifiOff, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onNewItem: () => void;
  onNewWithdrawal: () => void;
  onToggleHistory: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onExcel: () => void;
  showHistory: boolean;
  icon: ReactNode;
  isSyncing?: boolean;
  syncError?: string | null;
  lastSyncTime?: number;
  isOnline?: boolean;
}

export function Header({ 
  onNewItem, 
  onNewWithdrawal, 
  onToggleHistory, 
  onLogout,
  onRefresh,
  onExcel,
  showHistory, 
  icon,
  isSyncing,
  syncError,
  lastSyncTime,
  isOnline = true
}: HeaderProps) {
  const handleRefresh = () => {
    if (window.confirm('ページを更新します。未保存のデータは失われますがよろしいですか？')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
          {icon}
          在庫管理システム
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isSyncing || !isOnline}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isSyncing || !isOnline
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
            title={
              !isOnline ? 'オフライン' :
              isSyncing ? '同期中...' :
              'データを更新'
            }
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '同期中...' : '更新'}
          </button>
          <button
            onClick={onToggleHistory}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              showHistory 
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <History className="h-4 w-4 mr-2" />
            入出庫履歴
          </button>
          <button
            onClick={onExcel}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </button>
          <button
            onClick={onNewItem}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={!isOnline}
          >
            <Plus className="h-4 w-4 mr-2" />
            新規商品登録
          </button>
          <button
            onClick={onNewWithdrawal}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
            disabled={!isOnline}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            新規抜き予定登録
          </button>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            ログアウト
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 text-sm">
        <div className={`flex items-center ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 mr-1" />
              <span>オンライン</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 mr-1" />
              <span>オフライン</span>
            </>
          )}
        </div>
        {syncError ? (
          <div className="text-red-600 flex items-center">
            <span className="mr-2">同期エラー: {syncError}</span>
            <button
              onClick={handleRefresh}
              className="text-blue-600 hover:text-blue-800 underline"
              disabled={!isOnline}
            >
              再試行
            </button>
          </div>
        ) : (
          <div className="text-gray-500">
            最終同期: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : '未同期'}
          </div>
        )}
      </div>
    </div>
  );
}