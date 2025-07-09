import { InputFieldProps } from "@/types/components"
export default function CustomInputField({title, name, type, valid, error, onChange}: InputFieldProps){
    return <div className="w-full flex flex-col gap-4">
        <label className="text-2xl font-montserrat">{title}</label>
        <input  type={type} name = {name} className={`
          w-full h-15 rounded-3xl bg-white border-4 pad-3 indent-2 text-xl focus:outline-none font-montserrat
          ${valid ? 'border-secondary-bg focus:border-primary-blue' : 'border-pink-500 text-pink-600'}
        `} onChange={onChange}/>
        {error && !valid? <p className="text-xl text-pink-500 font-montserrat">{error}</p>:null}
    </div>
}
