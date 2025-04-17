import { HfInference } from "@huggingface/inference"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Hugging Face client
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY)

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDbRZylWEIFX0RkHC9lMV8RNIdde3yrxWw")
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export type AIProvider = "gemini" | "huggingface"

export interface AIRequestOptions {
  provider: AIProvider
  prompt: string
  systemPrompt?: string
  model?: string // For Hugging Face models
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  text: string
  provider: AIProvider
  model?: string
}

export async function generateAIResponse(options: AIRequestOptions): Promise<AIResponse> {
  const { provider, prompt, systemPrompt, model, temperature = 0.7, maxTokens = 1024 } = options

  try {
    if (provider === "gemini") {
      const geminiPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

      const result = await geminiModel.generateContent(geminiPrompt)
      const response = await result.response
      const text = response.text()

      return {
        text,
        provider: "gemini",
        model: "gemini-1.5-flash",
      }
    } else if (provider === "huggingface") {
      // Use the specified model or default to a general text generation model
      const hfModel = model || "google/flan-t5-base"

      const response = await hf.textGeneration({
        model: hfModel,
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
        },
      })

      return {
        text: response.generated_text,
        provider: "huggingface",
        model: hfModel,
      }
    } else {
      throw new Error("Invalid AI provider specified")
    }
  } catch (error: any) {
    console.error("AI generation error:", error)
    throw new Error(`Failed to generate AI response: ${error.message}`)
  }
}

// Specialized functions for specific AI tasks
export async function generateSummary(text: string): Promise<string> {
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: `Summarize the following text in a concise way:\n\n${text}`,
    systemPrompt: "You are a helpful AI assistant that specializes in summarizing text.",
  })
  return response.text
}

export async function generateStudyPlan(subject: string, topic: string): Promise<string> {
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: `Create a detailed study plan for learning about ${topic} in ${subject}.`,
    systemPrompt: "You are an educational AI assistant that creates effective study plans.",
  })
  return response.text
}

export async function generateFlashcards(topic: string, count = 5): Promise<{ question: string; answer: string }[]> {
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: `Generate ${count} flashcards for studying ${topic}. Format each flashcard as a JSON object with 'question' and 'answer' fields.`,
    systemPrompt: "You are an educational AI assistant that creates effective flashcards for studying.",
  })

  try {
    // Extract JSON array from the response
    const jsonStr = response.text.match(/\[[\s\S]*\]/)?.[0] || "[]"
    return JSON.parse(jsonStr)
  } catch (error) {
    console.error("Failed to parse flashcards:", error)
    return []
  }
}

export async function answerQuestion(question: string): Promise<string> {
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: question,
    systemPrompt: "You are a helpful AI tutor. Provide clear, accurate, and educational answers to student questions.",
  })
  return response.text
}

export async function generateAssignmentApproach(
  title: string,
  description: string,
  subject?: string,
): Promise<string> {
  const subjectContext = subject ? ` for the subject ${subject}` : ""
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: `Assignment Title: ${title}\nDescription: ${description}\n\nProvide a strategic approach to complete this assignment${subjectContext}. Include steps, resources, and time management tips.`,
    systemPrompt: "You are an educational AI assistant that helps students approach assignments effectively.",
  })
  return response.text
}

export async function generateStudyResource(subject: string, topic: string, resourceType: string): Promise<string> {
  const response = await generateAIResponse({
    provider: "gemini",
    prompt: `Create a comprehensive ${resourceType} about ${topic} in the subject of ${subject}. Include key concepts, examples, and explanations.`,
    systemPrompt: "You are an educational AI assistant that creates high-quality study resources.",
  })
  return response.text
}

// Function to track AI usage for a user
export async function trackAIUsage(supabase: any, userId: string): Promise<void> {
  try {
    // First check if profile exists
    const { data: profileExists, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError) {
      if (checkError.code === "PGRST116") {
        // Profile doesn't exist, create it with admin rights
        const adminSupabase = supabase.auth.admin

        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: userId,
            subscription_tier: "free",
            ai_requests_count: 1,
            full_name: "New User",
          },
        ])

        if (insertError) {
          console.error("Error creating profile:", insertError)
          throw insertError
        }

        return
      } else {
        throw checkError
      }
    }

    // Profile exists, get current count
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier, ai_requests_count")
      .eq("id", userId)
      .single()

    if (profileError) throw profileError

    // Check if user has reached limit (only for free tier)
    if (profile.subscription_tier === "free" && profile.ai_requests_count >= 10) {
      throw new Error("You have reached your monthly AI requests limit. Please upgrade your plan for unlimited access.")
    }

    // Increment the AI requests count
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ai_requests_count: (profile.ai_requests_count || 0) + 1 })
      .eq("id", userId)

    if (updateError) throw updateError
  } catch (error) {
    console.error("Error tracking AI usage:", error)
    throw error
  }
}
