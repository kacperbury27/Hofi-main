import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the seed data
vi.mock('../data/seedTransactions', () => ({
  nextId: 210,
  seedTx: [
    { id: 1, desc: 'Test 1', cat: 'Food', amount: -50, who: 'Kacper', date: '2025-03-25', currency: 'PLN', type: 'expense' },
    { id: 2, desc: 'Test 2', cat: 'Income', amount: 1000, who: 'Anna', date: '2025-03-24', currency: 'PLN', type: 'income' },
  ],
}));

import { useTransactionState } from '../hooks/useTransactionState';

describe('useTransactionState', () => {
  it('should initialize with seed transactions', () => {
    const { result } = renderHook(() => useTransactionState());
    expect(result.current.txs).toHaveLength(2);
    expect(result.current.txs[0].desc).toBe('Test 1');
  });

  it('should add new transaction', () => {
    const { result } = renderHook(() => useTransactionState());
    const initialLength = result.current.txs.length;

    act(() => {
      result.current.addTransaction({
        id: 211,
        desc: 'New Transaction',
        cat: 'Food',
        amount: -100,
        who: 'Kacper',
        date: '2025-03-26',
        currency: 'PLN',
        type: 'expense',
      });
    });

    expect(result.current.txs).toHaveLength(initialLength + 1);
    expect(result.current.txs[result.current.txs.length - 1].desc).toBe('New Transaction');
  });

  it('should edit existing transaction', () => {
    const { result } = renderHook(() => useTransactionState());

    act(() => {
      result.current.addTransaction({
        ...result.current.txs[0],
        desc: 'Edited Transaction',
      });
    });

    const editedTx = result.current.txs.find(t => t.id === result.current.txs[0].id);
    expect(editedTx.desc).toBe('Edited Transaction');
  });

  it('should delete transaction and mark for undo', () => {
    const { result } = renderHook(() => useTransactionState());
    const txToDelete = result.current.txs[0];
    const initialLength = result.current.txs.length;

    act(() => {
      result.current.deleteTransaction(txToDelete.id);
    });

    expect(result.current.txs).toHaveLength(initialLength - 1);
    expect(result.current.deletedTx?.tx).toEqual(txToDelete);
    expect(result.current.txs.find(t => t.id === txToDelete.id)).toBeUndefined();
  });

  it('should undo delete transaction', () => {
    const { result } = renderHook(() => useTransactionState());
    const txToDelete = result.current.txs[0];

    act(() => {
      result.current.deleteTransaction(txToDelete.id);
    });

    const afterDeleteLength = result.current.txs.length;

    act(() => {
      result.current.undoDelete();
    });

    expect(result.current.txs).toHaveLength(afterDeleteLength + 1);
    expect(result.current.txs.find(t => t.id === txToDelete.id)).toBeDefined();
    expect(result.current.deletedTx).toBeNull();
  });

  it('should set and clear editingTx', () => {
    const { result } = renderHook(() => useTransactionState());
    const tx = result.current.txs[0];

    act(() => {
      result.current.setEditingTx(tx);
    });

    expect(result.current.editingTx).toEqual(tx);

    act(() => {
      result.current.setEditingTx(null);
    });

    expect(result.current.editingTx).toBeNull();
  });

  it('should not undo when no deleted transaction', () => {
    const { result } = renderHook(() => useTransactionState());

    act(() => {
      result.current.undoDelete();
    });

    expect(result.current.txs).toHaveLength(2);
  });

  it('should handle duplicate transaction ID gracefully', () => {
    const { result } = renderHook(() => useTransactionState());
    const newTx = {
      id: 1, // This ID already exists
      desc: 'Duplicate ID',
      cat: 'Food',
      amount: -25,
      who: 'Anna',
      date: '2025-03-25',
      currency: 'PLN',
      type: 'expense',
    };

    act(() => {
      result.current.addTransaction(newTx);
    });

    // Should still have 2 transactions (the first was updated)
    expect(result.current.txs).toHaveLength(2);
    expect(result.current.txs[0].desc).toBe('Duplicate ID');
  });
});
