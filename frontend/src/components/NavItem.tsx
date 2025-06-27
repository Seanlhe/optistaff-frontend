import { NavItemProps } from "../types/navigation"

export default function NavItem({name,  src}: NavItemProps){
    return <div className="nav-items">
        <img src={src}/>
        <p>{name}</p>
    </div>
    
}