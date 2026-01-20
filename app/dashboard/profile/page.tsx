"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  CreditCard,
  Key,
  LogOut,
  Upload,
  Sparkles,
  BrainCircuit,
  BookOpen,
  CheckSquare,
  Trash2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Zap,
  Award,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    assignments: { total: 0, completed: 0 },
    flashcards: { sets: 0, cards: 0 },
    resources: { total: 0 },
    aiUsage: { total: 0, remaining: 0 },
  })
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    avatar_url: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data } = await supabase.auth.getUser()

        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            const { error: insertError } = await supabase.from("profiles").insert([
              {
                id: data.user.id,
                subscription_tier: "free",
                ai_requests_count: 0,
                full_name: data.user.user_metadata?.full_name || "",
                username: data.user.email?.split("@")[0] || "",
                avatar_url: data.user.user_metadata?.avatar_url || "",
              },
            ])

            if (insertError) throw insertError

            const { data: newProfileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single()

            setUser({ ...data.user, profile: newProfileData })
            setProfile({
              full_name: newProfileData?.full_name || "",
              username: newProfileData?.username || "",
              avatar_url: newProfileData?.avatar_url || "",
            })
          } else if (profileError) {
            throw profileError
          } else {
            setUser({ ...data.user, profile: profileData })
            setProfile({
              full_name: profileData?.full_name || "",
              username: profileData?.username || "",
              avatar_url: profileData?.avatar_url || "",
            })
          }

          await fetchUserStats(data.user.id)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, toast])

  const fetchUserStats = async (userId: string) => {
    try {
      const { data: assignments } = await supabase
        .from("assignments")
        .select("status")
        .eq("user_id", userId)

      const completedAssignments = assignments?.filter((a) => a.status === "completed").length || 0

      const { data: flashcardSets } = await supabase
        .from("flashcard_sets")
        .select("cards")
        .eq("user_id", userId)

      const totalCards = flashcardSets?.reduce((acc, set) => acc + (set.cards?.length || 0), 0) || 0

      const { data: resources } = await supabase.from("study_resources").select("id").eq("user_id", userId)

      const aiRequestsCount = user?.profile?.ai_requests_count || 0
      const aiRequestsRemaining =
        user?.profile?.subscription_tier === "free" ? Math.max(0, 10 - aiRequestsCount) : "Unlimited"

      setStats({
        assignments: {
          total: assignments?.length || 0,
          completed: completedAssignments,
        },
        flashcards: {
          sets: flashcardSets?.length || 0,
          cards: totalCards,
        },
        resources: {
          total: resources?.length || 0,
        },
        aiUsage: {
          total: aiRequestsCount,
          remaining: aiRequestsRemaining,
        },
      })
    } catch (error: any) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true)
      if (!user) return

      let avatarUrl = profile.avatar_url
      if (avatarFile && supabase) {
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        // Upload to user-specific folder to match RLS policy: {user_id}/{filename}
        const filePath = `${user.id}/${fileName}`

        // Delete old avatar if exists
        if (profile.avatar_url) {
          // Extract path from URL - look for pattern /avatars/{user_id}/{filename}
          try {
            const urlParts = profile.avatar_url.split("/")
            const avatarsIndex = urlParts.findIndex((part) => part.includes("avatars"))
            if (avatarsIndex >= 0 && avatarsIndex < urlParts.length - 1) {
              // Path should be {user_id}/{filename}
              const oldPath = `${urlParts[avatarsIndex + 1]}/${urlParts[avatarsIndex + 2]}`
              await supabase.storage.from("avatars").remove([oldPath]).catch(() => {
                // Ignore errors if file doesn't exist
              })
            }
          } catch (err) {
            // Ignore errors when parsing old URL
          }
        }

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
          upsert: true,
        })
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
        avatarUrl = urlData.publicUrl
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, profile: { ...user.profile, ...profile, avatar_url: avatarUrl } })

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      if (!user) return
      setUpdating(true)

      const tables = ["assignments", "flashcard_sets", "study_resources", "ai_chats", "profiles"]
      for (const table of tables) {
        await supabase.from(table).delete().eq("user_id", user.id)
      }

      await supabase.auth.signOut()

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been deleted.",
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
      setDeleteDialogOpen(false)
    }
  }

  const getSubscriptionBadge = () => {
    const tier = user?.profile?.subscription_tier || "free"
    if (tier === "ultimate") {
      return <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">Ultimate</Badge>
    } else if (tier === "pro") {
      return <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">Pro</Badge>
    } else {
      return <Badge className="bg-gray-600 text-white">Free</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Your</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-white/70">Manage your account and view your stats</p>
        </div>
      </ScrollReveal>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-surface border-white/20 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <User className="h-4 w-4 mr-2" aria-hidden="true" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
            Stats
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
            Subscription
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Key className="h-4 w-4 mr-2" aria-hidden="true" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                    <AvatarImage src={avatarPreview || profile.avatar_url} alt={profile.full_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                      {profile.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-surface border-white/20 hover:border-purple-500/50 transition-all">
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      <span className="text-sm text-white">Upload Photo</span>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <Label htmlFor="full_name" className="text-white mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="username" className="text-white mb-2 block">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      className="glass-surface border-white/20 text-white/50 opacity-70"
                    />
                    <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updating}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Updating...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <ScrollReveal direction="up">
              <AnimatedCard variant="glow">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Learning Progress</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 flex-shrink-0">
                        <CheckSquare className="h-full w-full text-purple-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">Assignments</p>
                          <p className="text-sm text-white/60">{stats.assignments.total} total</p>
                        </div>
                        <Progress
                          value={
                            stats.assignments.total > 0
                              ? (stats.assignments.completed / stats.assignments.total) * 100
                              : 0
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-white/50">
                          {stats.assignments.completed} completed (
                          {stats.assignments.total > 0
                            ? Math.round((stats.assignments.completed / stats.assignments.total) * 100)
                            : 0}
                          %)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 p-3 flex-shrink-0">
                        <BrainCircuit className="h-full w-full text-pink-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white">Flashcards</p>
                          <p className="text-sm text-white/60">{stats.flashcards.sets} sets</p>
                        </div>
                        <p className="text-sm text-white/70">{stats.flashcards.cards} cards created</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 flex-shrink-0">
                        <BookOpen className="h-full w-full text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-white">Study Resources</p>
                          <p className="text-sm text-white/60">{stats.resources.total} created</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              <AnimatedCard variant="glow" delay={0.1}>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">AI Usage</h2>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-white/60 mb-2">Current Plan</p>
                      <div className="flex items-center space-x-3 mb-4">
                        {getSubscriptionBadge()}
                        <span className="text-sm text-white/70">
                          {user?.profile?.subscription_tier === "free"
                            ? "10 AI requests per month"
                            : "Unlimited AI requests"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white/70">AI Requests Used</p>
                        <p className="font-semibold text-white">{stats.aiUsage.total}</p>
                      </div>
                      {user?.profile?.subscription_tier === "free" && (
                        <>
                          <Progress value={(stats.aiUsage.total / 10) * 100} className="h-2 mb-2" />
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span>0</span>
                            <span>Remaining: {stats.aiUsage.remaining}</span>
                            <span>10</span>
                          </div>
                        </>
                      )}
                    </div>

                    {user?.profile?.subscription_tier === "free" && (
                      <GlassSurface className="p-4 border-purple-500/30">
                        <p className="text-sm text-white/80 mb-4">
                          Upgrade to Pro or Ultimate plan for unlimited AI requests and premium features.
                        </p>
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          onClick={() => router.push("/dashboard/subscription")}
                        >
                          Upgrade Plan
                        </Button>
                      </GlassSurface>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </ScrollReveal>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Subscription Plan</h2>
              <div className="glass-surface border-purple-500/30 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {user?.profile?.subscription_tier === "ultimate"
                        ? "Ultimate Plan"
                        : user?.profile?.subscription_tier === "pro"
                          ? "Pro Plan"
                          : "Free Plan"}
                    </h3>
                    <p className="text-white/70">
                      {user?.profile?.subscription_tier === "ultimate"
                        ? "$12.99/month"
                        : user?.profile?.subscription_tier === "pro"
                          ? "$6.99/month"
                          : "Free"}
                    </p>
                  </div>
                  {getSubscriptionBadge()}
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-white mb-3">Features included:</h4>
                  <ul className="space-y-2">
                    {user?.profile?.subscription_tier === "ultimate" ? (
                      <>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Everything in Pro
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Multi-project/class support
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Study groups (peer-to-peer)
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Voice assistant for Gemini AI
                        </li>
                      </>
                    ) : user?.profile?.subscription_tier === "pro" ? (
                      <>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Unlimited AI prompts
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Priority support
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Premium Gemini features
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Flashcard & quiz generator
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Import calendar
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          10 AI requests/month
                        </li>
                        <li className="flex items-center text-white/80">
                          <span className="mr-2 text-green-400">✓</span>
                          Access to Hugging Face basic tools
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {user?.profile?.subscription_tier === "free" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <AnimatedCard variant="3d">
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-white mb-2">Pro Plan</h4>
                        <p className="text-white/60 mb-4">$6.99/month</p>
                        <ul className="space-y-2 text-sm text-white/80 mb-6">
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span>
                            Unlimited AI prompts
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span>
                            Priority support
                          </li>
                        </ul>
                        <Button
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                          onClick={() => router.push("/dashboard/subscription")}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </AnimatedCard>

                    <AnimatedCard variant="3d" delay={0.1}>
                      <div className="p-6">
                        <h4 className="text-lg font-bold text-white mb-2">Ultimate Plan</h4>
                        <p className="text-white/60 mb-4">$12.99/month</p>
                        <ul className="space-y-2 text-sm text-white/80 mb-6">
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span>
                            Everything in Pro
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2 text-green-400">✓</span>
                            Multi-project support
                          </li>
                        </ul>
                        <Button
                          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                          onClick={() => router.push("/dashboard/subscription")}
                        >
                          Upgrade to Ultimate
                        </Button>
                      </div>
                    </AnimatedCard>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="glass-surface border-white/20 hover:border-red-500/50 text-red-400 hover:text-red-300"
                      onClick={() => router.push("/dashboard/subscription")}
                    >
                      Cancel Subscription
                    </Button>
                    {user?.profile?.subscription_tier === "pro" && (
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                        onClick={() => router.push("/dashboard/subscription")}
                      >
                        Upgrade to Ultimate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <ScrollReveal direction="up">
            <GlassSurface className="p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password" className="text-white mb-2 block">
                        Current Password
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password" className="text-white mb-2 block">
                        New Password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-white mb-2 block">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="glass-surface border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      onClick={() => {
                        toast({
                          title: "Password Update",
                          description: "Password update functionality would be implemented in a production app.",
                        })
                      }}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full glass-surface border-white/20 hover:border-white/40 text-white justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 justify-start"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </GlassSurface>
          </ScrollReveal>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-surface border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-white">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" aria-hidden="true" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-surface border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
      <ProfileContent />
    </Suspense>
  )
}
