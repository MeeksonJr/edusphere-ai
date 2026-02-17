'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Volume2,
    VolumeX,
    MessageSquare,
    Sparkles,
    BookOpen,
    Brain,
    Languages,
    Code,
    GraduationCap,
    Briefcase,
} from 'lucide-react'
import { GlassSurface } from '@/components/shared/GlassSurface'
import { AmbientBackground } from '@/components/shared/AmbientBackground'

type SessionType = 'tutor' | 'quiz_practice' | 'language' | 'explainer' | 'study_buddy' | 'interview_prep'

interface TranscriptEntry {
    role: 'user' | 'ai'
    text: string
    timestamp: Date
}

const SESSION_TYPES = [
    { id: 'tutor' as SessionType, name: '1-on-1 Tutor', icon: GraduationCap, desc: 'Personal AI tutor adapts to your level', color: 'from-cyan-500 to-blue-500' },
    { id: 'quiz_practice' as SessionType, name: 'Quiz Practice', icon: Brain, desc: 'Test your knowledge with AI quizzes', color: 'from-purple-500 to-pink-500' },
    { id: 'language' as SessionType, name: 'Language Partner', icon: Languages, desc: 'Practice speaking any language', color: 'from-emerald-500 to-teal-500' },
    { id: 'explainer' as SessionType, name: 'Concept Explainer', icon: BookOpen, desc: 'Break down complex topics simply', color: 'from-amber-500 to-orange-500' },
    { id: 'study_buddy' as SessionType, name: 'Study Buddy', icon: Sparkles, desc: 'Casual study companion', color: 'from-pink-500 to-rose-500' },
    { id: 'interview_prep' as SessionType, name: 'Interview Prep', icon: Briefcase, desc: 'Mock interviews with AI feedback', color: 'from-indigo-500 to-violet-500' },
]

