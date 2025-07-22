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
      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("client_id", user.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setShifts(data as Shift[]);
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
      "shift_id" | "created_at" | "status" | "staff_assigned"
    >
  ) => {
    // Create shift implementation will go here
    setLoading(true);
    setError(null);
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const { error } = await supabase.rpc("create_shift", {
      ...shift_data,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Optionally, you can refetch shifts after creating a new one
    await fetchShifts();

    setLoading(false);
  };

  const updateShift = async (shift_id: string, shift_data: Partial<Shift>) => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("shifts")
      .update(shift_data)
      .eq("shift_id", shift_id);

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
