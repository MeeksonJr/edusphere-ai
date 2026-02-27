"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Plus, Shield } from "lucide-react"
import { useSupabase } from "@/components/supabase-provider"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ChildProfileCard } from "@/components/child-profile-card"

export default function FamilyHubPage() {
    const router = useRouter()
    const { supabase } = useSupabase()
    const [children, setChildren] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await fetch("/api/family")
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error)
                    return
                }

                setChildren(data.children || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchChildren()
    }, [])

    if (loading) {
        return (
            <div className="p-6 md:p-8 lg:p-12 flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 md:p-8 lg:p-12">
                <GlassSurface className="p-8 text-center max-w-lg mx-auto">
                    <Shield className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Family Hub</h2>
                    <p className="text-foreground/60 mb-6">{error}</p>
                    <Button
                        onClick={() => router.push("/dashboard/subscription")}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                    >
                        Upgrade Plan
                    </Button>
                </GlassSurface>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 lg:p-12">
            {/* Header */}
            <ScrollReveal direction="up">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
                                Family Hub
                            </span>
                        </h1>
                        <p className="text-foreground/60">
                            {children.length === 0
                                ? "Add your children to track their learning progress"
                                : `Managing ${children.length} child${children.length > 1 ? "ren" : ""}`}
                        </p>
                    </div>
                    <Link href="/dashboard/family/add-child">
                        <Button className="mt-4 md:mt-0 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Child
                        </Button>
                    </Link>
                </div>
            </ScrollReveal>

            {/* Children Grid */}
            {children.length === 0 ? (
                <ScrollReveal direction="up" delay={0.1}>
                    <GlassSurface className="p-12 text-center">
                        <Users className="h-16 w-16 text-foreground/20 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No children added yet</h2>
                        <p className="text-foreground/50 mb-6">
                            Add your first child to start tracking their learning journey
                        </p>
                        <Link href="/dashboard/family/add-child">
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Child
                            </Button>
                        </Link>
                    </GlassSurface>
                </ScrollReveal>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {children.map((child: any, idx: number) => (
                        <ScrollReveal key={child.id} direction="up" delay={idx * 0.05}>
                            <ChildProfileCard
                                child={child}
                                onClick={() => router.push(`/dashboard/family/${child.id}`)}
                            />
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    )
}
