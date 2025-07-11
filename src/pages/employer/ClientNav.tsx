import NavItem from "../../components/NavItem";
import { NavItemProps } from "../../types/navigation";

export default function ClientNav() {
  const adminNavItems: NavItemProps[] = [
    { name: "Dashboard", src: "/icons/placeholder.png", to: "dashboard" },
    { name: "Roster", src: "/icons/calendaricon.png", to: "roster" },
    { name: "Upload Jobs", src: "/icons/uploadicon.png", to: "uploadjobs" },
  ];
  const prefNavItems: NavItemProps[] = [
    { name: "Profile", src: "/icons/personicon.png", to: "profile" },
    { name: "Settings", src: "/icons/gearicon.png", to: "settings" },
    { name: "Logout", src: "/icons/dooricon.png", to: "/login" },
  ];
  return (
    <div className="box-border w-3xs min-h-screen flex flex-col gap-1 bg-gradient-to-b from-[#0A32A9] to-[#3767F3] px-4 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-montserrat-smb text-white text-center text-3xl">
          OptiStaff
        </h1>
        <h2 className="font-montserrat text-white text-center text-xl mb-8">
          Client Portal
        </h2>
      </div>
      <div className="flex flex-col mb-8">
        <h3 className="text-white text-xs mb-5">Admin Tools</h3>
        <ul className="flex flex-col gap-3">
          {adminNavItems.map((navItemProps) => (
            <NavItem {...navItemProps} />
          ))}
        </ul>
      </div>
      <div className="nav-body">
        <h3 className="text-white text-xs mb-5">Preferences</h3>
        <ul className="flex flex-col gap-3">
          {prefNavItems.map((navItemProps) => (
            <NavItem {...navItemProps} />
          ))}
        </ul>
      </div>
    </div>
  );
}
