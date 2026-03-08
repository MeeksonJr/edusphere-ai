"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GraduationCap, School, UserPlus, ArrowRight, Loader2 } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"

export default function InstitutionPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        const load = async () => {
            if (!supabase) return
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from("profiles").select("institution_role, institution_id").eq("id", user.id).single()
            setProfile(data)
            setLoading(false)

            // Auto redirect based on role
            if (data?.institution_role === "admin") {
                router.push("/dashboard/institution/admin")
            } else if (data?.institution_role === "teacher") {
                router.push("/dashboard/institution/teacher")
            }
        }
        load()
    }, [supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Student with institution — show enrolled classes
    if (profile?.institution_role === "student" && profile?.institution_id) {
        router.push("/dashboard/institution/student")
        return null
    }

    // No role — show onboarding
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <ScrollReveal direction="down">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                        Institution Hub
                    </h1>
                    <p className="text-foreground/50">
                        Create or join a school to unlock institutional features
                    </p>
                </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScrollReveal direction="left" delay={0.1}>
                    <AnimatedCard
                        onClick={() => router.push("/dashboard/institution/onboarding?mode=create")}
                        className="cursor-pointer group"
                    >
                        <GlassSurface className="p-8 text-center space-y-4 h-full">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                                <School className="h-8 w-8 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold">Create a School</h2>
                            <p className="text-sm text-foreground/50">
                                Set up your institution, invite teachers and students, and manage everything from one dashboard.
                            </p>
                            <Button variant="outline" className="group-hover:bg-primary/10 group-hover:border-primary/30">
                                Get Started <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </GlassSurface>
                    </AnimatedCard>
                </ScrollReveal>

                <ScrollReveal direction="right" delay={0.2}>
                    <AnimatedCard
                        onClick={() => router.push("/dashboard/institution/onboarding?mode=join")}
                        className="cursor-pointer group"
                    >
                        <GlassSurface className="p-8 text-center space-y-4 h-full">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-green-500/20 flex items-center justify-center">
                                <UserPlus className="h-8 w-8 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-bold">Join a School</h2>
                            <p className="text-sm text-foreground/50">
                                Have an invite code? Enter it to join your school as a teacher or student.
                            </p>
                            <Button variant="outline" className="group-hover:bg-primary/10 group-hover:border-primary/30">
                                Join Now <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </GlassSurface>
                    </AnimatedCard>
                </ScrollReveal>
            </div>

            <ScrollReveal direction="up" delay={0.3}>
                <GlassSurface className="p-6">
                    <div className="flex items-start gap-4">
                        <GraduationCap className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">What are Institutional Features?</h3>
                            <p className="text-sm text-foreground/50 leading-relaxed">
                                Schools and districts can manage teachers, create classes, assign coursework, track student progress,
                                and generate report cards. Teachers get tools to create assignments and grade submissions.
                                Students see their enrolled classes and upcoming work in one place.
                            </p>
                        </div>
                    </div>
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
