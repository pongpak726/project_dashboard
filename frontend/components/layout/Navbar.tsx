// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded ${
      pathname === path
        ? "bg-blue-500 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <nav className="bg-white shadow-md">
        <div className="max-w-10xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
            
            {/* LEFT */}
            <div className="text-black font-bold">
            Dashboard
            </div>

            {/* MIDDLE */}
            <div className="flex justify-center gap-2">
            <Link href="/" className={linkClass("/")}>
                Home
            </Link>
            <Link href="/users" className={linkClass("/users")}>
                Users
            </Link>
            </div>

            {/* RIGHT */}
            <div className="flex justify-end">
            {/* Auth user */}
            </div>

        </div>
    </nav>
  );
}