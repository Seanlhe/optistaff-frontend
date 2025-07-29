/**
 * Payouts Hook
 * @description Simplified hook focused on weekly earnings calculation
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

// Interface for payout records returned by get_user_payouts_by_time_range
interface PayoutTimeRangeRecord {
  payout_id: string;
  assignment_id: string;
  amount: number;
  payout_date: string;
  assignment_start_time: string;
  assignment_end_time: string;
  shift_title: string;
  status?: string; // Assignment status from assignments table
}

// Define statuses that should be excluded from earnings calculation
// These match the status.name values in your database
const EXCLUDED_STATUSES = ['cancel_by_employer', 'cancel_by_employee', 'no_show'];

export const usePayouts = () => {
  // Get user context
  const { user } = useAuth();

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

      // Call Supabase function to get payout records for this week
      const { data, error } = await supabase.rpc('get_user_payouts_by_time_range', {
        p_user_id: user.id,
        p_start_time: format(weekStart, 'yyyy-MM-dd'),
        p_end_time: format(weekEnd, 'yyyy-MM-dd')
      });

      console.log('usePayouts: RPC call result:', { data, error });

      if (error) {
        console.error('usePayouts: Error calculating weekly pay:', error);
        return 0;
      }

      // Handle the RPC function returning an array of payout records
      let weeklyEarnings = 0;
      if (Array.isArray(data) && data.length > 0) {
        // Filter out cancelled assignments if status information is available
        const validPayouts = (data as PayoutTimeRangeRecord[]).filter(payout => {
          // Only filter if status is available from backend
          if (!payout.status) {
            return true; // Include all payouts if status is not available
          }
          
          const status = payout.status.toLowerCase();
          const isExcluded = EXCLUDED_STATUSES.includes(status);
          
          if (isExcluded) {
            console.log(`usePayouts: Excluding payout for ${payout.shift_title} with status: ${status}`);
            return false;
          }
          return true;
        });

        weeklyEarnings = validPayouts.reduce((total, payout) => {
          const amount = Number(payout.amount) || 0;
          return total + amount;
        }, 0);

        console.log('usePayouts: Calculated total from', validPayouts.length, 'valid payout records');
        console.log('usePayouts: Valid payouts:', validPayouts.map(p => ({ 
          amount: p.amount, 
          title: p.shift_title,
          status: p.status || 'status_not_available'
        })));
        
        if (data.length !== validPayouts.length) {
          console.log(`usePayouts: Excluded ${data.length - validPayouts.length} cancelled assignments from earnings`);
        }
      } else {
        console.log('usePayouts: No payout records found for this week');
        weeklyEarnings = 0;
      }

      console.log('usePayouts: Processed earnings value:', weeklyEarnings);
      console.log('usePayouts: Returning data:', weeklyEarnings);
      return weeklyEarnings;
    } catch (err) {
      console.error('usePayouts: Error in getEstimatedWeeklyPay:', err);
      return 0;
    }
  }, [user?.id]);

  // Return only what's actually needed
  return {
    getEstimatedWeeklyPay,
  };
};