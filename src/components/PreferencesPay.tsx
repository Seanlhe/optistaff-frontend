import { useState } from 'react';

export const PreferencesPay: React.FC = () => {
  // manage the numerical value of the slider
  const [payRate, setPayRate] = useState<number>(20);

  // state of the checkbox.
  const [considerLower, setConsiderLower] = useState<boolean>(false);

  return (
    <div className="p-6 bg-card-color rounded-lg font-base">
      <h3 className="text-lg font-smb text-primary-text">
        Desired Hourly Pay Rate ($):
      </h3>

      <div className="flex items-center gap-4 mt-4 mb-6">
        {/* display of the selected pay rate */}
        <span className="text-2xl font-bold text-gradient-end w-16">
          ${payRate}
        </span>

        {/* slider input */}
        <input
          type="range"
          min="5" // Minimum selectable pay rate
          max="30" // Maximum selectable pay rate
          value={payRate}
          onChange={(e) => setPayRate(Number(e.target.value))}
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
          checked={considerLower}
          onChange={(e) => setConsiderLower(e.target.checked)}
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