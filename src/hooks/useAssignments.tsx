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

  // TODO: Implement assignment management functions
  const fetchAssignments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_assignment_by_jobseeker', { p_user_id: user.id });
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

  const createAssignment = async (assignmentData: Partial<Assignment>) => {
    // Implementation to be added
  };

  const updateAssignment = async (assignmentId: string, assignmentData: Partial<Assignment>) => {
    // Implementation to be added
  };


  /**
   * Update the status of an assignment
   *
   * @param assignmentId - The id of the assignment to update
   * @param status_name - use cancel_by_empoyer or cancel_by_employee or confirmed
   * @returns affected rows count
   */
  const cancelAssignment = async (assignmentId: string, status_name: Status ) => {
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('update_assignment_status', { p_assignment_id: assignmentId, p_status_name: status_name });
      console.log('Assignment status updated:', data);
      if (error) {
        console.error('Error updating assignment status:', error);
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
    cancelAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    fetchAssignments,
  };
};
