import Login from "./pages/login"
import { BrowserRouter, Router, Routes, Route, Link } from "react-router-dom"
function App() {

  return (
     <Router>
         <Routes>
            <Route path="/" element={<Login />} />
         </Routes>
     </Router>
  )
}

export default App
