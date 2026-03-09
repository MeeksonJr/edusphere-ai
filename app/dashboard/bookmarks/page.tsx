"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Bookmark, Folder, Plus, Search, Tag, ExternalLink, MoreVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BookmarkItem {
    id: string
    url: string
    title: string
    description: string
    folder: string
    tags: string[]
    favicon_url: string
    created_at: string
}

export default function BookmarksPage() {
    const { supabase } = useSupabase()

    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFolder, setActiveFolder] = useState<string>("All")
    
    // Add bookmark modal state
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newUrl, setNewUrl] = useState("")
    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [newFolder, setNewFolder] = useState("Uncategorized")
    const [newTagsStr, setNewTagsStr] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchBookmarks = useCallback(async () => {
        setLoading(true)
        try {
            let url = "/api/bookmarks"
            const params = new URLSearchParams()
            if (activeFolder !== "All") params.append("folder", activeFolder)
            if (searchQuery) params.append("search", searchQuery)
            
            if (params.toString()) {
                url += `?${params.toString()}`
            }

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setBookmarks(data.bookmarks || [])
            }
        } catch (e) {
            console.error("Failed to fetch bookmarks:", e)
        } finally {
            setLoading(false)
        }
    }, [activeFolder, searchQuery])

    useEffect(() => {
        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchBookmarks()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchBookmarks])

    const handleAddBookmark = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newUrl) return

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/bookmarks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: newUrl,
                    title: newTitle,
                    description: newDesc,
                    folder: newFolder,
                    tags: newTagsStr.split(",").map(t => t.trim()).filter(Boolean)
                })
            })

            if (res.ok) {
                setIsAddOpen(false)
                setNewUrl("")
                setNewTitle("")
                setNewDesc("")
                setNewFolder("Uncategorized")
                setNewTagsStr("")
                fetchBookmarks()
            }
        } catch (error) {
            console.error("Error adding bookmark:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("Are you sure you want to delete this bookmark?")) return

        try {
            const res = await fetch("/api/bookmarks", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            if (res.ok) {
                setBookmarks(prev => prev.filter(b => b.id !== id))
            }
        } catch (error) {
            console.error("Error deleting bookmark:", error)
        }
    }

    // Extract unique folders to build the sidebar
    const allUniqueFolders = Array.from(new Set(bookmarks.map(b => b.folder).concat(["Uncategorized"])))

    return (
        <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
            {/* Sidebar / Folders */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
                        <Bookmark className="h-6 w-6 text-indigo-400" />
                        Bookmarks
                    </h1>
                    <p className="text-sm text-gray-400">Save and organize your resources.</p>
                </div>

                <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bookmark
                </Button>

                <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Folders</h3>
                    <button
                        onClick={() => setActiveFolder("All")}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeFolder === "All" 
                            ? "bg-indigo-500/20 text-indigo-300 font-medium" 
                            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4" />
                            All Bookmarks
                        </div>
                    </button>
                    {allUniqueFolders.map(folder => (
                        <button
                            key={folder}
                            onClick={() => setActiveFolder(folder)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                activeFolder === folder 
                                ? "bg-indigo-500/20 text-indigo-300 font-medium" 
                                : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4" />
                                {folder}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search bookmarks by title or description..."
                        className="w-full bg-gray-900/50 border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-40 bg-gray-800/30 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-700/50 rounded-2xl bg-gray-800/10">
                        <Bookmark className="h-12 w-12 text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">No bookmarks found</h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-sm">
                            {searchQuery ? "Try adjusting your search or filters." : "Start saving useful links and resources for your studies."}
                        </p>
                        {!searchQuery && (
                            <Button 
                                variant="outline" 
                                className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                                onClick={() => setIsAddOpen(true)}
                            >
                                Add Your First Bookmark
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookmarks.map(bookmark => (
                            <a 
                                key={bookmark.id}
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-gray-800/40 hover:bg-gray-800/70 border border-gray-700/50 hover:border-indigo-500/30 rounded-2xl p-4 transition-all duration-300 relative"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 border border-gray-700/50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={bookmark.favicon_url || "/favicon.ico"} 
                                                alt="" 
                                                className="w-5 h-5 rounded-sm"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                            <Bookmark className="h-5 w-5 text-gray-500 hidden" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-semibold text-gray-200 truncate group-hover:text-indigo-300 transition-colors">
                                                {bookmark.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 truncate">
                                                {new URL(bookmark.url).hostname}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action menu placeholder (simplified to delete for now) */}
                                    <button 
                                        onClick={(e) => handleDelete(bookmark.id, e)}
                                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {bookmark.description && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                                        {bookmark.description}
                                    </p>
                                )}

                                <div className="mt-auto pt-2 flex items-center justify-between gap-2 overflow-hidden flex-wrap">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {bookmark.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                <Tag className="w-3 h-3 mr-1 opacity-70" />
                                                {tag}
                                            </span>
                                        ))}
                                        {bookmark.tags && bookmark.tags.length > 3 && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] bg-gray-800 text-gray-400 border border-gray-700">
                                                +{bookmark.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Bookmark Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsAddOpen(false)}>
                    <div 
                        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Bookmark className="h-5 w-5 text-indigo-400" />
                                Add New Bookmark
                            </h2>
                        </div>
                        
                        <form onSubmit={handleAddBookmark} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">URL</label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com"
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Title <span className="text-gray-600 font-normal lowercase">(Optional)</span></label>
                                <input
                                    type="text"
                                    placeholder="Leave blank to auto-detect"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    placeholder="What is this about?"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none h-20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Folder</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Math, React..."
                                        value={newFolder}
                                        onChange={e => setNewFolder(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tags</label>
                                    <input
                                        type="text"
                                        placeholder="Comma separated"
                                        value={newTagsStr}
                                        onChange={e => setNewTagsStr(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAddOpen(false)}
                                    className="flex-1 hover:bg-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!newUrl || isSubmitting}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {isSubmitting ? "Saving..." : "Save Bookmark"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
