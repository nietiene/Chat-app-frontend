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
 

    if (!post) return <p>Post not found</p>
    if (!loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="p-4">
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