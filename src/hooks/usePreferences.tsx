/**
 * Preferences Hook
 * @description Custom hook for user preferences management
 * @author OptiStaff Team
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import { UserPreferences } from "../types/hooks";

import { usePreferencesLocation } from "./usePreferencesLocation";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    homeLocation,
    homeAddress,
    loadLocationData,
    geocodeHomeLocation,
    loading: locationLoading,
    error: locationError,
  } = usePreferencesLocation();

  // Fetch user preferences - desired_roles now stores job names directly
  // Fetch user preferences - desired_roles now stores job names directly
  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no preferences found, create default ones
        if (error.code === "PGRST116") {
          await createDefaultPreferences();
          return;
        }
        setError(error.message);
        return;
      }

      // desired_roles is now a JSONB array of job names (strings)
      setPreferences(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create default preferences for new users
  const createDefaultPreferences = useCallback(async () => {
    if (!user) return;

    const defaultPreferences: Omit<
      UserPreferences,
      "preference_id" | "created_at" | "updated_at"
    > = {
      user_id: user.id,
      min_pay_rate: 15,
      max_travel_km: 15, // More reasonable default for Singapore
      desired_roles: [], // Empty array of job names
      max_hours_per_week: 40,
      max_hours_per_shift: 8,
      consider_lower_rate: false,
    };

    try {
      const { data, error } = await supabase
        .from("preferences")
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setPreferences(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [user]);

  // Update specific preference fields
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user || !preferences) {
        setError("User not authenticated or preferences not loaded");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("preferences")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          setError(error.message);
          return false;
        }

        setPreferences(data);
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, preferences]
  );

  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return false;
    }

    const defaultPreferences: Partial<UserPreferences> = {
      min_pay_rate: 15,
      max_travel_km: 15, // More reasonable default for Singapore
      desired_roles: [], // Empty array of job names
      max_hours_per_week: 40,
      max_hours_per_shift: 8,
      consider_lower_rate: false,
    };

    return await updatePreferences(defaultPreferences);
  }, [user, updatePreferences]);

  // Helper to check if user has specific job preference
  const hasJobPreference = useCallback(
    (jobTypeName: string): boolean => {
      return preferences?.desired_roles.includes(jobTypeName) || false;
    },
    [preferences]
  );

  // Helper to get preferred job types
  const getPreferredJobTypes = useCallback(() => {
    if (!preferences) return [];
    return preferences.desired_roles;
  }, [preferences]);

  // Load preferences on mount or user change
  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user, fetchPreferences]);

  return {
    // Data
    preferences,

    // State
    loading: loading || locationLoading,
    error: error || locationError,

    // Actions
    fetchPreferences,
    updatePreferences,
    resetPreferences,
    createDefaultPreferences,

    // Helpers
    hasJobPreference,
    getPreferredJobTypes,

    // Location-related properties and methods (from usePreferencesLocation)
    homeLocation,
    homeAddress,
    loadLocationData,
    geocodeHomeLocation,
  };
};
