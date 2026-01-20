"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useMemo } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)

  useEffect(() => {
    // Only create client on the client side after mount
    if (typeof window === "undefined") {
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    // Support both old anon key and new publishable key format
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Debug logging (only in development)
    if (process.env.NODE_ENV === "development") {
      console.log("Supabase Client Initialization:", {
        url: supabaseUrl,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        usingKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "publishable" : "anon",
      })
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
        {
          url: supabaseUrl,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      )
      return
    }

    // Validate URL format
    if (!supabaseUrl.includes("qyqbqgubsuxepnloduvd")) {
      console.warn(
        "⚠️ WARNING: Supabase URL appears to be from old database. Expected: qyqbqgubsuxepnloduvd, Got:",
        supabaseUrl
      )
    }

    try {
      const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
      setSupabase(client)
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Refresh the page on auth state change
      // This is a simple approach - you might want to use more sophisticated state management in production
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = useMemo(() => ({ supabase }), [supabase])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  // Return supabase even if null - let components handle the null case
  return { supabase: context.supabase }
}
