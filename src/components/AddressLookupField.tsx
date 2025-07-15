/**
 * Address Lookup Field Component
 * @description Smart address input with postal code auto-fill for Singapore
 */

import { FC, useState, useEffect } from 'react';
import { useAddressLookup } from '../hooks/useAddressLookup';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Check, X, Loader2 } from 'lucide-react';

interface AddressLookupFieldProps {
  postalCode: string;
  address: string;
  onPostalCodeChange: (postalCode: string) => void;
  onAddressChange: (address: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const AddressLookupField: FC<AddressLookupFieldProps> = ({
  postalCode,
  address,
  onPostalCodeChange,
  onAddressChange,
  label = "Address",
  placeholder = "Enter your full Singapore address",
  required = false,
  disabled = false,
}) => {
  const { loading, error, postalCode: lookupResult, lookupPostalCode, clearError } = useAddressLookup();
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Update postal code and validation state when lookup result changes
  useEffect(() => {
    if (lookupResult && !isManualEdit) {
      onPostalCodeChange(lookupResult);
      setValidationState('valid');
    }
  }, [lookupResult, isManualEdit, onPostalCodeChange]);

  // Update validation state based on errors
  useEffect(() => {
    if (error && !isManualEdit) {
      setValidationState('invalid');
    }
  }, [error, isManualEdit]);

  const handleLookup = async () => {
    if (!address || address.trim().length < 5) return;
    setValidationState('validating');
    await lookupPostalCode(address);
  };

  const handleAddressChange = (value: string) => {
    onAddressChange(value);
    clearError();
    setIsManualEdit(false); // Reset manual edit when user types
    setValidationState('idle'); // Reset validation state when user types
    
    // Clear postal code if address is too short
    if (value.trim().length < 5) {
      onPostalCodeChange('');
    }
  };

  const handleValidateAddress = () => {
    setIsManualEdit(false);
    handleLookup();
  };

  const handlePostalCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, '').slice(0, 6);
    onPostalCodeChange(digits);
    setIsManualEdit(true);
  };

  // Function to render validation indicator
  const renderValidationIndicator = () => {
    switch (validationState) {
      case 'validating':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        );
      case 'valid':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <Check className="h-4 w-4 text-green-500" />
          </div>
        );
      case 'invalid':
        return (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <X className="h-4 w-4 text-red-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Address Field - Now the primary input */}
      <div className="space-y-2">
        <Label htmlFor="address">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || loading}
              className={`${error && !error.includes('postal code') ? 'border-red-500' : ''} ${
                validationState === 'valid' ? 'border-green-500' : ''
              } ${validationState === 'invalid' ? 'border-red-500' : ''}`}
            />
            
            {renderValidationIndicator()}
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateAddress}
            disabled={disabled || loading || address.trim().length < 5}
            className="shrink-0"
          >
            {loading ? 'Validating...' : 'Validate'}
          </Button>
        </div>
        
        {error && !error.includes('postal code') && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <div className="text-xs text-gray-500">
          {validationState === 'idle' && (
            <p>Click "Validate" to auto-fill postal code</p>
          )}
          {validationState === 'validating' && (
            <p className="text-blue-600">Validating address... (this may take up to 10 seconds)</p>
          )}
          {validationState === 'valid' && (
            <p className="text-green-600">✓ Valid address - postal code auto-filled</p>
          )}
          {validationState === 'invalid' && (
            <p className="text-red-600">✗ Please check address or enter postal code manually</p>
          )}
        </div>
      </div>

      {/* Postal Code Field - Now auto-filled */}
      <div className="space-y-2">
        <Label htmlFor="postalCode">
          Postal Code
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <Input
          id="postalCode"
          type="text"
          value={postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          placeholder="123456"
          maxLength={6}
          disabled={disabled}
          className={`${error && error.includes('postal code') ? 'border-red-500' : ''}`}
        />
        
        {error && error.includes('postal code') && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {isManualEdit && postalCode && (
          <p className="text-xs text-blue-600">
            ✓ Postal code edited manually
          </p>
        )}
        
        {!isManualEdit && postalCode && address.trim().length >= 5 && (
          <p className="text-xs text-green-600">
            ✓ Postal code auto-populated from address
          </p>
        )}
      </div>
    </div>
  );
};
