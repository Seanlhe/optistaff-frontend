import { useState } from 'react';

import PreferencesPage from '../../components/PreferencesForm';
import AvailabilityPage from '../../components/Availability';

type Tab = 'PreferencesForm' | 'Availability';

const Preferences = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PreferencesForm');

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* The tab buttons container */}
        <div className="py-8 mb-6">
          <div className="inline-flex p-1 bg-gray-200 rounded-lg gap-1">
            <button
              onClick={() => setActiveTab('PreferencesForm')}
              className={`px-3 py-2 rounded-lg ${
                activeTab === 'PreferencesForm'
                  ? 'bg-white' // Active styles
                  : 'hover:bg-white/60'  // Inactive styles
              }`}
            >
              Preferences
            </button>

            <button
              onClick={() => setActiveTab('Availability')}
              className={`px-3 py-2 rounded-lg ${
                activeTab === 'Availability'
                  ? 'bg-white' // Active styles
                  : 'hover:bg-white/60'  // Inactive styles
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