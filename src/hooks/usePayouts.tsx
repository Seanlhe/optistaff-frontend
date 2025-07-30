/**
 * usePayouts Hook - UPDATED for unified function
 * @description Uses single get_weekly_earnings_summary function
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

// Type definition matching the SQL function return
interface WeeklyEarningSummary {
  assignment_id: string;
  shift_id: string;
  shift_title: string;
  shift_start_time: string;
  shift_end_time: string;
  break_hours: number;
  pay_rate: number;
  scheduled_hours: number;
  calculated_pay: number;
  shift_date: string;
  assignment_status: string;
  is_completed: boolean;
}

export const usePayouts = () => {
  const { user } = useAuth();

  const getEstimatedWeeklyPay = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      return 0;
    }

    try {
      // Get current week boundaries (Monday to Sunday)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Call the unified function
      const { data, error } = await supabase.rpc('get_weekly_earnings_summary', {
        p_user_id: user.id,
        p_start_date: format(weekStart, 'yyyy-MM-dd'),
        p_end_date: format(weekEnd, 'yyyy-MM-dd')
      });

      if (error) {
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Type the data and calculate total
      const assignments = data as WeeklyEarningSummary[];
      const totalEarnings = assignments.reduce((sum, assignment) => {
        return sum + (Number(assignment.calculated_pay) || 0);
      }, 0);

      // Round to 2 decimal places
      return Math.round(totalEarnings * 100) / 100;

    } catch (err) {
      return 0;
    }
  }, [user?.id]);

  return {
    getEstimatedWeeklyPay
  };
};