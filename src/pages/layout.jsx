import React from "react";
import { Outlet,Link } from "react-router-dom";
import  { FaHome, FaEnvelope, FaBell, FaUserCircle } from "react-icons/fa";


export default function Layout () {
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
                
                <button className="bg-white text-blue-700 px-3 py-2 rounded-xl font-semibold flex flex-col items-center">
                    <FaUserCircle className="text-3xl mb-1"/>
                </button>
               </nav>

            <div className="pt-20 flex-1 overflow-y-auto">
               <Outlet/>
           </div>
    </div>
    )
}

