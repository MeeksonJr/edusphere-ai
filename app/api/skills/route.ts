import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/skills
 * Fetch all skills + user's skill progress
 */
export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Get all available skills
        const { data: allSkills } = await (supabase
            .from("skills") as any)
            .select("*")
            .order("category")
            .order("name")

        // Get user's skill progress
        const { data: userSkills } = await (supabase
            .from("user_skills") as any)
            .select("*, skills(*)")
            .eq("user_id", user.id)

        return NextResponse.json({
            skills: allSkills || [],
            userSkills: userSkills || [],
        })
    } catch (error: any) {
        console.error("Skills GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/skills
 * Add a skill to user's active skills
 * Body: { skill_id: string }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { skill_id } = await request.json()
        if (!skill_id) return NextResponse.json({ error: "skill_id is required" }, { status: 400 })

        // Check if already added
        const { data: existing } = await (supabase
            .from("user_skills") as any)
            .select("id")
            .eq("user_id", user.id)
            .eq("skill_id", skill_id)
            .single()

        if (existing) {
            return NextResponse.json({ error: "Skill already added" }, { status: 409 })
        }

        const { data, error } = await (supabase
            .from("user_skills") as any)
            .insert({
                user_id: user.id,
                skill_id,
                level: 1,
                xp: 0,
            })
            .select("*, skills(*)")
            .single()

        if (error) throw error

        return NextResponse.json({ userSkill: data })
    } catch (error: any) {
        console.error("Skills POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/skills
 * Remove a skill from user's active skills
 * Body: { skill_id: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { skill_id } = await request.json()
        if (!skill_id) return NextResponse.json({ error: "skill_id is required" }, { status: 400 })

        const { error } = await (supabase
            .from("user_skills") as any)
            .delete()
            .eq("user_id", user.id)
            .eq("skill_id", skill_id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Skills DELETE error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
