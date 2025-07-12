import { Link } from "react-router-dom"
export default function LandingPage(){
    const images: string[] = ["/images/capitaland.svg", "images/fourseasons.svg", "images/marriot.svg", "images/mercure.svg", "images/sats.svg", "images/tripdotcom.svg"]

    return <div id="landing-container" className="flex flex-col">
        <div id="landing-header" className="flex flex-row justify-between items-center pt-5 px-37.5">
            <img className="h-23" src="/images/optistafflogo.svg"/>
            <div className="flex flex-row gap-15">
                <Link className="hover:underline font-montserrat text-lg text-primary-blue" to="/hire">Employers</Link>
                <Link className="hover:underline font-montserrat text-lg text-primary-blue" to="/opportunities">Find Work</Link>
                <Link className="hover:underline font-montserrat text-lg text-primary-blue" to="/about">About</Link>
                <Link className="hover:underline font-montserrat text-lg text-primary-blue" to="/auth?mode=login">Login</Link>
            </div>
        </div>
        <div id="landing-content" className="flex flex-col gap-43">
            <div id="landing-call-to-action" className="flex flex-row justify-between py-12  px-37.5" >
                <div id="landing-tag" className="w-135 flex flex-col gap-12">
                    <h1 className="font-montserrat-b text-5xl/20">Shifts that fit.<br/> Teams that Click.</h1>
                    <p className="font-montserrat text-2xl/12">OptiStaff takes the hassle out of rostering for on-demand jobs by using cutting-edge technology to match employers with the right people.</p>
                    <div className="flex flex-row gap-4">
                        <Link to="/auth?mode=signup" className="hover:cursor-pointer hover:opacity-80 hover:bg-gray-100 px-4 py-5 border-2 border-primary-blue bg-white text-primary-blue font-montserrat rounded-xl">Start Hiring</Link>
                        <Link to="/auth?mode=signup" className="hover:cursor-pointer hover:opacity-80 px-4 py-5 bg-primary-blue text-white rounded-xl font-montserrat ">Start Working</Link>
                    </div>
                </div>
                <img src="images/dashboard.svg" className="w-128 rounded-4xl"/>
            </div>
            <div id="landing-brands" className="flex flex-col align-middle gap-7.5">
                <p className="text-center font-montserrat-b text-primary-blue text-4xl">Recognised by trusted brands</p>
                <div id="brands-carousell" className="flex flex-row justify-between">
                    {images.map((image: string) => {return <img src={image}/>})}
                </div>
            </div>
            <div id="landing-benefits">
                
            </div>
        </div>
    </div>
}