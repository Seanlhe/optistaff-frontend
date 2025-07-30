/**
 * Assignments Hook
 * @description Custom hook for assignment data management
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import { Assignment, StatusEnum, WeeklyEarningSummary } from "../types/hooks";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyEarnings, setWeeklyEarnings] = useState<WeeklyEarningSummary[]>(
    [],
  );
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const { user } = useAuth();

  /**
   * Fetch assignments for the authenticated user
   * @set assignments - Sets the assignments state with fetched data
   */
  const fetchAssignments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc(
        "get_assignments_by_jobseeker",
        { p_user_id: user.id },
      );
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setAssignments(data as Assignment[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /**
   * Fetch assignments by shift ID
   * @param shiftId - The ID of the shift to fetch assignments for
   * @return {Promise<Assignment[]>} - Returns a promise that resolves to the assignments data for the specified shift
   */
  const fetchAssignmentsByShift = async (shiftId: string) => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("get_assignments_by_shift", {
        p_shift_id: shiftId,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      return data as Assignment[];
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update the status of an assignment
   *
   * @param assignmentId - The id of the assignment to update
   * @param status_name - Can be 'NoShow', 'CancelByEmployer', 'CancelByJobseeker', 'Completed', 'Upcoming' from StatusEnum
   * @returns {Promise<{updated_count: number, payout_created: boolean}>} - Returns the number of rows affected by the update and boolean indicating if a payout was created
   */
  const updateAssignmentStatus = async (
    assignmentId: string,
    status_name: Omit<StatusEnum, "Active" | "Pending" | "Confirmed">,
  ) => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("update_assignment_status", {
        p_assignment_id: assignmentId,
        p_status_name: status_name,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      console.log("Assignment status updated:", data);
      return data;
    } catch (err) {
      setError((err as Error).message);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyEarnings = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current week boundaries (Monday to Sunday)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Call the unified function
      const { data, error } = await supabase.rpc(
        "get_weekly_earnings_summary",
        {
          p_user_id: user.id,
          p_start_date: format(weekStart, "yyyy-MM-dd"),
          p_end_date: format(weekEnd, "yyyy-MM-dd"),
        },
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const assignments = (data as WeeklyEarningSummary[]) || [];
      setWeeklyEarnings(assignments);

      // Calculate weekly total
      const total = assignments.reduce((sum, assignment) => {
        return sum + (Number(assignment.calculated_pay) || 0);
      }, 0);

      setWeeklyTotal(Math.round(total * 100) / 100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWeeklyEarnings();
  }, [fetchWeeklyEarnings]);

  return {
    assignments,
    weeklyEarnings, // ADD
    weeklyTotal, // ADD
    loading,
    error,
    updateAssignmentStatus,
    fetchAssignmentsByShift,
    fetchAssignments,
    fetchWeeklyEarnings, // ADD
  };
};
