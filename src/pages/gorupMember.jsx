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
    const [selectedUserId, setSelectedUserId] = useState([]);


    useEffect(() => {
        fetchMembers();
    }, [g_id]);

    const fetchAvailableUsers = async () => {
        try {
            const res = await api.get("/api/users");
            const userList = res.data;

            const nonMembers = userList.filter(
                (u) => !members.find((m) => m.user_id === u.user_id)
            );

            console.log("userList", userList);
            console.log("members", members);
            console.log("NonMembers", nonMembers);

            setAvailableUsers(nonMembers);
        } catch (err) {
            console.error("Failed to laod users:", err);
        }
    }

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


    const handleAddMember = async () => {
        if (selectedUserId.length === 0) return;

        try {
            for (const user_id of selectedUserId) {
                  console.log("Adding user_id:", user_id);
                  await api.post(`/api/groups/group_members/${g_id}`, { user_id });
            }
            await fetchMembers();
            setShowAddForm(false);
            setSelectedUserId([]);
        } catch (err) {
            console.error('Failed to add ember.', err);
        }
    }

    const handleChekBoxChange = (userId) => {
        setSelectedUserId(prev => 
            prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
        )
    }

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
           className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
           onClick={() => {
            fetchAvailableUsers();
            setShowAddForm(true);
           }}
        >
            + Add Member
       </button>
       {showAddForm && (
           <div className="mb-4 border p-3 rounded bg-gray-50">
            <h3 className="text-sm font-semibold mb-2">Select a user to add in group</h3>
               {availableUsers.length === 0 ? (
                 <p className="text-gray-500 text-sm">No available user to add.</p>
               ) : (
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                    {availableUsers.map((user, idx) => (
                        <label key={user.user_id || idx}
                           className="flex items-center space-x-2 text-sm"
                        >
                            <input type="checkbox" 
                              checked={selectedUserId.includes(user.user_id)}
                              onChange={() => handleChekBoxChange(user.user_id)} 
                              className="accent-blue-600"
                            /> 
                            <span>{user.name}</span>
                           </label>
                    ))}
                </div>
               )}
            <button className="bg-blue-500 text-white px-4 py-1 rounded hver:bg-blue-700"
               onClick={handleAddMember}
               disabled={selectedUserId.length === 0}
            >
                Add to Group
               </button>
           </div>
       )}
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