import type React from "react"
import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { ThemeClientWrapper } from "./theme-client-wrapper"
import { SettingsProvider } from "@/contexts/settings-context"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeClientWrapper>
        <SettingsProvider>
          <div className="min-h-screen bg-black text-white flex">
            <DashboardSidebar />
            <main
              className="flex-1 transition-all duration-300 md:pl-64 sidebar-collapsed:md:pl-16 overflow-x-hidden"
              id="main-content"
            >
              <div className="min-h-screen">{children}</div>
            </main>
          </div>
        </SettingsProvider>
      </ThemeClientWrapper>
    </ErrorBoundary>
  )
}
