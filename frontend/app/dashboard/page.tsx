"use client"

import { useEffect,useState } from "react"
import { apiClient } from "../lib/apiClient"
import { useRouter } from "next/navigation"



export default function Dashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
  const token = localStorage.getItem("token")

  if (!token) {
      router.push("/login")
      return
    }

    apiClient("/users")
      .then((data) => {
        setUsers(data)
      })
      .finally(() => {
        setLoading(false)
      })

    }, [])

    if (loading) return <div>Loading...</div>

  return (
  <div>
    <h1 className="text-black text-center font-bold text-2xl pt-2 font-poppins">
      Dashboard
    </h1>
    {users.map((u:any) =>(
        <div key={u.id}>{u.email}</div>
      ))
    }
  </div>


  )
}
