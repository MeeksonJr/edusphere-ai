import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { awardXP } from "@/lib/gamification"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/bookmarks
 * Fetch user's bookmarks
 * Query params: ?folder=Math ?search=react
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const url = new URL(request.url)
        const folder = url.searchParams.get("folder")
        const search = url.searchParams.get("search")

        let query = (supabase.from("bookmarks") as any).select("*").eq("user_id", user.id)

        if (folder) {
            query = query.eq("folder", folder)
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        const { data: bookmarks, error } = await query.order("created_at", { ascending: false })

        if (error) throw error

        return NextResponse.json({ bookmarks: bookmarks || [] })
    } catch (error: any) {
        console.error("Bookmarks GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 * Body: { url: string, title?: string, description?: string, folder?: string, tags?: string[] }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { url, title, description, folder, tags } = body

        if (!url) {
            return NextResponse.json({ error: "url is required" }, { status: 400 })
        }

        // Basic metadata extraction placeholder
        // In a real app we might fetch the HTML and parse <title> and OpenGraph meta tags
        let finalTitle = title
        let finalDesc = description
        let faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`

        if (!finalTitle) {
            finalTitle = new URL(url).hostname
        }

        const { data: bookmark, error } = await (supabase
            .from("bookmarks") as any)
            .insert({
                user_id: user.id,
                url,
                title: finalTitle,
                description: finalDesc || null,
                folder: folder || "Uncategorized",
                tags: tags || [],
                favicon_url: faviconUrl,
            })
            .select()
            .single()

        if (error) throw error

        // Award XP for adding a bookmark
        await awardXP(
            supabase,
            user.id,
            "bookmark_create",
            bookmark.id,
            `Saved bookmark: ${finalTitle}`
        )

        // Find if they have a daily challenge for bookmarks to increment
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const todayDate = (new Date(Date.now() - tzOffset)).toISOString().split("T")[0];

        const { data: bookmarkChallenge } = await (supabase
            .from("daily_challenges") as any)
            .select("id")
            .eq("user_id", user.id)
            .eq("challenge_date", todayDate)
            .eq("challenge_type", "add_bookmarks")
            .eq("completed", false)
            .single()

        if (bookmarkChallenge) {
            // Can't cleanly hit the POST endpoint locally from here, so we will let the client hit the generic route for now
            // or we just let it be manual. Or we update here since we're in the API.
            // Note: Since server fetch loops are problematic, we assume client updates daily challenges or we replicate logic.
            // In many designs, actions directly tick daily challenges. For phase 3D plan, Client can trigger challenge check.
        }

        return NextResponse.json({ bookmark })
    } catch (error: any) {
        console.error("Bookmarks POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/bookmarks
 * Update a bookmark
 * Body: { id: string, title?: string, description?: string, folder?: string, tags?: string[] }
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id, ...updates } = await request.json()
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

        const { data: bookmark, error } = await (supabase
            .from("bookmarks") as any)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ bookmark })
    } catch (error: any) {
        console.error("Bookmarks PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/bookmarks
 * Delete a bookmark
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { id } = await request.json()
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

        const { error } = await (supabase
            .from("bookmarks") as any)
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Bookmarks DELETE error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
