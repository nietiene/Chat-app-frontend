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

        
    }
}