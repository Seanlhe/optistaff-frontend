import { useState } from "react";

import PreferencesPage from "../../components/PreferencesForm";
import AvailabilityPage from "../../components/Availability";

type Tab = "PreferencesForm" | "Availability";

const Preferences = () => {
  const [activeTab, setActiveTab] = useState<Tab>("PreferencesForm");

  // Handle tab switching with error logging
  const handleTabChange = (tab: Tab) => {
    try {
      setActiveTab(tab);
    } catch (error) {
      console.log("Error switching tabs:", error);
      // Continue with current tab if switch fails
    }
  };

  return (
    <div className="bg-tertiary-bg min-h-full p-4">
      <div className="max-w-5xl mx-auto">
        {/* The tab buttons container */}
        <div className="py-8">
          <div className="inline-flex p-1 bg-secondary-bg rounded-lg gap-1">
            <button
              onClick={() => handleTabChange("PreferencesForm")}
              className={`px-3 py-2 rounded-lg text-sm ${
                activeTab === "PreferencesForm"
                  ? "bg-white" // Active styles
                  : "hover:bg-white/60" // Inactive styles
              }`}
            >
              Preferences
            </button>

            <button
              onClick={() => handleTabChange("Availability")}
              className={`px-3 py-2 rounded-lg text-sm ${
                activeTab === "Availability"
                  ? "bg-white" // Active styles
                  : "hover:bg-white/60" // Inactive styles
              }`}
            >
              Availability
            </button>
          </div>
        </div>

        {/* Page Content Area */}
        <div>
          {activeTab === "PreferencesForm" && <PreferencesPage />}

          {/* If activeTab is 'Availability', show the AvailabilityPage component */}
          {activeTab === "Availability" && <AvailabilityPage />}
        </div>
      </div>
    </div>
  );
};

export default Preferences;
