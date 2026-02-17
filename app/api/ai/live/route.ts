import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'

/**
 * GET /api/ai/live
 * Lists session history for the authenticated user.
 */
export async function GET() {
    try {
        const supabase = await createClient() as any
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401, headers: { 'Content-Type': 'application/json' },
            })
        }

        const { data, error } = await supabase
            .from('live_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) throw error

        return new Response(JSON.stringify(data || []), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message || 'Failed to fetch sessions' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        })
    }
}
// gemini-2.5-flash-native-audio-preview-12-2025
/**
 * POST /api/ai/live
 * Generates an ephemeral token for client-side Gemini Live API access.
 * The API key stays server-side; clients connect with a short-lived token.
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new Response('Unauthorized', { status: 401 })
        }

        // Check subscription tier for rate limits
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
        const { sessionType, topic, continuedFrom } = body

        // Get user context for system instructions
        const { data: userSkills } = await supabase
            .from('user_skills')
            .select('skills(name, category), level')
            .eq('user_id', user.id)
            .order('level', { ascending: false })
            .limit(5)

        const skillContext = userSkills?.map((s: any) => `${s.skills?.name}: Level ${s.level}`).join(', ')

        // Load past session for continuation
        let continuationContext = ''
        if (continuedFrom) {
            const { data: pastSession } = await supabase
                .from('live_sessions')
                .select('topic, session_type, transcript, feedback')
                .eq('id', continuedFrom)
                .eq('user_id', user.id)
                .single()

            if (pastSession) {
                const pastSummary = pastSession.feedback?.summary || ''
                const pastTranscript = (pastSession.transcript || [])
                    .slice(-10) // Last 10 messages for context
                    .map((t: any) => `${t.role === 'ai' ? 'AI' : 'Student'}: ${t.text}`)
                    .join('\n')
                continuationContext = `\n\nIMPORTANT: This is a continuation of a previous session about "${pastSession.topic}".${pastSummary ? ` Previous session summary: ${pastSummary}` : ''}${pastTranscript ? `\n\nRecent conversation from last session:\n${pastTranscript}\n\nPick up naturally from where you left off.` : ''}`
            }
        }

        // Build system instruction based on session type
        const systemInstructions: Record<string, string> = {
            tutor: `You are an expert AI tutor for EduSphere. Your student is studying${topic ? ` "${topic}"` : ''}. Adapt your teaching to their level. ${skillContext ? `Their skills: ${skillContext}` : ''}. Be patient, encouraging, and use the Socratic method. Ask questions to check understanding. Provide examples and analogies.`,
            quiz_practice: `You are a quiz master. Test the student on${topic ? ` "${topic}"` : ' their knowledge'}. Ask one question at a time. Wait for their answer. Provide explanations for wrong answers. Keep score.`,
            language: `You are a language practice partner. Help the student practice${topic ? ` ${topic}` : ' conversational skills'}. Speak naturally, correct mistakes gently. Mix languages based on their level.`,
            explainer: `You are a concept explainer. Break down${topic ? ` "${topic}"` : ' complex ideas'} into simple, digestible parts. Use analogies and step-by-step explanations.`,
            study_buddy: `You are a friendly study buddy helping with${topic ? ` "${topic}"` : ' studies'}. Be casual and encouraging. Help brainstorm and work through problems.`,
            interview_prep: `You are an interview coach preparing the student for${topic ? ` "${topic}"` : ' technical interviews'}. Conduct mock interviews, give feedback. Be realistic but supportive.`,
        }

        const systemInstruction = (systemInstructions[sessionType] || systemInstructions.tutor) + continuationContext

        // Generate ephemeral token using the Gemini SDK
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
                status: 500, headers: { 'Content-Type': 'application/json' },
            })
        }

        const ai = new GoogleGenAI({ apiKey })

        const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        const newSessionExpireTime = new Date(Date.now() + 2 * 60 * 1000).toISOString()

        const token = await ai.authTokens.create({
            config: {
                uses: 1,
                expireTime,
                newSessionExpireTime,
                httpOptions: { apiVersion: 'v1alpha' },
            },
        })

        // Log session with continuation link
        const { data: session } = await supabase
            .from('live_sessions')
            .insert({
                user_id: user.id,
                session_type: sessionType || 'tutor',
                topic: topic || 'General',
                status: 'active',
                feedback: continuedFrom ? { continued_from: continuedFrom } : {},
            })
            .select('id')
            .single()

        return new Response(JSON.stringify({
            token: token.name,
            model: LIVE_MODEL,
            systemInstruction,
            sessionId: session?.id,
        }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error: any) {
        console.error('[Live API] Token creation error:', error)
        return new Response(JSON.stringify({
            error: error.message || 'Failed to create session token',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
