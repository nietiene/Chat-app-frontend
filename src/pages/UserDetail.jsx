import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

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
        <div className="relative p-6 max-w-md mx-auto bg-white shadow rounded-xl mt-20 border-gray-200">
            {user.profile_image ? (
                <img  src={`http://localhost:4000/uploads/${user.profile_image}`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"

            />
            ) : (
                <div className="w-32 h-32 rounded-full mx-auto object-cover">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            )}

            <h1 className="text-2xl text-center mt-4 font-semibold">{user.name}</h1>
            <p className="text-center text-gray-600">{user.phone}</p>
            <p className="text-center text-gray-400 text-sm mt-2">Role: {user.role}</p>
            <p className="text-center text-gray-400 text-sm mt-2">
                Joined: {new Date(user.created_at).toLocaleDateString()}
            </p>
        </div>

    )
}