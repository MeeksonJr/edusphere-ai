"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SubmissionFormProps {
    assignmentId: string
    onGraded: (result: any) => void
    disabled?: boolean
}

export function SubmissionForm({ assignmentId, onGraded, disabled }: SubmissionFormProps) {
    const { toast } = useToast()
    const [content, setContent] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast({
                title: "Empty submission",
                description: "Please enter your answer before submitting",
                variant: "destructive",
            })
            return
        }

        try {
            setSubmitting(true)
            const res = await fetch("/api/assignments/grade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assignmentId, content: content.trim() }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Grading failed")
            }

            toast({
                title: "📝 Submission graded!",
                description: `Score: ${data.submission.grade}/${data.submission.percentage ? Math.round(data.submission.percentage) + "%" : ""}`,
            })

            onGraded(data.submission)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to submit",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="submission" className="text-foreground text-sm font-medium mb-2 block">
                    Your Answer
                </Label>
                <Textarea
                    id="submission"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type or paste your answer here..."
                    className="glass-surface border-foreground/20 text-white placeholder:text-foreground/40 resize-none min-h-[200px]"
                    disabled={disabled || submitting}
                    maxLength={10000}
                />
                <p className="text-xs text-foreground/40 mt-1">{content.length}/10,000 characters</p>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={submitting || !content.trim() || disabled}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white disabled:opacity-50"
            >
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Grading with AI...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Grading
                    </>
                )}
            </Button>
        </div>
    )
}

export default SubmissionForm
