export interface HF_TTSOptions {
  text: string;
  // Use a fast text-to-speech engine default on HF
  model?: string;
}

export interface HF_TTSResult {
  buffer: Buffer;
  format: "wav" | "flac" | "mp3";
  duration: number;
}

/**
 * Generate TTS using Hugging Face Inference API
 */
export async function generateHuggingFaceTTS(
  options: HF_TTSOptions
): Promise<HF_TTSResult> {
  const token = process.env.HUGGING_FACE_API_KEY || process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    throw new Error("HUGGING_FACE_API_KEY is not set");
  }

  const { text, model = "facebook/mms-tts-eng" } = options;
  const wordCount = text.split(/\s+/).length;
  const duration = (wordCount / 150) * 60;

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HuggingFace API error (${response.status}): ${errorBody}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuffer),
      format: "wav",
      duration,
    };
  } catch (err: any) {
    throw new Error(`HuggingFace TTS failed: ${err.message}`);
  }
}
