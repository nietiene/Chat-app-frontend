import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { type } from 'os';

const socket = io('http://localhost:4000', { withCredentials: true });

export default function Chat() {
    const [myName, setMyName] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [group, setGroup] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (!selectedGroup) return;

        const fetchGroupMessages = async () => {
            try {
                const res = await api.get(`/api/group-messages/${selectedGroup.g_id}`);
                setGroupMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch group messages:', err);
            }
        }

        fetchGroupMessages();
    }, [selectedGroup]);

    useEffect(() => {
        const handleNewGroupMessage = (msg) => {
            if (selectedGroup && msg.g_id === selectedGroup.g_id) {
                setGroupMessages(prev => [...prev, msg]);
            }
        }

        socket.on('newGroupMessage', handleNewGroupMessage);

        return () => {
            socket.off('newGroupMessage', handleNewGroupMessage);
        }
    }, [selectedGroup]);

const sendGroupChatMessage = async ()  => {
    if (!selectedGroup || !message.trim()) return;

    try {
        await api.post('/api/group-messages', {
            g_id: selectedGroup.g_id,
            content: message,
            type: 'text',
        });

        socket.emit('groupMessage', {
            g_id: selectedGroup.g_id,
            content: message,
            type: 'text',
        });

        setGroupMessages(prev => [...prev, {
            user_id: 'me',
            sender_name: myName,
            content: message,
            created_at: new Date().toISOString(),
            type: 'text'
        }]);

        setMessage('');
    } catch (err) {
        console.error('Failed to send group message:', err);
    }
}   
    useEffect(() => {
        if (!myName) return;

        const fetchGroups = async () => {
            try {
                const res = await api.get('/api/groups/my');
                console.log('Fetched groups:', res.data);
                setGroup(res.data);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
            }
        }
        fetchGroups();

    }, [myName]);
    // Fetch current user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/profile');
                setMyName(res.data.name);
            } catch (error) {
                navigate('/');
            }
        };
        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        if (myName) {
            socket.emit("login", myName);
        }
    }, [myName]);

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
            setMessages(prev => {
                if (from === selectedUser) {
                    return [...prev, {
                        sender_name: from,
                        content: message,
                        created_at: timestamp
                    }];
                } else {
                   return prev;
                }
            })
        };

        socket.on('privateMessage', handlePrivateMessage);
        socket.on('userList', setOnlineUsers);

        return () => {
            socket.off('privateMessage', handlePrivateMessage);
            socket.off('userList');
        };
    }, [selectedUser]);

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

        <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
  
            <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {myName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">{myName}</h2>
                        <p className="text-xs text-blue-600">Online</p>
                    </div>
                </div>
            </div>

          <button
             onClick={() => navigate('/create-group')}
             className='w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2'
            >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
         </svg>
         <span>Create New Group</span>
            </button>

            <h3 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">GROUPS</h3>
            <div className='divide-y divide-gray-100'>
                {group.length === 0 && (
                    <p className="text-xs text-gray-400 px-4 py-2">No groups yet</p>
                )}
                {group.map(group => (
                    <div className={`p-3 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer
                                    ${selectedGroup?.g_id === group.g_id ? 'bg-blue-100' : ''}`} key={group.g_id}
                        onClick={() => {
                            setSelectedUser(null);
                            setSelectedGroup(group);
                            setMessage([]);
                            setGroupMessages([]);
                        }}
                    >
                        <div  className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
                            {group.group_name.charAt(0).toUpperCase()}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className="text-sm font-medium text-gray-900 truncate">{group.group_name}</p>
                            <p className="text-xs text-gray-500 truncate">Created by {group.created_by}</p>
                        </div>
                    </div>
                    
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                <h3 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">
                    CONTACTS
                </h3>
                <div className="divide-y divide-gray-100">
                    {allUsers.map(user => (
                        <div 
                            key={user.name}
                            className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors duration-200 ${
                                selectedUser === user.name 
                                    ? 'bg-blue-100' 
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedUser(user.name)}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                {onlineUsers.includes(user.name) && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {messages.find(m => m.sender_name === user.name)?.content || 'No messages yet'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

       <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className='space-y-3'>
            {(selectedGroup ? groupMessages : message).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender_name === myName ? 'justify-end' : 'justify-start'}`}
                >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    msg.sender_name === myName
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}></div>
                </div>
            ))}
        </div>
       </div>
        {/* Chat area - Enhanced messaging interface */}
        <div className="flex-1 flex flex-col bg-white">
            {selectedUser ? (
                <>
                    {/* Chat header - More polished */}
                    <div className="p-3 border-b border-gray-200 bg-white flex items-center space-x-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
                            {selectedUser.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{selectedUser}</h3>
                            <p className={`text-xs ${
                                onlineUsers.includes(selectedUser) 
                                    ? 'text-green-600' 
                                    : 'text-gray-500'
                            }`}>
                                {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    {/* Messages area - Better bubble styling */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        <div className="space-y-3">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`flex ${
                                        msg.sender_name === myName ? 'justify-end' : 'justify-start'
                                    }`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                                        msg.sender_name === myName 
                                            ? 'bg-blue-600 text-white rounded-br-none' 
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}>
                                        {msg.sender_name !== myName && (
                                            <p className="text-xs font-semibold text-blue-600 mb-1">
                                                {msg.sender_name}
                                            </p>
                                        )}
                                        <p className="text-sm">{msg.content}</p>
                                        <p className={`text-xs mt-1 ${
                                            msg.sender_name === myName 
                                                ? 'text-blue-100' 
                                                : 'text-gray-500'
                                        }`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message input - More polished */}
                    <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="flex space-x-2"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h2>
                    <p className="text-gray-600 mb-6">Select a contact to start messaging</p>
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
}