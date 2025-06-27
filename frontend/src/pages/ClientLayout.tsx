import ClientNav from "./employer/ClientNav"

export default function ClientLayout(){
    return <div className = 'js-layout'>
        <ClientNav/>
        <div className = 'layout-container'>
            job seeker layout
        </div>
    </div>
}