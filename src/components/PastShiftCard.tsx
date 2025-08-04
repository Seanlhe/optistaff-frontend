import { Shift} from "../types/hooks";
import {format} from "date-fns";

export default function PastShiftCard({
    shift,
    selectedShift,
    handleSelectShift,
  }: {
    shift: Shift;
    selectedShift: Shift | null;
    handleSelectShift: Function;
  }) {
    return (
      <div
        data-testid="past-shift-card"
        onClick={() => handleSelectShift(shift)}
        className={`${selectedShift == shift ? "border-primary-blue border" : "border-[#B3B3B3]"} hover:cursor-pointer border flex flex-row items-center justify-between rounded-lg`}
      >
        <div className="w-full flex flex-col gap-3 rounded-lg p-3">
          <p className="text-sm font-montserrat-b text-primary-text">
            {shift.job_title}
          </p>
          <div className="flex flex-row gap-2 items-center">
            <img className="w-4 h-4" src="/icons/map.svg" />
            <p className="text-xs font-montserrat text-secondary-text">
              {`${shift.job_location}, Singapore ${shift.postal_code}`}
            </p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <img className="w-4 h-4" src="/icons/calendar.svg" />
            <p className="text-xs font-montserrat text-secondary-text">
              {format(shift.start_time, "EEEE, dd/MM/yyyy")}
            </p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <img className="w-4 h-4" src="/icons/clock.svg" />
            <p className="text-xs font-montserrat text-secondary-text">{`${format(shift.start_time, "hh:mm a")} - ${format(shift.end_time, "hh:mm a")}`}</p>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <img className="w-4 h-4" src="/icons/users.svg" />
            <p className="text-xs font-montserrat text-secondary-text">
              {shift.staff_assigned}
            </p>
          </div>
        </div>
      </div>
    );
  }