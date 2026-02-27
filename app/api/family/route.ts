import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET — list children (with optional progress)
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check Family tier
        const { data: profile } = await (supabase as any)
            .from("profiles")
            .select("subscription_tier")
            .eq("id", user.id)
            .single()

        if (!profile || !["family", "pro"].includes(profile.subscription_tier || "")) {
            return NextResponse.json(
                { error: "Family Hub requires a Family or Pro subscription" },
                { status: 403 }
            )
        }

        const { data: children, error } = await (supabase as any)
            .from("parent_children")
            .select("*")
            .eq("parent_id", user.id)
            .order("created_at", { ascending: true })

        if (error) throw error

        // Fetch recent progress for each child
        const childIds = (children || []).map((c: any) => c.id)
        let progressMap: Record<string, any[]> = {}

        if (childIds.length > 0) {
            const { data: progress } = await (supabase as any)
                .from("child_progress")
                .select("*")
                .in("child_id", childIds)
                .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
                .order("date", { ascending: false })

            if (progress) {
                for (const p of progress) {
                    if (!progressMap[p.child_id]) progressMap[p.child_id] = []
                    progressMap[p.child_id].push(p)
                }
            }
        }

        const enriched = (children || []).map((child: any) => ({
            ...child,
            recent_progress: progressMap[child.id] || [],
        }))

        return NextResponse.json({ children: enriched })
    } catch (error: any) {
        console.error("Family GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST — add child or log progress
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { action } = body

        if (action === "add_child") {
            const { childName, gradeLevel, subjects } = body

            if (!childName?.trim()) {
                return NextResponse.json(
                    { error: "Child name is required" },
                    { status: 400 }
                )
            }

            const { data, error } = await (supabase as any)
                .from("parent_children")
                .insert({
                    parent_id: user.id,
                    child_name: childName.trim(),
                    grade_level: gradeLevel || null,
                    subjects: subjects || [],
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ child: data })
        }

        if (action === "log_progress") {
            const { childId, subject, score, timeSpentMinutes, activity } = body

            if (!childId || !subject) {
                return NextResponse.json(
                    { error: "Child ID and subject are required" },
                    { status: 400 }
                )
            }

            const { data, error } = await (supabase as any)
                .from("child_progress")
                .insert({
                    child_id: childId,
                    subject: subject,
                    score: score || null,
                    time_spent_minutes: timeSpentMinutes || 0,
                    activity: activity || null,
                })
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ progress: data })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error: any) {
        console.error("Family POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE — remove child
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const childId = searchParams.get("childId")

        if (!childId) {
            return NextResponse.json(
                { error: "Child ID is required" },
                { status: 400 }
            )
        }

        const { error } = await (supabase as any)
            .from("parent_children")
            .delete()
            .eq("id", childId)
            .eq("parent_id", user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Family DELETE error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
