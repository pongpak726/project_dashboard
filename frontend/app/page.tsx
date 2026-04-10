import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] bg-gray-100">
      <h1 className="text-3xl font-bold text-black">
        Dashboard System
      </h1>

      <p className="text-gray-600 mt-4">
        จัดการข้อมูลผู้ใช้
      </p>

      <Link href="/login" className="w-100 mt-6 px-6 py-2 bg-blue-500 text-white rounded" >
        Login
      </Link>

    </div>
  );
}