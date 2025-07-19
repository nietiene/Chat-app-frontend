import Login from "./pages/login"
import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom"
import Register from "./pages/register"
import Dashboard from "./pages/dashboard"
import Chat from "./pages/chat"
import Layout from "./pages/layout"
import CreateGroup from "./pages/CreateGroup"
import GroupMember from "./pages/gorupMember"
import ChangeGroupName from "./pages/ChangeGroupName"
import ChangeGroupPhoto from "./pages/ChangeGroupPhoto"
import Notification from "./pages/notification"
import PostDetail from "./pages/postDetail"
import UserDetail from "./pages/UserDetail"

function App() {

  return (

         <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

         
            <Route element={<Layout/>}>
               <Route path="/dashboard" element={<Dashboard />} />
               <Route path="/dashboard/postId" element={<Dashboard />} />
               <Route path="/chat" element={<Chat />}/>
               <Route path="/create-group" element={<CreateGroup />}/>
               <Route path="/group-members/:g_id" element={<GroupMember />}/>
               <Route path="/changeGroupName/:g_id" element={<ChangeGroupName />}/>
               <Route path="/changeGroupPhoto/:g_id" element={<ChangeGroupPhoto />}/>
               <Route path="/notifications" element={<Notification />}/>
               <Route path="/post/:id" element={<PostDetail />}/>
               <Route path="/user/:user_id" element={<UserDetail />}/>
           </Route>
         </Routes>

  )
}

export default App
