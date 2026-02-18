'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { VisualSelect } from '@/components/shared/VisualSelect'
import {
    Zap,
    Video,
    BookOpen,
    Briefcase,
    GraduationCap,
    Film,
    Coffee,
    Sparkles,
    Loader2,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface GenerateCourseModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionTopic: string
    sessionType: string
    keyConceptsFromAnalysis: string[]
    areasToImprove: string[]
}

const courseTypes = [
    {
        value: 'quick-explainer',
        label: 'Quick Explainer',
        description: '1–3 chapters, fast-paced micro-course (1-3 min)',
        icon: Zap,
    },
    {
        value: 'tutorial',
        label: 'Tutorial Series',
        description: 'Step-by-step instructional guide (5-10 min)',
        icon: Video,
    },
    {
        value: 'full-course',
        label: 'Full Course',
        description: 'In-depth, multi-module course (15+ min)',
        icon: BookOpen,
    },
]

const courseStyles = [
    { value: 'professional', label: 'Professional', description: 'Clean, corporate, business-focused', icon: Briefcase },
    { value: 'academic', label: 'Academic', description: 'Structured, formal, educational', icon: GraduationCap },
    { value: 'cinematic', label: 'Cinematic', description: 'Storytelling, high-production feel', icon: Film },
    { value: 'casual', label: 'Casual', description: 'Friendly, conversational, approachable', icon: Coffee },
]

const generationSteps = [
    'Analyzing session content...',
    'Drafting course structure...',
    'Generating curriculum...',
    'Creating scripts...',
    'Finalizing course...',
]

export function GenerateCourseModal({
    open,
    onOpenChange,
    sessionTopic,
    sessionType,
    keyConceptsFromAnalysis,
    areasToImprove,
}: GenerateCourseModalProps) {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [generating, setGenerating] = useState(false)
    const [genStep, setGenStep] = useState(0)

    // Build suggested topic from session data
    const suggestedTopic = [
        sessionTopic,
        keyConceptsFromAnalysis.length
            ? `\n\nKey concepts to cover: ${keyConceptsFromAnalysis.join(', ')}`
            : '',
        areasToImprove.length
            ? `\n\nAreas that need deeper coverage: ${areasToImprove.join(', ')}`
            : '',
    ].join('')

    const [formData, setFormData] = useState({
        topic: suggestedTopic,
        courseType: 'tutorial',
        style: 'academic',
    })

    const handleGenerate = async () => {
        setGenerating(true)
        setGenStep(0)

        const interval = setInterval(() => {
            setGenStep(prev => (prev < generationSteps.length - 1 ? prev + 1 : prev))
        }, 2000)

        try {
            const res = await fetch('/api/courses/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: formData.topic,
                    courseType: formData.courseType,
                    style: formData.style,
                }),
            })

            const data = await res.json()
            clearInterval(interval)

            if (!res.ok) throw new Error(data.error || 'Failed to generate course')

            // Redirect to the new course
            onOpenChange(false)
            router.push(`/dashboard/courses/${data.courseId}`)
        } catch (e: any) {
            clearInterval(interval)
            setGenerating(false)
            alert(e.message || 'Failed to generate course. Try again.')
        }
    }

    const canProceed = step === 0
        ? formData.topic.trim().length > 5
        : true

    if (generating) {
        return (
            <Dialog open={open} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-2xl border-white/10">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse" />
                            <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin" />
                            <div className="absolute inset-3 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                                <Sparkles className="h-7 w-7 text-cyan-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Creating your course</h3>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={genStep}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="text-sm text-cyan-400 font-medium"
                            >
                                {generationSteps[genStep]}
                            </motion.p>
                        </AnimatePresence>
                        <p className="text-xs text-foreground/40 mt-2">Usually takes 30–60 seconds</p>
                        <div className="w-full max-w-xs bg-foreground/5 rounded-full h-1.5 overflow-hidden mt-4">
                            <motion.div
                                className="h-full bg-gradient-to-r from-cyan-400 to-pink-500"
                                initial={{ width: '0%' }}
                                animate={{ width: `${((genStep + 1) / generationSteps.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-2xl border-white/10 max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-cyan-400" />
                        Generate Course from Session
                    </DialogTitle>
                    <DialogDescription>
                        Turn your tutoring session into a structured course
                    </DialogDescription>
                </DialogHeader>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-2">
                    {['Topic', 'Format', 'Review'].map((label, i) => (
                        <div key={label} className="flex items-center gap-2 flex-1">
                            <div className={`flex items-center gap-1.5 ${i <= step ? 'text-cyan-400' : 'text-foreground/20'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${i < step
                                    ? 'bg-cyan-500 border-cyan-500 text-white'
                                    : i === step
                                        ? 'border-cyan-500 text-cyan-400'
                                        : 'border-foreground/10 text-foreground/30'
                                    }`}>
                                    {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                                </div>
                                <span className="text-xs font-medium hidden sm:inline">{label}</span>
                            </div>
                            {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-cyan-500' : 'bg-foreground/10'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Topic */}
                {step === 0 && (
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground/70">
                            What should this course teach?
                        </label>
                        <Textarea
                            value={formData.topic}
                            onChange={e => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                            placeholder="e.g., Introduction to Machine Learning fundamentals..."
                            rows={4}
                            className="bg-background/50 border-foreground/10 focus:border-cyan-500/50 resize-none text-sm"
                        />
                        <p className="text-[11px] text-foreground/30 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-cyan-500" />
                            Pre-filled from your session content. Edit as needed.
                        </p>
                    </div>
                )}

                {/* Step 2: Format */}
                {step === 1 && (
                    <div className="space-y-4">
                        <VisualSelect
                            label="Course Format"
                            options={courseTypes}
                            value={formData.courseType}
                            onChange={val => setFormData(prev => ({ ...prev, courseType: val }))}
                        />
                        <VisualSelect
                            label="Teaching Style"
                            options={courseStyles}
                            value={formData.style}
                            onChange={val => setFormData(prev => ({ ...prev, style: val }))}
                        />
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 2 && (
                    <div className="space-y-3">
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-foreground/40">Topic</span>
                                <button onClick={() => setStep(0)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                            </div>
                            <p className="text-sm text-foreground/80 line-clamp-3">{formData.topic}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                <span className="text-[10px] text-foreground/40 uppercase tracking-wider">Format</span>
                                <p className="text-sm text-foreground/80 mt-0.5">
                                    {courseTypes.find(t => t.value === formData.courseType)?.label}
                                </p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                <span className="text-[10px] text-foreground/40 uppercase tracking-wider">Style</span>
                                <p className="text-sm text-foreground/80 mt-0.5">
                                    {courseStyles.find(s => s.value === formData.style)?.label}
                                </p>
                            </div>
                        </div>
                        <div className="bg-cyan-950/30 border border-cyan-500/10 rounded-xl p-3 flex items-start gap-3">
                            <Sparkles className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-cyan-200/60">
                                AI will generate a full course structure with chapters, slides, narration scripts, and estimated durations based on your session content.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => step === 0 ? onOpenChange(false) : setStep(s => s - 1)}
                        className="text-foreground/50 hover:text-foreground"
                    >
                        {step === 0 ? 'Cancel' : <><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back</>}
                    </Button>

                    {step < 2 ? (
                        <Button
                            size="sm"
                            disabled={!canProceed}
                            onClick={() => setStep(s => s + 1)}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                        >
                            Next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={handleGenerate}
                            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white shadow-lg shadow-cyan-500/20"
                        >
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            Generate Course
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
