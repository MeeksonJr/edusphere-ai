"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, PartyPopper, ArrowRight } from "lucide-react"
import { GlassSurface } from "@/components/shared/GlassSurface"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    const verifySession = async () => {
      try {
        setLoading(true)
        const sessionId = searchParams.get("session_id")

        if (!sessionId) {
          throw new Error("No session ID found")
        }

        // Call server-side API to verify session and update profile
        const res = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Failed to verify subscription")
        }

        setTier(data.tier)
        toast({
          title: "🎉 Welcome aboard!",
          description: `You're now on the ${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} plan.`,
        })
      } catch (err: any) {
        console.error("Error verifying session:", err)
        setError(err.message || "Failed to verify subscription")
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [searchParams, toast])

  return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-[80vh]">
      <GlassSurface className="w-full max-w-md p-8">
        {loading ? (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="relative">
              <Loader2 className="h-14 w-14 animate-spin text-cyan-400" />
              <div className="absolute inset-0 h-14 w-14 rounded-full bg-cyan-400/10 animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Processing Payment
              </h2>
              <p className="text-foreground/60 text-sm">
                Activating your subscription...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="h-7 w-7 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Something Went Wrong
              </h2>
              <p className="text-foreground/60 text-sm mb-4">{error}</p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/subscription")}
              variant="outline"
              className="border-foreground/20"
            >
              Return to Subscription
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5 py-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <PartyPopper className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  {tier
                    ? tier.charAt(0).toUpperCase() + tier.slice(1)
                    : "Premium"}
                </span>
                !
              </h2>
              <p className="text-foreground/60 text-sm">
                Your subscription is active. Enjoy all your new features!
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </GlassSurface>
    </div>
  )
}
