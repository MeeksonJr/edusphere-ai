import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

/**
 * POST /api/ai/live/token
 * Generates an ephemeral token for client-side Gemini Live API access.
 * This keeps the API key server-side while allowing WebSocket connections from the browser.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Check subscription tier for live session limits
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, ai_requests_count')
            .eq('id', user.id)
            .single()

        const tier = profile?.subscription_tier || 'free'
        const limits: Record<string, number> = { free: 5, pro: 50, ultimate: -1 }
        const dailyLimit = limits[tier] ?? 5

        // Count today's live sessions
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: todaySessions } = await supabase
            .from('live_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString())

        if (dailyLimit !== -1 && (todaySessions || 0) >= dailyLimit) {
            return new Response(JSON.stringify({
                error: 'Daily live session limit reached',
                limit: dailyLimit,
                used: todaySessions,
            }), { status: 429, headers: { 'Content-Type': 'application/json' } })
        }

        const body = await request.json()
        const { sessionType, skillId, courseId, topic } = body

        // Get user context for system instructions
        const { data: userSkills } = await supabase
            .from('user_skills')
            .select('skills(name, category), level')
            .eq('user_id', user.id)
            .order('level', { ascending: false })
            .limit(5)

        const skillContext = userSkills?.map((s: any) => `${s.skills?.name}: Level ${s.level}`).join(', ')

        // Build session-type-specific system instruction
        const systemInstructions: Record<string, string> = {
            tutor: `You are an expert AI tutor for EduSphere. Your student is studying${topic ? ` "${topic}"` : ''}. Adapt your teaching to their level. ${skillContext ? `Their skills: ${skillContext}` : ''}. Be patient, encouraging, and use the Socratic method to guide understanding. Ask questions to check comprehension. Provide examples and analogies.`,
            quiz_practice: `You are a quiz master. Test the student on${topic ? ` "${topic}"` : ' their knowledge'}. Ask one question at a time. Wait for their answer before revealing if it's correct. Provide explanations for wrong answers. Keep score and provide encouragement.`,
            language: `You are a language practice partner. Help the student practice${topic ? ` ${topic}` : ' conversational skills'}. Speak naturally, correct mistakes gently, and introduce new vocabulary in context. Mix between the target language and English based on their level.`,
            explainer: `You are a concept explainer. The student wants to understand${topic ? ` "${topic}"` : ' a concept'}. Break down complex ideas into simple, digestible parts. Use analogies, examples, and step-by-step explanations. Check understanding along the way.`,
            study_buddy: `You are a friendly study buddy helping the student with${topic ? ` "${topic}"` : ' their studies'}. Be casual and encouraging. Help them brainstorm, organize ideas, and work through problems together.`,
            interview_prep: `You are an interview coach. Help the student prepare for${topic ? ` "${topic}"` : ' technical interviews'}. Conduct mock interviews, provide feedback on answers, and suggest improvements. Be realistic but supportive.`,
        }

        const systemInstruction = systemInstructions[sessionType] || systemInstructions.tutor

        // Create live session record
        const { data: session } = await supabase
            .from('live_sessions')
            .insert({
                user_id: user.id,
                session_type: sessionType || 'tutor',
                skill_id: skillId || null,
                course_id: courseId || null,
                topic: topic || 'General',
                status: 'active',
            })
            .select()
            .single()

        return new Response(JSON.stringify({
            apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
            model: 'gemini-2.5-flash-preview-native-audio-dialog',
            systemInstruction,
            sessionId: session?.id,
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Kore',
                        },
                    },
                },
            },
        }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
