import { Shift } from "../types/hooks";

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
};

export const getDateForm = (date: string, time: string): Date => {
  const dateArr = date.split(/[-/]/);
  const day = parseInt(dateArr[2]);
  const month = parseInt(dateArr[1]) - 1;
  const year = parseInt(dateArr[0]);
  const timeArr = time.split(":");
  const hours = parseInt(timeArr[0]);
  const min = parseInt(timeArr[1]);
  return new Date(year, month, day, hours, min);
};

export const jobRoleOptions = [
  { label: "Kitchen Helper", value: "Kitchen Helper" },
  { label: "Waiter/Waitress", value: "Waiter/Waitress" },
  { label: "Dishwasher", value: "Dishwasher" },
  { label: "Bartender/Barista", value: "Bartender/Barista" },
  { label: "Banquet Server", value: "Banquet Server" },
  { label: "Food Stall Assistant", value: "Food Stall Assistant" },
  { label: "Cleaner", value: "Cleaner" },
  { label: "Sales Associate", value: "Sales Associate" },
  { label: "Cashier", value: "Cashier" },
  { label: "Promoter", value: "Promoter" },
  { label: "Usher", value: "Usher" },
  { label: "Event Crew", value: "Event Crew" },
  { label: "Customer Service", value: "Customer Service" },
  { label: "Leaflet Distributor", value: "Leaflet Distributor" },
  { label: "Packer", value: "Packer" },
  { label: "Warehouse Assistant", value: "Warehouse Assistant" },
  { label: "Inventory Checker", value: "Inventory Checker" },
  { label: "Delivery", value: "Delivery" },
  { label: "Sorter", value: "Sorter" },
];

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
} & {
  date: string | null;
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
    date: null,
    start_time: null,
    end_time: null,
    break_duration: null,
    staff_needed: null,
  };
}

const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

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
  >,
): ShiftError {
  const errors = createEmptyShiftError();

  if (!shift.job_title || shift.job_title.trim().length === 0) {
    errors.job_title = "Job title is required.";
  }

  if (!shift.job_location || shift.job_location.trim().length === 0) {
    errors.job_location = "Job location is required.";
  }

  if (
    shift.job_description == null ||
    shift.job_description.trim().length === 0
  ) {
    errors.job_description = "Job description is required.";
  }

  if (!shift.job_requirements || shift.job_requirements.trim().length === 0) {
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

  const startValid = isValidDate(shift.start_time);
  const endValid = isValidDate(shift.end_time);

  if (!startValid) {
    errors.start_time = "Start time must be a valid date.";
  }

  if (!endValid) {
    errors.end_time = "End time must be a valid date.";
  }

  if (startValid && endValid) {
    if (shift.start_time < new Date()) {
      errors.date = "Please enter a date later than today";
    }
    const durationMs = shift.end_time.getTime() - shift.start_time.getTime();
    const durationHours = durationMs / (1000 * 60 * 60); // convert ms to hours

    if (durationHours < 1) {
      errors.end_time = "Job duration must be at least 1 hour.";
    }

    if (
      shift.break_duration !== null &&
      (shift.break_duration < 0 || shift.break_duration > durationHours)
    ) {
      errors.break_duration =
        "Break duration must be shorter than job duration.";
    }
  }

  return errors;
}
