import { useState, useEffect } from 'react';
import { useJobTypes } from '../hooks/useJobTypes';
import { usePreferences } from '../hooks/usePreferences';
import { PreferenceJobTypeProps } from '../types/components';

export const PreferenceJobType: React.FC<PreferenceJobTypeProps> = ({ 
  formData, 
  setFormData 
}) => {
  // Use hooks for data management
  const { jobTypesByCategory, loading: jobTypesLoading, error: jobTypesError } = useJobTypes();
  const { preferences, loading: preferencesLoading } = usePreferences();
  
  // state to hold the selected jobs
  const [selectedJobs, setSelectedJobs] = useState<{ [key: string]: boolean }>({});

  // Load existing preferences when component mounts
  useEffect(() => {
    if (preferences && preferences.desired_roles) {
      // Convert job type IDs to job names for form display
      const selectedJobNames: { [key: string]: boolean } = {};
      
      Object.values(jobTypesByCategory).flat().forEach(jobType => {
        if (preferences.desired_roles.includes(jobType.job_type_id)) {
          selectedJobNames[jobType.type_name] = true;
        }
      });
      
      setSelectedJobs(selectedJobNames);
    }
  }, [preferences, jobTypesByCategory]);

  // handle changes when a checkbox is clicked.
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    
    // Update local state
    setSelectedJobs(prev => ({
      ...prev, // Copies the previous state to not lose other selections
      [name]: checked, // Updates the state for the clicked item
    }));

    // Update parent form data
    const updatedSelectedJobs = { ...selectedJobs, [name]: checked };
    const selectedJobNames = Object.keys(updatedSelectedJobs).filter(
      jobName => updatedSelectedJobs[jobName]
    );
    
    setFormData({
      ...formData,
      selectedJobNames
    });
  };

  // Show loading state
  if (jobTypesLoading || preferencesLoading) {
    return (
      <div className="p-4 rounded-lg bg-card-color">
        <div className="animate-pulse">
          <div className="h-6 bg-border rounded mb-4"></div>
          <div className="h-4 bg-border rounded mb-6 w-3/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="h-5 bg-border rounded mb-2"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-12 bg-border rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (jobTypesError) {
    return (
      <div className="p-4 rounded-lg bg-card-color">
        <div className="text-red-500">
          <h3 className="font-bold mb-2">Error Loading Job Types</h3>
          <p>{jobTypesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-card-color">
      <h3 className="text-lg font-bold text-primary-text mb-1">
        Preferred Job Type
      </h3>

      <p className="text-secondary-text mb-6 text-sm">
        Select all job types you're interested in
      </p>

      {/* map over each category from database */}
      {Object.entries(jobTypesByCategory).map(([categoryName, jobTypes]) => (
        <div key={categoryName} className="mb-6 last:mb-0">
          <h4 className="font-smb text-lg mt-4 mb-3 text-primary-text border-b border-border pb-2">
            {categoryName}
          </h4>

          {/* container for the job checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {jobTypes.map((jobType) => (
              <label
                key={jobType.job_type_id}
                htmlFor={jobType.job_type_id}
                className={`
                  flex items-center p-3 rounded-radius cursor-pointer transition-colors
                  ${selectedJobs[jobType.type_name]
                    ? 'bg-primary-blue/5 text-gradient-end' 
                    : 'bg-card-color text-secondary-text hover:bg-border/30' 
                  }
                `}
              >
                <input
                  type="checkbox"
                  id={jobType.job_type_id}
                  name={jobType.type_name}
                  checked={selectedJobs[jobType.type_name] || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded-sm border-border text-primary-blue focus:ring-primary-blue"
                />
                <span className="ml-3 font-base">{jobType.type_name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PreferenceJobType;