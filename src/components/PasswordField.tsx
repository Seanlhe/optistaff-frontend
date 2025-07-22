/**
 * Password Field Component
 * @description Password input field with visibility toggle functionality
 */

import { FC, useState } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  error?: string;
}

export const PasswordField: FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
  minLength,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          minLength={minLength}
          className={`pr-12 ${error ? 'border-error' : ''}`}
          required={required}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-text hover:text-primary-text"
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
      
      {error && (
        <p className="text-sm text-error-dark mt-1">{error}</p>
      )}
      
      {minLength && (
        <p className="text-xs text-secondary-text mt-1">
          Minimum {minLength} characters
        </p>
      )}
    </div>
  );
};
