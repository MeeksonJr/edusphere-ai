"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { generateStudyResource, trackAIUsage } from "@/lib/ai-service"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    const getUser = async () => {
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
      const { data, error } = await supabase.from("study_resources").insert([
        {
          user_id: user.id,
          title: newResource.title,
          description: newResource.description,
          subject: newResource.subject,
          content: newResource.content,
          resource_type: newResource.resource_type,
          tags: newResource.tags,
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
      })
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

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Get resource type label
      const resourceTypeLabel =
        resourceTypes.find((type) => type.value === newResource.resource_type)?.label || newResource.resource_type

      // Generate content
      const content = await generateStudyResource(newResource.subject, newResource.title, resourceTypeLabel)

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
    return <Icon className="h-5 w-5" />
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-blue">Study Resources</h1>
        <p className="text-gray-400 mt-1">Create and manage your study materials</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Resource
          </Button>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-gray-800 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.id} className="glass-card hover:neon-border-blue transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{resource.subject}</CardDescription>
                  </div>
                  <div className="flex items-center">{getResourceTypeIcon(resource.resource_type)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {resource.description || resource.content.substring(0, 150) + "..."}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {resource.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="bg-gray-800 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                  {resource.ai_generated && (
                    <Badge className="bg-primary/20 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-gray-700" onClick={() => handleViewResource(resource)}>
                  View Resource
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={() => downloadResource(resource)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">No resources found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || subjectFilter !== "all" || typeFilter !== "all"
              ? "Try adjusting your filters or search query."
              : "Start by creating your first study resource."}
          </p>
          <Button className="bg-primary hover:bg-primary/80" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Resource
          </Button>
        </div>
      )}

      {/* Create Resource Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Study Resource</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create your own study material or let AI generate content for you.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateResource} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  placeholder="e.g., Quantum Physics Fundamentals"
                  className="bg-gray-800 border-gray-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <Select
                  value={newResource.subject}
                  onValueChange={(value) => setNewResource({ ...newResource, subject: value })}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Brief description of this resource"
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="resource_type" className="text-sm font-medium">
                  Resource Type
                </label>
                <Select
                  value={newResource.resource_type}
                  onValueChange={(value) => setNewResource({ ...newResource, resource_type: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className="bg-gray-800 border-gray-700"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" className="border-gray-700" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {newResource.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-gray-800 text-gray-300">
                      {tag}
                      <button
                        type="button"
                        className="ml-1 text-gray-400 hover:text-white"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="text-sm font-medium">
                  Content *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateResource}
                  disabled={generatingResource || !newResource.title || !newResource.subject}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  {generatingResource ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {generatingResource ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="content"
                value={newResource.content}
                onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                placeholder="Your study content here..."
                className="bg-gray-800 border-gray-700 min-h-[200px]"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-gray-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/80">
                Create Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Resource Dialog */}
      {currentResource && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-800 sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-start">
                <DialogTitle>{currentResource.title}</DialogTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white"
                    onClick={() => downloadResource(currentResource)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteResource(currentResource.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="bg-gray-800 text-gray-300">
                  {currentResource.subject}
                </Badge>
                <Badge variant="outline" className="bg-gray-800 text-gray-300">
                  {resourceTypes.find((t) => t.value === currentResource.resource_type)?.label ||
                    currentResource.resource_type}
                </Badge>
                {currentResource.ai_generated && (
                  <Badge className="bg-primary/20 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                  </Badge>
                )}
              </div>
              {currentResource.description && (
                <DialogDescription className="text-gray-300 mt-2">{currentResource.description}</DialogDescription>
              )}
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-wrap">{currentResource.content}</div>

              {currentResource.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentResource.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="bg-gray-800 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-400">
                Created: {new Date(currentResource.created_at).toLocaleString()}
                {currentResource.updated_at !== currentResource.created_at && (
                  <span> | Updated: {new Date(currentResource.updated_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
