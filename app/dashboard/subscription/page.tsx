"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  CheckCircle2,
  CreditCard,
  Sparkles,
  Zap,
  Users,
  Mic,
  BookOpen,
  Calendar,
  Headphones,
  Code,
  ShoppingBag,
  ExternalLink,
  Crown,
  Star,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { GlassSurface } from "@/components/shared/GlassSurface"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { ScrollReveal } from "@/components/shared/ScrollReveal"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started with AI-powered learning",
    color: "from-gray-500 to-gray-600",
    borderColor: "border-gray-500/30",
    badgeColor: "bg-gray-500/20 text-gray-300",
    icon: BookOpen,
    features: [
      { icon: Zap, text: "5 AI requests/day" },
      { icon: BookOpen, text: "3 courses" },
      { icon: Sparkles, text: "Basic flashcards & quizzes" },
      { icon: CheckCircle2, text: "Notes & study resources" },
    ],
    limitations: [
      { icon: X, text: "No calendar sync" },
      { icon: X, text: "No video narration" },
      { icon: X, text: "No API access" },
    ],
  },
  {
    id: "student",
    name: "Student",
    price: 9,
    description: "Unlimited learning with AI power",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/30",
    badgeColor: "bg-blue-500/20 text-blue-300",
    icon: Star,
    popular: false,
    features: [
      { icon: Zap, text: "Unlimited AI requests" },
      { icon: BookOpen, text: "20 courses" },
      { icon: Calendar, text: "Calendar sync" },
      { icon: Headphones, text: "Podcast generation" },
      { icon: Sparkles, text: "Priority support" },
    ],
    limitations: [
      { icon: X, text: "No video narration" },
      { icon: X, text: "No API access" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    description: "Full power for creators & developers",
    color: "from-violet-500 to-purple-500",
    borderColor: "border-violet-500/30",
    badgeColor: "bg-violet-500/20 text-violet-300",
    icon: Crown,
    popular: true,
    features: [
      { icon: Zap, text: "Unlimited AI requests" },
      { icon: BookOpen, text: "Unlimited courses" },
      { icon: Calendar, text: "Calendar sync" },
      { icon: Mic, text: "AI video narration (ElevenLabs)" },
      { icon: Headphones, text: "Podcast generation" },
      { icon: Code, text: "API access (100 calls/day)" },
      { icon: ShoppingBag, text: "Marketplace selling" },
    ],
    limitations: [],
  },
  {
    id: "family",
    name: "Family",
    price: 29,
    description: "Pro features for the whole family",
    color: "from-pink-500 to-rose-500",
    borderColor: "border-pink-500/30",
    badgeColor: "bg-pink-500/20 text-pink-300",
    icon: Users,
    features: [
      { icon: CheckCircle2, text: "Everything in Pro" },
      { icon: Users, text: "Up to 5 child accounts" },
      { icon: Sparkles, text: "Progress reports & insights" },
      { icon: CreditCard, text: "Parental controls" },
      { icon: BookOpen, text: "Shared family library" },
    ],
    limitations: [],
  },
]

export default function SubscriptionPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (!supabase) return

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

  const handleCheckout = async (tier: string) => {
    if (tier === "free") return
    try {
      setCheckoutLoading(tier)
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      })
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true)
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      })
    } finally {
      setPortalLoading(false)
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
  const currentPlan = plans.find((p) => p.id === currentTier) || plans[0]

  return (
    <div className="p-6 md:p-8 lg:p-12">
      {/* Header */}
      <ScrollReveal direction="up">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-foreground">Subscription</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Plans
            </span>
          </h1>
          <p className="text-foreground/70">
            Choose the plan that powers your learning journey
          </p>
        </div>
      </ScrollReveal>

      {/* Current Plan Banner */}
      {currentTier !== "free" && (
        <ScrollReveal direction="up" delay={0.1}>
          <GlassSurface className={`p-6 lg:p-8 mb-8 ${currentPlan.borderColor}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentPlan.color} flex items-center justify-center`}>
                  <currentPlan.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentPlan.name} Plan
                  </h2>
                  <p className="text-foreground/70">
                    ${currentPlan.price}/month •{" "}
                    <span className="text-green-400">
                      {user?.profile?.subscription_status || "Active"}
                    </span>
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-foreground/20 hover:border-foreground/40"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            </div>
          </GlassSurface>
        </ScrollReveal>
      )}

      {/* Plan Cards */}
      <ScrollReveal direction="up" delay={0.2}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const isCurrentPlan = plan.id === currentTier
            const isDowngrade =
              plans.findIndex((p) => p.id === currentTier) >
              plans.findIndex((p) => p.id === plan.id)

            return (
              <AnimatedCard
                key={plan.id}
                variant="3d"
                delay={index * 0.05}
                className={`relative transition-all duration-300 ${isCurrentPlan
                  ? `${plan.borderColor} ring-2 ring-offset-0 ring-${plan.id === "pro" ? "violet" : plan.id === "student" ? "blue" : plan.id === "family" ? "pink" : "gray"}-500/30`
                  : "hover:scale-[1.02]"
                  }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center`}
                    >
                      <plan.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-500/40 text-green-400">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-foreground/60">/month</span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/60 mb-5">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2.5 text-sm text-foreground/80"
                      >
                        <feature.icon className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature.text}
                      </li>
                    ))}
                    {plan.limitations.map((limit, i) => (
                      <li
                        key={`limit-${i}`}
                        className="flex items-center gap-2.5 text-sm text-foreground/40"
                      >
                        <limit.icon className="h-4 w-4 text-foreground/30 flex-shrink-0" />
                        {limit.text}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full bg-foreground/10 text-foreground/50 cursor-default"
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button
                      variant="outline"
                      className="w-full border-foreground/20 text-foreground/60"
                      disabled
                    >
                      Free Forever
                    </Button>
                  ) : isDowngrade ? (
                    <Button
                      variant="outline"
                      className="w-full border-foreground/20 text-foreground/60"
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Manage Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-semibold`}
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading === plan.id}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {currentTier !== "free" ? "Upgrade" : "Subscribe"} — $
                      {plan.price}/mo
                    </Button>
                  )}
                </div>
              </AnimatedCard>
            )
          })}
        </div>
      </ScrollReveal>

      {/* FAQ / Info */}
      <ScrollReveal direction="up" delay={0.3}>
        <GlassSurface className="p-6 lg:p-8 mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Can I cancel anytime?
              </h3>
              <p className="text-foreground/60">
                Yes! Cancel anytime from the Manage Billing portal. You&apos;ll
                keep your plan until the end of the billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                What happens to my content?
              </h3>
              <p className="text-foreground/60">
                All your courses, flashcards, notes, and resources stay
                accessible. Some features may become limited on the free tier.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Can I switch plans?
              </h3>
              <p className="text-foreground/60">
                Upgrade or downgrade anytime. Upgrades take effect immediately
                with prorated billing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Is there a student discount?
              </h3>
              <p className="text-foreground/60">
                The Student plan at $9/mo is already our most affordable option.
                Contact us for institutional pricing.
              </p>
            </div>
          </div>
        </GlassSurface>
      </ScrollReveal>
    </div>
  )
}
