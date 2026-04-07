import { useState } from 'react';
import { seedTx, nextId } from '../data/seedTransactions';

export function useTransactionState() {
  const [txs, setTxs] = useState(seedTx);
  const [editingTx, setEditingTx] = useState(null);
  const [deletedTx, setDeletedTx] = useState(null);

  const addTransaction = (tx) => {
    setTxs(prev => {
      const existing = prev.some(t=>t.id===tx.id);
      return existing
        ? prev.map(t=>t.id===tx.id?tx:t)
        : [...prev, tx];
    });
  };

  const editTransaction = (tx) => {
    setEditingTx(tx);
  };

  const deleteTransaction = (id) => {
    const tx = txs.find(t=>t.id===id);
    if (tx) {
      setDeletedTx({ tx, timer: null });
      setTxs(prev => prev.filter(t=>t.id!==id));
    }
  };

  const undoDelete = () => {
    if (deletedTx?.tx) {
      addTransaction(deletedTx.tx);
      setDeletedTx(null);
    }
  };

  return { txs, editingTx, setEditingTx, deletedTx, setDeletedTx, addTransaction, deleteTransaction, undoDelete };
}
