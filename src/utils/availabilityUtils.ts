// utils/availabilityUtils.ts

export type AvailabilityInput = {
  start_time: string;
  end_time: string;
  submission_cycle: "PRIMARY" | "SECONDARY";
};

export type AvailabilityWithMeta = AvailabilityInput & {
  user_id: string;
  day_of_week: number;
};

/**
 * Convert a JS weekday (0-6, Sunday-Saturday) to ISO weekday (1-7, Monday-Sunday)
 */
export function convertToIsoDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Maps time blocks to include user_id and ISO day of week.
 */
export function enrichTimeBlocksWithUserAndDay(
  timeBlocks: AvailabilityInput[],
  userId: string,
): AvailabilityWithMeta[] {
  return timeBlocks.map((tb) => {
    const startDate = new Date(tb.start_time);
    const jsDay = startDate.getUTCDay();
    const isoDay = convertToIsoDay(jsDay);

    return {
      ...tb,
      user_id: userId,
      day_of_week: isoDay,
    };
  });
}
