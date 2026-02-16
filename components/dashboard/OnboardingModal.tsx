"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function OnboardingModal() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Check if onboarding has been completed
        const hasOnboarded = localStorage.getItem("edusphere-onboarding-completed")
        if (!hasOnboarded) {
            // Small delay for better UX
            const timer = setTimeout(() => setOpen(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleComplete = () => {
        localStorage.setItem("edusphere-onboarding-completed", "true")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] glass-surface border-cyan-500/30">
                <DialogHeader>
                    <div className="mx-auto bg-cyan-500/20 p-3 rounded-full mb-4 w-fit">
                        <Sparkles className="h-8 w-8 text-cyan-400" />
                    </div>
                    <DialogTitle className="text-2xl text-center text-foreground">Welcome to EduSphere AI</DialogTitle>
                    <DialogDescription className="text-center text-foreground/70 pt-2">
                        Your personalized AI learning assistant is ready.
                        Create your first course, track your progress, and master new subjects with ease.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-lg border border-foreground/10">
                        <div className="text-2xl">📚</div>
                        <div>
                            <h4 className="font-medium text-foreground">Create Courses</h4>
                            <p className="text-sm text-foreground/60">Generate comprehensive courses on any topic instantly.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-lg border border-foreground/10">
                        <div className="text-2xl">📊</div>
                        <div>
                            <h4 className="font-medium text-foreground">Track Analytics</h4>
                            <p className="text-sm text-foreground/60">Visualize your learning journey and stay motivated.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                        onClick={handleComplete}
                    >
                        Let's Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
