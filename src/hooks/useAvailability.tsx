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

// TODO: Implement useAvailability hook
// This hook will manage job seeker availability windows for shift scheduling

import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TimeBlock {
  id?: string;
  user_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  submission_cycle: 'PRIMARY' | 'SECONDARY'; // Scheduling cycle
}

export const useAvailability = () => {

  // Get the currently authenticated user
  const { user } = useAuth();
  // const user = { id: "5338ab04-7955-4a16-89d5-e9aee541d343" }; // TESTING ONLY

  // State to indicate loading state of async operations
  const [loading, setLoading] = useState(false);
  // State to capture any errors during async calls
  const [error, setError] = useState<string | null>(null);

  // Fetch availability for a given cycle
  const getAvailability = async (cycle: 'PRIMARY' | 'SECONDARY'): Promise<TimeBlock[]> => {
    setLoading(true);
    setError(null);

    // Check if user is authenticated
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return [];
    }

    // Query the availability table for entries matching user and cycle
    const { data, error: supaError } = await supabase
      .from('availability')
      .select('*')
      .eq('user_id', user.id)
      .eq('submission_cycle', cycle);

      
    setLoading(false);

    // Handle any errors from Supabase
    if (supaError) {
      setError(supaError.message);
      return [];
    }

    // Return the fetched availability records
    return data as TimeBlock[];
  };

  // Save new set of availability windows
  const setAvailability = async (
    timeBlocks: Omit<TimeBlock, 'user_id'>[]
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Check if user is authenticated
    if (!user) {
      setLoading(false);
      setError('User not authenticated');
      return false;
    }

    // Determine which cycles are present in the new timeBlocks
    const cycles = [...new Set(timeBlocks.map(tb => tb.submission_cycle))];

     // Remove previous records for this user & cycle
    for (const cycle of cycles) {
      await supabase
        .from('availability')
        .delete()
        .eq('user_id', user.id)
        .eq('submission_cycle', cycle);
    }

    // Insert new records
    const blocksWithUser = timeBlocks.map(tb => ({
      ...tb,
      user_id: user.id,
    }));

    // Insert the new time blocks
    const { error: supaError } = await supabase
      .from('availability')
      .insert(blocksWithUser);

    setLoading(false);

    // Handle errors from Supabase insert
    if (supaError) {
      setError(supaError.message);
      return false;
    }
    return true;
  };

  // Return the functions and state to the component using this hook
  return {
    getAvailability,
    setAvailability,
    loading,
    error,
  };
};