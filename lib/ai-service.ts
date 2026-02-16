// Server-side only - prevent any initialization during build
// All client initialization is done lazily at runtime

let hf: any = null
let geminiModelCache: { model: any; modelId: string } | null = null

// Helper to check if we're in a build context
function isBuildContext(): boolean {
  return (
    typeof process !== "undefined" &&
    (process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NODE_ENV === "production" && !process.env.VERCEL)
  )
}

async function getHfClient() {
  // Only execute on server, never during build
  if (typeof window !== "undefined" || isBuildContext()) {
    throw new Error("AI service can only be used on the server side at runtime")
  }

  if (!hf) {
    try {
      const { HfInference } = await import("@huggingface/inference")
      const apiKey = process.env.HUGGING_FACE_API_KEY
      if (!apiKey) {
        throw new Error("HUGGING_FACE_API_KEY is not set")
      }
      hf = new HfInference(apiKey)
    } catch (error) {
      console.error("Failed to initialize Hugging Face client:", error)
      throw error
    }
  }
  return hf
}

async function getGeminiModel(modelName?: string) {
  // Only execute on server, never during build
  if (typeof window !== "undefined" || isBuildContext()) {
    throw new Error("AI service can only be used on the server side at runtime")
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found")
      return null
    }
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    // Try the specified model or use fallback chain
    const modelsToTry = modelName
      ? [modelName]
      : [
        "gemini-2.5-flash",        // Stable, fast, best price-performance
        "gemini-3-flash-preview",  // Latest flash model
        "gemini-2.5-pro",          // Stable pro model
        "gemini-3-pro-preview",    // Latest pro model
        "gemini-2.0-flash",        // Previous generation stable
        "gemini-pro",              // Legacy stable model
      ]

    for (const modelId of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId })
        // Verify the model has the generateContent method
        if (model && typeof model.generateContent === "function") {
          return { model, modelId }
        }
      } catch (modelError: any) {
        console.warn(`Failed to initialize Gemini model ${modelId}:`, modelError.message)
        continue // Try next model
      }
    }

    throw new Error("All Gemini models failed to initialize")
  } catch (error) {
    console.error("Failed to initialize Gemini model:", error)
    return null
  }
}

export type AIProvider = "gemini" | "huggingface" | "groq"

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
      const geminiResult = await getGeminiModel()
      if (!geminiResult) {
        throw new Error("Gemini model not available. Make sure GEMINI_API_KEY is set.")
      }

      const { model: geminiModelInstance, modelId } = geminiResult
      const geminiPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt

      // Check if generateContent method exists
      if (typeof geminiModelInstance.generateContent !== "function") {
        throw new Error("Gemini model does not have generateContent method. Please check the API version.")
      }

      // Add timeout protection (30 seconds max for Gemini to leave room for fallback)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Gemini request timeout")), 30000)
      })

      try {
        const generatePromise = geminiModelInstance.generateContent(geminiPrompt)
        const result = await Promise.race([generatePromise, timeoutPromise]) as any

        const response = await result.response
        const text = response.text()

        return {
          text,
          provider: "gemini",
          model: modelId,
        }
      } catch (geminiError: any) {
        // Check for 503 or overloaded errors
        if (geminiError.status === 503 || geminiError.message?.includes("overloaded") || geminiError.message?.includes("timeout")) {
          throw new Error(`Gemini unavailable: ${geminiError.message || "Service overloaded"}`)
        }
        throw geminiError
      }
    } else if (provider === "huggingface") {
      const client = await getHfClient()
      if (!client) {
        throw new Error("Hugging Face client not available. Make sure HUGGING_FACE_API_KEY is set.")
      }

      // Use the specified model or default to a general text generation model
      const hfModelName = model || "google/flan-t5-base"

      const response = await client.textGeneration({
        model: hfModelName,
        inputs: prompt,
        parameters: {
          temperature,
          max_new_tokens: maxTokens,
        },
      })

      return {
        text: response.generated_text,
        provider: "huggingface",
        model: hfModelName,
      }
    } else if (provider === "groq") {
      // Groq fallback support
      return await generateGroqResponse(prompt, systemPrompt, temperature, maxTokens)
    } else {
      throw new Error("Invalid AI provider specified")
    }
  } catch (error: any) {
    console.error("AI generation error:", error)
    throw new Error(`Failed to generate AI response: ${error.message}`)
  }
}

/**
 * Generate response using Groq API (fallback)
 */
async function generateGroqResponse(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.7,
  maxTokens: number = 1024
): Promise<AIResponse> {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set")
    }

    // Dynamic import to avoid build-time issues
    const Groq = (await import("groq-sdk")).default
    const groq = new Groq({ apiKey })

    // Try models in order of preference
    const modelsToTry = [
      "llama-3.3-70b-versatile",  // Best quality
      "llama-3.1-8b-instant",      // Fastest
      "gpt-oss-120b",              // OpenAI OSS
      "gpt-oss-20b",               // Smaller OpenAI OSS
    ]

    for (const modelId of modelsToTry) {
      try {
        // Add timeout protection (30 seconds max for Groq)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Groq request timeout")), 30000)
        })

        const completionPromise = groq.chat.completions.create({
          messages: [
            ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
            { role: "user" as const, content: prompt },
          ],
          model: modelId,
          temperature,
          max_tokens: maxTokens,
        })

        const completion = await Promise.race([completionPromise, timeoutPromise]) as any

        const text = completion.choices[0]?.message?.content || ""
        if (text) {
          return {
            text,
            provider: "groq",
            model: modelId,
          }
        }
      } catch (modelError: any) {
        console.warn(`Groq model ${modelId} failed:`, modelError.message)
        continue // Try next model
      }
    }

    throw new Error("All Groq models failed")
  } catch (error: any) {
    console.error("Groq generation error:", error)
    throw new Error(`Failed to generate Groq response: ${error.message}`)
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
