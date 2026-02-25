import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/export
 * Export user data in various formats.
 * Query params:
 *   type: notes | courses | flashcards | achievements | analytics
 *   format: json | csv | markdown  (default: json)
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") || "notes"
        const format = searchParams.get("format") || "json"

        let data: any[] = []
        let filename = `edusphere-${type}`

        switch (type) {
            case "notes": {
                const { data: notes } = await supabase
                    .from("study_resources")
                    .select("title, content, subject, tags, resource_type, created_at, updated_at")
                    .eq("user_id", user.id)
                    .order("updated_at", { ascending: false })
                data = notes || []
                break
            }
            case "courses": {
                const { data: courses } = await supabase
                    .from("courses")
                    .select("title, description, subject, difficulty, modules, progress, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                data = (courses || []).map((c: any) => ({
                    ...c,
                    module_count: Array.isArray(c.modules) ? c.modules.length : 0,
                    modules: undefined,
                }))
                break
            }
            case "flashcards": {
                const { data: sets } = await supabase
                    .from("flashcard_sets")
                    .select("title, description, subject, cards, mastery_score, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                data = (sets || []).map((s: any) => ({
                    title: s.title,
                    description: s.description,
                    subject: s.subject,
                    card_count: Array.isArray(s.cards) ? s.cards.length : 0,
                    mastery_score: s.mastery_score,
                    cards: s.cards,
                    created_at: s.created_at,
                }))
                break
            }
            case "achievements": {
                const { data: achievements } = await supabase
                    .from("user_achievements")
                    .select("achievement_id, unlocked_at, progress, metadata")
                    .eq("user_id", user.id)
                    .order("unlocked_at", { ascending: false })
                data = achievements || []
                break
            }
            case "analytics": {
                const [streakRes, sessionsRes, analyticsRes] = await Promise.all([
                    supabase.from("user_streaks").select("*").eq("user_id", user.id).single(),
                    supabase.from("live_sessions").select("topic, duration_seconds, xp_earned, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
                    supabase.from("course_analytics").select("event_type, event_data, timestamp").eq("user_id", user.id).order("timestamp", { ascending: false }).limit(100),
                ])
                data = [{
                    streaks: streakRes.data || {},
                    recent_sessions: sessionsRes.data || [],
                    recent_activity: analyticsRes.data || [],
                }]
                break
            }
            default:
                return NextResponse.json({ error: `Unknown export type: ${type}` }, { status: 400 })
        }

        // Format output
        if (format === "csv") {
            const csv = convertToCSV(data)
            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${filename}.csv"`,
                },
            })
        }

        if (format === "markdown") {
            const md = convertToMarkdown(data, type)
            return new NextResponse(md, {
                headers: {
                    "Content-Type": "text/markdown; charset=utf-8",
                    "Content-Disposition": `attachment; filename="${filename}.md"`,
                },
            })
        }

        // Default: JSON
        return new NextResponse(JSON.stringify(data, null, 2), {
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}.json"`,
            },
        })
    } catch (error: any) {
        console.error("Export error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function convertToCSV(data: any[]): string {
    if (!data.length) return ""
    const flatData = data.map(item => flattenObject(item))
    const headers = [...new Set(flatData.flatMap(d => Object.keys(d)))]
    const rows = flatData.map(d =>
        headers.map(h => {
            const val = d[h]
            if (val === null || val === undefined) return ""
            const str = String(val)
            return str.includes(",") || str.includes('"') || str.includes("\n")
                ? `"${str.replace(/"/g, '""')}"`
                : str
        }).join(",")
    )
    return [headers.join(","), ...rows].join("\n")
}

function flattenObject(obj: any, prefix = ""): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}_${key}` : key
        if (value && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, fullKey))
        } else if (Array.isArray(value)) {
            result[fullKey] = value.map(v => typeof v === "object" ? JSON.stringify(v) : v).join("; ")
        } else {
            result[fullKey] = value
        }
    }
    return result
}

function convertToMarkdown(data: any[], type: string): string {
    const title = type.charAt(0).toUpperCase() + type.slice(1)
    let md = `# EduSphere AI — ${title} Export\n\n`
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`

    if (type === "notes") {
        data.forEach((note, i) => {
            md += `## ${i + 1}. ${note.title || "Untitled"}\n\n`
            if (note.subject) md += `**Subject:** ${note.subject}\n\n`
            if (note.tags?.length) md += `**Tags:** ${note.tags.join(", ")}\n\n`
            md += `${note.content || "*Empty*"}\n\n---\n\n`
        })
    } else if (type === "flashcards") {
        data.forEach((set, i) => {
            md += `## ${i + 1}. ${set.title}\n\n`
            if (set.description) md += `${set.description}\n\n`
            md += `| # | Front | Back |\n|---|-------|------|\n`
            if (Array.isArray(set.cards)) {
                set.cards.forEach((card: any, j: number) => {
                    md += `| ${j + 1} | ${(card.front || "").replace(/\|/g, "\\|")} | ${(card.back || "").replace(/\|/g, "\\|")} |\n`
                })
            }
            md += `\n---\n\n`
        })
    } else {
        data.forEach((item, i) => {
            md += `## Item ${i + 1}\n\n`
            md += `\`\`\`json\n${JSON.stringify(item, null, 2)}\n\`\`\`\n\n`
        })
    }

    return md
}
