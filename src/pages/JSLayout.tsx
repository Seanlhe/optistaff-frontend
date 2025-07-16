import { Outlet } from "react-router-dom"
import JSNav from "./employee/JSNav"

export default function JSLayout(){
    return <div className = 'grid grid-cols-6 h-full'>
        <JSNav/>
        <div className = "col-span-5">
            <Outlet/>
        </div>
    </div>
}