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
        error: 'Please enter a valid Singapore address',
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

      // Geocode the address to get postal code
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}+Singapore&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch postal code data');
      }

      const data = await response.json();

      if (data.status === 'ZERO_RESULTS') {
        throw new Error('No postal code found for this address');
      }

      if (data.status !== 'OK') {
        throw new Error(data.error_message || 'Geocoding API error');
      }

      if (data.results && data.results.length > 0) {
        const geocodeResult: GeocodeResult = data.results[0];
        
        // Extract postal code from address components
        const extractedPostalCode = geocodeResult.address_components.find(
          component => component.types.includes('postal_code')
        )?.long_name;

        if (!extractedPostalCode) {
          throw new Error('No postal code found for this address. Please ensure it\'s a valid Singapore address.');
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
        throw new Error('No postal code found for this address');
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
