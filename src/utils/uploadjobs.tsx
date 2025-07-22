// export type ShiftObject = {
//     title: string,
//     category: string,
//     description: string,
//     address: string,
//     zipCode: string,
//     date: string,
//     startTime: string,
//     endTime: string,
//     payRate: number,
//     staffNo: number,
//     unfilledStaff: number|null
// }
import { format } from "date-fns";
import { Shift } from "../types/hooks";
export type ShiftObject = {
    client_id: string,
    title: string,
    // category: string,
    description: string
    start_time: Date,
    end_time: Date,
    job_location: string,
    pay_rate: number,
    staff_needed: number,
    submission_cycle: 'PRIMARY' | 'SECONDARY',
    break_duration: number,
    status: 0 | 1 | 2
}

export const formatDateRange = (start: Date, end: Date): string => {
    const dayAndDate = format(start, "EEEE, dd/MM/yyyy");     // e.g. "Monday, 12/05/2025"
    const startTime = format(start, "h:mm a");                // e.g. "2:00 PM"
    const endTime = format(end, "h:mm a");                    // e.g. "4:00 PM"
    return `${dayAndDate} ${startTime} - ${endTime}`;
  };



export const checkTimeValid = (startTime: string, endTime: string) => {
    const hour1Str: string = startTime.slice(0, 2);
    const hour2Str: string = endTime.slice(0, 2);
    const min1Str: string = startTime.slice(3, 5);
    const min2Str: string = endTime.slice(3, 5);
    const hour1: number = parseInt(hour1Str);
    const hour2: number = parseInt(hour2Str);
    const min1: number = parseInt(min1Str);
    const min2: number = parseInt(min2Str);
    return hour1 * 60 + min1 <= hour2 * 60 + min2;
}

export const getDate = (date: string, time: string): Date => {
    // 2025-08-29
    const dateArr = date.split(/[-/]/);
    const day = parseInt(dateArr[0]);
    const month = parseInt(dateArr[1]) - 1;
    const year = parseInt(dateArr[2]);
    const timeArr = time.split(":");
    const hours = parseInt(timeArr[0]);
    const min = parseInt(timeArr[1]);
    return new Date(year, month, day, hours, min);
}

export const getDateForm = (date: string, time: string): Date => {
    const dateArr = date.split(/[-/]/);
    const day = parseInt(dateArr[2]);
    const month = parseInt(dateArr[1]) - 1;
    const year = parseInt(dateArr[0]);
    const timeArr = time.split(":");
    const hours = parseInt(timeArr[0]);
    const min = parseInt(timeArr[1]);
    return new Date(year, month, day, hours, min);
}



// export const formatTime = (rawTime: string) => {
//     const time_arr = rawTime.split(" ");
//     const hours = time_arr[0].slice(0,2);
//     const minutes = time_arr[0].slice(3, 5);
//     let hoursInt: number = parseInt(hours);
//     if (time_arr[1] == "PM"){
//         if (hoursInt < 12){
//             hoursInt += 12;
//         }
//     }
//     return `${hoursInt}:${minutes}`;
// }

export const getError = (shiftObject:  Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "client_id">)=>{
    if (getEmptyError(shiftObject)){
        return getEmptyError(shiftObject);
    };
    if (shiftObject.pay_rate <= 0){
        return "pay rate must be more than zero.";
    }
    if (shiftObject.staff_needed <= 0){
        return "staff required must be more than zero.";
    }if (shiftObject.end_time <= shiftObject.start_time){
        return "end time cannot be before start time.";
    }
    return null;    
}

const getEmptyError = (shiftObject:  Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned"| "client_id">) =>{
    if (shiftObject.title.length == 0){
        return getEmptyMessage("title")
    }else if (shiftObject.description.length == 0){
        return getEmptyMessage("description")
    // }else if (shiftObject.category.length == 0){
    //     return getEmptyMessage("category")
    }else if (shiftObject.job_location.length == 0){
        return getEmptyMessage("address")
    }else if (shiftObject.start_time.toString() == "Invalid Date"){
        return getEmptyMessage("start time")
    }else if (shiftObject.end_time.toString() == "Invalid Date"){
        return getEmptyMessage("end time")
    }else if (isNaN(shiftObject.staff_needed)){
        return getEmptyMessage("staff no.")
    }else if (isNaN(shiftObject.pay_rate)){
        return getEmptyMessage("pay rate")
    }
}

export const getEmptyMessage = ( fieldName: string)=>{
    return `Required field ${fieldName} is empty.`
}


export const getTimeError = (startTime: string, endTime: string)=>{
    if (!checkTimeValid(startTime, endTime)){
        return "End time cannot be before start time."
    }
}