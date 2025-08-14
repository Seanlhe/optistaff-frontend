/**
 * ClientSettings Page
 * @description Employer Settings page with profile management
 * Uses the ProfilePage component with three cards for complete profile management
 * @author OptiStaff Team
 */

import ProfilePage from "../../components/ProfilePage";

const ClientSettings = () => {
  return (
    <div className="bg-tertiary-bg min-h-full p-4 px-12 py-6">
      <div className="mx-auto">
        {/* Page Header */}
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-xl font-montserrat-b text-gray-900">Settings</h1>
            <p className="text-gray-600 text-base font-montserrat-smb">
              Manage your company profile and account settings
            </p>
        </div>
        {/* Profile Management Content */}
        <ProfilePage />
      </div>
    </div>
  );
};

export default ClientSettings;
