import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from 'vitest';

// Mock the seed data and currency
vi.mock('../data/seedGoals', () => ({
  seedGoals: [
    {
      id: 'g1',
      name: 'Vacation',
      type: 'savings',
      target: 10000,
      currency: 'PLN',
      deadline: '2026-09-01',
      createdAt: '2025-10-01',
      status: 'active',
      color: '#4CAEFF',
      deposits: [
        { id: 'd1', amount: 1000, currency: 'PLN', date: '2025-10-25', note: 'First', who: 'Kacper' },
        { id: 'd2', amount: 500, currency: 'PLN', date: '2025-11-25', note: '', who: 'Anna' },
      ],
    },
  ],
}));

vi.mock('../utils/currency', () => ({
  getPLNAmount: ({ amount, currency }) => {
    const rates = { PLN: 1, EUR: 4.5, USD: 4.2 };
    return amount * (rates[currency] || 1);
  },
}));

vi.mock('../utils/period', () => ({
  TODAY: '2026-04-07',
}));

import { useGoalsState } from '../hooks/useGoalsState';

describe('useGoalsState', () => {
  it('should initialize with seed goals', () => {
    const { result } = renderHook(() => useGoalsState());
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].name).toBe('Vacation');
  });

  it('should calculate goal saved amount correctly', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = result.current.goals[0];
    const saved = result.current.getGoalSaved(goal);
    expect(saved).toBe(1500); // 1000 + 500
  });

  it('should calculate goal percentage correctly', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = result.current.goals[0];
    const pct = result.current.getGoalPct(goal);
    expect(pct).toBe(15); // (1500 / 10000) * 100 = 15
  });

  it('should cap percentage at 100', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = { ...result.current.goals[0], target: 1000 };
    const pct = result.current.getGoalPct(goal);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it('should calculate months left correctly', () => {
    const { result } = renderHook(() => useGoalsState());
    const monthsLeft = result.current.getMonthsLeft('2027-04-07');
    expect(monthsLeft).toBe(12);
  });

  it('should return 0 months for past deadline', () => {
    const { result } = renderHook(() => useGoalsState());
    const monthsLeft = result.current.getMonthsLeft('2025-04-07');
    expect(monthsLeft).toBe(0);
  });

  it('should return null for missing deadline', () => {
    const { result } = renderHook(() => useGoalsState());
    const monthsLeft = result.current.getMonthsLeft(null);
    expect(monthsLeft).toBeNull();
  });

  it('should calculate monthly needed amount', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = result.current.goals[0];
    const monthlyNeeded = result.current.getMonthlyNeeded(goal);
    expect(typeof monthlyNeeded).toBe('number');
    expect(monthlyNeeded).toBeGreaterThan(0);
  });

  it('should return null for monthly needed when no deadline', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = { ...result.current.goals[0], deadline: null };
    const monthlyNeeded = result.current.getMonthlyNeeded(goal);
    expect(monthlyNeeded).toBeNull();
  });

  it('should estimate completion date based on average deposit', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = result.current.goals[0];
    const estimated = result.current.getEstimatedDone(goal);
    expect(estimated).toMatch(/^\d{4}-\d{2}$/); // YYYY-MM format
  });

  it('should return null for estimated done with insufficient deposits', () => {
    const { result } = renderHook(() => useGoalsState());
    const goal = { ...result.current.goals[0], deposits: [result.current.goals[0].deposits[0]] };
    const estimated = result.current.getEstimatedDone(goal);
    expect(estimated).toBeNull();
  });

  it('should save new goal', () => {
    const { result } = renderHook(() => useGoalsState());
    const initialLength = result.current.goals.length;

    act(() => {
      result.current.saveGoal({
        id: 'g2',
        name: 'New Goal',
        type: 'savings',
        target: 5000,
        currency: 'PLN',
        deadline: '2026-12-31',
        createdAt: '2026-04-07',
        status: 'active',
        color: '#FF6B6B',
        deposits: [],
      });
    });

    expect(result.current.goals).toHaveLength(initialLength + 1);
    expect(result.current.goals.find(g => g.id === 'g2')).toBeDefined();
  });

  it('should update existing goal', () => {
    const { result } = renderHook(() => useGoalsState());

    act(() => {
      result.current.saveGoal({
        ...result.current.goals[0],
        name: 'Updated Goal',
      });
    });

    expect(result.current.goals[0].name).toBe('Updated Goal');
    expect(result.current.goals).toHaveLength(1);
  });

  it('should delete goal', () => {
    const { result } = renderHook(() => useGoalsState());
    const goalId = result.current.goals[0].id;
    const initialLength = result.current.goals.length;

    act(() => {
      result.current.deleteGoal(goalId);
    });

    expect(result.current.goals).toHaveLength(initialLength - 1);
    expect(result.current.goals.find(g => g.id === goalId)).toBeUndefined();
  });
});
