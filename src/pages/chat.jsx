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
                        </button>
                </li>
            ))}
         </ul>
           </aside>
         </div>
      </div>
    
    )
}