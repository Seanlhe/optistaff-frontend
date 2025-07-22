import { NavItemProps } from "../types/navigation";
import { Link } from "react-router-dom";

export default function NavItem({
  name,
  src,
  to,
  selected,
  onClick,
}: NavItemProps) {
  const inactive: string ="hover:bg-button-hover hover:text-white font-montserrat text-white/90 box-border w-full flex flex-row items-center gap-2.5 justify-start px-2 py-2.5 rounded-lg";
  const active: string ="bg-white border-r-4 border-[#b1c9ef] font-montserrat-smb text-black box-border w-full flex flex-row items-center gap-2.5 justify-start px-2 py-4 rounded-lg transition-all duration-200 ease-in-out";
    const activeImage: string = "brightness-0";
    const inactiveImage: string = "brightness-100 invert-1";
  return (
    <Link
      to={to}
      className={name == selected ? active : inactive}
      onClick={onClick}
    >
      <img
        className={`w-5 h-5 ${name == selected ? activeImage : inactiveImage}`}
        src={src}
      />
      {name}
    </Link>
  );
}
