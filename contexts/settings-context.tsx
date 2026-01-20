"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"

export type ThemeType = "dark" | "light"
export type AccentColorType = "purple" | "blue" | "green" | "pink" | "orange"
export type CalendarViewType = "month" | "week" | "day"

interface NotificationSettings {
  email: boolean
  assignments: boolean
  ai: boolean
}

interface CalendarSettings {
  defaultView: CalendarViewType
  showWeekends: boolean
  firstDayOfWeek: "sunday" | "monday"
}

export interface UserSettings {
  theme: ThemeType
  accentColor: AccentColorType
  notifications: NotificationSettings
  language: string
  calendar: CalendarSettings
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
  loading: boolean
}

const defaultSettings: UserSettings = {
  theme: "dark",
  accentColor: "purple",
  notifications: {
    email: true,
    assignments: true,
    ai: true,
  },
  language: "en",
  calendar: {
    defaultView: "month",
    showWeekends: true,
    firstDayOfWeek: "sunday",
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Load settings from database on initial render
  useEffect(() => {
    const loadSettings = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Check if user has settings in the database
          const { data, error } = await supabase
            .from("user_settings")
            .select("settings")
            .eq("user_id", user.id)
            .single()

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching settings:", error)
          } else if (data) {
            // If settings exist, use them
            setSettings(data.settings as UserSettings)
          } else {
            // If no settings exist, create default settings
            const { error: insertError } = await supabase.from("user_settings").insert([
              {
                user_id: user.id,
                settings: defaultSettings,
              },
            ])

            if (insertError) {
              console.error("Error creating settings:", insertError)
            }
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [supabase])

  // Update settings in the database
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!supabase) {
      console.warn("Cannot update settings: Supabase client not available")
      return
    }
    try {
      setLoading(true)

      // Update local state
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)

      // Update database
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase.from("user_settings").upsert([
          {
            user_id: user.id,
            settings: updatedSettings,
          },
        ])

        if (error) {
          throw error
        }

        toast({
          title: "Settings updated",
          description: "Your settings have been saved successfully.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      })

      // Revert to previous settings on error
      setSettings(settings)
    } finally {
      setLoading(false)
    }
  }

  return <SettingsContext.Provider value={{ settings, updateSettings, loading }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
