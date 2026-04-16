import AdminNavbar from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    return (
        <div className="flex min-h-screen">
            <AdminNavbar />

            <main className="flex-1 p-6 bg-gray-100">
                {children}
            </main>
        </div>
    );
}