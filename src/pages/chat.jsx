import React from "react";
import io from "socket.io-client"
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect, useRef } from "react";

const socket = io("http://localhost:4000", {withCredentials: true, autoConnect: false})

export default function Chat() {
    const [myUsername, setMyUsername] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [lastMessage, setLastMessage] = useState({});
    const [Loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userFromQuery = params.get("user");

        if (userFromQuery) {
            setSelectedUser(userFromQuery);
        }
    }, [location.search]);

    useEffect(() => {
        if (!selectedUser || !myUsername) return;
        
        setLoading(true);
        setMessages([]);
        api.get(`/api/messages/${myUsername}/${selectedUser}`)
        .then(res => {
            const msg = res.data.map(msg => ({
                sender: msg.sender_id === myUsername ? "You" : msg.sender_id,
                message: msg.content,
                timestamp: msg.created_at
            }))

            setMessages(msg);
        }).catch(err => {
            console.error("Failed to fetch messages:", err);
            alert("Failed to load messages");
        }).finally(() => setLoading(false)); 
    }, [selectedUser, myUsername])

    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            setMyUsername(res.data.name);
            socket.emit('login', res.data.name);
        }).catch(() => {
            navigate('/');
        });

           socket.on('privateMessage', ({ from, message, timestamp }) => {

               setMessages(prev => [...prev, { sender: from, message, timestamp}]);
            
              setLastMessage(prev => ({...prev, [from]: message}))

        })

        socket.on('typing', (username) => {
            if (username === selectedUser) setTyping(true);
         });

        socket.on("stopTyping", (username) => {
            if (username === selectedUser) setTyping(false);
       });

        socket.on('userList', (userList) => {
           setUsers(userList.filter(u => u !== myUsername))
        });

        return () => {
            socket.off('privateMessage');
            socket.off('userList');
            socket.off('typing');
            socket.off('stopTyping');
        }
    }, [myUsername, selectedUser, navigate]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavio: "smooth"})
    }, [messages]);

    const sendMessage = () => {
        if (!selectedUser || !message.trim()) return;

        const timestamp = new Date().toLocaleString();

        socket.emit('privateMessage', {
            to: selectedUser,
            from: myUsername,
            message,
            timestamp
        });

        setMessages(prev => [...prev, { sender: 'You', message , timestamp}]);
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

    const handlePress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
        const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                        console.log("Selected user:", user);
                        setSelectedUser(user);
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
            {selectedUser && (
                <div className="border-b p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center text-lg font-bold">
                           {selectedUser.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <h2 className="font-bold">{selectedUser}</h2>

                    {typing &&}
                </div>
            )}
               {/* Input area */}
               {selectedUser && (
                <div className="p-4 border-t flex gap-2 bg-white">
                    <input 
                       type="text"
                       value={message}
                       onChange={(e) => setMessage(e.target.value)}
                       onInput={handleTyping}
                       placeholder={`Message ${selectedUser}`}
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