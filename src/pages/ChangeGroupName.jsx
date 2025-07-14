import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

export default function ChangeGroupName() {
    const navigate = useNavigate();
    const { g_id } = useParams();
    const [newName, setNewName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangeName = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setLoading(true);

        try {
            await api.patch(`/api/groups/rename/${g_id}/name`, { group_name: newName });
            alert('Group name updated!');
            navigate('/chat');

        } catch (err) {
            console.error('Failed to update group name:', err);
            alert('Update failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Group Name</h2>

            <form onSubmit={handleChangeName}>
                <div className="mt-4">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                       New Group Name
                   </label>
                  <input type="text" value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name"
                    className="w-full  px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:outline-none"
                    required
                />

                </div>

                <div className="mt-4 flex justify-end space-x-3">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md 
                                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                                  disabled:bg-blue-400 disabled:cursor-not-allowed shadow-inner"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>

                      <button 
                        type="submit"
                        onClick={() => navigate('/chat')}
                        className="px-4 py-2 border border-gray-300 rounded-md 
                                  text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-inner"
                      >
                                Cancel
                        </button>
                </div>
            </form>

        </div>
    )
}