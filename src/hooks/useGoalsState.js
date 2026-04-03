import { useState, useMemo } from 'react';
import { seedGoals } from '../data/seedGoals';
import { getPLNAmount } from '../utils/currency';
import { TODAY } from '../utils/period';

export function useGoalsState() {
  const [goals, setGoals] = useState(seedGoals);

  const getGoalSaved = (g) => {
    return g.deposits.reduce((a, d) => a + getPLNAmount({ amount: d.amount, currency: d.currency }), 0);
  };

  const getGoalPct = (g) => {
    return Math.min(100, Math.round((getGoalSaved(g) / g.target) * 100));
  };

  const getMonthsLeft = (deadline) => {
    if (!deadline) return null;
    const d = new Date(deadline), now = new Date(TODAY);
    return Math.max(0, (d.getFullYear()-now.getFullYear())*12 + d.getMonth()-now.getMonth());
  };

  const getMonthlyNeeded = (g) => {
    const ml = getMonthsLeft(g.deadline);
    if (!ml) return null;
    const remaining = Math.max(0, g.target - getGoalSaved(g));
    return ml > 0 ? Math.ceil(remaining / ml) : null;
  };

  const getEstimatedDone = (g) => {
    const getAvgMonthlyDeposit = () => {
      if (g.deposits.length < 2) return null;
      const sorted = [...g.deposits].sort((a,b)=>a.date.localeCompare(b.date));
      const firstDate = new Date(sorted[0].date), lastDate = new Date(sorted[sorted.length-1].date);
      const months = Math.max(1, (lastDate.getFullYear()-firstDate.getFullYear())*12 + lastDate.getMonth()-firstDate.getMonth());
      return Math.round(getGoalSaved(g) / months);
    };

    const avg = getAvgMonthlyDeposit();
    if (!avg || avg <= 0) return null;
    const remaining = Math.max(0, g.target - getGoalSaved(g));
    const months = Math.ceil(remaining / avg);
    const d = new Date(TODAY);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0,7);
  };

  const saveGoal = (goal) => {
    setGoals(prev => prev.some(g=>g.id===goal.id)
      ? prev.map(g=>g.id===goal.id?goal:g)
      : [...prev, goal]
    );
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g=>g.id!==id));
  };

  return {
    goals,
    getGoalSaved,
    getGoalPct,
    getMonthlyNeeded,
    getEstimatedDone,
    saveGoal,
    deleteGoal,
  };
}
