"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Loader2,
    Send,
    Trash2,
    Sparkles,
    AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassSurface } from "@/components/shared/GlassSurface"

interface ConversationMessage {
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

interface VoiceTutorProps {
    sessionType: string
    topic: string
    className?: string
}

export function VoiceTutor({
    sessionType,
    topic,
    className = "",
}: VoiceTutorProps) {
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [interimTranscript, setInterimTranscript] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [audioLevel, setAudioLevel] = useState(0)
    const [textInput, setTextInput] = useState("")
    const [ttsEnabled, setTtsEnabled] = useState(true)
    const [speechSupported, setSpeechSupported] = useState(true)

    const recognitionRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const animFrameRef = useRef<number | null>(null)

    // Check for Web Speech API support
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSpeechSupported(false)
        }
    }, [])

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, interimTranscript])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening()
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current)
            }
        }
    }, [])

    // --- Speech Recognition ---
    const startListening = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition

        if (!SpeechRecognition) {
            setError(
                "Speech recognition is not supported in this browser. Please use Chrome or Edge."
            )
            return
        }

        // Stop any current TTS playback
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
            setIsSpeaking(false)
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
            setIsListening(true)
            setError(null)
        }

        recognition.onresult = (event: any) => {
            let interim = ""
            let final = ""

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    final += transcript
                } else {
                    interim += transcript
                }
            }

            setInterimTranscript(interim)

            if (final.trim()) {
                // Stop listening, process final transcript
                recognition.stop()
                setIsListening(false)
                setInterimTranscript("")
                processUserMessage(final.trim())
            }
        }

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error)
            if (event.error === "not-allowed") {
                setError(
                    "Microphone access denied. Please allow microphone access in your browser settings."
                )
            } else if (event.error !== "aborted") {
                setError(`Speech recognition error: ${event.error}`)
            }
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
        setIsListening(false)
        setInterimTranscript("")
    }, [])

    // --- Process user message (send to AI, play TTS) ---
    const processUserMessage = useCallback(
        async (text: string) => {
            // Add user message
            const userMsg: ConversationMessage = {
                role: "user",
                content: text,
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, userMsg])
            setIsProcessing(true)
            setError(null)

            try {
                // 1. Get AI response
                const aiRes = await fetch("/api/ai/voice", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: text,
                        sessionType,
                        topic,
                        history: messages
                            .slice(-10)
                            .map((m) => ({
                                role: m.role,
                                content: m.content,
                            })),
                    }),
                })

                if (!aiRes.ok) {
                    const err = await aiRes.json()
                    throw new Error(err.error || "AI request failed")
                }

                const { reply } = await aiRes.json()

                // Add AI message
                const aiMsg: ConversationMessage = {
                    role: "assistant",
                    content: reply,
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, aiMsg])

                // 2. Generate TTS if enabled
                if (ttsEnabled && reply) {
                    await playTTS(reply)
                }
            } catch (err: any) {
                console.error("Voice tutor error:", err)
                setError(err.message || "Something went wrong")
            } finally {
                setIsProcessing(false)
            }
        },
        [sessionType, topic, messages, ttsEnabled]
    )

    // --- TTS Playback ---
    const playTTS = useCallback(async (text: string) => {
        try {
            setIsSpeaking(true)
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    provider: "elevenlabs",
                }),
            })

            if (!res.ok) {
                console.warn("TTS failed, skipping audio playback")
                setIsSpeaking(false)
                return
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audioRef.current = audio

            audio.onended = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(url)
                audioRef.current = null
            }

            audio.onerror = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(url)
                audioRef.current = null
            }

            await audio.play()
        } catch (err) {
            console.warn("TTS playback error:", err)
            setIsSpeaking(false)
        }
    }, [])

    // --- Text input submit ---
    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (textInput.trim() && !isProcessing) {
            processUserMessage(textInput.trim())
            setTextInput("")
        }
    }

    // --- Clear conversation ---
    const clearConversation = () => {
        setMessages([])
        setError(null)
        stopListening()
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
            setIsSpeaking(false)
        }
    }

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-foreground/10">
                {messages.length === 0 && !isProcessing && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                            <Sparkles className="h-10 w-10 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground/80 mb-2">
                            Ready to start!
                        </h3>
                        <p className="text-sm text-foreground/50 max-w-sm">
                            {speechSupported
                                ? 'Click the microphone or type a message to begin your voice tutoring session.'
                                : 'Type a message below to begin. Voice input requires Chrome or Edge browser.'}
                        </p>
                        {topic && (
                            <div className="mt-3 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
                                Topic: {topic}
                            </div>
                        )}
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                    ? "bg-cyan-500/15 text-foreground/90 rounded-br-md"
                                    : "bg-white/5 border border-white/10 text-foreground/80 rounded-bl-md"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Interim transcript (what user is currently saying) */}
                {interimTranscript && (
                    <div className="flex justify-end gap-3">
                        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-cyan-500/10 border border-cyan-500/20 text-sm text-foreground/50 italic">
                            {interimTranscript}...
                        </div>
                    </div>
                )}

                {/* Processing indicator */}
                {isProcessing && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2 text-sm text-foreground/50">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}

                {/* Speaking indicator */}
                {isSpeaking && (
                    <div className="flex items-center gap-2 text-xs text-cyan-400 px-4">
                        <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                        Speaking...
                    </div>
                )}

                <div ref={transcriptEndRef} />
            </div>

            {/* Error */}
            {error && (
                <div className="mx-4 mb-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Controls */}
            <div className="p-4 border-t border-white/5 space-y-3">
                {/* Action buttons */}
                <div className="flex items-center justify-center gap-3">
                    {/* Mic button */}
                    {speechSupported && (
                        <Button
                            onClick={
                                isListening ? stopListening : startListening
                            }
                            disabled={isProcessing}
                            className={`rounded-full w-14 h-14 p-0 transition-all ${isListening
                                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 scale-110"
                                    : "bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20"
                                }`}
                        >
                            {isListening ? (
                                <MicOff className="h-6 w-6" />
                            ) : (
                                <Mic className="h-6 w-6" />
                            )}
                        </Button>
                    )}

                    {/* TTS toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            if (isSpeaking && audioRef.current) {
                                audioRef.current.pause()
                                audioRef.current = null
                                setIsSpeaking(false)
                            }
                            setTtsEnabled(!ttsEnabled)
                        }}
                        className={`rounded-full px-3 h-10 ${ttsEnabled
                                ? "bg-white/5 border-white/10 text-foreground/70"
                                : "bg-white/5 border-red-500/30 text-red-400"
                            }`}
                    >
                        {ttsEnabled ? (
                            <Volume2 className="h-4 w-4 mr-1.5" />
                        ) : (
                            <VolumeX className="h-4 w-4 mr-1.5" />
                        )}
                        {ttsEnabled ? "Audio On" : "Audio Off"}
                    </Button>

                    {/* Clear button */}
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearConversation}
                            className="rounded-full px-3 h-10 bg-white/5 border-white/10 text-foreground/50 hover:text-foreground"
                        >
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Clear
                        </Button>
                    )}
                </div>

                {/* Text input fallback */}
                <form
                    onSubmit={handleTextSubmit}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={
                            isListening
                                ? "Listening..."
                                : "Type a message or use the mic..."
                        }
                        disabled={isProcessing || isListening}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-foreground placeholder:text-foreground/30 text-sm transition-colors disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        disabled={!textInput.trim() || isProcessing}
                        size="sm"
                        className="h-[46px] px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default VoiceTutor
