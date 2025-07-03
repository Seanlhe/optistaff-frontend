export interface IconButtonProps{
    text: string,
    src: string
}

export interface CircleButtonProps{
    className: string,
    src: string
}

export interface ShiftCardProps{
    title: string,
    date: string,
    time: string,
    staffNo: number
}

export interface InputFieldProps{
    name: string,
    title: string,
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export interface LoginFormProps{
    handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export type CompanyFormData = {
    companyName: string,
    address: string,
    zipCode: string,
    mobileNo: string,
    officeNo: string,
    email: string,
    password: string,
    confirmPassword: string
}

export type EmployeeFormData = {
    firstName: string,
    lastName: string,
    birthday: string, 
    address: string,
    zipCode: string,
    mobileNo: string,
    email: string,
    password: string,
    confirmPassword: string
}