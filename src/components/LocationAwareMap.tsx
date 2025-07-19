import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Circle, useMapEvents, Marker } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Singapore's approximate boundaries
const SINGAPORE_BOUNDS: L.LatLngBoundsExpression = [
  [1.2290, 103.6000], // Southwest corner
  [1.4784, 104.0120], // Northeast corner
];

// Singapore center coordinates
const SINGAPORE_CENTER: L.LatLngExpression = [1.3521, 103.8198];

// Custom home marker icon
const createHomeIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: #2563eb;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'home-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to set map bounds and handle map initialization
interface MapBoundsProps {
  homeLocation?: [number, number];
  onMapReady: () => void;
  onMapError: (error: MapError) => void;
}

const MapBounds: React.FC<MapBoundsProps> = ({ homeLocation, onMapReady, onMapError }) => {
  const map = useMap();
  
  useEffect(() => {
    try {
      map.setMaxBounds(SINGAPORE_BOUNDS);
      
      if (homeLocation) {
        // Center on home location with appropriate zoom
        map.setView(homeLocation, 13);
      } else {
        // Fallback to Singapore bounds
        map.fitBounds(SINGAPORE_BOUNDS);
      }
      
      // Map is ready
      onMapReady();
    } catch (err) {
      onMapError({
        type: 'MAP_LOAD_FAILED',
        message: 'Failed to initialize map view',
        canRetry: true,
        fallbackAvailable: true
      });
    }
  }, [map, homeLocation, onMapReady, onMapError]);

  return null;
};

// Error types for map-related failures
export type MapErrorType = 
  | 'MAP_LOAD_FAILED'
  | 'GEOCODING_FAILED'
  | 'LOCATION_UNAVAILABLE'
  | 'API_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface MapError {
  type: MapErrorType;
  message: string;
  canRetry: boolean;
  fallbackAvailable: boolean;
}

// Props interface for LocationAwareMap
export interface LocationAwareMapProps {
  homeLocation?: [number, number]; // Coordinates from geocoded address
  travelRadius: number; // max_travel_km in kilometers
  onRadiusChange: (radius: number) => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  onLocationError?: (error: MapError) => void;
  onRetry?: () => void;
}

export const LocationAwareMap: React.FC<LocationAwareMapProps> = ({
  homeLocation,
  travelRadius,
  onRadiusChange,
  loading = false,
  error = null,
  className = "",
  onLocationError,
  onRetry
}) => {
  // Convert km to meters for circle display
  const radiusInMeters = travelRadius * 1000;
  
  // Use home location or fallback to Singapore center
  const mapCenter = homeLocation || SINGAPORE_CENTER;
  
  // Handle radius slider changes with visual feedback
  const [localRadius, setLocalRadius] = useState(travelRadius);
  const [isAdjusting, setIsAdjusting] = useState(false);
  
  // Enhanced error handling state
  const [mapError, setMapError] = useState<MapError | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const mapLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Maximum retry attempts
  const MAX_RETRY_ATTEMPTS = 3;
  
  useEffect(() => {
    setLocalRadius(travelRadius);
  }, [travelRadius]);

  // Create error objects with appropriate metadata
  const createMapError = useCallback((type: MapErrorType, message: string): MapError => {
    const canRetry = ['MAP_LOAD_FAILED', 'NETWORK_ERROR', 'GEOCODING_FAILED'].includes(type);
    const fallbackAvailable = ['MAP_LOAD_FAILED', 'API_UNAVAILABLE'].includes(type);
    
    return {
      type,
      message,
      canRetry,
      fallbackAvailable
    };
  }, []);

  // Handle map loading timeout
  const handleMapLoadTimeout = useCallback(() => {
    const error = createMapError('MAP_LOAD_FAILED', 'Map is taking too long to load. Please check your internet connection.');
    setMapError(error);
    setMapLoading(false);
    onLocationError?.(error);
  }, [createMapError, onLocationError]);

  // Detect if Google Maps/Leaflet is available
  const checkMapAvailability = useCallback(() => {
    try {
      // Check if Leaflet is available
      if (typeof L === 'undefined') {
        throw new Error('Leaflet library not available');
      }
      
      // Check if we can create a basic map instance
      const testDiv = document.createElement('div');
      testDiv.style.display = 'none';
      document.body.appendChild(testDiv);
      
      try {
        const testMap = L.map(testDiv, { center: [0, 0], zoom: 1 });
        testMap.remove();
        document.body.removeChild(testDiv);
        return true;
      } catch (mapError) {
        document.body.removeChild(testDiv);
        throw mapError;
      }
    } catch (err) {
      const error = createMapError('API_UNAVAILABLE', 'Map services are currently unavailable. Please try again later.');
      setMapError(error);
      setShowFallback(true);
      onLocationError?.(error);
      return false;
    }
  }, [createMapError, onLocationError]);

  // Check map availability on mount
  useEffect(() => {
    const isAvailable = checkMapAvailability();
    if (!isAvailable) {
      setMapLoading(false);
    }
  }, [checkMapAvailability]);

  // Set up map loading timeout
  useEffect(() => {
    if (mapLoading && !mapError) {
      mapLoadTimeoutRef.current = setTimeout(handleMapLoadTimeout, 5000); // 5 second timeout
    }
    
    return () => {
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current);
      }
    };
  }, [mapLoading, mapError, handleMapLoadTimeout]);

  // Reset error state when location changes
  useEffect(() => {
    if (homeLocation && mapError?.type === 'LOCATION_UNAVAILABLE') {
      setMapError(null);
    }
  }, [homeLocation, mapError]);

  const handleRadiusChange = useCallback((newRadius: number) => {
    setLocalRadius(newRadius);
    onRadiusChange(newRadius);
  }, [onRadiusChange]);

  const handleSliderStart = useCallback(() => {
    setIsAdjusting(true);
  }, []);

  const handleSliderEnd = useCallback(() => {
    setIsAdjusting(false);
  }, []);

  // Handle retry attempts
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setShowFallback(true);
      return;
    }
    
    setRetryCount(prev => prev + 1);
    setMapError(null);
    setMapLoading(true);
    onRetry?.();
  }, [retryCount, onRetry]);

  // Handle map initialization success
  const handleMapReady = useCallback(() => {
    setMapLoading(false);
    setMapError(null);
    if (mapLoadTimeoutRef.current) {
      clearTimeout(mapLoadTimeoutRef.current);
    }
  }, []);

  // Enhanced error display component
  const ErrorDisplay = () => {
    const displayError = mapError || (error ? { type: 'UNKNOWN_ERROR' as MapErrorType, message: error, canRetry: false, fallbackAvailable: false } : null);
    
    if (!displayError) return null;
    
    const getErrorIcon = (errorType: MapErrorType) => {
      switch (errorType) {
        case 'NETWORK_ERROR':
          return (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'API_UNAVAILABLE':
          return (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 5.636m-12.728 12.728L5.636 18.364" />
            </svg>
          );
        case 'LOCATION_UNAVAILABLE':
          return (
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          );
        default:
          return (
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          );
      }
    };
    
    return (
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getErrorIcon(displayError.type)}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              {displayError.type === 'MAP_LOAD_FAILED' && 'Map Loading Failed'}
              {displayError.type === 'GEOCODING_FAILED' && 'Location Services Error'}
              {displayError.type === 'NETWORK_ERROR' && 'Network Connection Error'}
              {displayError.type === 'API_UNAVAILABLE' && 'Map Services Unavailable'}
              {displayError.type === 'LOCATION_UNAVAILABLE' && 'Location Not Available'}
              {displayError.type === 'UNKNOWN_ERROR' && 'Unexpected Error'}
            </h3>
            <p className="text-sm text-red-700 mt-1">{displayError.message}</p>
            
            {/* Action buttons */}
            <div className="mt-3 flex space-x-2">
              {displayError.canRetry && retryCount < MAX_RETRY_ATTEMPTS && (
                <button
                  onClick={handleRetry}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                >
                  Retry ({MAX_RETRY_ATTEMPTS - retryCount} attempts left)
                </button>
              )}
              {displayError.fallbackAvailable && (
                <button
                  onClick={() => setShowFallback(true)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md transition-colors"
                >
                  Use Manual Input
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced loading overlay component
  const LoadingOverlay = () => {
    const isLoading = loading || mapLoading;
    if (!isLoading) return null;
    
    const getLoadingMessage = () => {
      if (loading && mapLoading) return 'Loading location and map...';
      if (loading) return 'Loading location data...';
      if (mapLoading) return 'Initializing map...';
      return 'Loading...';
    };
    
    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[1000] rounded-lg">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">{getLoadingMessage()}</span>
          </div>
          
          {/* Progress indicator for long loading times */}
          {(loading || mapLoading) && (
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-center max-w-xs">
            {mapLoading && 'Setting up interactive map with your location preferences...'}
            {loading && !mapLoading && 'Retrieving your saved location settings...'}
          </p>
        </div>
      </div>
    );
  };

  // Fallback UI when maps are unavailable
  const FallbackUI = () => {
    if (!showFallback) return null;
    
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Map Unavailable</h3>
          <p className="mt-1 text-sm text-gray-500">
            Interactive map is currently unavailable. You can still set your travel preferences below.
          </p>
          
          {/* Manual coordinate input */}
          <div className="mt-4 p-4 bg-white rounded-md border">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Manual Location Input</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="1.3521"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  placeholder="103.8198"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  disabled
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Manual coordinate input will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Fallback message when no home location is available
  const NoLocationMessage = () => {
    if (homeLocation || showFallback) return null;
    
    return (
      <div className="absolute top-4 left-4 right-4 z-[1000] bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              No home location found. Please update your profile to see your location on the map.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Travel Distance Preferences</h3>
        <p className="text-sm text-gray-600">
          {homeLocation 
            ? "Your home location is marked in blue. The circle shows your maximum travel distance."
            : "Map shows Singapore. Set your home location in your profile to see personalized travel radius."
          }
        </p>
      </div>

      {/* Map Container or Fallback */}
      <div className="relative">
        {showFallback ? (
          <FallbackUI />
        ) : (
          <div 
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden" 
            style={{ height: '400px' }}
          >
            <MapContainer
              center={mapCenter}
              zoom={homeLocation ? 13 : 11}
              style={{ height: '100%', width: '100%' }}
              minZoom={10}
              maxZoom={18}
              zoomControl={true}
              scrollWheelZoom={true}
              className="rounded-lg"
              whenReady={() => handleMapReady()}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                errorTileUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTkiPk1hcCBUaWxlIEVycm9yPC90ZXh0Pjwvc3ZnPg=="
              />
              <MapBounds 
                homeLocation={homeLocation} 
                onMapReady={handleMapReady}
                onMapError={setMapError}
              />

              {/* Home location marker */}
              {homeLocation && (
                <Marker
                  position={homeLocation}
                  icon={createHomeIcon()}
                />
              )}

              {/* Travel radius circle with enhanced visual feedback */}
              <Circle
                center={homeLocation || SINGAPORE_CENTER}
                radius={radiusInMeters}
                fillColor={homeLocation ? "#3b82f6" : "#6b7280"}
                fillOpacity={isAdjusting ? 0.2 : 0.1}
                color={homeLocation ? "#2563eb" : "#4b5563"}
                weight={isAdjusting ? 3 : 2}
                opacity={isAdjusting ? 0.8 : 0.6}
                className={isAdjusting ? "circle-adjusting" : ""}
              />
            </MapContainer>

            {/* Overlays */}
            <ErrorDisplay />
            <LoadingOverlay />
            <NoLocationMessage />
          </div>
        )}
      </div>

      {/* Travel Radius Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="travel-radius" className="text-sm font-medium text-gray-700">
            Maximum Travel Distance
          </label>
          <span className={`text-sm font-medium transition-colors duration-200 ${
            isAdjusting ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {localRadius} km
          </span>
        </div>
        
        <div className="space-y-2">
          <input
            id="travel-radius"
            type="range"
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all duration-200 ${
              isAdjusting ? 'h-3 shadow-md' : ''
            }`}
            min="1"
            max="30"
            step="1"
            value={localRadius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value, 10))}
            onMouseDown={handleSliderStart}
            onMouseUp={handleSliderEnd}
            onTouchStart={handleSliderStart}
            onTouchEnd={handleSliderEnd}
            disabled={loading}
          />
          
          {/* Range labels */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 km</span>
            <span>8 km</span>
            <span>15 km</span>
            <span>23 km</span>
            <span>30 km</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Adjust the slider to set your maximum travel distance for job opportunities.
          {homeLocation 
            ? " The circle on the map will update to show your preferred work area."
            : " Set your home location in your profile to see the visual representation."
          }
        </p>
      </div>
    </div>
  );
};

export default LocationAwareMap;