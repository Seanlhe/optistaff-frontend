import ClientNav from "./employer/ClientNav"
import { Outlet } from "react-router-dom"

export default function JSLayout(){
    return <div className = 'flex h-full flex-row '>
        <ClientNav/>
            <div className = 'grow'>
                <Outlet/>
            </div>
        </div>
}