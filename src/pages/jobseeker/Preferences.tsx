import { useState } from 'react';

import PreferencesPage from '../../components/PreferencesForm';
import AvailabilityPage from '../../components/Availability';

type Tab = 'PreferencesForm' | 'Availability';

const Preferences = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PreferencesForm');

  return (
    <div className="bg-primary-gray min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* The tab buttons container */}
        <div className="py-8 mb-6">
          <div className="inline-flex p-1 bg-secondary-gray rounded-lg gap-1">
            <button
              onClick={() => setActiveTab('PreferencesForm')}
              className={`px-3 py-2 rounded-lg font-semibold text-main ${
                activeTab === 'PreferencesForm'
                  ? 'bg-card-color shadow'
                  : 'hover:bg-accent-gray'
              }`}
            >
              Preferences
            </button>

            <button
              onClick={() => setActiveTab('Availability')}
              className={`px-3 py-2 rounded-lg font-semibold text-main ${
                activeTab === 'Availability'
                  ? 'bg-card-color shadow'
                  : 'hover:bg-accent-gray'
              }`}
            >
              Availability
            </button>
          </div>
        </div>

        {/* Page Content Area */}
        <div>
          {activeTab === 'PreferencesForm' && <PreferencesPage />}

          {/* If activeTab is 'Availability', show the AvailabilityPage component */}
          {activeTab === 'Availability' && <AvailabilityPage />}
        </div>
      </div>
    </div>
  );
};

export default Preferences;