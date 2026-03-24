import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classroomId = searchParams.get("classroom_id")
    const period = searchParams.get("period") || "all" // "all" or "week"

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let query = supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, total_xp, current_streak, level")
      .order("total_xp", { ascending: false })
      .limit(50)

    // If classroom filter, get student IDs first
    if (classroomId) {
      const { data: enrollments } = await supabase
        .from("classroom_students")
        .select("student_id")
        .eq("classroom_id", classroomId)

      if (!enrollments || enrollments.length === 0) {
        return NextResponse.json({ leaderboard: [], user_rank: null })
      }

      const studentIds = enrollments.map(e => e.student_id)
      query = query.in("id", studentIds)
    }

    const { data: profiles, error } = await query
    if (error) throw error

    const leaderboard = (profiles || []).map((p, idx) => ({
      rank: idx + 1,
      id: p.id,
      full_name: p.full_name,
      username: p.username,
      avatar_url: p.avatar_url,
      total_xp: p.total_xp || 0,
      current_streak: p.current_streak || 0,
      level: p.level || 1,
      is_current_user: p.id === user.id,
    }))

    const userRank = leaderboard.find(l => l.is_current_user)?.rank || null

    return NextResponse.json({ leaderboard, user_rank: userRank })
  } catch (err: any) {
    console.error("Leaderboard error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
