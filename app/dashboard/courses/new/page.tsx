"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Sparkles, Loader2, Video, BookOpen, Zap, Film } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    topic: "",
    courseType: "quick-explainer",
    style: "professional",
  })

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

      toast({
        title: "Course generation started!",
        description: "Your course is being created. This may take a few minutes.",
      })

      // Redirect to course detail page
      router.push(`/dashboard/courses/${data.courseId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const courseTypes = [
    {
      value: "quick-explainer",
      label: "Quick Explainer",
      description: "Single-topic focused video (1-3 chapters)",
      icon: Zap,
    },
    {
      value: "full-course",
      label: "Full Course",
      description: "Comprehensive multi-chapter course (5-20 chapters)",
      icon: BookOpen,
    },
    {
      value: "tutorial",
      label: "Tutorial Series",
      description: "Step-by-step instructional content",
      icon: Video,
    },
  ]

  const styles = [
    { value: "professional", label: "Professional", description: "Corporate and business-focused" },
    { value: "cinematic", label: "Cinematic", description: "Storytelling and engaging" },
    { value: "casual", label: "Casual", description: "Friendly and approachable" },
    { value: "academic", label: "Academic", description: "Formal and educational" },
  ]

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Create New </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Course
            </span>
          </h1>
          <p className="text-white/70">
            Enter a topic and let AI generate a complete course with slides, narration, and captions
          </p>
        </div>
      </ScrollReveal>

      {/* Form */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div>
              <Label htmlFor="topic" className="text-white mb-2 block">
                Course Topic <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="topic"
                name="topic"
                required
                value={formData.topic}
                onChange={handleChange}
                placeholder="e.g., Introduction to Quantum Computing, How to Build a React App, The History of Ancient Rome..."
                className="min-h-[120px] glass-surface border-white/20 text-white placeholder:text-white/40"
                rows={4}
              />
              <p className="text-white/60 text-sm mt-2">
                Be specific! The more details you provide, the better the course will be.
              </p>
            </div>

            {/* Course Type */}
            <div>
              <Label htmlFor="courseType" className="text-white mb-2 block">
                Course Type <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.courseType}
                onValueChange={(value) => handleSelectChange("courseType", value)}
              >
                <SelectTrigger className="glass-surface border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-white/60">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Style */}
            <div>
              <Label htmlFor="style" className="text-white mb-2 block">
                Style Preset
              </Label>
              <Select
                value={formData.style}
                onValueChange={(value) => handleSelectChange("style", value)}
              >
                <SelectTrigger className="glass-surface border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-white/60">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Film className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-400 font-semibold text-sm mb-1">What happens next?</p>
                  <ul className="text-white/70 text-sm space-y-1 list-disc list-inside">
                    <li>AI generates a comprehensive course layout with chapters and slides</li>
                    <li>Content and narration scripts are created for each slide</li>
                    <li>Text-to-speech generates voiceovers</li>
                    <li>Captions are automatically synchronized</li>
                    <li>You can preview and edit before finalizing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.topic.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Course
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassSurface>
      </ScrollReveal>
    </div>
  )
}

