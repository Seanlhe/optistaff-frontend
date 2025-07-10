import { Routes, Route } from 'react-router-dom'

// Import pages
import Index from './pages/Index'
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Import jobseeker pages
import Dashboard from './pages/jobseeker/Dashboard'
import Jobs from './pages/jobseeker/Jobs'
import ShiftDetails from './pages/jobseeker/ShiftDetails'
import Preferences from './pages/jobseeker/Preferences'

// Import employer pages
import EmployerDashboard from './pages/employer/Dashboard'
import Roster from './pages/employer/Roster'
import PostJob from './pages/employer/PostJob'

function App() {
  console.log('App component rendered')
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', color: 'black' }}>
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Job seeker routes */}
        <Route path="/jobseeker" element={<Dashboard />} />
        <Route path="/jobseeker/dashboard" element={<Dashboard />} />
        <Route path="/jobseeker/jobs" element={<Jobs />} />
        <Route path="/jobseeker/shift/:id" element={<ShiftDetails />} />
        <Route path="/jobseeker/preferences" element={<Preferences />} />
        
        {/* Employer routes */}
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/roster" element={<Roster />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
