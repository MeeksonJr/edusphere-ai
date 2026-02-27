/**
 * API Key validation helper for public v1 endpoints
 * Validates API key from Authorization header, checks rate limits
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Rate limit: 100 calls per day per key
const DAILY_RATE_LIMIT = 100

export interface ApiKeyValidation {
    valid: boolean
    userId?: string
    keyId?: string
    scopes?: string[]
    error?: string
    status?: number
}

/**
 * Hash an API key using SHA-256 for secure storage comparison
 */
export async function hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
}

/**
 * Generate a new API key with prefix for easy identification
 */
export function generateApiKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let key = "edusphere_"
    for (let i = 0; i < 40; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return key
}

/**
 * Validate an API key from request headers
 */
export async function validateApiKey(req: Request): Promise<ApiKeyValidation> {
    const authHeader = req.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            valid: false,
            error: "Missing or invalid Authorization header. Use: Bearer <api_key>",
            status: 401,
        }
    }

    const apiKey = authHeader.replace("Bearer ", "")

    if (!apiKey.startsWith("edusphere_")) {
        return {
            valid: false,
            error: "Invalid API key format",
            status: 401,
        }
    }

    const keyHash = await hashApiKey(apiKey)

    // Use service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Look up the key
    const { data: keyData, error } = await supabase
        .from("api_keys")
        .select("id, user_id, scopes, revoked")
        .eq("key_hash", keyHash)
        .single()

    if (error || !keyData) {
        return {
            valid: false,
            error: "Invalid API key",
            status: 401,
        }
    }

    if (keyData.revoked) {
        return {
            valid: false,
            error: "API key has been revoked",
            status: 401,
        }
    }

    // Check rate limit (calls today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
        .from("api_usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("api_key_id", keyData.id)
        .gte("created_at", today.toISOString())

    if ((count || 0) >= DAILY_RATE_LIMIT) {
        return {
            valid: false,
            error: `Rate limit exceeded. Maximum ${DAILY_RATE_LIMIT} requests per day.`,
            status: 429,
        }
    }

    // Update last_used_at
    await supabase
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", keyData.id)

    return {
        valid: true,
        userId: keyData.user_id,
        keyId: keyData.id,
        scopes: keyData.scopes || ["read"],
    }
}

/**
 * Log an API usage event
 */
export async function logApiUsage(
    keyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    latencyMs: number
): Promise<void> {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        await supabase.from("api_usage_logs").insert({
            api_key_id: keyId,
            endpoint,
            method,
            status_code: statusCode,
            latency_ms: latencyMs,
        })
    } catch (err) {
        console.error("Failed to log API usage:", err)
    }
}
