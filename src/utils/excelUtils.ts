import { utils, read, write } from 'xlsx';
import type { InventoryItem, InventoryTransaction, WithdrawalRecord } from '../types/inventory';
import { supabase } from '../lib/supabase';
import { getNextTwelveMonths } from './dateUtils';
import { generateId } from './helpers';

interface ExcelData {
  items: InventoryItem[];
  transactions: InventoryTransaction[];
  withdrawalRecords: WithdrawalRecord[];
}

export async function exportToExcel(data: ExcelData): Promise<void> {
  try {
    const wb = utils.book_new();

    // Format items for Excel
    const itemsForExcel = data.items.map(item => ({
      品番: item.code,
      品名: item.name,
      訂正: item.correctionNumber || '',
      在庫数: item.quantity,
      単位: item.unit,
      保管場所: item.storageLocation || '',
      備考: item.note || ''
    }));

    // Format transactions for Excel
    const transactionsForExcel = data.transactions.map(transaction => ({
      日時: new Date(transaction.date).toLocaleString('ja-JP'),
      種類: transaction.type,
      品番: transaction.itemCode,
      品名: transaction.itemName,
      訂正: transaction.correctionNumber || '',
      数量: transaction.quantity,
      備考: transaction.note || ''
    }));

    // Format withdrawal records for Excel
    const withdrawalRecordsForExcel = data.withdrawalRecords.map(record => {
      const monthlyQuantities: { [key: string]: number } = {};
      const months = getNextTwelveMonths();
      
      // Parse monthly quantities from note
      if (record.note) {
        const monthPattern = /(\d+)月:(\d+)/g;
        let match;
        let remainingNote = record.note;
        
        while ((match = monthPattern.exec(record.note)) !== null) {
          const [, month, quantity] = match;
          monthlyQuantities[month] = parseInt(quantity, 10);
          remainingNote = remainingNote.replace(`${month}月:${quantity}`, '');
        }

        // Clean up remaining note
        remainingNote = remainingNote.replace(/備考:\s*/, '').trim();

        const baseRecord = {
          日時: new Date(record.date).toLocaleString('ja-JP'),
          品番: record.code,
          品名: record.name,
          抜き数量: record.withdrawalQuantity,
          予定総数: record.quantity,
          単位: record.unit || '個'
        };

        // Add monthly columns
        months.forEach(month => {
          baseRecord[`${month}月予定数`] = monthlyQuantities[month] || 0;
        });

        baseRecord['備考'] = remainingNote;

        return baseRecord;
      }

      return {
        日時: new Date(record.date).toLocaleString('ja-JP'),
        品番: record.code,
        品名: record.name,
        抜き数量: record.withdrawalQuantity,
        予定総数: record.quantity,
        単位: record.unit || '個',
        ...Object.fromEntries(months.map(month => [`${month}月予定数`, 0])),
        備考: record.note || ''
      };
    });

    // Create worksheets
    const wsItems = utils.json_to_sheet(itemsForExcel);
    const wsTransactions = utils.json_to_sheet(transactionsForExcel);
    const wsWithdrawalRecords = utils.json_to_sheet(withdrawalRecordsForExcel);

    // Add worksheets to workbook
    utils.book_append_sheet(wb, wsItems, '商品');
    utils.book_append_sheet(wb, wsTransactions, '取引履歴');
    utils.book_append_sheet(wb, wsWithdrawalRecords, '抜き予定');

    // Generate Excel file
    const excelBuffer = write(wb, { 
      bookType: 'xlsx', 
      type: 'array'
    });

    // Create and download file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `在庫データ_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error instanceof Error ? error : new Error('Excelファイルの作成に失敗しました');
  }
}

