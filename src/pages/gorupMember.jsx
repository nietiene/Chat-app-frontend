import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function GroupMember () {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/api/groups/group_members/${g_id}`);
                setMembers(res.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load group members..');
                setLoading(false);
            }
        }

        fetchMembers();
    }, [g_id]);
}

return (
    <div
     className="max-wmd mx-auto p-6 bg-white rounded shadow mt-6">
        <button className="mb-4 text-blue-600 underline"
           onClick={() => navigator(-1)}
        >
         &larr; Back   
        </button>

        <h2 className="text-xl font-bold mb-4">Group Members</h2>

        {Loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
     </div>
)