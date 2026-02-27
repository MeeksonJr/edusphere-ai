"use client"

import { useEffect, useState, useRef } from "react"
import { FiPlay, FiSquare, FiVolume2, FiStar, FiLoader } from "react-icons/fi"

export interface VoiceOption {
    id: string
    name: string
    provider: "elevenlabs" | "edge-tts" | "google-cloud"
    gender: string
    locale: string
    previewUrl?: string
    isPremium: boolean
}

interface VoiceSelectorProps {
    selectedVoice: string
    onVoiceChange: (voiceId: string, provider: string) => void
    className?: string
}

export function VoiceSelector({
    selectedVoice,
    onVoiceChange,
    className = "",
}: VoiceSelectorProps) {
    const [voices, setVoices] = useState<VoiceOption[]>([])
    const [loading, setLoading] = useState(true)
    const [tier, setTier] = useState("free")
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null)
    const [previewingId, setPreviewingId] = useState<string | null>(null)
    const [generatingPreview, setGeneratingPreview] = useState<string | null>(null)

    useEffect(() => {
        fetchVoices()
    }, [])

    const fetchVoices = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/tts")
            if (!res.ok) throw new Error("Failed to fetch voices")
            const data = await res.json()
            setVoices(data.voices || [])
            setTier(data.tier || "free")
        } catch (error) {
            console.error("Failed to load voices:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePreview = async (voice: VoiceOption) => {
        // Stop current preview
        if (previewAudio) {
            previewAudio.pause()
            previewAudio.currentTime = 0
            setPreviewAudio(null)
            if (previewingId === voice.id) {
                setPreviewingId(null)
                return
            }
        }

        // If ElevenLabs voice has preview URL, use it
        if (voice.previewUrl) {
            const audio = new Audio(voice.previewUrl)
            audio.onended = () => {
                setPreviewingId(null)
                setPreviewAudio(null)
            }
            audio.play()
            setPreviewAudio(audio)
            setPreviewingId(voice.id)
            return
        }

        // Generate preview via TTS API
        try {
            setGeneratingPreview(voice.id)
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: "Hello! I'm your AI learning companion. Let me guide you through today's lesson.",
                    voice: voice.id,
                    provider: voice.provider,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Preview failed")
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const audio = new Audio(url)
            audio.onended = () => {
                setPreviewingId(null)
                setPreviewAudio(null)
                URL.revokeObjectURL(url)
            }
            audio.play()
            setPreviewAudio(audio)
            setPreviewingId(voice.id)
        } catch (error) {
            console.error("Preview failed:", error)
        } finally {
            setGeneratingPreview(null)
        }
    }

    const premiumVoices = voices.filter((v) => v.isPremium)
    const freeVoices = voices.filter((v) => !v.isPremium)

    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
                <FiLoader className="animate-spin" size={16} />
                <span className="text-sm">Loading voices...</span>
            </div>
        )
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <FiVolume2 size={16} />
                Narration Voice
            </label>

            {/* Premium voices */}
            {premiumVoices.length > 0 && (
                <div>
                    <p className="text-xs text-amber-400/80 flex items-center gap-1 mb-2">
                        <FiStar size={12} />
                        Premium Voices (ElevenLabs)
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                        {premiumVoices.map((voice) => (
                            <VoiceRow
                                key={voice.id}
                                voice={voice}
                                isSelected={selectedVoice === voice.id}
                                isPreviewing={previewingId === voice.id}
                                isGenerating={generatingPreview === voice.id}
                                onSelect={() => onVoiceChange(voice.id, voice.provider)}
                                onPreview={() => handlePreview(voice)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Free voices */}
            <div>
                {premiumVoices.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">Free Voices (Edge-TTS)</p>
                )}
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                    {freeVoices.slice(0, 12).map((voice) => (
                        <VoiceRow
                            key={voice.id}
                            voice={voice}
                            isSelected={selectedVoice === voice.id}
                            isPreviewing={previewingId === voice.id}
                            isGenerating={generatingPreview === voice.id}
                            onSelect={() => onVoiceChange(voice.id, voice.provider)}
                            onPreview={() => handlePreview(voice)}
                        />
                    ))}
                </div>
            </div>

            {!["pro", "family", "school", "ultimate"].includes(tier) && (
                <p className="text-xs text-gray-500 italic">
                    🔒 Upgrade to Pro to unlock premium ElevenLabs voices
                </p>
            )}
        </div>
    )
}

/* ─────────── Individual voice row ─────────── */

function VoiceRow({
    voice,
    isSelected,
    isPreviewing,
    isGenerating,
    onSelect,
    onPreview,
}: {
    voice: VoiceOption
    isSelected: boolean
    isPreviewing: boolean
    isGenerating: boolean
    onSelect: () => void
    onPreview: () => void
}) {
    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                ${isSelected
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-white"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                }`}
            onClick={onSelect}
        >
            {/* Radio dot */}
            <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected ? "border-indigo-400" : "border-gray-500"}`}
            >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </div>

            {/* Voice info */}
            <div className="flex-1 min-w-0">
                <span className="text-sm truncate block">
                    {voice.name}
                    {voice.isPremium && (
                        <FiStar className="inline ml-1 text-amber-400" size={11} />
                    )}
                </span>
                <span className="text-[10px] text-gray-500">
                    {voice.gender} · {voice.locale}
                </span>
            </div>

            {/* Preview button */}
            <button
                type="button"
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
                onClick={(e) => {
                    e.stopPropagation()
                    onPreview()
                }}
                title="Preview voice"
            >
                {isGenerating ? (
                    <FiLoader className="animate-spin text-gray-400" size={14} />
                ) : isPreviewing ? (
                    <FiSquare className="text-indigo-400" size={14} />
                ) : (
                    <FiPlay className="text-gray-400" size={14} />
                )}
            </button>
        </div>
    )
}

export default VoiceSelector
