import './App.css'
import { Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import Auth from './pages/Auth'
import ClientLayout from './pages/ClientLayout'
import ClientDashboard from './pages/employer/ClientDashboard'
import UploadJobs from './pages/employer/UploadJobs'
import JSLayout from './pages/JSLayout'
import JSSettings from './pages/employee/JSSettings'
import JSPref from './pages/employee/JSPref'
import JSDashboard from './pages/employee/JSDashboard'
import ClientRoster from './pages/employer/ClientRoster'
import { ProtectedRoute } from './components/ProtectedRoute'
import UploadCSV from './pages/employer/UploadCSV'
import JSSchedule from './pages/employee/JSSchedule'
import Review from './pages/employer/Review'
import EmployeeHistory from './pages/employee/EmployeeHistory';
import JSMyjobs from './pages/employee/JSMyjobs';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/employer"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="roster" element={<ClientRoster />} />
          <Route path="settings" element={<ClientDashboard />} />
          <Route path="profile" element={<ClientDashboard />} />
          <Route path="uploadjobs" element={<UploadJobs />} />
          <Route path="uploadcsv" element={<UploadCSV />} />
          <Route path="review" element={<Review />} /> 
        </Route>  
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['jobseeker']}>
            <JSLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<JSDashboard />} />
          <Route path="preferences" element={<JSPref />} />
          <Route path="dashboard" element={<JSDashboard />} />
          <Route path="history" element={<EmployeeHistory />} />
          <Route path="schedule" element={<JSSchedule />} />
          <Route path="settings" element={<JSSettings />} />
          <Route path="myJobs" element={<JSMyjobs />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App
