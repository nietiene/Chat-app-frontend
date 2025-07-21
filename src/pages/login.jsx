import React from "react";
import api from "../api.js";
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";
import logo from "../assets/logo 1.png"

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.post('/api/auth/login', { phone, password });
            navigate('/dashboard');
        } catch(err) {
            setError(err.response?.data?.message || 'Login Failed');
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex justify-center mb-6">
                              <img src={logo} alt="SchoolChat logo" className="h-32 w-auto"/>
                    </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
               {error &&
                   <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                      {error}
                   </div>
                }
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <input
                      type="text" 
                      name="phone"
                      placeholder="Phone" 
                      value={phone} 
                      required
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    /> <br />
                </div>

                <div>
                   <input 
                      type="password" 
                      name="password" 
                      placeholder="Password" 
                      value={password} required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               /> <br />
                </div>

                <button type="submit"
                   className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                   Login
              </button> 

              <div>
                <Link to={"#"} className="font-normal text-blue-500 hover:underline">Forgot password</Link>
                <hr className="border-gray-600"/>

                 <p className="font-semibold text-gray-800 mt-2">Dont you have account ?</p>
  
                <Link to="/register" className="font-normal text-blue-500 hover:underline">Create account</Link>
              </div>
  
            </form>
</div>

        </div>
    )
}
