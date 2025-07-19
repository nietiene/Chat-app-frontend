import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { X } from "lucide-react"

export default function UserDetail() {
    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        api.get(`/api/users/${user_id}`, { withCredentials: true })
        .then(res => setUser(res.data))
        .catch(err => console.error('Failed to fetch user:', err));
    }, [user_id]);

    if (!user) return <p className="p-4 text-center text-gray-500">Loading user profie....</p>


    return (
        <div className="relative p-6 max-w-md mx-auto bg-white shadow-lg rounded-xl mt-20 border-gray-200">
            {/* close buttone */}
            <button className="absolute top-4 ring-4 text-gray-400 hover:text-red-500 transition"
               title="Close"
               onClick={() => navigate(-1)}
            >
                <X size={20} />
            </button>

            {user.profile_image ? (
                <img  src={`http://localhost:4000/uploads/${user.profile_image}`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-grayu-400 shadow"

            />
            ) : (
                <div className="w-32 h-32 rounded-full mx-auto items-center justify-center bg-blue-500 text-4xl font-bold text-white shadow">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            )}

            <div className="text-center mt-6">
               <h1 className="text-2xl text-center mt-4 font-semibold text-gray-800">{user.name}</h1>
               <p className="text-center text-gray-500">{user.phone}</p>
               <p className="text-center text-gray-400 text-sm mt-2">Role: {user.role}</p>
               <p className="text-center text-gray-400 text-sm mt-2">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
        </div>

    )
}