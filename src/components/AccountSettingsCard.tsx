/**
 * AccountSettingsCard Component
 * @description Editable account settings form
 * Allows editing: email address and password
 * @author OptiStaff Team
 */

import { useState, useEffect } from "react";
import { useUserProfile } from "../hooks/useUserProfile";
import { AccountSettingsFormData } from "../types/hooks";

const AccountSettingsCard = () => {
  const { 
    getAccountFormData,
    updateAccountSettings,
    accountSettingsLoading,
    accountSettingsError,
    getDisplayData
  } = useUserProfile();

  const [formData, setFormData] = useState<AccountSettingsFormData>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load existing account data
  useEffect(() => {
    const accountData = getAccountFormData();
    setFormData(accountData);
  }, [getAccountFormData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateAccountSettings(formData);
    
    if (success) {
      // Determine success message based on what was changed
      const displayData = getDisplayData();
      const emailChanged = formData.email !== displayData?.email;
      const passwordChanged = formData.newPassword && formData.newPassword.length > 0;
      
      if (emailChanged && passwordChanged) {
        setSuccessMessage('Email and password updated successfully!');
      } else if (emailChanged) {
        setSuccessMessage('Email updated successfully! Please check your email to confirm the change.');
      } else if (passwordChanged) {
        setSuccessMessage('Password updated successfully!');
      } else {
        setSuccessMessage('Account settings updated successfully!');
      }
      
      setSubmitSuccess(true);
      setIsChangingPassword(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    }
  };

  // Check if passwords match
  const passwordsMatch = formData.newPassword === formData.confirmPassword;

  // Check if password meets requirements
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  // Check if form has changes
  const hasChanges = () => {
    const displayData = getDisplayData();
    const emailChanged = formData.email !== displayData?.email;
    const passwordChanged = isChangingPassword && formData.newPassword && formData.newPassword.length > 0;
    
    return emailChanged || passwordChanged;
  };

  // Check if form is valid
  const isFormValid = () => {
    if (isChangingPassword) {
      return (
        formData.newPassword &&
        isValidPassword(formData.newPassword) &&
        passwordsMatch
      );
    }
    return true; // Email-only changes are always valid
  };

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {accountSettingsError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Updating Account</h3>
              <p className="text-sm text-red-700 mt-1">{accountSettingsError}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Email Change Section */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              You'll receive a confirmation email if you change your email address.
            </p>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  if (isChangingPassword) {
                    // Clear password fields when canceling
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }));
                  }
                }}
                className="text-primary-blue hover:text-primary-blue-hover text-sm font-medium"
              >
                {isChangingPassword ? 'Cancel Password Change' : 'Change Password'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                    required={isChangingPassword}
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue ${
                      formData.newPassword && !isValidPassword(formData.newPassword)
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    required={isChangingPassword}
                  />
                  {formData.newPassword && !isValidPassword(formData.newPassword) && (
                    <p className="mt-1 text-sm text-red-600">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300'
                    }`}
                    required={isChangingPassword}
                  />
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-sm text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={accountSettingsLoading || !hasChanges() || !isFormValid()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-blue hover:bg-primary-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {accountSettingsLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Account'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettingsCard;