import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateAIResponse } from "@/lib/ai-service-wrapper"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

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
        const { assignmentId, content } = body

        if (!assignmentId || !content?.trim()) {
            return NextResponse.json(
                { error: "Assignment ID and submission content are required" },
                { status: 400 }
            )
        }

        // Fetch assignment details
        const { data: assignment, error: fetchError } = await (supabase as any)
            .from("assignments")
            .select("*")
            .eq("id", assignmentId)
            .eq("user_id", user.id)
            .single()

        if (fetchError || !assignment) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            )
        }

        // Build grading prompt
        const rubricText = assignment.rubric
            ? JSON.stringify(assignment.rubric, null, 2)
            : null

        const prompt = `Grade the following student submission for the assignment.

**Assignment:** ${assignment.title}
**Description:** ${assignment.description || "N/A"}
**Max Points:** ${assignment.max_points || 100}
${assignment.grading_criteria ? `**Grading Criteria:** ${assignment.grading_criteria}` : ""}
${rubricText ? `**Rubric:**\n${rubricText}` : ""}

---

**Student Submission:**
${content.substring(0, 5000)}

---

Evaluate the submission and return a JSON object with this exact structure:
{
  "grade": <number between 0 and ${assignment.max_points || 100}>,
  "percentage": <number between 0 and 100>,
  "letter_grade": "<A+, A, A-, B+, B, B-, C+, C, C-, D, F>",
  "feedback": "<2-4 paragraphs of detailed, constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<area for improvement 1>", "<area for improvement 2>", ...],
  "rubric_scores": ${rubricText ? `{<matching rubric criteria keys with individual scores>}` : "null"}
}

Be fair, thorough, and constructive. Provide specific examples from the submission in your feedback.
Return ONLY the JSON object, no markdown fences.`

        const result = await generateAIResponse({
            provider: "gemini",
            prompt,
            systemPrompt:
                "You are an expert educational grading assistant. Grade student submissions fairly and provide constructive, detailed feedback. Always respond with valid JSON only.",
            maxTokens: 2000,
            temperature: 0.3,
        })

        const responseText = result?.text || ""

        // Parse AI response
        let gradeData: any
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/)
            gradeData = JSON.parse(jsonMatch?.[0] || "{}")
        } catch {
            gradeData = {
                grade: 0,
                percentage: 0,
                letter_grade: "N/A",
                feedback: "Unable to parse grading response. Please try again.",
                strengths: [],
                improvements: [],
                rubric_scores: null,
            }
        }

        // Save submission
        const { data: submission, error: saveError } = await (supabase as any)
            .from("assignment_submissions")
            .insert({
                assignment_id: assignmentId,
                user_id: user.id,
                content: content.substring(0, 10000),
                grade: gradeData.grade || 0,
                feedback: JSON.stringify(gradeData),
                rubric_scores: gradeData.rubric_scores || null,
                graded_at: new Date().toISOString(),
            })
            .select()
            .single()

        if (saveError) {
            console.error("Failed to save submission:", saveError)
            return NextResponse.json(
                { error: "Failed to save submission" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            submission: {
                id: submission.id,
                grade: gradeData.grade,
                percentage: gradeData.percentage,
                letter_grade: gradeData.letter_grade,
                feedback: gradeData.feedback,
                strengths: gradeData.strengths,
                improvements: gradeData.improvements,
                rubric_scores: gradeData.rubric_scores,
            },
        })
    } catch (error: any) {
        console.error("Grading API error:", error)
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
