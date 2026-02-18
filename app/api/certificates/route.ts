import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { randomBytes } from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/certificates
 * Fetch user certificates
 * Query params: type (optional filter)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type")

        let query = supabase
            .from("certificates")
            .select("*")
            .eq("user_id", user.id)
            .order("issued_at", { ascending: false })

        if (type) query = query.eq("type", type)

        const { data: certificates, error } = await query

        if (error) throw error

        return NextResponse.json({ certificates: certificates || [] })
    } catch (error: any) {
        console.error("Certificates GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/certificates
 * Issue a new certificate
 * Body: { title, description?, type, course_id?, metadata? }
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await request.json()
        const { title, description, type, course_id, metadata } = body

        if (!title || !type) {
            return NextResponse.json({ error: "Title and type are required" }, { status: 400 })
        }

        const validTypes = ['course_completion', 'skill_mastery', 'achievement', 'custom']
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid certificate type" }, { status: 400 })
        }

        // Check for duplicate certificate (same user + same course/title + type)
        const dupeQuery = supabase
            .from("certificates")
            .select("id")
            .eq("user_id", user.id)
            .eq("type", type)
            .eq("title", title)

        if (course_id) dupeQuery.eq("course_id", course_id)

        const { data: existing } = await dupeQuery

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: "Certificate already issued", certificate: existing[0] }, { status: 409 })
        }

        // Get user profile for the certificate
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, display_name")
            .eq("id", user.id)
            .single()

        // Generate unique verification code
        const verificationCode = randomBytes(16).toString("hex")

        const { data: certificate, error } = await supabase
            .from("certificates")
            .insert({
                user_id: user.id,
                course_id: course_id || null,
                title,
                description: description || null,
                type,
                verification_code: verificationCode,
                metadata: {
                    ...(metadata || {}),
                    recipient_name: profile?.full_name || profile?.display_name || "Student",
                    issued_date: new Date().toISOString(),
                },
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ certificate }, { status: 201 })
    } catch (error: any) {
        console.error("Certificates POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
