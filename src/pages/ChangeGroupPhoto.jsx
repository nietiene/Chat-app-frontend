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
            await api.patch(`/api/groups/change-group-photo/${g_id}/photo`, formData, {
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
       <div className="max-w-md mx-auto mt-20 bg-gray-100 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Change Group Photo</h2>

          <form onSubmit={handleChangePhoto}>
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                    Select new group photo
                </label>
            <input type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    "
              required
              disabled={loading}
            />
            </div>

            <div className="flex justify-end space-x-3">
                <button 
                 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 roundend-md  shadow-sm hover:bg-blue-700 focus:outline-none
                      focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Uploading...' : 'Upload'}
                </button>

                <button 
                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                   disabled={loading}
                   onClick={() => navigate(-1)} // same as navigate to previous page
                >
                    Cancel
                </button>
            </div>
          </form>
       </div>
        )

}