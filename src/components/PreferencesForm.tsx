/**
 * Job Seeker Preferences Component
 * @description Job preferences and availability settings for job seekers
 */
import { Map } from "./Map";

const PreferencesForm = () => {
  return (
    <div className="bg-white rounded-xl p-6">
      <Map />
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-button-color text-white rounded-md hover:bg-blue-700">
          Submit
        </button>
      </div>
    </div>
  );
};

export default PreferencesForm;
