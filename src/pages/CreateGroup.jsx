import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateGroup () {

    const [groupName, setGroupName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [myName, setMyName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/profile');
                setMyName(res.data.name);
            } catch (error) {
                navigate('/');
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/users');
                setAllUsers(res.data);
            } catch (error) {
                 console.error('Error fetching users:', error);
            }
        }
        fetchProfile();
        fetchUsers();
    }, [navigate]);

    const toggleUserSelection = (username) => {
        setSelectedUsers(prev => 
            prev.includes(username)
            ? prev.filter(name => name !== username)
            : [...prev, username]
        );
    };

    const createGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        try {
            await api.post('/api/groups', {
                name: groupName,
                // selectedUsers is current members you selected, myName is your name also you're included in the group
                members: [...selectedUsers, myName]
            });
            navigate('/chat');
        } catch (error) {
            console.error('Group creation failed', error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-white shadow-md rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Group</h2>

            <div className="mb-5">
                <label className="block text-sm font-medium mb-1 text-gray-700">Group name</label>
                <input type="text"
                   value={groupName}
                   onChange={(e) => setGroupName(e.target.value)}
                   className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   placeholder="Enter group name"
                   />
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">Select Members</label>
                <div className="max-h-64 overflow-y-auto border rounded-lg p-3 border-gray-300 bg-gray-50 shadow-inner">
                    {allUsers.filter(user => user.name !== myName)
                      .map(user => (
                        <div className="flex items-center mb-2" key={user.name}>
                             <input type="checkbox"
                                id={`user-${user.name}`}
                                checked={selectedUsers.includes(user.name)}
                                onChange={() => toggleUserSelection(user.name)}
                                className="mr-3 h-4 w-4 text-blue-600 foucs:ring-blue-500"
                            />
                            <label htmlFor={`user-${user.name}`} className="text-sm hover:bg-gray-300">{user.name}</label>
                        </div>
                      ))}
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                  onClick={() => navigate('/chat')}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
                    Cancel
            </button>
           <button 
              onClick={createGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0}
               className="px-4 py-2 bg-blue-600 text-white rounded disabled:cursor-not-allowed  hover:bg-blue-700 disabled:bg-gray-400"
            >
                Create Group
            </button>
            </div>
        </div>
    )
} 