import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeClientWrapper } from "./theme-client-wrapper"
import { SettingsProvider } from "@/contexts/settings-context"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeClientWrapper>
      <SettingsProvider>
        <div className="min-h-screen bg-black text-white flex">
          <Sidebar />
          <div className="flex-1 transition-all duration-300 md:pl-64 sidebar-collapsed:md:pl-16">{children}</div>
        </div>
      </SettingsProvider>
    </ThemeClientWrapper>
  )
}
