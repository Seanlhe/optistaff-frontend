/**
 * Assignments Hook
 * @description Custom hook for assignment data management
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { Assignment, Status } from '../types/hooks'; // Assuming you have defined Assignment type in hooks.ts


export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Fetch assignments for the authenticated user
   * @set assignments - Sets the assignments state with fetched data
   * @return {Promise<Assignment[]>} - Returns a promise that resolves to the assignments data
   */
  const fetchAssignments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_assignments_by_jobseeker', { p_user_id: user.id });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setAssignments(data as Assignment[]);
      return data as Assignment[];
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const createAssignment = async (assignmentData: Partial<Assignment>) => {
    // Implementation to be added
  };

  const updateAssignment = async (assignmentId: string, assignmentData: Partial<Assignment>) => {
    // Implementation to be added
  };


  /** * Fetch assignments by shift ID
   * @param shiftId - The ID of the shift to fetch assignments for
   * @return {Promise<Assignment[]>} - Returns a promise that resolves to the assignments data for the specified shift
   */
  const fetchAssignmentsByShift = async (shiftId: string) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_assignments_by_shift', { p_shift_id: shiftId });
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
   * @param status_name - use cancel_by_empoyer or cancel_by_employee or confirmed
   * @returns affected rows count
   */
  const updateAssignmentStatus = async (assignmentId: string, status_name: Status ) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('update_assignment_status', { p_assignment_id: assignmentId, p_status_name: status_name });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      return data;
    } catch (err) {
      setError((err as Error).message);
      return 0;
    } finally {
      setLoading(false);
    }
  }


  const deleteAssignment = async (assignmentId: string, p_status_name) => {
  };

  return {
    assignments,
    loading,
    error,
    cancelAssignment: updateAssignmentStatus,
    fetchAssignmentsByShift,
    updateAssignment,
    fetchAssignments,
  };
};
