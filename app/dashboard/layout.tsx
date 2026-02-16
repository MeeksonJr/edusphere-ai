import type React from "react"
import { ThemeClientWrapper } from "./theme-client-wrapper"
import { SettingsProvider } from "@/contexts/settings-context"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeClientWrapper>
        <SettingsProvider>
          <DashboardLayoutClient>
            {children}
          </DashboardLayoutClient>
        </SettingsProvider>
      </ThemeClientWrapper>
    </ErrorBoundary>
  )
}

