"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect } from "react"
import type { AccentColorType } from "@/contexts/settings-context"

interface ExtendedThemeProviderProps extends ThemeProviderProps {
  accentColor?: AccentColorType
}

export function ThemeProvider({ children, accentColor = "purple", ...props }: ExtendedThemeProviderProps) {
  // Apply accent color to CSS variables
  useEffect(() => {
    const root = document.documentElement

    // Set the accent color
    switch (accentColor) {
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
  }, [accentColor])

  return (
    <NextThemesProvider attribute="class" {...props}>
      {children}
    </NextThemesProvider>
  )
}
