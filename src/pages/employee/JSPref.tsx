
import { Calendar } from "../../components/Calendar";
import ProgressIndicator from "../../components/ProgressIndicator";
import { Map } from "../../components/Map"; // Add this import

export default function JSPref(){
    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            
            <div className="py-8 mb-6">
              <ProgressIndicator />
            </div>
            <Map />
           <div className="flex justify-end mb-4">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-montserrat-smb rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-colors">
                Submit
              </button>
            </div>
            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-montserrat-smb text-zinc-900 dark:text-zinc-100">
                  Select Available Timings
                </h1>
              </div>
              <Calendar />
            </div>
          </div>
        </div>
      );
}