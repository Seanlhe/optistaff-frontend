import { Shift } from "../types/hooks";
import PastShiftCard from "../components/PastShiftCard";

export default function HistoryPastShifts({handleSort, handleSelectShift, pastShifts, selectedShift}: {handleSort: Function; handleSelectShift: Function; pastShifts: Shift[]; selectedShift: Shift|null}){
    return <div data-testid="history-past-shifts" id="previous-jobs" className="grow flex flex-col gap-4">
          <div className="flex flex-row justify-between mb-2">
            <p className="font-montserrat-b text-lg text-primary-text">
              Previous Jobs
            </p>
            <button
              onClick={() => handleSort()}
              className="hover:cursor-pointer hover:opacity-80 flex flex-col items-center justify-center bg-[#D9D9D9] rounded-full h-8 w-8"
            >
              <img className="w-3 h-3" src="/icons/sorticon.svg" />
            </button>
          </div>
          <div
            className="overflow-auto pr-2"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {pastShifts.length != 0 ? (
              pastShifts.map((shift) => (
                <div className="mb-4" key={shift.shift_id}>
                  <PastShiftCard
                    selectedShift={selectedShift}
                    shift={shift}
                    handleSelectShift={handleSelectShift}
                  />
                </div>
              ))
            ) : (
              <p className="font-montserrat text-secondary-text text-sm">
                No past shifts found. Click upload jobs to create new listings
              </p>
            )}
          </div>
        </div>
}
