import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
    // mobile drawer state
    const [mobileOpen, setMobileOpen] = useState(false);

    const openMobile = () => setMobileOpen(true);
    const closeMobile = () => setMobileOpen(false);
    const toggleMobile = () => setMobileOpen((s) => !s);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar (desktop + mobile drawer) */}
            <Sidebar mobileOpen={mobileOpen} onClose={closeMobile} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <Navbar onMobileToggle={toggleMobile} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
