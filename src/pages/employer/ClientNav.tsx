import { useState } from "react";
import NavItem from "../../components/NavItem";
import { NavItemProps } from "../../types/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function ClientNav() {
  const { logout, user } = useAuth();
  const adminNavItems: NavItemProps[] = [
    { name: "Dashboard", src: "/icons/calendaricon.svg", to: "dashboard" },
    { name: "Roster", src: "/icons/calendaricon.svg", to: "roster" },
    { name: "Upload Jobs", src: "/icons/uploadicon.svg", to: "uploadjobs" },
  ];
  const prefNavItems: NavItemProps[] = [
    { name: "Profile", src: "/icons/person.svg", to: "profile" },
    { name: "Settings", src: "/icons/gearicon.svg", to: "settings" },
  ];
  const [selected, setSelected] = useState<string>("Dashboard");

  function handleClick(name: string) {
    if (name === "Logout") {
      logout();
    } else {
      setSelected(name);
    }
  }

  return (
    <div
      id="navbar-container"
      className="sticky top-0 box-border col-span-1 h-screen flex flex-col gap-1 bg-gradient-to-b from-[#0A32A9] to-[#3767F3] px-4 py-8"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-montserrat-smb text-white text-center text-3xl">
          OptiStaff
        </h1>
        <h2 className="font-montserrat text-white text-center text-xl mb-8">
          Client Portal
        </h2>
        {user && (
          <p className="text-white text-center text-sm/6 opacity-80 mb-5 font-montserrat">
            Welcome, <br /> {user.email}
          </p>
        )}
      </div>
      <div className="flex flex-col mb-8">
        <h3 className="text-grey-100 font-montserrat text-xs mb-5 opacity-80">
          Admin Tools
        </h3>
        <ul className="flex flex-col gap-2.5">
          {adminNavItems.map((navItemProps) => (
            <NavItem
              key={navItemProps.name}
              {...navItemProps}
              selected={selected}
              onClick={() => handleClick(navItemProps.name)}
            />
          ))}
        </ul>
      </div>
      <div className="nav-body">
        <h3 className="text-grey-100 font-montserrat text-xs mb-5 opacity-80">
          Preferences
        </h3>
        <ul className="flex flex-col gap-2.5">
          {prefNavItems.map((navItemProps) => (
            <NavItem
              key={navItemProps.name}
              {...navItemProps}
              selected={selected}
              onClick={() => handleClick(navItemProps.name)}
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
