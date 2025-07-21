import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";


export default function Register() {
    const [form, setForm] = useState({name: '', phone: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
      setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/auth/register', form);
            alert('Registered Successfully');
            navigate('/');
        } catch(err) {
            setError(err.response?.data?.message || "Error in registration")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
               <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Create free account</h2>
              {error && (
                  <div className="mb-4 bg-red-100 text-red-600 rounded-md text-sm">
                     {error}
                  </div>
             )}
             
            <form onSubmit={handleSubmit}>
               <input 
                type="text" 
                name="name" 
                placeholder="Full name"
                onChange={handleChange}
                required
                />  <br />

               <input 
                type="phone" 
                name="phone" 
                placeholder="Phone Number"
                onChange={handleChange}
                required
                /> <br />    

               <input 
                type="password" 
                name="password" 
                placeholder="Password"
                onChange={handleChange}
                required
                /> <br />   

                <button type="submit">Create Account</button>             
            </form>
            </div>

        </div>
    )
}