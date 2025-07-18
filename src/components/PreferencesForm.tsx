import { useState, useEffect } from "react";
import { Map } from "./Map";
import PreferencesJobType from "./PreferencesJobType";
import PreferencesMaximum from "./PreferencesMaximum";
import PreferencesPay from "./PreferencesPay";
import { usePreferences } from "../hooks/usePreferences";
import { PreferencesFormData } from "../types/hooks";
import { isPreferencesSchemaUpToDate } from "../utils/preferencesValidator";

const PreferencesForm = () => {
  const { preferences, savePreferences, loading, error, getFormData } = usePreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Form state - this will be populated by child components
  const [formData, setFormData] = useState<PreferencesFormData>({
    payRate: 20,
    considerLowerRate: false,
    maxHoursPerWeek: 40,
    maxHoursPerShift: 8,
    maxTravelKm: 50,
    selectedJobNames: []
  });

  // Check if preferences schema is up to date
  useEffect(() => {
    if (preferences && !isPreferencesSchemaUpToDate(preferences)) {
      setSchemaError("Your preferences schema is outdated. Please contact support.");
    } else {
      setSchemaError(null);
    }
  }, [preferences]);

  // Load existing preferences into form
  useEffect(() => {
    const existingFormData = getFormData();
    if (existingFormData) {
      setFormData(existingFormData);
    }
  }, [getFormData]);

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
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {schemaError && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md">
          {schemaError}
        </div>
      )}
      
      {submitSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
          Preferences saved successfully!
        </div>
      )}

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
      <Map />
      
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