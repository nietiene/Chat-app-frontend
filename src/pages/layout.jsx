import { Outlet, Link, useNavigate } from "react-router-dom";
import  { FaHome, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";
import api from "../api";
import { useEffect, useState } from "react";

export default function Layout () {

        const [showUserMenu, setShowUserMenu] = useState(false);
        const [profileImage, setProfileImage] = useState(null);
        const [selectedFile, setSelectedFile] = useState(null);
        const [user, setUser] = useState(null);
        const navigate = useNavigate();

       useEffect(() => {
        api.get("/api/auth/profile")
        .then((res) => {
            console.log("Profile", res.data);
            setUser(res.data);
            if (res.data.profile_image) {
                setProfileImage(`http://localhost:4000/uploads/${res.data.profile_image}`)
            }
        }).catch(() => {
            navigate("/");
        })
       }, []);

        const handleFileChange = (e) => {
            if (e.target.files && e.target.files[0]) {
                setProfileImage(URL.createObjectURL(e.target.files[0]));
                setSelectedFile(e.target.files[0]);
            }
        }

        const handleProfilePhotoChange = async (e) => {
            e.preventDefault();

            if (!selectedFile) return alert("Please select an image");

            const formData = new FormData();
            formData.append("profile_image", selectedFile);

            try {
                 await api.post("/api/users/change-profile-photo", formData, {
                    withCredentials: true
                });
                alert("Profile photo updated");

                    const profileRes = await api.get("/api/auth/profile");
                    setUser(profileRes.data);

                    if (profileRes.data.profile_image) {
                        setProfileImage(`http://localhost:4000/uploads/${profileRes.data.profile_image}`);
                    }
                   setSelectedFile(null);
                   setShowUserMenu(false);
                  alert("Photo changed successfully");
            } catch (error) {
                console.error(error);
                alert("Upload failed");
            }
        }

        const handleLogout = async () => {
            try {
                await api.post("/api/auth/logout");
                navigate("/");
            } catch {
                alert("logout failed");
            }
        }

        if (!user) return null;
    return (
          <div className="min-h-screen flex flex-col">
               <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center bg-blue-700 text-white px-6 py-3 shadow">
                <div className="flex gap-6 items-center">
                    <Link className="flex items-center gap-1 hover:underline">
                         <FaHome/> Home
                    </Link>
                    <Link className="flex items-center gap-1 hover:underline">
                          <FaEnvelope/> Messages
                    </Link>
                    <Link className="flex items-center gap-1 hover:underline">
                        <FaBell/> Notification
                    </Link>
                </div>
                
                <button className="bg-white text-blue-700 px-3 py-2 rounded-xl font-semibold flex flex-col items-center"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    {profileImage ? (
                        <img src={profileImage} 
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover mb-1"/>
                    ) : (
                        <FaUserCircle className="text-3xl mb-1"/>
                    )}
                </button>
               </nav>

               {showUserMenu && (
                <div className="absolute top-14 right-0 bg-white border rounded shadow p-4 w-64 z-50">
                    <h3 className="font-bold mb-2">{user.name}</h3>
                    <p><strong>Phone:</strong>{user.phone}</p>
                    <p><strong>Role:</strong>{user.role}</p>

                    <form onSubmit={handleProfilePhotoChange} className="mt-3">
                        <label className="block mb-1 font-semibold">Change Profile photo</label>
                        <input type="file"
                           accept="image/*"
                           onChange={handleFileChange}
                           className="mb-2"
                        />

                        <button type="submit"
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                                Upload
                            </button>
                         <button
                           onClick={handleLogout}
                           className="mt-4 w-full bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                        >
                            Logout
                        </button>   
                    </form>
                </div>
               )}

            <div className="pt-20 flex-1 overflow-y-auto">
               <Outlet/>
           </div>
    </div>
    )
}