export default function AITutorPage() {
    const [isConnected, setIsConnected] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [selectedType, setSelectedType] = useState<SessionType | null>(null)
    const [topic, setTopic] = useState('')
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [duration, setDuration] = useState(0)
    const [audioLevel, setAudioLevel] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const transcriptEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transcript])

    // Duration timer
    useEffect(() => {
        if (isConnected) {
            timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [isConnected])

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const startSession = useCallback(async () => {
        if (!selectedType) return
        setError(null)

        try {
            // 1. Get session config from server
            const res = await fetch('/api/ai/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionType: selectedType,
                    topic: topic || undefined,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to start session')
            }

            const config = await res.json()
            setSessionId(config.sessionId)

            // 2. Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })
            mediaStreamRef.current = stream

            // 3. Set up audio context for processing
            const audioContext = new AudioContext({ sampleRate: 16000 })
            audioContextRef.current = audioContext

            const source = audioContext.createMediaStreamSource(stream)
            const processor = audioContext.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor

            source.connect(processor)
            processor.connect(audioContext.destination)

            // 4. Connect to Gemini Live API via WebSocket
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${config.apiKey}`
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                // Send setup message
                ws.send(JSON.stringify({
                    setup: {
                        model: `models/${config.model}`,
                        generationConfig: {
                            responseModalities: ['AUDIO'],
                            speechConfig: config.config?.speechConfig,
                        },
                        systemInstruction: {
                            parts: [{ text: config.systemInstruction }],
                        },
                    },
                }))
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.setupComplete) {
                        setIsConnected(true)
                        setTranscript(prev => [...prev, {
                            role: 'ai',
                            text: '🎙️ Connected! I\'m ready to help. Start speaking...',
                            timestamp: new Date(),
                        }])

                        // Start sending audio
                        processor.onaudioprocess = (e) => {
                            if (isMuted || ws.readyState !== WebSocket.OPEN) return

                            const inputData = e.inputBuffer.getChannelData(0)

                            // Calculate audio level for visualizer
                            let sum = 0
                            for (let i = 0; i < inputData.length; i++) {
                                sum += inputData[i] * inputData[i]
                            }
                            setAudioLevel(Math.sqrt(sum / inputData.length) * 100)

                            // Convert float32 to int16 PCM
                            const pcm16 = new Int16Array(inputData.length)
                            for (let i = 0; i < inputData.length; i++) {
                                pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)))
                            }

                            // Send as base64
                            const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
                            ws.send(JSON.stringify({
                                realtimeInput: {
                                    mediaChunks: [{
                                        data: base64,
                                        mimeType: 'audio/pcm;rate=16000',
                                    }],
                                },
                            }))
                        }
                    }

                    if (data.serverContent) {
                        if (data.serverContent.interrupted) {
                            setIsAISpeaking(false)
                            return
                        }

                        if (data.serverContent.modelTurn?.parts) {
                            setIsAISpeaking(true)
                            for (const part of data.serverContent.modelTurn.parts) {
                                if (part.inlineData?.data) {
                                    // Play audio response
                                    playAudioChunk(part.inlineData.data)
                                }
                                if (part.text) {
                                    setTranscript(prev => [...prev, {
                                        role: 'ai',
                                        text: part.text,
                                        timestamp: new Date(),
                                    }])
                                }
                            }
                        }

                        if (data.serverContent.turnComplete) {
                            setIsAISpeaking(false)
                        }
                    }
                } catch (e) {
                    console.error('WebSocket message parse error:', e)
                }
            }

            ws.onerror = (e) => {
                console.error('WebSocket error:', e)
                setError('Connection error. Please try again.')
                endSession()
            }

            ws.onclose = () => {
                setIsConnected(false)
                setIsAISpeaking(false)
            }
        } catch (err: any) {
            console.error('Session start error:', err)
            setError(err.message || 'Failed to start session')
        }
    }, [selectedType, topic, isMuted])

    const playAudioChunk = async (base64Data: string) => {
        try {
            const playbackContext = new AudioContext({ sampleRate: 24000 })
            const binaryString = atob(base64Data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            // Convert int16 PCM to float32
            const int16 = new Int16Array(bytes.buffer)
            const float32 = new Float32Array(int16.length)
            for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0
            }

            const buffer = playbackContext.createBuffer(1, float32.length, 24000)
            buffer.copyToChannel(float32, 0)

            const source = playbackContext.createBufferSource()
            source.buffer = buffer
            source.connect(playbackContext.destination)
            source.start()
        } catch (e) {
            console.error('Audio playback error:', e)
        }
    }

    const endSession = useCallback(async () => {
        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        // Stop microphone
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop())
            mediaStreamRef.current = null
        }

        // Close audio context
        if (audioContextRef.current) {
            await audioContextRef.current.close()
            audioContextRef.current = null
        }

        // Save session data
        if (sessionId && duration > 0) {
            try {
                await fetch('/api/ai/live', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId,
                        duration,
                        transcript: transcript.map(t => ({ role: t.role, text: t.text })),
                        status: 'completed',
                    }),
                })
            } catch (e) {
                console.error('Failed to save session:', e)
            }
        }

        setIsConnected(false)
        setIsAISpeaking(false)
        setAudioLevel(0)
    }, [sessionId, duration, transcript])

    const toggleMute = () => {
        setIsMuted(prev => !prev)
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach(t => {
                t.enabled = isMuted // Toggle the opposite since state hasn't updated yet
            })
        }
    }

    // Session type selection view
    if (!selectedType) {
        return (
            <div className="relative min-h-[calc(100vh-4rem)]">
                <AmbientBackground />
                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            AI Tutor — Live Voice Sessions
                        </h1>
                        <p className="text-foreground/60 mt-2">
                            Have a real-time conversation with AI. Choose your session type.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SESSION_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className="group text-left p-6 rounded-2xl glass-surface border border-white/10 hover:border-cyan-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <type.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                                <p className="text-sm text-foreground/50">{type.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Active session / pre-session view
    const selectedConfig = SESSION_TYPES.find(t => t.id === selectedType)!

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <AmbientBackground />
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { if (!isConnected) { setSelectedType(null); setTopic('') } }}
                            className="text-foreground/50 hover:text-foreground transition-colors"
                            disabled={isConnected}
                        >
                            ← Back
                        </button>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedConfig.color} flex items-center justify-center`}>
                            <selectedConfig.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold">{selectedConfig.name}</h2>
                            {isConnected && (
                                <div className="flex items-center gap-2 text-xs text-foreground/50">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    Live • {formatDuration(duration)}
                                </div>
                            )}
                        </div>
                    </div>
                    {isConnected && (
                        <Button
                            onClick={endSession}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                            <PhoneOff className="h-4 w-4 mr-2" />
                            End Session
                        </Button>
                    )}
                </div>

                {/* Pre-session: Topic input */}
                {!isConnected && (
                    <GlassSurface className="p-6">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            What would you like to discuss? (optional)
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={
                                selectedType === 'language' ? 'e.g., "Spanish conversation practice"'
                                    : selectedType === 'interview_prep' ? 'e.g., "React frontend developer interview"'
                                        : 'e.g., "Explain quantum entanglement"'
                            }
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 text-foreground placeholder:text-foreground/30 transition-colors"
                        />
                        {error && (
                            <p className="text-red-400 text-sm mt-2">{error}</p>
                        )}
                        <Button
                            onClick={startSession}
                            className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 h-12 text-base"
                        >
                            <Mic className="h-5 w-5 mr-2" />
                            Start Voice Session
                        </Button>
                    </GlassSurface>
                )}

                {/* Active session: Audio visualizer + controls */}
                {isConnected && (
                    <>
                        {/* Audio Visualizer */}
                        <GlassSurface className="p-8 flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32 mb-4">
                                {/* Outer pulse ring */}
                                <div
                                    className={`absolute inset-0 rounded-full transition-all duration-150 ${isAISpeaking ? 'bg-cyan-500/10 animate-ping' : 'bg-white/5'
                                        }`}
                                    style={{
                                        transform: `scale(${1 + (isAISpeaking ? 0.3 : audioLevel * 0.02)})`,
                                    }}
                                />
                                {/* Inner circle */}
                                <div
                                    className={`absolute inset-2 rounded-full flex items-center justify-center transition-all duration-150 ${isAISpeaking
                                            ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50'
                                            : isMuted
                                                ? 'bg-red-500/10 border-2 border-red-500/30'
                                                : 'bg-white/5 border-2 border-white/10'
                                        }`}
                                    style={{
                                        transform: `scale(${1 + audioLevel * 0.01})`,
                                    }}
                                >
                                    {isAISpeaking ? (
                                        <Volume2 className="h-12 w-12 text-cyan-400 animate-pulse" />
                                    ) : isMuted ? (
                                        <MicOff className="h-12 w-12 text-red-400" />
                                    ) : (
                                        <Mic className="h-12 w-12 text-foreground/60" />
                                    )}
                                </div>
                                {/* Audio level bars */}
                                {!isMuted && !isAISpeaking && audioLevel > 0 && (
                                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                        {Array.from({ length: 5 }, (_, i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 rounded-full bg-cyan-400 transition-all duration-75"
                                                style={{
                                                    height: `${Math.min(24, Math.max(4, audioLevel * (1 + i * 0.3)))}px`,
                                                    opacity: audioLevel > i * 5 ? 1 : 0.2,
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-foreground/50 mt-4">
                                {isAISpeaking ? '🔊 AI is speaking...' : isMuted ? '🔇 Microphone muted' : '🎤 Listening...'}
                            </p>

                            {/* Controls */}
                            <div className="flex items-center gap-4 mt-6">
                                <Button
                                    onClick={toggleMute}
                                    variant="outline"
                                    size="lg"
                                    className={`rounded-full w-14 h-14 p-0 ${isMuted
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                            : 'bg-white/5 border-white/10 text-foreground hover:bg-white/10'
                                        }`}
                                >
                                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                </Button>
                            </div>
                        </GlassSurface>

                        {/* Transcript */}
                        <GlassSurface className="p-6 max-h-[300px] overflow-y-auto">
                            <h3 className="text-sm font-medium text-foreground/50 mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Transcript
                            </h3>
                            <div className="space-y-3">
                                {transcript.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${entry.role === 'ai' ? '' : 'justify-end'}`}
                                    >
                                        {entry.role === 'ai' && (
                                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Sparkles className="h-3 w-3 text-cyan-400" />
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${entry.role === 'ai'
                                                ? 'bg-white/5 text-foreground/80'
                                                : 'bg-cyan-500/10 text-foreground/80'
                                            }`}>
                                            {entry.text}
                                        </div>
                                    </div>
                                ))}
                                <div ref={transcriptEndRef} />
                            </div>
                        </GlassSurface>
                    </>
                )}
            </div>
        </div>
    )
}
