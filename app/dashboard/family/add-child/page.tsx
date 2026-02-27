"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, UserPlus, Loader2 } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const gradeLevels = [
    "Pre-K", "Kindergarten",
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade",
    "9th Grade", "10th Grade", "11th Grade", "12th Grade",
    "College", "Other",
]

const subjectOptions = [
    "Math", "Science", "English", "History", "Geography",
    "Art", "Music", "Computer Science", "Physics", "Chemistry",
    "Biology", "Literature", "Spanish", "French", "Physical Education",
]

export default function AddChildPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [childName, setChildName] = useState("")
    const [gradeLevel, setGradeLevel] = useState("")
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
    const [submitting, setSubmitting] = useState(false)

    const toggleSubject = (subj: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(subj)
                ? prev.filter((s) => s !== subj)
                : [...prev, subj]
        )
    }

    const handleSubmit = async () => {
        if (!childName.trim()) {
            toast({ title: "Name required", description: "Please enter the child's name", variant: "destructive" })
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch("/api/family", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "add_child",
                    childName: childName.trim(),
                    gradeLevel: gradeLevel || null,
                    subjects: selectedSubjects,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast({ title: "🎉 Child added!", description: `${childName} has been added to your family` })
            router.push("/dashboard/family")
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="p-6 md:p-8 lg:p-12 max-w-2xl mx-auto">
            <ScrollReveal direction="up">
                <Link
                    href="/dashboard/family"
                    className="inline-flex items-center text-foreground/70 hover:text-foreground mb-6 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Family Hub
                </Link>

                <h1 className="text-3xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-pink-400 to-purple-400 text-transparent bg-clip-text">
                        Add Child
                    </span>
                </h1>
                <p className="text-foreground/60 mb-8">Create a profile to track their learning progress</p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-6 lg:p-8 space-y-6">
                    {/* Name */}
                    <div>
                        <Label htmlFor="childName" className="text-foreground text-sm font-medium mb-2 block">
                            Child&apos;s Name *
                        </Label>
                        <Input
                            id="childName"
                            value={childName}
                            onChange={(e) => setChildName(e.target.value)}
                            placeholder="Enter name..."
                            className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40"
                            maxLength={100}
                        />
                    </div>

                    {/* Grade Level */}
                    <div>
                        <Label className="text-foreground text-sm font-medium mb-3 block">Grade Level</Label>
                        <div className="flex flex-wrap gap-2">
                            {gradeLevels.map((gl) => (
                                <button
                                    key={gl}
                                    onClick={() => setGradeLevel(gradeLevel === gl ? "" : gl)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${gradeLevel === gl
                                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                                            : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                                        }`}
                                >
                                    {gl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subjects */}
                    <div>
                        <Label className="text-foreground text-sm font-medium mb-3 block">
                            Subjects ({selectedSubjects.length} selected)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {subjectOptions.map((subj) => (
                                <button
                                    key={subj}
                                    onClick={() => toggleSubject(subj)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSubjects.includes(subj)
                                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                            : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                                        }`}
                                >
                                    {subj}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !childName.trim()}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white disabled:opacity-50"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Child
                            </>
                        )}
                    </Button>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
