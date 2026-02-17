import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/ai/stream
 * Server-Sent Events endpoint for streaming AI text responses.
 * Provides ChatGPT-like typing effect.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await request.json()
        const { prompt, context, systemInstructions, model: modelName } = body

        if (!prompt) {
            return new Response('Missing prompt', { status: 400 })
        }

        // Get user profile for context-aware prompting
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, subscription_tier, learning_goals, level, total_xp')
            .eq('id', user.id)
            .single()

        // Get user skills for context
        const { data: userSkills } = await supabase
            .from('user_skills')
            .select('skills(name, category), level, mastery_score')
            .eq('user_id', user.id)
            .order('level', { ascending: false })
            .limit(10)

        // Build context-aware system prompt
        const skillsSummary = userSkills?.length
            ? `Student's top skills: ${userSkills.map((s: any) => `${s.skills?.name} (Level ${s.level})`).join(', ')}`
            : ''

        const goalsSummary = profile?.learning_goals?.length
            ? `Learning goals: ${profile.learning_goals.join(', ')}`
            : ''

        const systemPrompt = [
            systemInstructions || 'You are EduSphere AI, an expert educational assistant. Provide clear, detailed, and engaging responses. Use markdown formatting for better readability.',
            `Student name: ${profile?.full_name || 'Student'}`,
            `Level: ${profile?.level || 1} (${profile?.total_xp || 0} XP)`,
            skillsSummary,
            goalsSummary,
            context || '',
        ].filter(Boolean).join('\n')

        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!apiKey) {
            return new Response('AI service not configured', { status: 500 })
        }

        const ai = new GoogleGenAI({ apiKey })

        // Use streaming
        const selectedModel = modelName || 'gemini-2.5-flash-preview-05-20'

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await ai.models.generateContentStream({
                        model: selectedModel,
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        config: {
                            systemInstruction: systemPrompt,
                            temperature: 0.7,
                            maxOutputTokens: 4096,
                        },
                    })

                    for await (const chunk of response) {
                        const text = chunk.text || ''
                        if (text) {
                            const data = JSON.stringify({ text, done: false })
                            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
                        }
                    }

                    // Signal completion
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: '', done: true })}\n\n`))
                    controller.close()

                    // Track AI usage
                    await supabase.rpc('increment_ai_requests', { user_id: user.id }).catch(() => {
                        // Fallback: direct update
                        supabase
                            .from('profiles')
                            .update({ ai_requests_count: (profile?.ai_requests_count || 0) + 1 })
                            .eq('id', user.id)
                    })
                } catch (error: any) {
                    const errorData = JSON.stringify({ error: error.message || 'AI generation failed', done: true })
                    controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
                    controller.close()
                }
            },
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
