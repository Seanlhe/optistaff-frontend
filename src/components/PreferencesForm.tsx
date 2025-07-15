import { Map } from "./Map";
import PreferencesJobType from "./PreferencesJobType";
import PreferencesMaximum from "./PreferencesMaximum";
import PreferencesPay from "./PreferencesPay";

const PreferencesForm = () => {
  return (
    <div className="bg-card-color p-8 rounded-xl border border-border">
      <PreferencesMaximum />
      <PreferencesPay />
      <PreferencesJobType />
      <Map />
      <div className="flex justify-end mt-6">
        <button className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-primary-blue-hover">
          Submit
        </button>
      </div>
    </div>
  );
};

export default PreferencesForm;