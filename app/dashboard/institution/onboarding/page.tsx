"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { School, UserPlus, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
    const { supabase } = useSupabase()
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialMode = searchParams.get("mode") || "join"

    const [mode, setMode] = useState<"create" | "join">(initialMode as any)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Create mode
    const [schoolName, setSchoolName] = useState("")
    const [domain, setDomain] = useState("")

    // Join mode
    const [inviteCode, setInviteCode] = useState("")
    const [joinRole, setJoinRole] = useState<"teacher" | "student">("student")
    const [error, setError] = useState("")

    const handleCreate = async () => {
        if (!supabase || !schoolName.trim()) return
        setLoading(true)
        setError("")

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Create institution
            const { data: institution, error: createErr } = await supabase.from("institutions").insert({
                name: schoolName.trim(),
                domain: domain.trim() || null,
                owner_id: user.id,
            }).select().single()

            if (createErr) throw createErr

            // Set user as admin of this institution
            await supabase.from("profiles").update({
                institution_role: "admin",
                institution_id: institution.id,
            }).eq("id", user.id)

            setSuccess(true)
            setTimeout(() => router.push("/dashboard/institution/admin"), 1500)
        } catch (e: any) {
            setError(e.message || "Failed to create school")
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async () => {
        if (!supabase || !inviteCode.trim()) return
        setLoading(true)
        setError("")

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            // Find institution
            const { data: institution, error: findErr } = await supabase
                .from("institutions")
                .select("id, name")
                .eq("invite_code", inviteCode.trim().toLowerCase())
                .single()

            if (findErr || !institution) {
                setError("Invalid invite code. Please check and try again.")
                setLoading(false)
                return
            }

            // Set role on profile
            await supabase.from("profiles").update({
                institution_role: joinRole,
                institution_id: institution.id,
            }).eq("id", user.id)

            setSuccess(true)
            setTimeout(() => {
                router.push(joinRole === "teacher" ? "/dashboard/institution/teacher" : "/dashboard/institution/student")
            }, 1500)
        } catch (e: any) {
            setError(e.message || "Failed to join school")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <ScrollReveal direction="up">
                    <GlassSurface className="p-12 text-center space-y-4 max-w-md">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-400" />
                        </div>
                        <h2 className="text-xl font-bold">
                            {mode === "create" ? "School Created!" : "Joined Successfully!"}
                        </h2>
                        <p className="text-sm text-foreground/50">Redirecting you now...</p>
                    </GlassSurface>
                </ScrollReveal>
            </div>
        )
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <Link href="/dashboard/institution" className="inline-flex items-center text-sm text-foreground/50 hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Link>

            <ScrollReveal direction="down">
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={mode === "create" ? "default" : "outline"}
                        onClick={() => { setMode("create"); setError("") }}
                        className="flex-1"
                    >
                        <School className="h-4 w-4 mr-2" /> Create School
                    </Button>
                    <Button
                        variant={mode === "join" ? "default" : "outline"}
                        onClick={() => { setMode("join"); setError("") }}
                        className="flex-1"
                    >
                        <UserPlus className="h-4 w-4 mr-2" /> Join School
                    </Button>
                </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
                <GlassSurface className="p-6 space-y-5">
                    {mode === "create" ? (
                        <>
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold">Create Your School</h2>
                                <p className="text-sm text-foreground/50">You&apos;ll become the school admin</p>
                            </div>

                            <div className="space-y-2">
                                <Label>School Name *</Label>
                                <Input
                                    placeholder="e.g. Springfield High School"
                                    value={schoolName}
                                    onChange={e => setSchoolName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>School Domain (optional)</Label>
                                <Input
                                    placeholder="e.g. springfield.edu"
                                    value={domain}
                                    onChange={e => setDomain(e.target.value)}
                                />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <Button onClick={handleCreate} disabled={loading || !schoolName.trim()} className="w-full">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <School className="h-4 w-4 mr-2" />}
                                Create School
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold">Join a School</h2>
                                <p className="text-sm text-foreground/50">Enter the invite code from your school admin</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Invite Code *</Label>
                                <Input
                                    placeholder="e.g. abc12345"
                                    value={inviteCode}
                                    onChange={e => setInviteCode(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Join as</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={joinRole === "student" ? "default" : "outline"}
                                        onClick={() => setJoinRole("student")}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Student
                                    </Button>
                                    <Button
                                        variant={joinRole === "teacher" ? "default" : "outline"}
                                        onClick={() => setJoinRole("teacher")}
                                        className="flex-1"
                                        size="sm"
                                    >
                                        Teacher
                                    </Button>
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <Button onClick={handleJoin} disabled={loading || !inviteCode.trim()} className="w-full">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                                Join School
                            </Button>
                        </>
                    )}
                </GlassSurface>
            </ScrollReveal>
        </div>
    )
}
