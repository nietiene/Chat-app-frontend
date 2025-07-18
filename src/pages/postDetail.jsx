import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

          
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

const handleClose = () => {
    Navigate(-1);
}
 
    if (loading) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">Loading...</p>
    if (error) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">{error}</p>
    if (!post) return <p className="fixed inset-0 flex items-center bg-white bg-opacity-80">Post not found</p>


    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
                <h1 className="text-2xl font-bold">Post Details</h1>
                <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4">
                <div className="flex items-center mb-4">
                    {post.author_name && (
                        <div className="font-semibold mr-2">
                            {post.author_name}
                        </div>
                    )}
                    {post.created_at && (
                     <div className="text-gray-500 text-sm">
                            at {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                    )}
                </div>
            </div>

          <p className="mb-2 text-lg">{post.content}</p>
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