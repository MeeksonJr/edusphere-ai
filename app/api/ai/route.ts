import { NextRequest, NextResponse } from "next/server"
import { generateAIResponse, generateSummary, generateStudyPlan, generateFlashcards, answerQuestion, generateAssignmentApproach, generateStudyResource } from "@/lib/ai-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    let result: any

    switch (action) {
      case "generateAIResponse":
        result = await generateAIResponse(params)
        break
      case "generateSummary":
        result = await generateSummary(params.text)
        break
      case "generateStudyPlan":
        result = await generateStudyPlan(params.subject, params.topic)
        break
      case "generateFlashcards":
        result = await generateFlashcards(params.topic, params.count)
        break
      case "answerQuestion":
        result = await answerQuestion(params.question)
        break
      case "generateAssignmentApproach":
        result = await generateAssignmentApproach(params.title, params.description, params.subject)
        break
      case "generateStudyResource":
        result = await generateStudyResource(params.subject, params.topic, params.resourceType)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("AI API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

