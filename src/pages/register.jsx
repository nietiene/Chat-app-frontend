import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";


export default function Register() {
    const [from, setForm] = useState({name: '', phone: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
      setForm({...from, [e.target.name] : [e.target.value] });
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
        <div>
            <h2>Create free account</h2>
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
               <input 
                type="text" 
                name="name" 
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
                />     

               <input 
                type="phone" 
                name="phone" 
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                />    

               <input 
                type="password" 
                name="password" 
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                />                
            </form>
        </div>
    )
}