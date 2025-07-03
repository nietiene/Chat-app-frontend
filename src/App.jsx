import Login from "./pages/login"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Register from "./pages/register"

function App() {

  return (

         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
         </Routes>

  )
}

export default App
