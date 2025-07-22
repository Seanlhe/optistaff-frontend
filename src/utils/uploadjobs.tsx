
import { format } from "path";
import { startTransition } from "react"
export type ShiftObject = {
    title: string,
    category: string,
    description: string,
    address: string,
    zipCode: string,
    date: string,
    startTime: string,
    endTime: string,
    payRate: number,
    staffNo: number,
    unfilledStaff: number|null
}


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

export const formatTime = (rawTime: string) => {
    const time_arr = rawTime.split(" ");
    const hours = time_arr[0].slice(0,2);
    const minutes = time_arr[0].slice(3, 5);
    let hoursInt: number = parseInt(hours);
    if (time_arr[1] == "PM"){
        if (hoursInt < 12){
            hoursInt += 12;
        }
    }
    return `${hoursInt}:${minutes}`;
}

export const getError = (shiftObject: ShiftObject)=>{
    if (getEmptyError(shiftObject)){
        return getEmptyError(shiftObject);
    };
    if (shiftObject.payRate <= 0){
        return "pay rate must be more than zero.";
    }
    if (shiftObject.staffNo <= 0){
        return "staff required must be more than zero.";
    }if (!checkTimeValid(formatTime(shiftObject.startTime), formatTime(shiftObject.endTime))){
        return "end time cannot be before start time.";
    }
    return null;    
}

const getEmptyError = (shiftObject: ShiftObject) =>{
    if (shiftObject.title.length == 0){
        return getEmptyMessage("title")
    }else if (shiftObject.description.length == 0){
        return getEmptyMessage("description")
    }else if (shiftObject.category.length == 0){
        return getEmptyMessage("category")
    }else if (shiftObject.address.length == 0){
        return getEmptyMessage("address")
    }else if (shiftObject.zipCode.length == 0){
        return getEmptyMessage("zip code")
    }else if (shiftObject.startTime.length == 0){
        return getEmptyMessage("start time")
    }else if (shiftObject.endTime.length == 0){
        return getEmptyMessage("end time")
    }else if (shiftObject.date.length == 0){
        return getEmptyMessage("date")
    }else if (isNaN(shiftObject.staffNo)){
        return getEmptyMessage("staff no.")
    }else if (isNaN(shiftObject.payRate)){
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