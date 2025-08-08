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

  // Helper function to convert UUIDs to job names if needed
  const convertUuidsToNames = useCallback(
    async (jobIdentifiers: string[]): Promise<string[]> => {
      if (!jobIdentifiers || jobIdentifiers.length === 0) {
        return [];
      }

      // Check if any of the identifiers are UUIDs (contains hyphens and is 36 chars)
      const hasUuids = jobIdentifiers.some(
        (id) => id.includes("-") && id.length === 36
      );

      if (!hasUuids) {
        // Already job names, return as is
        return jobIdentifiers;
      }

      try {
        // Convert UUIDs to job names
        const { data, error } = await supabase
          .from("job_types")
          .select("job_type_id, type_name")
          .in("job_type_id", jobIdentifiers)
          .eq("is_active", true);

        if (error) {
          console.warn("Failed to convert UUIDs to names:", error.message);
          return jobIdentifiers; // Return original if conversion fails
        }

        // Create a map of UUID -> name
        const uuidToNameMap = new Map(
          data.map((item) => [item.job_type_id, item.type_name])
        );

        // Convert identifiers, keeping names as-is and converting UUIDs
        return jobIdentifiers.map((id) => {
          if (id.includes("-") && id.length === 36) {
            return uuidToNameMap.get(id) || id; // Convert UUID to name, fallback to original
          }
          return id; // Keep job names as-is
        });
      } catch (err) {
        console.warn("Error converting UUIDs to names:", err);
        return jobIdentifiers; // Return original if conversion fails
      }
    },
    []
  );

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
        // Convert UUIDs to names if needed before validation
        const convertedJobNames = await convertUuidsToNames(jobNames);
        
        const { data: isValid, error } = await supabase.rpc(
          "validate_job_names",
          { job_names: convertedJobNames },
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
    [convertUuidsToNames],
  );

  // Helper function for saving preferences with database function and fallback
  const savePreferencesWithFallback = useCallback(
    async (formData: PreferencesFormData): Promise<UserPreferences | null> => {
      const USE_DATABASE_FUNCTION = true; // Feature flag

      // Convert UUIDs to names before saving
      const convertedJobNames = await convertUuidsToNames(formData.selectedJobNames);

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
              p_desired_roles: convertedJobNames, // Use converted names
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
        desired_roles: convertedJobNames, // Use converted names
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
    [user?.id, revertOptimisticUpdate, convertUuidsToNames],
  );

  // Convert preferences to form data for frontend
  const getFormData = useCallback(async (): Promise<PreferencesFormData | null> => {
    if (!preferences) return null;

    // Convert UUIDs to names if needed for display
    const convertedJobNames = await convertUuidsToNames(preferences.desired_roles);

    return {
      payRate: preferences.min_pay_rate,
      considerLowerRate: preferences.consider_lower_rate,
      maxHoursPerWeek: preferences.max_hours_per_week,
      maxHoursPerShift: preferences.max_hours_per_shift,
      maxTravelKm: preferences.max_travel_km,
      selectedJobNames: convertedJobNames, // Use converted names
      // Include location data for map display
      homeLocation: homeLocation || undefined,
      homeAddress: homeAddress || undefined,
    };
  }, [preferences, homeLocation, homeAddress, convertUuidsToNames]);

  // Save preferences with optimistic updates and form-specific logic
  const savePreferences = useCallback(
    async (formData: PreferencesFormData): Promise<boolean> => {
      if (!preferences) {
        setFormError("No preferences loaded");
        return false;
      }

      // Convert UUIDs to names first
      const convertedJobNames = await convertUuidsToNames(formData.selectedJobNames);

      // Validate preferences before saving (using converted names)
      const tempPreferences: UserPreferences = {
        user_id: user?.id || "",
        min_pay_rate: formData.payRate,
        max_travel_km: formData.maxTravelKm,
        desired_roles: convertedJobNames, // Use converted names
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
        console.log("🔍 Validating job names:", convertedJobNames);
        const validationResult = await validateJobNames(convertedJobNames);
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

        // Create updated form data with converted names
        const updatedFormData = {
          ...formData,
          selectedJobNames: convertedJobNames,
        };

        const result = await savePreferencesWithFallback(updatedFormData);
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
      user?.id,
      updatePreferences,
      validateJobNames,
      savePreferencesWithFallback,
      revertOptimisticUpdate,
      convertUuidsToNames,
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
    convertUuidsToNames,

    // Location data (passed through)
    homeLocation,
    homeAddress,

    // Helpers
    revertOptimisticUpdate,
  };
};

export default usePreferencesForm;
