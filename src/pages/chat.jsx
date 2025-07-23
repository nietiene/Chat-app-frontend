import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../api';
// import { X } from 'lucide-react';

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
    const [showDeleteMenuForGroup, setShowDeleteMenuForGroup] = useState(null);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [myProfileImage, setMyProfileImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const [unreadCount, setUnreadCount] = useState({});
    // const [unreadMessages, setUnreadMessages] = useState(null);

    //count unread messages
   useEffect(() => {
    const fetchUnreadCountsForMessages = async () => {
        try {
            const unreadRes = await api.get(`/api/messages/unread`);
            
            // create empty object to hold key: user's name value: unread_count pair
            const countsMap = {};

            // loop throught each result in unRead res
            for (let item of unreadRes.data) {
                // find user which has unread counts
                const user = allUsers.find(u => u.user_id === item.sender_id);
                // if exists add them in our object with their unread count
                if (user) countsMap[user.name] = item.unread_count;
            }
            setUnreadCount(countsMap);
        } catch (error) {
            console.error('Error fetching unread counts', error);
        }
    };

    if (userId && allUsers.length) fetchUnreadCountsForMessages();
}, [userId, allUsers]);

const markMessageAsRead = async () => {
    if (!selectedUser || !myName) return;

    try {
        // Optimistically update UI first
        // this gets unread previous counts 
        setUnreadCount(prev => {
            // make copy of previous unread count
            const updated = { ...prev };
            // removes unreadCount from the current chat 
            delete updated[selectedUser]; // Remove unread count for this user
            // return new object to update the state
            return updated;
        });

        // Call the API to update the database
         await api.patch('/api/messages/mark-read', {
            sender: selectedUser,
            receiver: myName,
        });


    } catch (err) {
        console.error("Failed to mark messages as read:", err);

        // Revert UI if API fails
        setUnreadCount(prev => ({
            ...prev,
            //  if API failed it used default value 1
            [selectedUser]: prev[selectedUser] || 1, // Restore unread count
        }));
    }
};

useEffect(() => {
    if (selectedUser) {
        markMessageAsRead();
    }
}, [selectedUser]); // Runs when selectedUser changes

    const handleDeletePrivateMessage = async (m_id) => {

        const confirmDelete = window.confirm('Are you sure?');
        if (!confirmDelete) return;

        try {
            await api.delete(`/api/messages/${m_id}`);
            socket.emit('deletePrivateMessage', { m_id });
            setMessages(prev => prev.filter(msg => msg.m_id !== m_id));
        } catch (error) {
            console.error('Delete failed', error);
            alert('Delete failed');
        }
    };

    useEffect(() => {
        const handleGroupDeleted = ({ id }) => {
            setGroupMessages(prev => prev.filter(msg => msg.id !== id));
        };
        socket.on('groupMessageDeleted', handleGroupDeleted);

        return () => {
            socket.off('groupMessageDeleted', handleGroupDeleted);
        };
    }, []);

    const handleDeleteGroupMessage = async (id) => {
        if (!id) return;
        

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
        };
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
        };
        fetchGroupMessages();
    }, [selectedGroup]);

    useEffect(() => {
        const handleNewGroupMessage = (msg) => {
            if (selectedGroup && msg.g_id === selectedGroup.g_id) {
                setGroupMessages(prev => [...prev, msg]);
            }
        };
        socket.on('newGroupMessage', handleNewGroupMessage);
        return () => {
            socket.off('newGroupMessage', handleNewGroupMessage);
        };
    }, [selectedGroup]);

    const sendGroupChatMessage = async () => {
        if (!selectedGroup || !message.trim() || !myName) return;

        try {
            const res = await api.post(`/api/groups/${selectedGroup.g_id}/messages`, {
                content: message,
                type: 'text',
            });

            const savedGroupMessage = res.data;
            socket.emit('groupMessage', { ...savedGroupMessage });

            // update frontend by adding new message to the chat
            setGroupMessages(prev => [...prev, {
                ...savedGroupMessage,
                user_id: 'me',
                sender_name: myName
            }]);

            setMessage('');
        } catch (err) {
            console.error('Failed to send group message:', err);
        }
    };

    useEffect(() => {
        if (!myName) return;

        const fetchGroups = async () => {
            try {
                const res = await api.get('/api/groups/my');
                setGroup(res.data);
            } catch (err) {
                console.error("Failed to fetch groups:", err);
            }
        };
        fetchGroups();
    }, [myName]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/profile');
                setMyName(res.data.name);
                setUserId(res.data.id);
                setMyProfileImage(res.data.profile_image);
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
                console.error('Failed to fetch messages for last messages:', error);
            }
        };
        fetchMessages();
        
    }, [selectedUser, myName, allUsers, userId]);

  

    useEffect(() => {
        const handlePrivateMessage = ({ from, message, timestamp, m_id }) => {
            setMessages(prev => {
                // only add message if from or to is current chat user
             if (from === selectedUser || from === myName) {
                // get last message to check if you're not getting duplicates
                const last = prev[prev.length - 1];
                //?. for avoiding error if last is undefined
                // here if last message was sent by me and last content was the same 
                if (last?.isOwn && last.content === message) {
                    // then dont add a duplicate just update that last message 
                    return prev.map((msg, i) => i === prev.length - 1 ? {
                        //only update the last message
                        ...msg,
                        created_at: timestamp,
                        isOwn: true,
                        m_id
                    } : msg);
                
                }

                    return [...prev, {
                        sender_name: from,
                        content: message,
                        created_at: timestamp,
                        m_id,
                        isOwn: from === myName
                    }];
                }
                  return prev;

            }
        
        )};
    

        const handleUserList = (list) => {
            setOnlineUsers(list);
        }
        
        socket.on('privateMessage', handlePrivateMessage);
        socket.on('userList', handleUserList);

        return () => {
            socket.off('privateMessage', handlePrivateMessage);
            socket.off('userList', handleUserList);
        };
    }, [myName, selectedUser]);

    // ref is used to access the DOM element 
    const messagesContainerRef = useRef(null); // start ass null until it assigned to JSX 
    useEffect(() => {
        const container = messagesContainerRef.current; // .current gives you direct access to that DOM element
        if (container) {
            container.scrollTop = container.scrollHeight; // here if container is not null or assigned to JSX elent it automatically scroll to the bottom
        }
    }, [messages, groupMessages]);

    const sendMessage = async () => {
        if (!selectedUser || !message.trim() || !myName) return;

            const tempMessage = {
                sender_name: myName,
                content: message,
                created_at: new Date().toISOString(), // conver the time  to detail
                m_id: Date.now().toString(), //  convert numbers to the string
                isOwn: true 
            };
         // add temporary message immeditely
            setMessages(prev => [...prev, tempMessage]);
            setMessage(''); // clear input message for better UX


        try {
            const res = await api.post('/api/messages', {
                sender: myName,
                receiver: selectedUser,
                content: message
            });

            const savedMessage = res.data;

            socket.emit('privateMessage', {
                to: selectedUser,
                from: myName,
                message: savedMessage.content,
                m_id: savedMessage.m_id,
                timestamp: savedMessage.created_at
            });

            // this code update the message state
            setMessages(prev => prev.map(msg => 
                // it find specific message by comparing their IDs
                msg.m_id === tempMessage.m_id ? {
                    //it replace that message with new one and adding isOwn: true
                    ...savedMessage,
                    isOwn: true
                } : msg
            ));

        } catch (error) {
            //remove temporary messsage on failure
            setMessages(prev => prev.filter(msg => msg.m_id !== tempMessage.m_id));
            console.error('Failed to send message:', error);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        const confirmDelete = window.confirm('Are you sure?');
        if (!confirmDelete) return;

        try {
            const res = await api.patch(`/api/groups/${selectedGroup.g_id}/soft-delete`);
            alert('Group deleted successfully');

            setGroup(prevGroup => prevGroup.filter(g => g.g_id !== selectedGroup.g_id));

            setSelectedGroup(null);
            setGroupMessages([]);
            setShowDeleteMenu(false);
        } catch (err) {
            console.error('Failed to delete group', err);
            alert('Failed to delete group');
        }
    };


function formatTimeStamp(timestamp) {
    const data = new Date(timestamp);
    return data.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
} 

useEffect(() => {
    if (selectedGroup?.g_id) {
        socket.emit('joinGroup', selectedGroup.g_id);
    }
}, [selectedGroup]);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Left sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                    <div className="flex items-center space-x-3">
                        {myProfileImage ? (
                            <img src={`http://localhost:4000/uploads/${myProfileImage}`} alt="Profile" 
                              className='w-12 h-12 rounded-full object-cover shadow-md'/>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {myName.charAt(0).toUpperCase()}
                            </div>
                        )}

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
                        <div 
                            className={`p-3 flex items-center space-x-3 hover:bg-gray-100 cursor-pointer ${selectedGroup?.g_id === group.g_id ? 'bg-blue-100' : ''}`} 
                            key={group.g_id}
                            onClick={() => {
                                setSelectedUser(null);
                                setSelectedGroup(group);
                            }}
                        >
                        
    
                        {group.group_photo ? (

                            <img src={`http://localhost:4000${group.group_photo}`} alt="Group" 
                             className="w-10 h-10 rounded-full object-cover shadow"
                             onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteMenuForGroup(showDeleteMenuForGroup === group.g_id ? null : group.g_id);
                                }}/>
                        ) : (
                            <div className='w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow'
                              onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDeleteMenuForGroup(showDeleteMenuForGroup === group.g_id ? null : group.g_id);
                                }}
                            >
                                   {group.group_name.charAt(0).toUpperCase()}
                            </div>
                        )}

                            <div className='flex-1 min-w-0'>
                                <p className="text-sm font-medium text-gray-900 truncate">{group.group_name}</p>
                                <p className="text-xs text-gray-500 truncate">Created by {group.creator_name}</p>
                            </div>
                            {showDeleteMenuForGroup === group.g_id && (
                                <button
                                    className='text-xs text-red-600 border border-red-600 px-2 py-0.5 rounded hover:bg-red-50'
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await api.delete(`/api/groups/leave/${group.g_id}`);
                                            const res = await api.get('/api/groups/my');
                                            setGroup(res.data);
                                            setShowDeleteMenuForGroup(null);
                                            if (selectedGroup?.g_id === group.g_id) {
                                                setSelectedGroup(null);
                                                setGroupMessages([]);
                                            }
                                            alert('You left the group');
                                        } catch (error) {
                                            console.error('Failed to leave group', error);
                                            alert('Failed to leave the group');
                                        }
                                    }}
                                >
                                    Leave Group
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    <h3 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50 sticky top-0 z-10">
                        CONTACTS
                    </h3>
                    <div className="divide-y divide-gray-100">
                        {allUsers.map(user => {
                            const isSelected = selectedUser === user.name;
                            const hasUnreadCount = unreadCount[user.name] > 0;

                            console.log("Unread Count Object:", unreadCount);
                            console.log(`User: ${user.name}, hasUnread: ${hasUnreadCount}`); // for debugging


                            return (
                            <div 
                                key={user.user_id}
                                className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors duration-200 ${
                                    isSelected ? 'bg-gray-200' : ''
                                }`}
                                onClick={() => {
                                    setSelectedGroup(null);
                                    setSelectedUser(user.name);
                                }}
                            >

                                <div className="relative">
                                    {user.profile_image ? (
                                        <img src={`http://localhost:4000/uploads/${user.profile_image}`} alt={user.name} 
                                           className="w-10 h-10 rounded-full object-cover shadow"
                                        />
                                    ) : (
                                     <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow">
                                         {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    )}

                                    {user.user_id && onlineUsers.includes(user.user_id.toString()) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm text-gray-800 truncate ${hasUnreadCount ? 'font-bold' : 'font-medum'}`}>
                                          {user.name}
                                    </p>
     
                                </div>
                            </div>
                            
                        )})}
                    </div>
                </div>
            </div>
   
            {/* Main chat area */}
            <div className="flex-1 flex flex-col bg-white">
                
                {selectedUser || selectedGroup ? (
                    <>                    
                        <div className="shrink-0 p-3 border-b border-gray-200 bg-white flex items-center space-x-3 shadow-sm">
                            <div className="relative">
                                
                                {selectedUser && !selectedGroup ? (
                                    (() => {
                                        const user = allUsers.find(u => u.name === selectedUser)

                                        if (user?.profile_image) {
                                            return (
                                                <img src={`http://localhost:4000/uploads/${user.profile_image}`} alt={selectedUser} 
                                                     className="w-10 h-10 rounded-full object-cover shadow"
                                                />
                                            )
                                        }
                                        return (
                                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
                                                {selectedUser.charAt(0).toUpperCase()}
                                            </div>
                                        );
                                    })()
                                ) : selectedGroup ? (
                                    selectedGroup.group_photo ? (
                                        <img src={`http://localhost:4000${selectedGroup.group_photo}`}
                                           alt={selectedGroup.group_name}
                                           className="w-10 h-10 rounded-full object-cover shadow cursor-pointer"
                                                   onClick={(e) => {
                                                     e.stopPropagation();
                                                      if (selectedGroup.created_by === userId) {
                                                          setShowDeleteMenu(prev => !prev);
                                                      }
                                                    }}
                                        />
                                    ) : (
                                        <div
                                             className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white font-bold shadow cursor-pointer rounded-full"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                if (selectedGroup.created_by === userId) {
                                                     setShowDeleteMenu(prev => !prev);
                                                }
                                             }}
                                        >
                                          {selectedGroup.group_name.charAt(0).toUpperCase()}
                                        </div>
                                    ) 
                                ) : null}
                                {showDeleteMenu && selectedGroup?.created_by === userId
                                 && (
                                    <div className="absolute top-full mt-2 bg-white border rounded shadow-lg p-3 z-20 w-48 space-y-3">
                
                                        <button
                                            className='w-full px-4 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors'
                                            onClick={() => navigate(`/changeGroupName/${selectedGroup.g_id}`)}
                                        >
                                          Change group name
                                        </button>

                                        <button
                                            className='w-full px-4 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors'
                                            onClick={() => navigate(`/changeGroupPhoto/${selectedGroup.g_id}`)}
                                        >
                                          Change group photo
                                        </button>
                            
                                       <button
                                            className='w-full px-4 py-2 text-sm text-left text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors'
                                            onClick={handleDeleteGroup}
                                        >
                                            Delete Group
                                        </button>
                                    </div>
                                )}
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
                                 <>
                                   {(() => {
                                    const user = allUsers.find(u => u.name === selectedUser);
                                    const isOnline = user && user.user_id && onlineUsers.includes(user.user_id.toString());

                                    return (
                                      <p className={`text-xs ${
                                          isOnline ? 'text-green-600' : 'text-gray-500'
                                       }`}
                                    >
                                          {isOnline ? 'Online' : 'Offline'}
                                    </p>
                                    );
                                   })()}

                                </>
                                ) : (
                                    <p className="text-xs text-gray-500">Group</p>
                                )}
                            </div>
                        </div>

                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="space-y-3">
                                {(selectedGroup ? groupMessages : messages).map((msg, i) => (
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
                                            {msg.sender_name !== myName && (
                                                <p className="text-xs font-semibold text-blue-600 mb-1">{msg.sender_name}</p>
                                            )}

                                            <p className="text-sm">{msg.content}</p>
                                            <p className={`text-xs mt-1 ${
                                                msg.sender_name === myName ? 'text-blue-100' : 'text-gray-500'
                                            }`}>
                                                <div className='text-[10px]  mt-1 text-right'>
                                                        {formatTimeStamp(msg.created_at)}
                                                </div>
                                            </p>
                                            
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
                                            {selectedUser && msg.sender_name === myName && msg.m_id && (
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