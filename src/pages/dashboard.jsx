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
            setUser(res.data);
            return api.get('/api/users');
        })
        .then((res) => setAllUsers(res.data))
        .catch(() => {
            alert("Please login first");
            navigate('/');
        })
    }, []);

    if (!user) return <p className="text-center mt-10">Loading.....</p>

    return (
      <div className="min-h-screen flex overflow-hidden">
{/* Left side profile */}
             <aside className="w-64 bg-gray-100 p-4 border-r shadow-sm overflow-y-auto fixed top-17 left-0 h-full z-10">
                <h2 className="text-lg font-bold mb-4">Profile</h2>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {user.name} </p>
                  <p><strong>Phone:</strong> {user.phone} </p>
                  <p><strong>Role:</strong> {user.role} </p>
                </div>

                {['director', 'dos', 'patron', 'matron', 'dod'].includes(user.role) && (
                    <form
                      className="mt-4 p-4 flex flex-col gap-4 bg-white shadow-md border"
                      onSubmit={handlePostSubmit}
                      encType="multipart/form-data"
                    >

                   <label className="text-sm font-semibold text-gray-700">Write a post:</label>
                   <textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="Post something..."
                     className="border border-gray-300 p-3 rounded-md resize-none min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                    ></textarea>

                    <label className="text-sm font-semibold text-gray-700 block mb-1">Upload image (optianal):</label>
                    <input type="file" 
                       onChange={(e) => setImage(e.target.files[0])}
                       className="block w-full text-sm text-gray-600
                                  file:mr-4 file:py-2 file::px-4
                                  file:rounded file:border-0
                                  file:text-sm file:semibold
                                  file:bg-blue-200 file:text-blue-700
                                  hover:file:bg-gray-200"/>
                    <button
                      className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ">
                         Post
                      </button>
                    </form>

                )}
             </aside>

          <main className="flex-1 ml-64 overflow-y-auto p-6 bg-white h-screen">
              <h2 className="text-xl font-bold mb-4">Posts</h2>
              {post.map((post) => {
              console.log("Post image filename:", post.image);
              return (
                  <div key={post.post_id} className="p-4 border rounded shadow mb-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                         <FaUserCircle className="text-xl text-blue-500" />
                         <span className="font-semibold">{post.name} ({post.role})</span>
                         <span className="text-xs text-gray-500 ml-auto">
                              {new Date(post.created_at).toLocaleString()}
                         </span>
                 </div>
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

             <aside className="w-64 bg-gray-50 p-4 border-1 shadow-sm overflow-y-auto fixed top-17 right-0 h-full z-10">
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