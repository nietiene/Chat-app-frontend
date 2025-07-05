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
                <Link>Home</Link>
                <Link>Messages</Link>
                <Link>Notification</Link>
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