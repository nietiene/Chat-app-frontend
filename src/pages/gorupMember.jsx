import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function GroupMember() {
  const { g_id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // corrected plural name

  useEffect(() => {
    fetchMembers();
  }, [g_id]);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/api/groups/group_members/${g_id}`);
      setMembers(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load group members.");
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await api.get("/api/users");
      const userList = res.data;

      console.log("Fetched users:", userList); // ✅ Check structure

      const nonMembers = userList.filter(
        (u) => !members.some(m => m.phone === u.phone)
      );

      setAvailableUsers(nonMembers);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleCheckBoxChange = (phone) => {
    setSelectedUserIds((prev) =>
      prev.includes(phone)
        ? prev.filter((phone) => phone !== phone)
        : [...prev, phone]
    );
  };

  const handleAddMember = async () => {
    if (selectedUserIds.length === 0) return;

    try {
      for (const phone of selectedUserIds) {
         await api.post(`/api/groups/group_members/${g_id}`, { phone });
      }
      await fetchMembers();
      setShowAddForm(false);
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Failed to add member.", err);
    }
  };



  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
      <button className="mb-4 text-blue-600 underline" onClick={() => navigate("/chat")}>
        &larr; Back
      </button>

      <h2 className="text-xl font-bold mb-4">Group Members</h2>

      <button
        className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
        onClick={() => {
          setShowAddForm(true);
          fetchAvailableUsers();
        }}
      >
        + Add Member
      </button>

      {showAddForm && (
        <div className="mb-4 border p-3 rounded bg-gray-50">
          <h3 className="text-sm font-semibold mb-2">Select users to add</h3>

          {availableUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No available users to add.</p>
          ) : (
            <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
              {availableUsers.map((user) => (
                
                <label key={user.phone} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    id={`user=${user.phone}`}
                    checked={selectedUserIds.includes(user.phone)}
                    onChange={() => handleCheckBoxChange(user.phone)}
                    className="accent-blue-600"
                  />
                  <span>{user.name}</span>
                </label>
              ))}
            </div>
          )}

          <button
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700"
            onClick={handleAddMember}
            disabled={selectedUserIds.length === 0}
          >
            Add to Group
          </button>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <ul className="divide-y divide-gray-200 mt-4">
          {members.length === 0 ? (
            <li className="py-2 text-gray-500">No members found.</li>
          ) : (
            members.map((member) => (
              <li key={member.user_id} className="py-2">
                <span className="font-semibold">{member.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
