/**
 * Confirm Password Field Component
 * @description Password confirmation field with real-time validation
 */

import { FC, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface ConfirmPasswordFieldProps {
  password: string;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export const ConfirmPasswordField: FC<ConfirmPasswordFieldProps> = ({
  password,
  confirmPassword,
  onConfirmPasswordChange,
  label = 'Confirm Password',
  required = true,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const showValidation = confirmPassword.length > 0;

  const getValidationColor = () => {
    if (!showValidation) return '';
    return passwordsMatch ? 'border-green-500' : 'border-red-500';
  };

  const getValidationIcon = () => {
    if (!showValidation) return null;
    return passwordsMatch ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-red-500" />
    );
  };

  const getValidationMessage = () => {
    if (!showValidation) return null;
    
    if (confirmPassword.length === 0) return null;
    
    if (passwordsMatch) {
      return (
        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
          <Check className="h-3 w-3" />
          Passwords match
        </p>
      );
    } else {
      return (
        <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
          <X className="h-3 w-3" />
          Passwords do not match
        </p>
      );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="confirmPassword">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="Re-enter your password"
          disabled={disabled}
          className={`pr-16 ${getValidationColor()}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {getValidationIcon()}
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
            disabled={disabled}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      
      {getValidationMessage()}
      
      {required && (
        <p className="text-xs text-gray-500">
          Password confirmation is required
        </p>
      )}
    </div>
  );
};
