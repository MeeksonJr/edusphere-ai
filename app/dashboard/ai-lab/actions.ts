"use server"

import { createClient } from "@/utils/supabase/server"
import { trackAIUsage, answerQuestion } from "@/lib/ai-service"

export async function getExplanationAction(prompt: string) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error("You must be logged in to use the AI Lab")
        }

        // Initialize trackAIUsage with the server client
        await trackAIUsage(supabase, user.id)

        const explanation = await answerQuestion(prompt)

        return { success: true, explanation }
    } catch (error: any) {
        console.error("AI Explanation Error:", error)
        return { success: false, error: error.message || "Failed to generate explanation" }
    }
}
