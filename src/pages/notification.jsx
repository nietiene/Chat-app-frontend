import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../api";
import { useParams } from "react-router-dom";

const socket = io('http://localhost:4000', { withCredentials: true });

export default function Notification () {
    const { myUserId } = useParams(); // fetch from URL
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        console.log('Fetching notification for:', myUserId);

         if (!myUserId) return;

        api.get(`/api/notifications/${myUserId}`, {
            withCredentials: true
        })
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));
    }, [myUserId]);

    useEffect(() => {
        socket.on('notification', notif => {
            setNotifications(prev => [notif, ...prev]);
        });

        return () => {
            socket.off('notification');
        }
    }, []);

    return (
        <div className="p-3 border rounded-lg bg-white w-50">
            <h1 className="text-lg font-semibold mb-2">Notifications</h1>

            <ul>
                {notifications.map((n, index) => (
                    <li key={index} className="text-sm border-b py-1">
                        {n.content} <span className="text-gray-400 text-xs">{new Date(n.created_at).toLocaleTimeString()}</span>
                    </li>
                ))}

                {notifications.length === 0 && (
                    <li className="text-gray-500 text-sm">No new notifications</li>
                )}
            </ul>
        </div>
    )
}