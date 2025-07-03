import Login from "./pages/login"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"

function App() {

  return (

         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
         </Routes>

  )
}

export default App
