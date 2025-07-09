import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function GroupMember () {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddForm, setShowAddForm] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");


    const fetchAvailableUsers = async () => {
        try {
            const res = await api.get("/api/users");
            const userList = res.data;

            const nonMembers = userList.filter(
                (u) => !members.find((m) => m.sender_id === u.sender_id)
            );

            setAvailableUsers(nonMembers);
        } catch (err) {
            console.error("Failed to laod users:", err);
        }
    }

    const handleAddMember = async () => {
        if (!selectedUserId) return;

        try {
            await api.post(`api/groups/group_members/${g_id}`, {
                user_id: selectedUserId
            });
            await fetchMembers();
            setShowAddForm(false);
            selectedUserId("");
        } catch (err) {
            console.error('Failed to add ember.', err);
        }
    }
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/api/groups/group_members/${g_id}`);
                setMembers(res.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load group members..');
                setLoading(false);
            }
        }

        fetchMembers();
    }, [g_id]);

return (
    <div
     className="max-wmd mx-auto p-6 bg-white rounded shadow mt-6">
        <button className="mb-4 text-blue-600 underline"
           onClick={() => navigate('/chat')}
        >
         &larr; Back   
        </button>

        <h2 className="text-xl font-bold mb-4">Group Members</h2>

         <button 
           className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"></button>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
              <ul className="divide-y divide-gray-200">
                {members.length === 0 ? (
                    <li className="py-2 text-gray-500">No members found.</li>
                ) : (
                    members.map((member) => (
                        <li key={member.user_id} className="py-2">
                            <span className="font-semibold">{member.name || member.user_id}</span>
                        </li>
                    ))
                )}
              </ul>
        )}
     </div>
)
}