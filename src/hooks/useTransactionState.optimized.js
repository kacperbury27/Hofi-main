import { useState, useCallback, useMemo } from 'react';
import { seedTx, nextId } from '../data/seedTransactions';

/**
 * useTransactionState - Optimized version
 * Zmniejsza re-renders przez useCallback dla funkcji
 * Memoizuje computed values
 */
export function useTransactionState() {
  const [txs, setTxs] = useState(seedTx);
  const [editingTx, setEditingTx] = useState(null);
  const [deletedTx, setDeletedTx] = useState(null);

  const addTransaction = useCallback((tx) => {
    setTxs(prev => {
      const existing = prev.some(t => t.id === tx.id);
      return existing
        ? prev.map(t => t.id === tx.id ? tx : t)
        : [...prev, tx];
    });
  }, []);

  const editTransaction = useCallback((tx) => {
    setEditingTx(tx);
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTxs(prev => {
      const tx = prev.find(t => t.id === id);
      if (tx) {
        setDeletedTx({ tx, timer: null });
        return prev.filter(t => t.id !== id);
      }
      return prev;
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (deletedTx?.tx) {
      addTransaction(deletedTx.tx);
      setDeletedTx(null);
    }
  }, [deletedTx, addTransaction]);

  const clearDeletedTx = useCallback(() => {
    setDeletedTx(null);
  }, []);

  // Memoize derived values
  const stats = useMemo(() => {
    const totalIncome = txs.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const totalExpense = txs.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [txs]);

  return {
    txs,
    editingTx,
    setEditingTx,
    deletedTx,
    setDeletedTx,
    addTransaction,
    editTransaction,
    deleteTransaction,
    undoDelete,
    clearDeletedTx,
    stats,
  };
}
