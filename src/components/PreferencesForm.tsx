import { useState, useEffect, useCallback } from "react";
import { LocationAwareMap, MapError } from "./LocationAwareMap";
import LocationErrorBoundary from "./LocationErrorBoundary";
import PreferencesJobType from "./PreferencesJobType";
import PreferencesMaximum from "./PreferencesMaximum";
import PreferencesPay from "./PreferencesPay";
import { usePreferencesForm } from "../hooks/usePreferencesForm";
import { PreferencesFormData } from "../types/hooks";


const PreferencesForm = () => {
  const {
    savePreferences,
    loading,
    validating,
    error,
    getFormData,
    homeLocation,
  } = usePreferencesForm();

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [mapError, setMapError] = useState<MapError | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Form state - this will be populated by child components
  const [formData, setFormData] = useState<PreferencesFormData>({
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 15, // More reasonable default for Singapore
    selectedJobNames: [],
  });

  // Load existing preferences into form
  useEffect(() => {
    const existingFormData = getFormData();
    if (existingFormData) {
      setFormData(existingFormData);
    }
  }, [getFormData]);

  // Location geocoding is now handled by the form hook

  // Handle radius changes from the map component
  const handleRadiusChange = (newRadius: number) => {
    setFormData((prev) => ({
      ...prev,
      maxTravelKm: newRadius,
    }));
  };

  // Handle location errors from the map component
  const handleLocationError = useCallback((error: MapError) => {
    setMapError(error);
  }, []);

  // Handle retry attempts for location loading
  const handleLocationRetry = useCallback(async () => {
    setRetryAttempts((prev) => prev + 1);
    setMapError(null);
    // Location retry is now handled by the form hook
  }, []);

  const handleSubmit = async () => {
    setSubmitSuccess(false);

    const success = await savePreferences(formData);

    if (success) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000); // Hide success message after 3s
    }
  };

  return (
    <div className="bg-card-color p-8 rounded-xl border border-border">
      <PreferencesMaximum formData={formData} setFormData={setFormData} />
      <PreferencesPay formData={formData} setFormData={setFormData} />
      <PreferencesJobType formData={formData} setFormData={setFormData} />
      <LocationErrorBoundary
        onError={(error, errorInfo) => {
          console.error("Location component error:", error, errorInfo);
          setMapError({
            type: "UNKNOWN_ERROR",
            message: "Location component crashed unexpectedly",
            canRetry: true,
            fallbackAvailable: true,
          });
        }}
      >
        <LocationAwareMap
          homeLocation={homeLocation || undefined}
          travelRadius={formData.maxTravelKm}
          onRadiusChange={handleRadiusChange}
          loading={loading}
          className="mt-6"
          onLocationError={handleLocationError}
          onRetry={handleLocationRetry}
        />
      </LocationErrorBoundary>

      {/* Submit button row with inline error/success messages */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex-1 mr-4">
          {/* General error display inline */}
          {error && (
            <div className="p-3 bg-red/10 border border-red text-red-dark rounded-lg">
              <div className="flex items-center">
                <div>
                  <h3 className="text-sm font-montserrat-smb text-red-dark">
                    Error Loading Preferences
                  </h3>
                  <p className="text-sm text-red-dark font-montserrat">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location-specific error display inline */}
          {mapError && (
            <div className="p-3 bg-red/10 border border-red text-red-dark rounded-lg">
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-montserrat-smb text-red-dark">
                    Location Service Issue
                  </h3>
                  <p className="text-sm text-red-dark font-montserrat">{mapError.message}</p>
                  {mapError.canRetry && retryAttempts < 3 && (
                    <button
                      onClick={handleLocationRetry}
                      className="mt-1 text-sm bg-secondary-bg hover:bg-border text-primary-text px-3 py-1 rounded-md transition-colors font-montserrat-smb"
                    >
                      Try Again ({3 - retryAttempts} attempts left)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Success message inline */}
          {submitSuccess && (
            <div className="p-3 bg-green/10 border border-green text-green-dark rounded-lg">
              <div className="flex items-center">
                <span className="text-sm font-montserrat">
                  Preferences saved successfully!
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || validating}
          className="px-6 py-3 bg-primary-blue text-white rounded-lg font-montserrat-smb hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
        >
          {validating ? "Validating..." : loading ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
};

export default PreferencesForm;
