// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const isLoggedIn = false // mock

  return(
    <nav className="flex justify-between items-center p-4 bg-white text-black">
      <Link href="/" className="font-bold text-xl">Home</Link>

      <div className="flex">
        {
          isLoggedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <button>Logout</button>
            </>
          ):(
            <Link href="/login">Login</Link>
          )
        }
      </div>
    </nav>
  )
}