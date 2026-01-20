// AI-powered question generation service
import { generateAIResponse } from "./ai-service-wrapper"

export interface Question {
  question: string
  questionType: "multiple-choice" | "true-false" | "short-answer" | "essay"
  options?: string[] // For multiple choice
  correctAnswer: string
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
}

export interface QuestionGenerationOptions {
  content: string // Slide or chapter content
  questionType?: "multiple-choice" | "true-false" | "short-answer" | "essay"
  difficulty?: "easy" | "medium" | "hard"
  count?: number // Number of questions to generate
}

/**
 * Generate questions from course content using AI
 */
export async function generateQuestions(
  options: QuestionGenerationOptions
): Promise<Question[]> {
  const { content, questionType = "multiple-choice", difficulty = "medium", count = 5 } = options

  const systemPrompt = `You are an expert educational content creator. Generate ${count} ${questionType} questions based on the provided content.

Requirements:
- Question type: ${questionType}
- Difficulty level: ${difficulty}
- Generate exactly ${count} questions
- Each question should test understanding of key concepts
- For multiple-choice: Provide 4 options with one correct answer
- For true-false: Provide clear true/false statements
- For short-answer: Provide questions that can be answered in 1-2 sentences
- For essay: Provide thought-provoking questions requiring detailed answers
- Include explanations for correct answers when applicable

Return ONLY valid JSON array in this exact format:
[
  {
    "question": "Question text here",
    "questionType": "${questionType}",
    "options": ["option1", "option2", "option3", "option4"], // Only for multiple-choice
    "correctAnswer": "correct answer",
    "explanation": "Explanation of why this is correct",
    "difficulty": "${difficulty}"
  }
]`

  const userPrompt = `Generate questions based on this content:\n\n${content}`

  try {
    // Try Gemini first
    let response
    try {
      response = await generateAIResponse({
        provider: "gemini",
        prompt: userPrompt,
        systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
      })
    } catch (geminiError) {
      // Fallback to Groq
      try {
        response = await generateAIResponse({
          provider: "groq",
          prompt: userPrompt,
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2000,
        })
      } catch (groqError) {
        // Final fallback to Hugging Face
        response = await generateAIResponse({
          provider: "huggingface",
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          systemPrompt: undefined,
          temperature: 0.7,
          maxTokens: 2000,
        })
      }
    }

    // Parse response
    const cleanedResponse = response.text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const questions: Question[] = JSON.parse(cleanedResponse)

    // Validate and format questions
    return questions.map((q) => ({
      question: q.question,
      questionType: q.questionType || questionType,
      options: q.options || (questionType === "multiple-choice" ? [] : undefined),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      difficulty: q.difficulty || difficulty,
    }))
  } catch (error: any) {
    console.error("Error generating questions:", error)
    throw new Error(`Failed to generate questions: ${error.message}`)
  }
}

/**
 * Generate questions for a specific slide
 */
export async function generateSlideQuestions(
  slideContent: string,
  narrationScript?: string,
  count: number = 3
): Promise<Question[]> {
  const combinedContent = narrationScript
    ? `${slideContent}\n\nNarration: ${narrationScript}`
    : slideContent

  return generateQuestions({
    content: combinedContent,
    questionType: "multiple-choice",
    difficulty: "medium",
    count,
  })
}

/**
 * Generate questions for a chapter (end-of-chapter quiz)
 */
export async function generateChapterQuestions(
  chapterContent: string,
  count: number = 10
): Promise<Question[]> {
  return generateQuestions({
    content: chapterContent,
    questionType: "multiple-choice",
    difficulty: "medium",
    count,
  })
}

