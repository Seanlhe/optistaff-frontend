/**
 * usePayouts Hook
 * @description Custom hook for actual payout data management (real money from payouts table)
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

export const usePayouts = () => {
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Get total earnings from actual payouts (all time)
   * @sets totalEarnings - Sets the total earnings state from payouts table
   */
  const fetchTotalEarnings = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc(
        'get_user_total_earnings',
        {
          target_user_id: user.id
        }
      );

      if (error) {
        setError(error.message);
        return;
      }

      setTotalEarnings(Number(data) || 0);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load total earnings on mount
  useEffect(() => {
    fetchTotalEarnings();
  }, [fetchTotalEarnings]);

  return {
    // State
    totalEarnings,
    loading,
    error,

    // Methods
    fetchTotalEarnings,
  };
};