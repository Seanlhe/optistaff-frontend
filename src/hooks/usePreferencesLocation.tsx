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
  const [homeLocation, setHomeLocation] = useState<[number, number] | null>(
    null
  );
  const [homeAddress, setHomeAddress] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<UserLocationData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const {
    geocodeAddress,
    reverseGeocode,
    loading: geocodingLoading,
    error: geocodingError,
  } = useLocationGeocoding();

  // Load home location data using database function
  const loadLocationData = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_location', {
        p_user_id: user.id
      });

      if (error) {
        setError(`Failed to load location data: ${error.message}`);
        return;
      }

      // Database function returns an array, get the first item
      const locationResult = data?.[0];
      
      if (!locationResult) {
        // No location data found - this is expected for new users
        setLocationData(null);
        setHomeLocation(null);
        setHomeAddress(null);
        return;
      }

      const locationData: UserLocationData = {
        address_coordinates: locationResult.address_coordinates,
        postal_code: locationResult.postal_code,
        address: locationResult.address,
      };

      setLocationData(locationData);

      // Use parsed coordinates from database function (no validation needed)
      if (locationResult.coordinates_lat && locationResult.coordinates_lng) {
        setHomeLocation([locationResult.coordinates_lat, locationResult.coordinates_lng]);
      }

      // Use formatted address from database function
      setHomeAddress(locationResult.formatted_address || locationResult.postal_code || null);

    } catch (err) {
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

  // Helper function to parse coordinate string (simplified)
  const parseCoordinateString = useCallback(
    (coordString: string): [number, number] | null => {
      try {
        const [lat, lng] = coordString.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lat, lng];
        }
      } catch (error) {
        console.warn("Failed to parse coordinate string:", coordString, error);
      }
      return null;
    },
    []
  );

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
    parseCoordinateString,
  };
};

export default usePreferencesLocation;
