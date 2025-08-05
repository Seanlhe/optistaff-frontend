
import EmployeeCard from "./EmployeeCard";
import { Assignment } from "../types/hooks";
export default function HistoryAssignedStaff({handleModalClick,  assignments}:{handleModalClick: Function; assignments: Assignment[]}){
    return <div data-testid="history-assigned-staff" className="w-96 flex flex-col gap-4 p-4 rounded-xl bg-secondary-bg">
          <p className="font-montserrat-b text-lg text-primary-text mb-2">
            Assigned Staff
          </p>
          <div
            className="overflow-auto"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {assignments.length > 0 ? (
              assignments.map((a) => (
                <div className="mb-3" key={a.assignment_id}>
                  <EmployeeCard
                    assignment={a}
                    handleClick={handleModalClick}
                  />
                </div>
              ))
            ) : (
              <p className="self-center font-montserrat text-secondary-text text-sm">
                Select a job. Display staff here.
              </p>
            )}
          </div>
        </div>
}