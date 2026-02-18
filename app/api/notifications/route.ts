import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/notifications
 * Fetch user notifications (paginated) + unread count
 * Query params: limit (default 20), offset (default 0), filter (all|unread)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "20")
        const offset = parseInt(searchParams.get("offset") || "0")
        const filter = searchParams.get("filter") || "all"

        // Unread count (always return this)
        const { count: unreadCount } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("read", false)

        // Build query
        let query = supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (filter === "unread") {
            query = query.eq("read", false)
        } else if (filter !== "all") {
            // Filter by type (achievement, level_up, etc.)
            query = query.eq("type", filter)
        }

        const { data: notifications, error } = await query

        if (error) throw error

        return NextResponse.json({
            notifications: notifications || [],
            unreadCount: unreadCount || 0,
            hasMore: (notifications?.length || 0) === limit,
        })
    } catch (error: any) {
        console.error("Notifications GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read
 * Body: { id: string } (single) or { all: true } (mark all read)
 */
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()

        if (body.all) {
            // Mark all as read
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("read", false)

            if (error) throw error
            return NextResponse.json({ success: true, message: "All notifications marked as read" })
        }

        if (body.id) {
            // Mark single notification as read
            const { error } = await supabase
                .from("notifications")
                .update({ read: true })
                .eq("id", body.id)
                .eq("user_id", user.id)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Missing id or all parameter" }, { status: 400 })
    } catch (error: any) {
        console.error("Notifications PATCH error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/notifications
 * Delete a single notification
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()

        if (!body.id) {
            return NextResponse.json({ error: "Missing notification id" }, { status: 400 })
        }

        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", body.id)
            .eq("user_id", user.id)

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Notifications DELETE error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
