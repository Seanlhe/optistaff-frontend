/**
 * Shifts Hook
 * @description Custom hook for shift data management
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import { Shift } from "../types/hooks";

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchShifts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch shifts from the database
      const { data, error } = await supabase.rpc("get_shifts_by_employer", {
        p_employer_id: user.id,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const shiftsWithDates = data.map((shift: Shift) => ({
        ...shift, // Keep all other fields intact
        start_time: new Date(shift.start_time), // Convert start_time to a Date object
        end_time: new Date(shift.end_time), // Convert end_time to a Date object (if needed)
      }));
      setShifts(shiftsWithDates as Shift[]);
      return data as Shift[];
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (
    shift_data: Omit<
      Shift,
      | "shift_id"
      | "created_at"
      | "status"
      | "staff_assigned"
      | "employer_name"
      | "submission_cycle"
      | "company_name"
    >,
  ) => {
    // Create shift implementation will go here
    setLoading(true);
    setError(null);
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const { start_time, end_time, ...otherShiftData } = shift_data;
    const new_shift = {
      p_employer_id: user.id,
      ...otherShiftData,
      p_start_time: start_time.toISOString(),
      p_end_time: end_time.toISOString(),
    };

    const { data, error } = await supabase.rpc("create_shift", {
      ...new_shift,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Optionally, you can refetch shifts after creating a new one
    await fetchShifts();

    setLoading(false);
    return data;
  };

  const updateShift = async (
    shift_data: Omit<
      Shift,
      | "employer_name"
      | "company_name"
      | "job_type"
      | "staff_assigned"
      | "submission_cycle"
      | "status"
      | "created_at"
    >,
  ) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const {
      shift_id,
      job_title,
      postal_code,
      job_location,
      job_description,
      job_requirements,
      pay_rate,
      start_time,
      end_time,
      break_duration,
      staff_needed,
    } = shift_data;

    const { error } = await supabase.rpc("update_shift", {
      p_shift_id: shift_id,
      p_job_title: job_title,
      p_job_location: job_location,
      p_job_description: job_description,
      p_job_requirements: job_requirements,
      p_start_time: start_time.toISOString(),
      p_end_time: end_time.toISOString(),
      p_postal_code: postal_code,
      p_pay_rate: pay_rate,
      p_break_duration: break_duration,
      p_staff_needed: staff_needed,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await fetchShifts();
    setLoading(false);
  };

  const deleteShift = async (shift_id: string) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("shifts")
      .delete()
      .eq("shift_id", shift_id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await fetchShifts();
    setLoading(false);
  };

  return {
    shifts,
    loading,
    error,
    createShift,
    updateShift,
    deleteShift,
  };
};
