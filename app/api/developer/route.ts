import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateApiKey, hashApiKey } from "@/lib/api-keys"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET — list user's API keys
export async function GET() {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: keys, error } = await (supabase as any)
            .from("api_keys")
            .select("id, key_prefix, name, scopes, last_used_at, revoked, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

        if (error) throw error

        // Get usage counts for each key (last 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const keyIds = (keys || []).map((k: any) => k.id)
        let usageCounts: Record<string, number> = {}

        if (keyIds.length > 0) {
            const { data: usage } = await (supabase as any)
                .from("api_usage_logs")
                .select("api_key_id")
                .in("api_key_id", keyIds)
                .gte("created_at", yesterday)

            if (usage) {
                for (const u of usage) {
                    usageCounts[u.api_key_id] = (usageCounts[u.api_key_id] || 0) + 1
                }
            }
        }

        const enrichedKeys = (keys || []).map((k: any) => ({
            ...k,
            usage_24h: usageCounts[k.id] || 0,
        }))

        return NextResponse.json({ keys: enrichedKeys })
    } catch (error: any) {
        console.error("Developer keys GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST — create new API key or revoke existing
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

        if (action === "create") {
            const { name, scopes } = body

            // Check how many active keys user has (max 5)
            const { data: existing } = await (supabase as any)
                .from("api_keys")
                .select("id")
                .eq("user_id", user.id)
                .eq("revoked", false)

            if ((existing || []).length >= 5) {
                return NextResponse.json(
                    { error: "Maximum 5 active API keys allowed" },
                    { status: 400 }
                )
            }

            const rawKey = generateApiKey()
            const keyHash = await hashApiKey(rawKey)
            const keyPrefix = rawKey.substring(0, 18) + "..."

            const { data, error } = await (supabase as any)
                .from("api_keys")
                .insert({
                    user_id: user.id,
                    key_hash: keyHash,
                    key_prefix: keyPrefix,
                    name: name || "Default",
                    scopes: scopes || ["read"],
                })
                .select()
                .single()

            if (error) throw error

            // Enable developer mode on profile
            await (supabase as any)
                .from("profiles")
                .update({ is_developer: true })
                .eq("id", user.id)

            return NextResponse.json({
                key: {
                    ...data,
                    raw_key: rawKey, // Only returned once at creation!
                },
            })
        }

        if (action === "revoke") {
            const { keyId } = body

            if (!keyId) {
                return NextResponse.json({ error: "Key ID required" }, { status: 400 })
            }

            const { error } = await (supabase as any)
                .from("api_keys")
                .update({ revoked: true })
                .eq("id", keyId)
                .eq("user_id", user.id)

            if (error) throw error
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error: any) {
        console.error("Developer keys POST error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// GET usage stats
export { GET as getUsageStats }
