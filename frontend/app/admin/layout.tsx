
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="font-bold nv-4">
                    <ul className="space-y-2">
                        <li>Dashboard</li>
                        <li>Users</li>
                    </ul>
                </h2>
            </aside>
            <main className="flex-1 p-6 bg-gray-100">
                {children}
            </main>
        </div>
    );
}