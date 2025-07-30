import { InputAreaProps } from "../types/components"
export default function CustomTextArea({title, name, disabled, value, placeholder, error, className, onChange}: InputAreaProps){
    return <div className={`w-full h-15 flex flex-col gap-1 ${className}`}>
        <label className="text-base text-secondary-text font-montserrat-smb">{title}</label>
        <textarea disabled={disabled} name = {name} placeholder={placeholder} defaultValue={value} className={`
           hover:bg-gray-50 w-full h-full rounded-md bg-white border-1 px-3 py-2 text-sm focus:outline-none font-montserrat placeholder:text-secondary-text
          ${error == null? 'border-border focus:border-primary-blue' : 'border-pink-500 text-pink-600 shadow'}
        `} onChange={onChange}/>
        {error && <p className="text-xs text-center text-pink-500 font-montserrat">{error}</p>}
    </div>
}