
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export const usePayouts = () => {
  // Get user context
  const { user } = useAuth();

  // Calculate estimated weekly pay - ALTERNATIVE approach
  const getEstimatedWeeklyPay = useCallback(async (): Promise<number> => {
    if (!user?.id) {
      return 0;
    }

    try {
      // Get current week boundaries (Monday to Sunday)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      console.log('Week boundaries:', {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd')
      });

      // Get completed assignments using earnings breakdown
      const { data: completedEarnings, error: completedError } = await supabase.rpc(
        'get_earnings_breakdown',
        {
          target_user_id: user.id,
          period_start: format(weekStart, 'yyyy-MM-dd'),
          period_end: format(weekEnd, 'yyyy-MM-dd')
        }
      );

      // Get upcoming assignments (this works as expected)
      const { data: upcomingEstimates, error: upcomingError } = await supabase.rpc(
        'get_estimated_pay_for_upcoming_assignments',
        {
          p_user_id: user.id,
          p_start_date: format(weekStart, 'yyyy-MM-dd'),
          p_end_date: format(weekEnd, 'yyyy-MM-dd')
        }
      );

      if (completedError || upcomingError) {
        console.error('Errors getting earnings:', { completedError, upcomingError });
        return 0;
      }

      // Calculate totals
      const completedTotal = Array.isArray(completedEarnings) 
        ? completedEarnings.reduce((sum, earning) => sum + (Number(earning.total_earned) || 0), 0)
        : 0;

      const upcomingTotal = Array.isArray(upcomingEstimates) 
        ? upcomingEstimates.reduce((sum, assignment) => sum + (Number(assignment.estimated_pay) || 0), 0)
        : 0;

      const totalEarnings = completedTotal + upcomingTotal;

      console.log('Earnings breakdown:', {
        completedTotal,
        upcomingTotal,
        totalEarnings,
        completedCount: Array.isArray(completedEarnings) ? completedEarnings.length : 0,
        upcomingCount: Array.isArray(upcomingEstimates) ? upcomingEstimates.length : 0
      });

      return totalEarnings;

    } catch (err) {
      console.error('Error in getEstimatedWeeklyPay:', err);
      return 0;
    }
  }, [user?.id]);

  // Return only what you need
  return {
    getEstimatedWeeklyPay
  };
};