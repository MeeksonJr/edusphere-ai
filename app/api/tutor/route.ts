import { createClient } from "@/utils/supabase/server"
import { GoogleGenAI } from "@google/genai"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * POST /api/tutor
 * Endpoint for the AI Study Tutor persistent widget.
 * Streams response from Gemini and saves message history to ai_tutor_chats.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { message, sessionId, context } = await request.json()

    if (!message || !sessionId) {
      return new Response("Missing message or session id", { status: 400 })
    }

    // Save User message to DB
    await supabase.from("ai_tutor_chats" as any).insert({
      user_id: user.id,
      session_id: sessionId,
      message_role: "user",
      content: message,
    })

    // Get previous chat history for the session
    const { data: historyData } = await supabase
      .from("ai_tutor_chats" as any)
      .select("message_role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20)
    
    const history = historyData as any[] | null

    // Build the history for Gemini
    const contents: any[] = []
    if (history) {
      for (const h of history) {
        contents.push({
          role: h.message_role === "user" ? "user" : "model",
          parts: [{ text: h.content || "..." }],
        })
      }
    } else {
      contents.push({ role: "user", parts: [{ text: message }] })
    }

    // Get user profile for context-aware prompting
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, subscription_tier, learning_goals, level, total_xp, ai_requests_count")
      .eq("id", user.id)
      .single()
      
    const profile = profileData as any

    const systemPrompt = [
      "You are EduSphere AI, an expert, persistent educational assistant.",
      "You guide the student through subjects using Socratic questioning when appropriate.",
      "Provide clear, encouraging, and detailed responses. Format with markdown.",
      `Student name: ${profile?.full_name || "Student"}`,
      `Context: ${context || "No context provided"}`
    ]
      .filter(Boolean)
      .join("\n")

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return new Response("AI service not configured", { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 2000,
            },
          })

          let fullAIResponse = ""

          for await (const chunk of response) {
            const text = chunk.text || ""
            if (text) {
              fullAIResponse += text
              const data = JSON.stringify({ text, done: false })
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
            }
          }

          // Save AI Response to DB
          await supabase.from("ai_tutor_chats" as any).insert({
            user_id: user.id,
            session_id: sessionId,
            message_role: "assistant",
            content: fullAIResponse,
          })

          // Track AI usage
          try {
            await (supabase.rpc as any)('increment_ai_requests', { user_id: user.id })
          } catch (e) {
            // Fallback
            await supabase
              .from('profiles')
              .update({ ai_requests_count: (profile?.ai_requests_count || 0) + 1 })
              .eq('id', user.id)
          }

          // Signal completion
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ text: "", done: true })}\n\n`)
          )
          controller.close()
        } catch (error: any) {
          console.error("Gemini Error:", error)
          const errorData = JSON.stringify({
            error: error.message || "AI generation failed",
            done: true,
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
