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
            setLastMessage(prev => ({...prev, [from]: message}))
        });

        socket.on('typing', () => setTyping(true));
        socket.on("stopTyping", () => setTyping(false));

        socket.on('userList', (userList) => {
           const allUsers = Array.from(new Set([...userList, selectedUser])).filter(Boolean);
           setUsers(allUsers.filter(u => u !== myUsername));
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

        setMessages(prev => [...prev, { sender: 'You', message }]);
        setLastMessage(prev => ({...prev, [selectedUser]: message }))
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
      <div className="min-h-screen flex flex-col">
         <div className="flex flex-1 overflow-hidden">
          {/* left sidebar */}
           <aside className="w-64 border-r border-gray-300 bg-gray-50 p-4 flex flex-col">
              <div className="mb-6 text-center">
                <div className="mx-auto  w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl">
                    {myUsername?.charAt(0).toUpperCase()}
                </div>
                <div className="mt-2 text-sm font-semibold">{myUsername}</div>
              </div>
 
 {/* Online users */}
         <h3 className="font-bold mb-2">Online users</h3>
         <ul className="flex-1 overflow-y-auto space-y-2">
            {users.map((user) => (
                <li key={user}>
                    <button
                       onClick={() => {
                        setSelectedUser(user);
                        setMessages([]);
                       }}
                       className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-blue-100 transition
                                   ${user === selectedUser ? "bg-blue-300 font-semibold text-blue-700" : "text-gray-700"}`}
                        >
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg">
                                {user.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-bold">{user}</span>
                                <span className="text-xs text-gray-500 truncate w-36">
                                    {lastMessage[user] || "No message yet."}
                                </span>
                            </div>

                        </button>
                </li>
            ))}
         </ul>
           </aside>

           {/* Right  chat panel */}
           <main className="flex-1 flex flex-col bg-white">
               {/* Message history */}
               <div className=" flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: "#f9f9f9"}}>
                {messages.length === 0 && (
                    <p className="text-center text-gray-500 mt-20">
                        {selectedUser ? "No message yet." : "Select a user to chat."}
                    </p>
                )}

                {messages.map((m, i) => {
                    const isMe = m.sender === "You";

                    return (
                        <div key={i} className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                            isMe ? "bg-blue-500 text-white self-end ml-auto"
                                 : "bg-gray-200 text-gray-900 self-start"
                        }`}>
                            {!isMe && (
                                <div className="text-xs font-semibold mb-1">{m.sender}</div>
                            )}
                            {m.message}
                        </div>
                    )
                })}

                <p className="text-sm italic text-gray-400">Typing...</p>
               </div>

               {/* Input area */}
               {selectedUser && (
                <div className="p-4 border-t flex gap-2">
                    <input 
                       type="text"
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       onInput={handleTyping}
                       placeholder="Type your message"
                       className="flex-1 border rounded px-3 py-2"
                    />

                    <button
                       className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
                       onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>

               )}
           </main>
         </div>
      </div>
    
    )
}