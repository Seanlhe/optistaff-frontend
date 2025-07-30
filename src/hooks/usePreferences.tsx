/**
 * Preferences Hook
 * @description Custom hook for user preferences management with database function integration
 * @author OptiStaff Team
 * @updated Uses create_default_preferences database function for consistent default creation
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

  // Create default preferences for new users using database function
  const createDefaultPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("create_default_preferences", {
        p_user_id: user.id,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Database function returns an array, get the first (and only) item
      const preferences = data?.[0];
      if (preferences) {
        setPreferences(preferences);
      }
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
    [user, preferences],
  );

  // Reset preferences to defaults using database function
  const resetPreferences = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return false;
    }

    try {
      // First delete existing preferences
      const { error: deleteError } = await supabase
        .from("preferences")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      // Then create new default preferences
      const { data, error } = await supabase.rpc("create_default_preferences", {
        p_user_id: user.id,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      // Database function returns an array, get the first (and only) item
      const preferences = data?.[0];
      if (preferences) {
        setPreferences(preferences);
        return true;
      }

      return false;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [user]);

  // Helper to check if user has specific job preference
  const hasJobPreference = useCallback(
    (jobTypeName: string): boolean => {
      return preferences?.desired_roles.includes(jobTypeName) || false;
    },
    [preferences],
  );

  // Helper to get preferred job types
  const getPreferredJobTypes = useCallback(() => {
    if (!preferences) return [];
    return preferences.desired_roles;
  }, [preferences]);

  // Save complete preferences using upsert database function with built-in validation
  const savePreferences = useCallback(
    async (
      preferencesData: Omit<
        UserPreferences,
        "preference_id" | "user_id" | "created_at" | "updated_at"
      >,
    ) => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase.rpc("upsert_user_preferences", {
          p_target_user_id: user.id,
          p_min_pay_rate: preferencesData.min_pay_rate,
          p_max_travel_km: preferencesData.max_travel_km,
          p_desired_roles: preferencesData.desired_roles,
          p_max_hours_per_week: preferencesData.max_hours_per_week,
          p_max_hours_per_shift: preferencesData.max_hours_per_shift,
          p_consider_lower_rate: preferencesData.consider_lower_rate,
        });

        if (error) {
          setError(error.message);
          return false;
        }

        const result = data?.[0];
        if (result) {
          // Check for validation errors
          if (result.validation_errors && result.validation_errors.length > 0) {
            setError(result.validation_errors.join(", "));
            return false;
          }

          setPreferences(result);
          return true;
        }

        return false;
      } catch (err) {
        setError((err as Error).message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

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
    savePreferences,
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
