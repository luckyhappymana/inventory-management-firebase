import React from 'react';
import { Package } from 'lucide-react';
import InventoryTable from './components/InventoryTable';
import { TransactionHistory } from './components/TransactionHistory';
import { useInventoryManagement } from './hooks/useInventoryManagement';
import { Header } from './components/Header';
import { WithdrawalModal } from './components/WithdrawalModal';
import { LoginForm } from './components/LoginForm';
import { useLocalAuth } from './hooks/useLocalAuth';
import { useDataSync } from './hooks/useDataSync';
import { ExcelManager } from './components/ExcelManager';

export function App() {
  const { isAuthenticated, login, logout } = useLocalAuth();
  const { lastSyncTime, syncError, isSyncing, isOnline, forceSync } = useDataSync();
  const {
    items,
    transactions,
    modals,
    handlers,
    refreshData
  } = useInventoryManagement();

  const [showHistory, setShowHistory] = React.useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = React.useState(false);
  const [showExcelManager, setShowExcelManager] = React.useState(false);

  const handleRefresh = async () => {
    try {
      await forceSync();
      await refreshData();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const handleImport = async (data: {
    items: any[];
    transactions: any[];
    withdrawalRecords: any[];
  }) => {
    try {
      await refreshData();
      setShowExcelManager(false);
    } catch (error) {
      console.error('Import refresh failed:', error);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Header
            onNewItem={() => handlers.openModal('newItem')}
            onNewWithdrawal={() => setShowWithdrawalModal(true)}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onLogout={logout}
            onRefresh={handleRefresh}
            onExcel={() => setShowExcelManager(!showExcelManager)}
            showHistory={showHistory}
            icon={<Package className="h-6 w-6 mr-2" />}
            isSyncing={isSyncing}
            syncError={syncError}
            lastSyncTime={lastSyncTime}
            isOnline={isOnline}
          />
          
          <div className="space-y-6">
            {showHistory && (
              <div className="bg-white rounded-lg shadow">
                <TransactionHistory
                  transactions={transactions}
                  onEdit={handlers.editTransaction}
                  onDelete={handlers.deleteTransaction}
                />
              </div>
            )}

            {showExcelManager && (
              <ExcelManager
                items={items}
                transactions={transactions}
                withdrawalRecords={items.flatMap(item => item.withdrawalRecords)}
                onImport={handleImport}
              />
            )}

            <div className="bg-white rounded-lg shadow">
              <InventoryTable
                items={items}
                transactions={transactions}
                onStockIn={handlers.handleStockIn}
                onStockOut={handlers.handleStockOut}
                onEdit={handlers.handleEditItem}
                onWithdrawal={handlers.handleWithdrawalClick}
                onDeleteWithdrawal={handlers.deleteWithdrawalRecord}
                onDeleteItem={handlers.handleDeleteItem}
              />
            </div>
          </div>
        </div>
      </div>

      {modals}

      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={(record) => {
          const item = items.find(i => i.code === record.code);
          if (item) {
            handlers.handleWithdrawalRecord(item.id, record);
          }
        }}
        onNewItem={handlers.handleNewItemFromWithdrawal}
        items={items}
      />
    </div>
  );
}