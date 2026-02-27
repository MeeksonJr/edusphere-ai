import { NextRequest, NextResponse } from "next/server"
import { validateApiKey, logApiUsage } from "@/lib/api-keys"
import { generateAIResponse } from "@/lib/ai-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
    const start = Date.now()
    const validation = await validateApiKey(req)

    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.error },
            { status: validation.status }
        )
    }

    // Check write scope
    if (!validation.scopes?.includes("write")) {
        return NextResponse.json(
            { error: "API key lacks 'write' scope. Create a key with write permissions." },
            { status: 403 }
        )
    }

    try {
        const body = await req.json()
        const { prompt, type, maxTokens } = body

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "prompt is required" },
                { status: 400 }
            )
        }

        const validTypes = ["summary", "flashcards", "quiz", "explanation", "essay"]
        const genType = validTypes.includes(type) ? type : "summary"

        const systemPrompts: Record<string, string> = {
            summary: "Summarize the following topic concisely and clearly.",
            flashcards: "Generate flashcards in JSON array format with 'front' and 'back' fields.",
            quiz: "Generate quiz questions in JSON array format with 'question', 'options' (array), and 'answer' fields.",
            explanation: "Provide a detailed, educational explanation of the topic.",
            essay: "Write a well-structured educational essay on the topic.",
        }

        const result = await generateAIResponse({
            provider: "gemini",
            prompt: prompt.substring(0, 2000),
            systemPrompt: systemPrompts[genType],
            maxTokens: Math.min(maxTokens || 1000, 2000),
            temperature: 0.7,
        })

        const latency = Date.now() - start
        await logApiUsage(validation.keyId!, "/api/v1/ai/generate", "POST", 200, latency)

        return NextResponse.json({
            type: genType,
            content: result?.text || "",
            tokens_used: result?.text?.length || 0,
        })
    } catch (error: any) {
        const latency = Date.now() - start
        await logApiUsage(validation.keyId!, "/api/v1/ai/generate", "POST", 500, latency)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
