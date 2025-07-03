import React from "react";
import io from "socket.io-client"
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

const socket = io("http://localhost:4000", {withCredentials: true})

export default function Chat() {
    const [myUsername, setMyUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            setMyUsername(res.data.name);
        })
    })
}
