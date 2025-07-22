import { isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Shift } from '../types/hooks'; // adjust import path as needed

export function getShiftsThisWeek(shifts: Shift[]): Shift[] {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  return shifts.filter(shift =>
    isWithinInterval(shift.start_time, { start: weekStart, end: weekEnd })
  );
}