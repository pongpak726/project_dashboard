"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

    const handleLogin = async () =>{
        try{
            const res = await fetch(`${API_URL}/auth/login`,{
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({ email,password })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Login failed")
            }

            if (!data.token) {
                throw new Error("No token received")
            }   

            localStorage.setItem("token",data.token)

            router.push("/dashboard")
        }
        catch (err: any) {
            alert(err.message)
        }
    }

    return(
            <div className="flex items-center justify-center min-h-full">
                <div className="bg-white p-6 rounded shadow w-80 ">
                    <h2 className="text-3xl font-bold mb-4 text-black text-center">
                        Login
                    </h2>

                    <input className="w-full mb-3 p-2 border-2 rounded text-gray-400" 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                    
                    <input className="w-full mb-3 p-2 border-2 rounded text-gray-400" 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>

                    <button className="w-full bg-blue-500 text-white py-2 rounded" 
                    onClick={handleLogin}>
                        Login
                    </button>

                </div>
            </div>
    )
}