import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export default function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />

                <div className="flex-1">
                    {children}
                </div>

            <Footer />
        </div>
    );
}