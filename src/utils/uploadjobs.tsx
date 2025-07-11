import { startTransition } from "react"

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



export const getTimeError = (startTime: string, endTime: string)=>{
    if (!checkTimeValid(startTime, endTime)){
        return "End time cannot be before start time."
    }
}