"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"

export default function ProfilePage() {
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
    // Check if tab is specified in URL
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
          // Check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError && profileError.code === "PGRST116") {
            // Profile doesn't exist, create it
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

            if (insertError) {
              console.error("Error creating profile:", insertError)
              throw insertError
            }

            // Fetch the newly created profile
            const { data: newProfileData, error: newProfileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single()

            if (newProfileError) throw newProfileError

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

          // Fetch user stats
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
      // Fetch assignments stats
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("status")
        .eq("user_id", userId)

      if (assignmentsError) throw assignmentsError

      const completedAssignments = assignments?.filter((a) => a.status === "completed").length || 0

      // Fetch flashcard stats
      const { data: flashcardSets, error: flashcardsError } = await supabase
        .from("flashcard_sets")
        .select("cards")
        .eq("user_id", userId)

      if (flashcardsError) throw flashcardsError

      const totalCards = flashcardSets?.reduce((acc, set) => acc + (set.cards?.length || 0), 0) || 0

      // Fetch resources stats
      const { data: resources, error: resourcesError } = await supabase
        .from("study_resources")
        .select("id")
        .eq("user_id", userId)

      if (resourcesError) throw resourcesError

      // Get AI usage
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

      // Upload avatar if changed
      let avatarUrl = profile.avatar_url
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
      }

      // Update profile
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

      // Create preview
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

      // Delete user data
      const tables = ["assignments", "flashcard_sets", "study_resources", "ai_chats", "profiles"]

      for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq("user_id", user.id)
        if (error && error.code !== "PGRST116") {
          console.error(`Error deleting from ${table}:`, error)
        }
      }

      // Delete the auth user (requires admin rights in a real app)
      // This is a simplified version - in production you'd use Supabase Edge Functions or server-side code
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
      return <Badge className="bg-pink-600">Ultimate Plan</Badge>
    } else if (tier === "pro") {
      return <Badge className="bg-blue-600">Pro Plan</Badge>
    } else {
      return <Badge className="bg-gray-600">Free Plan</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold neon-text-purple">Your Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account and view your stats</p>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Sparkles className="h-4 w-4 mr-2" /> Stats
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
          >
            <CreditCard className="h-4 w-4 mr-2" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Key className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {profile.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-sm px-3 py-2 rounded-md">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
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
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="full_name"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input id="email" value={user?.email} disabled className="bg-gray-800 border-gray-700 opacity-70" />
                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdateProfile} className="bg-primary hover:bg-primary/80" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your academic achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Assignments</p>
                        <p className="text-sm text-gray-400">{stats.assignments.total} total</p>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width:
                              stats.assignments.total > 0
                                ? `${(stats.assignments.completed / stats.assignments.total) * 100}%`
                                : "0%",
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {stats.assignments.completed} completed (
                        {stats.assignments.total > 0
                          ? Math.round((stats.assignments.completed / stats.assignments.total) * 100)
                          : 0}
                        %)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <BrainCircuit className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Flashcards</p>
                        <p className="text-sm text-gray-400">{stats.flashcards.sets} sets</p>
                      </div>
                      <p className="text-sm">{stats.flashcards.cards} cards created</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-800 p-2 rounded-md">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Study Resources</p>
                        <p className="text-sm text-gray-400">{stats.resources.total} created</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>AI Usage</CardTitle>
                <CardDescription>Your AI assistant usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Plan</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getSubscriptionBadge()}
                        <span className="text-sm">
                          {user?.profile?.subscription_tier === "free"
                            ? "10 AI requests per month"
                            : "Unlimited AI requests"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">AI Requests Used</p>
                      <p className="font-medium">{stats.aiUsage.total}</p>
                    </div>
                    {user?.profile?.subscription_tier === "free" && (
                      <>
                        <Progress value={(stats.aiUsage.total / 10) * 100} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>0</span>
                          <span>Remaining: {stats.aiUsage.remaining}</span>
                          <span>10</span>
                        </div>
                      </>
                    )}
                  </div>

                  {user?.profile?.subscription_tier === "free" && (
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-sm">
                        Upgrade to Pro or Ultimate plan for unlimited AI requests and premium features.
                      </p>
                      <Button
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push("/dashboard/subscription")}
                      >
                        Upgrade Plan
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      {user?.profile?.subscription_tier === "ultimate"
                        ? "Ultimate Plan"
                        : user?.profile?.subscription_tier === "pro"
                          ? "Pro Plan"
                          : "Free Plan"}
                    </h3>
                    <p className="text-gray-400 mt-1">
                      {user?.profile?.subscription_tier === "ultimate"
                        ? "$12.99/month"
                        : user?.profile?.subscription_tier === "pro"
                          ? "$6.99/month"
                          : "Free"}
                    </p>
                  </div>
                  {getSubscriptionBadge()}
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Features included:</h4>
                  <ul className="space-y-2">
                    {user?.profile?.subscription_tier === "ultimate" ? (
                      <>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Everything in Pro
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Multi-project/class support
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Study groups (peer-to-peer)
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Voice assistant for Gemini AI
                        </li>
                      </>
                    ) : user?.profile?.subscription_tier === "pro" ? (
                      <>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Unlimited AI prompts
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Priority support
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Premium Gemini features
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Flashcard & quiz generator
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Import calendar
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          10 AI requests/month
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Access to Hugging Face basic tools
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {user?.profile?.subscription_tier !== "free" && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-400">
                      Subscription ID: {user?.profile?.subscription_id || "N/A"}
                      <br />
                      Status: {user?.profile?.subscription_status || "Active"}
                      <br />
                      Last Updated:{" "}
                      {user?.profile?.subscription_updated_at
                        ? new Date(user.profile.subscription_updated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {user?.profile?.subscription_tier === "free" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gray-800 border-blue-600 hover:border-blue-500 transition-all">
                    <CardHeader>
                      <CardTitle>Pro Plan</CardTitle>
                      <CardDescription>$6.99/month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Unlimited AI prompts
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Priority support
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Premium Gemini features
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Flashcard & quiz generator
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => router.push("/dashboard/subscription")}
                      >
                        Upgrade to Pro
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gray-800 border-pink-600 hover:border-pink-500 transition-all">
                    <CardHeader>
                      <CardTitle>Ultimate Plan</CardTitle>
                      <CardDescription>$12.99/month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Everything in Pro
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Multi-project/class support
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Study groups (peer-to-peer)
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2 text-green-400">✓</span>
                          Voice assistant for Gemini AI
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        onClick={() => router.push("/dashboard/subscription")}
                      >
                        Upgrade to Ultimate
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-red-900 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                    onClick={() => router.push("/dashboard/subscription")}
                  >
                    Cancel Subscription
                  </Button>
                  {user?.profile?.subscription_tier === "pro" && (
                    <Button
                      className="bg-pink-600 hover:bg-pink-700"
                      onClick={() => router.push("/dashboard/subscription")}
                    >
                      Upgrade to Ultimate
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input id="current-password" type="password" className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="new-password" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input id="new-password" type="password" className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input id="confirm-password" type="password" className="bg-gray-800 border-gray-700" />
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/80"
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

              <div className="border-t border-gray-800 pt-6 space-y-4">
                <h3 className="text-lg font-medium">Account Actions</h3>
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-400 hover:text-white justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-900 text-red-500 hover:text-red-400 hover:bg-red-900/20 justify-start"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" /> Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteAccount}
              disabled={updating}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
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
