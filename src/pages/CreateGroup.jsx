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
    })
} 