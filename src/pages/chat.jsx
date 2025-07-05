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
    const [lastMessage, setLastMessage] = useState({});
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
            <header className="bg-blue-600 text-white p-4 font-semibold tex-xl">
                  <h2>Private chat {selectedUser && `with ${selectedUser}`}</h2>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-64 border-r border-gray-300 bg-gray-50 p-4 flex flex-col">
                    <h3 className="font-bold mb-3">Online users</h3>
                    <ul className="flex-1 overflow-y-auto">
                        {users.map(user => (
                            <li key={user}>
                                <button
                                   onClick={() => {
                                    setSelectedUser(user);
                                    setMessages([]);
                                   }}
                                     className={`block w-full text-left p-2 rounded hover:bg-blue-100 transition
                                             ${
                                                user === selectedUser 
                                                ? "bg-blue-300 font-semibold text-blue-500"
                                                : "text-gray-700"
                                             }`}
                                             >
                                                {user}
                                </button>
                            </li>
                        )) }
                    </ul>
                </aside>

              <main className="flex-1 flex flex-col bg-white">
                <div
                   className="flex-1 overflow-y-auto p-6 space-y-4"
                   id="chat-box"
                   style={{ backgroundColor: "#f9f9f9"}}>

                    {messages.length === 0 && (
                        <p className="text-center text-gray-500 mt-20">
                            {selectedUser ? "No message yet." : "Select user to chat"}
                        </p>
                    )}
                        {messages.map((m, i) => {
                          const isMe = m.sender = "You";

                          return (
                              <div key={i}
                              className={`max-w-xs px-4 py-2 rounded-lg break-words
                              ${isMe} ? "bg-blue-500 text-white self-end" : "bg-gray-500 text-gray-900 self-start"`}
                              >
                                {!isMe && (
                                  <div className="text-xs font-semibold mb-1">{m.sender}</div>
                                )}
                                {m.message}
                            </div>
                         )})}

                        {typing && <p>Typing...</p>}

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
               </main>
            </div>
        </div>
    )
}
