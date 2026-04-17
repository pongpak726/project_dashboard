"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decodeToken } from "@/app/lib/auth"

export default function LoginPage(){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
    const [loading, setLoading] = useState(false)
    

    const handleLogin = async () =>{
        setLoading(true)
        try{
            if (!email || !password) {
                alert("Please fill all fields")
                return
            }

            const res = await fetch(`${API_URL}/auth/login`,{
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({ email,password })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error("Login failed")
            }

            if (!data.token) {
                throw new Error("No token received")
            }   

            localStorage.setItem("token",data.token)

            router.push("/dashboard")
        }
        catch (err: any) {
            alert(err.message)
        }finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) return

        const payload = decodeToken(token)

        if (!payload) {
            localStorage.removeItem("token")
            return
        }

        if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN") {
            router.push("/admin/dashboard")
            } else {
            router.push("/dashboard")
        }
    }, [])

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
                    disabled={loading} 
                    onClick={handleLogin}>
                        {loading ? "Loading..." : "Login"}
                    </button>

                </div>
            </div>
    )
}