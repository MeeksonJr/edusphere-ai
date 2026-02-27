"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX } from "react-icons/fi"

interface PodcastPlayerProps {
    audioUrl: string
    title: string
    duration?: number
    script?: string
    className?: string
}

function formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

export function PodcastPlayer({
    audioUrl,
    title,
    duration: estimatedDuration,
    script,
    className = "",
}: PodcastPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(estimatedDuration || 0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [showTranscript, setShowTranscript] = useState(false)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const onTimeUpdate = () => setCurrentTime(audio.currentTime)
        const onLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration)
            }
        }
        const onEnded = () => setIsPlaying(false)

        audio.addEventListener("timeupdate", onTimeUpdate)
        audio.addEventListener("loadedmetadata", onLoadedMetadata)
        audio.addEventListener("ended", onEnded)

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate)
            audio.removeEventListener("loadedmetadata", onLoadedMetadata)
            audio.removeEventListener("ended", onEnded)
        }
    }, [])

    const togglePlay = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        if (isPlaying) {
            audio.pause()
        } else {
            audio.play()
        }
        setIsPlaying(!isPlaying)
    }, [isPlaying])

    const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current
        if (!audio) return
        audio.currentTime = Number(e.target.value)
        setCurrentTime(Number(e.target.value))
    }, [])

    const skip = useCallback((delta: number) => {
        const audio = audioRef.current
        if (!audio) return
        audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta))
    }, [])

    const toggleMute = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        audio.muted = !isMuted
        setIsMuted(!isMuted)
    }, [isMuted])

    const changeRate = useCallback(() => {
        const audio = audioRef.current
        if (!audio) return
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
        const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length
        const newRate = rates[nextIdx]
        audio.playbackRate = newRate
        setPlaybackRate(newRate)
    }, [playbackRate])

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className={`rounded-xl overflow-hidden ${className}`}>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Main player */}
            <div className="bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                {/* Title */}
                <p className="text-sm font-medium text-white/90 mb-4 truncate">{title}</p>

                {/* Progress bar */}
                <div className="mb-3">
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onChange={seek}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                            bg-white/10 accent-indigo-400
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-indigo-400
                            [&::-webkit-slider-thumb]:shadow-lg"
                        style={{
                            background: `linear-gradient(to right, rgb(129 140 248) ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
                        }}
                    />
                    <div className="flex justify-between text-[11px] text-white/50 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Mute */}
                        <button
                            onClick={toggleMute}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                            title={isMuted ? "Unmute" : "Mute"}
                        >
                            {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
                        </button>

                        {/* Speed */}
                        <button
                            onClick={changeRate}
                            className="px-2 py-1 rounded-md hover:bg-white/10 text-[11px] font-mono text-white/60 hover:text-white transition min-w-[38px]"
                            title="Playback speed"
                        >
                            {playbackRate}x
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Skip back 15s */}
                        <button
                            onClick={() => skip(-15)}
                            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
                            title="Rewind 15s"
                        >
                            <FiSkipBack size={18} />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition transform hover:scale-105 active:scale-95"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? <FiPause size={22} /> : <FiPlay size={22} className="ml-0.5" />}
                        </button>

                        {/* Skip forward 15s */}
                        <button
                            onClick={() => skip(15)}
                            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
                            title="Forward 15s"
                        >
                            <FiSkipForward size={18} />
                        </button>
                    </div>

                    {/* Transcript toggle */}
                    {script && (
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className={`text-xs px-3 py-1.5 rounded-md transition
                                ${showTranscript
                                    ? "bg-indigo-500/30 text-indigo-300"
                                    : "hover:bg-white/10 text-white/50 hover:text-white"
                                }`}
                        >
                            Transcript
                        </button>
                    )}
                </div>
            </div>

            {/* Transcript panel */}
            {showTranscript && script && (
                <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-5 max-h-64 overflow-y-auto scrollbar-thin">
                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-3">
                        Transcript
                    </h4>
                    <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {script}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PodcastPlayer
