import type { InventoryTransaction } from '../types/inventory';

export function getTransactionCounts(transactions: InventoryTransaction[], itemId: string) {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.itemId === itemId) {
        if (transaction.type === '入庫') {
          acc.inCount++;
        } else {
          acc.outCount++;
        }
      }
      return acc;
    },
    { inCount: 0, outCount: 0 }
  );
}