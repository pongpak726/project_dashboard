import Link from "next/link";
import { RiDashboardHorizontalFill } from "react-icons/ri";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a]">
      
      {/* Icon */}
      <div className="mb-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900">
        <RiDashboardHorizontalFill size={32} color="white" />
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-white tracking-tight">
        Dashboard System
      </h1>

      {/* Subtitle 
      <p className="text-gray-400 mt-3 text-sm">
        จัดการข้อมูลผู้ใช้และระบบ Smart City
      </p>*/}

      {/* Divider */}
      <div className="w-16 h-0.5 bg-blue-600 mt-6 rounded-full" />

      {/* Button */}
      <Link
        href="/login"
        className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold tracking-wide transition-colors shadow-lg shadow-blue-900"
      >
        เข้าสู่ระบบ
      </Link>

      {/* Footer note 
      <p className="text-gray-600 text-xs mt-6">
        Smart City Monitoring Platform
      </p>*/}

    </div>
  );
}