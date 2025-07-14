
import { Map } from "./Map";
import PreferencesJobType from "./PreferencesJobType";
import PreferencesPay from "./PreferencesPay";

const PreferencesForm = () => {
  return (
    
    <div>
      <div>
        <label className="block text-sm mb-2">
          Maximum Hours per Week
        </label>
        <input 
          type="number"  
          className="p-2 border rounded-lg w-24 mb-5"
          min="1"
          max="44"
          placeholder="44"
        />
      </div>
      <PreferencesPay />
      <PreferencesJobType />
 
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