export async function importFromExcel(file: File): Promise<ExcelData> {
  try {
    // Read file
    const data = await file.arrayBuffer();
    const wb = read(data, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    // Validate workbook structure
    if (!wb.SheetNames.includes('商品') || 
        !wb.SheetNames.includes('取引履歴') || 
        !wb.SheetNames.includes('抜き予定')) {
      throw new Error('必要なシート（商品、取引履歴、抜き予定）が見つかりません');
    }

    // Read items
    const itemsSheet = wb.Sheets['商品'];
    const rawItems = utils.sheet_to_json(itemsSheet);
    
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error('商品データが見つかりません');
    }

    // Create a map to track existing items and their IDs
    const existingItems = new Map<string, InventoryItem>();

    // First, fetch existing items from Supabase
    const { data: existingData, error: fetchError } = await supabase
      .from('items')
      .select('*');

    if (fetchError) throw fetchError;

    // Create a map of existing items
    const existingItemsMap = new Map(
      (existingData || []).map(item => [item.code, item])
    );

    // Process items
    const items: InventoryItem[] = rawItems.map((row: any, index) => {
      if (!row['品番'] || !row['品名']) {
        throw new Error(`商品データの ${index + 1} 行目: 品番または品名が未入力です`);
      }

      const code = String(row['品番']).trim();
      const existing = existingItemsMap.get(code);

      const item: InventoryItem = {
        id: existing?.id || generateId(),
        code,
        name: String(row['品名']).trim(),
        correctionNumber: row['訂正'] ? String(row['訂正']).trim() : '',
        quantity: parseInt(String(row['在庫数'])) || 0,
        unit: row['単位'] ? String(row['単位']).trim() : '個',
        storageLocation: row['保管場所'] ? String(row['保管場所']).trim() : '',
        note: row['備考'] ? String(row['備考']).trim() : '',
        createdAt: existing?.created_at || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        withdrawalRecords: []
      };

      existingItems.set(code, item);
      return item;
    });

    // Process transactions
    const transactionsSheet = wb.Sheets['取引履歴'];
    const rawTransactions = utils.sheet_to_json(transactionsSheet);
    
    const transactions: InventoryTransaction[] = rawTransactions.map((row: any, index) => {
      if (!row['品番'] || !row['品名'] || !row['種類']) {
        throw new Error(`取引履歴の ${index + 1} 行目: 必須項目が未入力です`);
      }

      const code = String(row['品番']).trim();
      let item = existingItems.get(code);

      if (!item) {
        item = {
          id: generateId(),
          code,
          name: String(row['品名']).trim(),
          quantity: 0,
          unit: '個',
          correctionNumber: '',
          storageLocation: '',
          note: '',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          withdrawalRecords: []
        };
        existingItems.set(code, item);
        items.push(item);
      }

      const type = String(row['種類']).trim();
      if (type !== '入庫' && type !== '出庫') {
        throw new Error(`取引履歴の ${index + 1} 行目: 種類は「入庫」または「出庫」を指定してください`);
      }

      return {
        id: generateId(),
        itemId: item.id,
        itemCode: code,
        itemName: item.name,
        correctionNumber: item.correctionNumber,
        type: type as '入庫' | '出庫',
        quantity: parseInt(String(row['数量'])) || 0,
        date: new Date().toISOString(),
        note: row['備考'] ? String(row['備考']).trim() : ''
      };
    });

    // Process withdrawal records
    const withdrawalSheet = wb.Sheets['抜き予定'];
    const rawWithdrawals = utils.sheet_to_json(withdrawalSheet);
    const months = getNextTwelveMonths();
    
    const withdrawalRecords: WithdrawalRecord[] = rawWithdrawals.map((row: any, index) => {
      if (!row['品番'] || !row['品名']) {
        throw new Error(`抜き予定の ${index + 1} 行目: 品番または品名が未入力です`);
      }

      const code = String(row['品番']).trim();
      let item = existingItems.get(code);

      if (!item) {
        item = {
          id: generateId(),
          code,
          name: String(row['品名']).trim(),
          quantity: 0,
          unit: row['単位'] ? String(row['単位']).trim() : '個',
          correctionNumber: '',
          storageLocation: '',
          note: '',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          withdrawalRecords: []
        };
        existingItems.set(code, item);
        items.push(item);
      }

      // Extract monthly quantities
      const monthlyQuantities = months
        .map(month => {
          const qty = parseInt(String(row[`${month}月予定数`])) || 0;
          return qty > 0 ? `${month}月:${qty}` : null;
        })
        .filter(Boolean)
        .join(' ');

      // Combine monthly quantities with other notes
      const note = [
        monthlyQuantities,
        row['備考'] ? `備考: ${String(row['備考']).trim()}` : ''
      ].filter(Boolean).join('\n');

      return {
        id: generateId(),
        code,
        name: item.name,
        date: new Date().toISOString(),
        reason: '10ヶ月予定数',
        withdrawalQuantity: parseInt(String(row['抜き数量'])) || 0,
        quantity: parseInt(String(row['予定総数'])) || 0,
        note,
        unit: item.unit
      };
    });

    // Save to Supabase
    try {
      // Delete all existing records
      await supabase.from('withdrawal_records').delete().not('id', 'is', null);
      await supabase.from('transactions').delete().not('id', 'is', null);
      await supabase.from('items').delete().not('id', 'is', null);

      // Save items
      const { error: itemsError } = await supabase
        .from('items')
        .upsert(items.map(item => ({
          id: item.id,
          code: item.code,
          name: item.name,
          correction_number: item.correctionNumber,
          quantity: item.quantity,
          unit: item.unit,
          storage_location: item.storageLocation,
          note: item.note,
          created_at: item.createdAt,
          updated_at: item.lastUpdated
        })));

      if (itemsError) throw itemsError;

      // Save transactions
      const { error: transactionsError } = await supabase
        .from('transactions')
        .insert(transactions.map(t => ({
          id: t.id,
          item_id: t.itemId,
          item_code: t.itemCode,
          item_name: t.itemName,
          correction_number: t.correctionNumber,
          type: t.type,
          quantity: t.quantity,
          note: t.note,
          created_at: t.date
        })));

      if (transactionsError) throw transactionsError;

      // Save withdrawal records
      const { error: withdrawalError } = await supabase
        .from('withdrawal_records')
        .insert(withdrawalRecords.map(w => ({
          id: w.id,
          item_id: items.find(i => i.code === w.code)?.id,
          item_code: w.code,
          item_name: w.name,
          withdrawal_quantity: w.withdrawalQuantity,
          total_quantity: w.quantity,
          note: w.note,
          unit: w.unit,
          created_at: w.date
        })));

      if (withdrawalError) throw withdrawalError;

    } catch (error) {
      console.error('Error saving to Supabase:', error);
      throw new Error('データの保存に失敗しました');
    }

    return { items, transactions, withdrawalRecords };
  } catch (error) {
    console.error('Excel import failed:', error);
    throw error instanceof Error ? error : new Error('Excelファイルの読み込みに失敗しました');
  }
}