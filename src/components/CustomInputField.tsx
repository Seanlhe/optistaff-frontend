import { InputFieldProps } from "../types/components"
export default function CustomInputField({title, name, type, valid, error, className, onChange}: InputFieldProps){
    return <div className={`w-full h-15 flex flex-col gap-1 ${className}`}>
        <label className="text-base font-montserrat">{title}</label>
        <input  type={type} name = {name} className={`
          hover:border-6 hover:bg-gray-50 w-full h-full rounded-xl bg-white border-4 px-3 py-2 text-sm focus:outline-none font-montserrat
          ${valid==true || valid == null? 'border-secondary-bg focus:border-primary-blue' : 'border-pink-500 text-pink-600'}
        `} onChange={onChange}/>
        {error && !valid? <p className="text-xl text-pink-500 font-montserrat">{error}</p>:null}
    </div>
}
