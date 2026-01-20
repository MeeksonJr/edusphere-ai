// Wrapper to ensure AI service is only loaded at runtime, not during build
export async function generateAIResponse(options: {
  provider: "gemini" | "huggingface"
  prompt: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
}) {
  // Dynamic import to avoid build-time issues
  const { generateAIResponse: generate } = await import("./ai-service")
  return generate(options)
}

export async function generateSummary(text: string) {
  const { generateSummary: generate } = await import("./ai-service")
  return generate(text)
}

export async function generateStudyPlan(subject: string, topic: string) {
  const { generateStudyPlan: generate } = await import("./ai-service")
  return generate(subject, topic)
}

export async function generateFlashcards(topic: string, count = 5) {
  const { generateFlashcards: generate } = await import("./ai-service")
  return generate(topic, count)
}

export async function answerQuestion(question: string) {
  const { answerQuestion: answer } = await import("./ai-service")
  return answer(question)
}

export async function generateAssignmentApproach(title: string, description: string, subject?: string) {
  const { generateAssignmentApproach: generate } = await import("./ai-service")
  return generate(title, description, subject)
}

export async function generateStudyResource(subject: string, topic: string, resourceType: string) {
  const { generateStudyResource: generate } = await import("./ai-service")
  return generate(subject, topic, resourceType)
}

export async function trackAIUsage(supabase: any, userId: string) {
  const { trackAIUsage: track } = await import("./ai-service")
  return track(supabase, userId)
}

