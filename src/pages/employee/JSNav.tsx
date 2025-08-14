import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavItem from "../../components/NavItem";
import { NavItemProps } from "../../types/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";

export default function JSNav() {
  const { logout, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("JSNav mounted");
  }, []);

  // Function to get the current selected item based on the URL pathname
  const getCurrentSelected = (): string => {
    const pathname = location.pathname;
    const path = pathname.split("/").pop(); // Get the last part of the path

    // Map URL paths to navigation item names
    const pathToNameMap: { [key: string]: string } = {
      dashboard: "Dashboard",
      schedule: "My Jobs",
      settings: "Account",
      preferences: "Preferences",
      employee: "Dashboard", // Handle base employee path
    };

    return pathToNameMap[path || "dashboard"] || "Dashboard";
  };

  const adminNavItems: NavItemProps[] = [
    { name: "Dashboard", src: "/icons/dashboardicon.svg", to: "dashboard" },
    { name: "My Jobs", src: "/icons/calendaricon.svg", to: "schedule" },
    // { name: "Earnings", src: "/icons/uploadicon.svg", to: "earnings" },
  ];
  const prefNavItems: NavItemProps[] = [
    { name: "Account", src: "/icons/person.svg", to: "settings" },
    { name: "Preferences", src: "/icons/gearicon.svg", to: "preferences" },
  ];

  const [selected, setSelected] = useState<string>(getCurrentSelected());
  useEffect(() => {
    setSelected(getCurrentSelected);
  }, [getCurrentSelected()]);

  function handleClick(name: string) {
    if (name === "Logout") {
      logout();
    }
    // Remove the setSelected call since we're now using URL-based selection
  }

  return (
    <div className="sticky top-0 box-border col-span-1 h-screen flex flex-col gap-1 bg-gradient-to-b from-[#395886] to-[#628ecb] px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-montserrat-smb text-white text-center text-3xl">
          OptiStaff
        </h1>
        <h2 className="font-montserrat text-white text-center text-xl mb-5">
          Employee Portal
        </h2>
        {user && (
          <p className="text-white text-center text-sm/6 opacity-80 mb-5 font-montserrat">
            Welcome, <br />
            {user.email}
          </p>
        )}
      </div>
      <div className="flex flex-col mb-4">
        <h3 className="text-gray-100 font-montserrat text-xs mb-5 opacity-80">
          Admin Tools
        </h3>
        <ul className="flex flex-col gap-2.5">
          {adminNavItems.map((navItemProps) => (
            <NavItem
              key={navItemProps.name}
              {...navItemProps}
              selected={selected}
            />
          ))}
        </ul>
      </div>
      <div className="nav-body">
        <h3 className="text-gray-100 font-montserrat text-xs mb-5 opacity-80">
          Preferences
        </h3>
        <ul className="flex flex-col gap-2.5">
          {prefNavItems.map((navItemProps) => (
            <NavItem
              key={navItemProps.name}
              {...navItemProps}
              selected={selected}
            />
          ))}
          <li>
            <button
              onClick={() => handleClick("Logout")}
              className="w-full flex items-center gap-4 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <img src="/icons/dooricon.svg" alt="logout" className="w-5 h-5" />
              <span className="font-montserrat text-sm">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
