import api from "../api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { useEffect } from "react";
import  { FaCamera } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

export default function Dashboard() {
    const [user, setUser] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showprofileMenu, setShowProfileMenu] = useState(false);
    const [showFullProfile,  setShowFullProfile] = useState(false); // for showing profile image
    const [selectedImage, setSelectedImage] = useState(null); // for showing full image of other users
    const [post, setPost] = useState([]);
    const navigate = useNavigate();


    //for setting customization
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    
   useEffect(() => {

    const handleUpdateSettings = async () => {

        try {
          const res = await api.get('/api/settings/me', { withCredentials: true });
          setName(res.data.name || "");
          setPhone(res.data.phone || "");

        } catch (error) {
          console.error(error);
       }

}
  handleUpdateSettings();
  
}, []);

const handleSettingSubmit = async (e) => {
    e.preventDefault();

    try {

        const res = await api.post(
            "/api/settings/update", 
            {name, phone, oldPassword, newPassword },
            { withCredentials: true }
        );

        setMessage(res.data.message);
        setNewPassword("");
        setOldPassword("");

    } catch (err) {
        setMessage(err.response.data?.message || "Update failed");
    }
}


    // new code
    const handlePostSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("content", content);
        if (image) formData.append("image", image);

        try {
            await api.post("/api/posts", formData);
            
            setContent("");
            setImage(null);
            fetchPosts()
        } catch (err) {
            alert("Post failed.");
        }
    }

    const fetchPosts = async () => {
        const res = await api.get("/api/posts");
        setPost(res.data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);
    useEffect(() => {
        api.get('/api/auth/profile')
        .then((res) => {
            console.log("User profile data:", res.data);
            setUser(res.data);
            return api.get('/api/users');
        })
        .then((res) => {
            setAllUsers(res.data);
            console.log("All users data:", res.data);

        })
        .catch(() => {
            console.error("Error fetching profile or users:", err);
            alert("Please login first");
            navigate('/');
        })
    }, []);


    function formatTimeStamp(timestamp) {
       const data = new Date(timestamp);
       return data.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
      })
} 

    if (!user) return <p className="text-center mt-10">Loading.....</p>

    return (
 <div className="min-h-screen flex ">
<aside className="w-64 bg-white p-6 border-r border-gray-200 shadow-sm fixed top-16 left-0 bottom-0 z-10 overflow-y-auto">

    <h2 className="text-xl font-semibold text-gray-800 mb-6">My Profile</h2>

<div className="mb-8">

  <div className="relative group w-20 h-20 mb-4">
    {user.profile_image ? (
      <img
        src={`http://localhost:4000/uploads/${user.profile_image}`}
        alt={user.name}
        className="w-full h-full rounded-full object-cover border-2 border-gray-100 shadow"
      />
    ) : (
      <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow">
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}

    <div className="absolute bottom-0 right-0 bg-white rounded-full shadow p-1 cursor-pointer hover:bg-blue-100  group/edit">
          <FaCamera className="text-blue-600 text-lg"
            onClick={() => setShowProfileMenu(true)} 
        />
    </div>

    {showprofileMenu && (
        <div className="absolute z-10 top-full mt-2 left-20 -translate-x-1/2 bg-white border rounded shadow-md text-sm w-44">
            <button
            onClick={() => {
                setShowProfileMenu(false);
                setShowFullProfile(true);
            }}
             className="w-full px-4 py-2 hover:bg-gray-100 text-left"
            >
                View Profile Pictute
            </button>

            <label htmlFor="profileUpload"
              className="w-full block px-4 py-2 hover:bg-gray-100 text-left cursor-pointer"
            >
                Change Profile Picture
            </label>
        </div>
    )}
 
    <input
      id="profileUpload"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={ async (e) => {
        setShowProfileMenu(false);
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
            setSelectedFile(e.target.files[0]);

            const formData = new FormData();
            formData.append('profile_image', e.target.files[0]);

            try {
                const response = await api.post(
                    "/api/users/change-profile-photo",
                    formData, 
                    {
                      // this headers telling the server that it is sending files
                        headers: { 'Content-Type': 'multipart/form-data' },
                        withCredentials: true
                    }
                );

                // update profile image
                if (response.data.profile_image) {
                    setUser((prev) => ({
                        ...prev,
                        profile_image: response.data.profile_image
                    }));
                    alert('Photo changed successfully');
                }
            } catch (error) {
                console.error(error);
                alert('Upload failed' + (error.response?.data?.error || ""));
            }
        }
      }}
    />
    
  </div> 

 
  {/* User Info */}
  <div className="space-y-3 text-sm text-gray-700">

    <div className="flex flex-col items-start">
      <span className="text-xs font-medium text-gray-500">Name</span>
      <span className="font-medium">{user.name}</span>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-xs font-medium text-gray-500">Phone</span>
      <span className="font-medium">{user.phone}</span>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-xs font-medium text-gray-500">Role</span>
      <span className="font-medium capitalize">{user.role}</span>
    </div>
  </div>
  <div>
<button
  onClick={() => setShowSettingModal(true)}
  className="flex items-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-md transition duration-200 mt-4"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.25 3c.41 0 .75.34.75.75v.82a7.5 7.5 0 012.49.77l.58-.58a.75.75 0 111.06 1.06l-.58.58c.4.74.7 1.54.86 2.39h.82a.75.75 0 010 1.5h-.82a7.53 7.53 0 01-.86 2.39l.58.58a.75.75 0 11-1.06 1.06l-.58-.58a7.5 7.5 0 01-2.49.77v.82a.75.75 0 01-1.5 0v-.82a7.5 7.5 0 01-2.49-.77l-.58.58a.75.75 0 11-1.06-1.06l.58-.58a7.53 7.53 0 01-.86-2.39h-.82a.75.75 0 010-1.5h.82a7.53 7.53 0 01.86-2.39l-.58-.58a.75.75 0 111.06-1.06l.58.58a7.5 7.5 0 012.49-.77v-.82c0-.41.34-.75.75-.75z" />
  </svg>
  Settings
</button>

</div>
</div>

</aside>

          <main className="flex-1 ml-64 overflow-y-auto p-6 bg-white h-screen">

           <div className="sticky -top-6 z-2 mb-4 bg-white py-2">
            {['director', 'dos', 'patron', 'matron', 'dod'].includes(user.role) && (
            <button 
              onClick={() => setShowPostForm(true)}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Create Post
            </button>
          )} 
           </div>


              <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2 px-1">
                Recent Posts
             </h2>

              {post.map((post) => {
              return (
                  <div key={post.post_id} 
  
                     className={`p-4 border rounded shadow mb-4 bg-gray-50 transition-all duration-300 `}
                  >
                     <div className="flex items-center gap-2 mb-2">
                        {post.profile_image ? (
                            <img src={`http://localhost:4000/uploads/${post.profile_image}`} alt={post.name} 
                              onClick={() => setSelectedImage(`http://localhost:4000/uploads/${post.profile_image}`)}
                              className="w-10 h-10 rounded-full object-cover border shadow"/>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow">
                                {post.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-gray-900">
                              {post.name} <span className="font-semibold text-gray-600 text-sm">({post.role})</span>
                            </p>
                           <span className="text-xs text-gray-500">
                              {formatTimeStamp(post.created_at)}
                          </span>
                        </div> 
                 </div>

               {post.content && <p className="mb-2">{post.content}</p>}
               {post.image && (
               <img
                 src={`http://localhost:4000/uploads/${post.image}`}
                 alt="Post"
                 className="w-64 h-auto rounded shadow-md object-cover"
            />
         )}
        </div>
      );
     })}
  </main>

             <aside className="w-64 bg-gray-50 p-4 border-1 shadow-sm overflow-y-auto fixed top-16 right-0 h-full z-10">
                <h2 className="text-lg font-bold mb-4 text-gray-700">All Users</h2>
                <ul className="space-y-2">
                    {allUsers.map((u) => (
                        <li key={u.phone}>
                            <button
                               onClick={() => navigate(`/chat?user=${u.name}`)}
                               className="w-full p-2 bg-white hover:bg-blue-100 rounded flex justify-between items-center text-left"
                            >

                                <div>
                                    <div className="flex flex-col items-start">
                                       <strong className="text-sm text-gray-900 capitalize">{u.name}</strong>
                                       <span className="text-xs text-gray-600 capitalize">{u.role}</span>
                                    </div>

                                </div>
                               {u.profile_image ? (
                                    <img src={`http://localhost:4000/uploads/${u.profile_image}`} alt={u.name}
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent button click or navigate to chat
                                        setSelectedImage(`http://localhost:4000/uploads/${u.profile_image}`);
                                    }}
                                      className="w-10 h-10 object-cover border shadow rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
                                   
     {selectedImage && (
       <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setSelectedImage(null)} // click outside to close
        >

        <div className="relative">
        <div className="p-4 rounded shadow-lg max-w-xl max-h-[90vh]"
             onClick={(e) => e.stopPropagation()} // prevent closing when user click on image
        >
         <img src={selectedImage} alt="Full user Image" 
            className="max-w-full max-h-[90vh] rounded h-auto"
         />
        </div>

        </div>
      </div>
    )}
</aside>

             
  {showPostForm && (                  
   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 shadow-lg">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-4">
             <div className="flex justify-end">
                <button
                 type="button"
                 onClick={() => setShowPostForm(false)}
                 className="text-red-500 hover:text-red-700 focus:outline-none"
                 aria-label="Close Modal"
                >
                    {<FaTimes size={20}/>}
                </button>
            </div>   

            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    handlePostSubmit(e);
                   setShowPostForm(false); // close modal after submit

                }}
                encType="multipart/form-data"
            >
         
                <h3 className="text-sm font-semibold text-gray-700">Create Post</h3>
                
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share an update..."
                    className="w-full border border-gray-200 p-3 rounded text-sm resize-none min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-300"
                ></textarea>

                <div className="flex flex-col items-start w-full">
                    <label className="text-xs font-medium text-gray-600 mb-1">Upload Image (Optional)</label>
                    <input 
                        type="file" 
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={!content && !image}
                    className={`w-full  text-white px-4 py-2 rounded text-sm font-medium  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 mt-2
                               ${!content && !image ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                    Publish Post
                </button>
            </form>
        </div>
   </div>

    )}
{showSettingModal && (
 <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
     <div className="bg-white p-6 rounded shadow-2xl max-w-md w-full">
        <div className="flex justify-between">
             <h3 className="text-lg font-semibold mb-4 text-gray-600">Edit Settings</h3>
               <button 
                  onClick={() => setShowSettingModal(false)}
                  className=" px-4 py-2 text-red-500 rounded hover:text-red-600 font-bold text-xcls
                  l"
                >
                    <FaTimes />
               </button>
        </div>

        <form onSubmit={handleSettingSubmit}>
            <label className="block mb-2 text-sm font-medium text-gray-500">Name:</label>
            <input type="text"
               value={name}
               className="w-full px-4 py-2 mb-4 border border-blue-100 rounded focus:outline-blue-500 text-gray-500 font-medium"
               onChange={(e) => setName(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium text-gray-500">Phone:</label>
            <input type="text"
              value={phone} 
              className="w-full px-4 py-2 mb-2 border rounded  border-blue-100  focus:outline-blue-500 text-gray-500 font-medium"
              onChange={(e) => setPhone(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium text-gray-500">Old Password:</label>
            <input type="password"
              placeholder="Type an old password"
              className="w-full px-4 py-2 mb-2 border rounded  border-blue-100 focus:outline-blue-500 text-gray-500 font-medium"
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <label className="block mb-2 text-sm font-medium text-gray-500">New Password:</label>
            <input type="password"
              className="w-full px-4 py-2 mb-2 border rounded  border-blue-100 focus:outline-blue-500 text-gray-500 font-medium"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Type a new password"
            />

            <button
             type="sumbit"
             className="bg-blue-400 text-white px-3 py-2 rounded hover:bg-blue-300 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
               disabled={((!name && !phone && !newPassword))}
            >
                Save
        </button>
        </form>
        {message && (
            <p className="mt-3 text-sm text-center text-blue-600">{message}</p>
        )}
    </div>
  </div>
)}


{showFullProfile && (
    <div
     className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="p-4 rounded-lg relative">
            <button
             className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
             onClick={() => setShowFullProfile(false)}
            >
                <FaTimes size={18}/>
            </button>

            {user.profile_image ? (
                <img src={`http://localhost:4000/uploads/${user.profile_image}`} alt="Full Profile" 
                  className="w-80 h-auto object-cover border"
               />
            ) : (
                <p>No profile image found</p>
            )}
        </div>
     </div>
)}


</div>
    )
}
