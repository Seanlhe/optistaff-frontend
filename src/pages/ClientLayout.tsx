import { Outlet } from "react-router-dom";
import ClientNav from "./employer/ClientNav";

export default function ClientLayout() {
  return (
    <div className="grid grid-cols-6 h-full">
      <ClientNav />
      <div className="col-span-5">
        <Outlet />
      </div>
    </div>
  );
}
