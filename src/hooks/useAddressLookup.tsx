/**
 * Address Lookup Hook
 * @description Custom hook for Singapore address to postal code lookup using Google Geocoding API
 */

import { useState, useCallback } from "react";

interface AddressResult {
  address: string;
  postalCode: string;
  loading: boolean;
  error: string | null;
}

interface GeocodeResult {
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export const useAddressLookup = () => {
  const [result, setResult] = useState<AddressResult>({
    address: "",
    postalCode: "",
    loading: false,
    error: null,
  });



  const lookupPostalCode = useCallback(async (address: string) => {
    // Clear postal code field at the start of each validation
    setResult((prev) => ({
      ...prev,
      postalCode: "",
      error: null,
    }));

    // Validate address input
    if (!address || address.trim().length < 5) {
      setResult({
        address: "",
        postalCode: "",
        loading: false,
        error: "Address too short",
      });
      return;
    }

    setResult((prev) => ({
      ...prev,
      loading: true,
      error: null,
      address: address.trim(),
      postalCode: "", // Ensure postal code is cleared
    }));

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        throw new Error("Google Maps API key not configured");
      }

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        console.log("🔍 Address Lookup Debug - Validating address:", address);

        // Use Vite development proxy to bypass CORS
        const isProduction = import.meta.env.PROD;
        let geocodeUrl: string;

        if (isProduction) {
          // For production, we'll need server-side geocoding or a paid proxy service
          // For now, throw an error with helpful message
          throw new Error(
            "Address validation not available in production. Please enter postal code manually."
          );
        } else {
          // For development, use Vite proxy
          geocodeUrl = `/api/geocode/json?address=${encodeURIComponent(
            address + ", Singapore"
          )}&key=${apiKey}`;
        }

        console.log("🔍 Address Lookup Debug - Using development proxy");

        const response = await fetch(geocodeUrl, {
          signal: controller.signal,
          method: "GET",
        });

        clearTimeout(timeoutId);

        console.log(
          "🔍 Address Lookup Debug - Response status:",
          response.status
        );

        if (!response.ok) {
          throw new Error("Network error");
        }

        let data;
        try {
          data = await response.json();
          console.log("🔍 Address Lookup Debug - API Response:", data);
        } catch (parseError) {
          throw new Error("Invalid response");
        }

        if (data.status === "ZERO_RESULTS") {
          throw new Error("Address not found");
        }

        if (data.status === "INVALID_REQUEST") {
          throw new Error("Invalid address");
        }

        if (data.status !== "OK") {
          throw new Error(data.error_message || "Validation failed");
        }

        if (data.results && data.results.length > 0) {
          const geocodeResult: GeocodeResult = data.results[0];

          // Extract postal code from address components
          const extractedPostalCode = geocodeResult.address_components.find(
            (component) => component.types.includes("postal_code")
          )?.long_name;

          if (!extractedPostalCode) {
            throw new Error("No postal code found");
          }

          // Format the address for Singapore (remove country)
          let formattedAddress = geocodeResult.formatted_address;
          formattedAddress = formattedAddress.replace(/, Singapore$/, "");

          // Extract and validate block number and street name for Singapore addresses
          const extractBlockNumber = (addressStr: string): string | null => {
            // Singapore block numbers are typically at the start: "123 Main Street" or "Blk 123 Main Street"
            const blockMatch = addressStr.match(/^(?:blk\s+)?(\d+[a-z]?)\s+/i);
            return blockMatch ? blockMatch[1].toLowerCase() : null;
          };

          const normalizeRoadTypes = (addressStr: string): string => {
            return addressStr
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              // Normalize all road type variations to full forms
              .replace(/\b(rd|road)\b/g, 'road')
              .replace(/\b(st|street)\b/g, 'street')
              .replace(/\b(ave|avenue)\b/g, 'avenue')
              .replace(/\b(ln|lane)\b/g, 'lane')
              .replace(/\b(dr|drive)\b/g, 'drive')
              .replace(/\b(cres|crescent)\b/g, 'crescent')
              .replace(/\b(cl|close)\b/g, 'close')
              .replace(/\b(pk|park)\b/g, 'park')
              .replace(/\b(pl|place)\b/g, 'place')
              .replace(/\b(gdn|garden)\b/g, 'garden')
              .replace(/\b(gdns|gardens)\b/g, 'gardens')
              .replace(/\b(hts|heights)\b/g, 'heights')
              .replace(/\b(est|estate)\b/g, 'estate')
              .replace(/\b(tce|terrace)\b/g, 'terrace')
              .replace(/\b(wk|walk)\b/g, 'walk');
          };

          const extractStreetName = (addressStr: string): string => {
            // Remove block number first
            let withoutBlock = addressStr.replace(/^(?:blk\s+)?\d+[a-z]?\s+/i, '');
            
            // Remove postal code (6 digits) and any trailing location info
            withoutBlock = withoutBlock.replace(/\s+\d{6}.*$/, '');
            
            // Remove common Singapore location suffixes that might remain
            withoutBlock = withoutBlock.replace(/\s+(singapore|downtown core|central|orchard|marina bay|bugis|chinatown|little india|kampong glam).*$/i, '');
            
            // Then normalize road types
            return normalizeRoadTypes(withoutBlock);
          };

          const inputNormalized = address.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
          const returnedNormalized = formattedAddress.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

          // Extract components from both addresses
          const inputBlockNumber = extractBlockNumber(inputNormalized);
          const returnedBlockNumber = extractBlockNumber(returnedNormalized);
          const inputStreetName = extractStreetName(inputNormalized);
          const returnedStreetName = extractStreetName(returnedNormalized);

          console.log('🔍 Address Validation Debug:');
          console.log('Input normalized:', inputNormalized);
          console.log('Returned normalized:', returnedNormalized);
          console.log('Input block:', inputBlockNumber, 'Returned block:', returnedBlockNumber);
          console.log('Input street:', inputStreetName, 'Returned street:', returnedStreetName);

          // Strict validation: Block number must match exactly if provided
          if (inputBlockNumber && returnedBlockNumber && inputBlockNumber !== returnedBlockNumber) {
            console.log('🔍 Address Lookup Debug - Block number mismatch');
            throw new Error('Invalid address - Block number does not match');
          }

          // Flexible validation: Street names should match after normalization
          if (inputStreetName && returnedStreetName && inputStreetName !== returnedStreetName) {
            console.log('🔍 Address Lookup Debug - Street name mismatch');
            console.log('Input street (normalized):', inputStreetName);
            console.log('Returned street (normalized):', returnedStreetName);
            throw new Error('Invalid address - Street name does not match');
          }

          // Only set the result if all validations pass
          setResult({
            address: formattedAddress,
            postalCode: extractedPostalCode,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Address not found");
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          throw new Error("Validation timed out");
        }

        throw fetchError;
      }
    } catch (error) {
      console.log("🔍 Address Lookup Debug - Error caught:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to lookup address";
      setResult({
        address: "",
        postalCode: "",
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setResult((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearResults = useCallback(() => {
    setResult({
      address: "",
      postalCode: "",
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...result,
    lookupPostalCode,
    clearResults,
    clearError,
  };
};
