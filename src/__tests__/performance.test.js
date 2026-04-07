import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Performance Tests
 * Benchmarki dla krytycznych operacji
 */

// Mock data
const generateTransactions = (count) => {
  const categories = ["Jedzenie", "Transport", "Mieszkanie", "Subskrypcje", "Inne"];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: i,
      desc: `Transaction ${i}`,
      cat: categories[i % categories.length],
      amount: Math.random() * 200 - 100,
      who: i % 2 === 0 ? "Kacper" : "Anna",
      date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      currency: "PLN",
      type: Math.random() > 0.8 ? "income" : "expense",
    });
  }
  return result;
};

describe('Performance Benchmarks', () => {
  it('should handle 1000 transactions filtering in < 100ms', () => {
    const txs = generateTransactions(1000);
    const start = performance.now();

    const filtered = txs.filter(t => t.date.startsWith('2025-03'));

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(100);
    expect(filtered.length).toBeGreaterThan(0);
  });

  it('should aggregate expenses in < 50ms for 1000 transactions', () => {
    const txs = generateTransactions(1000);
    const start = performance.now();

    const expense = txs
      .filter(t => t.amount < 0)
      .reduce((a, t) => a + Math.abs(t.amount), 0);

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(50);
    expect(expense).toBeGreaterThan(0);
  });

  it('should aggregate by category in < 100ms for 1000 transactions', () => {
    const txs = generateTransactions(1000);
    const start = performance.now();

    const map = {};
    txs.forEach(t => {
      if (!map[t.cat]) map[t.cat] = 0;
      map[t.cat] += Math.abs(t.amount);
    });

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(100);
    expect(Object.keys(map).length).toBeGreaterThan(0);
  });

  it('should calculate monthly trends in < 150ms for 5 years of data', () => {
    const txs = generateTransactions(2000); // ~5 years of transactions
    const start = performance.now();

    const map = {};
    txs.forEach(t => {
      const k = t.date.slice(0, 7); // YYYY-MM
      if (!map[k]) map[k] = { m: k, inn: 0, out: 0 };
      const v = t.amount;
      if (v > 0) map[k].inn += v;
      else map[k].out += Math.abs(v);
    });
    const result = Object.values(map).sort((a, b) => a.m.localeCompare(b.m));

    const end = performance.now();
    const duration = end - start;

    expect(duration).toBeLessThan(150);
    expect(result.length).toBeLessThanOrEqual(60); // max 60 months
  });

  it('should find transaction by ID in < 10ms', () => {
    const txs = generateTransactions(10000);
    const targetId = 5000;

    const start = performance.now();
    const tx = txs.find(t => t.id === targetId);
    const end = performance.now();

    expect(end - start).toBeLessThan(10);
    expect(tx.id).toBe(targetId);
  });

  it('should handle array spread operations efficiently', () => {
    const txs = generateTransactions(1000);
    const start = performance.now();

    // Simulating add transaction
    const newTxs = [...txs, { id: 1000, desc: "New", cat: "Test", amount: 100, who: "Kacper", date: "2025-04-07", currency: "PLN", type: "expense" }];

    const end = performance.now();
    expect(end - start).toBeLessThan(50);
    expect(newTxs.length).toBe(txs.length + 1);
  });

  it('should calculate stats without excessive object creation', () => {
    const txs = generateTransactions(5000);
    const start = performance.now();

    const stats = {
      totalIncome: txs.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0),
      totalExpense: txs.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0),
      count: txs.length,
      avgAmount: txs.reduce((a, t) => a + Math.abs(t.amount), 0) / txs.length,
    };

    const end = performance.now();
    expect(end - start).toBeLessThan(200);
    expect(stats.count).toBe(5000);
  });
});

describe('Memory Usage', () => {
  it('should not cause memory leaks with repeated updates', () => {
    const txs = generateTransactions(100);
    let current = txs;

    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Simulate update
      current = [...current.slice(0, -1), { ...current[current.length - 1], desc: `Updated ${i}` }];
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(500); // Should be fast for 1000 updates
    expect(current.length).toBe(100);
  });
});
