import type { WithdrawalRecord } from '../types/inventory';

interface WithdrawalSummary {
  date: string;
  totalQuantity: number;
  withdrawalQuantity: number;
  monthlyQuantities: { [key: string]: number };
  note: string;
}

export function summarizeWithdrawalRecords(records: WithdrawalRecord[]): WithdrawalSummary[] {
  return records.map(record => {
    const monthlyQuantities: { [key: string]: number } = {};
    
    // Parse monthly quantities from note
    const monthPattern = /(\d+)月:(\d+)/g;
    let match;
    let note = record.note || '';
    
    while ((match = monthPattern.exec(note)) !== null) {
      const [, month, quantity] = match;
      monthlyQuantities[month] = parseInt(quantity, 10);
    }

    // Remove monthly quantities from note
    note = note.replace(/(\d+)月:\d+\s*/g, '').trim();
    if (note.startsWith('備考:')) {
      note = note.substring(3).trim();
    }

    return {
      date: record.date,
      totalQuantity: record.quantity,
      withdrawalQuantity: record.withdrawalQuantity,
      monthlyQuantities,
      note
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getOrderedMonths(): string[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const months: string[] = [];
  
  // 10ヶ月分の月を取得
  for (let i = 0; i < 10; i++) {
    const month = ((currentMonth + i - 1) % 12) + 1; // 1-12の範囲で月を取得
    months.push(month.toString());
  }
  
  return months;
}