import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { assignment_title, assignment_description, max_points, student_submission } = await request.json()

    if (!student_submission) {
      return NextResponse.json({ error: "Student submission is required" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI grading is not configured" }, { status: 500 })
    }

    const prompt = `You are an experienced educator grading a student's assignment. Be fair and constructive.

**Assignment:** ${assignment_title || "Untitled"}
**Instructions:** ${assignment_description || "No description provided."}
**Max Points:** ${max_points || 100}

**Student's Submission:**
${student_submission}

Please grade this submission. Respond in EXACTLY this JSON format:
{
  "score": <number between 0 and ${max_points || 100}>,
  "feedback": "<constructive feedback explaining the grade, what was done well, and areas for improvement>"
}

Be thorough but concise in your feedback (2-4 sentences). Only respond with the JSON object, nothing else.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 512,
          },
        }),
      }
    )

    if (!res.ok) {
      const errData = await res.json()
      console.error("Gemini error:", errData)
      return NextResponse.json({ error: "AI grading failed" }, { status: 502 })
    }

    const data = await res.json()
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 502 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    const score = Math.min(Math.max(0, Math.round(parsed.score)), max_points || 100)

    return NextResponse.json({
      score,
      feedback: parsed.feedback || "No feedback provided.",
    })
  } catch (err: any) {
    console.error("Auto-grade error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
