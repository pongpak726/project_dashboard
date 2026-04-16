"use client"

import { useEffect,useState } from "react"
import { apiClient } from "../lib/apiClient"


export default function Dashboard() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    apiClient("/users").then(setUsers)
  }, [])

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
