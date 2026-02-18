import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/certificates/[id]/pdf
 * Generate and return a certificate PDF as downloadable response
 * Uses server-side HTML-to-PDF-like approach with a styled SVG
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Fetch certificate
        const { data: cert, error } = await supabase
            .from("certificates")
            .select("*")
            .eq("id", id)
            .eq("user_id", user.id)
            .single()

        if (error || !cert) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
        }

        const recipientName = cert.metadata?.recipient_name || "Student"
        const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://edusphere.ai'}/api/certificates/verify?code=${cert.verification_code}`

        const typeLabel =
            cert.type === "course_completion" ? "Course Completion" :
                cert.type === "skill_mastery" ? "Skill Mastery" :
                    cert.type === "achievement" ? "Achievement" : "Certificate"

        // Generate SVG certificate (printable, high quality)
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="780" viewBox="0 0 1100 780">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1100" height="780" fill="url(#bg)" rx="16"/>

  <!-- Border -->
  <rect x="20" y="20" width="1060" height="740" fill="none" stroke="url(#accent)" stroke-width="2" rx="12" opacity="0.5"/>
  <rect x="30" y="30" width="1040" height="720" fill="none" stroke="url(#gold)" stroke-width="1" rx="10" opacity="0.3"/>

  <!-- Corner decorations -->
  <circle cx="50" cy="50" r="8" fill="url(#gold)" opacity="0.6"/>
  <circle cx="1050" cy="50" r="8" fill="url(#gold)" opacity="0.6"/>
  <circle cx="50" cy="730" r="8" fill="url(#gold)" opacity="0.6"/>
  <circle cx="1050" cy="730" r="8" fill="url(#gold)" opacity="0.6"/>

  <!-- Logo/Brand -->
  <text x="550" y="100" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#06b6d4" letter-spacing="6">EDUSPHERE AI</text>

  <!-- Divider -->
  <line x1="350" y1="120" x2="750" y2="120" stroke="url(#accent)" stroke-width="1" opacity="0.4"/>

  <!-- Certificate Title -->
  <text x="550" y="175" text-anchor="middle" font-family="Georgia, serif" font-size="38" fill="url(#gold)" font-weight="bold">Certificate of ${typeLabel}</text>

  <!-- Subtitle -->
  <text x="550" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="rgba(255,255,255,0.5)" letter-spacing="2">THIS IS TO CERTIFY THAT</text>

  <!-- Recipient Name -->
  <text x="550" y="310" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="white" font-weight="bold">${escapeXml(recipientName)}</text>

  <!-- Underline -->
  <line x1="250" y1="330" x2="850" y2="330" stroke="url(#accent)" stroke-width="1.5" opacity="0.3"/>

  <!-- Certificate details -->
  <text x="550" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.6)">has successfully completed</text>

  <!-- Course/Achievement Title -->
  <text x="550" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#06b6d4" font-weight="bold">${escapeXml(cert.title)}</text>

  ${cert.description ? `<text x="550" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.4)">${escapeXml(cert.description)}</text>` : ''}

  <!-- Date -->
  <text x="550" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.5)">Issued on ${issuedDate}</text>

  <!-- Divider -->
  <line x1="350" y1="580" x2="750" y2="580" stroke="url(#accent)" stroke-width="1" opacity="0.3"/>

  <!-- Signatures area -->
  <text x="250" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="white">_______________</text>
  <text x="250" y="665" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.4)">EduSphere AI</text>

  <text x="850" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="white">_______________</text>
  <text x="850" y="665" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.4)">Platform Director</text>

  <!-- Verification -->
  <text x="550" y="720" text-anchor="middle" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.25)">Verification: ${cert.verification_code}</text>
  <text x="550" y="740" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="rgba(255,255,255,0.15)">${verifyUrl}</text>
</svg>`

        return new Response(svg, {
            headers: {
                "Content-Type": "image/svg+xml",
                "Content-Disposition": `attachment; filename="certificate-${cert.verification_code.slice(0, 8)}.svg"`,
            },
        })
    } catch (error: any) {
        console.error("Certificate PDF error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}
