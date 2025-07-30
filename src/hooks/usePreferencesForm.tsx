/**
 * Preferences Form Hook
 * @description Handles form-specific logic for preferences including optimistic updates
 * @author OptiStaff Team
 */

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { usePreferences } from "./usePreferences";
import { usePreferencesLocation } from "./usePreferencesLocation";
import { PreferencesFormData, UserPreferences } from "../types/hooks";
import { validatePreferences } from "../utils/preferencesValidator";
import { supabase } from "../integrations/supabase/client";

export const usePreferencesForm = () => {
  const { user } = useAuth();

  // Get core preferences functionality
  const {
    preferences: corePreferences,
    updatePreferences,
    loading: coreLoading,
    error: coreError,
    fetchPreferences,
  } = usePreferences();

  // Get location functionality
  const {
    homeLocation,
    homeAddress,
    loading: locationLoading,
    error: locationError,
  } = usePreferencesLocation();

  // Form-specific state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [optimisticPreferences, setOptimisticPreferences] =
    useState<UserPreferences | null>(null);

  // Use optimistic preferences if available, otherwise use core preferences
  const preferences = optimisticPreferences || corePreferences;

  // Helper function for reverting optimistic updates
  const revertOptimisticUpdate = useCallback(async () => {
    try {
      setOptimisticPreferences(null); // Clear optimistic state
      await fetchPreferences(); // Refresh from database
    } catch (revertError) {
      console.warn("Failed to revert optimistic update:", revertError);
    }
  }, [fetchPreferences]);

  // Helper function for batch job name validation using database function
  const validateJobNames = useCallback(
    async (
      jobNames: string[],
    ): Promise<{ isValid: boolean; error?: string }> => {
      if (!jobNames || jobNames.length === 0) {
        return { isValid: true };
      }

      setValidating(true);
      try {
        const { data: isValid, error } = await supabase.rpc(
          "validate_job_names",
          { job_names: jobNames },
        );

        if (error) {
          return { isValid: false, error: error.message };
        }

        return { isValid: isValid || false };
      } catch (err) {
        return { isValid: false, error: (err as Error).message };
      } finally {
        setValidating(false);
      }
    },
    [],
  );

  // Helper function for saving preferences with database function and fallback
  const savePreferencesWithFallback = useCallback(
    async (formData: PreferencesFormData): Promise<UserPreferences | null> => {
      const USE_DATABASE_FUNCTION = true; // Feature flag

      // Try database function first
      if (USE_DATABASE_FUNCTION) {
        try {
          console.log("🔧 Using enhanced database function");
          const { data, error } = await supabase.rpc(
            "upsert_user_preferences",
            {
              p_target_user_id: user?.id,
              p_min_pay_rate: formData.payRate,
              p_max_travel_km: formData.maxTravelKm,
              p_desired_roles: formData.selectedJobNames,
              p_max_hours_per_week: formData.maxHoursPerWeek,
              p_max_hours_per_shift: formData.maxHoursPerShift,
              p_consider_lower_rate: formData.considerLowerRate,
            },
          );

          if (error) throw new Error(error.message);

          if (data?.[0]) {
            const result = data[0];
            if (result.validation_errors?.length > 0) {
              await revertOptimisticUpdate();
              setFormError(result.validation_errors.join(", "));
              return null;
            }
            console.log("✅ Database function succeeded");

            // Convert database function result to UserPreferences format
            const { validation_errors, ...preferencesData } = result;
            return preferencesData as UserPreferences;
          }
        } catch (functionError) {
          console.warn(
            "Database function failed, using fallback:",
            functionError,
          );
        }
      }

      // Fallback to direct upsert
      console.log("📝 Using direct table upsert");
      const preferencesData: Omit<
        UserPreferences,
        "preference_id" | "created_at" | "updated_at"
      > = {
        user_id: user?.id || "",
        min_pay_rate: formData.payRate,
        max_travel_km: formData.maxTravelKm,
        desired_roles: formData.selectedJobNames,
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
        await revertOptimisticUpdate();
        setFormError(error.message);
        return null;
      }

      console.log("✅ Direct upsert succeeded");
      return data;
    },
    [user?.id, revertOptimisticUpdate],
  );

  // Convert preferences to form data for frontend
  const getFormData = useCallback((): PreferencesFormData | null => {
    if (!preferences) return null;

    return {
      payRate: preferences.min_pay_rate,
      considerLowerRate: preferences.consider_lower_rate,
      maxHoursPerWeek: preferences.max_hours_per_week,
      maxHoursPerShift: preferences.max_hours_per_shift,
      maxTravelKm: preferences.max_travel_km,
      selectedJobNames: preferences.desired_roles,
      // Include location data for map display
      homeLocation: homeLocation || undefined,
      homeAddress: homeAddress || undefined,
    };
  }, [preferences, homeLocation, homeAddress]);

  // Save preferences with optimistic updates and form-specific logic
  const savePreferences = useCallback(
    async (formData: PreferencesFormData): Promise<boolean> => {
      if (!preferences) {
        setFormError("No preferences loaded");
        return false;
      }

      // Validate preferences before saving
      const tempPreferences: UserPreferences = {
        user_id: user?.id || "",
        min_pay_rate: formData.payRate,
        max_travel_km: formData.maxTravelKm,
        desired_roles: formData.selectedJobNames,
        max_hours_per_week: formData.maxHoursPerWeek,
        max_hours_per_shift: formData.maxHoursPerShift,
        consider_lower_rate: formData.considerLowerRate,
      };

      const validation = validatePreferences(tempPreferences);
      if (!validation.isValid) {
        setFormError(validation.errors.join(", "));
        return false;
      }

      setIsSubmitting(true);
      setFormError(null);

      // Optimization 3: Optimistic Updates - Update UI immediately
      const optimisticPreferences = {
        ...tempPreferences,
        preference_id: preferences.preference_id || crypto.randomUUID(),
        created_at: preferences.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      console.log("🚀 Applying optimistic update:", optimisticPreferences);

      // Apply optimistic update to local state (not database)
      setOptimisticPreferences(optimisticPreferences);

      try {
        // Optimization 1: Batch Validation using database function
        console.log("🔍 Validating job names:", formData.selectedJobNames);
        const validationResult = await validateJobNames(
          formData.selectedJobNames,
        );
        if (!validationResult.isValid) {
          console.log("❌ Validation failed, reverting optimistic update");
          // Revert optimistic update
          await revertOptimisticUpdate();
          setFormError(
            validationResult.error ||
              "One or more selected job types are invalid or inactive",
          );
          return false;
        }
        console.log("✅ Job names validation passed");

        // Optimization 2: Enhanced upsert with reliable fallback
        console.log("💾 Saving preferences");

        const result = await savePreferencesWithFallback(formData);
        if (!result) return false;

        // The result is already the updated preferences from the database
        console.log("✅ Preferences saved successfully:", result);
        // No need to call updatePreferences again since savePreferencesWithFallback already saved to DB

        return true;
      } catch (err) {
        // Revert optimistic update on any error
        await revertOptimisticUpdate();
        setFormError((err as Error).message);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      preferences,
      updatePreferences,
      validateJobNames,
      savePreferencesWithFallback,
      revertOptimisticUpdate,
    ],
  );

  // Combined loading and error states
  const loading = coreLoading || locationLoading || isSubmitting;
  const error = coreError || locationError || formError;

  return {
    // Form data
    preferences,

    // Form state
    loading,
    validating,
    isSubmitting,
    error,

    // Form actions
    savePreferences,
    getFormData,
    validateJobNames,

    // Location data (passed through)
    homeLocation,
    homeAddress,

    // Helpers
    revertOptimisticUpdate,
  };
};

export default usePreferencesForm;
