import { createClient } from '@/utils/supabase/server'
import { generateAIResponse } from '@/lib/ai-service'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/ai/live/[id]/actions
 * Session actions: generate_flashcards, save_notes, export_markdown
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient() as any
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return new Response('Unauthorized', { status: 401 })

        const { action } = await request.json()

        // Get the session with transcript and feedback
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
        const feedback = session.feedback || {}
        const topic = session.topic || 'General Study'

        if (transcript.length === 0) {
            return Response.json({ error: 'No transcript available' }, { status: 400 })
        }

        // Format transcript text for AI prompts
        const transcriptText = transcript
            .filter((e: any) => e.role !== 'system')
            .map((e: any) => `${e.role === 'ai' ? 'Tutor' : 'Student'}: ${e.text}`)
            .join('\n')

        switch (action) {
            case 'generate_flashcards':
                return await handleGenerateFlashcards(supabase, user.id, session, topic, transcriptText, feedback)

            case 'save_notes':
                return await handleSaveNotes(supabase, user.id, session, topic, transcriptText, feedback)

            case 'export_markdown':
                return handleExportMarkdown(session, topic, transcript, feedback)

            default:
                return Response.json({ error: `Unknown action: ${action}` }, { status: 400 })
        }
    } catch (error: any) {
        console.error('[Session Action] Error:', error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}

/**
 * Generate flashcards from session content → flashcard_sets table
 */
async function handleGenerateFlashcards(
    supabase: any,
    userId: string,
    session: any,
    topic: string,
    transcriptText: string,
    feedback: any
) {
    const keyConceptsHint = feedback.key_concepts?.length
        ? `\nKey concepts to focus on: ${feedback.key_concepts.join(', ')}`
        : ''

    const prompt = `Based on this tutoring session transcript, generate 8-12 high-quality flashcards that test the key concepts discussed.

Topic: ${topic}
Session type: ${session.session_type}${keyConceptsHint}

Transcript:
${transcriptText.slice(0, 6000)}

Generate flashcards as a JSON array:
[{"question": "...", "answer": "..."}]

Rules:
- Focus on the most important concepts, definitions, and relationships discussed
- Questions should test understanding, not just recall
- Answers should be concise but complete (1-3 sentences)
- Cover different difficulty levels
- Respond ONLY with the JSON array, no other text`

    const result = await generateAIResponse({
        provider: process.env.GROQ_API_KEY ? 'groq' : 'gemini',
        prompt,
        systemPrompt: 'You are an expert flashcard creator. Generate high-quality study flashcards. Respond only with a JSON array.',
        temperature: 0.4,
        maxTokens: 2048,
    })

    let cards: { question: string; answer: string }[] = []
    try {
        const cleaned = result.text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonStr = cleaned.match(/\[[\s\S]*\]/)?.[0] || '[]'
        cards = JSON.parse(jsonStr)
    } catch {
        return Response.json({ error: 'Failed to parse generated flashcards' }, { status: 500 })
    }

    if (cards.length === 0) {
        return Response.json({ error: 'No flashcards could be generated from this session' }, { status: 400 })
    }

    // Insert into flashcard_sets table
    const sessionDate = new Date(session.created_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })

    const { data: flashcardSet, error } = await supabase
        .from('flashcard_sets')
        .insert({
            user_id: userId,
            title: `${topic} — AI Tutor Session`,
            description: `Generated from AI Tutor session on ${sessionDate}. ${cards.length} cards covering key concepts discussed.`,
            subject: topic,
            cards,
        })
        .select()
        .single()

    if (error) {
        console.error('[Flashcards] Insert error:', error)
        return Response.json({ error: 'Failed to save flashcard set' }, { status: 500 })
    }

    return Response.json({
        success: true,
        flashcard_set_id: flashcardSet.id,
        card_count: cards.length,
        message: `Created ${cards.length} flashcards`,
    })
}

/**
 * Save structured study notes from session → study_resources table
 */
