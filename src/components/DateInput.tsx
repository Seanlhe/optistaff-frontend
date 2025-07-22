/**
 * Date Input Component
 * @description Enhanced date picker for date of birth with validation
 */

import { FC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Label } from './ui/label';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const DateInput: FC<DateInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder = 'Select date...',
}) => {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format date as YYYY-MM-DD for consistency
      const formattedDate = date.toISOString().split('T')[0];
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  const parseValue = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  };

  // Calculate max date (18 years ago for job seekers)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  // Calculate min date (reasonable working age limit)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 80);

  return (
    <div className="space-y-2">
      <Label htmlFor={`datepicker-${label}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <DatePicker
          id={`datepicker-${label}`}
          selected={parseValue(value)}
          onChange={handleDateChange}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          maxDate={maxDate}
          minDate={minDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={62} // Show 62 years (18 to 80)
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm text-sm placeholder:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            bg-white
          `}
          wrapperClassName="w-full"
          calendarClassName="shadow-lg border border-gray-200 rounded-md"
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      
      {required && (
        <p className="text-xs text-gray-500 mt-1">
          Must be at least 18 years old
        </p>
      )}
    </div>
  );
};
