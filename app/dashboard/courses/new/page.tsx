"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { VisualSelect } from "@/components/shared/VisualSelect"
import { Sparkles, Loader2, Video, BookOpen, Zap, Film, Briefcase, GraduationCap, Coffee, AlignLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnimatePresence, motion } from "framer-motion"

export default function NewCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)

  const [formData, setFormData] = useState({
    topic: "",
    courseType: "quick-explainer",
    style: "professional",
  })

  // Simulated generation steps
  const generationSteps = [
    "Analyzing topic and context...",
    "Drafting course structure...",
    "Generating curriculum...",
    "Creating video scripts...",
    "Finalizing course..."
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setGenerationStep(prev => prev < generationSteps.length - 1 ? prev + 1 : prev)
      }, 2000)
    }
    return () => clearInterval(interval)
  }, [loading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setGenerationStep(0)

    try {
      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: formData.topic,
          courseType: formData.courseType,
          style: formData.style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate course")
      }

      //   toast({
      //     title: "Course generation started!",
      //     description: "Your course is being created. This may take a few minutes.",
      //   })

      // Redirect to course detail page
      router.push(`/dashboard/courses/${data.courseId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const courseTypes = [
    {
      value: "quick-explainer",
      label: "Quick Explainer",
      description: "Fast-paced, single-topic video perfect for micro-learning (1-3 min).",
      icon: Zap,
    },
    {
      value: "tutorial",
      label: "Tutorial Series",
      description: "Step-by-step instructional guide broken into chapters.",
      icon: Video,
    },
    {
      value: "full-course",
      label: "Full Course",
      description: "In-depth, comprehensive course with multiple modules (15+ min).",
      icon: BookOpen,
    },
  ]

  const styles = [
    { value: "professional", label: "Professional", description: "Clean, corporate, business-focused.", icon: Briefcase },
    { value: "academic", label: "Academic", description: "Structured, formal, educational.", icon: GraduationCap },
    { value: "cinematic", label: "Cinematic", description: "High-production feel with storytelling.", icon: Film },
    { value: "casual", label: "Casual", description: "Friendly, approachable, conversational.", icon: Coffee },
  ]

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Creating your course</h2>
        <div className="space-y-2 mb-8 h-20">
          <AnimatePresence mode="wait">
            <motion.p
              key={generationStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-lg text-cyan-400 font-medium"
            >
              {generationSteps[generationStep]}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-foreground/50">This usually takes about 30-60 seconds.</p>
        </div>

        <div className="w-full max-w-md bg-foreground/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: `${((generationStep + 1) / generationSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <AmbientBackground />

      <div className="relative z-10 p-6 md:p-8 lg:p-12 max-w-5xl mx-auto">
        {/* Header */}
        <ScrollReveal direction="up">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              Create New <span className="text-cyan-400">Course</span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Turn any topic into a professional video course in minutes. AI handles the structure, script, and narration.
            </p>
          </div>
        </ScrollReveal>

        {/* Form */}
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-8 md:p-10 border-t border-cyan-500/20 shadow-2xl shadow-cyan-900/10">
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* Topic Input */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="topic" className="text-lg font-semibold text-foreground">
                    What do you want to teach? <span className="text-cyan-500">*</span>
                  </Label>
                  <span className="text-xs text-foreground/40 bg-foreground/10 px-2 py-1 rounded-full">Required</span>
                </div>

                <div className="relative group">
                  <Textarea
                    id="topic"
                    name="topic"
                    required
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., Explain the theory of relativity to a 5-year-old, or Create a masterclass on Digital Marketing..."
                    className="min-h-[120px] bg-background/50 border-foreground/10 text-lg p-4 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all resize-none shadow-inner"
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-foreground/30 pointer-events-none">
                    AI-Powered
                  </div>
                </div>
                <p className="text-sm text-foreground/50 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-cyan-500" />
                  <span className="italic">Pro Tip: Be specific about the target audience and learning goals.</span>
                </p>
              </div>

              <div className="grid md:grid-cols-1 gap-10">
                {/* Course Type */}
                <VisualSelect
                  label="Choose Format"
                  options={courseTypes}
                  value={formData.courseType}
                  onChange={(val) => handleSelectChange("courseType", val)}
                />

                {/* Style */}
                <VisualSelect
                  label="Select Style"
                  options={styles}
                  value={formData.style}
                  onChange={(val) => handleSelectChange("style", val)}
                />
              </div>

              {/* Visual Summary */}
              <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/10 rounded-xl p-5 flex items-start gap-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 mt-1">
                  <AlignLeft className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-cyan-100">Workflow Summary</h4>
                  <div className="flex items-center gap-2 text-xs text-cyan-200/60">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Structure</span>
                    <span className="w-1 h-1 bg-cyan-500/30 rounded-full"></span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Script</span>
                    <span className="w-1 h-1 bg-cyan-500/30 rounded-full"></span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Voiceover</span>
                    <span className="w-1 h-1 bg-cyan-500/30 rounded-full"></span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Video</span>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 flex items-center justify-end gap-4 border-t border-foreground/5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-foreground/60 hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.topic.trim()}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white shadow-lg shadow-cyan-500/20 px-8"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Course
                </Button>
              </div>
            </form>
          </GlassSurface>
        </ScrollReveal>
      </div>
    </div>
  )
}


