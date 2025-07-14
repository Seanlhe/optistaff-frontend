import { useAuth } from '../hooks/useAuth';

export const AuthDebugger = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading auth state...</div>;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold text-yellow-800">Auth Debug Info</h3>
      <div className="text-sm text-yellow-700 mt-2">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
        <p><strong>Expected Route:</strong> {user?.role === 'jobseeker' ? '/employee/preferences' : '/employer/dashboard'}</p>
      </div>
    </div>
  );
};
