import { useState, useEffect, useCallback } from "react";
import { LocationAwareMap, MapError } from "./LocationAwareMap";
import LocationErrorBoundary from "./LocationErrorBoundary";
import PreferencesJobType from "./PreferencesJobType";
import PreferencesMaximum from "./PreferencesMaximum";
import PreferencesPay from "./PreferencesPay";
import { usePreferences } from "../hooks/usePreferences";
import { PreferencesFormData } from "../types/hooks";


const PreferencesForm = () => {
  const { 
    savePreferences, 
    loading, 
    error, 
    getFormData,
    homeLocation,
    homeAddress,
    geocodeHomeLocation,
    loadLocationData
  } = usePreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [locationError, setLocationError] = useState<MapError | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Form state - this will be populated by child components
  const [formData, setFormData] = useState<PreferencesFormData>({
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15, // More reasonable default for Singapore
    selectedJobNames: []
  });



  // Load existing preferences into form
  useEffect(() => {
    const existingFormData = getFormData();
    if (existingFormData) {
      setFormData(existingFormData);
    }
  }, [getFormData]);

  // Attempt to geocode home location if coordinates are missing
  useEffect(() => {
    if (homeAddress && !homeLocation) {
      geocodeHomeLocation();
    }
  }, [homeAddress, homeLocation, geocodeHomeLocation]);

  // Handle radius changes from the map component
  const handleRadiusChange = (newRadius: number) => {
    setFormData(prev => ({
      ...prev,
      maxTravelKm: newRadius
    }));
  };

  // Handle location errors from the map component
  const handleLocationError = useCallback((error: MapError) => {
    setLocationError(error);
  }, []);

  // Handle retry attempts for location loading
  const handleLocationRetry = useCallback(async () => {
    setRetryAttempts(prev => prev + 1);
    setLocationError(null);
    
    try {
      await loadLocationData();
      if (homeAddress && !homeLocation) {
        await geocodeHomeLocation();
      }
    } catch (err) {
      console.error("Retry failed:", err);
    }
  }, [loadLocationData, homeAddress, homeLocation, geocodeHomeLocation]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const success = await savePreferences(formData);
    
    if (success) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000); // Hide success message after 3s
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-card-color p-8 rounded-xl border border-border">
      

      <PreferencesMaximum 
        formData={formData} 
        setFormData={setFormData} 
      />
      <PreferencesPay 
        formData={formData} 
        setFormData={setFormData} 
      />
      <PreferencesJobType 
        formData={formData} 
        setFormData={setFormData} 
      />
      <LocationErrorBoundary
        onError={(error, errorInfo) => {
          console.error('Location component error:', error, errorInfo);
          setLocationError({
            type: 'UNKNOWN_ERROR',
            message: 'Location component crashed unexpectedly',
            canRetry: true,
            fallbackAvailable: true
          });
        }}
      >
        <LocationAwareMap
          homeLocation={homeLocation || undefined}
          travelRadius={formData.maxTravelKm}
          onRadiusChange={handleRadiusChange}
          loading={loading}
          // error={error}
          className="mt-6"
          onLocationError={handleLocationError}
          onRetry={handleLocationRetry}
        />
      </LocationErrorBoundary>

      {/* General error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Preferences</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location-specific error display */}
      {locationError && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">Location Service Issue</h3>
              <p className="text-sm text-orange-700 mt-1">{locationError.message}</p>
              {locationError.canRetry && retryAttempts < 3 && (
                <button
                  onClick={handleLocationRetry}
                  className="mt-2 text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded-md transition-colors"
                >
                  Try Again ({3 - retryAttempts} attempts left)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {submitSuccess && (
        <div className="mt-4 p-4 bg-green-50 border border-green text-green rounded-lg">
          <div className="flex items-center">
            <span className="text-sm font-medium">Preferences saved successfully!</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || loading}
          className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-primary-blue-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default PreferencesForm;