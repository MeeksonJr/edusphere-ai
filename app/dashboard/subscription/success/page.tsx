"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle } from "lucide-react"

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const updateSubscription = async () => {
      try {
        setLoading(true)

        const subscriptionId = searchParams.get("subscription_id")
        const userId = searchParams.get("user_id")
        const tier = searchParams.get("tier")

        if (!subscriptionId || !userId || !tier) {
          throw new Error("Missing required parameters")
        }

        // Update the user's subscription in the database
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_tier: tier,
            subscription_id: subscriptionId,
            subscription_status: "ACTIVE",
            subscription_updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) throw error

        toast({
          title: "Subscription Successful",
          description: `You have successfully subscribed to the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.`,
        })
      } catch (err: any) {
        console.error("Error updating subscription:", err)
        setError(err.message || "Failed to update subscription")
        toast({
          title: "Error",
          description: err.message || "Failed to update subscription",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    updateSubscription()
  }, [searchParams, supabase, toast, router])

  return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-[80vh]">
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Subscription Status</CardTitle>
          <CardDescription className="text-center">Processing your subscription</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-center">Processing your subscription...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-center text-red-500">{error}</p>
              <Button onClick={() => router.push("/dashboard/subscription")}>Return to Subscription Page</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center text-green-500">Your subscription has been processed successfully!</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
