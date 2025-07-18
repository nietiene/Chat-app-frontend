import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
          
    useEffect(() => {
      const fetchPosts = async () => {
    
        try {
            const res = api.get(`/api/posts/${id}`, { withCredentials: true })
            setPost(res.data);
        } catch (error) {
           console.error(error);
           setError('FAiled to load post.');
        }

    }
    fetchPosts();
 
}, [id]); 
 

    if (!post) return <p>Loading post ...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <h1 className="text-2xl font-bold">{post.content}</h1>
        </div>
    )

}