import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/notes
 * Fetch user notes (study_resources with resource_type='notes')
 * Query params: search, subject, sort (newest|oldest|title)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search")
        const subject = searchParams.get("subject")
        const sort = searchParams.get("sort") || "newest"

        let query = supabase
            .from("study_resources")
            .select("*")
            .eq("user_id", user.id)
            .eq("resource_type", "notes")

        if (subject) query = query.eq("subject", subject)
        if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)

        if (sort === "oldest") {
            query = query.order("updated_at", { ascending: true })
        } else if (sort === "title") {
            query = query.order("title", { ascending: true })
        } else {
            query = query.order("updated_at", { ascending: false })
        }

        const { data: notes, error } = await query

        if (error) throw error

        return NextResponse.json({ notes: notes || [] })
    } catch (error: any) {
        console.error("Notes GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/notes
 * Create a new note
 * Body: { title, content, subject?, tags? }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { title, content, subject, tags } = body

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const { data: note, error } = await supabase
            .from("study_resources")
            .insert({
                user_id: user.id,
                title,
                content: content || "",
                subject: subject || null,
                resource_type: "notes",
                tags: tags || [],
                ai_generated: false,
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ note }, { status: 201 })
    } catch (error: any) {
        console.error("Notes POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/notes
 * Update an existing note
 * Body: { id, title?, content?, subject?, tags? }
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
        }

        const updateData: any = { updated_at: new Date().toISOString() }
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.content !== undefined) updateData.content = updates.content
        if (updates.subject !== undefined) updateData.subject = updates.subject
        if (updates.tags !== undefined) updateData.tags = updates.tags

        const { data: note, error } = await supabase
            .from("study_resources")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ note })
    } catch (error: any) {
        console.error("Notes PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/notes
 * Delete a note
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
        }

        const { error } = await supabase
            .from("study_resources")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Notes DELETE error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
