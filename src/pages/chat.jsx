import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const socket = io('http://localhost:4000', { withCredentials: true });

export default function Chat() {
    const [myName, setMyName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Fetch current user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/profile');
                setMyName(res.data.name);
                socket.emit('login', res.data.name);
            } catch (error) {
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    // Fetch all users
    useEffect(() => {
        if (!myName) return;

        const fetchUsers = async () => {
            try {
                const res = await api.get('/api/users');
                setAllUsers(res.data.filter(u => u.name !== myName));
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, [myName]);

    // Fetch messages when selected user changes
    useEffect(() => {
        if (!selectedUser || !myName) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/api/messages/${myName}/${selectedUser}`);
                setMessages(res.data);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };
        fetchMessages();
    }, [selectedUser, myName]);

    // Socket.IO event handlers
    useEffect(() => {
        const handlePrivateMessage = ({ from, message, timestamp }) => {
            if (from === selectedUser || from === 'You') {
                setMessages(prev => [...prev, { 
                    sender_name: from === 'You' ? myName : from,
                    content: message,
                    created_at: timestamp 
                }]);
            }
        };

        socket.on('privateMessage', handlePrivateMessage);
        socket.on('userList', setOnlineUsers);

        return () => {
            socket.off('privateMessage', handlePrivateMessage);
            socket.off('userList');
        };
    }, [selectedUser, myName]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!selectedUser || !message.trim()) return;

        try {
            // Save to database via API
            await api.post('/api/messages', {
                sender: myName,
                receiver: selectedUser,
                content: message
            });

            // Emit via socket
            socket.emit('privateMessage', {
                to: selectedUser,
                from: myName,
                message
            });

            // Optimistic update
            setMessages(prev => [...prev, { 
                sender_name: myName,
                content: message,
                created_at: new Date().toISOString()
            }]);
            
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {myName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 font-semibold">{myName}</div>
                    </div>
                </div>
                
                <div className="overflow-y-auto h-full">
                    {allUsers.map(user => (
                        <div 
                            key={user.name}
                            className={`p-4 border-b border-gray-200 flex items-center cursor-pointer hover:bg-gray-50 ${
                                selectedUser === user.name ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedUser(user.name)}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                {onlineUsers.includes(user.name) && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="font-semibold">{user.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-gray-200 bg-white flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                {selectedUser.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <div className="font-semibold">{selectedUser}</div>
                                <div className="text-xs text-gray-500">
                                    {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`mb-4 flex ${
                                        msg.sender_name === myName ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        msg.sender_name === myName 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}>
                                        <div className="font-semibold">
                                            {msg.sender_name === myName ? 'You' : msg.sender_name}
                                        </div>
                                        <p>{msg.content}</p>
                                        <div className="text-xs mt-1 opacity-70">
                                            {new Date(msg.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!message.trim()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center p-6 max-w-md">
                            <div className="text-2xl font-bold text-gray-700 mb-2">Welcome to Chat</div>
                            <p className="text-gray-500">Select a user to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}