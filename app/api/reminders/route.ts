import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Fetch user's courses to see what they are studying
        const { data: courses } = await (supabase.from("courses") as any).select("title, description, progress").eq("user_id", user.id)
        
        // Fetch upcoming assignments
        const { data: assignments } = await (supabase.from("assignments") as any).select("title, due_date, status, course:course_id(title)").eq("user_id", user.id)

        // Build a prompt for Gemini
        let userContext = `I need a suggested study schedule for the next few days. Keep it concise, format it beautifully with emojis, and make it actionable.\n\n`
        
        if (courses && courses.length > 0) {
            userContext += `Here are the courses I'm taking:\n${courses.map((c: any) => `- ${c.title} (${c.progress}% done)`).join("\n")}\n\n`
        }

        if (assignments && assignments.length > 0) {
            const pending = assignments.filter((a: any) => a.status !== "completed")
            if (pending.length > 0) {
                userContext += `Here are my upcoming assignments:\n${pending.map((a: any) => `- ${a.title} (due: ${a.due_date || 'soon'})`).join("\n")}\n\n`
            }
        }

        if ((!courses || courses.length === 0) && (!assignments || assignments.length === 0)) {
            userContext += `I haven't added any specific courses or assignments yet. Please suggest a general, healthy daily study routine for a student.`
        } else {
            userContext += `Based on these courses and assignments, please suggest a smart study plan. Break down the next 3 days. Recommend specific times to use the Pomodoro technique.`
        }

        // Call Gemini
        const systemPrompt = `You are EduSphere AI, an expert academic advisor and time management coach. You help students build highly effective, realistic study schedules.`
        const aiResponse = await generateAIResponse({ prompt: userContext, systemPrompt, provider: 'gemini' })

        return NextResponse.json({ schedule: aiResponse.text })
    } catch (error: any) {
        console.error("Smart Reminders GET error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
