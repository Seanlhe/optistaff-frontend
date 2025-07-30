/**
 * Date Input Component
 * @description Enhanced date picker for date of birth with validation
 */

import { FC } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export const DateInput: FC<DateInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder = 'Select date...',
  minDate,
  maxDate,
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

  // Use provided date ranges or set reasonable defaults for job scheduling
  const defaultMinDate = new Date(); // Today
  const defaultMaxDate = new Date();
  defaultMaxDate.setFullYear(defaultMaxDate.getFullYear() + 1); // One year from now
  
  const effectiveMinDate = minDate || defaultMinDate;
  const effectiveMaxDate = maxDate || defaultMaxDate;

  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={`datepicker-${label}`} className="text-base text-primary-text font-montserrat-smb">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      
      <DatePicker
        id={`datepicker-${label}`}
        selected={parseValue(value)}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        maxDate={effectiveMaxDate}
        minDate={effectiveMinDate}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        yearDropdownItemNumber={62} // Show 62 years (18 to 80)
        className={`
          hover:bg-gray-50 w-full rounded-md bg-white border-1 px-3 py-2 text-sm focus:outline-none font-montserrat placeholder:text-secondary-text
          ${error ? 'border-pink-500' : 'border-border focus:border-primary-blue'}
        `}
        wrapperClassName="w-full"
        calendarClassName="shadow-lg border border-border-color rounded-md"
      />
      
      <div className="h-4">
        {error && (
          <p className="text-xs text-center text-pink-500 font-montserrat">{error}</p>
        )}
        {required && !error && (
          <p className="text-xs text-center text-secondary-text font-montserrat">
            Must be at least 18 years old
          </p>
        )}
      </div>
    </div>
  );
};
