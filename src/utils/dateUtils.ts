export function getNextTwelveMonths(): string[] {
  const months: string[] = [];
  
  // 1月から12月まで順番に配列を作成
  for (let i = 1; i <= 12; i++) {
    months.push(i.toString());
  }
  
  return months;
}

// 既存の関数は後方互換性のために残す
export function getNextTenMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  
  for (let i = 0; i < 10; i++) {
    const month = (currentMonth + i) % 12 + 1;
    months.push(month.toString());
  }
  
  return months;
}