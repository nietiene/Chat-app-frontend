import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import  { FaHome, FaEnvelope, FaBell, FaUser } from "react-icons/fa";

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
                    <img src="https://ui-avatars.com/api/?name=User" alt="User Avatar" 
                          className="w-10 h-10 rounded-full mb-1"/>
                </button>
               </nav>

            <button> {user.name}</button>


<main>
       
</main>
            <div>
                {/* <button onClick={() => navigate('/chat')}>Start chat</button> */}
                {['director', 'dos', 'patron', 'matron'].includes(user.role) && (
                    <button onClick={() => navigate('/post')}>Make post</button>
                )}
            </div>
        </div>
    )
}