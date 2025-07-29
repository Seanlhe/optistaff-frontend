/**
 * Payouts Hook
 * @description Custom hook for payout and payment management
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Payout } from '../types/hooks';
import { supabase } from '../integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const usePayouts = () => {
  // State management
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Get user context
  const { user } = useAuth();

  // Retrieve all payout records for the current user using RPC
  const fetchPayouts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('fetch_user_payouts', { target_user_id: user.id });
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

  // Create a new payout request for a specific period using RPC
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
      // Use RPC to calculate and create payouts for the period
      const { data, error } = await supabase.rpc('request_user_payout_for_period', {
        target_user_id: user.id,
        period_start: payoutData.start_period,
        period_end: payoutData.end_period
      });
      if (error) throw error;
      // Refresh payouts after request
      await fetchPayouts();
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

  // Calculate estimated weekly pay using Supabase function
  const getEstimatedWeeklyPay = useCallback(async () => {
    console.log('usePayouts: getEstimatedWeeklyPay called');
    console.log('usePayouts: user?.id:', user?.id);
    
    if (!user?.id) {
      console.log('usePayouts: No user ID, returning 0');
      return 0;
    }

    try {
      // Get current week boundaries (Monday to Sunday)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      console.log('usePayouts: Week boundaries:', {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        now: now.toISOString()
      });

      // Call Supabase function to calculate earnings for this week
      const { data, error } = await supabase.rpc('calculate_user_payout', {
        target_user_id: user.id,
        period_start: format(weekStart, 'yyyy-MM-dd'),
        period_end: format(weekEnd, 'yyyy-MM-dd')
      });

      console.log('usePayouts: RPC call result:', { data, error });

      if (error) {
        console.error('usePayouts: Error calculating weekly pay:', error);
        return 0;
      }

      console.log('usePayouts: Returning data:', data || 0);
      return data || 0;
    } catch (err) {
      console.error('usePayouts: Error in getEstimatedWeeklyPay:', err);
      return 0;
    }
  }, [user?.id]);

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
    getEstimatedWeeklyPay,
  };
};