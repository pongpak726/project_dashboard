import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export default function mainLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar/>
                {children}
            <Footer/>
        </div>
    );
}