/**
 * Preferences Location Hook
 * @description Handles all location-related functionality for user preferences
 * @author OptiStaff Team
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "../integrations/supabase/client";
import { UserLocationData } from "../types/hooks";
import { useLocationGeocoding } from "./useLocationGeocoding";

export const usePreferencesLocation = () => {
  const [homeLocation, setHomeLocation] = useState<[number, number] | null>(null);
  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<UserLocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const {
    geocodeAddress,
    reverseGeocode,
    loading: geocodingLoading,
    error: geocodingError,
  } = useLocationGeocoding();

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
            if (
              lat >= 1.229 &&
              lat <= 1.4784 &&
              lng >= 103.6 &&
              lng <= 104.012
            ) {
              setHomeLocation([lat, lng]);
            } else {
              console.warn(
                "Home location coordinates are outside Singapore bounds:",
                [lat, lng]
              );
              setError(
                "Home location appears to be outside Singapore. Please update your profile."
              );
            }
          } else {
            console.warn(
              "Invalid address coordinates:",
              data.address_coordinates
            );
            setError(
              "Invalid location data format. Please update your profile."
            );
          }
        } catch (parseError) {
          console.warn("Failed to parse address_coordinates:", parseError);
          setError(
            "Unable to parse location data. Please update your profile."
          );
        }
      }

      // Set home address from available data (only postal_code since no address column exists)
      setHomeAddress(data.postal_code || null);
    } catch (err) {
      // Network or unexpected errors
      const errorMessage =
        err instanceof Error
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
      setError(
        "No postal code available for geocoding. Please update your profile with a valid Singapore postal code."
      );
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
          setError(
            "Unable to find location for the provided postal code. Please verify your postal code in your profile."
          );
        }
      }

      return coordinates;
    } catch (err) {
      // Handle unexpected errors
      const errorMessage =
        err instanceof Error
          ? `Geocoding error: ${err.message}`
          : "Unexpected error during location lookup";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    locationData,
    homeLocation,
    geocodeAddress,
    reverseGeocode,
    geocodingError,
  ]);

  // Helper function to validate Singapore coordinates
  const isValidSingaporeCoordinates = useCallback((lat: number, lng: number): boolean => {
    return lat >= 1.229 && lat <= 1.4784 && lng >= 103.6 && lng <= 104.012;
  }, []);

  // Helper function to parse coordinate string
  const parseCoordinateString = useCallback((coordString: string): [number, number] | null => {
    try {
      const [lat, lng] = coordString.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng) && isValidSingaporeCoordinates(lat, lng)) {
        return [lat, lng];
      }
    } catch (error) {
      console.warn("Failed to parse coordinate string:", coordString, error);
    }
    return null;
  }, [isValidSingaporeCoordinates]);

  // Load location data on mount or user change
  useEffect(() => {
    if (user) {
      loadLocationData();
    }
  }, [user, loadLocationData]);

  return {
    // Location data
    homeLocation,
    homeAddress,
    locationData,

    // State
    loading: loading || geocodingLoading,
    error: error || (geocodingError ? geocodingError.message : null),

    // Actions
    loadLocationData,
    geocodeHomeLocation,

    // Helpers
    isValidSingaporeCoordinates,
    parseCoordinateString,
  };
};

export default usePreferencesLocation;