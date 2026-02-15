"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  FileText,
  Sparkles,
  Loader2,
  ChevronLeft,
  Upload,
  X,
  Plus,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

const resourceTypes = [
  { value: "notes", label: "Study Notes", icon: FileText },
  { value: "guide", label: "Comprehensive Guide", icon: BookOpen },
  { value: "summary", label: "Topic Summary", icon: FileText },
  { value: "cheatsheet", label: "Cheat Sheet", icon: FileText },
  { value: "concepts", label: "Key Concepts", icon: BookOpen },
]

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Literature",
  "Economics",
  "Psychology",
  "Sociology",
  "Philosophy",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
  "Other",
]

export default function NewResourcePage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [generatingResource, setGeneratingResource] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    subject: "none",
    content: "",
    resource_type: "notes",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !newResource.tags.includes(tagInput.trim())) {
      setNewResource((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewResource((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleGenerateResource = async () => {
    if (!newResource.subject || !newResource.title) {
      toast({
        title: "Missing fields",
        description: "Please provide a subject and title to generate content",
        variant: "destructive",
      })
      return
    }

    try {
      setGeneratingResource(true)

      const resourceTypeLabel =
        resourceTypes.find((type) => type.value === newResource.resource_type)?.label || newResource.resource_type

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateAIResponse",
          provider: "gemini",
          prompt: `Create a comprehensive ${resourceTypeLabel} about "${newResource.title}" in the subject of ${newResource.subject}. Include key concepts, explanations, and examples.`,
          systemPrompt:
            "You are an educational AI assistant that creates high-quality study resources. Respond in markdown format.",
          maxTokens: 1600,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate content")
      }

      const content = result.data?.text || ""
      setNewResource((prev) => ({ ...prev, content }))

      toast({
        title: "Content Generated",
        description: "AI has generated content for your study resource.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      })
    } finally {
      setGeneratingResource(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newResource.title || !newResource.content) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and content",
        variant: "destructive",
      })
      return
    }

    if (!supabase) {
      toast({
        title: "Error",
        description: "Authentication service is not available",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("You must be logged in to create resources")
      }

      let imageUrl = ""

      if (imageFile) {
        setUploadingImage(true)
        const fileName = `${userData.user.id}/resources/${Date.now()}-${imageFile.name}`
        const { error: uploadError } = await supabase.storage.from("course-media").upload(fileName, imageFile, {
          upsert: true,
        })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("course-media").getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
        setUploadingImage(false)
      }

      const { error } = await supabase.from("study_resources").insert({
        user_id: userData.user.id,
        title: newResource.title,
        description: newResource.description || null,
        subject: newResource.subject === "none" ? null : newResource.subject,
        content: newResource.content,
        resource_type: newResource.resource_type,
        tags: newResource.tags,
        image_url: imageUrl || null,
        ai_generated: false,
      })

      if (error) throw error

      toast({
        title: "Resource Created!",
        description: "Your study resource has been created successfully.",
      })

      router.push("/dashboard/resources")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
      <ScrollReveal direction="up">
        <div className="mb-8">
          <Link href="/dashboard/resources">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Study Resources
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Create New Study Resource</span>
          </h1>
          <p className="text-white/70">Create a new study resource to help with your learning</p>
        </div>
      </ScrollReveal>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Resource Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Calculus Derivatives Guide"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newResource.description}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject" className="text-white">
                    Subject
                  </Label>
                  <Select
                    value={newResource.subject}
                    onValueChange={(value) => setNewResource((prev) => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger className="glass-surface border-white/20 text-white mt-1">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      <SelectItem value="none">None</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject} className="text-white">
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="resource_type" className="text-white">
                    Resource Type
                  </Label>
                  <Select
                    value={newResource.resource_type}
                    onValueChange={(value) => setNewResource((prev) => ({ ...prev, resource_type: value }))}
                  >
                    <SelectTrigger className="glass-surface border-white/20 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-surface border-white/20">
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tags" className="text-white">
                  Tags
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                    className="glass-surface border-white/20 text-white placeholder:text-white/40"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" className="border-white/20 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newResource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-200 rounded-md text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="image" className="text-white">
                  Image (Optional)
                </Label>
                {!imagePreview ? (
                  <div className="mt-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="glass-surface border-white/20 text-white"
                    />
                  </div>
                ) : (
                  <div className="mt-1 relative">
                    <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </GlassSurface>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <GlassSurface className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content" className="text-white">
                  Content *
                </Label>
                <Textarea
                  id="content"
                  value={newResource.content}
                  onChange={(e) => setNewResource((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your study resource content here..."
                  className="glass-surface border-white/20 text-white placeholder:text-white/40 mt-1"
                  rows={12}
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerateResource}
                disabled={generatingResource || !newResource.subject || !newResource.title}
                className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white"
              >
                {generatingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content with AI
                  </>
                )}
              </Button>
            </div>
          </GlassSurface>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <Link href="/dashboard/resources" className="flex-1 sm:flex-initial">
              <Button type="button" variant="ghost" className="text-white/70 hover:text-white w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || uploadingImage || !newResource.title || !newResource.content}
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white flex-1 sm:flex-initial"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingImage ? "Uploading..." : "Creating..."}
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Resource
                </>
              )}
            </Button>
          </div>
        </ScrollReveal>
      </form>
    </div>
  )
}

