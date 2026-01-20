import { NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    if (action === "generateAIResponse") {
      const { provider, prompt, systemPrompt, temperature, maxTokens } = params
      const response = await generateAIResponse({
        provider: provider || "groq",
        prompt,
        systemPrompt,
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2000,
      })

      return NextResponse.json({
        success: true,
        data: response,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("AI API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
