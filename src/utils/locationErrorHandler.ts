// Utility functions for handling location-related errors

export type LocationErrorType = 
  | 'NETWORK_ERROR'
  | 'API_UNAVAILABLE'
  | 'GEOCODING_FAILED'
  | 'LOCATION_UNAVAILABLE'
  | 'MAP_LOAD_FAILED'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

export interface LocationError {
  type: LocationErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  fallbackAvailable: boolean;
  actionRequired?: string;
}

// Create standardized error objects
export const createLocationError = (
  type: LocationErrorType,
  originalError?: any,
  context?: string
): LocationError => {
  const baseErrors: Record<LocationErrorType, Omit<LocationError, 'type'>> = {
    NETWORK_ERROR: {
      message: 'Network connection failed',
      userMessage: 'Unable to connect to location services. Please check your internet connection.',
      canRetry: true,
      fallbackAvailable: false,
      actionRequired: 'Check your internet connection and try again.'
    },
    API_UNAVAILABLE: {
      message: 'Location API is unavailable',
      userMessage: 'Location services are temporarily unavailable.',
      canRetry: true,
      fallbackAvailable: true,
      actionRequired: 'Try again later or use manual input options.'
    },
    GEOCODING_FAILED: {
      message: 'Address geocoding failed',
      userMessage: 'Unable to find the location for your address.',
      canRetry: true,
      fallbackAvailable: false,
      actionRequired: 'Please verify your address in your profile settings.'
    },
    LOCATION_UNAVAILABLE: {
      message: 'Location data not available',
      userMessage: 'No location information found in your profile.',
      canRetry: false,
      fallbackAvailable: false,
      actionRequired: 'Please add your home address in your profile settings.'
    },
    MAP_LOAD_FAILED: {
      message: 'Map failed to load',
      userMessage: 'The interactive map could not be loaded.',
      canRetry: true,
      fallbackAvailable: true,
      actionRequired: 'Try refreshing the page or use the manual input option.'
    },
    PERMISSION_DENIED: {
      message: 'Location permission denied',
      userMessage: 'Location access was denied by your browser.',
      canRetry: false,
      fallbackAvailable: true,
      actionRequired: 'Enable location permissions in your browser settings.'
    },
    TIMEOUT_ERROR: {
      message: 'Location request timed out',
      userMessage: 'Location request is taking too long.',
      canRetry: true,
      fallbackAvailable: true,
      actionRequired: 'Try again or check your internet connection.'
    },
    UNKNOWN_ERROR: {
      message: 'Unknown location error',
      userMessage: 'An unexpected error occurred with location services.',
      canRetry: true,
      fallbackAvailable: true,
      actionRequired: 'Try refreshing the page or contact support if the issue persists.'
    }
  };

  const baseError = baseErrors[type];
  let enhancedMessage = baseError.message;
  let enhancedUserMessage = baseError.userMessage;

  // Enhance messages with context and original error details
  if (context) {
    enhancedMessage = `${enhancedMessage} (${context})`;
  }

  if (originalError) {
    if (originalError.message) {
      enhancedMessage = `${enhancedMessage}: ${originalError.message}`;
    }
    
    // Add specific user-friendly messages based on common error patterns
    if (originalError.code === 'OVER_QUERY_LIMIT') {
      enhancedUserMessage = 'Location service quota exceeded. Please try again in a few minutes.';
    } else if (originalError.code === 'REQUEST_DENIED') {
      enhancedUserMessage = 'Location service access denied. Please check your API configuration.';
    } else if (originalError.code === 'ZERO_RESULTS') {
      enhancedUserMessage = 'No results found for your location. Please verify your address.';
    } else if (originalError.name === 'NetworkError') {
      enhancedUserMessage = 'Network error occurred. Please check your internet connection.';
    }
  }

  return {
    type,
    message: enhancedMessage,
    userMessage: enhancedUserMessage,
    canRetry: baseError.canRetry,
    fallbackAvailable: baseError.fallbackAvailable,
    actionRequired: baseError.actionRequired
  };
};

// Check if an error is retryable
export const isRetryableError = (error: LocationError): boolean => {
  return error.canRetry && !['PERMISSION_DENIED', 'LOCATION_UNAVAILABLE'].includes(error.type);
};

// Get retry delay based on attempt number (exponential backoff)
export const getRetryDelay = (attemptNumber: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = baseDelay * Math.pow(2, attemptNumber);
  return Math.min(delay, maxDelay);
};

// Check if fallback UI should be shown
export const shouldShowFallback = (error: LocationError, retryAttempts: number): boolean => {
  return error.fallbackAvailable && (!error.canRetry || retryAttempts >= 3);
};

// Get user-friendly error message with action guidance
export const getErrorDisplayMessage = (error: LocationError): string => {
  let message = error.userMessage;
  if (error.actionRequired) {
    message += ` ${error.actionRequired}`;
  }
  return message;
};

// Log error for debugging (in development) and monitoring (in production)
export const logLocationError = (error: LocationError, context?: any): void => {
  const logData = {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Location Error:', logData);
  } else {
    // In production, you might want to send this to a logging service
    console.warn('Location service error:', error.type, error.userMessage);
  }
};

// Validate Singapore coordinates
export const isValidSingaporeCoordinates = (lat: number, lng: number): boolean => {
  const SINGAPORE_BOUNDS = {
    north: 1.4784,
    south: 1.2290,
    east: 104.0120,
    west: 103.6000
  };

  return lat >= SINGAPORE_BOUNDS.south && 
         lat <= SINGAPORE_BOUNDS.north && 
         lng >= SINGAPORE_BOUNDS.west && 
         lng <= SINGAPORE_BOUNDS.east;
};

// Format coordinates for display
export const formatCoordinates = (coordinates: [number, number]): string => {
  const [lat, lng] = coordinates;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export default {
  createLocationError,
  isRetryableError,
  getRetryDelay,
  shouldShowFallback,
  getErrorDisplayMessage,
  logLocationError,
  isValidSingaporeCoordinates,
  formatCoordinates
};