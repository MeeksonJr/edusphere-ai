import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service"

export async function GET(req: Request) {
  try {
    const supabase = await createClient() as any
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch Assignments (Due within 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, title, subject, due_date, status, priority")
      .eq("user_id", user.id)
      .eq("status", "ongoing")
      .lte("due_date", nextWeek.toISOString())
      .order("due_date", { ascending: true })
      .limit(5)

    // 2. Fetch Learning Analytics (Areas with low mastery or high decay)
    const { data: analytics } = await supabase
      .from("learning_analytics")
      .select("topic, time_spent_minutes, mastery_score, last_studied")
      .eq("user_id", user.id)
      .order("mastery_score", { ascending: true })
      .limit(5)

    // 3. Fetch recent Flashcard sets
    const { data: flashcardSets } = await supabase
      .from("flashcard_sets")
      .select("id, title, description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    // Construct the context prompt for Gemini
    const contextLines = []

    if (assignments && assignments.length > 0) {
      contextLines.push("Upcoming Assignments:")
      assignments.forEach(a => contextLines.push(`- ${a.title} (${a.subject}), due ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}, priority: ${a.priority}`))
    }

    if (analytics && analytics.length > 0) {
      contextLines.push("\nLearning Analytics (Topics needing review):")
      analytics.forEach(a => contextLines.push(`- ${a.topic}: ${a.mastery_score}% mastery, last studied ${new Date(a.last_studied).toLocaleDateString()}`))
    }

    if (flashcardSets && flashcardSets.length > 0) {
      contextLines.push("\nAvailable Flashcard Sets:")
      flashcardSets.forEach(f => contextLines.push(`- ${f.title} (ID: ${f.id})`))
    }

    const prompt = `Based on the following student data, generate 3 highly targeted study recommendations (Learning Paths) for today.

Student Data:
${contextLines.length > 0 ? contextLines.join("\n") : "No recent activity data available. Suggest general study exploration."}

Provide the output strictly as a JSON array of objects. Use the following schema for each object:
{
  "type": "assignment" | "flashcard" | "topic" | "general",
  "title": "A short, actionable title",
  "description": "Why they should do this (e.g., 'Due in 2 days' or 'Mastery is dropping')",
  "priority": "high" | "medium" | "low",
  "actionUrl": "The URL they should go to, e.g., '/dashboard/assignments/ID' or '/dashboard/flashcards/ID'",
  "estimatedMinutes": 15
}

Return ONLY the JSON array, no markdown borders, no extra text.`

    const systemPrompt = "You are an AI study advisor. Your goal is to optimize the student's learning by prioritizing urgent deadlines and topics with low mastery using spaced repetition principles."

    const response = await generateAIResponse({
      provider: "gemini",
      prompt,
      systemPrompt,
      temperature: 0.2, // Low temperature for more deterministic/factual JSON output
    })

    try {
      // Parse the JSON array from the response
      let jsonStr = response.text.trim()
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim()
      }
      
      const recommendations = JSON.parse(jsonStr)

      // Validate basic structure
      if (!Array.isArray(recommendations)) {
        throw new Error("Response is not a JSON array")
      }

      // Track AI usage
      try {
        const { trackAIUsage } = await import("@/lib/ai-service")
        await trackAIUsage(supabase, user.id)
      } catch (trackErr) {
        console.error("Failed to track AI usage on recommendations", trackErr)
      }

      return NextResponse.json({ recommendations })
    } catch (parseError) {
      console.error("Failed to parse Gemini recommendations:", parseError, "Raw response:", response.text)
      
      // Fallback recommendations if parsing fails or no data
      return NextResponse.json({
        recommendations: [
          {
            id: "fallback-1",
            type: "general",
            title: "Review Notes",
            description: "Go over your recent class notes.",
            priority: "medium",
            actionUrl: "/dashboard/notes",
            estimatedMinutes: 20
          }
        ]
      })
    }
  } catch (error: any) {
    console.error("Error in recommendations route:", error)
    return NextResponse.json({ error: error.message || "Failed to generate recommendations" }, { status: 500 })
  }
}
