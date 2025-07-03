import React from "react";
import api from "../api.js";
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
        } catch(err) {
            setError(err.response?.data?.message || 'Login Failed');
        }
    }


    return (
        <div>
            <h2>Login</h2>
            {error && <p>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <input type="text" name="phone" placeholder="Phone" value={phone} required
                onChange={(e) => setPhone(e.target.value)}/> <br />
                <input type="password" name="password" placeholder="Password" value={password} required
                onChange={(e) => setPassword(e.target.value)}/> <br />
                <button type="submit">Login</button>
            </form>
        </div>
    )
}
