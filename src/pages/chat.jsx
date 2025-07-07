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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!selectedUser || !message.trim()) return;
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

  {/* Left Sidebar */}
  <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col h-screen">
    {/* My Name - Sticky */}
    <div className="p-4 border-b border-gray-200 bg-blue-50 sticky top-0 z-10">
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

    {/* Contacts List - Scrollable */}
    <div className="flex-1 overflow-y-auto">
      <h3 className="px-4 py-3 text-sm font-semibold text-gray-500 bg-gray-50">CONTACTS</h3>
      <div className="divide-y divide-gray-100">
        {allUsers.map(user => (
          <div key={user.name}
            onClick={() => setSelectedUser(user.name)}
            className={`p-3 flex items-center space-x-3 cursor-pointer transition-colors duration-200 ${
              selectedUser === user.name ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shadow">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {onlineUsers.includes(user.name) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {messages.find(m => m.sender_name === user.name)?.content || 'No messages yet'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Chat Area */}
  <div className="flex-1 flex flex-col bg-white h-screen">
    {selectedUser ? (
      <>
        {/* Receiver Header - Sticky */}
        <div className="p-3 border-b border-gray-200 bg-white flex items-center space-x-3 shadow-sm sticky top-0 z-10">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow">
            {selectedUser.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{selectedUser}</h3>
            <p className={`text-xs ${onlineUsers.includes(selectedUser) ? 'text-green-600' : 'text-gray-500'}`}>
              {onlineUsers.includes(selectedUser) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Scrollable Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender_name === myName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                  msg.sender_name === myName 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  {msg.sender_name !== myName && (
                    <p className="text-xs font-semibold text-blue-600 mb-1">{msg.sender_name}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_name === myName ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input - Sticky Bottom */}
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
              Send
            </button>
          </form>
        </div>
      </>
    ) : (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h2>
        <p className="text-gray-600 mb-6">Select a contact to start messaging</p>
      </div>
    )}
  </div>
</div>

    );
}
