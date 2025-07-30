/**
 * JSSettings Page
 * @description Job Seeker Settings page with profile management
 * Uses the ProfilePage component with three cards for complete profile management
 * @author OptiStaff Team
 */

import ProfilePage from "../../components/ProfilePage";

const JSSettings = () => {
  return (
    <div className="bg-tertiary-bg min-h-full p-4">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary-text">Settings</h1>
            <p className="text-secondary-text mt-2">
              Manage your profile information and account settings
            </p>
          </div>
        </div>

        {/* Profile Management Content */}
        <ProfilePage />
      </div>
    </div>
  );
};

export default JSSettings;
