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
                const res = await api.get(`/api/posts/${id}`, { withCredentials: true });
                setPost(res.data);
            } catch (error) {
                console.error(error);
                setError('Failed to load post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [id]);

    const handleClose = () => {
        navigate(-1);
    };

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mb-4 animate-pulse"></div>
                <p className="text-gray-500">Loading post...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <button 
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
    
    if (!post) return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                <p className="text-gray-700 font-medium">Post not found</p>
                <button 
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-white transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
            {/* Facebook-style header */}
            <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200 flex items-center shadow-sm">
                <button 
                    onClick={handleClose}
                    className="text-gray-600 hover:bg-gray-200 rounded-full p-2 focus:outline-none transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-800 ml-2">Post</h1>
            </div>

            {/* Author section - Facebook style */}
            <div className="bg-white p-3 border-b border-gray-200">
                <div className="flex items-center">
                    {post.profile_image ? (
                        <img 
                            src={`http://localhost:4000/uploads/${post.profile_image}`} 
                            alt={post.author_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                            {post.author_name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="ml-3">
                        <div className="font-semibold text-gray-900">{post.author_name}</div>
                        {post.created_at && (
                            <div className="text-gray-500 text-xs flex items-center">
                                {format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}
                                <span className="mx-1">·</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                                    <path d="M13 7h-2v6h6v-2h-4z"/>
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post content - Facebook style */}
            <div className="bg-white">
                <div className="p-3">
                    <p className="text-gray-900 text-base">{post.content}</p>
                </div>
                
                {post.image && (
                    <div className="border-t border-gray-200">
                        <img
                            src={`http://localhost:4000/uploads/${post.image}`}
                            alt="Post"
                            className="w-full max-h-[70vh] object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Facebook-style reaction bar */}
            <div className="bg-white border-t border-gray-200 p-2">
                <div className="flex justify-around text-gray-500 text-sm">
                    <button className="flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded">
                        <span className="text-blue-500 text-lg mr-1">👍</span>
                        Like
                    </button>
                    <button className="flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded">
                        <span className="text-gray-500 text-lg mr-1">💬</span>
                        Comment
                    </button>
                    <button className="flex items-center justify-center w-full py-2 hover:bg-gray-100 rounded">
                        <span className="text-gray-500 text-lg mr-1">↗️</span>
                        Share
                    </button>
                </div>
            </div>

            {/* Comments section placeholder */}
            <div className="bg-gray-100 p-3 border-t border-gray-200">
                <div className="text-gray-500 text-sm mb-2">Comments</div>
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                    <div className="bg-gray-200 rounded-full w-full h-8"></div>
                </div>
            </div>
        </div>
    );
}