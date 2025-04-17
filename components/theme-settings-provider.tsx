"use client"

import { useSettings } from "@/contexts/settings-context"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"

export function ThemeSettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={settings.theme}
      enableSystem={false}
      accentColor={settings.accentColor}
    >
      {children}
    </ThemeProvider>
  )
}
