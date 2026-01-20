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
      
      // Try the requested provider first, with fallbacks
      let response
      let lastError: any = null
      
      const providersToTry = provider 
        ? [provider, "gemini", "huggingface"]
        : process.env.GROQ_API_KEY 
        ? ["groq", "gemini", "huggingface"]
        : process.env.GEMINI_API_KEY
        ? ["gemini", "huggingface"]
        : ["huggingface"]
      
      for (const providerToTry of providersToTry) {
        try {
          response = await generateAIResponse({
            provider: providerToTry as any,
            prompt,
            systemPrompt,
            temperature: temperature || 0.7,
            maxTokens: maxTokens || 2000,
          })
          break // Success, exit loop
        } catch (error: any) {
          console.error(`${providerToTry} generation error:`, error.message)
          lastError = error
          continue // Try next provider
        }
      }
      
      if (!response) {
        throw new Error(`All AI providers failed. Last error: ${lastError?.message || "Unknown error"}`)
      }

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
