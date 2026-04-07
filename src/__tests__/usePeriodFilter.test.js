import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the period utilities
vi.mock('../utils/period', () => ({
  filterByRange: (txs, period) => {
    const ranges = {
      'this_month': ['2026-04-01', '2026-04-07'],
      'last_month': ['2026-03-01', '2026-03-31'],
      'last_3': ['2026-01-07', '2026-04-07'],
      'this_year': ['2026-01-01', '2026-04-07'],
      'last_year': ['2025-01-01', '2025-12-31'],
    };

    if (typeof period === 'object') {
      return txs.filter(t => t.date >= period.from && t.date <= period.to);
    }

    const [from, to] = ranges[period] || ranges['this_month'];
    return txs.filter(t => t.date >= from && t.date <= to);
  },

  periodLabel: (period) => {
    if (typeof period === 'object') {
      return `${period.from} – ${period.to}`;
    }
    const labels = {
      'this_month': 'Ten miesiąc',
      'last_month': 'Ostatni miesiąc',
      'last_3': 'Ostatnie 3 miesiące',
      'this_year': 'Ten rok',
      'last_year': 'Ostatni rok',
    };
    return labels[period] || 'Ten miesiąc';
  },
}));

import { usePeriodFilter } from '../hooks/usePeriodFilter';

describe('usePeriodFilter', () => {
  const mockTxs = [
    { id: 1, desc: 'Tx1', date: '2026-04-05', amount: -50 },
    { id: 2, desc: 'Tx2', date: '2026-04-03', amount: -100 },
    { id: 3, desc: 'Tx3', date: '2026-03-25', amount: -75 },
    { id: 4, desc: 'Tx4', date: '2025-12-15', amount: -200 },
  ];

  it('should initialize with default period', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs));
    expect(result.current.period).toBe('this_month');
  });

  it('should initialize with custom default period', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'last_month'));
    expect(result.current.period).toBe('last_month');
  });

  it('should filter transactions for this_month', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'this_month'));
    // Current month is April, so should have txs from 2026-04
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every(t => t.date.startsWith('2026-04'))).toBe(true);
  });

  it('should filter transactions for last_month', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'last_month'));
    // Last month is March
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.some(t => t.date.startsWith('2026-03'))).toBe(true);
  });

  it('should filter transactions for last_3 months', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'last_3'));
    expect(result.current.filtered.length).toBeGreaterThan(0);
  });

  it('should filter transactions for this_year', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'this_year'));
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every(t => t.date.startsWith('2026'))).toBe(true);
  });

  it('should filter transactions for last_year', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'last_year'));
    expect(result.current.filtered.some(t => t.date.startsWith('2025'))).toBe(true);
  });

  it('should support custom date range', () => {
    const customRange = { from: '2026-03-01', to: '2026-03-31' };
    const { result } = renderHook(() => usePeriodFilter(mockTxs, customRange));

    expect(result.current.filtered.every(t => t.date >= '2026-03-01' && t.date <= '2026-03-31')).toBe(true);
  });

  it('should update period and refilter', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'this_month'));
    const initialFiltered = result.current.filtered.length;

    act(() => {
      result.current.setPeriod('last_year');
    });

    expect(result.current.period).toBe('last_year');
    expect(result.current.filtered.length).toBeGreaterThanOrEqual(1);
  });

  it('should provide period label', () => {
    const { result } = renderHook(() => usePeriodFilter(mockTxs, 'this_month'));
    expect(result.current.label).toBe('Ten miesiąc');
  });

  it('should provide label for custom range', () => {
    const customRange = { from: '2026-03-01', to: '2026-03-31' };
    const { result } = renderHook(() => usePeriodFilter(mockTxs, customRange));
    expect(result.current.label).toContain('–');
  });

  it('should refilter when transactions array changes', () => {
    const { result, rerender } = renderHook(
      ({ txs, period }) => usePeriodFilter(txs, period),
      {
        initialProps: { txs: mockTxs.slice(0, 2), period: 'this_month' },
      }
    );

    const initialFiltered = result.current.filtered.length;

    rerender({ txs: mockTxs, period: 'this_month' });

    // Should have refiltered with more transactions
    expect(result.current.filtered.length).toBeGreaterThanOrEqual(initialFiltered);
  });

  it('should handle empty transactions array', () => {
    const { result } = renderHook(() => usePeriodFilter([], 'this_month'));
    expect(result.current.filtered).toHaveLength(0);
  });
});
