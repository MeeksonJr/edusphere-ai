"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Save,
    Eye,
    Edit3,
    Clock,
    Tag,
    Bold,
    Italic,
    List,
    ListOrdered,
    Code,
    Link2,
    Heading1,
    Heading2,
    Quote,
    Minus,
    X,
    ChevronLeft,
    Sparkles,
} from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { AmbientBackground } from "@/components/shared/AmbientBackground"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Note {
    id: string
    title: string
    content: string
    subject: string | null
    tags: string[]
    ai_generated: boolean
    updated_at: string
    created_at: string
}

const SUBJECTS = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "History", "Geography", "Literature", "Economics", "Psychology",
    "Philosophy", "Art", "Music", "Other"
]

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [search, setSearch] = useState("")
    const [saving, setSaving] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    // Editor state
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")
    const [editSubject, setEditSubject] = useState("")
    const [editTags, setEditTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const editorRef = useRef<HTMLTextAreaElement>(null)
    const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

    // Fetch notes
    const fetchNotes = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set("search", search)
            const res = await fetch(`/api/notes?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setNotes(data.notes)
            }
        } catch (err) {
            console.error("Failed to fetch notes:", err)
        }
        setLoading(false)
    }, [search])

    useEffect(() => {
        fetchNotes()
    }, [fetchNotes])

    // Create new note
    const createNote = async () => {
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Untitled Note", content: "" }),
            })
            if (res.ok) {
                const data = await res.json()
                setNotes(prev => [data.note, ...prev])
                openEditor(data.note)
                setIsCreating(false)
            }
        } catch (err) {
            console.error("Failed to create note:", err)
        }
    }

    // Open note in editor
    const openEditor = (note: Note) => {
        setSelectedNote(note)
        setEditTitle(note.title)
        setEditContent(note.content)
        setEditSubject(note.subject || "")
        setEditTags(note.tags || [])
        setIsEditing(true)
        setShowPreview(false)
    }

    // Save note
    const saveNote = async () => {
        if (!selectedNote) return
        setSaving(true)
        try {
            const res = await fetch("/api/notes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedNote.id,
                    title: editTitle,
                    content: editContent,
                    subject: editSubject || null,
                    tags: editTags,
                }),
            })
            if (res.ok) {
                const data = await res.json()
                setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n))
                setSelectedNote(data.note)
            }
        } catch (err) {
            console.error("Failed to save note:", err)
        }
        setSaving(false)
    }

    // Auto-save on content change
    useEffect(() => {
        if (!isEditing || !selectedNote) return
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => {
            saveNote()
        }, 2000)
        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        }
    }, [editContent, editTitle])

    // Delete note
    const deleteNote = async (id: string) => {
        try {
            await fetch("/api/notes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            })
            setNotes(prev => prev.filter(n => n.id !== id))
            if (selectedNote?.id === id) {
                setSelectedNote(null)
                setIsEditing(false)
            }
        } catch (err) {
            console.error("Failed to delete note:", err)
        }
    }

    // Markdown toolbar insert helpers
    const insertMarkdown = (before: string, after: string = "") => {
        const textarea = editorRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selected = editContent.substring(start, end)
        const replacement = `${before}${selected || "text"}${after}`
        const newContent = editContent.substring(0, start) + replacement + editContent.substring(end)
        setEditContent(newContent)
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, start + before.length + (selected || "text").length)
        }, 10)
    }

    // Add tag
    const addTag = () => {
        const t = tagInput.trim()
        if (t && !editTags.includes(t)) {
            setEditTags([...editTags, t])
        }
        setTagInput("")
    }

    // Simple markdown → HTML renderer
    const renderMarkdown = (md: string): string => {
        let html = md
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono text-cyan-300"><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-white/[0.05] px-1.5 py-0.5 rounded text-sm text-pink-400 font-mono">$1</code>')
            // Headers
            .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-foreground mt-4 mb-2">$1</h3>')
            .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h2>')
            .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
            // Bold & italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em class="text-foreground/80 italic">$1</em>')
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote class="border-l-3 border-cyan-500/50 pl-4 py-1 my-2 text-foreground/60 italic">$1</blockquote>')
            // Horizontal rules
            .replace(/^---$/gm, '<hr class="border-white/[0.08] my-4" />')
            // Unordered lists
            .replace(/^- (.+)$/gm, '<li class="ml-4 text-foreground/70 list-disc">$1</li>')
            // Ordered lists
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-foreground/70 list-decimal">$1</li>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-400 underline hover:text-cyan-300" target="_blank">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '<div class="h-3"></div>')
            .replace(/\n/g, '<br />')
        return html
    }

    // Time ago helper
    function timeAgo(dateStr: string): string {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return "Just now"
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    // Word count
    const wordCount = editContent.trim() ? editContent.trim().split(/\s+/).length : 0

    return (
        <div className="relative min-h-screen p-6 md:p-8 lg:p-12 pb-32">
            <AmbientBackground />

            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="text-foreground">Knowledge </span>
                            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Base
                            </span>
                        </h1>
                        <p className="text-foreground/60">
                            {notes.length} note{notes.length !== 1 ? "s" : ""} in your collection
                        </p>
                    </div>

                    <Button
                        onClick={createNote}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Note
                    </Button>
                </div>
            </ScrollReveal>

            <div className="flex gap-6 min-h-[70vh]">
                {/* Sidebar — Note List */}
                <ScrollReveal direction="up" delay={0.05}>
                    <div className={cn(
                        "w-72 shrink-0 flex flex-col gap-3",
                        isEditing && "hidden md:flex"
                    )}>
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                            <Input
                                placeholder="Search notes…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white/[0.03] border-white/[0.08]"
                            />
                        </div>

                        {/* Notes List */}
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[65vh] pr-1">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent" />
                                </div>
                            ) : notes.length > 0 ? (
                                notes.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => openEditor(note)}
                                        className={cn(
                                            "group px-3 py-2.5 rounded-lg cursor-pointer transition-all border",
                                            selectedNote?.id === note.id
                                                ? "bg-cyan-500/10 border-cyan-500/20"
                                                : "bg-white/[0.02] border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-medium text-foreground truncate flex-1">
                                                {note.title || "Untitled"}
                                            </h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNote(note.id) }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-foreground/30 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-foreground/30 truncate mt-0.5">
                                            {note.content?.slice(0, 80) || "Empty note"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-foreground/20 flex items-center gap-0.5">
                                                <Clock className="h-2.5 w-2.5" />
                                                {timeAgo(note.updated_at)}
                                            </span>
                                            {note.ai_generated && (
                                                <span className="text-[10px] text-purple-400/60 flex items-center gap-0.5">
                                                    <Sparkles className="h-2.5 w-2.5" />
                                                    AI
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-foreground/30">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No notes yet</p>
                                    <p className="text-xs mt-1">Create one to get started</p>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Editor / Preview */}
                <div className="flex-1 min-w-0">
                    {isEditing && selectedNote ? (
                        <ScrollReveal direction="up" delay={0.1}>
                            <GlassSurface className="flex flex-col h-[75vh]">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <button
                                            className="md:hidden text-foreground/50 hover:text-foreground"
                                            onClick={() => { setIsEditing(false); setSelectedNote(null) }}
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <input
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            placeholder="Note title…"
                                            className="text-lg font-semibold text-foreground bg-transparent border-none outline-none flex-1 min-w-0"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {saving && (
                                            <span className="text-[10px] text-cyan-400 animate-pulse">Saving…</span>
                                        )}
                                        <span className="text-[10px] text-foreground/20">{wordCount} words</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={cn("text-xs gap-1", showPreview && "text-cyan-400")}
                                        >
                                            {showPreview ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            {showPreview ? "Edit" : "Preview"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={saveNote}
                                            className="bg-cyan-500 text-white hover:bg-cyan-600 text-xs gap-1"
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            Save
                                        </Button>
                                    </div>
                                </div>

                                {/* Toolbar */}
                                {!showPreview && (
                                    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-white/[0.04] overflow-x-auto">
                                        {[
                                            { icon: Heading1, action: () => insertMarkdown("# "), tip: "H1" },
                                            { icon: Heading2, action: () => insertMarkdown("## "), tip: "H2" },
                                            { icon: Bold, action: () => insertMarkdown("**", "**"), tip: "Bold" },
                                            { icon: Italic, action: () => insertMarkdown("*", "*"), tip: "Italic" },
                                            { icon: Code, action: () => insertMarkdown("`", "`"), tip: "Code" },
                                            { icon: Quote, action: () => insertMarkdown("> "), tip: "Quote" },
                                            { icon: List, action: () => insertMarkdown("- "), tip: "List" },
                                            { icon: ListOrdered, action: () => insertMarkdown("1. "), tip: "Ordered" },
                                            { icon: Link2, action: () => insertMarkdown("[", "](url)"), tip: "Link" },
                                            { icon: Minus, action: () => insertMarkdown("\n---\n"), tip: "Divider" },
                                        ].map((btn, i) => (
                                            <button
                                                key={i}
                                                onClick={btn.action}
                                                title={btn.tip}
                                                className="p-1.5 rounded hover:bg-white/[0.05] text-foreground/40 hover:text-foreground/70 transition-colors"
                                            >
                                                <btn.icon className="h-4 w-4" />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Content Area */}
                                <div className="flex-1 overflow-auto">
                                    {showPreview ? (
                                        <div
                                            className="p-6 prose prose-invert max-w-none text-foreground/70 text-sm leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
                                        />
                                    ) : (
                                        <textarea
                                            ref={editorRef}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            placeholder="Start writing in Markdown…&#10;&#10;# Heading&#10;**Bold** and *italic* text&#10;- List items&#10;`inline code`&#10;```code blocks```"
                                            className="w-full h-full resize-none bg-transparent text-foreground/80 text-sm font-mono leading-relaxed p-6 outline-none placeholder:text-foreground/15"
                                            spellCheck={false}
                                        />
                                    )}
                                </div>

                                {/* Footer — Tags & Subject */}
                                <div className="flex items-center gap-3 px-4 py-2.5 border-t border-white/[0.06] text-xs">
                                    {/* Subject */}
                                    <select
                                        value={editSubject}
                                        onChange={(e) => setEditSubject(e.target.value)}
                                        className="bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-foreground/60 text-xs outline-none"
                                    >
                                        <option value="">No subject</option>
                                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>

                                    {/* Tags */}
                                    <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
                                        <Tag className="h-3 w-3 text-foreground/30 shrink-0" />
                                        {editTags.map(t => (
                                            <span
                                                key={t}
                                                className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] shrink-0"
                                            >
                                                {t}
                                                <button onClick={() => setEditTags(editTags.filter(tag => tag !== t))}>
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                        <input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                            placeholder="Add tag…"
                                            className="bg-transparent text-foreground/40 text-[10px] outline-none min-w-[60px] max-w-[100px]"
                                        />
                                    </div>
                                </div>
                            </GlassSurface>
                        </ScrollReveal>
                    ) : (
                        <ScrollReveal direction="up" delay={0.1}>
                            <GlassSurface className="flex flex-col items-center justify-center h-[75vh]">
                                <FileText className="h-16 w-16 text-foreground/10 mb-4" />
                                <h3 className="text-xl font-semibold text-foreground/50 mb-2">Select a note</h3>
                                <p className="text-sm text-foreground/30 mb-6">
                                    Choose a note from the sidebar or create a new one
                                </p>
                                <Button
                                    onClick={createNote}
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create New Note
                                </Button>
                            </GlassSurface>
                        </ScrollReveal>
                    )}
                </div>
            </div>
        </div>
    )
}
