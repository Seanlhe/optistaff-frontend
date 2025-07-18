/**
 * Preferences Hook
 * @description Custom hook for user preferences management
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useJobTypes } from "./useJobTypes";
import { supabase } from "../integrations/supabase/client";
import { UserPreferences, PreferencesFormData } from "../types/hooks";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const {
    convertJobNamesToIds,
    convertJobIdsToNames,
    loading: jobTypesLoading,
  } = useJobTypes();

  // Fetch user preferences
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
      max_travel_km: 50,
      desired_roles: [],
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

  // Save preferences (upsert operation)
  const savePreferences = useCallback(
    async (formData: PreferencesFormData) => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      if (jobTypesLoading) {
        setError("Job types are still loading");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Convert job names to IDs
        const jobTypeIds = convertJobNamesToIds(formData.selectedJobNames);

        // Validate that all job names were successfully converted
        if (formData.selectedJobNames.length > 0 && jobTypeIds.length === 0) {
          setError("Invalid job types selected");
          return false;
        }

        const preferencesData: Omit<
          UserPreferences,
          "preference_id" | "created_at" | "updated_at"
        > = {
          user_id: user.id,
          min_pay_rate: formData.payRate,
          max_travel_km: formData.maxTravelKm,
          desired_roles: jobTypeIds,
          max_hours_per_week: formData.maxHoursPerWeek,
          max_hours_per_shift: formData.maxHoursPerShift,
          consider_lower_rate: formData.considerLowerRate,
        };

        const { data, error } = await supabase
          .from("preferences")
          .upsert(preferencesData, { onConflict: "user_id" })
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
    [user, convertJobNamesToIds, jobTypesLoading]
  );

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
      max_travel_km: 50,
      desired_roles: [],
      max_hours_per_week: 40,
      max_hours_per_shift: 8,
      consider_lower_rate: false,
    };

    return await updatePreferences(defaultPreferences);
  }, [user, updatePreferences]);

  // Convert preferences to form data for frontend
  const getFormData = useCallback((): PreferencesFormData | null => {
    if (!preferences) return null;

    return {
      payRate: preferences.min_pay_rate,
      considerLowerRate: preferences.consider_lower_rate,
      maxHoursPerWeek: preferences.max_hours_per_week,
      maxHoursPerShift: preferences.max_hours_per_shift,
      maxTravelKm: preferences.max_travel_km,
      selectedJobNames: convertJobIdsToNames(preferences.desired_roles),
    };
  }, [preferences, convertJobIdsToNames]);

  // Helper to check if user has specific job preference
  const hasJobPreference = useCallback(
    (jobTypeId: string): boolean => {
      return preferences?.desired_roles.includes(jobTypeId) || false;
    },
    [preferences]
  );

  // Helper to get preferred job types with details
  const getPreferredJobTypes = useCallback(() => {
    if (!preferences) return [];
    // This would use the job types from useJobTypes hook
    return preferences.desired_roles;
  }, [preferences]);

  // Load preferences on mount or user change
  useEffect(() => {
    if (user && !jobTypesLoading) {
      fetchPreferences();
    }
  }, [user, jobTypesLoading, fetchPreferences]);

  return {
    // Data
    preferences,

    // State
    loading: loading || jobTypesLoading,
    error,

    // Actions
    fetchPreferences,
    savePreferences,
    updatePreferences,
    resetPreferences,
    createDefaultPreferences,

    // Helpers
    getFormData,
    hasJobPreference,
    getPreferredJobTypes,
  };
};
