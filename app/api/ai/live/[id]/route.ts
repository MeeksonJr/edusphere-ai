import { createClient } from '@/utils/supabase/server'
import { generateAIResponse } from '@/lib/ai-service'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/ai/live/[id]
 * Fetch a single session by ID (for the detail/review page)
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { data: session, error } = await supabase
            .from('live_sessions')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error || !session) {
            return Response.json({ error: 'Session not found' }, { status: 404 })
        }

        return Response.json(session)
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/ai/live/[id]
 * Update session: save transcript, duration, feedback, rating, mark completed
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new Response('Unauthorized', { status: 401 })

        const body = await request.json()
        const updates: Record<string, any> = {}

        if (body.transcript !== undefined) updates.transcript = body.transcript
        if (body.duration_seconds !== undefined) updates.duration_seconds = body.duration_seconds
        if (body.quality_rating !== undefined) updates.quality_rating = body.quality_rating
        if (body.feedback !== undefined) updates.feedback = body.feedback
        if (body.xp_earned !== undefined) updates.xp_earned = body.xp_earned
        if (body.status !== undefined) updates.status = body.status
        if (body.status === 'completed') updates.ended_at = new Date().toISOString()

        const { data: session, error } = await supabase
            .from('live_sessions')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single()

        if (error) {
            return Response.json({ error: error.message }, { status: 400 })
        }

        return Response.json(session)
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/ai/live/[id]
 * Generate AI summary/feedback from a session's transcript
 * Uses Groq first (fast, reliable), falls back to Gemini
 */
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new Response('Unauthorized', { status: 401 })

        // Get the session
        const { data: session } = await supabase
            .from('live_sessions')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (!session) {
            return Response.json({ error: 'Session not found' }, { status: 404 })
        }

        const transcript = session.transcript || []
        if (transcript.length === 0) {
            return Response.json({ error: 'No transcript to analyze' }, { status: 400 })
        }

        // Format transcript for analysis
        const transcriptText = transcript
            .map((entry: any) => `${entry.role === 'ai' ? 'AI' : entry.role === 'user' ? 'Student' : 'System'}: ${entry.text}`)
            .join('\n')

        const analysisPrompt = `Analyze this tutoring session transcript and provide a JSON response with the following structure:
{
  "summary": "2-3 sentence summary of what was discussed",
  "topics_covered": ["topic1", "topic2"],
  "strengths": ["thing the student did well 1", "thing 2"],
  "areas_to_improve": ["area 1", "area 2"],
  "key_concepts": ["concept 1", "concept 2"],
  "suggested_next_steps": ["next step 1", "next step 2"],
  "engagement_score": 85,
  "comprehension_score": 75
}

Session type: ${session.session_type}
Topic: ${session.topic}
Duration: ${session.duration_seconds} seconds

Transcript:
${transcriptText}

Respond ONLY with valid JSON, no markdown formatting.`

        // Try Groq first (fast, reliable), then Gemini as fallback
        const providersToTry: Array<'groq' | 'gemini'> = []
        if (process.env.GROQ_API_KEY) providersToTry.push('groq')
        if (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY) providersToTry.push('gemini')

        let responseText = ''
        let lastError: any = null

        for (const provider of providersToTry) {
            try {
                console.log(`[Session Analysis] Trying ${provider}...`)
                const result = await generateAIResponse({
                    provider,
                    prompt: analysisPrompt,
                    systemPrompt: 'You are an educational AI assistant that analyzes tutoring sessions. Always respond with valid JSON only.',
                    temperature: 0.3,
                    maxTokens: 2048,
                })
                responseText = result.text.trim()
                console.log(`[Session Analysis] Success with ${provider} (${result.model})`)
                break
            } catch (err: any) {
                console.warn(`[Session Analysis] ${provider} failed:`, err.message)
                lastError = err
                continue
            }
        }

        if (!responseText) {
            const errorMsg = lastError?.message || 'All AI providers failed'
            console.error('[Session Analysis] All providers failed:', errorMsg)
            return Response.json({
                error: 'AI analysis temporarily unavailable. Please try again later.',
                retryable: true,
            }, { status: 503 })
        }

        let feedback: any
        try {
            // Strip markdown code fences if present
            const cleaned = responseText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
            feedback = JSON.parse(cleaned)
        } catch {
            feedback = {
                summary: responseText.slice(0, 500),
                topics_covered: [session.topic || 'General'],
                strengths: [],
                areas_to_improve: [],
                key_concepts: [],
                suggested_next_steps: [],
                engagement_score: 70,
                comprehension_score: 70,
            }
        }

        // Save continued_from if it existed
        if (session.feedback?.continued_from) {
            feedback.continued_from = session.feedback.continued_from
        }

        // Calculate XP: base 20 + 5 per minute (max 100)
        const minutes = Math.floor((session.duration_seconds || 0) / 60)
        const xpEarned = Math.min(100, 20 + minutes * 5)

        // Update the session with feedback and XP
        await supabase
            .from('live_sessions')
            .update({
                feedback,
                xp_earned: xpEarned,
                status: 'completed',
                ended_at: session.ended_at || new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', user.id)

        return Response.json({ feedback, xp_earned: xpEarned })
    } catch (error: any) {
        console.error('[Session Analysis] Error:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
