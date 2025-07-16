import { ClientShiftProps } from "../types/components";

export const filterShiftsByDateAndLocation = (
  shifts: ClientShiftProps[],
  date: string,
  location: string
): ClientShiftProps[] => {
  return shifts.filter(
    (shift) => shift.date === date && shift.location === location
  );
};

export const sortShiftsByTime = (shifts: ClientShiftProps[]): ClientShiftProps[] => {
  return shifts.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const formatDateDisplay = (dateStr: string): string => {
  return dateStr.split(" ").slice(0, 2).join(" ");
};