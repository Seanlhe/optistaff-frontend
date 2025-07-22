/**
 * PersonalInfoCard Component
 * @description Editable personal information form
 * Allows editing: phone number, home address, postal code
 * @author OptiStaff Team
 */

import { useState, useEffect } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { PersonalInfoFormData } from "../types/hooks";

const PersonalInfoCard = () => {
  const {
    getPersonalInfoData,
    updatePersonalInfo,
    personalInfoLoading,
    personalInfoError,
    isJobSeeker,
  } = useUserProfile();

  const [formData, setFormData] = useState<PersonalInfoFormData>({
    phoneNumber: "",
    homeAddress: "",
    postalCode: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load existing personal info data
  useEffect(() => {
    const existingData = getPersonalInfoData();
    if (existingData) {
      setFormData(existingData);
    }
  }, [getPersonalInfoData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await updatePersonalInfo(formData);

    if (success) {
      setSubmitSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    const existingData = getPersonalInfoData();
    if (existingData) {
      setFormData(existingData);
    }
    setIsEditing(false);
  };

  // Validate postal code format
  const isValidPostalCode = (code: string) => {
    return /^\d{6}$/.test(code);
  };

  // Check if form has changes
  const hasChanges = () => {
    const existingData = getPersonalInfoData();
    if (!existingData) return true;

    return (
      formData.phoneNumber !== existingData.phoneNumber ||
      formData.homeAddress !== existingData.homeAddress ||
      formData.postalCode !== existingData.postalCode
    );
  };

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Personal Information
        </h2>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={personalInfoLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-400 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">
              Personal information updated successfully!
            </span>
          </div>
        </div>
      )}

      {/* Error message */}
      {personalInfoError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error Updating Information
              </h3>
              <p className="text-sm text-red-700 mt-1">{personalInfoError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Phone Number */}
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                placeholder="+65 XXXX XXXX"
              />
            ) : (
              <p className="text-gray-900 py-2">
                {formData.phoneNumber || "Not provided"}
              </p>
            )}
          </div>

          {/* Home Address */}
          <div>
            <label
              htmlFor="homeAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {isJobSeeker() ? "Home Address" : "Office Address"}
            </label>
            {isEditing ? (
              <textarea
                id="homeAddress"
                value={formData.homeAddress}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    homeAddress: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                placeholder="Enter your full address (e.g., 123 Main Street, #01-01, Singapore)"
              />
            ) : (
              <p className="text-gray-900 py-2 whitespace-pre-wrap">
                {formData.homeAddress || "Not provided"}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Postal Code
            </label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: e.target.value.replace(/\D/g, "").slice(0, 6),
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue ${
                    formData.postalCode &&
                    !isValidPostalCode(formData.postalCode)
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="123456"
                  maxLength={6}
                />
                {formData.postalCode &&
                  !isValidPostalCode(formData.postalCode) && (
                    <p className="mt-1 text-sm text-red-600">
                      Postal code must be exactly 6 digits
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-gray-900 py-2">
                {formData.postalCode || "Not provided"}
              </p>
            )}
          </div>
        </div>

        {/* Submit button - only show when editing */}
        {isEditing && (
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={
                personalInfoLoading ||
                !hasChanges() ||
                (!!formData.postalCode &&
                  !isValidPostalCode(formData.postalCode))
              }
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-blue hover:bg-primary-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {personalInfoLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoCard;
