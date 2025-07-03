import { NavItemProps } from "../types/navigation"
import { Link } from "react-router-dom"

export default function NavItem({name,  src, to}: NavItemProps){
    return <Link to={to} className="box-border w-full flex flex-row items-center gap-2.5 justify-start px-2 py-3 rounded-lg">
        <img className="w-5 h-5" src={src}/>
        <p className="text-white">{name}</p>
    </Link>
    
}