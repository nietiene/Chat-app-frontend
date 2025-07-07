import React from "react";
import io from "socket.io-client"
import api from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const socket = io("http://localhost:4000", {withCredentials: true})

export default function Chat() {
    const [myUsername, setMyUsername] = useState("");
    const [allUsers, setAllUsers] = useState([]); // All users, not just online
    const [onlineUsers, setOnlineUsers] = useState([]); // Track online users separately
    const [selectedUser, setSelectedUser] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typing, setTyping] = useState(false);
    const [lastMessages, setLastMessages] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch all users when component mounts and when myUsername changes
    useEffect(() => {
        if (!myUsername) return;
        
        // Fetch all users
        api.get('/api/users')
            .then(res => {
                // Filter out current user
                const otherUsers = res.data.filter(u => u.name !== myUsername);
                setAllUsers(otherUsers);
                
                // Initialize last messages for each user
                const initialLastMessages = {};
                otherUsers.forEach(user => {
                    initialLastMessages[user.name] = "No messages yet";
                });
                setLastMessages(initialLastMessages);
                
                // Fetch last messages for each user
                otherUsers.forEach(user => {
                    fetchLastMessage(myUsername, user.name);
                });
            })
            .catch(err => {
                console.error("Failed to fetch users:", err);
            });
    }, [myUsername]);

    // Fetch the last message between current user and another user
    const fetchLastMessage = (user1, user2) => {
        api.get(`/api/messages/${user1}/${user2}`)
            .then(res => {
                if (res.data.length > 0) {
                    const lastMsg = res.data[res.data.length - 1];
                    const messageText = lastMsg.sender_id === myUsername 
                        ? `You: ${lastMsg.content}` 
                        : `${lastMsg.sender_id}: ${lastMsg.content}`;
                    
                    setLastMessages(prev => ({
                        ...prev,
                        [user2]: messageText
                    }));
                }
            })
            .catch(err => {
                console.error(`Failed to fetch messages with ${user2}:`, err);
            });
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userFromQuery = params.get("user");

        if (userFromQuery) {
            setSelectedUser(userFromQuery);
        }
    }, [location.search]);

    // Load messages when selected user changes
    useEffect(() => {
        if (!selectedUser || !myUsername) return;
        
        api.get(`/api/messages/${myUsername}/${selectedUser}`)
            .then(res => {
                const msg = res.data.map(msg => ({
                    sender: msg.sender_id === myUsername ? "You" : msg.sender_id,
                    message: msg.content,
                    timestamp: msg.created_at
                }));
                setMessages(msg);
            })
            .catch(err => {
                console.error("Failed to fetch messages:", err);
            });
    }, [selectedUser, myUsername]);

    // Initialize socket and user profile
    useEffect(() => {
        api.get('/api/auth/profile')
            .then((res) => {
                setMyUsername(res.data.name);
                socket.emit('login', res.data.name);
            })
            .catch(() => {
                navigate('/');
            });

        // Socket event handlers
        socket.on('privateMessage', ({ from, message }) => {
            setMessages(prev => [...prev, { sender: from, message }]);
            
            // Update last message with this user
            setLastMessages(prev => ({
                ...prev,
                [from]: `${from}: ${message}`
            }));
            
            // If message is from currently selected user, mark as read
            if (from === selectedUser) {
                // You might want to add read receipt logic here
            }
        });

        socket.on('typing', () => setTyping(true));
        socket.on("stopTyping", () => setTyping(false));

        socket.on('userList', (userList) => {
            setOnlineUsers(userList);
        });

        return () => {
            socket.off('privateMessage');
            socket.off('userList');
            socket.off('typing');
            socket.off('stopTyping');
        };
    }, [myUsername, selectedUser, navigate]);

    const sendMessage = () => {
        if (!selectedUser || !message.trim()) return;

        socket.emit('privateMessage', {
            to: selectedUser,
            from: myUsername,
            message
        });

        setMessages(prev => [...prev, { sender: 'You', message }]);
        setLastMessages(prev => ({
            ...prev,
            [selectedUser]: `You: ${message}`
        }));
        setMessage('');
        socket.emit("stopTyping", { to: selectedUser });
    };

    const handleTyping = () => {
        socket.emit('typing', { to: selectedUser });
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
            socket.emit('stopTyping', { to: selectedUser });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar - User list */}
                <aside className="w-64 border-r border-gray-300 bg-gray-50 p-4 flex flex-col">
                    <div className="mb-6 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl">
                            {myUsername?.charAt(0).toUpperCase()}
                        </div>
                        <div className="mt-2 text-sm font-semibold">{myUsername}</div>
                    </div>

                    {/* All users list */}
                    <h3 className="font-bold mb-2">All Users</h3>
                    <ul className="flex-1 overflow-y-auto space-y-2">
                        {allUsers.map((user) => (
                            <li key={user.name}>
                                <button
                                    onClick={() => {
                                        setSelectedUser(user.name);
                                        setMessages([]);
                                    }}
                                    className={`flex items-center gap-3 w-full p-2 rounded-lg hover:bg-blue-100 transition
                                        ${user.name === selectedUser ? "bg-blue-300 font-semibold text-blue-700" : "text-gray-700"}`}
                                >
                                    {/* Avatar with online indicator */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        {onlineUsers.includes(user.name) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-bold">{user.name}</span>
                                        <span className="text-xs text-gray-500 truncate w-36">
                                            {lastMessages[user.name] || "No messages yet"}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Right chat panel */}
                <main className="flex-1 flex flex-col bg-white">
                    {/* Message history */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: "#f9f9f9"}}>
                        {messages.length === 0 && (
                            <p className="text-center text-gray-500 mt-20">
                                {selectedUser ? "No messages yet. Start the conversation!" : "Select a user to chat."}
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
                                    <div className="text-xs mt-1 opacity-70">
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )
                        })}

                        {typing && (
                            <p className="text-sm italic text-gray-400">Typing...</p>
                        )}
                    </div>

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
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
    );
}