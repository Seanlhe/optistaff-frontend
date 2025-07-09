import { NavItemProps } from "../types/navigation";
import { Link } from "react-router-dom";

export default function NavItem({
  name,
  src,
  to,
  selected,
  onClick,
}: NavItemProps) {
  const inactive: string =
    "hover:bg-[#5680E9] hover:text-white font-montserrat text-white box-border w-full flex flex-row items-center gap-2.5 justify-start px-2 py-4 rounded-lg";
  const active: string =
    "bg-white border-r-4 border-[#49E9FD] font-montserrat-smb text-black box-border w-full flex flex-row items-center gap-2.5 justify-start px-2 py-4 rounded-lg";
    const activeImage: string = "brightness-0";
    const inactiveImage: string = "brightness-100 invert-1";
  return (
    <Link
      to={to}
      className={name == selected ? active : inactive}
      onClick={onClick}
    >
      <img className={`w-5 h-5 ${(name==selected? activeImage: inactiveImage)}`} src={src} />
      {name}
    </Link>
  );
}
