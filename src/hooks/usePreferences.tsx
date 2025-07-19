/**
 * Preferences Hook
 * @description Custom hook for user preferences management
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import { UserPreferences, PreferencesFormData } from "../types/hooks";
import { validatePreferences } from "../utils/preferencesValidator";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
      max_travel_km: 50,
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

  // Save preferences (upsert operation)
  const savePreferences = useCallback(
    async (formData: PreferencesFormData) => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      // Validate preferences before saving
      const tempPreferences: UserPreferences = {
        user_id: user.id,
        min_pay_rate: formData.payRate,
        max_travel_km: formData.maxTravelKm,
        desired_roles: formData.selectedJobNames,
        max_hours_per_week: formData.maxHoursPerWeek,
        max_hours_per_shift: formData.maxHoursPerShift,
        consider_lower_rate: formData.considerLowerRate,
      };

      const validation = validatePreferences(tempPreferences);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Validate that selected job names exist in the database
        if (formData.selectedJobNames.length > 0) {
          const { data: existingJobTypes, error: validationError } =
            await supabase
              .from("job_types")
              .select("type_name")
              .in("type_name", formData.selectedJobNames)
              .eq("is_active", true);

          if (validationError) {
            setError(validationError.message);
            return false;
          }

          const validJobNames = existingJobTypes.map((jt) => jt.type_name);
          const invalidJobNames = formData.selectedJobNames.filter(
            (name) => !validJobNames.includes(name)
          );

          if (invalidJobNames.length > 0) {
            setError(
              `Invalid job types selected: ${invalidJobNames.join(", ")}`
            );
            return false;
          }
        }

        // Save preferences with job names directly in desired_roles JSONB field
        const preferencesData: Omit<
          UserPreferences,
          "preference_id" | "created_at" | "updated_at"
        > = {
          user_id: user.id,
          min_pay_rate: formData.payRate,
          max_travel_km: formData.maxTravelKm,
          desired_roles: formData.selectedJobNames, // Store job names directly
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
    [user]
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
      desired_roles: [], // Empty array of job names
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
      selectedJobNames: preferences.desired_roles, // Now directly job names
    };
  }, [preferences]);

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
    loading,
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
