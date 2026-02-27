import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface ConversationMessage {
    role: "user" | "assistant"
    content: string
}

const SESSION_PROMPTS: Record<string, string> = {
    tutor: `You are a patient, encouraging 1-on-1 AI tutor. Adapt your explanations to the student's level.
Ask follow-up questions to check understanding. Use analogies and examples. Keep responses concise (2-3 sentences for spoken delivery).
If the student seems confused, try explaining from a different angle.`,

    quiz_practice: `You are a quiz master. Generate questions on the topic and evaluate answers.
Give immediate feedback. Keep questions at an appropriate difficulty level.
Provide hints if the student struggles. Track their progress and adjust difficulty. Keep responses short for voice.`,

    language: `You are a friendly language practice partner. Speak naturally in the target language.
Correct grammar gently and suggest better phrasing. Mix in vocabulary lessons naturally.
Adapt to the student's proficiency level. Keep responses conversational and short.`,

    explainer: `You are a concept explainer who breaks down complex topics into simple terms.
Use analogies, metaphors, and real-world examples. Build understanding step by step.
Check comprehension along the way with quick questions. Keep explanations brief for voice delivery.`,

    study_buddy: `You are a casual, supportive study companion. Help the student review material,
make connections between concepts, and stay motivated. Be encouraging and friendly.
Ask questions to help them think critically. Keep responses conversational.`,

    interview_prep: `You are a professional interviewer conducting a mock interview.
Ask relevant questions, evaluate responses, and provide constructive feedback.
Mix behavioral and technical questions. After each answer, give brief coaching tips. Stay professional but encouraging.`,
}

/**
 * POST /api/ai/voice — Process a voice conversation turn
 * Body: { message, sessionType, history[] }
 * Returns: { reply, tokensUsed }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const {
            message,
            sessionType = "tutor",
            history = [],
            topic,
        } = body as {
            message: string
            sessionType: string
            history: ConversationMessage[]
            topic?: string
        }

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            )
        }

        // Build system prompt
        const systemPrompt =
            SESSION_PROMPTS[sessionType] || SESSION_PROMPTS.tutor

        const topicContext = topic ? `\nCurrent topic: ${topic}` : ""

        // Build conversation context (last 10 messages max for token efficiency)
        const recentHistory = history.slice(-10)
        const contextMessages = recentHistory
            .map(
                (m) =>
                    `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`
            )
            .join("\n")

        const fullPrompt = contextMessages
            ? `${contextMessages}\nStudent: ${message}\nTutor:`
            : `Student: ${message}\nTutor:`

        // Generate response via Gemini
        const response = await generateAIResponse({
            provider: "gemini",
            prompt: fullPrompt,
            systemPrompt: `${systemPrompt}${topicContext}\n\nIMPORTANT: Keep your responses concise (2-3 sentences maximum) since they will be read aloud via text-to-speech. Be natural and conversational.`,
            temperature: 0.8,
            maxTokens: 256, // Short responses for voice
        })

        return NextResponse.json({
            reply: response.text.trim(),
            provider: response.provider,
        })
    } catch (error: any) {
        console.error("Voice tutor API error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to generate response" },
            { status: 500 }
        )
    }
}
