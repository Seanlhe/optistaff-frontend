/**
 * useAvailability Hook
 *
 * Purpose: To allow job seekers to indicate the specific times they are
 * available to work for the scheduling cycles.
 *
 * Core Functions:
 * - getAvailability(cycle): Fetches the user's availability for a given
 *   scheduling cycle ('PRIMARY' or 'SECONDARY')
 * - setAvailability(timeBlocks): Saves a new set of availability windows
 *   to the database, including the submission_cycle
 *
 * Related Tables: Manages records in the public.availability table
 */

// This hook will manage job seeker availability windows for shift scheduling
import { useState, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./useAuth";
import { TimeBlock } from "../types/hooks";

export const useAvailability = () => {
  // Get the currently authenticated user and auth loading state
  const { user, loading: authLoading } = useAuth();
  // const user = { id: "5338ab04-7955-4a16-89d5-e9aee541d343" }; // TESTING ONLY

  // State to indicate loading state of different operations
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  // State to capture any errors during async calls
  const [error, setError] = useState<string | null>(null);

  // Fetch availability for a given cycle
  const getAvailability = useCallback(
    async (cycle: "PRIMARY" | "SECONDARY") => {
      setFetchLoading(true);
      setError(null);

      // Wait for auth to complete first - FIX FOR RACE CONDITION
      if (authLoading) {
        setFetchLoading(false);
        return [];
      }

      // Check if user is authenticated
      if (!user) {
        setFetchLoading(false);
        setError("User not authenticated");
        return [];
      }

      // Query the availability table for entries matching user and cycle
      const { data, error: supaError } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", user.id)
        .eq("submission_cycle", cycle);

      setFetchLoading(false);

      // Handle any errors from Supabase
      if (supaError) {
        setError(supaError.message);
        return [];
      }

      // Return the fetched availability records
      return data as TimeBlock[];
    },
    [user, authLoading],
  ); // Dependencies: user and authLoading

  // Save new set of availability windows
  const setAvailability = useCallback(
    async (
      timeBlocks: {
        start_time: string;
        end_time: string;
        submission_cycle: "PRIMARY" | "SECONDARY";
      }[],
      cycle: "PRIMARY" | "SECONDARY",
    ) => {
      setSaveLoading(true);
      setError(null);

      if (authLoading) {
        setSaveLoading(false);
        return false;
      }

      if (!user) {
        setSaveLoading(false);
        setError("User not authenticated");
        return false;
      }

      // ✅ Always delete existing availability for this user + cycle
      const { error: deleteError } = await supabase
        .from("availability")
        .delete()
        .eq("user_id", user.id)
        .eq("submission_cycle", cycle);

      if (deleteError) {
        setSaveLoading(false);
        setError(`Error deleting availability: ${deleteError.message}`);
        return false;
      }

      // Map timeBlocks to include user_id and computed day_of_week
      const blocksWithUserAndDay = timeBlocks.map((tb) => {
        const startDate = new Date(tb.start_time);
        const jsDay = startDate.getUTCDay(); // Sunday = 0, Monday = 1, ...
        const isoDay = jsDay === 0 ? 7 : jsDay; // Convert to ISO (1 = Monday, 7 = Sunday)

        return {
          ...tb,
          user_id: user.id,
          day_of_week: isoDay,
        };
      });

      // Only insert new time blocks if not empty
      if (timeBlocks.length > 0) {
        const { error: insertError } = await supabase
          .from("availability")
          .insert(blocksWithUserAndDay);

        if (insertError) {
          setSaveLoading(false);
          setError(`Error inserting availability: ${insertError.message}`);
          return false;
        }
      }

      setSaveLoading(false);
      return true;
    },
    [supabase, user, authLoading, setSaveLoading, setError],
  );

  // Return the functions and state to the component using this hook
  return {
    getAvailability,
    setAvailability,
    fetchLoading,
    saveLoading,
    loading: fetchLoading || saveLoading || authLoading, // Combined loading state for convenience
    error,
  };
};
