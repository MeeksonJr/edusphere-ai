import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const plan = requestUrl.searchParams.get("plan") || "free"

  if (code) {
    const cookieStore = cookies()
    // Support both old anon key and new publishable key format
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseAnonKey!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      }
    )

    // Exchange the code for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error exchanging code for session:", sessionError)
      return NextResponse.redirect(requestUrl.origin + "/login?error=invalid_token")
    }

    // Get the user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase.from("profiles").select().eq("id", user.id).single()

      // If no profile, create one
      if (!profile) {
        await supabase.from("profiles").insert([
          {
            id: user.id,
            full_name: user.user_metadata.full_name || "",
            subscription_tier: plan,
            ai_requests_count: 0,
          },
        ])
      }

      // Check if email is verified
      if (!user.email_confirmed_at) {
        // Email not verified, redirect to verification page
        return NextResponse.redirect(
          requestUrl.origin + `/verify-email?email=${encodeURIComponent(user.email || "")}`
        )
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + "/dashboard")
}
