import './App.css'
import {Route, Routes} from "react-router-dom"
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ClientLayout from './pages/ClientLayout'
import JSLayout from './pages/JSLayout'
import JSNav from './pages/employee/JSNav'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/employer" element={<ClientLayout/>}/>
        <Route path="/employee" element={<JSLayout/>}/>
        <Route path="/navbar" element={<JSNav/>}/>
      </Routes>
    </>
  )
}

export default App
