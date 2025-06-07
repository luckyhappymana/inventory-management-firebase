import { supabase } from './supabase';
import type { InventoryItem, InventoryTransaction, WithdrawalRecord } from '../types/inventory';

export interface BackupMetadata {
  id: string;
  timestamp: string;
  itemCount: number;
  transactionCount: number;
  withdrawalCount: number;
}

export interface BackupData {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  withdrawalRecords: WithdrawalRecord[];
  metadata: BackupMetadata;
}

export async function createBackup(): Promise<BackupMetadata> {
  try {
    // Ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証が必要です');
    }

    // Fetch all data
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: true });

    if (transactionsError) throw transactionsError;

    const { data: withdrawalRecords, error: withdrawalError } = await supabase
      .from('withdrawal_records')
      .select('*')
      .order('created_at', { ascending: true });

    if (withdrawalError) throw withdrawalError;

    // Create backup metadata
    const metadata: BackupMetadata = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      itemCount: items?.length || 0,
      transactionCount: transactions?.length || 0,
      withdrawalCount: withdrawalRecords?.length || 0
    };

    // Create backup data
    const backupData: BackupData = {
      items: items || [],
      transactions: transactions || [],
      withdrawalRecords: withdrawalRecords || [],
      metadata
    };

    // Store backup
    const { error: backupError } = await supabase
      .from('backups')
      .insert({
        id: metadata.id,
        data: JSON.stringify(backupData),
        metadata,
        created_at: metadata.timestamp
      });

    if (backupError) throw backupError;

    // Log backup
    await supabase
      .from('backup_logs')
      .insert({
        type: 'create',
        metadata: {
          timestamp: metadata.timestamp,
          itemCount: metadata.itemCount,
          transactionCount: metadata.transactionCount,
          withdrawalCount: metadata.withdrawalCount
        }
      });

    return metadata;
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}

export async function restoreBackup(backupId: string): Promise<boolean> {
  try {
    // Ensure user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証が必要です');
    }

    // Fetch backup
    const { data: backup, error: fetchError } = await supabase
      .from('backups')
      .select('*')
      .eq('id', backupId)
      .single();

    if (fetchError) throw fetchError;
    if (!backup) throw new Error('バックアップが見つかりません');

    // Parse backup data
    const backupData: BackupData = JSON.parse(backup.data);

    // Create backup before restoration
    await createBackup();

    // Restore data
    const { error: itemsError } = await supabase
      .from('items')
      .upsert(backupData.items);
    if (itemsError) throw itemsError;

    const { error: transactionsError } = await supabase
      .from('transactions')
      .upsert(backupData.transactions);
    if (transactionsError) throw transactionsError;

    const { error: withdrawalError } = await supabase
      .from('withdrawal_records')
      .upsert(backupData.withdrawalRecords);
    if (withdrawalError) throw withdrawalError;

    // Log restoration
    await supabase
      .from('backup_logs')
      .insert({
        type: 'restore',
        metadata: {
          backup_id: backupId,
          timestamp: new Date().toISOString(),
          itemCount: backupData.items.length,
          transactionCount: backupData.transactions.length,
          withdrawalCount: backupData.withdrawalRecords.length
        }
      });

    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    throw error;
  }
}