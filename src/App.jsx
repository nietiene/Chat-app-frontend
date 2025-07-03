import Login from "./pages/login"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"
import Chat from "./pages/chat"

function App() {

  return (

         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />}/>
         </Routes>

  )
}

export default App
