import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";
import { X } from "lucide-react";

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
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <p className="text-gray-600">Loading post...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center border border-gray-200">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    if (!post) return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center border border-gray-200">
                <p className="text-gray-700 font-medium">Post not found</p>
                <button
                    onClick={handleClose}
                    className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-4 bg-white min-h-screen overflow-y-auto">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-red-500 focus:outline-none transition border-blue-200 border-4"
                >
                    <X size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Post Details</h1>
                <div className="w-6"></div> {/* Spacer for balance */}
            </div>

            {/* Author section */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    {post.profile_image ? (
                        <img
                            src={`http://localhost:4000/uploads/${post.profile_image}`}
                            alt={post.author_name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {post.author_name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-800">{post.author_name}</div>
                        {post.created_at && (
                            <div className="text-gray-500 text-xs">
                                {format(new Date(post.created_at), 'MMM d, yyyy · h:mm a')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post content */}
            <div className="p-4">
                <p className="mb-4 text-gray-800 text-base leading-relaxed">{post.content}</p>

                {post.image && (
                    <div className="mt-4 overflow-hidden rounded-lg">
                        <img
                            src={`http://localhost:4000/uploads/${post.image}`}
                            alt="Post"
                            className="w-auto h-auto object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
