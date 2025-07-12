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
    const [group, setGroup] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMessages, setGroupMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const handleDeletePrivateMessage = async (m_id) => {
        const confirmDelete = window.confirm('Are you sure');
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/messages/${m_id}`);
            socket.emit('deletePrivateMessage', { m_id });
            setMessages(prev => prev.filter(msg => msg.m_id !== m_id));

        } catch (error) {
           console.error('Delete failed', error);
           alert('Delete failed');
        }
    }

    useEffect(() => {
      const handleGroupDeleted = ({ id }) => {
        setGroupMessages(prev => prev.filter(msg => msg.id !== id));
      }
      socket.on('groupMessageDeleted', handleGroupDeleted);

      return () => {
        socket.off('groupMessageDeleted', handleGroupDeleted);
      }
    }, []);
const handleDeleteGroupMessage = async (id) => {
    if (!id) {
        console.error('Invalid message ID');
        return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this message?');
    if (!confirmDelete) return;

    try {
        await api.delete(`/api/groups/group-messages/${id}`);

        socket.emit('deleteGroupMessage', { id });
        setGroupMessages(prev =>
            prev.map(msg =>
                msg.id === id ? { ...msg, is_deleted: true } : msg
            )
        );
    } catch (err) {
        console.error('Failed to delete message', {
            error: err.response?.data,
            status: err.response?.status
        });
        alert(`Failed to delete: ${err.response?.data?.message || 'Permission denied'}`);
    }
};

useEffect(() => {
    const handleDeleted = ({ m_id }) => {
        setMessages(prev => prev.filter(msg => msg.m_id !== m_id));
    }

    socket.on('privateMessageDeleted', handleDeleted);
    return () => socket.off('privateMessageDeleted', handleDeleted);
}, []);
    useEffect(() => {
        if (!selectedGroup) return;

        const fetchGroupMessages = async () => {
            try {
                const res = await api.get(`/api/groups/group-messages/${selectedGroup.g_id}`);
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

    const sendGroupChatMessage = async () => {
        if (!selectedGroup || !message.trim()) return;

        try {
            await api.post(`/api/groups/${selectedGroup.g_id}/messages`,  {
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

    useEffect(() => {
        setMessages([]);
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

    useEffect(() => {
        const handlePrivateMessage = ({ from, message, timestamp }) => {
          
            if (!selectedUser) return;

            setMessages(prev => {
                const last = prev[prev.length -1];
                if (last?.isOwn && last.content === message) {
                   return prev.map((msg, i) => i === prev.length - 1 ? {
                    ...msg,
                    created_at: timestamp,
                    isOwn: false
                   } : msg)
                } 

             if (from === selectedUser || from === 'You') {
                return [...prev, {
                    sender_name: from === 'You' ? myName : from,
                    content: message,
                    created_at: timestamp
                }];
            }


                 return prev;
                
            })
        };

        socket.on('privateMessage', handlePrivateMessage);
        socket.on('userList', setOnlineUsers);

        return () => {
            socket.off('privateMessage', handlePrivateMessage);
            socket.off('userList');
        };
    }, [selectedUser]);

    const messagesContainerRef = useRef(null);
    useEffect(() => {

        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, groupMessages]);

    const sendMessage = async () => {
        if (!selectedUser || !message.trim()) return;

        const newMessage = {
            sender_name: myName,
            content: message,
            created_at: new Date().toISOString(),
            isOwn: true
        }
        
        try {
            await api.post('/api/messages', {
                sender: myName,
                receiver: selectedUser,
                content: message
            });

            socket.emit('privateMessage', {
                to: selectedUser,
                from: myName,
                message
            });

            setMessages(prev => [...prev, newMessage]);
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
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
                            }}
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
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
                    <h3 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50 sticky top-0 z-10">
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
                                onClick={() => {
                                    setSelectedGroup(null);
                                    setSelectedUser(user.name);
                                }}
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

            <div className="flex-1 flex flex-col bg-white">
                {selectedUser || selectedGroup ? (
                    <>
                        <div className="shrink-0 p-3 border-b border-gray-200 bg-white flex items-center space-x-3 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
                                {(selectedUser || selectedGroup?.group_name).charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                    {selectedUser || selectedGroup?.group_name}
                                </h3>
                                {selectedGroup && (
                                    <button 
                                       className='text-xs text-blue-600 border border-blue-600 px-2 py-0.5 rounded hover:bg-blue-50'
                                       onClick={() => navigate(`/group-members/${selectedGroup.g_id}`)}
                                    >
                                        View Members
                                    </button>
                                )}
                                {selectedUser ? (
                                    <p className={`text-xs ${
                                        onlineUsers.includes(selectedUser) 
                                            ? 'text-green-600' 
                                            : 'text-gray-500'
                                    }`}>
                                        {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">Group</p>
                                )}
                            </div>
                        </div>

                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="space-y-3">
                                {(selectedGroup ? groupMessages : messages).map((msg, i) => (
                                  <>
                                  {console.log("Group message object:", msg)}   
                                   <div
                                    key={i}
                                    className={`flex ${msg.sender_name === myName ? 'justify-end' : 'justify-start'}`}
                                 >
                                    
                               <div
                                 className={`group relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                                 msg.sender_name === myName
                                 ? 'bg-blue-600 text-white rounded-br-none'
                                 : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                   }`}
                                 >
                                   {/* message content */}
    
                                   {msg.sender_name !== myName && (
                                       
                                     <p className="text-xs font-semibold text-blue-600 mb-1">{msg.sender_name}</p>
                                   )}
                                   <p className="text-sm">{msg.content}</p>
                                   <p className={`text-xs mt-1 ${
                                     msg.sender_name === myName ? 'text-blue-100' : 'text-gray-500'
                                   }`}>
                                     {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                
                                {/* Add delete icon */}
                                {selectedGroup && msg.sender_name === myName && (
                                    <button
                                      onClick={() => handleDeleteGroupMessage(msg.id)}
                                      title='Delete message'
                                      className='absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition'
                                    >
                                         <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                         </svg>
                                      </button>
                                )}
                               {selectedUser && msg.sender_name === myName  && (
                                    <button
                                      onClick={() => handleDeletePrivateMessage(msg.m_id)}
                                      title='Delete private message'
                                      className='absolute -top-2 -right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700 transition'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                       </svg>
                                    </button>
                                )}

                              </div>
                            </div>
                            
                            </>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="shrink-0 p-4 border-t border-gray-200 bg-white shadow-sm">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (selectedGroup) {
                                        sendGroupChatMessage();
                                    } else {
                                        sendMessage();
                                    }
                                }}
                                className="flex space-x-2"
                            >
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Message ${selectedUser || selectedGroup?.group_name}`}
                                    className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim()}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
                                >
                                    Send
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
                        <p className="text-gray-600 mb-6">Select a contact or group to start messaging</p>
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

