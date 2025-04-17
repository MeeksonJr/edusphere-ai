"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { PayPalButton } from "@/components/paypal-button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function SubscriptionPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "ultimate" | null>(null)

  // PayPal plan IDs (these would be created in the PayPal dashboard)
  const planIds = {
    pro: "P-5ML4271244454362WXNWU5NQ", // Replace with your actual plan ID
    ultimate: "P-3RX095426H3469222XNWU5VY", // Replace with your actual plan ID
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data } = await supabase.auth.getUser()

        if (data.user) {
          const { data: profileData, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (error && error.code !== "PGRST116") throw error

          setUser({ ...data.user, profile: profileData })
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load user data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, toast])

  const handleSelectPlan = (plan: "pro" | "ultimate") => {
    setSelectedPlan(plan)
  }

  const handleCancelSubscription = async () => {
    try {
      if (!user) return

      // In a real app, you would call the PayPal API to cancel the subscription
      // For now, we'll just update the database
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: "free",
          subscription_id: null,
          subscription_status: null,
          subscription_updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      })

      // Refresh user data
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setUser({ ...user, profile: profileData })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      })
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
        <h1 className="text-3xl font-bold neon-text-purple">Subscription Plans</h1>
        <p className="text-gray-400 mt-1">Choose the plan that works best for you</p>
      </div>

      {/* Current Plan */}
      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Badge
              className={
                user?.profile?.subscription_tier === "free"
                  ? "bg-gray-600"
                  : user?.profile?.subscription_tier === "pro"
                    ? "bg-blue-600"
                    : "bg-pink-600"
              }
            >
              {user?.profile?.subscription_tier === "ultimate"
                ? "Ultimate"
                : user?.profile?.subscription_tier === "pro"
                  ? "Pro"
                  : "Free"}
            </Badge>
          </div>

          {user?.profile?.subscription_tier !== "free" && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">
                Subscription ID: {user?.profile?.subscription_id || "N/A"}
                <br />
                Status: {user?.profile?.subscription_status || "Active"}
                <br />
                Last Updated: {new Date(user?.profile?.subscription_updated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
        {user?.profile?.subscription_tier !== "free" && (
          <CardFooter>
            <Button
              variant="outline"
              className="border-red-900 text-red-500 hover:text-red-400 hover:bg-red-900/20"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Available Plans */}
      {user?.profile?.subscription_tier === "free" && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Available Plans</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Pro Plan */}
            <Card
              className={`glass-card transition-all ${
                selectedPlan === "pro" ? "neon-border-blue" : "hover:border-blue-600"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Pro Plan
                  {selectedPlan === "pro" && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
                </CardTitle>
                <CardDescription>
                  <span className="text-xl font-bold text-white">$6.99</span>
                  <span className="text-gray-400">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
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
              <CardFooter className="flex flex-col space-y-4">
                {selectedPlan === "pro" ? (
                  <PayPalButton planId={planIds.pro} tier="pro" />
                ) : (
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleSelectPlan("pro")}>
                    Select Pro Plan
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Ultimate Plan */}
            <Card
              className={`glass-card transition-all ${
                selectedPlan === "ultimate" ? "neon-border-pink" : "hover:border-pink-600"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ultimate Plan
                  {selectedPlan === "ultimate" && <CheckCircle2 className="h-5 w-5 text-pink-500" />}
                </CardTitle>
                <CardDescription>
                  <span className="text-xl font-bold text-white">$12.99</span>
                  <span className="text-gray-400">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
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
              <CardFooter className="flex flex-col space-y-4">
                {selectedPlan === "ultimate" ? (
                  <PayPalButton planId={planIds.ultimate} tier="ultimate" />
                ) : (
                  <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={() => handleSelectPlan("ultimate")}>
                    Select Ultimate Plan
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* Upgrade Plan */}
      {user?.profile?.subscription_tier === "pro" && (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>

          <Card
            className={`glass-card transition-all ${
              selectedPlan === "ultimate" ? "neon-border-pink" : "hover:border-pink-600"
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ultimate Plan
                {selectedPlan === "ultimate" && <CheckCircle2 className="h-5 w-5 text-pink-500" />}
              </CardTitle>
              <CardDescription>
                <span className="text-xl font-bold text-white">$12.99</span>
                <span className="text-gray-400">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
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
            <CardFooter className="flex flex-col space-y-4">
              {selectedPlan === "ultimate" ? (
                <PayPalButton planId={planIds.ultimate} tier="ultimate" />
              ) : (
                <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={() => handleSelectPlan("ultimate")}>
                  Upgrade to Ultimate
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
