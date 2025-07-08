import NavItem from "../../components/NavItem";
import { NavItemProps } from "../../types/navigation";

export default function ClientNav() {
  const adminNavItems: NavItemProps[] = [
    { name: "Roster", src: "icons/calendaricon.png" },
    { name: "Upload Jobs", src: "icons/gearicon.png" },
  ];
  const prefNavItems: NavItemProps[] = [
    { name: "Profile", src: "icons/personicon.png" },
    { name: "Settings", src: "icons/uploadicon.png" },
    { name: "Logout", src: "icons/dooricon.png" },
  ];
  return (
    <div className="navbar">
      <div className="nav-header">
        <h1>OptiStaff</h1>
        <h2>Client Portal</h2>
      </div>
      <div className="nav-body">
        <h3>Admin Tools</h3>
        <ul>
          {adminNavItems.map((navItemProps) => (
            <NavItem {...navItemProps} />
          ))}
        </ul>
      </div>
      <div className="nav-body">
        <h3>Preferences</h3>
        <ul>
          {prefNavItems.map((navItemProps) => (
            <NavItem {...navItemProps} />
          ))}
        </ul>
      </div>
    </div>
  );
}
