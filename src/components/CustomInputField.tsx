import { InputFieldProps } from "../types/components"
export default function CustomInputField({title, disabled, name, type, placeholder, value, error, className, onChange}: InputFieldProps){
    return <div className={`w-full h-15 flex flex-col gap-1 ${className}`}>
        <label className="text-base text-secondary-text font-montserrat-smb">{title}</label>
        <input disabled={disabled} type={type}  name = {name} placeholder={placeholder} defaultValue={value} className={`
           hover:bg-gray-50 w-full rounded-md bg-white border-1 px-3 py-2 text-sm focus:outline-none font-montserrat placeholder:text-secondary-text
          ${error == null? 'border-white focus:border-primary-blue' : 'border-pink-500'}
        `} onChange={onChange}/>
        {error!=null? <p className="text-xs text-center text-pink-500 font-montserrat">{error}</p>:null}
    </div>
}