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
  const [selectedUserIds, setSelectedUserIds] = useState([]); 
  const [groupInfo, setGroupInfo] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchGroupInfo();
    fetchCurrentUser();
  }, [g_id]);

  const fetchGroupInfo = async () => {
    try {
        const res = await api.get(`/api/groups/${g_id}`);
        setGroupInfo(res.data);
    } catch (error) {
        console.error("Failed to fetch group info", error);
    }
  }

  const fetchCurrentUser = async () => {
    try {
        const res = await api.get("/api/groups/me");
        setCurrentUserId(res.data.id);
    } catch (error) {
        console.error('Failed to fetch user', error);
    }
  };

  const handleRemoveMember = async (user_id) => {
    const confrimed = window.confirm('Are you sure you want to remove this member ?');
    if (!confrimed) return;
    try {

        await api.delete(`/api/groups/group_members/${g_id}/${user_id}`);
        await fetchMembers(); // for refreshing the new group members 
    } catch (err) {
        console.error('Failed to remove member', err);
    }
  }
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

         const membersResponse = await api.get(`/api/groups/group_members/${g_id}`);
         const currentMembers = membersResponse.data;

         const userResponse = await api.get('/api/users');
         const allUsers = userResponse.data;
      
         // here we want to select only non members of the group
         const nonMembers = allUsers.filter(
          // .filter() creates a new object that meet with the spcecific condition
          //.some() checks if element in array matches with condition if it finds one it return true
           user => !currentMembers.some(member =>
              member.user_id === user.user_id ||
              member.phone === user.phone)
        );

      setAvailableUsers(nonMembers);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  // this function it adds or remove phone nbr from list when checkbox is clicked
  const handleCheckBoxChange = (phone) => {
    setSelectedUserIds((prev) =>
      // prev.includes() checks if phone is already selected
      prev.includes(phone)
      // if it is selected remove it 
        ? prev.filter((p) => p !== phone)
        // if not add it
        : [...prev, phone]
    );
  };

  const handleAddMember = async () => {
    if (selectedUserIds.length === 0) return;

    try {

      // check if selected user is already a member
      //map of select phone numbers of current members
      const currentMemberPhones = members.map(m => m.phone);

      // check if selected user already exist in the group
      const duplicates = selectedUserIds.filter(phone =>
        // .includes() checks if item exists in array
         currentMemberPhones.includes(phone)
      );

      if (duplicates.length > 0) {
        alert(`These users are already members: ${duplicates.join(', ')}`);
        return;
      }

      // adding new user 
      for (const phone of selectedUserIds) {
         await api.post(`/api/groups/group_members/${g_id}`, { phone });
      }
      await fetchMembers();
      setShowAddForm(false);
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Failed to add member.", err);
      
      if (err.response?.data?.error === 'User is already a member of this group') {
           alert('One or more selected users are already a members');
      
    } else {
        alert('Failed to ad members');
      }
    }
  };


  useEffect(() => {

  }, [currentUserId, groupInfo]);

  if (loading || !groupInfo) {
    return (
     <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    )
  }
  return (<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg mt-6">

  <div className="flex items-center justify-between mb-8">
    <button 
      onClick={() => navigate("/chat")}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      Back to Chat
    </button>
    
    <div className="w-5"></div> {/* Space for alignment */}
  </div>

  <div className="mb-6">
    <button
      onClick={async () => {
        setShowAddForm(true);
        await fetchAvailableUsers();
      }}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      Add Member
    </button>

    {showAddForm && (
      <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-inner">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select users to add</h3>

        {availableUsers.length === 0 ? (
          <p className="text-gray-500 italic">No available users to add.</p>
        ) : (
          <>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
              {availableUsers.map((user) => (
                <label 
                  key={user.phone} 
                  className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    // id is used to create inique ID like user-07888888888
                    id={`user-${user.phone}`}
                    // checked controls if the ckeckbox is checked true/ false
                    // if user's phone number is selected if it is truenthen it appear as selected in the screen
                    checked={selectedUserIds.includes(user.phone)}
                    // runs when user clicks on checkbox it call this function
                    onChange={() => handleCheckBoxChange(user.phone)}
                    className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">{user.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
    
              <button
                onClick={handleAddMember}
                disabled={selectedUserIds.length === 0}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  selectedUserIds.length === 0 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Add 
              </button>
                        <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    )}
  </div>

  <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-600">Group Members</h2>
    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : error ? (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        {error}
      </div>
    ) : members.length === 0 ? (
      <div className="text-center py-6 text-gray-500 italic">
        No members in this group yet.
      </div>
    ) : (
      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    {members.map((member) => (
<li className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
  <div className="flex items-center">
    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold mr-3">
      {member.name.charAt(0).toUpperCase()}
    </div>
    <span className="font-medium text-gray-800">
       {member.name}
       {member.user_id === groupInfo?.created_by && (
        <span className="ml-4 text-xs text-gray-500 font-normal">(Admin)</span>
       )}
    </span>
  </div>

  
  {groupInfo?.created_by === currentUserId && member.user_id !== currentUserId && (
    <button 
      onClick={() => handleRemoveMember(member.user_id)}
      className="text-sm text-red-600 hover:text-red-800"
    >
      Remove
    </button>
  )}
</li>
        ))}
      </ul>
    )}
  </div>
</div>
  )
}