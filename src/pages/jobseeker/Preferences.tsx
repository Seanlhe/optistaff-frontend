import { useState } from 'react';

import PreferencesPage from '../../components/PreferencesForm';
import AvailabilityPage from '../../components/Availability';

type Tab = 'PreferencesForm' | 'Availability';

const Preferences = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PreferencesForm');

  return (
    <div className="bg-[color:var(--primary-gray)] min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* The tab buttons container */}
        <div className="py-8 mb-6">
          <div className="inline-flex p-1 bg-[color:var(--secondary-gray)] rounded-lg gap-1">
            <button
              onClick={() => setActiveTab('PreferencesForm')}
              className={`px-3 py-2 rounded-lg font-semibold text-[color:var(--text-main)] ${
                activeTab === 'PreferencesForm'
                  ? 'bg-[color:var(--card-color)] shadow'
                  : 'hover:bg-[color:var(--accent-gray)]'
              }`}
            >
              Preferences
            </button>

            <button
              onClick={() => setActiveTab('Availability')}
              className={`px-3 py-2 rounded-lg font-semibold text-[color:var(--text-main)] ${
                activeTab === 'Availability'
                  ? 'bg-[color:var(--card-color)] shadow'
                  : 'hover:bg-[color:var(--accent-gray)]'
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