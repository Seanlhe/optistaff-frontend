import { InputFieldProps } from "../types/components"
export default function CustomInputField({title, disabled, name, type, placeholder, value, error, className, onChange, numericOnly = false, maxLength}: InputFieldProps){
    
    // Handle numeric input validation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!numericOnly) return; // Skip validation if not numeric-only
        
        // Allow: backspace, delete, tab, escape, enter, home, end, left, right arrows
        if ([8, 9, 27, 13, 46, 35, 36, 37, 39].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        
        // For postal code (6 digit limit), only allow digits
        if (maxLength === 6) {
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
            return;
        }
        
        // For other numeric fields, allow digits and decimal point
        // Allow decimal point (190, 110) only if there isn't one already
        if ((e.keyCode === 190 || e.keyCode === 110)) {
            if (e.currentTarget.value.indexOf('.') !== -1) {
                e.preventDefault();
            }
            return;
        }
        // Only allow digits
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    };

    // Handle input change with numeric filtering
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (numericOnly) {
            const { value } = e.target;
            
            // For postal code (6 digit limit), only allow digits and limit length
            if (maxLength === 6) {
                const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
                e.target.value = numericValue;
            } else {
                // For other numeric fields, allow digits and one decimal point
                const numericValue = value.replace(/[^0-9.]/g, '');
                const parts = numericValue.split('.');
                const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                e.target.value = cleanValue;
            }
        }
        
        // Call the original onChange handler
        onChange(e);
    };

    return <div className={`w-full flex flex-col gap-1 ${className}`}>
        <label className="text-base text-primary-text font-montserrat-smb">{title}</label>
        <input 
            disabled={disabled} 
            type={type}  
            name={name} 
            placeholder={placeholder} 
            defaultValue={value} 
            className={`
                hover:bg-gray-50 w-full rounded-md bg-white border-1 px-3 py-2 text-sm focus:outline-none font-montserrat placeholder:text-secondary-text
                ${error == null? 'border-border focus:border-primary-blue' : 'border-pink-500'}
            `} 
            onChange={handleInputChange} 
            onKeyDown={handleKeyDown}
        />
        <div className="h-4">
            {error!=null? <p className="text-xs text-center text-pink-500 font-montserrat">{error}</p>:null}
        </div>
    </div>
}