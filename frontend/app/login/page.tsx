"use client"

import { useState } from "react"

export default function LoginPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = () =>{
        console.log(email,password)
    }

    return(
        <div className="flex items-center justify-center min-h-full">
            <div className="bg-white p-6 rounded shadow w-80 ">
                <h2 className="text-3xl font-bold mb-4 text-black text-center">
                    Login
                </h2>

                <input className="w-full mb-3 p-2 border-2 rounded text-gray-400" 
                type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)}/>
                
                <input className="w-full mb-3 p-2 border-2 rounded text-gray-400" 
                type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}/>

                <button className="w-full bg-blue-500 text-white py-2 rounded" onClick={handleLogin}>
                    Login
                </button>

            </div>
        </div>
    )
}