import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function ChangeGroupPhoto() {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChangePhoto = async (e) => {
        e.preventDefault();
        if (!photo) return alert('Please select a photo');

        const formData = new FormData();
        formData.append('photo', photo);

        setLoading(true);

        try {
            await api.patch(`/api/groups/${g_id}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Group photo update 😉');
            navigate('/chat');
        
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Upload failed');
        
        } finally {
            setLoading(false);
        }

    }

     return (
       <div className="max-w-md mx-auto mt-20 bg-gray p-6 rounded shadow-inner">
          <h2 className="text-2xl font-semibold mb-4">Change Group Photo</h2>

          <form onSubmit={handleChangePhoto}>
            <input type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="mb-4 block w-full"
              required
            />

            <div className="flex justify-between">
                <button 
                 className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Uploading...' : 'Upload'}
                </button>

                <button 
                   className="border px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
                >
                    Cancel
                </button>
            </div>
          </form>
       </div>
        )

}