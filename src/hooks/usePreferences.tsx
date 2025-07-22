/**
 * Preferences Hook
 * @description Custom hook for user preferences management
 * @author OptiStaff Team
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import {
  UserPreferences,
  PreferencesFormData,
  UserLocationData,
} from "../types/hooks";
import { validatePreferences } from "../utils/preferencesValidator";
import { useLocationGeocoding } from "./useLocationGeocoding";

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [homeLocation, setHomeLocation] = useState<[number, number] | null>(
    null
  );
  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<UserLocationData | null>(
    null
  );
  const { user } = useAuth();
  const {
    geocodeAddress,
    reverseGeocode,
    loading: geocodingLoading,
    error: geocodingError,
  } = useLocationGeocoding();

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
      max_travel_km: 15, // More reasonable default for Singapore
      desired_roles: [], // Empty array of job names
      max_hours_per_week: 40,
      max_hours_per_shift: 8,
      consider_lower_rate: false,
    };

    return await updatePreferences(defaultPreferences);
  }, [user, updatePreferences]);

  // Enhanced getFormData method to include location information
  const getFormDataWithLocation =
    useCallback((): PreferencesFormData | null => {
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

  // Convert preferences to form data for frontend (kept for backward compatibility)
  const getFormData = useCallback((): PreferencesFormData | null => {
    return getFormDataWithLocation();
  }, [getFormDataWithLocation]);

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

  // Load home location data from job_seekers table with enhanced error handling
  const loadLocationData = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("job_seekers")
        .select("address_coordinates, postal_code")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no job seeker record found, this is expected for new users
        if (error.code === "PGRST116") {
          setLocationData(null);
          setHomeLocation(null);
          setHomeAddress(null);
          return;
        }
        
        // Enhanced error handling for different database errors
        let errorMessage = "Failed to load location data";
        if (error.code === "PGRST301") {
          errorMessage = "Database connection error. Please try again.";
        } else if (error.code === "PGRST204") {
          errorMessage = "Location data not found. Please update your profile.";
        } else {
          errorMessage = `Location data error: ${error.message}`;
        }
        
        setError(errorMessage);
        return;
      }

      const locationData: UserLocationData = {
        address_coordinates: data.address_coordinates,
        postal_code: data.postal_code,
        address: undefined, // Address column exists but not used by preferences (used by profile management)
      };

      setLocationData(locationData);

      // Parse coordinates from address_coordinates string if available with validation
      if (data.address_coordinates) {
        try {
          const [lat, lng] = data.address_coordinates.split(",").map(Number);
          
          // Validate coordinates are valid numbers and within Singapore bounds
          if (!isNaN(lat) && !isNaN(lng)) {
            // Singapore bounds validation
            if (lat >= 1.2290 && lat <= 1.4784 && lng >= 103.6000 && lng <= 104.0120) {
              setHomeLocation([lat, lng]);
            } else {
              console.warn("Home location coordinates are outside Singapore bounds:", [lat, lng]);
              setError("Home location appears to be outside Singapore. Please update your profile.");
            }
          } else {
            console.warn("Invalid address coordinates:", data.address_coordinates);
            setError("Invalid location data format. Please update your profile.");
          }
        } catch (parseError) {
          console.warn("Failed to parse address_coordinates:", parseError);
          setError("Unable to parse location data. Please update your profile.");
        }
      }

      // Set home address from available data (only postal_code since no address column exists)
      setHomeAddress(data.postal_code || null);
    } catch (err) {
      // Network or unexpected errors
      const errorMessage = err instanceof Error 
        ? `Network error loading location: ${err.message}`
        : "Unexpected error loading location data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Geocode home location using address or postal code with enhanced error handling
  const geocodeHomeLocation = useCallback(async (): Promise<
    [number, number] | null
  > => {
    if (!locationData) {
      setError("No location data available to geocode");
      return null;
    }

    // Try to use existing coordinates first
    if (homeLocation) {
      return homeLocation;
    }

    // Try to geocode from postal code (no address column exists in job_seekers table)
    const addressToGeocode = locationData.postal_code;
    if (!addressToGeocode) {
      setError("No postal code available for geocoding. Please update your profile with a valid Singapore postal code.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const coordinates = await geocodeAddress(addressToGeocode);
      
      if (coordinates) {
        setHomeLocation(coordinates);

        // Try to get formatted address from coordinates since we only have postal code
        try {
          const formattedAddress = await reverseGeocode(coordinates);
          if (formattedAddress) {
            setHomeAddress(formattedAddress);
          }
        } catch (reverseError) {
          // Don't fail the whole operation if reverse geocoding fails
          console.warn("Reverse geocoding failed:", reverseError);
        }
      } else {
        // Handle case where geocoding returns null (already handled by geocoding hook)
        if (geocodingError) {
          setError(`Location lookup failed: ${geocodingError.message}`);
        } else {
          setError("Unable to find location for the provided postal code. Please verify your postal code in your profile.");
        }
      }
      
      return coordinates;
    } catch (err) {
      // Handle unexpected errors
      const errorMessage = err instanceof Error 
        ? `Geocoding error: ${err.message}`
        : "Unexpected error during location lookup";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [locationData, homeLocation, geocodeAddress, reverseGeocode, geocodingError]);

  // Load preferences and location data on mount or user change
  useEffect(() => {
    if (user) {
      // Load both preferences and location data
      const loadData = async () => {
        await Promise.all([fetchPreferences(), loadLocationData()]);
      };
      loadData();
    }
  }, [user, fetchPreferences, loadLocationData]);

  return {
    // Data
    // Data
    preferences,

    // State
    loading: loading || geocodingLoading,
    error: error || (geocodingError ? geocodingError.message : null),

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

    // Location-related properties and methods
    homeLocation,
    homeAddress,
    loadLocationData,
    geocodeHomeLocation,
  };
};
