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
import ClientHistory from './pages/employer/ClientHistory'
import EditListing from './pages/employer/ClientEdit'
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
          <Route path="edit" element={<EditListing shift={{
            shift_id: "shift_001",
            client_id: "client_123",
            title: "Event Support Staff",
            description: "Assist with event logistics and crowd control.",
            start_time: new Date("2025-08-01T09:00:00"),
            end_time: new Date("2025-08-01T17:00:00"),
            pay_rate: 15.5,
            job_location: "Marina Bay Sands Singapore 424239",
            staff_needed: 10,
            staff_assigned: 5,
            submission_cycle: "PRIMARY",
            created_at: new Date("2025-07-20T12:00:00"),
            break_duration: 60,
            status: 1
          }} />}/>
          <Route path="history" element={<ClientHistory/>}/>
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
          
        </Route>
        
      </Routes>
    </QueryClientProvider>
  );
}

export default App
