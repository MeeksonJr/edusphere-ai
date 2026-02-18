import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/certificates/verify?code=xxx
 * Public endpoint — verify a certificate by its verification code
 * Returns certificate validity info (no auth required)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get("code")

        if (!code) {
            return NextResponse.json({ valid: false, error: "Missing verification code" }, { status: 400 })
        }

        const supabase = await createClient()

        const { data: cert, error } = await supabase
            .from("certificates")
            .select("id, title, type, issued_at, metadata, verification_code")
            .eq("verification_code", code)
            .single()

        if (error || !cert) {
            return NextResponse.json({
                valid: false,
                error: "Certificate not found. This code may be invalid.",
            })
        }

        return NextResponse.json({
            valid: true,
            certificate: {
                title: cert.title,
                type: cert.type,
                recipient: cert.metadata?.recipient_name || "Student",
                issued_at: cert.issued_at,
                verification_code: cert.verification_code,
            },
        })
    } catch (error: any) {
        console.error("Certificate verify error:", error)
        return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
    }
}
