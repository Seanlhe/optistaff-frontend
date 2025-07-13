import { Link } from "react-router-dom"
export default function LandingPage(){
    const images: string[] = ["/images/capitaland.svg", "images/fourseasons.svg", "images/marriot.svg", "images/mercure.svg", "images/sats.svg", "images/tripdotcom.svg"]

    return <div id="landing-container" className="flex flex-col">
        <div id="landing-header" className="sticky top-0 z-50 pt-4 pb-4 px-37.5 bg-white flex flex-row justify-between items-center ">
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
            <div id="landing-brands" className="flex flex-col align-middle gap-12">
                <p className="text-center font-montserrat-b text-primary-blue text-4xl">Recognised by trusted brands</p>
                <div id="brands-carousell" className="overflow-hidden whitespace-nowrap">
                    <div className="animate-slide inline-block whitespace-nowrap ml-15">
                        {images.map((image: string) => {return <img className="mr-15 h-18 inline-block"src={image}/>})}
                    </div>
                    <div className="animate-slide inline-block whitespace-nowrap mr-15">
                        {images.map((image: string) => {return <img className="mr-15 h-18 inline-block" src={image}/>})}
                    </div>
                </div>
            </div>
            <div id="landing-benefits" className="flex flex-row justify-between bg-landing-bg gap-25 px-37.5 py-15">
                <div className="flex flex-col gap-8">
                    <img className="h-12 w-12" src="/icons/calendaricon.svg"/>
                    <p className="font-montserrat-smb text-2xl text-black">Hands free rostering</p>
                    <p className="font-montserrat text-xl text-black">
                    We take care of scheduling so you can focus on what matters most.
                    </p>
                </div>
                <div className="flex flex-col gap-8">
                    <img className="h-12 w-12" src="/icons/calendaricon.svg"/>
                    <p className="font-montserrat-smb text-2xl text-black">Work with trusted staff</p>
                    <p className="font-montserrat text-xl text-black">
                    We match you with employees based on past ratings, your preferences and job requirements.
                    </p>
                </div>
                <div className="flex flex-col gap-8">
                    <img className="h-12 w-12" src="/icons/calendaricon.svg"/>
                    <p className="font-montserrat-smb text-2xl text-black">Reliable replacements, fast</p>
                    <p className="font-montserrat text-xl text-black">
                    If someone drops out, we’ll quickly find a suitable replacement so your operations stay smooth.
                    </p>
                </div>
            </div>
            <div id="landing-instructions" className="bg-gradient-to-b from-[#85CEEC] to-[#FFFFFF] grid grid-cols-2 items-center px-37.5 py-25 gap-y-38.5 gap-x-50 rounded-t-[37.5rem]">
                <h2 className="col-span-2 text-center font-montserrat-b text-5xl text-black ">How do I get started?</h2>
                <div className="col-span-1 flex flex-col gap-10">
                    <p className="font-montserrat-smb text-4xl">Create a job posting</p>
                    <p className="font-montserrat text-2xl/10">Upload your job description and event details, including manpower needs, role breakdowns, venue, time and pay at least 1 week prior.</p>
                </div>
                <img className="col-span-1 w-full h-auto max-w-125"src="/images/dashboard.svg"/>
                <img className="w-full max-w-125 h-auto"src="/images/dashboard.svg"/>
                <div className="col-span-1 flex flex-col gap-10">
                    <p className="font-montserrat-smb text-4xl">Receive your employee allocations</p>
                    <p className="font-montserrat text-2xl/10">Our system matches your jobs with available, qualified staff every Wednesday and Sunday at 8:30pm. <br/> <br/> In the event of cancellations, we will find suitable replacements.</p>
                </div>
                <div className="col-span-1 flex flex-col gap-10">
                    <p className="font-montserrat-smb text-4xl">Execute and evaluate</p>
                    <p className="font-montserrat text-2xl/10">Track staff attendance by scanning our in-app QR code. Afterwards, leave feedback on your staff so we can continuously improve your future matches.</p>
                </div>
                <img className="w-full h-auto max-w-125"src="/images/dashboard.svg"/>
            </div>
            <div id="landing-testimonials" className="grid grid-cols-2 gap-x-37.5 px-37.5 justify-between">
                <div className="relative flex flex-col gap-15 p-15 rounded-4xl rounded-bl-none bg-landing-bg">
                    <img className="absolute -top-15 -left-10 h-32.5 w-32.5" src="/icons/quotationicon.svg"/>
                    <div className="col-span-2 flex flex-row items-center gap-5">
                        <img className="h-20 w-20 rounded-full" src="/icons/personicon.svg" />
                        <p className="font-montserrat-smb text-2xl/10">Sean Leng<br/><span className="font-montserrat text-2xl/10">HR Lead at FinAscend</span></p>
                    </div>
                    <p className="col-span-2 font-montserrat text-2xl/10">I used to spend days working spreadsheets and advertising to get manpower. With FlexiStaff <span className="font-montserrat-smb text-2xl/10">I can upload my job details and leave it aside.</span></p>
                </div>
                <div className="relative col-span-1 flex flex-col gap-15 p-15 rounded-4xl rounded-bl-none bg-landing-bg">
                <img className="absolute -top-15 -right-10 -scale-x-100 h-32.5 w-32.5" src="/icons/quotationicon.svg"/>
                    <div className="col-span-2 flex flex-row items-center gap-5">
                        <img className="h-20 w-20 rounded-full" src="/icons/personicon.svg" />
                        <p className="font-montserrat-smb text-2xl/10">Aaron Lim<br/><span className="font-montserrat text-2xl/10">University Student</span></p>
                    </div>
                    <p className="col-span-2 font-montserrat text-2xl/10">As a part-time student, having the <span className="font-montserrat-smb text-2xl/10">flexibility to choose when I work </span> perfectly suits my lifestyle. It’s the first time I truly feel I can balance earning an income while staying on top of my studies.</p>
                </div>
            </div>
            <div id="landing-second-cta" className="bg-landing-bg grid grid-cols-2 justify-items-start gap-x-50 gap-y-8.5 px-37.5 py-15">
                <p className="text-justify font-montserrat-smb text-2xl">Ready to hire on-demand staff without all the hassle?</p>
                <p className="text-justify font-montserrat-smb text-2xl">Searching for a job that works for you?</p>
                <p className="text-justify font-montserrat text-2xl">Let OptiStaff handle your future staffing needs with next-generation scheduling technology.</p>
                <p className="text-justify font-montserrat text-2xl">Optistaff matches you with work, on your terms. Enjoy flexible working hours, competitive pay and discover jobs you love.</p>
                <button className="hover:cursor-pointer hover:opacity-80 bg-primary-blue font-montserrat text-xl text-white p-2.5 rounded-xl">Start hiring</button>
                <button className="hover:cursor-pointer hover:bg-gray-100 border-2 bg-white border-primary-blue font-montserrat text-xl text-primary-blue p-2.5 rounded-xl">Start working</button>
            </div>
        </div>
        <div id="landing-end" className="bg-white px-37.5 pt-15 pb-4 flex flex-row justify-between">
                <p className="text-primary-blue text-xl font-montserrat">OptiStaff Pte Ltd © 2025</p>
                <div className="flex flex-row gap-33">
                    <button className="hover:cursor-pointer hover:underline text-primary-blue text-xl font-montserrat">Privacy Policy</button>
                    <button className="hover:cursor-pointer hover:underline text-primary-blue text-xl font-montserrat">Terms of Use</button>
                    <Link className="hover:cursor-pointer hover:underline text-primary-blue text-xl font-montserrat" to="/contact">Contact Us</Link>
                </div>
        </div>
    </div>
}