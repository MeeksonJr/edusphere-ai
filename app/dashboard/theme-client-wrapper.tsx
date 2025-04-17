"use client"

import { useSettings } from "@/contexts/settings-context"
import { useEffect } from "react"
import type React from "react"

export function ThemeClientWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()

  // Apply accent color to CSS variables
  useEffect(() => {
    const root = document.documentElement

    // Set the accent color
    switch (settings.accentColor) {
      case "purple":
        root.style.setProperty("--neon-purple", "#b026ff")
        root.style.setProperty("--primary", "#b026ff")
        break
      case "blue":
        root.style.setProperty("--neon-purple", "#4d4dff")
        root.style.setProperty("--primary", "#4d4dff")
        break
      case "green":
        root.style.setProperty("--neon-purple", "#39ff14")
        root.style.setProperty("--primary", "#39ff14")
        break
      case "pink":
        root.style.setProperty("--neon-purple", "#ff00ff")
        root.style.setProperty("--primary", "#ff00ff")
        break
      case "orange":
        root.style.setProperty("--neon-purple", "#ff6600")
        root.style.setProperty("--primary", "#ff6600")
        break
      default:
        root.style.setProperty("--neon-purple", "#b026ff")
        root.style.setProperty("--primary", "#b026ff")
    }
  }, [settings.accentColor])

  return <>{children}</>
}
