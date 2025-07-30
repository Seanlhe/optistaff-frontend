/**
 * ProfilePage Component
 * @description Main profile management page with three sections:
 * 1. Profile Display (read-only)
 * 2. Personal Information (editable)
 * 3. Account Settings (editable)
 * @author OptiStaff Team
 * @updated Fix for hot reload issues
 */

import { useUserProfile } from "../hooks/useUserProfile";
import ProfileDisplayCard from "./ProfileDisplayCard";
import PersonalInfoCard from "./PersonalInfoCard";
import AccountSettingsCard from "./AccountSettingsCard";

const ProfilePage = () => {
  const { profileData, loading, error, isJobSeeker, isClient } =
    useUserProfile();

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-card-color p-6 rounded-xl border border-border animate-pulse">
          <div className="h-6 bg-secondary-bg rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-secondary-bg rounded w-1/3"></div>
              <div className="h-6 bg-secondary-bg rounded w-2/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-secondary-bg rounded w-1/3"></div>
              <div className="h-6 bg-secondary-bg rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <div className="bg-card-color p-6 rounded-xl border border-border animate-pulse">
          <div className="h-6 bg-secondary-bg rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-secondary-bg rounded"></div>
            <div className="h-10 bg-secondary-bg rounded"></div>
            <div className="h-10 bg-secondary-bg rounded"></div>
          </div>
        </div>

        <div className="bg-card-color p-6 rounded-xl border border-border animate-pulse">
          <div className="h-6 bg-secondary-bg rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-secondary-bg rounded"></div>
            <div className="h-10 bg-secondary-bg rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card-color p-6 rounded-xl border border-border">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-red mt-0.5 mr-3 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-dark">
              Error Loading Profile
            </h3>
            <p className="text-sm text-primary-text mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm bg-red hover:bg-red-dark text-white px-3 py-1 rounded-md transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="bg-card-color p-6 rounded-xl border border-border">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-secondary-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-primary-text">
            No Profile Data
          </h3>
          <p className="mt-1 text-sm text-secondary-text">
            Your profile information could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Profile Display (Read-Only) */}
      <ProfileDisplayCard />

      {/* Section 2: Personal Information (Editable) */}
      <PersonalInfoCard />

      {/* Section 3: Account Settings (Editable) */}
      <AccountSettingsCard />

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-secondary-bg p-4 rounded-lg text-xs text-secondary-text">
          <strong>Debug Info:</strong> User Role:{" "}
          {isJobSeeker() ? "Job Seeker" : isClient() ? "Client" : "Unknown"}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
