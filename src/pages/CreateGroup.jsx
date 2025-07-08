import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function CreateGroup () {

    const [groupName, setGroupName] = useSearchParams('');
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
                members: [...selectedUsers, myName]
            });
            navigate('/chat');
        } catch (error) {
            console.error('Group creation failed', error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 mt-10 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Group name</label>
                <input type="text"
                   value={groupName}
                   onChange={(e) => setGroupName(e.target.value)}
                   className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                   placeholder="Enter group name"
                   />
            </div>
        </div>
    )
} 