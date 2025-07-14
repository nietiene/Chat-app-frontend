import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function changeGroupName() {
    const navigate = useNavigate();
    const { g_id } = useParams();
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangeName = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setLoading(true);

        try {
            await api.patch(`/api/groups/${g_id}`, { group_name: newName });
            alert('Group name updated!');
            navigate('/chat');

        } catch (err) {
            console.error('Failed to update group name:', err);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    }
}