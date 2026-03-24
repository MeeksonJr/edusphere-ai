import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  try {
    const { invite_code } = await request.json()

    if (!invite_code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Use a direct Postgres query via RPC to look up the classroom
    // This avoids the RLS restriction since we call a function
    const { data: result, error: rpcError } = await supabase.rpc("join_classroom_by_code", {
      p_invite_code: invite_code.toUpperCase(),
      p_student_id: user.id,
    })

    if (rpcError) {
      console.error("RPC error:", rpcError)
      // Parse known error messages
      if (rpcError.message?.includes("not found")) {
        return NextResponse.json({ error: "Invalid invite code. Please check and try again." }, { status: 404 })
      }
      if (rpcError.message?.includes("already enrolled")) {
        return NextResponse.json({ error: "You are already enrolled in this classroom." }, { status: 409 })
      }
      if (rpcError.message?.includes("own classroom")) {
        return NextResponse.json({ error: "You cannot join your own classroom." }, { status: 400 })
      }
      return NextResponse.json({ error: rpcError.message || "Failed to join classroom." }, { status: 500 })
    }

    return NextResponse.json({ success: true, classroom_name: result })
  } catch (err: any) {
    console.error("Join classroom error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
