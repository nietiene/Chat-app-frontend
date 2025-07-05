import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import  { FaHome, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";

export default function Dashboard() {
    const [user, setUser] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            setUser(res.data);
        })
        .catch((err) => {
            alert("Please login first");
            navigate('/');
        })
    }, []);

    if (!user) return <p>Loading.....</p>

    return (
        <div className="min-h-screen flex flex-col">
               <nav className="flex justify-between items-center bg-blue-700 text-white px-6 py-3 shadow">
                <div className="flex gap-6 items-center">
                    <Link className="flex items-center gap-1 hover:underline">
                         <FaHome/> Home
                    </Link>
                    <Link className="flex items-center gap-1 hover:underline">
                          <FaEnvelope/> Messages
                    </Link>
                    <Link className="flex items-center gap-1 hover:underline">
                        <FaBell/> Notification
                    </Link>
                </div>
                
                <button className="bg-white text-blue-700 px-3 py-2 rounded-xl font-semibold flex flex-col items-center">
                    <FaUserCircle className="text-3xl mb-1"/>
                </button>
               </nav>

          <div className="flex flex-1">
             <aside className="w-64 bg-gray-100 p-4 border-r shadowsm">
                <h2 className="text-lg font-bold mb-4">Profile</h2>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {user.name} </p>
                  <p><strong>Phone:</strong> {user.phone} </p>
                  <p><strong>Role:</strong> {user.role} </p>
                </div>

                {['director', 'dos', 'patron', 'matron', 'dod'].includes(user.role) && (
                    <button
                      className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ">
                        Make Post
                      </button>
                )}
             </aside>

             <main className="flex-1 gap-6 bg-white">
                <h2 className="text-xl font-bold mb-4">Post Feed</h2>

                <div className="p-4 border rounded shadow">
                     <p></p>
                </div>
             </main>
         </div>
        </div>
    )
}