import { SelectProps } from "../types/components"
export default function CustomSelect({title,disabled, name, options, value, valid, error, className, onInput}: SelectProps){
    return <div className={`w-full h-15 flex flex-col gap-1 ${className}`}>
        <label className="text-base text-secondary-text font-montserrat-smb">{title}</label>
        <select disabled={disabled} name = {name} defaultValue={value} className={`
           hover:bg-gray-50 w-full h-full rounded-md bg-white border-1 px-3 py-2 text-sm focus:outline-none font-montserrat placeholder:text-secondary-text
          ${valid==true || error == null? 'border-white focus:border-primary-blue' : 'border-pink-500 text-pink-600 shadow'}
        `} onInput={onInput}>
            <option value="" disabled hidden>
                Choose an option
            </option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && !valid? <p className="text-xs text-center text-pink-500 font-montserrat">{error}</p>:null}
    </div>
}