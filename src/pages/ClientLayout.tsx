import { Outlet } from "react-router-dom"
import ClientNav from "./employer/ClientNav"

export default function ClientLayout(){
    return <div className = 'flex h-full flex-row '>
        <ClientNav/>
        <div className = 'grow'>
            <Outlet/>
        </div>
    </div>
}