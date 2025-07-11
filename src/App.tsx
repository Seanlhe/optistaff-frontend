import './App.css'
import {Route, Routes} from "react-router-dom"
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import ClientLayout from './pages/ClientLayout'
import ClientDashboard from './pages/employer/ClientDashboard'
import UploadJobs from './pages/employer/UploadJobs'
import JSLayout from './pages/JSLayout'
import JSPref from './pages/employee/JSPref'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/employer" element={<ClientLayout/>}>
          <Route path="dashboard" element={<ClientDashboard/>}/>
          <Route path="roster" element={<ClientDashboard/>}/>
          <Route path="settings" element={<ClientDashboard/>}/>
          <Route path="profile" element={<ClientDashboard/>}/>
          <Route path="uploadjobs" element={<UploadJobs/>}/>
        </Route>
        <Route path="/employee" element={<JSLayout/>}>
          <Route path="preferences" element={<JSPref/>}/>
        </Route>
      </Routes>
    </>
  )
}

export default App
