import React from "react";
import io from "socket.io-client"
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
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
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userFromQuery = params.get("user");

        if (userFromQuery) {
            setSelectedUser(userFromQuery);
        }
    }, [location.search]);

    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            setMyUsername(res.data.name);
            socket.emit('login', res.data.name);
        }).catch((err) => {
            navigate('/');
        });

        socket.on('privateMessage', ({ from, message }) => {
            setMessages(prev => [...prev, { sender: from, message}]);
        });

        socket.on('typing', () => setTyping(true));
        socket.on("stopTyping", () => setTyping(false));

        socket.on('userList', (userList) => {
            setUsers(userList.filter(u => u !== myUsername));
        });

        return () => {
            socket.off('privateMessage');
            socket.off('userList');
            socket.off('typing');
            socket.off('stopTyping');
        }
    }, [myUsername]);

    const sendMessage = () => {
        if (!selectedUser || !message.trim()) return;

        socket.emit('privateMessage', {
            to: selectedUser,
            from: myUsername,
            message
        });

        setMessages(prev => [...prev, { sender: 'You', message}]);
        setMessage('');
        socket.emit("stopTyping", { to: selectedUser });
    }

    const handleTyping = () => {
        socket.emit('typing', { to: selectedUser });
        clearTimeout(window.typingTimeout);
        window.typingTimeout =  setTimeout(() => {
            socket.emit('stopTyping', { to: selectedUser });
        }, 1000);
    };


    return (
        <div className="min-h-screen flex-col">
            <header>
                  <h2>Private chat</h2>
            </header>

            <div>
                <div>
                    <h3>Online users</h3>
                    <ul>
                        {users.map(user => (
                            <li key={user}>
                                <button onClick={() => {
                                    setSelectedUser(user);
                                    setMessages([]);
                                }}>{user}</button>
                            </li>
                        )) }
                    </ul>
                </div>

                <div>
                    <h3>Chat with: {selectedUser || '----'}</h3>
                    <div>
                        {messages.map((m, i) => (
                            <div key={i}>
                              <strong>{m.sender}:</strong>{m.message}
                            </div>
                        ))}

                        {typing && <p>Typing...</p>}
                    </div>

                    {selectedUser && (
                        <div>
                            <input 
                              type="text" 
                              onChange={(e) => setMessage(e.target.value)}
                              onInput={handleTyping}
                              placeholder="Type your message"
                              />

                              <button onClick={sendMessage}>Send</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
