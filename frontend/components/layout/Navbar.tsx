"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/app/lib/auth";
import { IoLogOutSharp } from "react-icons/io5"
import Swal from "sweetalert2";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname(); // 🔥 ดึง path ปัจจุบัน
  

  useEffect(() => {
    const user = getUser();
    setUser(user);
    
  }, [pathname]);

  const handleLogout = () => {
  Swal.fire({
    title: "Logout?",
    text: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes"
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      router.replace("/login")
    }
  })
}

  // 🔥 Function สำหรับกำหนด class ของแต่ละ link
  const navLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href)
    
    return `px-3 py-1.5 rounded transition-colors duration-150
      ${isActive
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "hover:bg-gray-100 hover:text-black"
      }`;
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-[#0f172a] text-white">
      <h1 className="font-bold text-xl ml-4">
        Home
      </h1>

      <div key={pathname} className="flex gap-4 text-white mr-4">
        {user ? (
          <>
            <Link href="/dashboard" className={navLinkClass("/dashboard")}>
              Dashboard
            </Link>

            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <Link href="/admin/dashboard" className={navLinkClass("/admin")}>
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors duration-150 hover:bg-red-100 hover:text-red-600"
            >
              <IoLogOutSharp size={20} />
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className={navLinkClass("/login")}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}