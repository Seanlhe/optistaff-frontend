import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { PasswordData, PasswordChangeProps } from '../../types/components';

const PasswordChangeModal = ({
  isOpen,
  onClose,
  passwordData,
  passwordErrors,
  onPasswordChange,
  onSubmit,
  isLoading,
}: PasswordChangeProps) => {
  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: 'No password', color: 'text-secondary-text' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'Medium', color: 'text-yellow-500' };
    }
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card-color border border-border rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-border">
          <h3 className="text-xl font-montserrat-smb text-primary-text">Change Password</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-primary-text font-montserrat">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange('currentPassword', e.target.value)}
              placeholder="Enter current password"
              className={`border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-primary-text font-montserrat">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange('newPassword', e.target.value)}
              placeholder="Enter new password"
              className={`border ${passwordErrors.newPassword ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            {passwordData.newPassword && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-primary-text">Strength:</span>
                <span className={`text-sm ${passwordStrength.color}`}>
                  {passwordStrength.strength}
                </span>
              </div>
            )}
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-primary-text font-montserrat">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange('confirmPassword', e.target.value)}
              placeholder="Confirm new password"
              className={`border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-border'} bg-card-color text-primary-text rounded-lg`}
            />
            {passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Passwords match
              </p>
            )}
            {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Passwords do not match
              </p>
            )}
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              className="flex-1 bg-secondary-bg text-primary-text hover:bg-secondary-bg/80 border border-border rounded-lg py-2 font-montserrat"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary-blue text-white hover:bg-primary-blue/80 rounded-lg py-2 font-montserrat"
              disabled={
                isLoading || 
                Object.keys(passwordErrors).some(key => passwordErrors[key]) || 
                passwordData.newPassword !== passwordData.confirmPassword
              }
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
