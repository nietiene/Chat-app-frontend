import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

          
    useEffect(() => {
      const fetchPosts = async () => {
    
        try {
            const res = await api.get(`/api/posts/${id}`, { withCredentials: true })
            setPost(res.data);
        } catch (error) {
           console.error(error);
           setError('FAiled to load post.');
        } finally {
            setLoading(false);
        }

    }
    fetchPosts();
 
}, [id]); 
 
    if (loading) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">Loading...</p>
    if (error) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">{error}</p>
    if (!post) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">Post not found</p>


    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center"></div>
          <h1 className="text-2xl font-bold mb-2">Post Details</h1>
          <p className="mb-2">{post.content}</p>
         {post.image && (
         <img
             src={`http://localhost:4000/uploads/${post.image}`}
             alt="Post"
             className="w-full max-w-md rounded"
        />
       )}
        </div>
    )

}