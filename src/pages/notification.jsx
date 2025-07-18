import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import api from "../api";

const socket = io('http://localhost:4000', { withCredentials: true });

export default function Notification () {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        api.get(`/api/notifications`, {
            withCredentials: true
        })
        .then(res => setNotifications(res.data))
        .catch(err => console.error(err));

    }, []);

    useEffect(() => {
        socket.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });

        return () => {
            socket.off('notification');
        }
    }, []);

    // hande notification click

    const handleClick = async (notification) => {
        try {
            const response = await api.post(
                `/api/notifications/${notification.id}/action`,
                {}, { withCredentials: true }
            )

            // remove to local state or in notification list
            setNotifications(prev => prev.filter(n => n.id !== notification.id));

            // navigate to specified page base on type of notification
            navigate(response.data.redirectTo);

        } catch (error) {
           console.error('Error handling notification', error);
        }
    }

    return (
        <div className="p-3 border rounded-lg bg-white w-50">
            <h1 className="text-lg font-semibold mb-2">Notifications</h1>

            <ul>
                {notifications.map((n, index) => (
                    <li key={index} className={`text-sm border-b py-1 cursor-pointer hover:bg-gray-50 ${
                        notifications.is_read ? 'opacity-70' : 'font-semibold'
                    }`}
                    onClick={() => handleClick(notifications)}
                    >
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