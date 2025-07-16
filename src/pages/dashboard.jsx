import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import  { FaHome, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";

export default function Dashboard() {
    const [user, setUser] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [post, setPost] = useState([]);

    const navigate = useNavigate();

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("content", content);
        if (image) formData.append("image", image);

        try {
            await api.post("/api/posts", formData);
            
            setContent("");
            setImage(null);
            fetchPosts()
        } catch (err) {
            alert("Post failed.");
        }
    }

    const fetchPosts = async () => {
        const res = await api.get("/api/posts");
        setPost(res.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);
    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            console.log("User profile data:", res.data);
            setUser(res.data);
            return api.get('/api/users');
        })
        .then((res) => {
            setAllUsers(res.data);
            console.log("All users data:", res.data);

        })
        .catch(() => {
            console.error("Error fetching profile or users:", err);
            alert("Please login first");
            navigate('/');
        })
    }, []);
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

    if (!user) return <p className="text-center mt-10">Loading.....</p>

    return (
      <div className="min-h-screen flex ">
{/* Left side profile */}
<aside className="w-64 bg-white p-6 border-r border-gray-200 shadow-sm fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">
    {/* Profile Header */}
    <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h2>
        
        {/* Profile Picture */}
        <div className="flex justify-start mb-5">
            {user.profile_image ? (
                <img 
                    src={`http://localhost:4000/uploads/${user.profile_image}`} 
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100 shadow"
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>

        {/* User Details */}
        <div className="space-y-3 text-sm text-gray-700 mb-8">
            <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-gray-500">Name</span>
                <span className="font-medium">{user.name}</span>
            </div>
            
            <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-gray-500">Phone</span>
                <span className="font-medium">{user.phone}</span>
            </div>
            
            <div className="flex flex-col items-start">
                <span className="text-xs font-medium text-gray-500">Role</span>
                <span className="font-medium capitalize">{user.role}</span>
            </div>
        </div>
    </div>

    {/* Post Form - Only for specific roles */}
    {['director', 'dos', 'patron', 'matron', 'dod'].includes(user.role) && (
        <div className="pb-6">
            <form
                className="flex flex-col gap-4"
                onSubmit={handlePostSubmit}
                encType="multipart/form-data"
            >
                <h3 className="text-sm font-semibold text-gray-700">Create Post</h3>
                
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share an update..."
                    className="w-full border border-gray-200 p-3 rounded text-sm resize-none min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-300"
                ></textarea>

                <div className="flex flex-col items-start w-full">
                    <label className="text-xs font-medium text-gray-600 mb-1">Upload Image (Optional)</label>
                    <input 
                        type="file" 
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!content && !image}
                    className={`w-full  text-white px-4 py-2 rounded text-sm font-medium  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 mt-2
                               ${!content && !image ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                    Publish Post
                </button>
            </form>
        </div>
    )}
</aside>

          <main className="flex-1 ml-64 overflow-y-auto p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Posts</h2>
            </div>
              {post.map((post) => {
              return (
                
                  <div key={post.post_id} className="p-4 border rounded shadow mb-4 bg-gray-50">
 
                      <div className="flex items-center gap-2 mb-2">
                         <FaUserCircle className="text-xl text-blue-500" />
                         <span className="font-semibold text-gray-900">{post.name} ({post.role})</span>
                         
                 </div>
                 <span className="text-xs text-gray-500 ml-auto bg-yellow-100  py-1 px-2">
                    {formatTimeStamp(post.created_at)}
                  </span>
               {post.content && <p className="mb-2">{post.content}</p>}
               {post.image && (
               <img
                 src={`http://localhost:4000/uploads/${post.image}`}
                 alt="Post"
                 className="w-64 h-auto rounded shadow-md object-cover"
            />
         )}
        </div>
      );
     })}
  </main>

             <aside className="w-64 bg-gray-50 p-4 border-1 shadow-sm overflow-y-auto fixed top-16 right-0 h-full z-10">
                <h2 className="text-lg font-bold mb-4">All Users</h2>
                <ul className="space-y-2">
                    {allUsers.map((u) => (
                        <li key={u.phone}>
                            <button
                               onClick={() => navigate(`/chat?user=${u.name}`)}
                               className="w-full  p-2 bg-white hover:bg-blue-100 rounded flex justify-between items-center text-left"
                            >
                                <div>
                                    <strong>{u.name}</strong> <br />
                                    <span className="text-xs text-gray-600">{u.role}</span>
                                </div>
                                 <FaUserCircle className="text-2xl text-blue-500"/>

                            </button>
                        </li>
                    ))}
                </ul>
             </aside>
         </div>
    )
}