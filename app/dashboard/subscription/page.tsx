"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { PayPalButton } from "@/components/paypal-button"
import { Loader2, CheckCircle2, CreditCard, Sparkles, Zap, Users, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default function SubscriptionPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "ultimate" | null>(null)

  const planIds = {
    pro: "P-5ML4271244454362WXNWU5NQ",
    ultimate: "P-3RX095426H3469222XNWU5VY",
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
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading subscription..." />
      </div>
    )
  }

  const currentTier = user?.profile?.subscription_tier || "free"

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-white">Subscription</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Plans
            </span>
          </h1>
          <p className="text-white/70">Choose the plan that works best for you</p>
        </div>
      </ScrollReveal>

      {/* Current Plan */}
      {currentTier !== "free" && (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className="p-6 lg:p-8 mb-8 border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentTier === "ultimate" ? "Ultimate Plan" : "Pro Plan"}
                </h2>
                <p className="text-white/70">
                  {currentTier === "ultimate" ? "$12.99/month" : "$6.99/month"}
                </p>
              </div>
              <Badge
                className={
                  currentTier === "ultimate"
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                }
              >
                {currentTier === "ultimate" ? "Ultimate" : "Pro"}
              </Badge>
            </div>

            {user?.profile?.subscription_id && (
              <div className="space-y-2 text-sm text-white/60 mb-6">
                <p>Subscription ID: {user.profile.subscription_id}</p>
                <p>Status: {user.profile.subscription_status || "Active"}</p>
                <p>
                  Last Updated:{" "}
                  {new Date(user.profile.subscription_updated_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Available Plans */}
      {currentTier === "free" && (
        <ScrollReveal direction="up" delay={0.2}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pro Plan */}
              <AnimatedCard
                variant="3d"
                className={`cursor-pointer transition-all ${
                  selectedPlan === "pro" ? "border-blue-500/50 scale-105" : ""
                }`}
                onClick={() => handleSelectPlan("pro")}
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                    {selectedPlan === "pro" && (
                      <CheckCircle2 className="h-6 w-6 text-blue-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$6.99</span>
                    <span className="text-white/60">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-white/80">
                      <Zap className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Unlimited AI prompts
                    </li>
                    <li className="flex items-center text-white/80">
                      <Sparkles className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Priority support
                    </li>
                    <li className="flex items-center text-white/80">
                      <CreditCard className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Premium Gemini features
                    </li>
                    <li className="flex items-center text-white/80">
                      <Sparkles className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Flashcard & quiz generator
                    </li>
                  </ul>
                  {selectedPlan === "pro" ? (
                    <PayPalButton planId={planIds.pro} tier="pro" />
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectPlan("pro")
                      }}
                    >
                      Select Pro Plan
                    </Button>
                  )}
                </div>
              </AnimatedCard>

              {/* Ultimate Plan */}
              <AnimatedCard
                variant="3d"
                delay={0.1}
                className={`cursor-pointer transition-all ${
                  selectedPlan === "ultimate" ? "border-pink-500/50 scale-105" : ""
                }`}
                onClick={() => handleSelectPlan("ultimate")}
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">Ultimate Plan</h3>
                    {selectedPlan === "ultimate" && (
                      <CheckCircle2 className="h-6 w-6 text-pink-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$12.99</span>
                    <span className="text-white/60">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-white/80">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Everything in Pro
                    </li>
                    <li className="flex items-center text-white/80">
                      <Users className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Multi-project/class support
                    </li>
                    <li className="flex items-center text-white/80">
                      <Users className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Study groups (peer-to-peer)
                    </li>
                    <li className="flex items-center text-white/80">
                      <Mic className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                      Voice assistant for Gemini AI
                    </li>
                  </ul>
                  {selectedPlan === "ultimate" ? (
                    <PayPalButton planId={planIds.ultimate} tier="ultimate" />
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectPlan("ultimate")
                      }}
                    >
                      Select Ultimate Plan
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Upgrade Plan */}
      {currentTier === "pro" && (
        <ScrollReveal direction="up" delay={0.2}>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Upgrade Your Plan</h2>
            <AnimatedCard
              variant="3d"
              className={`cursor-pointer transition-all max-w-2xl ${
                selectedPlan === "ultimate" ? "border-pink-500/50 scale-105" : ""
              }`}
              onClick={() => handleSelectPlan("ultimate")}
            >
              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Ultimate Plan</h3>
                  {selectedPlan === "ultimate" && (
                    <CheckCircle2 className="h-6 w-6 text-pink-400" aria-hidden="true" />
                  )}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$12.99</span>
                  <span className="text-white/60">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-white/80">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-white/80">
                    <Users className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    Multi-project/class support
                  </li>
                  <li className="flex items-center text-white/80">
                    <Users className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    Study groups (peer-to-peer)
                  </li>
                  <li className="flex items-center text-white/80">
                    <Mic className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" aria-hidden="true" />
                    Voice assistant for Gemini AI
                  </li>
                </ul>
                {selectedPlan === "ultimate" ? (
                  <PayPalButton planId={planIds.ultimate} tier="ultimate" />
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectPlan("ultimate")
                    }}
                  >
                    Upgrade to Ultimate
                  </Button>
                )}
              </div>
            </AnimatedCard>
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}
