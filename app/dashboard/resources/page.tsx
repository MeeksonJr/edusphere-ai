"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  Bookmark,
  BookText,
  GraduationCap,
} from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

const resourceTypes = [
  { value: "notes", label: "Study Notes", icon: FileText },
  { value: "guide", label: "Comprehensive Guide", icon: BookOpen },
  { value: "summary", label: "Topic Summary", icon: BookText },
  { value: "cheatsheet", label: "Cheat Sheet", icon: Bookmark },
  { value: "concepts", label: "Key Concepts", icon: GraduationCap },
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

export default function ResourcesPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingResource, setGeneratingResource] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState<any>(null)
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    subject: "",
    content: "",
    resource_type: "notes",
    tags: [] as string[],
    image_url: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) return

      const { data } = await supabase.auth.getUser()
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
        setUser({ ...data.user, profile })
      }
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (user) {
      fetchResources()
    }
  }, [user, subjectFilter, typeFilter, searchQuery])

  const fetchResources = async () => {
    try {
      setLoading(true)
      let query = supabase.from("study_resources").select("*").eq("user_id", user.id)

      if (subjectFilter !== "all") {
        query = query.eq("subject", subjectFilter)
      }

      if (typeFilter !== "all") {
        query = query.eq("resource_type", typeFilter)
      }

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
        )
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error

      setResources(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch resources",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newResource.title || !newResource.subject || !newResource.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      let imageUrl = newResource.image_url
      
      // Upload image if provided
      if (imageFile && supabase) {
        try {
          setUploadingImage(true)
          const fileExt = imageFile.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
          // Upload to user-specific folder to match RLS policy
          const filePath = `${user.id}/resources/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("course-media")
            .upload(filePath, imageFile, { upsert: true })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from("course-media")
            .getPublicUrl(filePath)
          
          imageUrl = urlData.publicUrl
        } catch (uploadErr: any) {
          console.error("Image upload error:", uploadErr)
          toast({
            id: `image-upload-error-${Date.now()}`,
            title: "Image Upload Failed",
            description: "Resource created but image upload failed. You can add it later.",
            variant: "destructive",
          })
        } finally {
          setUploadingImage(false)
        }
      }

      const { data, error } = await supabase.from("study_resources").insert([
        {
          user_id: user.id,
          title: newResource.title,
          description: newResource.description,
          subject: newResource.subject,
          content: newResource.content,
          resource_type: newResource.resource_type,
          tags: newResource.tags,
          image_url: imageUrl || null,
          ai_generated: false,
        },
      ])

      if (error) throw error

      toast({
        title: "Resource Created",
        description: "Your study resource has been created successfully.",
      })

      setIsCreateDialogOpen(false)
      setNewResource({
        title: "",
        description: "",
        subject: "",
        content: "",
        resource_type: "notes",
        tags: [],
        image_url: "",
      })
      setImageFile(null)
      fetchResources()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create resource",
        variant: "destructive",
      })
    }
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

  const handleDeleteResource = async (id: string) => {
    try {
      const { error } = await supabase.from("study_resources").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Resource Deleted",
        description: "The study resource has been deleted successfully.",
      })

      fetchResources()
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resource",
        variant: "destructive",
      })
    }
  }

  const handleViewResource = (resource: any) => {
    setCurrentResource(resource)
    setIsViewDialogOpen(true)
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

  const downloadResource = (resource: any) => {
    const content = `# ${resource.title}
${resource.description ? `\n${resource.description}\n` : ""}
Subject: ${resource.subject}
Type: ${resource.resource_type}
${resource.tags?.length ? `Tags: ${resource.tags.join(", ")}\n` : ""}
Created: ${new Date(resource.created_at).toLocaleDateString()}

${resource.content}
`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${resource.title.replace(/\s+/g, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getResourceTypeIcon = (type: string) => {
    const resourceType = resourceTypes.find((t) => t.value === type)
    const Icon = resourceType?.icon || FileText
    return <Icon className="h-5 w-5 text-white/60" aria-hidden="true" />
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Study</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Resources
            </span>
          </h1>
          <p className="text-white/70">Create and manage your study materials</p>
        </div>
      </ScrollReveal>

      {/* Filters and Search */}
      <ScrollReveal direction="up" delay={0.1}>
        <GlassSurface className="p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-surface border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[180px] glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  <SelectItem value="all" className="text-white">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject} className="text-white">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] glass-surface border-white/20 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="glass-surface border-white/20">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => router.push("/dashboard/resources/new")}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                New Resource
              </Button>
            </div>
          </div>
        </GlassSurface>
      </ScrollReveal>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-surface p-6 animate-pulse">
              <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <ScrollReveal key={resource.id} direction="up" delay={0.05 * index}>
              <AnimatedCard variant="3d" delay={0.05 * index} className="cursor-pointer group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-white/60 truncate">{resource.subject}</p>
                    </div>
                    <div className="flex items-center ml-2">{getResourceTypeIcon(resource.resource_type)}</div>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-3 mb-4">
                    {resource.description || resource.content.substring(0, 150) + "..."}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags?.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} className="glass-surface border-white/10 text-white/80 text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {resource.ai_generated && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" aria-hidden="true" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass-surface border-white/20 hover:border-blue-500/50 text-white"
                      onClick={() => handleViewResource(resource)}
                    >
                      View Resource
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white"
                      onClick={() => downloadResource(resource)}
                      aria-label="Download resource"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal direction="up">
          <GlassSurface className="p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-white/20 mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-white mb-2">No resources found</h3>
            <p className="text-white/60 mb-6">
              {searchQuery || subjectFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Start by creating your first study resource."}
            </p>
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              onClick={() => router.push("/dashboard/resources/new")}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Resource
            </Button>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-surface border-white/20 sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-white">Create New Study Resource</DialogTitle>
            <DialogDescription className="text-white/70">
              Create your own study material or let AI generate content for you.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateResource} className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-white mb-2 block">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g., Quantum Physics Fundamentals"
                  className="glass-surface border-white/20 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject" className="text-white mb-2 block">
                  Subject <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={newResource.subject}
                  onValueChange={(value) => setNewResource({ ...newResource, subject: value })}
                  required
                >
                  <SelectTrigger className="glass-surface border-white/20 text-white">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent className="glass-surface border-white/20">
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject} className="text-white">
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-white mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Brief description of this resource"
                className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource_type" className="text-white mb-2 block">
                  Resource Type
                </Label>
                <Select
                  value={newResource.resource_type}
                  onValueChange={(value) => setNewResource({ ...newResource, resource_type: value })}
                >
                  <SelectTrigger className="glass-surface border-white/20 text-white">
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

              <div>
                <Label htmlFor="tags" className="text-white mb-2 block">
                  Tags
                </Label>
                <div className="flex gap-2">
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
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    className="glass-surface border-white/20 hover:border-blue-500/50 text-white"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                {newResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newResource.tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="glass-surface border-white/10 text-white/80"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <span className="ml-2 cursor-pointer">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="content" className="text-white mb-2 block">
                Content <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="content"
                value={newResource.content}
                onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                placeholder="Enter your study resource content..."
                rows={8}
                className="glass-surface border-white/20 text-white placeholder:text-white/40 resize-none font-mono text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-white mb-2 block">
                Image (Optional)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="glass-surface border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                  disabled={uploadingImage}
                />
                {imageFile && (
                  <Badge className="glass-surface border-white/10 text-white/80">
                    {imageFile.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateResource}
                disabled={generatingResource || !newResource.subject || !newResource.title}
                className="flex-1 glass-surface border-white/20 hover:border-purple-500/50 text-white"
              >
                {generatingResource ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>

            <DialogFooter className="flex-shrink-0 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                className="glass-surface border-white/20 text-white hover:bg-white/10"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                Create Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Resource Dialog */}
      {currentResource && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="glass-surface border-white/20 sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-white">{currentResource.title}</DialogTitle>
                  <DialogDescription className="text-white/70">
                    {currentResource.subject} • {resourceTypes.find((t) => t.value === currentResource.resource_type)?.label}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white"
                    onClick={() => downloadResource(currentResource)}
                    aria-label="Download resource"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => {
                      handleDeleteResource(currentResource.id)
                    }}
                    aria-label="Delete resource"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {currentResource.description && (
                <p className="text-white/80">{currentResource.description}</p>
              )}
              {currentResource.tags && currentResource.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentResource.tags.map((tag: string) => (
                    <Badge key={tag} className="glass-surface border-white/10 text-white/80">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="glass-surface border-white/10 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-white/90 font-mono text-sm leading-relaxed">
                  {currentResource.content}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

