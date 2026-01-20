import { NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 10 // Vercel API route timeout (10 seconds)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    if (action === "generateAIResponse") {
      const { provider, prompt, systemPrompt, temperature, maxTokens } = params
      
      // Optimize for speed - reduce tokens for faster responses
      const optimizedMaxTokens = Math.min(maxTokens || 1500, 1500) // Cap at 1500 for speed
      
      // Try providers in order of speed (fastest first)
      // Groq is fastest, then Gemini, then Hugging Face
      let response
      let lastError: any = null
      
      // Determine provider order based on availability
      const hasGroq = !!process.env.GROQ_API_KEY
      const hasGemini = !!process.env.GEMINI_API_KEY
      const hasHuggingFace = !!process.env.HUGGING_FACE_API_KEY
      
      const providersToTry: string[] = []
      
      if (provider) {
        // Use requested provider first
        providersToTry.push(provider)
      }
      
      // Add available providers in speed order
      if (hasGroq && provider !== "groq") providersToTry.push("groq")
      if (hasGemini && provider !== "gemini") providersToTry.push("gemini")
      if (hasHuggingFace && provider !== "huggingface") providersToTry.push("huggingface")
      
      // If no providers available, return error early
      if (providersToTry.length === 0) {
        return NextResponse.json(
          { error: "No AI providers configured. Please set at least one API key." },
          { status: 500 }
        )
      }
      
      // Try each provider with timeout protection
      for (const providerToTry of providersToTry) {
        try {
          console.log(`Trying ${providerToTry}...`)
          
          // Create a timeout promise (8 seconds max per provider to avoid Vercel timeout)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Request timeout")), 8000)
          })
          
          const aiPromise = generateAIResponse({
            provider: providerToTry as any,
            prompt,
            systemPrompt,
            temperature: temperature || 0.7,
            maxTokens: optimizedMaxTokens,
          })
          
          // Race between AI call and timeout
          response = await Promise.race([aiPromise, timeoutPromise]) as any
          
          if (response) {
            console.log(`${providerToTry} succeeded`)
            break // Success, exit loop
          }
        } catch (error: any) {
          console.error(`${providerToTry} generation error:`, error.message)
          lastError = error
          
          // If it's a 503 (overloaded) or timeout, try next provider immediately
          if (error.status === 503 || error.message?.includes("timeout") || error.message?.includes("overloaded")) {
            console.log(`${providerToTry} failed (overloaded/timeout), trying next provider...`)
            continue
          }
          
          // For other errors, also try next provider
          continue
        }
      }
      
      if (!response) {
        return NextResponse.json(
          { 
            error: "All AI providers failed or timed out. Please try again in a moment.",
            details: lastError?.message || "Unknown error"
          },
          { status: 503 }
        )
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
