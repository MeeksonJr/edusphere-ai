"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, MessageSquare } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    onCreated: () => void
}

const subjects = [
    "Mathematics", "Science", "English", "History", "Computer Science",
    "Physics", "Chemistry", "Biology", "General",
]

export function CreatePostDialog({ open, onClose, onCreated }: Props) {
    const { supabase } = useSupabase()
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [subject, setSubject] = useState("")
    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState("")

    if (!open) return null

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase()
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag])
            setTagInput("")
        }
    }

    const handleCreate = async () => {
        if (!supabase || !title.trim() || !body.trim()) return
        setCreating(true)
        setError("")

        try {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) throw new Error("Not authenticated")

            const { error: insertErr } = await supabase.from("forum_posts").insert({
                title: title.trim(),
                body: body.trim(),
                author_id: authData.user.id,
                subject: subject || null,
                tags,
            })

            if (insertErr) throw insertErr

            setTitle("")
            setBody("")
            setSubject("")
            setTags([])
            onCreated()
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to create post")
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">New Forum Post</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground/40">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-foreground/60">Title *</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your question?"
                            className="mt-1 bg-white/5 border-white/10"
                        />
                    </div>

                    <div>
                        <Label className="text-sm text-foreground/60">Body *</Label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Describe your question or topic in detail... (Markdown supported)"
                            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm text-foreground placeholder:text-foreground/30 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                        />
                    </div>

                    <div>
                        <Label className="text-sm text-foreground/60">Subject</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {subjects.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setSubject(subject === s ? "" : s)}
                                    className={`px-3 py-1 rounded-full text-xs border transition-all ${subject === s
                                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                            : "bg-white/5 text-foreground/40 border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm text-foreground/60">Tags (up to 5)</Label>
                        <div className="flex gap-2 mt-1">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                placeholder="Add a tag..."
                                className="bg-white/5 border-white/10"
                            />
                            <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {tags.map((tag) => (
                                    <Badge key={tag} className="text-xs bg-white/5 text-foreground/50 border-white/10 cursor-pointer hover:bg-red-500/10 hover:text-red-400"
                                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                                    >
                                        {tag} <X className="h-2.5 w-2.5 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <Button
                        onClick={handleCreate}
                        disabled={!title.trim() || !body.trim() || creating}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                        {creating ? "Posting..." : "Create Post"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
