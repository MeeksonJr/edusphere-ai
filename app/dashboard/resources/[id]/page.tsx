"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Download, Copy, Check, Edit2, Save, Trash2, Sparkles, Loader2, BookOpen } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { generateStudyResource, trackAIUsage } from "@/lib/ai-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

const resourceTypes = [
  { value: "notes", label: "Study Notes" },
  { value: "guide", label: "Comprehensive Guide" },
  { value: "summary", label: "Topic Summary" },
  { value: "cheatsheet", label: "Cheat Sheet" },
  { value: "concepts", label: "Key Concepts" },
]

export default function ResourceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [resource, setResource] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [editedResource, setEditedResource] = useState({
    title: "",
    description: "",
    subject: "",
    content: "",
    resource_type: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [huggingFaceModel, setHuggingFaceModel] = useState("google/flan-t5-base")

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
      fetchResource()
    }
  }, [user, params.id])

  const fetchResource = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("study_resources").select("*").eq("id", params.id).single()

      if (error) throw error

      setResource(data)
      setEditedResource({
        title: data.title || "",
        description: data.description || "",
        subject: data.subject || "",
        content: data.content || "",
        resource_type: data.resource_type || "notes",
        tags: data.tags || [],
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch resource",
        variant: "destructive",
      })
      router.push("/dashboard/resources")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setSaving(true)

      if (!editedResource.title || !editedResource.subject || !editedResource.content) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from("study_resources")
        .update({
          title: editedResource.title,
          description: editedResource.description,
          subject: editedResource.subject,
          content: editedResource.content,
          resource_type: editedResource.resource_type,
          tags: editedResource.tags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) throw error

      setResource({
        ...resource,
        ...editedResource,
        updated_at: new Date().toISOString(),
      })

      setEditing(false)

      toast({
        title: "Resource Updated",
        description: "Your study resource has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update resource",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResource = async () => {
    try {
      setSaving(true)

      const { error } = await supabase.from("study_resources").delete().eq("id", params.id)

      if (error) throw error

      toast({
        title: "Resource Deleted",
        description: "The study resource has been deleted successfully.",
      })

      router.push("/dashboard/resources")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete resource",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !editedResource.tags.includes(tagInput.trim())) {
      setEditedResource((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setEditedResource((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(true)
    setTimeout(() => setCopiedText(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const downloadResource = () => {
    const content = `# ${resource.title}
${resource.description ? `\n${resource.description}\n` : ""}
Subject: ${resource.subject}
Type: ${resource.resource_type}
${resource.tags?.length ? `Tags: ${resource.tags.join(", ")}\n` : ""}
Created: ${new Date(resource.created_at).toLocaleDateString()}
${resource.updated_at !== resource.created_at ? `Updated: ${new Date(resource.updated_at).toLocaleDateString()}\n` : ""}

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

  const enhanceWithHuggingFace = async () => {
    try {
      setGenerating(true)

      if (!user) throw new Error("You must be logged in to use the AI features")

      // Track AI usage
      await trackAIUsage(supabase, user.id)

      // Get resource type label
      const resourceTypeLabel =
        resourceTypes.find((type) => type.value === resource.resource_type)?.label || resource.resource_type

      // Generate enhanced content
      const enhancedContent = await generateStudyResource(
        resource.subject,
        resource.title,
        resourceTypeLabel,
        huggingFaceModel,
      )

      // Update the resource with enhanced content
      setEditedResource((prev) => ({
        ...prev,
        content: enhancedContent,
      }))

      setEditing(true)

      toast({
        title: "Content Enhanced",
        description: "AI has enhanced your study resource content.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enhance content",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Link href="/dashboard/resources" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Resources
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold neon-text-blue">{resource.title}</h1>
          <div className="flex space-x-2">
            {!editing ? (
              <>
                <Button variant="outline" className="border-gray-700" onClick={() => setEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button variant="outline" className="border-gray-700" onClick={downloadResource}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button
                  variant="outline"
                  className="border-red-900 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="border-gray-700" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-primary/80" onClick={handleSaveChanges} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <Badge variant="outline" className="bg-gray-800 text-gray-300">
            {resource.subject}
          </Badge>
          <Badge variant="outline" className="bg-gray-800 text-gray-300">
            {resourceTypes.find((t) => t.value === resource.resource_type)?.label || resource.resource_type}
          </Badge>
          {resource.ai_generated && (
            <Badge className="bg-primary/20 text-primary">
              <Sparkles className="h-3 w-3 mr-1" /> AI Generated
            </Badge>
          )}
        </div>
      </div>

      {!editing ? (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle>Resource Content</CardTitle>
            {resource.description && <CardDescription>{resource.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="bg-gray-800 rounded-lg p-6 whitespace-pre-wrap relative">
              {resource.content}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-7 text-xs text-gray-400 hover:text-white"
                onClick={() => copyToClipboard(resource.content)}
              >
                {copiedText ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copiedText ? "Copied" : "Copy"}
              </Button>
            </div>

            {resource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {resource.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="bg-gray-800 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-gray-800 pt-6">
              <h3 className="text-lg font-medium mb-4">Enhance with AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="huggingface-model" className="block text-sm font-medium mb-2">
                    Hugging Face Model
                  </label>
                  <Select value={huggingFaceModel} onValueChange={setHuggingFaceModel}>
                    <SelectTrigger id="huggingface-model" className="bg-gray-900 border-gray-700">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google/flan-t5-base">Flan-T5 Base (General)</SelectItem>
                      <SelectItem value="facebook/bart-large-mnli">BART Large (Classification)</SelectItem>
                      <SelectItem value="t5-base">T5 Base (Summarization)</SelectItem>
                      <SelectItem value="deepset/roberta-base-squad2">RoBERTa (Question Answering)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="bg-primary hover:bg-primary/80 w-full"
                    onClick={enhanceWithHuggingFace}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {generating ? "Enhancing..." : "Enhance with Hugging Face"}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Use Hugging Face AI models to enhance, expand, or improve your study resource content.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle>Edit Resource</CardTitle>
            <CardDescription>Update your study resource information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={editedResource.title}
                    onChange={(e) => setEditedResource({ ...editedResource, title: e.target.value })}
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
                    value={editedResource.subject}
                    onValueChange={(value) => setEditedResource({ ...editedResource, subject: value })}
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
                  value={editedResource.description}
                  onChange={(e) => setEditedResource({ ...editedResource, description: e.target.value })}
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
                    value={editedResource.resource_type}
                    onValueChange={(value) => setEditedResource({ ...editedResource, resource_type: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    {editedResource.tags.map((tag) => (
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
                <label htmlFor="content" className="text-sm font-medium">
                  Content *
                </label>
                <Textarea
                  id="content"
                  value={editedResource.content}
                  onChange={(e) => setEditedResource({ ...editedResource, content: e.target.value })}
                  placeholder="Your study content here..."
                  className="bg-gray-800 border-gray-700 min-h-[300px]"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Resource Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Created</h3>
              <p>{new Date(resource.created_at).toLocaleString()}</p>
            </div>
            {resource.updated_at !== resource.created_at && (
              <div>
                <h3 className="text-sm font-medium text-gray-400">Last Updated</h3>
                <p>{new Date(resource.updated_at).toLocaleString()}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-400">Created By</h3>
              <p>{user?.profile?.full_name || user?.email || "You"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Word Count</h3>
              <p>{resource.content.split(/\s+/).length} words</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <h3 className="text-lg font-medium mb-4">Related Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-gray-700 justify-start"
                onClick={() => router.push("/dashboard/resources")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse All Resources
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 justify-start"
                onClick={() => router.push("/dashboard/ai-lab")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Content in AI Lab
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this resource?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your study resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteResource}
              disabled={saving}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
