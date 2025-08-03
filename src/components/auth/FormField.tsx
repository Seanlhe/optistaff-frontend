import { useState, useCallback } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useFieldValidation } from "../../utils/field-validation";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
  enableRealTimeValidation?: boolean; // New optional prop
}

export const FormField = ({
  id,
  label,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  minLength,
  enableRealTimeValidation = false,
}: FormFieldProps) => {
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { validateField, formatField } = useFieldValidation();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Apply real-time formatting if enabled
    if (enableRealTimeValidation) {
      newValue = formatField(id, newValue);
      
      // Validate the formatted input
      if (touched) {
        const validation = validateField(id, newValue);
        setFieldError(validation.isValid ? null : validation.message || null);
      }
    }
    
    // Call parent onChange with formatted value
    onChange(newValue);
  }, [id, touched, enableRealTimeValidation, validateField, formatField, onChange]);

  const handleBlur = useCallback(() => {
    if (enableRealTimeValidation) {
      setTouched(true);
      const validation = validateField(id, value);
      setFieldError(validation.isValid ? null : validation.message || null);
    }
  }, [id, value, enableRealTimeValidation, validateField]);

  const hasError = enableRealTimeValidation && touched && fieldError;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-montserrat-smb">
        {label} {required && <span className="text-red">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        minLength={minLength}
        className={hasError ? "border-red-500 bg-red-50" : ""}
      />
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {fieldError}
        </p>
      )}
    </div>
  );
};
