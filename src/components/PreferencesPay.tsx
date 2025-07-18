import { PreferencesPayProps } from '../types/components';

export const PreferencesPay: React.FC<PreferencesPayProps> = ({ formData, setFormData }) => {
  const handlePayRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData({
      ...formData,
      payRate: value
    });
  };

  const handleConsiderLowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      considerLowerRate: e.target.checked
    });
  };

  return (
    <div className="p-6 bg-card-color rounded-lg font-base">
      <h3 className="text-lg font-smb text-primary-text">
        Desired Hourly Pay Rate ($):
      </h3>

      <div className="flex items-center gap-4 mt-4 mb-6">
        {/* display of the selected pay rate */}
        <span className="text-2xl font-bold text-gradient-end w-16">
          ${formData.payRate}
        </span>

        {/* slider input */}
        <input
          type="range"
          min="5" // Minimum selectable pay rate
          max="30" // Maximum selectable pay rate
          value={formData.payRate}
          onChange={handlePayRateChange}
          className="
            w-1/3 h-2 bg-secondary-bg rounded-full appearance-none cursor-pointer
    accent-primary-blue
          "
        />
      </div>

      {/* checkbox and label aligned */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="consider-lower-rate"
          checked={formData.considerLowerRate}
          onChange={handleConsiderLowerChange}
          className="
            h-5 w-5 rounded border-border cursor-pointer
           focus:ring-primary-blue
          "
        />
        <label
          htmlFor="consider-lower-rate"
          className="ml-3 text-secondary-text cursor-pointer"
        >
          Consider me for a job with lower rate
        </label>
      </div>
    </div>
  );
};

export default PreferencesPay;