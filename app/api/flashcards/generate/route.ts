import { createClient } from "@/utils/supabase/server"
import { GoogleGenAI } from "@google/genai"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * POST /api/flashcards/generate
 * Generates flashcards using Gemini AI based on a topic or raw text.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const { topic, text, count = 10 } = await request.json()

    if (!topic && !text) {
      return new Response(JSON.stringify({ error: "Missing topic or text content" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    const ai = new GoogleGenAI({ apiKey })

    let prompt = ""
    if (text) {
      prompt = `Generate exactly ${count} flashcards extracted from the following text/notes. Focus on key concepts, definitions, and important facts.
      
Text:
"""
${text}
"""
`
    } else {
      prompt = `Generate exactly ${count} educational flashcards for studying the topic: "${topic}". Include a mix of fundamental concepts and intermediate questions.`
    }

    const systemInstruction = `You are an expert educator creating effective flashcards.
Your output MUST be a valid JSON array of objects.
Do not include markdown blocks like \`\`\`json. Just the raw JSON array.
Each object must have exactly two string properties: "question" and "answer".
Keep answers concise (1-3 sentences maximum).
Example output:
[
  {"question": "What is the powerhouse of the cell?", "answer": "The mitochondria."}
]`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 2000,
      },
    })

    const rawText = response.text || "[]"
    
    // Clean up potential markdown formatting from the response
    let jsonStr = rawText.trim()
    if (jsonStr.startsWith("\`\`\`json")) {
      jsonStr = jsonStr.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim()
    } else if (jsonStr.startsWith("\`\`\`")) {
      jsonStr = jsonStr.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim()
    }

    let cards = []
    try {
      cards = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", jsonStr)
      // Attempt to extract array from string using regex as fallback
      const match = rawText.match(/\[([\s\S]*)\]/)
      if (match) {
        try {
          cards = JSON.parse(`[${match[1]}]`)
        } catch (e) {
             return new Response(JSON.stringify({ error: "Failed to parse AI response into valid flashcards." }), { status: 500, headers: { "Content-Type": "application/json" } })
        }
      } else {
        return new Response(JSON.stringify({ error: "Failed to parse AI response into valid flashcards." }), { status: 500, headers: { "Content-Type": "application/json" } })
      }
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return new Response(JSON.stringify({ error: "AI did not return any flashcards." }), { status: 500, headers: { "Content-Type": "application/json" } })
    }

    // Track AI usage (bonus)
    try {
      await (supabase.rpc as any)('increment_ai_requests', { user_id: user.id })
    } catch (e) {
      // ignore
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: { cards } 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error("Flashcard Generation Error:", error)
    return new Response(JSON.stringify({ error: error.message || "Failed to generate flashcards" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
