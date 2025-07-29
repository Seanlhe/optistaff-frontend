import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface FormFieldProps {
  id: string
  label: string
  type?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minLength?: number
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
}: FormFieldProps) => {
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
      />
    </div>
  )
}
