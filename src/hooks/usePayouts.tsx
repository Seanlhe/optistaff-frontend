/**
 * Payouts Hook
 * @description Custom hook for payout and payment management
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Payout } from '../types/hooks';
import { supabase } from '../integrations/supabase/client';

export const usePayouts = () => {
  // State management
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Get user context
  const { user } = useAuth();

  // Retrieve all payout records for the current user from the database
  const fetchPayouts = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch payouts when user is available
  useEffect(() => {
    if (user?.id) {
      fetchPayouts();
    }
  }, [user?.id, fetchPayouts]);

  // Create a new payout request for a specific period
  const requestPayout = async (payoutData: Partial<Payout>) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }
    
    if (!payoutData.start_period || !payoutData.end_period) {
      setError('Start and end periods are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate earnings for the period using database function
      const { data: calculatedAmount, error: calcError } = await supabase
        .rpc('calculate_user_payout', {
          target_user_id: user.id,
          period_start: payoutData.start_period,
          period_end: payoutData.end_period
        });

      if (calcError) throw calcError;
      
      if (!calculatedAmount || calculatedAmount <= 0) {
        setError('No earnings found for the specified period');
        return;
      }

      // Create payout record
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          user_id: user.id,
          amount: calculatedAmount,
          start_period: payoutData.start_period,
          end_period: payoutData.end_period
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update local state with new payout
      setPayouts(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request payout');
    } finally {
      setLoading(false);
    }
  };

  // Update payout status (primarily for admin use or status tracking)
  const processPayout = async (payoutId: string) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'processing' })
        .eq('payout_id', payoutId)
        .eq('user_id', user.id) // Ensure user can only update their own payouts
        .select()
        .single();

      if (error) throw error;
      
      // Update local state
      setPayouts(prev => 
        prev.map(payout => 
          payout.payout_id === payoutId ? { ...payout, status: 'processing' } : payout
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  // Alias for fetchPayouts to get payout history
  const getPayoutHistory = useCallback(async () => {
    await fetchPayouts();
  }, [fetchPayouts]);

  // Calculate total earnings from all payouts
  const getTotalEarnings = useCallback(() => {
    return payouts.reduce((total, payout) => total + payout.amount, 0);
  }, [payouts]);

    // Return interface
  return {
    payouts,
    loading,
    error,
    fetchPayouts,
    requestPayout,
    processPayout,
    getPayoutHistory,
    getTotalEarnings,
  };
};
