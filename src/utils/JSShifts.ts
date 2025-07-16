import { EmployeeShiftProps } from "../types/components";

export const filterShiftsByDate = (
  shifts: EmployeeShiftProps[],
  date: string,
): EmployeeShiftProps[] => {
  return shifts.filter(
    (shift) => shift.date === date
  );
};

export const sortShiftsByTime = (shifts: EmployeeShiftProps[]): EmployeeShiftProps[] => {
  return shifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const formatDateDisplay = (dateStr: string): string => {
  return dateStr.split(" ").slice(0, 2).join(" ");
};