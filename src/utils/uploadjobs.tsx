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
// export type ShiftObject = {
//     client_id: string,
//     title: string,
//     // category: string,
//     description: string
//     start_time: Date,
//     end_time: Date,
//     job_location: string,
//     pay_rate: number,
//     staff_needed: number,
//     submission_cycle: 'PRIMARY' | 'SECONDARY',
//     break_duration: number,
//     status: 0 | 1 | 2
// }

// export const formatDateRange = (start: Date, end: Date): string => {
//     const dayAndDate = format(start, "EEEE, dd/MM/yyyy");     // e.g. "Monday, 12/05/2025"
//     const startTime = format(start, "h:mm a");                // e.g. "2:00 PM"
//     const endTime = format(end, "h:mm a");                    // e.g. "4:00 PM"
//     return `${dayAndDate} ${startTime} - ${endTime}`;
//   };



// export const checkTimeValid = (startTime: string, endTime: string) => {
//     const hour1Str: string = startTime.slice(0, 2);
//     const hour2Str: string = endTime.slice(0, 2);
//     const min1Str: string = startTime.slice(3, 5);
//     const min2Str: string = endTime.slice(3, 5);
//     const hour1: number = parseInt(hour1Str);
//     const hour2: number = parseInt(hour2Str);
//     const min1: number = parseInt(min1Str);
//     const min2: number = parseInt(min2Str);
//     return hour1 * 60 + min1 <= hour2 * 60 + min2;
// }





// const isEmpty = (value: unknown): boolean => {
//     return (
//       value === null ||
//       value === undefined ||
//       (typeof value === "string" && value.trim() === "") ||
//       (typeof value === "number" && isNaN(value))
//     );
//   };
  
//   export const getEmptyMessage = (fieldName: string): string =>
//     `Required field ${fieldName} is empty.`;
  
//   export const getTimeError = (startTime: string, endTime: string): string | undefined => {
//     return checkTimeValid(startTime, endTime)
//       ? undefined
//       : "End time cannot be before start time.";
//   };
  
//   export const getEmptyError = (
//     shift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">
//   ): string | null => {
//     if (isEmpty(shift.job_title)) return getEmptyMessage("title");
//     if (shift.job_description !== null && isEmpty(shift.job_description)) return getEmptyMessage("description");
//     if (shift.job_requirements !== null && isEmpty(shift.job_requirements)) return getEmptyMessage("requirements");
//     if (isEmpty(shift.job_location)) return getEmptyMessage("address");
//     if (isNaN(shift.start_time.getTime())) return getEmptyMessage("start time");
//     if (isNaN(shift.end_time.getTime())) return getEmptyMessage("end time");
//     if (isEmpty(shift.staff_needed)) return getEmptyMessage("staff no.");
//     if (isEmpty(shift.pay_rate)) return getEmptyMessage("pay rate");
  
//     return null;
//   };
  
// export const getError = (
//     shift: Omit<Shift, "shift_id" | "created_at" | "status" | "staff_assigned" | "employer_name" | "submission_cycle" | "company_name">
//   ): string | null => {
//     const emptyError = getEmptyError(shift);
//     if (emptyError) return emptyError;
  
//     if (shift.break_duration !== null && shift.break_duration < 0) {
//       return "Break duration must be equal to or longer than 0 hours.";
//     }
//     if (shift.pay_rate <= 0) {
//       return "Pay rate must be more than zero.";
//     }
//     if (shift.staff_needed <= 0) {
//       return "Staff required must be more than zero.";
//     }
//     if (shift.end_time <= shift.start_time) {
//       return "End time cannot be before start time.";
//     }
  
//     return null;
//   };


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


export type ShiftError = {
    [K in keyof Omit<
      Shift,
      | "shift_id"
      | "created_at"
      | "status"
      | "staff_assigned"
      | "employer_name"
      | "submission_cycle"
      | "company_name"
    >]: string | null;
};

export function createEmptyShiftError(): ShiftError {
    return {
      job_title: null,
      job_location: null,
      postal_code: null,
      job_description: null,
      job_requirements: null,
      job_type: null,
      pay_rate: null,
      start_time: null,
      end_time: null,
      break_duration: null,
      staff_needed: null,
    };
}

export function validateShift(
    shift: Omit<
      Shift,
      | "shift_id"
      | "created_at"
      | "status"
      | "staff_assigned"
      | "employer_name"
      | "submission_cycle"
      | "company_name"
    >
  ): ShiftError {
    const errors = createEmptyShiftError();
  
    if (!shift.job_title || shift.job_title.trim().length === 0) {
      errors.job_title = "Job title is required.";
    }
  
    if (!shift.job_location || shift.job_location.trim().length === 0) {
      errors.job_location = "Job location is required.";
    }
  
    if (shift.job_description == null || shift.job_description.trim().length === 0) {
      errors.job_description = "Job description is required.";
    }
  
    if (!shift.job_requirements || shift.job_requirements.trim().length === 0 ) {
      errors.job_requirements = "Job requirements are required.";
    } 
  
    if (!shift.postal_code || shift.postal_code.toString().length !== 6) {
      errors.postal_code = "Postal code must be a 6-digit number.";
    }
  
    if (!shift.job_type || shift.job_type.trim().length === 0) {
      errors.job_type = "Job type is required.";
    }
  
    if (shift.pay_rate === undefined || shift.pay_rate <= 0) {
      errors.pay_rate = "Pay rate must be a positive number.";
    }
  
    if (shift.staff_needed === undefined || shift.staff_needed <= 0) {
      errors.staff_needed = "Staff No. must be a positive number.";
    }
  
    const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());
  
    const startValid = isValidDate(shift.start_time);
    const endValid = isValidDate(shift.end_time);
  
    if (!startValid) {
      errors.start_time = "Start time must be a valid date.";
    }
  
    if (!endValid) {
      errors.end_time = "End time must be a valid date.";
    }
  
    if (startValid && endValid) {
      const durationMs = shift.end_time.getTime() - shift.start_time.getTime();
      const durationHours = durationMs / (1000 * 60 * 60); // convert ms to hours
  
      if (durationHours < 1) {
        errors.end_time = "Job duration must be at least 1 hour.";
      }
  
      if (
        shift.break_duration !== null &&
        (shift.break_duration < 0 || shift.break_duration > durationHours)
      ) {
        errors.break_duration = "Break duration must be shorter than job duration.";
      }
    }
  
    return errors;
  }