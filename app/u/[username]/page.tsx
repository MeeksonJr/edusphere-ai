"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { ShieldAlert, Trophy, Flame, User, Award, Calendar, Share2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const username = params.username as string
  
  // We use the application's Supabase provider
  const { supabase } = useSupabase()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!supabase) return
      try {
        setLoading(true)

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .eq("is_public", true)
          .single()

        if (profileError || !profileData) {
          setError("Profile not found or is private")
          return
        }

        setProfile(profileData)
      } catch (err: any) {
        console.error("Error fetching profile:", err)
        setError("An error occurred while loading this profile.")
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchPublicProfile()
    }
  }, [username, supabase])

  const calculateLevel = (xp: number) => {
    // Simple level calculation: 1 level per 1000 XP
    return Math.floor((xp || 0) / 1000) + 1
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({ title: "Link copied!", description: "Profile link copied to clipboard." })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <ScrollReveal direction="up">
          <GlassSurface className="p-12 text-center max-w-lg border-red-500/20">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Profile Unavailable</h1>
            <p className="text-foreground/70 mb-8 text-lg">
              This user profile is either private or does not exist.
            </p>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </GlassSurface>
        </ScrollReveal>
      </div>
    )
  }

  const level = calculateLevel(profile.total_xp || 0)

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header/Cover Section */}
        <ScrollReveal direction="up">
          <div className="relative">
            {/* Abstract Background Banner */}
            <div className="h-48 md:h-64 w-full rounded-3xl bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-pink-600/20 border border-foreground/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/30 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-500/20 blur-[100px] rounded-full"></div>
            </div>
            
            {/* Profile Info Card overlapping the banner */}
            <div className="mt-[-80px] px-6 md:px-10">
              <GlassSurface className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-cyan-500/20 relative z-10 shadow-2xl">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl mt-[-40px] md:mt-0 flex-shrink-0 bg-background">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-4xl font-bold">
                    {(profile.full_name || profile.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left pt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground">
                        {profile.full_name || "Anonymous Student"}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <p className="text-cyan-400 font-medium">@{profile.username}</p>
                        <Badge variant="outline" className="bg-foreground/5 border-foreground/10 text-foreground/60 text-xs">
                          EduSphere Student
                        </Badge>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="glass-surface border-foreground/20 hover:bg-foreground/10"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Profile
                    </Button>
                  </div>
                  
                  <p className="text-foreground/70 mt-4 max-w-2xl text-sm md:text-base">
                    {profile.bio || "This student is hard at work learning new skills and leveling up on EduSphere."}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-foreground/10">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-foreground/50" />
                      <span className="text-sm text-foreground/60 focus:outline-none">
                        Joined {new Date(profile.created_at || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassSurface>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal direction="up" delay={0.1}>
            <AnimatedCard variant="glow" className="h-full">
              <div className="p-6 flex flex-col items-center text-center justify-center h-full space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-foreground/60 text-sm font-medium uppercase tracking-wider mb-1">Current Level</h3>
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {level}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <AnimatedCard variant="glow" className="h-full">
              <div className="p-6 flex flex-col items-center text-center justify-center h-full space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-foreground/60 text-sm font-medium uppercase tracking-wider mb-1">Total XP</h3>
                  <div className="text-4xl font-extrabold text-foreground">
                    {profile.total_xp?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <AnimatedCard variant="glow" className="h-full">
              <div className="p-6 flex flex-col items-center text-center justify-center h-full space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400/20 to-red-500/20 flex items-center justify-center mb-2">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-foreground/60 text-sm font-medium uppercase tracking-wider mb-1">Current Streak</h3>
                  <div className="text-4xl font-extrabold text-foreground flex items-baseline justify-center">
                    {profile.current_streak || 0}
                    <span className="text-lg text-foreground/50 ml-1 font-medium">days</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </ScrollReveal>
        </div>

        {/* Footer Link */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="text-center pt-8 pb-4">
            <p className="text-foreground/50 text-sm">
              Want your own learning portfolio? <a href="/" className="text-cyan-400 hover:underline">Join EduSphere today</a>.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  )
}
