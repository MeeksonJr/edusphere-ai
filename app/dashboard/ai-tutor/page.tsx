'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Mic,
    MicOff,
    PhoneOff,
    Volume2,
    MessageSquare,
    Sparkles,
    BookOpen,
    Brain,
    Languages,
    GraduationCap,
    Briefcase,
    Loader2,
    History,
} from 'lucide-react'
import { GlassSurface } from '@/components/shared/GlassSurface'
import { AmbientBackground } from '@/components/shared/AmbientBackground'

type SessionType = 'tutor' | 'quiz_practice' | 'language' | 'explainer' | 'study_buddy' | 'interview_prep'
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error'

interface TranscriptEntry {
    role: 'user' | 'ai' | 'system'
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
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><Loader2 className="h-8 w-8 text-cyan-400 animate-spin" /></div>}>
            <AITutorContent />
        </Suspense>
    )
}

function AITutorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const continueFromId = searchParams.get('continue')

    const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
    const [selectedType, setSelectedType] = useState<SessionType | null>(null)
    const [topic, setTopic] = useState('')
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
    const [duration, setDuration] = useState(0)
    const [audioLevel, setAudioLevel] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [isAISpeaking, setIsAISpeaking] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Refs to avoid stale closures
    const isMutedRef = useRef(false)
    const [isMuted, setIsMuted] = useState(false)
    const sessionRef = useRef<Session | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const mediaStreamRef = useRef<MediaStream | null>(null)
    const processorRef = useRef<ScriptProcessorNode | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const transcriptEndRef = useRef<HTMLDivElement>(null)
    const durationRef = useRef(0)
    const transcriptRef = useRef<TranscriptEntry[]>([])

    // Audio playback
    const audioQueueRef = useRef<ArrayBuffer[]>([])
    const isPlayingRef = useRef(false)
    const playbackContextRef = useRef<AudioContext | null>(null)

    const isConnected = connectionState === 'connected'

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transcript])

    // Duration timer
    useEffect(() => {
        if (isConnected) {
            timerRef.current = setInterval(() => {
                setDuration(d => {
                    durationRef.current = d + 1
                    return d + 1
                })
            }, 1000)
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

    const addTranscript = useCallback((role: TranscriptEntry['role'], text: string) => {
        const entry = { role, text, timestamp: new Date() }
        setTranscript(prev => {
            const updated = [...prev, entry]
            transcriptRef.current = updated
            return updated
        })
    }, [])

    // Load continuation context
    useEffect(() => {
        if (!continueFromId) return
        async function loadContinuation() {
            try {
                const res = await fetch(`/api/ai/live/${continueFromId}`)
                if (res.ok) {
                    const session = await res.json()
                    setSelectedType(session.session_type as SessionType)
                    setTopic(session.topic || '')
                    addTranscript('system', `📎 Continuing from previous session: "${session.topic || session.session_type}"`)
                }
            } catch (e) {
                console.error('Failed to load continuation:', e)
            }
        }
        loadContinuation()
    }, [continueFromId, addTranscript])

    // --- Audio Playback Queue ---
    const playNextAudio = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return
        isPlayingRef.current = true

        const rawPcm = audioQueueRef.current.shift()!
        try {
            if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
                playbackContextRef.current = new AudioContext({ sampleRate: 24000 })
            }
            const ctx = playbackContextRef.current

            // Convert PCM int16 → float32
            const int16 = new Int16Array(rawPcm)
            const float32 = new Float32Array(int16.length)
            for (let i = 0; i < int16.length; i++) {
                float32[i] = int16[i] / 32768.0
            }

            const buffer = ctx.createBuffer(1, float32.length, 24000)
            buffer.copyToChannel(float32, 0)

            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(ctx.destination)
            source.onended = () => {
                isPlayingRef.current = false
                if (audioQueueRef.current.length > 0) playNextAudio()
                else setIsAISpeaking(false)
            }
            source.start()
        } catch (e) {
            console.error('[Playback] Error:', e)
            isPlayingRef.current = false
            if (audioQueueRef.current.length > 0) playNextAudio()
        }
    }, [])

    const queueAudioData = useCallback((base64Data: string) => {
        try {
            const binaryStr = atob(base64Data)
            const bytes = new Uint8Array(binaryStr.length)
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i)
            }
            audioQueueRef.current.push(bytes.buffer)
            setIsAISpeaking(true)
            playNextAudio()
        } catch (e) {
            console.error('[Audio] Decode error:', e)
        }
    }, [playNextAudio])

    // --- Start Session ---
    const startSession = useCallback(async () => {
        if (!selectedType) return
        setError(null)
        setConnectionState('connecting')
        setStatusMessage('Requesting session token...')

        try {
            // 1. Get ephemeral token from our server
            const res = await fetch('/api/ai/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionType: selectedType,
                    topic: topic || undefined,
                    continuedFrom: continueFromId || undefined,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || `Server error: ${res.status}`)
            }

            const { token, model, systemInstruction, sessionId } = await res.json()
            setCurrentSessionId(sessionId)

            // 2. Request microphone
            setStatusMessage('Requesting microphone access...')
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                },
            })
            mediaStreamRef.current = stream

            // 3. Set up audio processing
            setStatusMessage('Setting up audio...')
            const audioContext = new AudioContext({ sampleRate: 16000 })
            audioContextRef.current = audioContext
            const source = audioContext.createMediaStreamSource(stream)
            const processor = audioContext.createScriptProcessor(4096, 1, 1)
            processorRef.current = processor
            source.connect(processor)
            processor.connect(audioContext.destination)

            // 4. Connect to Gemini Live API via SDK
            setStatusMessage('Connecting to Gemini Live API...')
            const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })

            const session = await ai.live.connect({
                model: model,
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: systemInstruction,
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Kore',
                            },
                        },
                    },
                },
                callbacks: {
                    onopen: () => {
                        console.log('[Live API] Connected!')
                        setConnectionState('connected')
                        setStatusMessage('')
                        addTranscript('system', '🎙️ Connected! Start speaking...')

                        // Start sending microphone audio
                        processor.onaudioprocess = (e) => {
                            if (isMutedRef.current) return
                            if (!sessionRef.current) return

                            const inputData = e.inputBuffer.getChannelData(0)

                            // Audio level for visualizer
                            let sum = 0
                            for (let i = 0; i < inputData.length; i++) {
                                sum += inputData[i] * inputData[i]
                            }
                            setAudioLevel(Math.sqrt(sum / inputData.length) * 100)

                            // Convert float32 → int16 PCM
                            const pcm16 = new Int16Array(inputData.length)
                            for (let i = 0; i < inputData.length; i++) {
                                pcm16[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)))
                            }

                            // Convert to base64
                            const bytes = new Uint8Array(pcm16.buffer)
                            let binary = ''
                            const chunkSize = 8192
                            for (let i = 0; i < bytes.length; i += chunkSize) {
                                const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
                                binary += String.fromCharCode(...chunk)
                            }
                            const base64 = btoa(binary)

                            // Send via SDK
                            sessionRef.current.sendRealtimeInput({
                                audio: {
                                    data: base64,
                                    mimeType: 'audio/pcm;rate=16000',
                                },
                            })
                        }
                    },
                    onmessage: (message: LiveServerMessage) => {
                        // Handle interruption
                        if (message.serverContent?.interrupted) {
                            setIsAISpeaking(false)
                            audioQueueRef.current = []
                            return
                        }

                        // Handle AI audio/text response
                        if (message.serverContent?.modelTurn?.parts) {
                            for (const part of message.serverContent.modelTurn.parts) {
                                if (part.inlineData?.data) {
                                    queueAudioData(part.inlineData.data)
                                }
                                if (part.text) {
                                    addTranscript('ai', part.text)
                                }
                            }
                        }

                        // Turn complete
                        if (message.serverContent?.turnComplete) {
                            // Playback will set isAISpeaking to false when queue drains
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('[Live API] Error:', e.message)
                        setError(`Connection error: ${e.message}`)
                        setConnectionState('error')
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('[Live API] Closed:', e.code, e.reason)
                        if (e.code !== 1000) {
                            setError(`Session closed: ${e.reason || `code ${e.code}`}`)
                            setConnectionState('error')
                        } else {
                            setConnectionState('idle')
                        }
                        setIsAISpeaking(false)
                        setStatusMessage('')
                    },
                },
            })

            sessionRef.current = session
        } catch (err: any) {
            console.error('[Live API] Start error:', err)
            setError(err.message || 'Failed to start session')
            setConnectionState('error')
            // Clean up on error
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop())
                mediaStreamRef.current = null
            }
        }
    }, [selectedType, topic, addTranscript, queueAudioData, continueFromId])

    // --- End Session ---
    const endSession = useCallback(async () => {
        // Close live connection
        if (sessionRef.current) {
            sessionRef.current.close()
            sessionRef.current = null
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop())
            mediaStreamRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            await audioContextRef.current.close().catch(() => { })
            audioContextRef.current = null
        }
        if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
            await playbackContextRef.current.close().catch(() => { })
            playbackContextRef.current = null
        }
        audioQueueRef.current = []
        isPlayingRef.current = false
        setIsAISpeaking(false)
        setAudioLevel(0)

        // Save session data
        const sessId = currentSessionId
        const transcriptData = transcriptRef.current.filter(t => t.role !== 'system')
        const dur = durationRef.current

        if (sessId && transcriptData.length > 0) {
            setIsSaving(true)
            setStatusMessage('Saving session...')
            try {
                // Save transcript and duration
                await fetch(`/api/ai/live/${sessId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transcript: transcriptData,
                        duration_seconds: dur,
                        status: 'completed',
                    }),
                })

                // Generate AI analysis (fire and forget on the server)
                fetch(`/api/ai/live/${sessId}`, { method: 'POST' }).catch(() => { })

                // Navigate to session detail page
                router.push(`/dashboard/ai-tutor/${sessId}`)
                return
            } catch (e) {
                console.error('Failed to save session:', e)
            } finally {
                setIsSaving(false)
            }
        }

        // Reset if no save/navigation
        setConnectionState('idle')
        setStatusMessage('')
        setDuration(0)
    }, [currentSessionId, router])

    // --- Mute Toggle ---
    const toggleMute = () => {
        const newMuted = !isMuted
        setIsMuted(newMuted)
        isMutedRef.current = newMuted
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getAudioTracks().forEach(t => {
                t.enabled = !newMuted
            })
        }
    }

    // --- Session Type Selection ---
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

                    {/* History link */}
                    <div className="text-center">
                        <Link
                            href="/dashboard/ai-tutor/history"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground/50 hover:text-foreground hover:border-cyan-500/30 transition-all text-sm"
                        >
                            <History className="h-4 w-4" />
                            View Session History
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // --- Active / Pre-Session View ---
    const selectedConfig = SESSION_TYPES.find(t => t.id === selectedType)!

    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            <AmbientBackground />
            <div className="relative z-10 max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (connectionState === 'idle' || connectionState === 'error') {
                                    setSelectedType(null); setTopic(''); setError(null); setTranscript([])
                                }
                            }}
                            className="text-foreground/50 hover:text-foreground transition-colors"
                            disabled={isConnected || connectionState === 'connecting'}
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
                            {connectionState === 'connecting' && (
                                <div className="flex items-center gap-2 text-xs text-amber-400">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    {statusMessage || 'Connecting...'}
                                </div>
                            )}
                        </div>
                    </div>
                    {(isConnected || connectionState === 'connecting') && (
                        <Button
                            onClick={endSession}
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                        >
                            <PhoneOff className="h-4 w-4 mr-2" />
                            End
                        </Button>
                    )}
                </div>

                {/* Pre-session: Topic input */}
                {(connectionState === 'idle' || connectionState === 'error') && (
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
                            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                ⚠️ {error}
                            </div>
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

                {/* Connecting state */}
                {connectionState === 'connecting' && (
                    <GlassSurface className="p-8 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
                        <p className="text-foreground/70 font-medium">{statusMessage || 'Connecting...'}</p>
                        <p className="text-xs text-foreground/40 mt-2">This may take a few seconds</p>
                    </GlassSurface>
                )}

                {/* Active session: Audio visualizer + controls */}
                {isConnected && (
                    <>
                        <GlassSurface className="p-8 flex flex-col items-center justify-center">
                            <div className="relative w-32 h-32 mb-4">
                                <div
                                    className={`absolute inset-0 rounded-full transition-all duration-150 ${isAISpeaking ? 'bg-cyan-500/10' : 'bg-white/5'
                                        }`}
                                    style={{ transform: `scale(${1 + (isAISpeaking ? 0.3 : audioLevel * 0.02)})` }}
                                />
                                {isAISpeaking && (
                                    <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping" />
                                )}
                                <div
                                    className={`absolute inset-2 rounded-full flex items-center justify-center transition-all duration-150 ${isAISpeaking
                                        ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50'
                                        : isMuted
                                            ? 'bg-red-500/10 border-2 border-red-500/30'
                                            : 'bg-white/5 border-2 border-white/10'
                                        }`}
                                    style={{ transform: `scale(${1 + audioLevel * 0.01})` }}
                                >
                                    {isAISpeaking ? (
                                        <Volume2 className="h-12 w-12 text-cyan-400 animate-pulse" />
                                    ) : isMuted ? (
                                        <MicOff className="h-12 w-12 text-red-400" />
                                    ) : (
                                        <Mic className="h-12 w-12 text-foreground/60" />
                                    )}
                                </div>
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
                                        className={`flex gap-3 ${entry.role === 'user' ? 'justify-end' : ''}`}
                                    >
                                        {entry.role === 'ai' && (
                                            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Sparkles className="h-3 w-3 text-cyan-400" />
                                            </div>
                                        )}
                                        {entry.role === 'system' && (
                                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-xs">ℹ</span>
                                            </div>
                                        )}
                                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${entry.role === 'ai'
                                            ? 'bg-white/5 text-foreground/80'
                                            : entry.role === 'system'
                                                ? 'bg-amber-500/5 text-amber-300/80 italic'
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
