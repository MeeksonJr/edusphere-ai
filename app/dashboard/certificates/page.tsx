"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Award,
    Download,
    Copy,
    Check,
    ExternalLink,
    X,
    GraduationCap,
    Trophy,
    Zap,
    Star,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Certificate {
    id: string
    title: string
    description: string | null
    type: string
    verification_code: string
    metadata: any
    issued_at: string
    course_id: string | null
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: any; gradient: string }> = {
    course_completion: {
        label: "Course Completion",
        color: "text-emerald-400",
        icon: GraduationCap,
        gradient: "from-emerald-500/20 to-teal-500/5",
    },
    skill_mastery: {
        label: "Skill Mastery",
        color: "text-purple-400",
        icon: Zap,
        gradient: "from-purple-500/20 to-indigo-500/5",
    },
    achievement: {
        label: "Achievement",
        color: "text-amber-400",
        icon: Trophy,
        gradient: "from-amber-500/20 to-orange-500/5",
    },
    custom: {
        label: "Certificate",
        color: "text-cyan-400",
        icon: Star,
        gradient: "from-cyan-500/20 to-blue-500/5",
    },
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState("all")
    const [previewCert, setPreviewCert] = useState<Certificate | null>(null)
    const [copied, setCopied] = useState(false)

    const fetchCertificates = useCallback(async () => {
        setLoading(true)
        try {
            const url = filter === "all" ? "/api/certificates" : `/api/certificates?type=${filter}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setCertificates(data.certificates)
            }
        } catch (err) {
            console.error("Failed to fetch certificates:", err)
        }
        setLoading(false)
    }, [filter])

    useEffect(() => {
        fetchCertificates()
    }, [fetchCertificates])

    const downloadCertificate = (cert: Certificate) => {
        window.open(`/api/certificates/${cert.id}/pdf`, "_blank")
    }

    const copyVerificationLink = (cert: Certificate) => {
        const url = `${window.location.origin}/api/certificates/verify?code=${cert.verification_code}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const filters = [
        { key: "all", label: "All" },
        { key: "course_completion", label: "Courses" },
        { key: "skill_mastery", label: "Skills" },
        { key: "achievement", label: "Achievements" },
    ]

    return (
        <div className="relative min-h-screen p-6 md:p-8 lg:p-12 pb-32">
            <AmbientBackground />

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        <span className="text-foreground">My </span>
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Certificates
                        </span>
                    </h1>
                    <p className="text-foreground/60">
                        Your earned certificates and verifiable credentials.
                    </p>
                </div>
            </ScrollReveal>

            {/* Filter Tabs */}
            <ScrollReveal direction="up" delay={0.05}>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                    {filters.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                filter === f.key
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-white/[0.03] text-foreground/50 border border-transparent hover:bg-white/[0.06]"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </ScrollReveal>

            {/* Certificates Grid */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[40vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
                </div>
            ) : certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.map((cert, i) => {
                        const config = TYPE_CONFIG[cert.type] || TYPE_CONFIG.custom
                        const Icon = config.icon
                        return (
                            <ScrollReveal key={cert.id} direction="up" delay={i * 0.05}>
                                <GlassSurface
                                    className="p-5 cursor-pointer hover:border-amber-500/20 transition-all group relative overflow-hidden"
                                    onClick={() => setPreviewCert(cert)}
                                >
                                    {/* Gradient overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                                    <div className="relative z-10">
                                        {/* Type Badge */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={cn("text-xs font-medium flex items-center gap-1", config.color)}>
                                                <Icon className="h-3.5 w-3.5" />
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] text-foreground/30">
                                                {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-lg font-bold text-foreground mb-1 truncate">{cert.title}</h3>
                                        {cert.description && (
                                            <p className="text-xs text-foreground/40 line-clamp-2 mb-3">{cert.description}</p>
                                        )}

                                        {/* Recipient */}
                                        <div className="text-sm text-foreground/50">
                                            Issued to: <span className="text-foreground/70 font-medium">{cert.metadata?.recipient_name || "Student"}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-foreground/50 hover:text-amber-400 gap-1"
                                                onClick={(e) => { e.stopPropagation(); downloadCertificate(cert) }}
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                Download
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs text-foreground/50 hover:text-cyan-400 gap-1"
                                                onClick={(e) => { e.stopPropagation(); copyVerificationLink(cert) }}
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                                {copied ? "Copied!" : "Verify Link"}
                                            </Button>
                                        </div>
                                    </div>
                                </GlassSurface>
                            </ScrollReveal>
                        )
                    })}
                </div>
            ) : (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="flex flex-col items-center justify-center py-20">
                        <Award className="h-16 w-16 text-amber-500/20 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No certificates yet</h3>
                        <p className="text-sm text-foreground/40 max-w-md text-center">
                            Complete courses, master skills, and unlock achievements to earn verifiable certificates.
                            Each certificate includes a unique verification code for sharing.
                        </p>
                    </GlassSurface>
                </ScrollReveal>
            )}

            {/* Preview Modal */}
            {previewCert && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewCert(null)}
                >
                    <div
                        className="w-full max-w-2xl bg-background/95 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                            <h3 className="text-lg font-semibold text-foreground">Certificate Preview</h3>
                            <button
                                onClick={() => setPreviewCert(null)}
                                className="text-foreground/40 hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Certificate Preview */}
                        <div className="p-6">
                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-8 text-center border border-amber-500/10">
                                <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase mb-2">EduSphere AI</p>
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

                                <h2 className="text-amber-400 text-2xl font-bold font-serif mb-1">
                                    Certificate of {TYPE_CONFIG[previewCert.type]?.label || "Completion"}
                                </h2>
                                <p className="text-white/40 text-xs tracking-widest uppercase mb-6">THIS IS TO CERTIFY THAT</p>

                                <p className="text-white text-3xl font-bold font-serif mb-2">
                                    {previewCert.metadata?.recipient_name || "Student"}
                                </p>
                                <div className="w-64 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-4" />

                                <p className="text-white/50 text-sm mb-2">has successfully completed</p>
                                <p className="text-cyan-400 text-xl font-bold mb-1">{previewCert.title}</p>
                                {previewCert.description && (
                                    <p className="text-white/30 text-xs mb-4">{previewCert.description}</p>
                                )}

                                <p className="text-white/40 text-xs mt-6">
                                    Issued on {new Date(previewCert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                                <p className="text-white/20 text-[10px] font-mono mt-2">
                                    Verification: {previewCert.verification_code}
                                </p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center gap-3 px-6 py-4 border-t border-white/[0.06]">
                            <Button
                                onClick={() => downloadCertificate(previewCert)}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Certificate
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => copyVerificationLink(previewCert)}
                                className="gap-2 border-foreground/20"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                                {copied ? "Copied!" : "Copy Verify Link"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
