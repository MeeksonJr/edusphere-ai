"use client"

import { useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Users, Globe, Lock } from "lucide-react"

interface Props {
    open: boolean
    onClose: () => void
    onCreated: () => void
}

const subjects = [
    "Mathematics", "Science", "English", "History", "Computer Science",
    "Physics", "Chemistry", "Biology", "Art", "Music", "Languages", "Other"
]

export function CreateGroupDialog({ open, onClose, onCreated }: Props) {
    const { supabase } = useSupabase()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [subject, setSubject] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState("")

    if (!open) return null

    const handleCreate = async () => {
        if (!supabase || !name.trim()) return
        setCreating(true)
        setError("")

        try {
            const { data: authData } = await supabase.auth.getUser()
            if (!authData.user) throw new Error("Not authenticated")

            const { data: group, error: createErr } = await supabase
                .from("study_groups")
                .insert({
                    name: name.trim(),
                    description: description.trim() || null,
                    subject: subject || null,
                    is_public: isPublic,
                    owner_id: authData.user.id,
                    member_count: 1,
                })
                .select()
                .single()

            if (createErr) throw createErr

            // Add owner as a member
            await supabase.from("study_group_members").insert({
                group_id: group.id,
                user_id: authData.user.id,
                role: "owner",
            })

            setName("")
            setDescription("")
            setSubject("")
            setIsPublic(true)
            onCreated()
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to create group")
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Create Study Group</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground/40 hover:text-foreground">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-foreground/60">Group Name *</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., AP Calculus Study Crew"
                            className="mt-1 bg-white/5 border-white/10"
                        />
                    </div>

                    <div>
                        <Label className="text-sm text-foreground/60">Description</Label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this group about?"
                            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm text-foreground placeholder:text-foreground/30 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
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
                                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                            : "bg-white/5 text-foreground/40 border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm text-foreground/60">Visibility</Label>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setIsPublic(true)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${isPublic ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" : "bg-white/5 text-foreground/40 border-white/10"
                                    }`}
                            >
                                <Globe className="h-4 w-4" /> Public
                            </button>
                            <button
                                onClick={() => setIsPublic(false)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm transition-all ${!isPublic ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : "bg-white/5 text-foreground/40 border-white/10"
                                    }`}
                            >
                                <Lock className="h-4 w-4" /> Private
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <Button
                        onClick={handleCreate}
                        disabled={!name.trim() || creating}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                    >
                        {creating ? "Creating..." : "Create Group"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
