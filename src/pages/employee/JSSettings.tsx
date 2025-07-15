import { useState } from 'react';
import ProfileInformationCard from '../../components/settings/ProfileInformationCard';
import AccountInformationCard from '../../components/settings/AccountInformationCard';
import PasswordChangeModal from '../../components/settings/PasswordChange';
import { FormData, PasswordData, UserInfo } from '../../types/components';
import { Button } from '../../components/ui/button';

const JSSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // Profile form data (placeholder in components)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    paymentMethod: '',
    isEmailVerified: false,
    isPhoneVerified: false
  });

  // Password form data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const userInfo: UserInfo = {
    userId: '',
    email: '',
    memberSince: '',
    lastLogin: ''
  };

  // Validation logic 
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value) return 'Email is required';
        // Add more validation as needed
        return '';
      case 'phoneNumber':
        if (!value) return 'Phone number is required';
        return '';
      case 'firstName':
      case 'lastName':
        if (!value) return 'Name is required';
        return '';
      default:
        return '';
    }
  };

  const validatePassword = (field: string, value: string): string => {
    switch (field) {
      case 'currentPassword':
        if (!value) return 'Current password is required';
        return '';
      case 'newPassword':
        if (!value) return 'New password is required';
        return '';
      case 'confirmPassword':
        if (value !== passwordData.newPassword) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    const error = validatePassword(field, value);
    setPasswordErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Validate all fields
    const errors: Record<string, string> = {};
    Object.entries(formData).forEach(([field, value]) => {
      if (typeof value === 'string') {
        const error = validateField(field, value);
        if (error) errors[field] = error;
      }
    });
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      alert('Please fix the errors before submitting.');
      return;
    }
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Validate all password fields
    const errors: Record<string, string> = {};
    Object.entries(passwordData).forEach(([field, value]) => {
      const error = validatePassword(field, value);
      if (error) errors[field] = error;
    });
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setIsLoading(false);
      alert('Please fix the errors before submitting.');
      return;
    }
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password updated successfully!');
      setIsPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (error) {
      alert('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = () => {
    alert('Verification email sent! Please check your email.');
  };

  const handleVerifyPhone = () => {
    alert('Verification SMS sent! Please check your phone.');
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-montserrat-b text-primary-text mb-2">Settings</h1>
          <p className="text-secondary-text">Manage your profile, account, and preferences</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfileInformationCard
            formData={formData}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onVerifyEmail={handleVerifyEmail}
            onVerifyPhone={handleVerifyPhone}
          />
          <div className="border-t border-border my-6"></div>
          <AccountInformationCard
            userInfo={userInfo}
            onPasswordChangeClick={() => setIsPasswordDialogOpen(true)}
          />
          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-primary-blue text-white hover:bg-primary-blue/80 rounded-lg py-3 font-montserrat"
              disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key])}
            >
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              className="flex-1 bg-secondary-bg text-primary-text hover:bg-secondary-bg/80 border border-border rounded-lg py-3 font-montserrat"
              onClick={() => setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                address: '',
                paymentMethod: '',
                isEmailVerified: false,
                isPhoneVerified: false
              })}
            >
              Cancel
            </Button>
          </div>
        </form>
        <PasswordChangeModal
          isOpen={isPasswordDialogOpen}
          onClose={() => setIsPasswordDialogOpen(false)}
          passwordData={passwordData}
          passwordErrors={passwordErrors}
          onPasswordChange={handlePasswordChange}
          onSubmit={handlePasswordSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default JSSettings;
