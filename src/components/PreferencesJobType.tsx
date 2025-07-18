import { useState } from 'react';

// job types.
const jobData = {
  "F&B and Hospitality": [
    "Kitchen Helper", "Waiter/Waitress", "Dishwasher", "Bartender/Barista",
    "Banquet Server", "Food Stall Assistant", "Cleaner",
  ],
  "Retail and Events": [
    "Sales Associate", "Cashier", "Promoter", "Usher",
    "Event Crew", "Customer Service", "Leaflet Distributor",
  ],
  "Logistics and Warehouse": [
    "Packer", "Warehouse Assistant", "Inventory Checker", "Delivery", "Sorter",
  ],
};

export const PreferenceJobType: React.FC = () => {
  // state to hold the selected jobs
  const [selectedJobs, setSelectedJobs] = useState<{ [key: string]: boolean }>({});

  // handle changes when a checkbox is clicked.
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedJobs(prev => ({
      ...prev, // Copies the previous state to not lose other selections
      [name]: checked, // Updates the state for the clicked item
    }));
  };

  return (
    <div className="p-4 rounded-lg bg-card-color">
      <h3 className="text-lg font-bold text-primary-text mb-1">
        Preferred Job Type
      </h3>

      <p className="text-secondary-text mb-6 text-sm">
        Select all job types you're interested in
      </p>

      {/* map over each category in the job data */}
      {Object.entries(jobData).map(([category, jobs]) => (
        <div key={category} className="mb-6 last:mb-0">
          <h4 className="text-base font-semibold mt-4 mb-3 text-primary-text border-b border-border pb-2">
            {category}
          </h4>

          {/* container for the job checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {jobs.map((job) => (
              <label
                key={job}
                htmlFor={job}
                className={`
                  flex items-center p-3 rounded-radius cursor-pointer transition-colors
                  ${selectedJobs[job]
                    ? 'bg-primary-blue/5 text-gradient-end' 
                    : 'bg-card-color text-secondary-text hover:bg-border/30' 
                  }
                `}
              >
                <input
                  type="checkbox"
                  id={job}
                  name={job}
                  checked={selectedJobs[job] || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded-sm border-border text-primary-blue focus:ring-primary-blue"
                />
                <span className="ml-3 text-sm">{job}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PreferenceJobType;