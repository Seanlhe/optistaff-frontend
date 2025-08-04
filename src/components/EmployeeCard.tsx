import { Assignment } from "../types/hooks";
export default function EmployeeCard({
    handleClick,
    assignment,
  }: {
    handleClick: Function;
    assignment: Assignment;
  }) {
    return (
      <div data-testid="history-employee-card" className="w-full flex flex-row justify-between items-center bg-white p-3 rounded-lg">
        <div className="flex flex-row items-center gap-3">
          <img className="bg-[#D9D9D9] rounded-full w-12 h-12" src="" />
          <div className="flex flex-col">
            <p className="font-montserrat text-sm text-primary-text">
              {assignment.employee_name}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleClick(assignment)}
          className="hover:bg-gray-100 hover:cursor-pointer border border-primary-text text-primary-text font-montserrat px-2 py-1 rounded-md text-xs"
        >
          Review
        </button>
      </div>
    );
  }