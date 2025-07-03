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
}