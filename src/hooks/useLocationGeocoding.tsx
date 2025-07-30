import { useState, useCallback, useRef } from "react";
import {
  createLocationError,
  logLocationError,
  isValidSingaporeCoordinates,
  LocationError,
  LocationErrorType,
} from "../utils/locationErrorHandler";

// Legacy error types for backward compatibility
export type GeocodeErrorType =
  | "RATE_LIMIT"
  | "INVALID_ADDRESS"
  | "NETWORK_ERROR"
  | "API_KEY_ERROR"
  | "UNKNOWN_ERROR";

export interface GeocodeError {
  type: GeocodeErrorType;
  message: string;
  originalError?: any;
}

// Hook interface
export interface LocationGeocodingHook {
  geocodeAddress: (address: string) => Promise<[number, number] | null>;
  reverseGeocode: (coordinates: [number, number]) => Promise<string | null>;
  loading: boolean;
  error: GeocodeError | null;
  locationError: LocationError | null;
  clearError: () => void;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Cache for geocoding results to reduce API calls
const geocodeCache = new Map<string, [number, number]>();
const reverseGeocodeCache = new Map<string, string>();

export const useLocationGeocoding = (): LocationGeocodingHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeocodeError | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(
    null,
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
    setLocationError(null);
  }, []);

  // Helper function to create legacy error objects
  const createError = (
    type: GeocodeErrorType,
    message: string,
    originalError?: any,
  ): GeocodeError => ({
    type,
    message,
    originalError,
  });

  // Helper function to create both legacy and enhanced error objects
  const setErrorStates = useCallback(
    (type: LocationErrorType, originalError?: any, context?: string) => {
      const locationErr = createLocationError(type, originalError, context);
      setLocationError(locationErr);
      logLocationError(locationErr, { context, originalError });

      // Create legacy error for backward compatibility
      const legacyType =
        type === "NETWORK_ERROR"
          ? "NETWORK_ERROR"
          : type === "API_UNAVAILABLE"
            ? "API_KEY_ERROR"
            : type === "GEOCODING_FAILED"
              ? "INVALID_ADDRESS"
              : "UNKNOWN_ERROR";

      setError(
        createError(
          legacyType as GeocodeErrorType,
          locationErr.userMessage,
          originalError,
        ),
      );
    },
    [],
  );

  // Exponential backoff delay calculation
  const calculateDelay = (attempt: number): number => {
    const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, RETRY_CONFIG.maxDelay);
  };

  // Sleep function for retry delays
  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // Generic retry wrapper with exponential backoff
  const withRetry = async <T,>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        lastError = err;

        // Don't retry on certain error types
        if (
          err.message?.includes("REQUEST_DENIED") ||
          err.message?.includes("API_KEY_NOT_CONFIGURED")
        ) {
          throw err;
        }

        // If this was the last attempt, throw the error
        if (attempt === RETRY_CONFIG.maxRetries) {
          throw err;
        }

        // Wait before retrying with exponential backoff
        const delay = calculateDelay(attempt);
        console.warn(
          `${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          err,
        );
        await sleep(delay);
      }
    }

    throw lastError;
  };

  // Main geocoding function: address to coordinates
  const geocodeAddress = useCallback(
    async (address: string): Promise<[number, number] | null> => {
      if (!address.trim()) {
        setErrorStates("GEOCODING_FAILED", null, "Empty address provided");
        return null;
      }

      // Check cache first
      const cacheKey = address.toLowerCase().trim();
      if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey)!;
      }

      setLoading(true);
      setError(null);
      setLocationError(null);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const result = await withRetry(async () => {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error("API_KEY_NOT_CONFIGURED");
          }

          // Append Singapore to address for better geocoding accuracy
          const searchAddress = address.includes("Singapore")
            ? address
            : `${address}, Singapore`;

          const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}&region=sg`;

          const response = await fetch(url, {
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("RATE_LIMIT_HTTP");
            }
            throw new Error(`NETWORK_HTTP_${response.status}`);
          }

          const data = await response.json();

          if (data.status === "OVER_QUERY_LIMIT") {
            throw new Error("OVER_QUERY_LIMIT");
          }

          if (data.status === "REQUEST_DENIED") {
            throw new Error("REQUEST_DENIED");
          }

          if (
            data.status === "ZERO_RESULTS" ||
            !data.results ||
            data.results.length === 0
          ) {
            throw new Error("ZERO_RESULTS");
          }

          const location = data.results[0].geometry.location;
          const coordinates: [number, number] = [location.lat, location.lng];

          // Validate coordinates are within Singapore
          if (!isValidSingaporeCoordinates(coordinates[0], coordinates[1])) {
            throw new Error("INVALID_SINGAPORE_LOCATION");
          }

          return coordinates;
        }, "Geocoding");

        // Cache the successful result
        geocodeCache.set(cacheKey, result);
        return result;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return null; // Request was cancelled
        }

        // Handle different error types with enhanced error reporting
        if (err.message === "API_KEY_NOT_CONFIGURED") {
          setErrorStates("API_UNAVAILABLE", err, "API key not configured");
        } else if (err.message === "OVER_QUERY_LIMIT") {
          setErrorStates("API_UNAVAILABLE", err, "Geocoding quota exceeded");
        } else if (err.message === "REQUEST_DENIED") {
          setErrorStates("API_UNAVAILABLE", err, "API access denied");
        } else if (err.message === "ZERO_RESULTS") {
          setErrorStates("GEOCODING_FAILED", err, "Address not found");
        } else if (err.message === "INVALID_SINGAPORE_LOCATION") {
          setErrorStates("GEOCODING_FAILED", err, "Address outside Singapore");
        } else if (err.message?.includes("RATE_LIMIT_HTTP")) {
          setErrorStates("API_UNAVAILABLE", err, "Rate limit exceeded");
        } else if (err.message?.includes("NETWORK_HTTP")) {
          setErrorStates("NETWORK_ERROR", err, "HTTP error");
        } else if (
          err.name === "NetworkError" ||
          err.message?.includes("fetch")
        ) {
          setErrorStates("NETWORK_ERROR", err, "Network connection failed");
        } else {
          setErrorStates("UNKNOWN_ERROR", err, "Unexpected geocoding error");
        }

        return null;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [setErrorStates],
  );

  // Reverse geocoding function: coordinates to address
  const reverseGeocode = useCallback(
    async (coordinates: [number, number]): Promise<string | null> => {
      const [lat, lng] = coordinates;

      // Validate coordinates
      if (!isValidSingaporeCoordinates(lat, lng)) {
        setErrorStates(
          "GEOCODING_FAILED",
          null,
          "Coordinates outside Singapore bounds",
        );
        return null;
      }

      // Check cache first
      const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      if (reverseGeocodeCache.has(cacheKey)) {
        return reverseGeocodeCache.get(cacheKey)!;
      }

      setLoading(true);
      setError(null);
      setLocationError(null);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const result = await withRetry(async () => {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (!apiKey) {
            throw new Error("API_KEY_NOT_CONFIGURED");
          }

          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&region=sg`;

          const response = await fetch(url, {
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("RATE_LIMIT_HTTP");
            }
            throw new Error(`NETWORK_HTTP_${response.status}`);
          }

          const data = await response.json();

          if (data.status === "OVER_QUERY_LIMIT") {
            throw new Error("OVER_QUERY_LIMIT");
          }

          if (data.status === "REQUEST_DENIED") {
            throw new Error("REQUEST_DENIED");
          }

          if (
            data.status === "ZERO_RESULTS" ||
            !data.results ||
            data.results.length === 0
          ) {
            throw new Error("ZERO_RESULTS_REVERSE");
          }

          const address = data.results[0].formatted_address;
          return address;
        }, "Reverse geocoding");

        // Cache the successful result
        reverseGeocodeCache.set(cacheKey, result);
        return result;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return null; // Request was cancelled
        }

        // Handle different error types
        if (err.message === "API_KEY_NOT_CONFIGURED") {
          setErrorStates("API_UNAVAILABLE", err, "API key not configured");
        } else if (err.message === "OVER_QUERY_LIMIT") {
          setErrorStates("API_UNAVAILABLE", err, "Geocoding quota exceeded");
        } else if (err.message === "REQUEST_DENIED") {
          setErrorStates("API_UNAVAILABLE", err, "API access denied");
        } else if (err.message === "ZERO_RESULTS_REVERSE") {
          setErrorStates(
            "GEOCODING_FAILED",
            err,
            "No address found for coordinates",
          );
        } else if (err.message?.includes("RATE_LIMIT_HTTP")) {
          setErrorStates("API_UNAVAILABLE", err, "Rate limit exceeded");
        } else if (err.message?.includes("NETWORK_HTTP")) {
          setErrorStates("NETWORK_ERROR", err, "HTTP error");
        } else if (
          err.name === "NetworkError" ||
          err.message?.includes("fetch")
        ) {
          setErrorStates("NETWORK_ERROR", err, "Network connection failed");
        } else {
          setErrorStates(
            "UNKNOWN_ERROR",
            err,
            "Unexpected reverse geocoding error",
          );
        }

        return null;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [setErrorStates],
  );

  return {
    geocodeAddress,
    reverseGeocode,
    loading,
    error,
    locationError,
    clearError,
  };
};

export default useLocationGeocoding;
