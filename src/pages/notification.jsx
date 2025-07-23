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
        // when new notification arrives update notification by adding new notification
        // notic callback gives notification data
        socket.on('notification', (notif) => {
            // it takes notification data and adding to notification list
            setNotifications(prev => [notif, ...prev]);
        });

        // clean up function to avoid memory leaks
        return () => {
            socket.off('notification');
        }
    }, []);

    // hande notification click

    const handleClick = async (notification) => {
        try {

            // Mark as read first
            // handle notification updated as readed when clicked
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, is_read: 1 } : n
            ));

            //update in backend that notification was readed
            await api.put(`/api/notifications/${notification.id}/read`, {}, { withCredentials: true });

            //Handle different notification type
            switch (notification.type) {
                case 'profile_update':
                    navigate(`/user/${notification.sender_id}`);
                    break;
                 case 'New post':
                    navigate(`/post/${notification.content}`) // 
                    break;
                 default:
                   const response = await api.post(`/api/notification/${notification.id}/action`, {}, { withCredentials: true });
                    // navigate to specified page base on type of notification
                   navigate(response.data.redirectTo, {
                      state: response.data.state
                  });

            }


        } catch (error) {
           console.error('Error handling notification', error);
         // Revert (Add) read status if error occurs
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, is_read: 0 } : n
            ));
        }
    }

    return (
        <div className="p-3 border rounded-lg bg-white w-50">
            <h1 className="text-lg font-semibold mb-2">Notifications</h1>

            <ul>
                {notifications.map((n) => (

                    <li key={n.id} className={`text-sm border-b py-1 cursor-pointer hover:bg-gray-100 ${
                        n.is_read ? 'opacity-70' : 'font-semibold'
                    }`}
                    onClick={() => handleClick(n)}
                    >
                        {n.sender_profile_image ? (
                            <img src={`http://localhost:4000/uploads/${n.sender_profile_image}`} 
                              alt={n.sender_name}
                              className="inline-block w-6 h-6 rounded-full mr-2 object-cover"/>
                        ) : (
                            <div className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center mr-2">
                                {n.sender_name ? n.sender_name.charAt(0).toUpperCase() : "?"}
                            </div>
                        )}

                        <span className="font-semibold capitalize">
                            {n.sender_name}
                        </span>
                        {' '} {/*Add space between elements */}
                        {n.type === 'profile_update' ? 'Update their profile picture' 
                                                     : n.type === 'New post' ? 'shared a new post' : n.content}
                        
                        <span className="text-gray-400 text-xs">
                            {new Date(n.created_at).toLocaleTimeString()}
                        </span>

                    </li>
                ))}

                {notifications.length === 0 && (
                    <li className="text-gray-500 text-sm">No new notifications</li>
                )}
            </ul>
        </div>
    )
}