async function handleSaveNotes(
    supabase: any,
    userId: string,
    session: any,
    topic: string,
    transcriptText: string,
    feedback: any
) {
    const analysisContext = feedback.summary
        ? `\nSession Summary: ${feedback.summary}\nKey Concepts: ${(feedback.key_concepts || []).join(', ')}\nAreas to Improve: ${(feedback.areas_to_improve || []).join(', ')}`
        : ''

    const prompt = `Create comprehensive study notes from this tutoring session. Format as clean Markdown.

Topic: ${topic}
Session type: ${session.session_type}${analysisContext}

Transcript:
${transcriptText.slice(0, 6000)}

Structure the notes as:
# ${topic} — Study Notes

## Key Concepts
(Main ideas discussed, with clear explanations)

## Important Details
(Specific facts, formulas, definitions, or examples mentioned)

## Common Mistakes to Avoid
(Pitfalls or misconceptions addressed in the session)

## Study Tips
(Practical advice from the tutor)

## Summary
(2-3 sentence recap)

Write clear, organized, student-friendly notes. Use bullet points and sub-headers for readability.`

    const result = await generateAIResponse({
        provider: process.env.GROQ_API_KEY ? 'groq' : 'gemini',
        prompt,
        systemPrompt: 'You are an expert note-taker who creates clear, structured study notes from tutoring sessions. Use Markdown formatting.',
        temperature: 0.3,
        maxTokens: 3000,
    })

    const noteContent = result.text.trim()
    if (!noteContent || noteContent.length < 50) {
        return Response.json({ error: 'Failed to generate meaningful notes' }, { status: 500 })
    }

    // Build tags from analysis topics
    const tags = [
        'ai-tutor',
        ...(feedback.topics_covered || []).slice(0, 5),
    ]

    const { data: resource, error } = await supabase
        .from('study_resources')
        .insert({
            user_id: userId,
            title: `${topic} — Session Notes`,
            description: `Study notes from AI Tutor session (${session.session_type})`,
            subject: topic,
            content: noteContent,
            resource_type: 'notes',
            tags,
            ai_generated: true,
        })
        .select()
        .single()

    if (error) {
        console.error('[Notes] Insert error:', error)
        return Response.json({ error: 'Failed to save study notes' }, { status: 500 })
    }

    return Response.json({
        success: true,
        resource_id: resource.id,
        message: 'Study notes saved',
    })
}

/**
 * Export session as Markdown (returns content, no DB write)
 */
function handleExportMarkdown(
    session: any,
    topic: string,
    transcript: any[],
    feedback: any
) {
    const sessionDate = new Date(session.created_at).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })
    const duration = session.duration_seconds
        ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
        : 'Unknown'

    let md = `# ${topic} — AI Tutor Session\n\n`
    md += `**Date:** ${sessionDate}  \n`
    md += `**Duration:** ${duration}  \n`
    md += `**Type:** ${session.session_type}  \n`
    if (session.xp_earned) md += `**XP Earned:** ${session.xp_earned}  \n`
    md += `\n---\n\n`

    // Analysis section
    if (feedback.summary) {
        md += `## AI Analysis\n\n`
        md += `${feedback.summary}\n\n`

        if (feedback.key_concepts?.length) {
            md += `### Key Concepts\n`
            feedback.key_concepts.forEach((c: string) => { md += `- ${c}\n` })
            md += `\n`
        }
        if (feedback.strengths?.length) {
            md += `### Strengths\n`
            feedback.strengths.forEach((s: string) => { md += `- ✅ ${s}\n` })
            md += `\n`
        }
        if (feedback.areas_to_improve?.length) {
            md += `### Areas to Improve\n`
            feedback.areas_to_improve.forEach((a: string) => { md += `- 📌 ${a}\n` })
            md += `\n`
        }
        if (feedback.suggested_next_steps?.length) {
            md += `### Next Steps\n`
            feedback.suggested_next_steps.forEach((n: string) => { md += `- → ${n}\n` })
            md += `\n`
        }

        if (feedback.engagement_score || feedback.comprehension_score) {
            md += `### Scores\n`
            if (feedback.engagement_score) md += `- Engagement: ${feedback.engagement_score}/100\n`
            if (feedback.comprehension_score) md += `- Comprehension: ${feedback.comprehension_score}/100\n`
            md += `\n`
        }

        md += `---\n\n`
    }

    // Transcript
    md += `## Transcript\n\n`
    transcript.forEach((entry: any) => {
        const role = entry.role === 'ai' ? '🤖 **AI Tutor**' : entry.role === 'user' ? '👤 **You**' : '📌 *System*'
        const time = entry.timestamp ? ` *(${new Date(entry.timestamp).toLocaleTimeString()})*` : ''
        md += `${role}${time}:\n> ${entry.text}\n\n`
    })

    return Response.json({
        success: true,
        content: md,
        filename: `${topic.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-session-${session.id.slice(0, 8)}.md`,
    })
}
