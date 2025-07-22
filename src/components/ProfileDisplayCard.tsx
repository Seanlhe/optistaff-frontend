/**
 * ProfileDisplayCard Component
 * @description Read-only display of profile information
 * Shows: name, email, rating (job seekers), company (clients), account status
 * @author OptiStaff Team
 */

import { useUserProfile } from "../hooks/useUserProfile";

const ProfileDisplayCard = () => {
  const { 
    getDisplayData,
    isJobSeeker,
    isClient
  } = useUserProfile();

  const displayData = getDisplayData();

  if (!displayData) {
    return null;
  }

  // Format account creation date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format rating display
  const formatRating = (rating?: number) => {
    if (typeof rating !== 'number') return 'No rating';
    return `${rating.toFixed(1)}/5.0`;
  };

  return (
    <div className="bg-card-color p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Overview</h2>
        
        {/* Profile completion indicator for job seekers */}
        {isJobSeeker() && (
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile Complete
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <p className="text-lg font-medium text-gray-900">
              {displayData.fullName || 'Name not set'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-md border">
              {displayData.email}
            </p>
          </div>
          
          {/* Company name for clients */}
          {isClient() && displayData.companyName && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
              <p className="text-lg font-medium text-gray-900">
                {displayData.companyName}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Rating for job seekers */}
          {isJobSeeker() && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Rating</label>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (displayData.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatRating(displayData.rating)}
                </span>
              </div>
            </div>
          )}

          {/* Account status for job seekers */}
          {isJobSeeker() && displayData.accountStatus && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Account Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeStyle(displayData.accountStatus)}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  displayData.accountStatus === 'ACTIVE' ? 'bg-green-400' :
                  displayData.accountStatus === 'SUSPENDED' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                {displayData.accountStatus}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
            <p className="text-gray-900">
              {formatDate(displayData.accountCreated)}
            </p>
          </div>
        </div>
      </div>

      {/* Additional info section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {isJobSeeker() ? 'Job Seeker Account' : 'Employer Account'}
          </span>
          <span>
            ID: {displayData.email.split('@')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplayCard;