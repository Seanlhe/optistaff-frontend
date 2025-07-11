import IconButton from "../../components/IconButton";
import CircleButton from "../../components/CircleButton";
import ShiftCard from "../../components/ShiftCard";
import { ShiftCardProps } from "../../types/components";

export default function ClientDashboard() {
  const ShiftCardData: ShiftCardProps[] = [
    { title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 3 },
    { title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 3 },
    { title: "Front Desk", date: "Today", time: "8:00am - 1:30pm", staffNo: 3 },
  ];
  return (
    <div className="bg-tertiary-bg min-h-screen flex flex-col w-full px-16 py-8 gap-8 ">
      <DashboardHeader />
      <div className="flex flex-row gap-10">
        <DashboardUpcoming data={ShiftCardData} />
        <div className="grow flex flex-col gap-15">
          <DashboardPositions />
          <DashboardInProgress data={ShiftCardData} />
        </div>
      </div>
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="flex flex-row w-full justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-2xl text-secondary-text font-montserrat-smb">
          Welcome Back,
        </p>
        <h1 className="text-4xl text-secondary-text font-montserrat-b">
          Marriot Plaza
        </h1>
      </div>
      <div className="flex flex-row items-center gap-16">
        <IconButton text="Upload Jobs" src="/public/icons/uploadicon.png" />
        <CircleButton
          className="circle-button"
          src="/public/icons/notifications.svg"
        />
      </div>
    </div>
  );
}

function DashboardUpcoming({ data }: { data: ShiftCardProps[] }) {
  return (
    <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
      <div className="flex flex-row gap-4 items-center">
        <img className="h-7 w-7" src="/public/icons/calendar.svg" />
        <h1 className="text-3xl text-secondary-text font-montserrat-b">
          Upcoming Shifts
        </h1>
      </div>
      <ul className="flex flex-col gap-8">
        {data.map((prop) => (
          <li>
            <ShiftCard {...prop} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function DashboardPositions() {
  return (
    <div className="bg-secondary-bg flex flex-row p-8 gap-13 rounded-3xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-row gap-4 items-center">
          <img className="h-7 w-7" src="/public/icons/personicon.svg" />
          <h1 className="text-3xl text-secondary-text font-montserrat-b">
            Positions
          </h1>
        </div>
        <p className="text-4xl font-montserrat-b text-primary-text">
          100/107{" "}
          <span className="text-base font-montserrat text-primary-text">
            Filled
          </span>
        </p>
      </div>
      <div>PieChart</div>
    </div>
  );
}

function DashboardInProgress({ data }: { data: ShiftCardProps[] }) {
  return (
    <div className="bg-secondary-bg grow flex flex-col p-8 rounded-3xl gap-8">
      <div className="flex flex-row gap-4 items-center">
        <img className="h-7 w-7" src="/public/icons/calendar.svg" />
        <h1 className="text-3xl text-secondary-text font-montserrat-b">
          In Progress
        </h1>
      </div>
      <ul className="flex flex-col gap-8">
        {data.map((prop) => (
          <li>
            <ShiftCard {...prop} />
          </li>
        ))}
      </ul>
    </div>
  );
}
