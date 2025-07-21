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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
               {error &&
                   <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                      {error}
                   </div>
                }
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <input
                      type="text" 
                      name="phone"
                      placeholder="Phone" 
                      value={phone} 
                      required
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    /> <br />
                </div>

                <input type="password" name="password" placeholder="Password" value={password} required
                onChange={(e) => setPassword(e.target.value)}/> <br />
                <button type="submit">Login</button>
            </form>
</div>

        </div>
    )
}
