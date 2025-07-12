/**
 * Job Seeker Preferences Component
 * @description Job preferences and availability settings for job seekers
 */
import { Map } from "./Map";

const PreferencesForm = () => {
  return (
    <div>
      <Map />
      <div className="flex justify-end mb-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Submit
        </button>
      </div>
  </div>
  );
};

export default PreferencesForm;