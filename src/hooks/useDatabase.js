import { useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * useDatabase Hook
 *
 * Provides methods for syncing transactions and goals with Supabase.
 * Handles CRUD operations for both local and remote data.
 *
 * Usage:
 * const {
 *   syncing,
 *   error,
 *   fetchTransactions,
 *   addTransaction,
 *   updateTransaction,
 *   deleteTransaction,
 *   fetchGoals,
 *   saveGoal,
 *   deleteGoal
 * } = useDatabase(userId);
 */

export function useDatabase(userId) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // ── TRANSACTIONS ──

  const fetchTransactions = useCallback(async () => {
    if (!userId) return null;

    setSyncing(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  const addTransaction = useCallback(
    async (tx) => {
      if (!userId) return null;

      setSyncing(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: userId,
              description: tx.desc,
              amount: tx.amount,
              category: tx.cat,
              type: tx.type,
              currency: tx.currency,
              date: tx.date,
              person: tx.who,
            },
          ])
          .select();

        if (insertError) throw insertError;
        return data?.[0] || null;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const updateTransaction = useCallback(
    async (id, tx) => {
      if (!userId) return null;

      setSyncing(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from('transactions')
          .update({
            description: tx.desc,
            amount: tx.amount,
            category: tx.cat,
            type: tx.type,
            currency: tx.currency,
            date: tx.date,
            person: tx.who,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select();

        if (updateError) throw updateError;
        return data?.[0] || null;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const deleteTransaction = useCallback(
    async (id) => {
      if (!userId) return false;

      setSyncing(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  // ── GOALS ──

  const fetchGoals = useCallback(async () => {
    if (!userId) return null;

    setSyncing(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('goals')
        .select(
          `
          *,
          deposits (*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [userId]);

  const saveGoal = useCallback(
    async (goal) => {
      if (!userId) return null;

      setSyncing(true);
      setError(null);

      try {
        const isNew = !goal.id || goal.id.startsWith('temp_');
        const goalData = {
          user_id: userId,
          name: goal.name,
          type: goal.type,
          target: goal.target,
          currency: goal.currency,
          deadline: goal.deadline || null,
          status: goal.status,
          color: goal.color,
        };

        let result;

        if (isNew) {
          const { data, error: insertError } = await supabase
            .from('goals')
            .insert([goalData])
            .select();

          if (insertError) throw insertError;
          result = data?.[0] || null;
        } else {
          const { data, error: updateError } = await supabase
            .from('goals')
            .update({
              ...goalData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', goal.id)
            .eq('user_id', userId)
            .select();

          if (updateError) throw updateError;
          result = data?.[0] || null;
        }

        return result;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const deleteGoal = useCallback(
    async (goalId) => {
      if (!userId) return false;

      setSyncing(true);
      setError(null);

      try {
        // Delete deposits first
        await supabase
          .from('deposits')
          .delete()
          .eq('goal_id', goalId);

        // Delete goal
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
        return true;
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  const addDeposit = useCallback(
    async (goalId, deposit) => {
      if (!userId) return null;

      setSyncing(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from('deposits')
          .insert([
            {
              goal_id: goalId,
              amount: deposit.amount,
              currency: deposit.currency,
              date: deposit.date,
              note: deposit.note || '',
              person: deposit.who,
            },
          ])
          .select();

        if (insertError) throw insertError;
        return data?.[0] || null;
      } catch (err) {
        setError(err.message);
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [userId]
  );

  return {
    syncing,
    error,
    // Transactions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    // Goals
    fetchGoals,
    saveGoal,
    deleteGoal,
    addDeposit,
  };
}
