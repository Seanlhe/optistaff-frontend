import IconButton from "../../components/IconButton";
import CircleButton from "../../components/CircleButton";
import ShiftCard from "../../components/ShiftCard";
import { useNavigate } from "react-router-dom";
import { Shift } from "../../types/hooks";
import { PieChart } from "@mui/x-charts";

export default function ClientDashboard({
  shifts,
  handleManageClick,
}: {
  shifts: Shift[];
  handleManageClick: Function;
}) {
  const navigate = useNavigate();

  function handleUploadClick() {
    navigate("/employer/uploadjobs");
  }

  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col px-12 py-6 gap-6">
      <div
        id="DashboardHeader"
        className="flex flex-row w-full justify-between"
      >
        <div className="flex flex-col gap-1">
          <p className="text-md text-secondary-text font-montserrat-smb">
            Welcome Back,
          </p>
          <p className="text-xl text-black font-montserrat-b">
            Marriot Plaza
          </p>
        </div>
        <div className="flex flex-row items-center gap-8">
          <IconButton
            onClick={() => {
              handleUploadClick();
            }}
            text="Upload Jobs"
            src="/public/icons/uploadicon.png"
          />
          <CircleButton
            className="circle-button"
            src="/icons/notifications.svg"
          />
        </div>
      </div>
      <div className="flex flex-row gap-6">
        <DashboardUpcoming
          handleManageClick={handleManageClick}
          shifts={shifts}
        />
        <div className="grow flex flex-col gap-6">
          <DashboardPositions
            shifts={shifts}
            calculateFilled={calculateFilled}
          />
          <DashboardInProgress
            shifts={shifts}
            handleManageClick={handleManageClick}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardUpcoming({
  shifts,
  handleManageClick,
}: {
  shifts: Shift[];
  handleManageClick: Function;
}) {
  return (
    <div data-testid="dashboard-upcoming" className="bg-secondary-bg grow flex flex-col p-5 rounded-2xl gap-4">
      <div className="flex flex-row gap-2 items-center">
        <img className="h-4 w-4" src="/icons/calendar.svg" />
        <h1 className="text-lg text-black font-montserrat-b">
          This Week
        </h1>
      </div>
      {shifts && (
        <div className="overflow-auto max-h-[calc(100vh-240px)]">
          <ul className="z-50 flex flex-col gap-4 animate-slidedown">
            {shifts.map((shift) =>
              shift.staff_assigned == shift.staff_needed ? (
                <li key={shift.shift_id}>
                  <ShiftCard
                    shift={shift}
                    handleManageClick={handleManageClick}
                  />
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DashboardPositions({
  shifts,
  calculateFilled,
}: {
  shifts: Shift[];
  calculateFilled: Function;
}) {
  return (
    <div data-testid="dashboard-positions" className="bg-secondary-bg flex flex-row p-5 gap-6 rounded-2xl justify-between items-center">
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-2 items-center">
          <img className="h-4 w-4" src="/public/icons/personicon.svg" />
          <h1 className="text-lg text-black font-montserrat-b">
            Positions
          </h1>
        </div>
        <p className="text-xl font-montserrat-b text-black">
          {`${calculateFilled(shifts)[0]}/${
            calculateFilled(shifts)[0] + calculateFilled(shifts)[1]
          } `}
          <span className="text-sm font-montserrat text-primary-text">
            Filled
          </span>
        </p>
      </div>
      <div className="relative">
        <PieChart
          series={[
            {
              innerRadius: 40,
              data: [
                {
                  id: 0,
                  value:
                    calculateFilled(shifts)[1] + calculateFilled(shifts)[0],
                  color: "var(--color-primary-blue)",
                },
                { id: 1, value: calculateFilled(shifts)[1] - calculateFilled(shifts)[0], color: "#FFFFFF" },
              ],
            },
          ]}
          width={100}
          height={100}
        />
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-montserrat-b text-xl">{`${Math.floor(
          (calculateFilled(shifts)[0] /
            (calculateFilled(shifts)[1])) *
            100
        )}%`}</p>
      </div>
    </div>
  );
}

export function DashboardInProgress({
  shifts,
  handleManageClick,
}: {
  shifts: Shift[];
  handleManageClick: Function;
}) {
  return (
    <div data-testid="dashboard-in-progress" className="bg-secondary-bg flex flex-col p-8 rounded-3xl gap-8">
      <div className="flex flex-row gap-4 items-center">
        <img className="h-5 w-5" src="/icons/warningicon.svg" />
        <h1 className="text-xl text-secondary-text font-montserrat-b">
          In Progress
        </h1>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-240px)]">
        <ul className="flex flex-col gap-4 animate-slidedown">
          {shifts.map((shift) =>
            shift.staff_assigned < shift.staff_needed ? (
              <li key={shift.shift_id}>
                <ShiftCard
                  handleManageClick={() => handleManageClick(shift)}
                  shift={shift}
                />
              </li>
            ) : null
          )}
        </ul>
      </div>
    </div>
  );
}

export function calculateFilled(shiftCardData: Shift[]): number[] {
  let filledStaffCount = 0;
  let totalStaff = 0;
  for (let i: number = 0; i < shiftCardData.length; i++) {
    totalStaff += shiftCardData[i].staff_needed;
    filledStaffCount += shiftCardData[i].staff_assigned;
  }
  return [filledStaffCount, totalStaff];
}