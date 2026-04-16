import AdminNavbar from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    return (
        <div className="flex">
            <AdminNavbar />

            <main className="flex-1 bg-gray-100 ">
                {children}
            </main>
        </div>
    );
}