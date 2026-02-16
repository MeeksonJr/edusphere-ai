"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { DashboardNavbar } from "@/components/layout/DashboardNavbar"
// Ensure this import path is correct and the component is exported
// If ThemeClientWrapper is only in app/dashboard, we might need to move it or just use it in the parent layout
// For now, we'll assume the parent layout handles the providers, and this component handles the UI structure

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <DashboardSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-64 sidebar-collapsed:md:pl-16">
                <DashboardNavbar onMenuClick={() => setMobileOpen(true)} />
                <main id="main-content" className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
