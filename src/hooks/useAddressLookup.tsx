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
        console.log('🔍 Address Lookup Debug - Validating address:', address);
        
        // Use Vite development proxy to bypass CORS
        const isProduction = import.meta.env.PROD;
        let geocodeUrl: string;
        
        if (isProduction) {
          // For production, we'll need server-side geocoding or a paid proxy service
          // For now, throw an error with helpful message
          throw new Error('Address validation not available in production. Please enter postal code manually.');
        } else {
          // For development, use Vite proxy
          geocodeUrl = `/api/geocode/json?address=${encodeURIComponent(address + ', Singapore')}&key=${apiKey}`;
        }
        
        console.log('🔍 Address Lookup Debug - Using development proxy');
        
        const response = await fetch(geocodeUrl, { 
          signal: controller.signal,
          method: 'GET'
        });

        clearTimeout(timeoutId);
        
        console.log('🔍 Address Lookup Debug - Response status:', response.status);

        if (!response.ok) {
          throw new Error('Network error');
        }

        let data;
        try {
          data = await response.json();
          console.log('🔍 Address Lookup Debug - API Response:', data);
        } catch (parseError) {
          throw new Error('Invalid response');
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

          // Validate that the returned address is reasonably similar to input
          const inputAddressNormalized = address.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
          const returnedAddressNormalized = formattedAddress.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
          
          // Check if Google significantly changed the street name
          const inputStreetWords = inputAddressNormalized.split(/\s+/).filter(word => word.length > 2);
          const returnedStreetWords = returnedAddressNormalized.split(/\s+/).filter(word => word.length > 2);
          
          // Count how many significant words from input appear in the result
          const matchingWords = inputStreetWords.filter(word => 
            returnedStreetWords.some(returnedWord => 
              returnedWord.includes(word) || word.includes(returnedWord)
            )
          );
          
          // If less than 50% of the input words match, it might be an approximate/incorrect match
          if (matchingWords.length < inputStreetWords.length * 0.5) {
            console.log('🔍 Address Lookup Debug - Possible approximate match detected');
            console.log('🔍 Address Lookup Debug - Input:', inputAddressNormalized);
            console.log('🔍 Address Lookup Debug - Returned:', returnedAddressNormalized);
            console.log('🔍 Address Lookup Debug - Matching words:', matchingWords.length, 'of', inputStreetWords.length);
            throw new Error('Address not found - please check spelling');
          }

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
        
        throw fetchError;
      }
    } catch (error) {
      console.log('🔍 Address Lookup Debug - Error caught:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to lookup address';
      setResult(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setResult(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearResults = useCallback(() => {
    setResult({
      address: '',
      postalCode: '',
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