import React from "react";
import api from "..api.js";
import { useNavigate } from "react-router-dom"
import { useState } from "react";

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', { phone, password });
            alert(res.data.message);
            navigate('/dashboard');
        }
    }
}
