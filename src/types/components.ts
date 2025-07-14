export interface IconButtonProps{
    text: string,
    src: string
    onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
}

export interface CircleButtonProps{
    className: string,
    src: string
}

export interface ShiftCardProps{
    title: string,
    date: string,
    time: string,
    staffNo: number,
    unfilledStaff: number
}

export interface InputFieldProps{
    name: string,
    title: string,
    placeholder?: string,
    className?: string,
    type?: string,
    valid?: boolean,
    error?: string|null
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export interface LoginFormProps{
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
export interface CompanyFormProps{
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    companyData: CompanyFormData
}
export interface EmployeeFormProps{
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    employeeData: EmployeeFormData
}

export type LoginFormData = {
    email: string,
    password: string
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

export type JobFormData = {
    jobTitle: string,
    date: string,
    startTime: string,
    endTime: string,
    address: string,
    zipCode: string,
    payRate: number,
    noPax: number,
    description: string
}

export interface ClientShiftProps { 
    id: string;
    startTime: string;
    endTime: string;
    date: string;
    location: string;
    jobTitle: string;
    payRate: number;
    employeeName?: string; // Optional, as it may not be assigned yet
}