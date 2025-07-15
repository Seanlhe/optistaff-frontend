/**
 * Address Lookup Hook
 * @description Custom hook for Singapore address to postal code lookup using Google Geocoding API
 */

import { useState, useCallback } from 'react';

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
    address: '',
    postalCode: '',
    loading: false,
    error: null,
  });

  const lookupPostalCode = useCallback(async (address: string) => {
    // Validate address input
    if (!address || address.trim().length < 5) {
      setResult(prev => ({
        ...prev,
        error: 'Address too short',
        loading: false,
      }));
      return;
    }

    setResult(prev => ({
      ...prev,
      loading: true,
      error: null,
      address: address.trim(),
    }));

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Geocode the address to get postal code with timeout
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}+Singapore&key=${apiKey}`,
          { 
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Handle HTTP errors
          if (response.status === 400) {
            throw new Error('Invalid address');
          } else if (response.status === 403) {
            throw new Error('Service unavailable');
          } else {
            throw new Error('Validation failed');
          }
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid address');
        }

        if (data.status === 'ZERO_RESULTS') {
          throw new Error('Address not found');
        }

        if (data.status === 'INVALID_REQUEST') {
          throw new Error('Invalid address');
        }

        if (data.status !== 'OK') {
          throw new Error(data.error_message || 'Validation failed');
        }

        if (data.results && data.results.length > 0) {
          const geocodeResult: GeocodeResult = data.results[0];
          
          // Extract postal code from address components
          const extractedPostalCode = geocodeResult.address_components.find(
            component => component.types.includes('postal_code')
          )?.long_name;

          if (!extractedPostalCode) {
            throw new Error('No postal code found');
          }

          // Format the address for Singapore (remove country)
          let formattedAddress = geocodeResult.formatted_address;
          formattedAddress = formattedAddress.replace(/, Singapore$/, '');

          setResult({
            address: formattedAddress,
            postalCode: extractedPostalCode,
            loading: false,
            error: null,
          });
        } else {
          throw new Error('Address not found');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Validation timed out');
        }
        
        if (fetchError instanceof TypeError && fetchError.message.includes('NetworkError')) {
          throw new Error('Invalid address');
        }
        
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error('Network error');
        }
        
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to lookup address';
      setResult(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setResult({
      address: '',
      postalCode: '',
      loading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setResult(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...result,
    lookupPostalCode,
    clearResults,
    clearError,
  };
};
