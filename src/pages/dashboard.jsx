import React from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

export default function Dashboard() {
    const [user, setUser] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            setUser(res.data);
        })
        .catch((err) => {
            alert("Please login first");
            navigate('/');
        })
    }, []);

    if (!user) return <p>Loading.....</p>

    return (
        <div>
            <h3>Welcome {user.name} 👋</h3>

            <div>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Role:</strong> {user.role}</p>
            </div>
        </div>
    )
}